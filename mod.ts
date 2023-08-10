import { type HTMLNode, isHTMLTag } from "npm:html-tagged@0.0.8"
import {
  type CustomElement,
  renderToString,
} from "npm:html-tagged@0.0.8/server"
import {
  createTrie,
  type IndexRouteConfig as BaseIndexRouteConfig,
  matchTrie,
  type Node as RouteNode,
  type NonIndexRouteConfig as BaseNonIndexRouteConfig,
} from "npm:router-trie@0.0.10"

export * from "npm:html-tagged@0.0.8"
export type {
  CustomElement,
  CustomElementArgs,
} from "npm:html-tagged@0.0.8/server"

declare global {
  interface Window {
    __remix_build_time: number
  }
}

export type RouteProps<
  // deno-lint-ignore no-explicit-any
  TLoader extends Loader<any> = Loader<unknown>,
  // deno-lint-ignore no-explicit-any
  TAction extends Action<any> = Action<unknown>,
> = {
  actionData?: Awaited<ReturnType<TAction>>
  loaderData: Awaited<ReturnType<TLoader>>
}

export type RouteComponent<
  // deno-lint-ignore no-explicit-any
  TLoader extends Loader<any>,
  // deno-lint-ignore no-explicit-any
  TAction extends Action<any>,
> = (
  props: RouteProps<TLoader, TAction>,
) => HTMLNode

export type BoundaryProps<
  // deno-lint-ignore no-explicit-any
  TLoader extends Loader<any> = Loader<unknown>,
  // deno-lint-ignore no-explicit-any
  TAction extends Action<any> = Action<unknown>,
> = {
  actionData?: Awaited<ReturnType<TAction>>
  loaderData?: Awaited<ReturnType<TLoader>>
  error: unknown
}

export type BoundaryComponent<
  // deno-lint-ignore no-explicit-any
  TLoader extends Loader<any>,
  // deno-lint-ignore no-explicit-any
  TAction extends Action<any>,
> = (
  props: BoundaryProps<TLoader, TAction>,
) => HTMLNode

export type ActionArgs<Context> = {
  context: Context
  request: Request
  status(code: number): void
}

export type Action<Context> = (args: ActionArgs<Context>) => unknown

export type LoaderArgs<Context> = {
  context: Context
  request: Request
  status(code: number): void
}

export type Loader<Context> = (args: LoaderArgs<Context>) => unknown

export type RouteModule<
  Context = unknown,
  TLoader extends Loader<Context> = Loader<Context>,
  TAction extends Action<Context> = Action<Context>,
> = {
  action?: TAction
  loader?: TLoader
  default?: RouteComponent<TLoader, TAction>
  Boundary?: BoundaryComponent<TLoader, TAction>
}

export type BaseTaggedRouteConfig<Context> = {
  module?: RouteModule<Context>
}

export type IndexRouteConfig<Context> =
  & BaseIndexRouteConfig
  & BaseTaggedRouteConfig<Context>

export type NonIndexRouteConfig<Context> =
  & Omit<BaseNonIndexRouteConfig, "children">
  & BaseTaggedRouteConfig<Context>
  & {
    children?: RouteConfig<Context>[]
  }

export type RouteConfig<Context = unknown> =
  | IndexRouteConfig<Context>
  | NonIndexRouteConfig<Context>

export type GetAssetResponseFunction = (
  url: URL,
) => Response | undefined | Promise<Response | undefined>

export type RequestMiddleware<Context> = (
  args: {
    request: Request
    next: (context: Context) => Promise<Response>
  },
) => Promise<Response>

export type ServeOptions<Context> = {
  dev?: boolean
  elements?: Record<string, CustomElement<Record<string, string>>>
  getAssetResponse?: GetAssetResponseFunction
  middleware?: RequestMiddleware<Context>
  port?: number
}

export async function serve<Context = unknown>(
  routes: RouteConfig<Context>[],
  options?: ServeOptions<Context>,
) {
  window.__remix_build_time = Date.now()
  const dev = options?.dev
  const elements = options?.elements
  const port = options?.port ?? 3000
  const getAssetResponse = options?.getAssetResponse
  const middleware: RequestMiddleware<Context> = options?.middleware ??
    (({ next }) => {
      return next(undefined as Context)
    })

  const trie = createTrie(routes)

  const server = Deno.listen({ port })
  console.log(`Listening on http://localhost:${port}/`)
  for await (const conn of server) {
    serveHttp(conn, trie, elements, middleware, getAssetResponse, dev)
      .catch((e) => {
        console.error(e.type, e)
      })
  }
}

async function serveHttp<Context>(
  conn: Deno.Conn,
  trie: RouteNode<RouteConfig<Context>>,
  elements: Record<string, CustomElement<Record<string, string>>> | undefined,
  middleware: RequestMiddleware<Context>,
  getAssetResponse?: GetAssetResponseFunction,
  dev?: boolean,
) {
  const httpConn = Deno.serveHttp(conn)
  for await (const requestEvent of httpConn) {
    const { request } = requestEvent
    let sentResponse = false
    try {
      let response: Response | undefined
      const url = new URL(request.url)

      if (dev && url.pathname === "/__dev_reload") {
        response = await devSSEResponse()
      }
      if (!response) {
        response = await getAssetResponse?.(new URL(request.url))
      }
      if (!response) {
        response = await handleHttpRequest<Context>(
          request,
          trie,
          elements,
          middleware,
          dev,
        )
      }
      sentResponse = true
      await requestEvent.respondWith(response)
    } catch (error) {
      if (error?.message?.startsWith?.("connection closed")) {
        return
      }
      console.error(error)
      if (!sentResponse) {
        await requestEvent.respondWith(
          new Response("Internal server error", {
            status: 500,
          }),
        )
      }
    }
  }
}

async function callLoader<Context>(
  id: string,
  args: LoaderArgs<Context>,
  loader: (args: LoaderArgs<Context>) => unknown,
) {
  try {
    return { id, result: await loader(args) }
  } catch (reason) {
    return { id, reason }
  }
}

async function handleHttpRequest<Context>(
  request: Request,
  trie: RouteNode<RouteConfig<Context>>,
  elements: Record<string, CustomElement<Record<string, string>>> | undefined,
  middleware: RequestMiddleware<Context>,
  dev?: boolean,
) {
  let response: Response

  const url = new URL(request.url)

  const matches = matchTrie(trie, url.pathname)

  if (!matches) {
    return new Response("Not Found", { status: 404 })
  }

  const next = async (context: Context): Promise<Response> => {
    let statusCode = 200
    const status = (code: number) => {
      if (code > statusCode) {
        statusCode = code
      }
    }
    try {
      const actionData: Record<string, unknown> = {}
      if (request.method === "POST") {
        let action: Action<Context> | undefined
        let id: string | undefined
        for (let i = matches.length - 1; i >= 0; i--) {
          const match = matches[i]
          if (!match.module || !match.module.action) continue
          if (match.index && !url.searchParams.has("_index")) continue
          id = match.id
          action = match.module.action
          break
        }
        if (action && id) {
          actionData[id] = await action({ context, request, status })
        }
      }

      const promises = []
      for (const match of matches) {
        if (
          match.module &&
          "loader" in match.module &&
          typeof match.module.loader === "function"
        ) {
          const loaderPromise = callLoader(
            match.id,
            { context, request, status },
            match.module.loader,
          )
          promises.push(loaderPromise)
        }
      }

      await Promise.allSettled(promises)

      const loaderData: Record<string, unknown> = {}
      const loaderErrors: Record<string, unknown> = {}
      let hasErrors = false
      for (const promise of promises) {
        const loaderResult = await promise
        if ("reason" in loaderResult) {
          if (loaderResult.reason && loaderResult.reason instanceof Response) {
            throw loaderResult.reason
          }
          loaderErrors[loaderResult.id] = loaderResult.reason
          hasErrors = true
        } else {
          loaderData[loaderResult.id] = loaderResult.result
        }
      }

      let shallowestErrorRouteId: string | undefined
      let deepestBoundaryRouteId: string | undefined
      let deepestRouteToRender: number | undefined = matches.length - 1
      if (hasErrors) {
        for (let i = 0; i < matches.length; i++) {
          if (matches[i].module?.Boundary) {
            deepestRouteToRender = i
            deepestBoundaryRouteId = matches[i].id
          }
          if (matches[i].id in loaderErrors) {
            shallowestErrorRouteId = matches[i].id
            break
          }
        }

        if (!shallowestErrorRouteId || !deepestBoundaryRouteId) {
          throw new Error("No error boundary found.")
        }
      }

      /** @type {import("html-tagged").HTMLNode} */
      let lastNode = null
      for (let i = deepestRouteToRender; i >= 0; i--) {
        const match = matches[i]

        if (!match.module) continue
        let RouteComponent:
          | RouteComponent<Loader<Context>, Action<Context>>
          | BoundaryComponent<Loader<Context>, Action<Context>>
          | undefined = match.module.default

        // deno-lint-ignore no-explicit-any
        const props: any = {
          actionData: actionData[match.id],
          loaderData: loaderData[match.id],
        }

        if (deepestBoundaryRouteId === match.id) {
          RouteComponent = match.module.Boundary
          console.log(shallowestErrorRouteId, loaderErrors)
          props.error = loaderErrors[shallowestErrorRouteId!]
          if (!RouteComponent) {
            throw new Error("No error boundary found.")
          }
        }

        if (!RouteComponent) continue

        const htmlNode = RouteComponent(props)

        if (htmlNode[2] && lastNode?.[2]) {
          const slotIndex = htmlNode[2].findIndex(
            (n) => isHTMLTag(n) && n[2] === "slot",
          )
          if (slotIndex !== -1) {
            htmlNode[2].splice(slotIndex, 2, ...lastNode[2])
          }
        }
        lastNode = htmlNode
      }

      if (!lastNode) {
        throw new Error("One of the routes forgot to return a node.")
      }

      return new Response(renderToString(lastNode, { elements }), {
        status: statusCode,
        headers: {
          "Content-Type": "text/html;charset=utf-8",
        },
      })
    } catch (reason) {
      if (!(reason instanceof Response)) {
        throw reason
      }
      return reason
    }
  }

  response = await middleware({ request, next })

  // is redirect
  if (
    response.status >= 300 &&
    response.status < 400 &&
    response.headers.has("Location")
  ) {
    response.headers.set("HX-Redirect", response.headers.get("Location") ?? "")
  } else if (dev && response.body) {
    const encoder = new TextEncoder()
    const transform = new TransformStream({
      flush(controller) {
        controller.enqueue(encoder.encode(`
          <script>
            window.__remix_build_time = "${window.__remix_build_time.toString()}"
            if (!window.__dev_reload) {
              window.__dev_reload = new EventSource("/__dev_reload")
              window.addEventListener("beforeunload", (event) => {
                if (window.__dev_reload) {
                  window.__dev_reload.close()
                  window.__dev_reload = undefined
                }
              })
              window.__dev_reload.addEventListener("message", function listener(e) {
                if (e.data !== window.__remix_build_time) {
                  window.__dev_reload.removeEventListener("message", listener)
                  window.__dev_reload.close()
                  window.__dev_reload = undefined
                  if (window.htmx) {
                    window.htmx.ajax("GET", window.location.pathname + window.location.search)
                  } else {
                    location.reload()
                  }
                }
              });
            }
          </script>
        `))
      },
    })
    response.body.pipeThrough(transform)
    response = new Response(transform.readable, response)
  }

  return response
}

function devSSEResponse() {
  const encoder = new TextEncoder()
  let interval: number | undefined
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode(`data: ${window.__remix_build_time}\nretry: 100\n\n`),
      )
      interval = setInterval(() => {
        controller.enqueue(
          encoder.encode(`data: ${window.__remix_build_time}\n\n`),
        )
      }, 500)
    },
    cancel() {
      if (interval !== undefined) {
        clearInterval(interval)
      }
    },
  })

  return new Response(
    body,
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    },
  )
}

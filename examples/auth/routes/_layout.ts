import {
  type BoundaryProps,
  html,
  type LoaderArgs,
  type RouteProps,
  value,
} from "../../../mod.ts"

import { type Context } from "../main.ts"

const dev = Deno.args[0] === "dev"

export function loader(
  { context: { getAuthenticated }, request }: LoaderArgs<Context>,
) {
  const url = new URL(request.url)

  const redirectSearchParams = new URLSearchParams({
    redirect_to: url.pathname + url.search,
  }).toString()

  return {
    redirectSearchParams,
    authenticated: !!getAuthenticated(),
  }
}

function Header({ loaderData }: Partial<RouteProps<typeof loader>>) {
  return html`
    <form
      id="logout-form"
      method="post"
      action=${`/auth?intent=logout&${loaderData?.redirectSearchParams || ""}`}
      hx-replace-url="true"
    ></form>
    <div class="header" data-loading-class="header__loading">
      <header>
        <div>
          <h1>HTMX Tagged</h1>
        </div>
        <nav>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/dashboard">Dashboard</a>
            </li>
            ${
    loaderData?.authenticated && html`
            <li>
              <button type="submit" form="logout-form">
                Log out
              </button>
            </li>
          `
  }
          </ul>
        </nav>
      </header>
    </div>
  `
}

export default function Layout(
  props: RouteProps<typeof loader>,
) {
  return html`
    ${Header(props)}

    <slot></slot>
  `
}

export function Boundary(props: BoundaryProps<typeof loader>) {
  let message = "Unknown error"
  let stack = ""
  if (dev && props.error && props.error instanceof Error) {
    message = props.error.message
    stack = props.error.stack || ""
    console.log({ stack: props.error.stack })
  }

  return html`
    ${Header(props)}

    <main class="container content">
      <h2>Something went wrong 😥</h2>
      ${
    dev && html`
      <p>${value(message)}</p>
      <pre><code>${value(stack)}</code></pre>
    `
  }
    </main>
  `
}

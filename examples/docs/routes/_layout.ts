import * as path from "https://deno.land/std@0.197.0/path/mod.ts"

import {
  attr,
  type BoundaryProps,
  html,
  type LoaderArgs,
  type RouteProps,
  value,
} from "../../../mod.ts"

import { type Context } from "../main.ts"

const dev = Deno.args[0] === "dev"

export async function loader(
  { context: { docs } }: LoaderArgs<Context>,
) {
  const config = await loadConfig(docs)

  if (!config) {
    throw new Error("No config found")
  }

  return config
}

function Header({ loaderData }: Partial<RouteProps<typeof loader>>) {
  if (!loaderData) return null

  return html`
    <div class="header" data-loading-class="header__loading">
      <header>
        <div>
          <h1>${value(loaderData.title)}</h1>
        </div>
        <nav>
          <ul>
          ${
    loaderData.header.map(({ href, text }) =>
      html`
            <li>
              <a href=${attr(href)}>${value(text)}</a>
            </li>
          `
    )
  }
          </ul>
        </nav>
      </header>
    </div>
  `
}

function Navigation({ loaderData }: Partial<RouteProps<typeof loader>>) {
  if (!loaderData) return null

  return html`
    <aside class="container content">
      <nav>
        ${
    loaderData.navigation.map((group) =>
      html`
    ${group.label && html`<p>${value(group.label)}</p>`}
    <ul>
      ${
        group.items.map((item) => {
          if ("doc" in item) {
            return html`
      <li>
        <a href=${attr("/" + item.doc)}>${value(item.text)}</a>
      </li>
    `
          }

          return html`
      <li>
        <a
          href=${attr(item.href)}
          target="_blank"
          rel="noreferrer nofollow"
        >
          ${value(item.text)}
        </a>
      </li>
    `
        })
      }
    </ul>
  `
    )
  }
      </nav>
    </aside>
  `
}

export default function Layout(
  props: RouteProps<typeof loader>,
) {
  return html`
    ${Header(props)}

    <div class="layout">
      <slot></slot>
      
      ${Navigation(props)}
    </div>
  `
}

export function Boundary(props: BoundaryProps<typeof loader>) {
  console.error(props.error)

  let message = "Unknown error"
  let stack = ""
  if (dev && props.error && props.error instanceof Error) {
    message = props.error.message
    stack = props.error.stack || ""
  }

  return html`
    ${Header(props)}

    <div class="layout">
      <main class="container content">
        <h2>Something went wrong 😥</h2>
        ${
    dev && html`
        <p>${value(message)}</p>
        <pre><code>${value(stack)}</code></pre>
      `
  }
      </main>

      ${Navigation(props)}
  </div>
  `
}

async function loadConfig(docs: string): Promise<
  null | {
    title: string
    description: string
    header: {
      href: string
      text: string
    }[]
    navigation: {
      "label"?: string
      items: ({
        doc: string
        text: string
      } | {
        href: string
        text: string
      })[]
    }[]
  }
> {
  try {
    const json = await Deno.readTextFile(path.join(docs, "config.json"))
    return JSON.parse(json)
  } catch {
    return null
  }
}

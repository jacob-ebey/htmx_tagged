import { attr, html, type RouteProps } from "../../../mod.ts"
import { script, stylesheet } from "../../../assets.ts"

export async function loader() {
  const [entrySrc, stylesHref] = await Promise.all([
    script("/entry.ts").then((res) => res.href),
    stylesheet("/styles.css").then((res) => res.href),
  ])

  return {
    entrySrc,
    stylesHref,
  }
}

export default function Document(
  { loaderData }: RouteProps<typeof loader>,
) {
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>HTMX Tagged</title>

        <meta name="htmx-config" content='{"globalViewTransitions":true}' />

        <link rel="stylesheet" href=${attr(loaderData.stylesHref)} />
        <script async type="module" src=${attr(loaderData.entrySrc)}></script>
      </head>
      <body
        hx-boost="true"
        hx-sync="this:replace"
        hx-ext="loading-states"
      >
        <slot></slot>
      </body>
    </html>
  `
}

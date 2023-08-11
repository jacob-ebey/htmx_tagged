import { attr, html, type LoaderArgs, type RouteProps } from "htmx_tagged";
import { script, stylesheet } from "htmx_tagged/assets";

import type { Context } from "../main.ts";

export async function loader({}: LoaderArgs<Context>) {
  const [entrySrc, stylesHref] = await Promise.all([
    script("/js/entry.ts").then((res) => res.href),
    stylesheet("/styles/beer.css").then((res) => res.href),
  ]);

  return {
    entrySrc,
    stylesHref,
  };
}

export default function Document({ loaderData }: RouteProps<typeof loader>) {
  return html`
    <!DOCTYPE html>
    <html
      lang="en"
      hx-boost="true"
      hx-sync="this:replace"
      hx-ext="loading-states"
    >
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>My App</title>

        <meta name="htmx-config" content='{"globalViewTransitions":true}' />

        <link rel="stylesheet" href=${attr(loaderData.stylesHref)} />
        <script defer src=${attr(loaderData.entrySrc)}></script>
      </head>
      <body>
        <slot></slot>
      </body>
    </html>
  `;
}

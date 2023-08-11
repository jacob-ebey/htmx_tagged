---
title: Quick Start
description: Quickly get started with a new htmx-tagged project.
---

## Quick Start

### Create a `main.ts` module

This is our entry point for the server. It contains route definitions and starts
the HTTP server.

```typescript
import {
  type RouteConfig,
  serve,
} from "https://deno.land/x/htmx_tagged/mod.ts";
import { getAssetResponse } from "https://deno.land/x/htmx_tagged/assets.ts";

import * as documentLayout from "./routes/_document.ts";
import * as globalLayout from "./routes/_layout.ts";
import * as notFoundPage from "./routes/_404.ts";
import * as homePage from "./routes/home.ts";

const dev = Deno.args[0] === "dev";

export interface Context {}

const routes: RouteConfig<Context>[] = [
  {
    id: "root",
    module: documentLayout,
    children: [
      {
        id: "layout",
        module: globalLayout,
        children: [
          {
            id: "home",
            index: true,
            module: homePage,
          },
          {
            id: "404",
            path: "*",
            module: notFoundPage,
          },
        ],
      },
    ],
  },
];

await serve(routes, {
  dev,
  getAssetResponse,
  middleware({ next }) {
    const context: Context = {};
    return next(context);
  },
});
```

### Create a `routes/_document.ts` module

This is our root layout module. It should contain the HTML document and do very
little else. If it errors, the user will not get anything of value delivered.

```typescript
import {
  attr,
  html,
  type LoaderArgs,
  type RouteProps,
} from "https://deno.land/x/htmx_tagged/mod.ts";
import { script, stylesheet } from "https://deno.land/x/htmx_tagged/assets.ts";

import type { Context } from "../main.ts";

export async function loader({}: LoaderArgs<Context>) {
  const [entrySrc, stylesHref] = await Promise.all([
    script("/entry.ts").then((res) => res.href),
    stylesheet("/styles.css").then((res) => res.href),
  ]);

  return {
    entrySrc,
    stylesHref,
  };
}

export default function Document(
  { loaderData }: RouteProps<typeof loader>,
) {
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
```

The document layout is loading a script and stylesheet, let's create those in
the `public` directory.

### Create a `public/entry.ts` module

This is our entry point for the client. It loads HTMX and Alpine.js to provide
an SPA like experience in combination with the `hx-boost`, and `hx-sync`
attributes on the `<body>`.

```typescript
import * as htmx from "npm:htmx.org@1.9.4";
import Alpine from "npm:alpinejs@3.12.3";

declare global {
  interface Window {
    htmx: typeof htmx;
    Alpine: typeof Alpine;
  }
}

if (!window.htmx) {
  // deno-lint-ignore no-explicit-any
  htmx.on("htmx:beforeSwap", (event: any) => {
    if (event.detail.xhr.status !== 500) {
      event.detail.shouldSwap = true;
    }
  });

  window.htmx = htmx;
  import("npm:htmx.org@1.9.4/dist/ext/loading-states.js");
}

if (!window.Alpine) {
  window.Alpine = Alpine;
  Alpine.start();
}
```

### Create a `public/styles.css` stylesheet

This is our global stylesheet. It will be loaded by the document layout.

```css
body {
  font-family: sans-serif;
}
```

### Create a `routes/_layout.ts` module

This is our global layout module. It should contain the header, footer, and
export a Boundary to catch errors.

```typescript
import {
  type BoundaryProps,
  html,
  value,
} from "https://deno.land/x/htmx_tagged/mod.ts";

const dev = Deno.args[0] === "dev";

function Header() {
  return html`
    <header>
      <h1>My App</h1>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/not-found">Not Found</a></li>
      </ul>
    </header>
  `;
}

export default function Layout() {
  return html`
    ${Header()}

    <slot></slot>
  `;
}

export function Boundary(props: BoundaryProps) {
  console.error(props.error);

  let message = "Unknown error";
  let stack = "";
  if (dev && props.error && props.error instanceof Error) {
    message = props.error.message;
    stack = props.error.stack || "";
  }

  return html`
    ${Header()}

    <main>
      <h2>Something went wrong</h2>
      ${
    dev && html`
      <p>${value(message)}</p>
      <pre><code>${value(stack)}</code></pre>
    `
  }
    </main>
  `;
}
```

Now let's create our home page.

### Create a `routes/home.ts` module

```typescript
import { html } from "https://deno.land/x/htmx_tagged/mod.ts";

export default function Home() {
  return html`
    <main>
      <h2>Home</h2>
      <p>This is the home page.</p>
    </main>
  `;
}
```

And finally our 404 page.

### Create a `routes/_404.ts` module

```typescript
import { html, type LoaderArgs } from "https://deno.land/x/htmx_tagged/mod.ts";

import type { Context } from "../main.ts";

export function loader({ status }: LoaderArgs<Context>) {
  status(404);
}

export default function NotFound() {
  return html`
    <main>
      <h2>Not Found</h2>
      <p>This page could not be found.</p>
    </main>
  `;
}
```

### Running the app

We should be good to go. Let's run our app and get started building something
awesome:

```bash
deno run --watch -A main.ts dev
```

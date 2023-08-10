---
title: Data Loading
description: How to load data into your routes.
---

## Data Loading

Each route module can export a `loader` function that will be called when the
route is rendered. This function can return a `Promise` or a value. If it
returns a `Promise`, the route will not be rendered until the `Promise`
resolves.

```typescript
import {
  html,
  type LoaderArgs,
  type RouteProps,
  value,
} from "https://deno.land/x/htmx_tagged/mod.ts"

export function loader({ request }: LoaderArgs<unknown>) {
  const url = new URL(request.url)
  const name = url.searchParams.get("name") || "World"

  return {
    message: `Hello, ${name}!`,
  }
}

export default function Route({ loaderData }: RouteProps<typeof loader>) {
  return html`<h1>${value(loaderData.message)}</h1>`
}
```

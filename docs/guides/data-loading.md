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
} from "https://deno.land/x/htmx_tagged/mod.ts";

import type { Context } from "../main.ts";

export function loader({ request }: LoaderArgs<Context>) {
  const url = new URL(request.url);
  const name = url.searchParams.get("name") || "World";

  return {
    message: `Hello, ${name}!`,
  };
}

export default function Route({ loaderData }: RouteProps<typeof loader>) {
  return html`<h1>${value(loaderData.message)}</h1>`;
}
```

### Loading states

Loading states such as disabling a fieldset can be achieved with the
[htmx-loading-states plugin](https://htmx.org/extensions/loading-states/). A
common patter is to have a global loading bar below your header that might look
something like this:

```typescript
export default function Layout() {
  return html`
    <div class="header" data-loading-class="header__loading">
      ...
    </div>
  `;
}
```

Then, in your CSS, you can style the loading bar:

```css
.header__loading::after {
  content: "";
  position: absolute;
  border-radius: 10px;
  height: 1px;
  right: 100%;
  bottom: 0;
  left: 0;
  background: var(--color-foreground);
  width: 0;
  animation: borealisBar 2s linear infinite;
}

@keyframes borealisBar {
  0% {
    left: 0%;
    right: 100%;
    width: 0%;
  }
  10% {
    left: 0%;
    right: 75%;
    width: 25%;
  }
  90% {
    right: 0%;
    left: 75%;
    width: 25%;
  }
  100% {
    left: 100%;
    right: 0%;
    width: 0%;
  }
}
```

---
title: Data Mutation
description: How to mutate data in your routes.
---

## Data Mutation

We don't need no stinkin' complex state management or mind-boggling virtual
DOMs. With all the swagger of a catwalk model, htmx-tagged struts in using
nothing more than a humble `<form>` and the OG HTTP protocol to make your web apps
feel as fresh as a minty mojito.

This simple example will read the name from the form input and return a message
to display.

```typescript
import {
  type ActionArgs,
  html,
  type RouteProps,
  value,
} from "https://deno.land/x/htmx_tagged/mod.ts"

export async function action({ request, status }: ActionArgs<unknown>) {
  const formData = await request.formData()
  const name = formData.get("name")

  if (!name) {
    status(400)
    return "Please enter a name."
  }

  return {
    message: `Hello, ${name}!`,
  }
}

export default function Route(
  { actionData }: RouteProps<unknown, typeof action>,
) {
  return html`
    <form method="POST" action="/my-route">
      <input type="text" name="name" />
      <button type="submit">Submit</button>
      ${actionData?.message && html`<p>${value(actionData.message)}</p>`}
    </form>
  `
}
```

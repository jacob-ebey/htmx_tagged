---
title: Status Codes
description: How to set status codes for your routes.
---

## Status Codes

Each `loader` and `action` function can call the `status` function to set the
status code for the response. The highest status code set will be used.

```typescript
import { type LoaderArgs } from "https://deno.land/x/htmx_tagged/mod.ts";

export function loader({ status }: LoaderArgs<unknown>) {
  status(404);
}
```

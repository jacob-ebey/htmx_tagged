---
title: Server API
description: APIs for working with the server.
---

## Server API

### `serve()`

Start an HTTP server.

```typescript
import { serve } from "https://deno.land/x/htmx_tagged/mod.ts"
import { getAssetResponse } from "https://deno.land/x/htmx_tagged/assets.ts"

await serve(routes, {
  dev: true,
  elements: {},
  getAssetResponse,
  middleware({ next }) {
    const context = {}
    return next(context)
  },
  port: 3000,
})
```

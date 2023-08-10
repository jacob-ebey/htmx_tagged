---
title: Assets API
description: APIs for working with assets.
---

## Assets API

### `getAssetResponse()`

Get a response for an asset request.

```typescript
import { getAssetResponse } from "https://deno.land/x/htmx_tagged/assets.ts"

const response = await getAssetResponse(new URL(request.url))
```

### `stylesheet()`

Get the minified contents and an href for a stylesheet located in the `public`
directory.

```typescript
import { stylesheet } from "https://deno.land/x/htmx_tagged/assets.ts"

const { contents, href } = await stylesheet("/styles.css")
```

### `script()`

Get the bundled and minified contents and an href for a script located in the
`public` directory.

```typescript
import { script } from "https://deno.land/x/htmx_tagged/assets.ts"

const { contents, href } = await script("/entry.ts")
```

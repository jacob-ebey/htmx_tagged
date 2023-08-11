---
title: HTML Tagged API
description: APIs for working with HTML.
---

## HTML Tagged API

### `html`

Create an HTML template literal.

```typescript
import { html } from "https://deno.land/x/htmx_tagged/html.ts";

return html`<h1>Hello, World!</h1>`;
```

### `attr()`

Create and escape an HTML attribute.

```typescript
import { attr, html } from "https://deno.land/x/htmx_tagged/html.ts";

return html`<h1 class=${attr("title")}>Hello, World!</h1>`;
```

### `value()`

Create and escape an HTML value.

```typescript
import { html, value } from "https://deno.land/x/htmx_tagged/html.ts";

return html`<h1>${value("Hello, World!")}</h1>`;
```

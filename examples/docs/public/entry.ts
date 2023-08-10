import * as htmx from "npm:htmx.org@1.9.4"
import Alpine from "npm:alpinejs@3.12.3"

declare global {
  interface Window {
    htmx: typeof htmx
    Alpine: typeof Alpine
  }
}

if (!window.htmx) {
  // deno-lint-ignore no-explicit-any
  htmx.on("htmx:beforeSwap", (event: any) => {
    if (event.detail.xhr.status !== 500) {
      event.detail.shouldSwap = true
    }
  })

  window.htmx = htmx
  import("npm:htmx.org@1.9.4/dist/ext/loading-states.js")
}

if (!window.Alpine) {
  window.Alpine = Alpine
  Alpine.start()
}

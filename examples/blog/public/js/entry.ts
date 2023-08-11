import * as htmx from "npm:htmx.org@1.9.4";
import Alpine from "https://esm.sh/alpinejs@3.12.3";
import AlpineFocus from "https://esm.sh/@alpinejs/focus@3.12.3";

import beer from "./beer.ts";

declare global {
  interface Window {
    htmx: typeof htmx;
    Alpine: typeof Alpine;
    beer: typeof beer;
  }
}

if (!window.htmx) {
  // deno-lint-ignore no-explicit-any
  htmx.on("htmx:beforeSwap", (event: any) => {
    console.log(event.detail.xhr);
    if (event.detail.xhr.status !== 500) {
      event.detail.shouldSwap = true;
    }
  });

  window.htmx = htmx;
  import("npm:htmx.org@1.9.4/dist/ext/loading-states.js");
}

if (!window.Alpine) {
  Alpine.plugin(AlpineFocus);
  window.Alpine = Alpine;
  Alpine.start();
}

if (!window.beer) {
  window.beer = beer;
}

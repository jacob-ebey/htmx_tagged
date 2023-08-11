import { attr, html, type LoaderArgs, type RouteProps } from "htmx_tagged";

import type { Context } from "../main.ts";

export function loader({ request }: LoaderArgs<Context>) {
  const url = new URL(request.url);

  return {
    modalState: {
      open: url.searchParams.has("open"),
    },
  };
}

export default function Modal({ loaderData }: RouteProps<typeof loader>) {
  return html`
    <main x-data=${attr(JSON.stringify(loaderData.modalState))}>
      <h2>Modal</h2>

      <a hx-boost="false" href="/modal?open" x-on:click="$event.preventDefault(); open = true">Open Modal</a>
      
      <dialog
        class="left"
        ${loaderData.modalState.open ? "open" : ""}
        x-bind:open="open"
        x-on:close="open = false"
        x-trap="open"
      >
        <h5>Left</h5>
        <div>Some text here</div>
        <a href="/" class="chip">Home</a>
        <form method="dialog" class="right-align" hx-boost="false">
          <button class="border">Cancel</button>
          <button>Confirm</button>
        </form>
      </dialog>
    </main>
  `;
}

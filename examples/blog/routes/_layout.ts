import { type BoundaryProps, html, value } from "htmx_tagged";

const dev = Deno.args[0] === "dev";

function Header() {
  return html`
    <div x-data="{ open: false }">
      <header class="responsive">
        <nav>
          <button class="border circle" x-on:click="open = !open"><i>menu</i></button>
          <a href="/" class="chip">Home</a>
          <div class="max"></div>
          <span class="loader small" data-loading></span>
        </nav>
      </header>

      <dialog class="left" x-bind:open="open" x-on:close="open = false" x-trap="open">
        <h5>Left</h5>
        <div>Some text here</div>
        <a href="/" class="chip">Home</a>
        <form method="dialog" class="right-align" hx-boost="false">
          <button class="border">Cancel</button>
          <button>Confirm</button>
        </form>
      </dialog>
  </div>
  `;
}

export default function Layout() {
  return html`
    ${Header()}

    <slot></slot>
  `;
}

export function Boundary(props: BoundaryProps) {
  console.error(props.error);

  let message = "Unknown error";
  let stack = "";
  if (dev && props.error && props.error instanceof Error) {
    message = props.error.message;
    stack = props.error.stack || "";
  }

  return html`
    ${Header()}

    <main>
      <h2>Something went wrong</h2>
      ${
    dev &&
    html`
        <p>${value(message)}</p>
        <pre><code>${value(stack)}</code></pre>
      `
  }
    </main>
  `;
}

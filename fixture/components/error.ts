import { html, value } from "htmx_tagged";

const dev = Deno.args[0] === "dev";

export function DevError({ error }: { error: unknown }) {
  if (!dev) return null;

  let message = "Unknown error";
  let stack = "";
  if (dev && error && error instanceof Error) {
    message = error.message;
    stack = error.stack || "";
  }

  return html`
    <p id="error-message">${value(message)}</p>
    <pre><code id="error-stack">${value(stack)}</code></pre>
  `;
}

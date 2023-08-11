import { html, type LoaderArgs } from "htmx_tagged";

import type { Context } from "../main.ts";

export function loader({ status }: LoaderArgs<Context>) {
  status(404);
}

export default function NotFound() {
  return html`
    <main>
      <h2>404</h2>
      <p>This page could not be found.</p>
    </main>
  `;
}

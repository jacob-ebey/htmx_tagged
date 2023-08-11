import { type BoundaryProps, html } from "htmx_tagged";

import { DevError } from "../components/error.ts";

export function Boundary({ error }: BoundaryProps) {
  return html`
    <div id="throw._layout-boundary">
      <h2>Layout Boundary</h2>
      ${DevError({ error })}
    </div>
  `;
}

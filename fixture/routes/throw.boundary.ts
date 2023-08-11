import { type BoundaryProps, html, type LoaderArgs } from "htmx_tagged";

import type { Context } from "../main.ts";
import { DevError } from "../components/error.ts";

export function loader({ request }: LoaderArgs<Context>) {
  const url = new URL(request.url);

  if (url.searchParams.has("error")) {
    throw new Error("Thrown Error");
  }
}

export default function ThrowBoundary() {
  return html`
    <ul>
      <li>
        <a href="/throw/boundary?error">Throw in loader to throw.boundary boundary</a>
      </li>
    </ul>
  `;
}

export function Boundary({ error }: BoundaryProps) {
  return html`
    <div id="throw.boundary-boundary">
      <h2>Self Boundary</h2>
      ${DevError({ error })}
    </div>
  `;
}

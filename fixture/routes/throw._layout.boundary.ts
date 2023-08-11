import {
  type ActionArgs,
  type BoundaryProps,
  html,
  type LoaderArgs,
} from "htmx_tagged";

import type { Context } from "../main.ts";
import { DevError } from "../components/error.ts";

export function loader({ request }: LoaderArgs<Context>) {
  const url = new URL(request.url);

  if (url.searchParams.has("error")) {
    throw new Error("Thrown Error");
  }
}

export async function action({ request }: ActionArgs<Context>) {
  const formData = await request.formData();

  if (formData.has("error")) {
    throw new Error("Action Error");
  }
}

export default function ThrowLayoutBoundary() {
  return html`
    <form method="post" action="/throw/layout/boundary">
      <ul>
        <li>
          <a href="/throw/layout/boundary?error">Throw in loader to throw._layout.boundary boundary</a>
        </li>
        <li>
          <button name="error" type="submit">Throw in action to throw._layout.boundary boundary</button>
        </li>
      </ul>
    </form>
  `;
}

export function Boundary({ error }: BoundaryProps) {
  return html`
    <div id="throw._layout.boundary-boundary">
      <h2>Self Boundary</h2>
      ${DevError({ error })}
    </div>
  `;
}

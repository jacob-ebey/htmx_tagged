import { type ActionArgs, html, type LoaderArgs } from "htmx_tagged";

import type { Context } from "../main.ts";

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

export default function ThrowLayoutNoBoundary() {
  return html`
    <form method="post" action="/throw/layout?index">
      <ul>
        <li>
          <a href="/throw/layout?error">Throw in loader to throw._layout boundary</a>
        </li>
        <li>
          <button name="error" type="submit">Throw in action to throw._layout boundary</button>
        </li>
      </ul>
    </form>
  `;
}

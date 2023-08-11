import { type ActionArgs, html, type LoaderArgs } from "htmx_tagged";

import type { Context } from "../main.ts";

export function loader({ request }: LoaderArgs<Context>) {
  const url = new URL(request.url);

  if (url.searchParams.has("error")) {
    throw new Error("Thrown Error");
  }

  if (url.searchParams.has("redirect")) {
    throw new Response(null, {
      status: 302,
      headers: { location: "/throw?redirected" },
    });
  }
}

export async function action({ request }: ActionArgs<Context>) {
  const formData = await request.formData();

  if (formData.has("error")) {
    throw new Error("Action Error");
  }

  if (formData.has("redirect")) {
    throw new Response(null, {
      status: 302,
      headers: { location: "/throw?redirected" },
    });
  }
}

export default function ThrowNoBoundary() {
  return html`
    <form method="post" action="/throw?index">
      <ul>
        <li>
          <a href="/throw?error">Throw in loader to _layout boundary</a>
        </li>
        <li>
          <a href="/throw?redirect">Throw redirect in loader</a>
        </li>
        <li>
          <button name="error" type="submit">Throw in action to _layout boundary</button>
        </li>
        <li>
          <button name="redirect" type="submit">Throw redirect in action</button>
        </li>
      </ul>
    </form>
  `;
}

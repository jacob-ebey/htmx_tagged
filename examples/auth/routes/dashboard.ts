import { html, type LoaderArgs, type RouteProps } from "../../../mod.ts"

import type { Context } from "../main.ts"

export function loader(
  { context: { ensureAuthenticated } }: LoaderArgs<Context>,
) {
  ensureAuthenticated()
}

export default function Dashboard({}: RouteProps<typeof loader>) {
  return html`
    <main class="container content">
      <h2>Dashboard</h2>
    </main>
  `
}

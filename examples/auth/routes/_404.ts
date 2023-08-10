import { html, type LoaderArgs } from "../../../mod.ts"

export function loader({ status }: LoaderArgs<unknown>) {
  status(404)
}

export default function _404() {
  return html`
    <main class="container content">
      <h1>404</h1>
      <p>Page not found.</p>
    </main>
  `
}

import { type BoundaryProps, html } from "htmx_tagged";

import { DevError } from "../components/error.ts";

function Header() {
  return html`
    <header>
      <nav>
        <a href="/">Home</a>
        <a href="/throw">Throw</a>
        <a href="/infinite-scroll">Infinite Scroll</a>
        <a href="/modal">Modal</a>
      </nav>

      <h1>HTMX Tagged Fixture</h1>
    </header>
  `;
}

export default function Layout() {
  return html`
    ${Header()}

    <slot></slot>
  `;
}

export function Boundary({ error }: BoundaryProps) {
  return html`
    ${Header()}

    <main id="_layout-boundary">
      <h2>Something went wrong</h2>
      ${DevError({ error })}
    </main>
  `;
}

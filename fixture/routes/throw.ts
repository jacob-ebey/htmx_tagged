import { html } from "htmx_tagged";

export default function Throw() {
  return html`
    <main>
      <h2>Throw</h2>
      <p>Throw a variety of things to ensure they are handled properly.</p>
      <header>
        <nav>
          <a href="/throw">No Boundary</a>
          <a href="/throw/boundary">Boundary</a>
          <a href="/throw/layout">Layout No Boundary</a>
          <a href="/throw/layout/boundary">Layout Boundary</a>
        </nav>
      </header>
      <slot></slot>
    </main>
  `;
}

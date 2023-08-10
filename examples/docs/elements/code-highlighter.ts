import { type CustomElementArgs } from "../../../mod.ts"

import { attr, html } from "../../../mod.ts"
import { script } from "../../../assets.ts"

const codeHighlighterSrc = (await script("/code-highlighter.ts")).href

export default function CodeHighlighter({ attrs }: CustomElementArgs) {
  return html`
    <link
      rel="stylesheet"
      href="https://unpkg.com/@speed-highlight/core@1.2.4/dist/themes/github-dark.css"
    />

    <div data-code class=${attr(attrs.lang)}><slot></slot></div>

    <script async type="module" src=${attr(codeHighlighterSrc)} />
  `
}

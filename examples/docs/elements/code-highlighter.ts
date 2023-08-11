import { attr, type CustomElementArgs, html } from "htmx_tagged";
import { script } from "htmx_tagged/assets";

const codeHighlighterSrc = (await script("/code-highlighter.ts")).href;

export default function CodeHighlighter({ attrs }: CustomElementArgs) {
  return html`
    <pre><div data-code class=${attr(attrs.lang)}><slot></slot></div></pre>

    <script async type="module" src=${attr(codeHighlighterSrc)} />
  `;
}

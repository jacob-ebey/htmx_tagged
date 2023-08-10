/// <reference lib="dom" />

import * as Prism from "/speed-highlighter/mod.js?external"

declare global {
  interface Window {
    __codeHighlighterDefined?: boolean
  }
}

if (!window.__codeHighlighterDefined) {
  window.__codeHighlighterDefined = true
  customElements.define(
    "code-highlighter",
    class extends HTMLElement {
      private observer: MutationObserver

      constructor() {
        super()
        this.observer = new MutationObserver(() => {
          this.observer.disconnect()

          const code = this.querySelector("[data-code]")!
          if (!code.hasAttribute("data-lang")) {
            Prism.highlightElement(
              code,
              undefined,
              "multiline",
              {
                hideLineNumbers: true,
              },
            )
          }

          this.observer.observe(this, {
            attributes: true,
            childList: true,
            subtree: true,
          })
        })
      }

      connectedCallback() {
        const code = this.querySelector("[data-code]")!
        if (!code.hasAttribute("data-lang")) {
          Prism.highlightElement(
            code,
            undefined,
            "multiline",
            {
              hideLineNumbers: true,
            },
          )
        }

        this.observer.observe(this, {
          attributes: true,
          childList: true,
          subtree: true,
        })
      }

      disconnectedCallback() {
        this.observer.disconnect()
      }
    },
  )
}

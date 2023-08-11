import * as path from "https://deno.land/std@0.197.0/path/mod.ts";
import * as frontmatter from "https://deno.land/x/frontmatter@v0.1.5/mod.ts";
import { marky } from "https://deno.land/x/marky@v1.1.6/mod.ts";

import { html, type LoaderArgs, type RouteProps } from "htmx_tagged";

import type { Context } from "../main.ts";

export async function loader(
  { context: { docs }, request, status }: LoaderArgs<Context>,
) {
  const url = new URL(request.url);
  const doc = await loadDoc(docs, url.pathname);

  if (!doc) status(404);

  return doc;
}

export default function CatchAll({ loaderData }: RouteProps<typeof loader>) {
  return html`
    <main class="container content">
      <article>
        ${!loaderData ? html`<h2>404</h2>` : loaderData.html}
      </article>
    </main>
  `;
}

async function loadDoc(docs: string, pathname: string) {
  try {
    const doc = (pathname.slice(1) || "home") + ".md";
    const markdown = await Deno.readTextFile(path.join(docs, doc));
    const { content, data } = frontmatter.parse(markdown);
    let html = marky(content);
    html = html.replace(/\<code\>(.*?)\<\/code\>/gs, (_, code) =>
      `<code>${
        code
          .replace(/\<br\>/g, "\n")
      }</code>`);

    html = html.replace(/\<\/code\>\s*\<\/pre\>/g, "</code-highlighter>");
    const starts = html.matchAll(/<pre\s+class="([\w_-]+)"\>\s*\<code\>/g);
    for (const start of Array.from(starts).reverse()) {
      let lang = start[1];
      if (lang === "language-typescript") {
        lang = "language-js";
      }
      lang = lang.replace(/^language-/, "shj-lang-");
      html = html.slice(0, start.index) +
        `<code-highlighter lang="${lang}">` +
        html.slice(start.index! + start[0].length);
    }

    return { data, html };
  } catch {
    return null;
  }
}

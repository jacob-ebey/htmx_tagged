import { html, type LoaderArgs, type RouteProps, value } from "htmx_tagged";

import type { Context } from "../main.ts";

export function loader({ request }: LoaderArgs<Context>) {
  const url = new URL(request.url);
  let page = Number.parseInt(url.searchParams.get("page") || "1");
  if (!Number.isSafeInteger(page) || page < 1) {
    page = 1;
  }
  const next = page + 1;
  page = page - 1;

  return {
    infiniteScrollPartial: {
      items: Array(10).fill(null).map((_, i) => ({
        id: page * 10 + i + 1,
        label: `Item ${page * 10 + i + 1}`,
      })),
      next,
    },
  };
}

export default function InfiniteScrollPartial(
  { loaderData }: RouteProps<typeof loader>,
) {
  return html`${
    loaderData.infiniteScrollPartial.items.map((item, i) =>
      html`
      <tr ${
        loaderData.infiniteScrollPartial.items.length === i + 1
          ? `
        hx-get="/infinite-scroll/partial?page=${loaderData.infiniteScrollPartial.next}"
        hx-trigger="intersect once delay:500ms"
        hx-swap="afterend"
      `
          : ""
      }>
        <td>${value(item.label)}</td>
        <td>${value(item.id)}</td>
      </tr>
    `
    )
  }`;
}

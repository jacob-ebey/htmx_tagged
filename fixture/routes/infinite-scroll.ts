import { html, type LoaderArgs, type RouteProps } from "htmx_tagged";

import { type Context } from "../main.ts";
import InfiniteScrollPartial, {
  loader as infiniteScrollPartialLoader,
} from "./infinite-scroll.partial.ts";

export function loader(args: LoaderArgs<Context>) {
  return {
    ...infiniteScrollPartialLoader(args),
  };
}

export default function InfiniteScroll(props: RouteProps<typeof loader>) {
  return html`
    <main>
      <h2>Infinite Scroll</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>ID</th>
          </tr>
        </thead>
        <tbody hx-indicator=".htmx-indicator">
          ${InfiniteScrollPartial(props)}
        </tbody>
      </table>
      <div class="htmx-indicator">Loading...</div>
    </main>
  `;
}

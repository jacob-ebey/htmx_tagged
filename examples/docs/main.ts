import { type RouteConfig, serve } from "htmx_tagged";

import { getAssetResponse } from "htmx_tagged/assets";

import CodeHighlighter from "./elements/code-highlighter.ts";

import * as documentLayout from "./routes/_document.ts";
import * as globalLayout from "./routes/_layout.ts";
import * as catchAllPage from "./routes/catchall.ts";

const dev = Deno.args[0] === "dev";

export type Context = {
  docs: string;
};

const routes: RouteConfig<Context>[] = [
  {
    id: "root",
    module: documentLayout,
    children: [
      {
        id: "layout",
        module: globalLayout,
        children: [
          {
            id: "home",
            index: true,
            module: catchAllPage,
          },
          {
            id: "catchall",
            path: "*",
            module: catchAllPage,
          },
        ],
      },
    ],
  },
];

await serve(routes, {
  dev,
  elements: {
    "code-highlighter": CodeHighlighter,
  },
  getAssetResponse,
  middleware({ next }) {
    return next({
      docs: "../../docs",
    });
  },
});

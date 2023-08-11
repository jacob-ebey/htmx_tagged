import { type RouteConfig, serve } from "htmx_tagged";
import { getAssetResponse } from "htmx_tagged/assets";

import * as documentLayout from "./routes/_document.ts";
import * as globalLayout from "./routes/_layout.ts";
import * as notFoundPage from "./routes/_404.ts";
import * as homePage from "./routes/home.ts";

const dev = Deno.args[0] === "dev";

export interface Context {}

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
            module: homePage,
          },
          {
            id: "404",
            path: "*",
            module: notFoundPage,
          },
        ],
      },
    ],
  },
];

await serve(routes, {
  dev,
  getAssetResponse,
  middleware({ next }) {
    const context: Context = {};
    return next(context);
  },
});

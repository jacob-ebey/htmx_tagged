import { type RouteConfig, serve } from "htmx_tagged";
import { getAssetResponse } from "htmx_tagged/assets";

import * as documentLayout from "./routes/_document.ts";
import * as globalLayout from "./routes/_layout.ts";
import * as notFoundPage from "./routes/_404.ts";
import * as homePage from "./routes/home.ts";
import * as infiniteScrollPage from "./routes/infinite-scroll.ts";
import * as infiniteScrollPartial from "./routes/infinite-scroll.partial.ts";
import * as modalPage from "./routes/modal.ts";
import * as throwLayout from "./routes/throw.ts";
import * as throwBoundaryPage from "./routes/throw.boundary.ts";
import * as throwPage from "./routes/throw.no-boundary.ts";
import * as throwLayoutLayout from "./routes/throw._layout.ts";
import * as throwLayoutBoundaryPage from "./routes/throw._layout.boundary.ts";
import * as throwLayoutPage from "./routes/throw._layout.no-boundary.ts";

const dev = Deno.args[0] === "dev";

export type Context = unknown;

const routes: RouteConfig<Context>[] = [
  {
    id: "_document",
    module: documentLayout,
    children: [
      {
        id: "_layout",
        module: globalLayout,
        children: [
          {
            id: "home",
            index: true,
            module: homePage,
          },
          {
            id: "throw",
            path: "throw",
            module: throwLayout,
            children: [
              {
                id: "throw.no-boundary",
                index: true,
                module: throwPage,
              },
              {
                id: "throw.boundary",
                path: "boundary",
                module: throwBoundaryPage,
              },
              {
                id: "throw._layout",
                path: "layout",
                module: throwLayoutLayout,
                children: [
                  {
                    id: "throw._layout.no-boundary",
                    index: true,
                    module: throwLayoutPage,
                  },
                  {
                    id: "throw._layout.boundary",
                    path: "boundary",
                    module: throwLayoutBoundaryPage,
                  },
                ],
              },
            ],
          },
          {
            id: "infinite-scroll",
            path: "infinite-scroll",
            module: infiniteScrollPage,
          },
          {
            id: "modal",
            path: "modal",
            module: modalPage,
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
  {
    id: "infinite-scroll.partial",
    path: "infinite-scroll/partial",
    module: infiniteScrollPartial,
  },
];

await serve(routes, {
  dev,
  getAssetResponse,
  middleware({ next }) {
    const context: Context = {};
    return next(context);
  },
  port: Number.parseInt(Deno.env.get("PORT") || "3000"),
});

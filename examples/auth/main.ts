import { createCookieSessionStorage } from "https://esm.sh/@remix-run/deno@1.19.2";
import { type Session } from "https://esm.sh/@remix-run/server-runtime@1.19.2";

import { type RouteConfig, serve } from "../../mod.ts";

import { getAssetResponse } from "../../assets.ts";

import * as notFoundPage from "./routes/_404.ts";
import * as documentLayout from "./routes/_document.ts";
import * as globalLayout from "./routes/_layout.ts";
import * as homePage from "./routes/home.ts";
import * as authPage from "./routes/auth.ts";
import * as dashboardPage from "./routes/dashboard.ts";

import "./env.ts";
import "./db.ts";

const dev = Deno.args[0] === "dev";

export type Context = {
  ensureAuthenticated(redirectTo?: string): { id: string };
  getAuthenticated(): { id: string } | null;
  setAuthenticated(user: { id: string } | null): void;
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
            module: homePage,
          },
          {
            id: "auth",
            path: "auth",
            module: authPage,
          },
          {
            id: "dashboard",
            path: "dashboard",
            module: dashboardPage,
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
  async middleware({ request, next }) {
    const sessionStorage = createCookieSessionStorage({
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secrets: [Deno.env.get("SESSION_SECRET")],
        secure: request.url.startsWith("https://"),
      },
    });

    const session: Session = await sessionStorage.getSession(
      request.headers.get("Cookie"),
    );
    const ogSession = JSON.stringify(session.data);

    const response = await next({
      ensureAuthenticated(redirectTo) {
        const user = session.get("user");
        if (!user) {
          if (!redirectTo) {
            const url = new URL(request.url);
            const searchParams = new URLSearchParams({
              redirect_to: url.pathname + url.search,
            });
            redirectTo = `/auth?${searchParams.toString()}`;
          }

          throw new Response("", {
            status: 302,
            headers: {
              Location: redirectTo,
            },
          });
        }

        return user;
      },
      getAuthenticated() {
        const user = session.get("user");
        if (!user) {
          return null;
        }

        return user;
      },
      setAuthenticated(user) {
        if (user) {
          session.set("user", user);
        } else {
          session.unset("user");
        }
      },
    });

    if (JSON.stringify(session.data) !== ogSession) {
      response.headers.append(
        "Set-Cookie",
        await sessionStorage.commitSession(session),
      );
    }

    return response;
  },
});

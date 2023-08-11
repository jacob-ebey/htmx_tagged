import cn from "npm:clsx@2.0.0";
import { email, minLength, object, string, ValiError } from "npm:valibot@0.8.0";

import {
  type ActionArgs,
  attr,
  html,
  type LoaderArgs,
  type RouteProps,
  value,
} from "../../../mod.ts";

import * as form from "../behaviors/form.ts";
import * as db from "../db.ts";
import type { Context } from "../main.ts";

export function loader({ request }: LoaderArgs<Context>) {
  const url = new URL(request.url);
  const intent = url.searchParams.get("intent") ?? "login";
  const redirect_to = form.safeRedirect(url.searchParams.get("redirect_to"));
  const redirectSearchParams = new URLSearchParams({ redirect_to }).toString();
  const newSearchParams = new URLSearchParams({
    intent,
    redirect_to,
  });
  const action = `/auth?${newSearchParams.toString()}`;

  return {
    action,
    intent,
    pathname: url.pathname,
    redirectSearchParams,
  };
}

export default function Auth(props: RouteProps<typeof loader, typeof action>) {
  return html`
    <main class="container content">
        <div class="auth-container">
          ${AuthSection(props)}
        </div>
    </main>
  `;
}

export function AuthSection(
  { actionData, loaderData }: RouteProps<typeof loader, typeof action>,
) {
  const loginHref =
    `${loaderData.pathname}?intent=login&${loaderData.redirectSearchParams}`;
  const signupHref =
    `${loaderData.pathname}?intent=signup&${loaderData.redirectSearchParams}`;

  const passwordAutocomplete = loaderData.intent === "signup"
    ? "new-password"
    : "current-password";

  return html`
    <section>
      <style>
        .auth-container {
          max-width: 400px;
          margin: 0 auto;
        }
      </style>
      <div class="sr-only" id="auth-tabs-label">
        Authentication
      </div>
      <div
        class="tabs"
        id="auth-tabs"
        role="tablist"
        aria-labelledby="auth-tabs-label"
      >
        <a
          href=${attr(loginHref)}
          class=${attr(cn({ active: loaderData.intent !== "signup" }))}
          role="tab"
          aria-controls="auth-form"
          aria-selected=${
    attr(loaderData.intent !== "signup" ? "true" : "false")
  }
        >
          Login
        </a>
        <a
          href=${attr(signupHref)}
          class=${attr(cn({ active: loaderData.intent === "signup" }))}
          role="tab"
          aria-controls="auth-form"
          aria-selected=${
    attr(loaderData.intent === "signup" ? "true" : "false")
  }
        >
          Sign up
        </a>
      </div>
      <form
        id="auth-form"
        method="post"
        action=${attr(loaderData.action)}
        hx-replace-url="true"
        role="tabpanel"
      >
        <fieldset data-loading-disable data-loading-path=${
    attr(loaderData.action)
  }>
          <h2>${loaderData.intent === "signup" ? "Sign up" : "Login"}</h2>

          <label>
            Email <br />
            <input type="email" name="email" />
            ${ErrorMessage(actionData?.errors?.email)}
          </label>

          <label>
            Password <br />
            <input
              type="password"
              name="password"
              autocomplete=${attr(passwordAutocomplete)}
            />
            ${ErrorMessage(actionData?.errors?.password)}
          </label>

          ${
    loaderData.intent === "signup" && html`
          <label>
            Verify Password <br />
            <input
              type="password"
              name="verifyPassword"
              autocomplete="new-password"
            />
            ${ErrorMessage(actionData?.errors?.verifyPassword)}
          </label>
          `
  }

          ${ErrorMessage(actionData?.errors?._global)}

          <p>
            <button type="submit">
              ${loaderData.intent === "signup" ? "Sign up" : "Login"}
            </button>
          </p>
        </fieldset>
      </form>
    </section>
  `;
}

function ErrorMessage(errors: string[] | undefined) {
  if (!errors?.length) return null;
  return html`
    <span class="error">${value(errors.join(". "))}.</span>
  `;
}

const loginSchema = object({
  email: string([email()]),
  password: string([minLength(8, "Password must be at least 8 characters")]),
});

const signupSchema = object({
  email: string([email()]),
  password: string([minLength(8, "Password must be at least 8 characters")]),
  verifyPassword: string([
    minLength(8, "Password must be at least 8 characters"),
  ]),
});

export function action({
  context: {
    setAuthenticated,
  },
  request,
  status,
}: ActionArgs<Context>) {
  const url = new URL(request.url);
  const intent = url.searchParams.get("intent") ?? "login";
  const safeRedirect = form.safeRedirect(url.searchParams.get("redirect_to"));

  const redirectToTarget = () => {
    throw new Response("", {
      status: 302,
      headers: { Location: safeRedirect },
    });
  };

  switch (intent) {
    case "logout":
      setAuthenticated(null);
      return redirectToTarget();

    case "login":
      return form.run(
        loginSchema,
        request,
        status,
        async (data) => {
          const user = await db.login(data);
          if (!user) {
            throw new form.FormError("Invalid email or password", 401);
          }

          setAuthenticated(user);
          return null;
        },
        redirectToTarget,
      );

    case "signup":
      return form.run(
        signupSchema,
        request,
        status,
        async (data) => {
          if (data.password !== data.verifyPassword) {
            throw new ValiError([
              {
                reason: "string",
                validation: "string",
                input: data,
                origin: "value",
                message: "Passwords must match",
                path: [
                  {
                    schema: "object",
                    input: data,
                    key: "verifyPassword",
                    value: data.verifyPassword,
                  },
                ],
              },
            ]);
          }

          const user = await db.signup(data);
          if (!user) {
            throw new form.FormError("Invalid email or password", 401);
          }

          return setAuthenticated(user);
        },
        redirectToTarget,
      );

    default:
      return form.error("Invalid auth intent", status);
  }
}

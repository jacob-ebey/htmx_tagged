import { html, type LoaderArgs, type RouteProps } from "../../../mod.ts"

import { AuthSection, loader as authSectionLoader } from "./auth.ts"
import type { Context } from "../main.ts"

export async function loader(
  args: LoaderArgs<Context>,
) {
  const { context: { getAuthenticated } } = args

  return {
    authenticated: !!getAuthenticated(),
    authSection: await authSectionLoader(args),
  }
}

export default function Home({ loaderData }: RouteProps<typeof loader>) {
  if (loaderData.authenticated) {
    return html`
      <main class="container content">
        <article>
          <h2>Welcome back!</h2>
          <p>
            You're already logged in, so there's nothing to see here. Head on over
            to the <a href="/dashboard">dashboard</a> to see your account details.
          </p>
        </article>
      </main>
    `
  }

  return html`
    <main class="container content split-screen">
      <article>
        <h2>Welcome to HTMX Tagged</h2>
        <p>We're stoked that you're here. 🥳</p>
        <p>
          Feel free to take a look around the code to see how we do things,
          it might be a bit different than what you’re used to. When you're
          ready to dive deeper, we've got plenty of resources to get you
          up-and-running quickly.
        </p>
        <ul>
          <li>
            <a href="https://htmx.org/">HTMX Documentation</a>
          </li>
          <li>
            <a href="https://htmx-tagged.deno.dev/">HTMX Tagged Documentation</a>
          </li>
        </ul>
      </article>
      ${AuthSection({ loaderData: loaderData.authSection })}
    </main>
  `
}

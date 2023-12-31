import * as mediaTypes from "https://deno.land/x/media_types@v3.0.3/mod.ts";
import createStatic from "https://deno.land/x/static_files@1.1.6/mod.ts";
import * as esbuild from "https://deno.land/x/esbuild@v0.18.17/mod.js";
import { denoPlugins } from "https://deno.land/x/esbuild_deno_loader@0.8.1/mod.ts";
import * as path from "node:path";

const cache = new Map<string, { contents: Uint8Array; href: string }>();
const assets = new Map<string, string>();
const staticFiles = new Map<string, Uint8Array>();
const staticHandler = createStatic("public", {
  index: "index.html",
  fallthrough: true,
  setHeaders(headers) {
    headers.set(
      "cache-control",
      "public, max-age=600, s-maxage=600 must-revalidate",
    );
  },
  extensions: ["html"],
});

export async function getAssetResponse(url: URL) {
  if (staticFiles.has(url.pathname)) {
    return new Response(staticFiles.get(url.pathname)!, {
      headers: {
        "content-type":
          mediaTypes.contentType(path.extname(url.pathname) || "") ||
          "text/plain",
        "cache-control": "public, max-age=600, s-maxage=600",
      },
    });
  }
  const asset = assets.get(url.pathname);
  const cached = asset && cache.get(asset);
  if (cached) {
    return new Response(cached.contents, {
      headers: {
        "content-type":
          mediaTypes.contentType(path.extname(url.pathname) || "") ||
          "text/plain",
        "cache-control":
          "public, max-age=31536000, immutable, s-maxage=31536000",
      },
    });
  }

  const staticResponse = await staticHandler({
    request: new Request(url.href),
    respondWith: (r: Response) => r,
  });
  if (staticResponse.status !== 404) return staticResponse;
}

export async function stylesheet(href: `/${string}.css`) {
  const cacheKey = "stylesheet:" + href;
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey)!;
    return cached;
  }

  if (
    !href.startsWith("/") || href.startsWith("//") || !href.endsWith(".css")
  ) {
    throw new Error(`Stylesheet href must start with "/": ${href}`);
  }

  const publicDir = path.join(Deno.cwd(), "public");

  const buildResult = await esbuild.build({
    absWorkingDir: publicDir,
    outdir: publicDir,
    entryPoints: [path.join(publicDir, href.slice(1))],
    bundle: true,
    write: false,
    minify: true,
    metafile: true,
    assetNames: "[name]-[hash]",
    entryNames: "[name]-[hash]",
    chunkNames: "[name]-[hash]",
    loader: {
      ".woff": "file",
      ".woff2": "file",
      ".ttf": "file",
      ".eot": "file",
      ".png": "file",
      ".jpg": "file",
      ".jpeg": "file",
      ".gif": "file",
      ".svg": "file",
      ".webp": "file",
    },
  });

  if (buildResult.errors.length) {
    throw new Error(
      `Error building stylesheet ${href}: ${
        (await esbuild.formatMessages(buildResult.errors, {
          kind: "error",
          color: true,
        })).join("\n")
      }`,
    );
  }

  if (!buildResult.outputFiles.length) {
    throw new Error(`No output files for stylesheet ${href}`);
  }

  let cached: { contents: Uint8Array; href: string } | undefined = undefined;
  for (const file of buildResult.outputFiles) {
    const relative = path.relative(publicDir, file.path);
    const tmpCached = {
      contents: file.contents,
      href: `/${relative}`,
    };
    cache.set(cacheKey, tmpCached);
    assets.set(tmpCached.href, cacheKey);
    if (
      buildResult.metafile.outputs[relative].entryPoint &&
      (("/" + buildResult.metafile.outputs[relative].entryPoint) === href)
    ) {
      cached = tmpCached;
    }
  }

  if (!cached) {
    throw new Error(`No output files for stylesheet ${href}`);
  }

  return cached;
}

export async function script(
  href: `${"/" | "https://"}${string}.${"ts" | "tsx" | "js"}`,
) {
  const cacheKey = "script:" + href;
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey)!;
    return cached;
  }

  const publicDir = path.join(Deno.cwd(), "public");
  const entrypoint = href.startsWith("https://") || href.startsWith("npm:")
    ? href
    : path.join(publicDir, href.slice(1));

  const buildResult = await esbuild.build({
    absWorkingDir: publicDir,
    outdir: publicDir,
    entryPoints: [entrypoint],
    bundle: true,
    write: false,
    minify: true,
    metafile: true,
    format: "esm",
    platform: "browser",
    target: "es2020",
    assetNames: "[name]-[hash]",
    entryNames: "[name]-[hash]",
    chunkNames: "[name]-[hash]",
    plugins: [
      {
        name: "externals",
        setup(build: esbuild.PluginBuild) {
          build.onResolve({ filter: /\?external$/ }, (args) => {
            return {
              path: args.path.replace(/\?external$/, ""),
              external: true,
              sideEffects: true,
            };
          });
        },
      },
      // deno-lint-ignore no-explicit-any
      ...denoPlugins() as any,
    ],
  });

  if (buildResult.errors.length) {
    throw new Error(
      `Error building script ${href}: ${
        (await esbuild.formatMessages(buildResult.errors, {
          kind: "error",
          color: true,
        })).join("\n")
      }`,
    );
  }

  if (!buildResult.outputFiles.length) {
    throw new Error(`No output files for stylesheet ${href}`);
  }

  let cached: { contents: Uint8Array; href: string } | undefined = undefined;
  for (const file of buildResult.outputFiles) {
    const relative = path.relative(publicDir, file.path);
    const tmpCached = {
      contents: file.contents,
      href: `/${relative}`,
    };
    cache.set(cacheKey, tmpCached);
    assets.set(tmpCached.href, cacheKey);
    if (
      buildResult.metafile.outputs[relative].entryPoint &&
      (("/" + buildResult.metafile.outputs[relative].entryPoint) === href)
    ) {
      cached = tmpCached;
    }
  }

  if (!cached) {
    throw new Error(`No output files for stylesheet ${href}`);
  }

  return cached;
}

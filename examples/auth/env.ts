const dev = Deno.args[0] === "dev";

if (dev) {
  await import("https://deno.land/x/dotenv@v3.2.2/load.ts");
}

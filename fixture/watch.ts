console.log(
  (await Promise.all([
    getNames("./public"),
  ])).flat(Infinity).join(","),
);

async function getNames(currentPath: string): Promise<string[]> {
  const names: string[] = [];

  for await (const dirEntry of Deno.readDir(currentPath)) {
    const entryPath = `${currentPath}/${dirEntry.name}`;

    if (dirEntry.isDirectory) {
      names.push(...(await getNames(entryPath)));
    } else {
      names.push(entryPath);
    }
  }

  return names;
}

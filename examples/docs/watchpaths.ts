async function getNames(currentPath: string): Promise<string[]> {
  const names: string[] = []

  for await (const dirEntry of Deno.readDir(currentPath)) {
    const entryPath = `${currentPath}/${dirEntry.name}`
    names.push(entryPath)

    if (dirEntry.isDirectory) {
      names.push(...(await getNames(entryPath)))
    }
  }

  return names
}

console.log(
  [
    ...(await getNames("./public")),
    ...(await getNames("../../docs")),
  ].join(
    ",",
  ),
)

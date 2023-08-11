import * as fs from "https://deno.land/std@0.198.0/fs/mod.ts";

const server = new Deno.Command("deno", {
  args: [
    "run",
    "-A",
    "main.ts",
  ],
  stdout: "piped",
});
const serverProcess = server.spawn();

const [serverProcessStdoutA, serverProcessStdoutB] = serverProcess.stdout.tee();
serverProcessStdoutA.pipeTo(Deno.stdout.writable);

const serverReadyPromise = new Promise<void>((resolve) =>
  (async () => {
    const reader = serverProcessStdoutB.getReader();
    const decoder = new TextDecoder();
    let { done, value } = await reader.read();
    let output = "";
    while (!done) {
      output += decoder.decode(value, { stream: true });
      if (output.includes("Listening on")) {
        resolve();
        break;
      }
      const n = await reader.read();
      done = n.done;
      value = n.value;
    }
  })()
);

const outputDir = Deno.args[0] || "ssg";

if (outputDir !== "public") {
  fs.copy("public", outputDir, { overwrite: true });
}

let code = 0;
try {
  await serverReadyPromise;
  // Run wget -r -np -E -nH -P ssg http://localhost:3000/
  const wget = new Deno.Command("wget", {
    args: [
      "-r",
      "-np",
      "-E",
      "-nH",
      "-P",
      outputDir,
      "http://localhost:3000/",
    ],
  });
  const wgetOutput = await wget.output();
  code = wgetOutput.code;

  console.log(new TextDecoder().decode(wgetOutput.stdout));
  console.error(new TextDecoder().decode(wgetOutput.stderr));
} finally {
  serverProcess.kill();
  const serverOutput = await serverProcess.status;
  if (serverOutput.signal !== "SIGTERM") {
    code = serverOutput.code;
  }
}
Deno.exit(code);

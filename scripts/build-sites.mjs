import { readdir, readFile, writeFile, mkdir, cp, rm } from "node:fs/promises";
import { resolve, relative, extname } from "node:path";
import { execFileSync } from "node:child_process";
import { build } from "esbuild";
execFileSync("npm", ["run", "build"], { stdio: "inherit" });
const dist = resolve("dist");
const assets = {};
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
};
async function collect(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = resolve(dir, entry.name);
    if (entry.isDirectory()) await collect(p);
    else {
      const extension = extname(p);
      if (!types[extension])
        throw new Error("Unexpected asset type: " + extension);
      assets["/" + relative(dist, p)] = {
        type: types[extension],
        body: await readFile(p, "utf8"),
      };
    }
  }
}
await collect(dist);
await writeFile(
  "worker/assets.generated.mjs",
  "export const assets=" + JSON.stringify(assets) + ";\n",
);
await rm("dist", { recursive: true, force: true });
await mkdir("dist/server", { recursive: true });
await mkdir("dist/.openai", { recursive: true });
const bundle = await build({
  entryPoints: ["worker/index.mjs"],
  outfile: "dist/server/index.js",
  bundle: true,
  platform: "browser",
  format: "esm",
  target: "es2022",
  minify: true,
  metafile: true,
  logLevel: "warning",
});
if (
  Object.values(bundle.metafile.outputs).some((output) => output.imports.length)
)
  throw new Error("Worker bundle contains unresolved runtime imports.");
await cp(".openai/hosting.json", "dist/.openai/hosting.json");
const worker = await readFile("dist/server/index.js", "utf8");
if (/sk-[A-Za-z0-9]{20,}/.test(worker) || worker.includes("DEEPSEEK_API_KEY="))
  throw new Error("Credential-shaped bytes detected in build.");
console.log(
  JSON.stringify({
    workerBytes: Buffer.byteLength(worker),
    assets: Object.keys(assets),
    output: "dist/server/index.js",
  }),
);

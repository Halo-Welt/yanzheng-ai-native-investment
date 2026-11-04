import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import worker from "../dist/server/index.js";
const env = {};
for (const name of ["DEEPSEEK_API_KEY", "DEEPSEEK_BASE_URL", "DEEPSEEK_MODEL"])
  if (process.env[name]) env[name] = process.env[name];
try {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match && !env[match[1]])
      env[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, "$2");
  }
} catch {}
createServer(async (req, res) => {
  try {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const raw = Buffer.concat(chunks);
    const request = new Request(
      new URL(req.url, "http://" + (req.headers.host ?? "127.0.0.1:4174")),
      {
        method: req.method,
        headers: req.headers,
        ...(raw.length ? { body: raw } : {}),
      },
    );
    const response = await worker.fetch(request, env, {});
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    res.writeHead(500);
    res.end("Worker preview error");
  }
}).listen(4174, "127.0.0.1", () =>
  console.log("Worker parity preview http://127.0.0.1:4174"),
);

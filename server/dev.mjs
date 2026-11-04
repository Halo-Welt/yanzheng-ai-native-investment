import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { handleAnalyze, health, respond } from "./http.mjs";
const path = new URL("../.env.local", import.meta.url);
if (existsSync(path))
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match && !process.env[match[1]])
      process.env[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, "$2");
  }
createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/api/health") return respond(res, 200, health());
  if (url.pathname === "/api/analyze") return handleAnalyze(req, res);
  respond(res, 404, { error: { code: "NOT_FOUND", message: "接口不存在。" } });
}).listen(Number(process.env.API_PORT ?? 3001), "127.0.0.1", () =>
  console.log(
    "研证 API 服务已启动：http://127.0.0.1:" + (process.env.API_PORT ?? 3001),
  ),
);

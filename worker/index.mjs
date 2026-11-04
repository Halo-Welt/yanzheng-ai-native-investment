import { audit, AuditError } from "../server/core.mjs";
import { assets } from "./assets.generated.mjs";

const counters = new Map();
const responseHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};
const json = (value, status = 200) =>
  new Response(JSON.stringify(value), { status, headers: responseHeaders });
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/health")
      return json({
        configured: Boolean(env.DEEPSEEK_API_KEY),
        provider: "DeepSeek",
        model: env.DEEPSEEK_MODEL ?? "deepseek-flash",
        dataMode: "公开历史年报字段快照",
        isLiveData: false,
      });
    if (url.pathname === "/api/analyze") {
      if (request.method !== "POST")
        return json(
          {
            error: { code: "METHOD_NOT_ALLOWED", message: "仅支持POST请求。" },
          },
          405,
        );
      const origin = request.headers.get("Origin");
      if (origin && origin !== url.origin)
        return json(
          {
            error: {
              code: "ORIGIN_FORBIDDEN",
              message: "请求来源与本站不一致。",
            },
          },
          403,
        );
      const ip =
        request.headers.get("CF-Connecting-IP") ??
        request.headers.get("oai-authenticated-user-id") ??
        "anonymous";
      const now = Date.now();
      for (const [k, v] of counters)
        if (now - v.start > 60000) counters.delete(k);
      const counter = counters.get(ip) ?? { start: now, count: 0 };
      counter.count++;
      counters.set(ip, counter);
      if (counter.count > 8)
        return json(
          {
            error: {
              code: "RATE_LIMITED",
              message: "请求较频繁，请一分钟后再试。",
            },
          },
          429,
        );
      try {
        if (Number(request.headers.get("Content-Length")) > 30000)
          throw new AuditError("BODY_TOO_LARGE", "请求内容过大。", 413);
        const raw = await request.text();
        if (new TextEncoder().encode(raw).byteLength > 30000)
          throw new AuditError("BODY_TOO_LARGE", "请求内容过大。", 413);
        let input;
        try {
          input = JSON.parse(raw);
        } catch {
          throw new AuditError("INVALID_JSON", "请求必须为有效JSON。");
        }
        return json(await audit(input, { env }));
      } catch (e) {
        return json(
          {
            error: {
              code: e instanceof AuditError ? e.code : "INTERNAL_ERROR",
              message:
                e instanceof AuditError
                  ? e.message
                  : "审校服务暂时不可用，请重试。",
            },
          },
          e instanceof AuditError ? e.status : 500,
        );
      }
    }
    if (request.method !== "GET" && request.method !== "HEAD")
      return new Response("Method not allowed", { status: 405 });
    const path = url.pathname === "/" ? "/index.html" : url.pathname;
    const asset = assets[path];
    if (!asset) return new Response("Not found", { status: 404 });
    return new Response(request.method === "HEAD" ? null : asset.body, {
      headers: {
        "Content-Type": asset.type,
        "Cache-Control":
          path === "/index.html"
            ? "no-cache"
            : "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    });
  },
};

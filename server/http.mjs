import { AuditError, audit } from "./core.mjs";
const windowMs = 60000;
const limits = new Map();
export function health(env = process.env) {
  return {
    configured: Boolean(env.DEEPSEEK_API_KEY),
    provider: "DeepSeek",
    model: env.DEEPSEEK_MODEL ?? "deepseek-flash",
    dataMode: "公开历史年报字段快照",
    isLiveData: false,
  };
}
export function respond(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(body));
}
export async function handleAnalyze(req, res, options = {}) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return respond(res, 405, {
      error: { code: "METHOD_NOT_ALLOWED", message: "仅支持 POST 请求。" },
    });
  }
  const origin = req.headers.origin;
  const host = req.headers["x-forwarded-host"] ?? req.headers.host;
  if (origin) {
    try {
      if (new URL(origin).host !== host) throw Error();
    } catch {
      return respond(res, 403, {
        error: { code: "ORIGIN_FORBIDDEN", message: "请求来源与本站不一致。" },
      });
    }
  }
  const ip = String(
    req.headers["x-forwarded-for"] ?? req.socket?.remoteAddress ?? "unknown",
  )
    .split(",")[0]
    .trim();
  const now = Date.now();
  for (const [k, v] of limits) if (now - v.start > windowMs) limits.delete(k);
  const limit = limits.get(ip) ?? { start: now, count: 0 };
  limit.count++;
  limits.set(ip, limit);
  if (limit.count > 8)
    return respond(res, 429, {
      error: { code: "RATE_LIMITED", message: "请求较频繁，请一分钟后再试。" },
    });
  try {
    let body = req.body;
    if (!body) {
      let text = "";
      for await (const chunk of req) {
        text += chunk;
        if (Buffer.byteLength(text) > 30000)
          throw new AuditError("BODY_TOO_LARGE", "请求内容过大。", 413);
      }
      try {
        body = JSON.parse(text);
      } catch (error) {
        if (error instanceof AuditError) throw error;
        throw new AuditError("INVALID_JSON", "请求必须为有效 JSON。");
      }
    }
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        throw new AuditError("INVALID_JSON", "请求必须为有效 JSON。");
      }
    }
    const result = await audit(body, options);
    return respond(res, 200, result);
  } catch (error) {
    return respond(res, error instanceof AuditError ? error.status : 500, {
      error: {
        code: error instanceof AuditError ? error.code : "INTERNAL_ERROR",
        message:
          error instanceof AuditError
            ? error.message
            : "审校服务暂时不可用，请重试。",
      },
    });
  }
}

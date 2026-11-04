import { health, respond } from "../server/http.mjs";
export default function handler(req, res) {
  if (req.method !== "GET")
    return respond(res, 405, {
      error: { code: "METHOD_NOT_ALLOWED", message: "仅支持 GET 请求。" },
    });
  return respond(res, 200, health());
}

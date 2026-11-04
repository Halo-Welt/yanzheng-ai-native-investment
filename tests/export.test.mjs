import test from "node:test";
import assert from "node:assert/strict";
import { audit } from "../server/core.mjs";
import { buildExport, reviewStatus } from "../src/report.js";

test("Markdown导出为真实多行并保留字段口径与原文定位", async () => {
  const report = await audit({
    mode: "demo",
    text: "贵州茅台2024年营业收入1708.99亿元。",
  });
  const markdown = buildExport(report, {}, "md");
  assert.ok(markdown.startsWith("# 研证"));
  assert.ok(markdown.split("\n").length > 15);
  assert.ok(!markdown.includes("\\n"));
  assert.ok(!markdown.includes("#page=5#page=5"));
  assert.ok(markdown.includes(report.evidence[0].definition));
});
test("人工核对不能将冲突或禁止表达转成通过报告", async () => {
  const report = await audit({
    mode: "demo",
    text: "贵州茅台2024年营业收入2000亿元。明年必涨20%。",
  });
  const reviews = Object.fromEntries(
    report.claims.map((c) => [c.id, { decision: "accepted" }]),
  );
  assert.match(reviewStatus(report, reviews), /草稿/);
  const payload = JSON.parse(buildExport(report, reviews, "json"));
  assert.equal(payload.status, "blocked");
  assert.ok(payload.claims.some((c) => c.verdict === "conflict"));
  assert.ok(payload.claims.some((c) => c.verdict === "prohibited"));
});
test("只有全部有效事实且逐项复核才能完成资料审校", async () => {
  const report = await audit({
    mode: "demo",
    text: "贵州茅台2024年营业收入1708.99亿元。",
  });
  assert.match(reviewStatus(report, {}), /草稿/);
  const reviews = Object.fromEntries(
    report.claims.map((c) => [
      c.id,
      { decision: "accepted", note: "已核第5页" },
    ]),
  );
  assert.match(reviewStatus(report, reviews), /人工复核完成/);
});
test("JSON导出保留证据、工具轨迹、人工备注与免责声明", async () => {
  const report = await audit({
    mode: "demo",
    text: "贵州茅台2024年营业收入1708.99亿元。",
  });
  const reviews = { "claim-1": { decision: "returned", note: "需要复核" } };
  const out = JSON.parse(buildExport(report, reviews, "json"));
  assert.deepEqual(out.evidence, report.evidence);
  assert.deepEqual(out.trace, report.trace);
  assert.equal(out.reviews["claim-1"].note, "需要复核");
  assert.match(out.disclaimer, /不构成投资建议/);
});

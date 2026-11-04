import test from "node:test";
import assert from "node:assert/strict";
import {
  audit,
  parseModelClaims,
  retrieveEvidence,
  loadEvidence,
} from "../server/core.mjs";

// These regression challenges use local rules and deliberately flawed model extraction.
// No credentials, environment files, network calls, or live model requests are used.
const fact = (text, overrides = {}) => ({
  text,
  kind: "fact",
  company: "贵州茅台",
  year: 2024,
  metricCode: "revenue",
  value: 1708.99,
  unit: "亿元",
  ...overrides,
});
const mockedAudit = (text, extracted) =>
  audit(
    { text, mode: "live" },
    {
      extractor: async () => ({
        model: "independent-adversarial-mock",
        claims: parseModelClaims(JSON.stringify({ claims: extracted }), text),
      }),
    },
  );

for (const temporal of ["最新", "当前", "今年"]) {
  test(`历史来源不能因全文另有2024年而支持“${temporal}”`, async () => {
    const sentence = `贵州茅台${temporal}营业收入为1708.99亿元。`;
    const text = `贵州茅台2024年报告作为历史参考。${sentence}`;
    for (const result of [
      await audit({ text, mode: "demo" }),
      await mockedAudit(text, [fact(sentence)]),
    ]) {
      assert.equal(result.summary.supported, 0);
      assert.ok(
        result.claims.some(
          (c) => c.text === sentence && c.verdict === "unverified",
        ),
      );
    }
  });
}

test("茅台供应商的收入不得绑定为贵州茅台收入", async () => {
  const text = "贵州茅台供应商甲公司2024年营业收入为1708.99亿元。";
  const demo = await audit({ text, mode: "demo" });
  const wrongSubject = await mockedAudit(text, [fact(text)]);
  const exactSupplier = await mockedAudit(text, [
    fact(text, { company: "贵州茅台供应商甲公司" }),
  ]);
  for (const result of [demo, wrongSubject, exactSupplier])
    assert.equal(result.summary.supported, 0);
  assert.deepEqual(
    retrieveEvidence(
      { company: "贵州茅台供应商甲公司", year: 2024, metricCode: "revenue" },
      loadEvidence(),
    ),
    [],
  );
});

test("全文出现茅台不能使其他公司的财务数字获得支持", async () => {
  const sentence = "宁德时代2024年营业收入为1708.99亿元。";
  const text = `贵州茅台2024年业绩作为参考。${sentence}`;
  const demo = await audit({ text, mode: "demo" });
  const incorrectModelSubject = await mockedAudit(text, [fact(sentence)]);
  for (const result of [demo, incorrectModelSubject])
    assert.equal(result.summary.supported, 0);
});

for (const [text, metricCode, value] of [
  ["贵州茅台2024年营业收入为1741.44亿元。", "totalRevenue", 1741.44],
  ["贵州茅台2024年营业收入为862.28亿元。", "profit", 862.28],
]) {
  test(`模型把原句字段映射为${metricCode}也不能通过数字相等校验`, async () => {
    const result = await mockedAudit(text, [fact(text, { metricCode, value })]);
    assert.equal(result.summary.supported, 0);
    assert.equal(result.claims[0].verdict, "unverified");
  });
}

test("同句提及两个年份时不能把报告年份当指标所属年份", async () => {
  const text = "贵州茅台2023年营业收入为1708.99亿元，2024年年报对此作出说明。";
  const result = await mockedAudit(text, [fact(text, { year: 2024 })]);
  assert.equal(result.summary.supported, 0);
});

test("其他公司和年度的增速比较不能引用茅台2024年字段", async () => {
  const sentence = "宁德时代2025年净利润增速高于营业收入增速。";
  const text = `贵州茅台2024年业绩作为参考。${sentence}`;
  const result = await mockedAudit(text, [
    {
      text: sentence,
      kind: "inference",
      company: "宁德时代",
      year: 2025,
      metricCode: "unknown",
      value: null,
      unit: "unknown",
    },
  ]);
  assert.equal(result.summary.supported, 0);
  assert.equal(result.claims[0].verdict, "unverified");
  assert.deepEqual(result.claims[0].evidenceIds, []);
});

for (const risk of [
  "建议购入贵州茅台。",
  "逢低吸纳贵州茅台。",
  "明年百分百上涨20%。",
]) {
  test(`模型漏提取时独立安全规则仍识别：${risk}`, async () => {
    const safe = "贵州茅台2024年营业收入为1708.99亿元。";
    const result = await mockedAudit(safe + risk, [fact(safe)]);
    assert.equal(result.status, "blocked");
    assert.ok(
      result.claims.some(
        (c) => c.text.includes(risk) && c.verdict === "prohibited",
      ),
    );
  });
}

test("同句多个财务字段时不能借另一个指标的数字验证营业收入", async () => {
  const text = "贵州茅台2024年营业收入为2000亿元，归母净利润为1708.99亿元。";
  const result = await mockedAudit(text, [
    fact(text, { metricCode: "revenue", value: 1708.99 }),
  ]);
  assert.equal(result.summary.supported, 0);
});

test("同一句逗号切换公司时不能沿用首个公司的主体", async () => {
  const quote = "宁德时代2024年营业收入为1708.99亿元。";
  const text = `贵州茅台2024年营业收入为2000亿元，${quote}`;
  const result = await mockedAudit(text, [
    fact(quote, { company: "贵州茅台" }),
  ]);
  assert.equal(result.summary.supported, 0);
});

test("金额后的单位必须匹配，不能借同句其他字段的亿元单位", async () => {
  const text = "贵州茅台2024年营业收入为1708.99元，归母净利润为862.28亿元。";
  const result = await mockedAudit(text, [fact(text, { unit: "亿元" })]);
  assert.equal(result.summary.supported, 0);
});

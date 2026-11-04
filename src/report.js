export const SAMPLE =
  "贵州茅台2024年营业收入1708.99亿元，同比增长15.71%。归母净利润862.28亿元，同比增长15.38%。利润增速高于营收增速。盈利质量确定提升。明年必涨20%，建议立即买入。";
export const VERDICTS = {
  supported: { label: "事实已核验", className: "supported" },
  conflict: { label: "数据 / 口径冲突", className: "conflict" },
  unverified: { label: "待补证据", className: "unverified" },
  inference: { label: "推断 · 需人审", className: "inference" },
  prohibited: { label: "合规提示", className: "prohibited" },
};
export const STORAGE_KEY = "yanzheng.reports.v1";
export const evidenceUrl = (e) =>
  `${e.source.url.split("#")[0]}#page=${e.source.page}`;
export const fingerprint = (text) => {
  let h = 2166136261;
  for (const ch of text) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
};
export const formatTime = (t) =>
  new Date(t).toLocaleString("zh-CN", { hour12: false });
export function reviewStatus(report, reviews) {
  if (!report) return "尚未审校";
  const allReviewed =
    report.claims.length > 0 &&
    report.claims.every((c) => reviews[c.id]?.decision === "accepted");
  const clean =
    report.status === "completed" &&
    report.claims.every((c) => c.verdict === "supported");
  return allReviewed && clean
    ? "人工复核完成（仅资料审校）"
    : "审校草稿 · 存在未复核或待修订内容";
}
export function buildExport(report, reviews, format) {
  const status = reviewStatus(report, reviews);
  const payload = {
    ...report,
    reviewStatus: status,
    reviews,
    exportedAt: new Date().toISOString(),
    disclaimer:
      "历史资料审校，不构成投资建议。合规提示、冲突与不确定信息不得因人工勾选而视为通过。",
  };
  if (format === "json") return JSON.stringify(payload, null, 2);
  return [
    "# 研证 · 投研证据审校报告",
    "",
    `状态：${status}`,
    `模式：${report.mode === "live" ? "DeepSeek AI 实际调用" : "规则演示（未调用模型）"}`,
    `生成时间：${formatTime(report.createdAt)}`,
    "",
    "## 待审原文",
    report.inputText || "本记录仅包含逐条原文主张。",
    "",
    "## 逐项审校",
    ...report.claims.flatMap((c, i) => [
      "",
      `### ${i + 1}. ${c.text}`,
      `结果：${VERDICTS[c.verdict]?.label || c.verdict}`,
      `说明：${c.explanation}`,
      `证据：${c.evidenceIds.join("、") || "无可用证据"}`,
      `修订参考：${c.suggestedText || "请结合原文人工判断。"}`,
      `人工复核：${reviews[c.id]?.decision === "accepted" ? "已核对" : reviews[c.id]?.decision === "returned" ? "需修订" : "待复核"}`,
      `复核备注：${reviews[c.id]?.note || "未填写"}`,
    ]),
    "",
    "## 原始证据",
    ...report.evidence.flatMap((e) => [
      "",
      `- ${e.id}｜${e.company}｜${e.period}｜${e.metric}：${e.value}${e.unit}`,
      `  原值：${e.rawValue}${e.rawUnit}；披露日期：${e.publishedAt || "见原报告"}`,
      `  来源：[${e.source.title}](${evidenceUrl(e)})，第${e.source.page}页`,
      `  口径：${e.definition || e.scope || e.basis || "以原报告对应项目口径为准"}`,
    ]),
    "",
    "## 工具执行记录",
    ...report.trace.map(
      (t) => `- ${t.tool}｜${t.status}｜${t.detail}（${t.durationMs}ms）`,
    ),
    "",
    ...report.warnings.map((w) => `提示：${w}`),
    "",
    "历史资料审校，不构成投资建议。",
  ].join("\n");
}
export function downloadReport(report, reviews, format) {
  const a = document.createElement("a");
  const u = URL.createObjectURL(
    new Blob([buildExport(report, reviews, format)], {
      type:
        format === "json"
          ? "application/json;charset=utf-8"
          : "text/markdown;charset=utf-8",
    }),
  );
  a.href = u;
  a.download = `研证审校-${report.id.slice(0, 8)}.${format === "json" ? "json" : "md"}`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
}

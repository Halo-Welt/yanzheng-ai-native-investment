import React from "react";
import { CheckCircle2, AlertCircle, Clock3, GitBranch } from "lucide-react";
const labels = {
  extract_claims: "AI 观点拆解",
  llm_extract: "AI 观点拆解",
  retrieve_evidence: "证据检索",
  verify_numeric: "数值核验",
  compare_growth: "增速比较",
  guard_compliance: "合规检查",
  compliance_guard: "合规检查",
};
export default function Trace({ report, reviews, busy }) {
  const count =
    report?.claims.filter((c) => reviews[c.id]?.decision).length || 0;
  return (
    <section className="panel trace">
      <div className="panel-heading">
        <h2>工具执行记录</h2>
        {report && (
          <span className="quiet-label">
            {report.metrics.modelCalls} 次模型调用 · {report.metrics.toolCalls}{" "}
            次工具执行 · {(report.metrics.durationMs / 1000).toFixed(2)} 秒
          </span>
        )}
      </div>
      {report ? (
        <>
          <div className="trace-steps">
            {report.trace.map((t) => (
              <div className={`trace-step ${t.status}`} key={t.id}>
                {t.status === "success" ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
                <div>
                  <strong>{labels[t.tool] || t.tool}</strong>
                  <span>{t.detail}</span>
                  <small>
                    {t.durationMs} ms ·{" "}
                    {t.status === "success"
                      ? "已执行"
                      : t.status === "warning"
                        ? "需关注"
                        : "执行异常"}
                  </small>
                </div>
              </div>
            ))}
            <div
              className={`trace-step ${count === report.claims.length ? "success" : "pending"}`}
            >
              <Clock3 size={18} />
              <div>
                <strong>人工复核</strong>
                <span>
                  已复核 {count} / {report.claims.length} 项主张
                </span>
                <small>最终判断由研究员负责</small>
              </div>
            </div>
          </div>
          {report.warnings.length > 0 && (
            <div className="trace-warnings">
              {report.warnings.map((w, i) => (
                <p key={i}>{w}</p>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="trace-empty">
          <GitBranch size={18} />
          <span>
            {busy
              ? "等待真实执行结果，完成后可查看每一步的工具、状态和耗时。"
              : "审校后展示模型拆解、证据检索、数值核验及合规检查的真实记录。"}
          </span>
        </div>
      )}
    </section>
  );
}

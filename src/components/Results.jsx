import React from "react";
import {
  FileCheck2,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Download,
  ChevronDown,
} from "lucide-react";
import { VERDICTS, downloadReport, reviewStatus } from "../report.js";
export default function Results({
  report,
  selectedId,
  onSelect,
  reviews,
  onReview,
  busy,
  stale,
}) {
  if (!report)
    return (
      <section className="panel results">
        <div className="panel-heading">
          <h2>审校结果</h2>
          <span className="quiet-label">逐项验证</span>
        </div>
        <div className="empty">
          <FileCheck2 size={38} />
          <h3>{busy ? "正在核验你的研究摘要" : "等待第一份审校"}</h3>
          <p>
            {busy
              ? "真实执行结果将在模型与工具返回后展示。"
              : "事实回到原文，推断保留边界。完成审校后，你可以逐条查看证据。"}
          </p>
        </div>
        <div className="empty-principles">
          <span>01 拆解主张</span>
          <span>02 核验来源</span>
          <span>03 人工复核</span>
        </div>
      </section>
    );
  const exportReport = stale
    ? {
        ...report,
        status: "degraded",
        warnings: [
          ...report.warnings,
          "输入已修改或从历史恢复，当前结果来自上次摘要，请重新审校。",
        ],
      }
    : report;
  const s = report.summary;
  const pending = s.conflict + s.unverified + s.inference;
  return (
    <section className="panel results" aria-labelledby="results-heading">
      <div className="panel-heading">
        <h2 id="results-heading">审校结果</h2>
        <span className={`mode-label ${report.mode === "demo" ? "demo" : ""}`}>
          {report.mode === "live" ? "AI 实际调用" : "规则演示 · 非 AI"}
        </span>
      </div>
      {stale && (
        <p className="stale-warning" role="status">
          输入已修改或从历史恢复，当前结果来自上次摘要，请重新审校。当前只能导出带提示的历史草稿。
        </p>
      )}
      <div className="summary">
        <div>
          <b className="number-supported">{s.supported}</b>
          <span>事实已核验</span>
        </div>
        <div>
          <b className="number-pending">{pending}</b>
          <span>冲突 / 待补证据</span>
        </div>
        <div>
          <b className="number-risk">{s.prohibited}</b>
          <span>合规提示</span>
        </div>
      </div>
      <p className="report-status">
        {report.status === "blocked"
          ? "发现合规边界，请修订相关表达。"
          : report.status === "degraded"
            ? "存在证据异常，未将缺失信息视为正常。"
            : "核验完成，等待研究员逐项复核。"}
      </p>
      <div className="claim-list">
        {report.claims.map((c, i) => {
          const v = VERDICTS[c.verdict] || VERDICTS.unverified;
          const active = selectedId === c.id;
          const review = reviews[c.id] || {};
          const Icon =
            c.verdict === "supported"
              ? CheckCircle2
              : c.verdict === "prohibited"
                ? ShieldAlert
                : AlertCircle;
          return (
            <article className={`claim ${active ? "selected" : ""}`} key={c.id}>
              <div className="claim-top">
                <span className="claim-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <button
                  className="claim-text"
                  onClick={() => onSelect(c.id)}
                  aria-expanded={active}
                >
                  {c.text}
                </button>
              </div>
              <div className="claim-tools">
                <span className={`verdict ${v.className}`}>
                  <Icon size={14} />
                  {v.label}
                </span>
                <button
                  className="text-button"
                  onClick={() => onSelect(c.id)}
                  aria-label={`查看证据：${c.text}`}
                >
                  查看证据
                  <ArrowUpRight size={13} />
                </button>
              </div>
              {active && (
                <div className="claim-explanation">
                  <p>{c.explanation}</p>
                  {c.suggestedText && (
                    <p>
                      <span>修订参考：</span>
                      {c.suggestedText}
                    </p>
                  )}
                </div>
              )}
              <div className="review-row">
                <label htmlFor={`review-${c.id}`}>人工复核</label>
                <select
                  id={`review-${c.id}`}
                  aria-label={`人工复核第${i + 1}条`}
                  value={review.decision || ""}
                  onChange={(e) =>
                    onReview(c.id, { ...review, decision: e.target.value })
                  }
                >
                  <option value="">待复核</option>
                  <option value="accepted">已核对</option>
                  <option value="returned">需修订</option>
                </select>
              </div>
              {(active || review.decision) && (
                <input
                  className="review-note"
                  aria-label={`第${i + 1}条复核备注`}
                  placeholder="记录判断依据或修订意见（可选）"
                  value={review.note || ""}
                  maxLength={500}
                  onChange={(e) =>
                    onReview(c.id, { ...review, note: e.target.value })
                  }
                />
              )}
            </article>
          );
        })}
      </div>
      <div className="export-area">
        <p>{reviewStatus(exportReport, reviews)}</p>
        <div className="export-buttons">
          <button
            className="secondary"
            onClick={() => downloadReport(exportReport, reviews, "md")}
          >
            <Download size={14} />
            导出 Markdown
          </button>
          <button
            className="secondary"
            onClick={() => downloadReport(exportReport, reviews, "json")}
          >
            JSON
            <ChevronDown size={12} />
          </button>
        </div>
        <small>
          人工“已核对”不会解除冲突或合规提示。每次最多提取16条，未提取内容不视为已核验，请复核全文。
        </small>
      </div>
    </section>
  );
}

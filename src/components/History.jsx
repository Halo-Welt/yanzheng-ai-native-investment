import React from "react";
import {
  History as HistoryIcon,
  Trash2,
  ArrowUpRight,
  Info,
} from "lucide-react";
import { formatTime, reviewStatus } from "../report.js";
export default function History({
  records,
  onOpen,
  onDelete,
  persist,
  onPersist,
  storageError,
}) {
  return (
    <>
      <div className="intro">
        <h1>审校记录</h1>
        <p>回到证据与人工判断，继续尚未完成的审校。</p>
      </div>
      <section className="panel history-panel">
        <div className="history-settings">
          <div>
            <label className="persistence-toggle">
              <input
                type="checkbox"
                checked={persist}
                onChange={(e) => onPersist(e.target.checked)}
              />
              在本机保存审校记录
            </label>
            <p className="muted">
              默认仅保留当前会话。启用后会在此浏览器保存摘要原文、主张片段、审校结论与复核备注，关闭即清除本机保存。
            </p>
            {storageError && (
              <p role="alert" className="error">
                {storageError}
              </p>
            )}
          </div>
          <span className="record-count">{records.length} 份记录</span>
        </div>
        {records.length ? (
          <div className="history-list">
            {records.map(({ report, reviews }) => (
              <article className="history-row" key={report.id}>
                <div className="history-icon">
                  <HistoryIcon size={19} />
                </div>
                <div className="history-content">
                  <h3>研究摘要审校 · {report.claims.length} 项主张</h3>
                  <p>
                    {formatTime(report.createdAt)}
                    <span>
                      {report.mode === "live" ? "DeepSeek AI" : "规则演示"}
                    </span>
                  </p>
                  <small>{reviewStatus(report, reviews)}</small>
                </div>
                <button className="secondary" onClick={() => onOpen(report.id)}>
                  继续审校
                  <ArrowUpRight size={14} />
                </button>
                <button
                  className="icon-button danger"
                  onClick={() => onDelete(report.id)}
                  aria-label={`删除${formatTime(report.createdAt)}审校记录`}
                >
                  <Trash2 size={17} />
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty">
            <HistoryIcon size={34} />
            <h3>还没有审校记录</h3>
            <p>完成一次审校后，报告将在当前会话中出现。</p>
          </div>
        )}
        <p className="history-note">
          <Info size={14} />
          每份记录独立保存人工复核状态。删除记录不会影响已下载的文件。
        </p>
      </section>
    </>
  );
}

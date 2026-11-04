import React from "react";
import { ArrowRight, RotateCcw, LoaderCircle, Info } from "lucide-react";
export default function Editor({
  text,
  onText,
  mode,
  onMode,
  scenario,
  onScenario,
  busy,
  health,
  onRun,
  onSample,
  error,
}) {
  return (
    <section className="panel editor" aria-labelledby="editor-heading">
      <div className="panel-heading">
        <h2 id="editor-heading">待审校摘要</h2>
        <button className="text-button" onClick={onSample} disabled={busy}>
          <RotateCcw size={13} />
          载入样例
        </button>
      </div>
      <p className="muted editor-subtitle">贵州茅台 · 2024 年度公开报告</p>
      <label className="sr-only" htmlFor="research-text">
        待审校摘要
      </label>
      <textarea
        id="research-text"
        placeholder="粘贴一段包含可核验事实与研究判断的摘要…"
        value={text}
        onChange={(e) => onText(e.target.value)}
        maxLength={6000}
        disabled={busy}
      />
      <div className="editor-meta">
        <span>使用构造摘要，勿提交未公开资料</span>
        <span>{text.length} / 6000</span>
      </div>
      <div className="field-row">
        <label htmlFor="audit-mode">审校方式</label>
        <select
          id="audit-mode"
          value={mode}
          onChange={(e) => onMode(e.target.value)}
          disabled={busy}
        >
          <option value="live">DeepSeek AI 审校</option>
          <option value="demo">规则演示 · 不调用 AI</option>
        </select>
      </div>
      <div className="field-row">
        <span>数据来源</span>
        <span className="source-value">公开年报 · 历史字段</span>
      </div>
      <div className="field-row">
        <label htmlFor="audit-scenario">审校类型</label>
        <select
          id="audit-scenario"
          value={scenario}
          onChange={(e) => onScenario(e.target.value)}
          disabled={busy}
        >
          <option value="normal">正常核验</option>
          <option value="missing">演练：数据缺失</option>
          <option value="failure">演练：接口失败</option>
          <option value="stale">演练：数据过期</option>
          <option value="conflict">演练：来源冲突</option>
        </select>
      </div>
      {scenario !== "normal" && (
        <p className="inline-note">
          <Info size={13} />
          人为故障注入，用于检查降级行为。
        </p>
      )}
      {mode === "demo" && (
        <p className="inline-note">
          规则演示只核验有限样例，不代表 AI 语义理解。
        </p>
      )}
      {mode === "live" && health && !health.configured && (
        <p className="inline-note warning">
          模型服务尚未配置。你仍可显式选择规则演示。
        </p>
      )}
      <button
        className="primary"
        onClick={onRun}
        disabled={busy || !text.trim()}
      >
        {busy ? (
          <>
            <LoaderCircle className="spin" size={17} />
            正在拆解与核验…
          </>
        ) : (
          <>
            开始证据审校
            <ArrowRight size={18} />
          </>
        )}
      </button>
      {busy && (
        <p className="muted progress-note" role="status">
          等待模型和工具实际响应，不预设核验结论。
        </p>
      )}
      {error && (
        <div className="error-box" role="alert">
          <strong>本次未生成正常审校结论</strong>
          <p>{error}</p>
          <button className="text-button" onClick={onRun}>
            重试本次审校
          </button>
          {mode === "live" && (
            <button className="text-button" onClick={() => onMode("demo")}>
              手动切换规则演示
            </button>
          )}
        </div>
      )}
      <p className="privacy-note">
        AI 模式会将摘要发送至
        DeepSeek。凭证仅保存在服务端；记录默认仅保留在当前会话。
      </p>
    </section>
  );
}

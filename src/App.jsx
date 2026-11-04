import React, { useEffect, useState } from "react";
import {
  FileCheck2,
  History as HistoryIcon,
  BookOpen,
  Database,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import Editor from "./components/Editor.jsx";
import Results from "./components/Results.jsx";
import Evidence from "./components/Evidence.jsx";
import Trace from "./components/Trace.jsx";
import History from "./components/History.jsx";
import Guide from "./components/Guide.jsx";
import { SAMPLE, STORAGE_KEY, fingerprint } from "./report.js";
function readSaved() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!parsed?.enabled || !Array.isArray(parsed.records))
      return { enabled: false, records: [] };
    return {
      enabled: true,
      records: parsed.records
        .filter(
          (x) =>
            x?.report?.id &&
            Array.isArray(x.report.claims) &&
            Array.isArray(x.report.evidence) &&
            Array.isArray(x.report.trace),
        )
        .slice(0, 20),
    };
  } catch {
    return { enabled: false, records: [] };
  }
}
export default function App() {
  const [saved] = useState(readSaved);
  const [tab, setTab] = useState("workspace");
  const [text, setText] = useState(SAMPLE);
  const [mode, setMode] = useState("live");
  const [scenario, setScenario] = useState("normal");
  const [report, setReport] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [reviews, setReviews] = useState({});
  const [records, setRecords] = useState(saved.records);
  const [persist, setPersist] = useState(saved.enabled);
  const [storageError, setStorageError] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [health, setHealth] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/health", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then(setHealth)
      .catch(() => {});
    return () => controller.abort();
  }, []);
  useEffect(() => {
    try {
      if (persist)
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ enabled: true, records: records.slice(0, 20) }),
        );
      else localStorage.removeItem(STORAGE_KEY);
      setStorageError("");
    } catch {
      setStorageError("浏览器未能保存记录，报告仍保留在当前会话。");
    }
  }, [persist, records]);
  function selectTab(next) {
    setTab(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  async function run() {
    if (busy || !text.trim()) return;
    setBusy(true);
    setError("");
    setReport(null);
    setSelectedId(null);
    setReviews({});
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mode, scenario }),
      });
      const data = await response.json();
      if (!response.ok)
        throw Error(
          data.error?.message || `服务返回异常（${response.status}）`,
        );
      if (
        !Array.isArray(data.claims) ||
        !Array.isArray(data.evidence) ||
        !Array.isArray(data.trace) ||
        !data.summary ||
        !data.metrics
      )
        throw Error("返回结果结构不完整，未生成审校报告。");
      const enriched = {
        ...data,
        inputText: text,
        inputMode: mode,
        inputScenario: scenario,
        inputFingerprint: fingerprint(text),
      };
      setReport(enriched);
      setSelectedId(data.claims[0]?.id || null);
      setRecords((prev) =>
        [
          { report: enriched, reviews: {} },
          ...prev.filter((x) => x.report.id !== data.id),
        ].slice(0, 20),
      );
    } catch (e) {
      setError(
        e.message === "Failed to fetch"
          ? "网络连接失败，请稍后重试；系统未生成替代结论。"
          : e.message,
      );
    } finally {
      setBusy(false);
    }
  }
  function editText(value) {
    setText(value);
    if (report) setReviews({});
  }
  function updateReview(id, value) {
    const next = { ...reviews, [id]: value };
    setReviews(next);
    setRecords((prev) =>
      prev.map((x) =>
        x.report.id === report.id ? { ...x, reviews: next } : x,
      ),
    );
  }
  function openRecord(id) {
    const item = records.find((x) => x.report.id === id);
    if (!item) return;
    setText(item.report.inputText || "");
    setMode(item.report.inputMode || item.report.mode || "live");
    setScenario(item.report.inputScenario || "normal");
    setReport(item.report);
    setReviews(item.reviews || {});
    setSelectedId(item.report.claims[0]?.id || null);
    setError("");
    selectTab("workspace");
  }
  function deleteRecord(id) {
    setRecords((prev) => prev.filter((x) => x.report.id !== id));
    if (report?.id === id) {
      setReport(null);
      setReviews({});
      setSelectedId(null);
    }
  }
  const stale = Boolean(
    report && report.inputFingerprint !== fingerprint(text),
  );
  const titles = {
    workspace: "观点审校",
    history: "审校记录",
    guide: "使用说明",
  };
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">研</span>
          <div>
            <strong>研证</strong>
            <small>RESEARCH WITH EVIDENCE</small>
          </div>
        </div>
        <nav aria-label="主导航">
          {[
            ["workspace", FileCheck2, "观点审校"],
            ["history", HistoryIcon, "审校记录"],
            ["guide", BookOpen, "使用说明"],
          ].map(([id, Icon, label]) => (
            <button
              key={id}
              className={tab === id ? "active" : ""}
              onClick={() => selectTab(id)}
              aria-current={tab === id ? "page" : undefined}
            >
              <Icon />
              {label}
              {id === "history" && records.length > 0 && (
                <small className="nav-count">{records.length}</small>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <p className="sidebar-note">
            <ShieldCheck size={15} />
            公开资料 · 证据可溯源
          </p>
          <span>研究判断，由人负责</span>
        </div>
      </aside>
      <div className="body">
        <header className="topbar">
          <span>
            投研工作台
            <ChevronRight size={12} />
            <strong>{titles[tab]}</strong>
          </span>
          <span>
            <Database size={14} />
            公开历史数据
            <span className="data-dot" />
          </span>
        </header>
        <main>
          {tab === "workspace" ? (
            <>
              <div className="intro">
                <h1>让每一条观点，回到证据。</h1>
                <p>拆解研究摘要，核验事实与口径，把判断留给研究员。</p>
              </div>
              <div className="workspace">
                <Editor
                  text={text}
                  onText={editText}
                  mode={mode}
                  onMode={setMode}
                  scenario={scenario}
                  onScenario={setScenario}
                  busy={busy}
                  health={health}
                  onRun={run}
                  onSample={() => editText(SAMPLE)}
                  error={error}
                />
                <Results
                  report={report}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  reviews={reviews}
                  onReview={updateReview}
                  busy={busy}
                  stale={stale}
                />
                <Evidence report={report} selectedId={selectedId} />
              </div>
              <Trace report={report} reviews={reviews} busy={busy} />
            </>
          ) : tab === "history" ? (
            <History
              records={records}
              onOpen={openRecord}
              onDelete={deleteRecord}
              persist={persist}
              onPersist={setPersist}
              storageError={storageError}
            />
          ) : (
            <Guide />
          )}
        </main>
        <footer>
          <span>历史资料审校，不构成投资建议。</span>
          <span>独立考试作品 · 非同花顺官方产品</span>
        </footer>
      </div>
    </div>
  );
}

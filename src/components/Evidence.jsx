import React from "react";
import { BookOpen, ArrowUpRight, Info } from "lucide-react";
import { evidenceUrl } from "../report.js";
export default function Evidence({ report, selectedId }) {
  const claim = report?.claims.find((c) => c.id === selectedId);
  const fields =
    report?.evidence.filter((e) => claim?.evidenceIds.includes(e.id)) || [];
  return (
    <aside className="panel evidence" aria-labelledby="evidence-heading">
      <div className="panel-heading">
        <h2 id="evidence-heading">证据详情</h2>
        <BookOpen size={17} />
      </div>
      {!claim ? (
        <div className="empty">
          <BookOpen size={30} />
          <p>选择一条审校结果，查看原始字段与来源。</p>
        </div>
      ) : (
        <>
          <p className="evidence-claim">{claim.text}</p>
          {fields.length ? (
            fields.map((e) => (
              <section className="evidence-item" key={e.id}>
                <div className="evidence-item-heading">
                  <span>{e.metric}</span>
                  <small>{e.period}</small>
                </div>
                <div className="evidence-value">
                  {e.value.toLocaleString("zh-CN", {
                    maximumFractionDigits: 4,
                  })}
                  <span>{e.unit}</span>
                </div>
                <dl>
                  <div>
                    <dt>原始字段</dt>
                    <dd>{e.metric}</dd>
                  </div>
                  <div>
                    <dt>原始值</dt>
                    <dd>
                      {e.rawValue.toLocaleString("zh-CN", {
                        maximumFractionDigits: 2,
                      })}{" "}
                      {e.rawUnit}
                    </dd>
                  </div>
                  <div>
                    <dt>公司</dt>
                    <dd>{e.company}</dd>
                  </div>
                  <div>
                    <dt>报告期</dt>
                    <dd>{e.period}</dd>
                  </div>
                  <div>
                    <dt>披露日期</dt>
                    <dd>{e.publishedAt || "2025-04-03"}</dd>
                  </div>
                  <div>
                    <dt>统计口径</dt>
                    <dd>
                      {e.definition ||
                        e.scope ||
                        e.basis ||
                        "以原报告对应项目口径为准"}
                    </dd>
                  </div>
                  <div>
                    <dt>证据编号</dt>
                    <dd className="mono">{e.id}</dd>
                  </div>
                </dl>
                <p className="source-title">{e.source.title}</p>
                <a
                  className="source-link"
                  href={evidenceUrl(e)}
                  target="_blank"
                  rel="noreferrer"
                >
                  查看原始年报 · 第 {e.source.page} 页<ArrowUpRight size={13} />
                </a>
                {e.source.excerpt && (
                  <blockquote>{e.source.excerpt}</blockquote>
                )}
              </section>
            ))
          ) : (
            <div className="no-evidence">
              <Info size={23} />
              <h3>没有可引用的事实证据</h3>
              <p>
                {claim.verdict === "prohibited"
                  ? "该表达触及直接交易建议或确定性预测边界，应从研究摘要中删除。"
                  : claim.verdict === "inference"
                    ? "这是一项研究判断，现有财务字段不足以直接证明。请补充分析逻辑及反向证据。"
                    : "当前数据范围或来源质量不足，保留为待核验，不推定事实成立。"}
              </p>
            </div>
          )}
          <p className="evidence-footer">
            <Info size={13} />
            仅核验已收录的历史字段，不代表实时行情或完整研究结论。
          </p>
        </>
      )}
    </aside>
  );
}

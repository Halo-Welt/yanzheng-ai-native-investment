import React from "react";
import { FileText, SearchCheck, UserCheck, ArrowUpRight } from "lucide-react";
export default function Guide() {
  return (
    <>
      <div className="intro">
        <h1>让证据进入研究流程</h1>
        <p>一份可追溯、可复核的研究摘要，从区分事实和判断开始。</p>
      </div>
      <div className="guide">
        <section className="panel">
          <h2>三步完成审校</h2>
          <ol className="guide-steps">
            <li>
              <FileText />
              <div>
                <h3>输入摘要，明确范围</h3>
                <p>
                  粘贴含公司、报告期、数据或研究判断的摘要。首版收录贵州茅台2024年报有限字段；未覆盖公司与期间会保留为待核验。
                </p>
              </div>
            </li>
            <li>
              <SearchCheck />
              <div>
                <h3>逐条查看证据</h3>
                <p>
                  DeepSeek
                  将自然语言拆成原子主张，工具按公司、年度和字段检索公开历史资料，并校验数字、单位及增速比较方向。推断不会因数字正确而自动成为事实。每次最多提取16条主张，未提取内容不视为已核验，请人工复核全文。
                </p>
              </div>
            </li>
            <li>
              <UserCheck />
              <div>
                <h3>人工复核与导出</h3>
                <p>
                  查看原始年报页码，记录复核判断及备注。含冲突、推断、缺失、合规提示或未复核内容的报告始终标记为草稿。可导出
                  Markdown 或 JSON。
                </p>
              </div>
            </li>
          </ol>
        </section>
        <section className="panel">
          <h2>AI 的角色与边界</h2>
          <p>
            LLM负责语义拆解；确定性工具负责数值与证据质量检查；规则负责独立识别直接交易建议、确定性涨跌预测和收益承诺。工具记录展示实际执行步骤，不表示模型自主联网。
          </p>
          <p>
            当前证据是正式公开年报字段快照，非实时行情。扶摇接口在缺少授权时不能返回数据，iFinD
            尚未接入可调用工具。产品不会以接口调用成功外观替代业务成功。
          </p>
          <p>
            规则演示由用户显式选择，模型调用次数为零。故障演练通过人工注入数据缺失、接口失败、过期或冲突，检查系统能否如实降级。
          </p>
          <a
            className="source-link"
            target="_blank"
            rel="noreferrer"
            href="https://static.cninfo.com.cn/finalpage/2025-04-03/1222993920.PDF#page=5"
          >
            查看贵州茅台2024年年度报告
            <ArrowUpRight size={14} />
          </a>
        </section>
        <section className="panel">
          <h2>数据与隐私</h2>
          <p>
            AI 模式会将摘要发送到 DeepSeek
            服务端，请使用公开或构造数据。服务凭证仅在应用服务端使用，浏览器不接收密钥。
          </p>
          <p>
            报告默认仅保留在当前会话，不自动写入本机。你可在“审校记录”中显式启用本机保存；保存内容包含摘要原文、主张片段、证据、审校结论及复核备注，最多保留20份，可逐份删除或关闭保存。
          </p>
          <p className="guide-disclaimer">
            历史资料审校，不构成投资建议。本产品是独立考试作品，采用金融终端视觉语言，非同花顺官方产品。
          </p>
        </section>
      </div>
    </>
  );
}

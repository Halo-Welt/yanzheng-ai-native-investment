# API 与真实 AI 主链路

Node 22 ESM；开发服务 `node server/dev.mjs` 监听 127.0.0.1:3001，前端通过 Vite /api 代理访问；上线用 Vercel `api/*.mjs` 函数。

## GET /api/health

返回 `{configured:boolean,provider:"DeepSeek",model:"deepseek-flash",dataMode:"公开历史年报字段快照",isLiveData:false}`。不返回密钥或服务端凭证。

## POST /api/analyze

请求：`{text:string,mode:"live"|"demo",scenario:"normal"|"missing"|"failure"|"stale"|"conflict"}`。默认 live/normal。输入最多6000字，语义提取最多16条主张，单次模型调用45秒超时，2600输出token上限。

响应：

```json
{"id":"uuid","mode":"live","status":"completed|degraded|blocked","createdAt":"ISO8601","model":"deepseek-flash","claims":[{"id":"claim-1","text":"原文片段","kind":"fact|inference|advice","verdict":"supported|conflict|unverified|inference|prohibited","explanation":"依据与不足","evidenceIds":["revenue-2024"],"suggestedText":"修订参考"}],"evidence":[{"id":"revenue-2024","metric":"营业收入","metricCode":"revenue","value":1708.9915227634,"unit":"亿元","year":2024,"period":"2024年度","rawValue":170899152276.34,"rawUnit":"元","company":"贵州茅台","isLive":false,"source":{"title":"原始报告","url":"https://…","page":5,"excerpt":"有限字段摘要"}}],"trace":[{"id":"step-1","tool":"retrieve_evidence","status":"success|warning|error","detail":"可复核说明","durationMs":1}],"summary":{"total":1,"supported":1,"conflict":0,"unverified":0,"inference":0,"prohibited":0,"needsReview":0},"warnings":[],"metrics":{"durationMs":1000,"modelCalls":1,"toolCalls":2,"inputChars":30,"totalTokens":500}}
```

summary是主张计数，不是事实准确率或投资胜率。status blocked表示包含不得进入研究结论的合规表达；其他事实仍供核对，不能把blocked解释为整份输入的事实均错误。推断始终需要人审。

结构化错误：`{error:{code,message}}`；400输入问题，403跨域来源拒绝，413请求过大，429进程内限流，502模型输出/上游错误，503未配置或来源不可用，504超时。无密钥或模型失败绝不自动生成演示结果。

## 可解释编排

1. **LLM 语义提取**：一次真实 DeepSeek JSON Output调用，原子化主张、识别字段与期间，返回必须定位于原文的片段。
2. **代码编排工具**：对事实调用本地 `retrieve_evidence`，按公司、年度、字段匹配已核验历史报告字段，再调用 `verify_numeric` 逐一校验原文数字、单位、期间、证据质量与原始值。对净利润与营收增速比较额外执行 `compare_growth`，计算百分点差并核对方向。
3. **独立合规约束**：全文正则额外识别直接买卖建议、确定涨跌和收益承诺，即使模型遗漏也新增阻断项。
4. **人工复核**：前端按主张记录接受/退回和备注，导出时附证据和审校状态。

这属于 LLM 驱动语义拆解、确定性工具执行的有界工作流，并非声称模型自主联网或自主选择工具。trace准确区分模型、检索、数值校验与合规步骤。

## 演练与已知边界

- demo 是用户显式选择的本地规则演示，API返回 mode:demo，modelCalls:0。规则无法替代LLM的语义理解。
- missing/failure/stale/conflict 是人为故障注入，不代表实际公开年报缺失或冲突。stale指已失效版本，历史期间原报告不会仅因年代久远被判定失效。
- 仅支持已核验贵州茅台年报有限字段，不提供全市场实时数据；其他公司、年份、口径均不通过。
- 数字先按两位小数核对；不同单位不会自动转换，避免把元与亿元混用。
- 进程内每IP每分钟8次限流；无持久配额，生产规模使用须增加网关认证与共享额度控制。
- 同源检查并非身份认证；线上服务凭证须设置供应商费用上限，禁止在浏览器输入第三方密钥。

依据：[DeepSeek JSON Output](https://api-docs.deepseek.com/guides/json_mode/) 与[首次调用](https://api-docs.deepseek.com/)，2026-11-04核验。未调用OpenAI API。

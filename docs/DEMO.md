# 研证产品演示视频

[观看/下载发布页](https://github.com/Halo-Welt/yanzheng-ai-native-investment/releases/tag/demo-v1) · [MP4文件](https://github.com/Halo-Welt/yanzheng-ai-native-investment/releases/download/demo-v1/yanzheng-demo.mp4) · [独立字幕SRT](https://github.com/Halo-Welt/yanzheng-ai-native-investment/releases/download/demo-v1/yanzheng-demo.srt)

**108.88秒，1920×1080，25fps，H.264 MP4，约2.8MiB。** 无口播，含烧录中文字幕；直接录制线上产品，显示鼠标操作，原速播放，无模拟AI结果或PPT段落。

## 一名用户完成的核心任务

研究员需要在发出摘要前核对事实与判断。先对一段含正确数字、错误比较、推断和禁止表达的摘要运行真实AI审校；查看原始字段与年报页码，理解问题；随后修订摘要，只保留有依据的历史事实，重新调用AI，逐项人工复核，并导出完成审校的报告。

| 约略时点 | 真实屏幕操作 |
| --- | --- |
| 00:00–00:12 | 打开工作台、载入并检查构造摘要，明确2024年历史资料范围 |
| 00:12–00:24 | 点击开始审校，显示真实DeepSeek响应及分类结果 |
| 00:24–00:38 | 查看营业收入原值、字段口径和年报第5页；核对利润与收入增速比较 |
| 00:38–00:53 | 查看缺少充分依据的盈利质量推断，以及确定性涨幅/买入表达的合规提示 |
| 00:53–01:10 | 用户修订摘要；旧结果失效；重新运行真实AI审校 |
| 01:10–01:27 | 四个数值事实逐项核对、填写备注并导出Markdown/JSON |
| 01:27–01:49 | 查看实际工具记录和初稿/修订版历史，确认任务完成 |

字幕精确时间轴以独立SRT为准。

## 实际调用与结果

- 第一轮：8条主张，4支持、1比较冲突、1推断、2禁止表达。
- 第二轮：修订为4个可核验事实，4支持、无冲突/缺证/禁止表达。
- 用户将四条均标为已核对，给第一条添加年报第5页核对备注。
- 实际下载的Markdown和JSON均显示“人工复核完成（仅资料审校）”，同时保留原始证据和非投资建议边界。

原始API结果：[两次审校](video/recorded-live-audits.json)。实际导出：[Markdown](video/completed-report.md)、[JSON](video/completed-report.json)。媒体参数及验证：[video-verification.json](video/video-verification.json)。

## 录制与制作

录制对象为公开线上URL https://yanzheng-investment-research.halowelt.chatgpt.site/ ，不是本地假数据页面。使用Playwright CLI录制实际视口、鼠标与控件操作；FFmpeg转为1080p H.264并添加中文字幕。字幕放在底部独立区域，不遮盖产品按钮与证据。没有对AI调用进行加速或补画中间结果。

仅录制应用内容和构造摘要；密钥、环境变量、开发者认证信息及其他应用窗口不出现在视频中。录屏产生两次真实模型费用，未使用规则演示冒充AI。

已核验：时长在60–180秒内、分辨率、帧率、文件解码、关键操作帧、字幕清晰度，以及实际导出的复核状态。

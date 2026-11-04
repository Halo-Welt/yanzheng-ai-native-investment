# 最终交付物

以下五项均可独立访问；压缩包不作为提交入口。

## 必交

1. **可访问、可实际操作的 Web 产品 URL**  
   https://yanzheng-investment-research.halowelt.chatgpt.site/  
   已公开，无需登录；可完成摘要输入、真实AI审校、证据查看、人工复核、报告导出与历史恢复。

2. **源代码仓库与 README**  
   仓库：https://github.com/Halo-Welt/yanzheng-ai-native-investment  
   README：https://github.com/Halo-Welt/yanzheng-ai-native-investment/blob/main/README.md  
   README包含启动方式、环境变量、产品选择、AI角色、数据来源、已知边界和未做事项。方案与24小时规划见 [PRODUCT.md](PRODUCT.md)。

3. **AI 使用与验证记录**  
   https://github.com/Halo-Welt/yanzheng-ai-native-investment/blob/main/docs/AI_USAGE.md  
   包含开发工具、多Agent分工、实际修正、真实模型记录与规则/mock边界；视频中的两次真实API结果另见 [recorded-live-audits.json](video/recorded-live-audits.json)。

4. **测试说明**  
   https://github.com/Halo-Welt/yanzheng-ai-native-investment/blob/main/docs/TESTING.md  
   35项自动测试通过；覆盖主链路、数据缺失、接口失败、失效/冲突、公司/年度/单位/口径错配、提示注入与合规边界，另有桌面、移动和线上真实操作记录。

## 可选（本次已完成）

5. **60–180 秒演示视频**  
   [视频发布页](https://github.com/Halo-Welt/yanzheng-ai-native-investment/releases/tag/demo-v1) · [直接下载MP4](https://github.com/Halo-Welt/yanzheng-ai-native-investment/releases/download/demo-v1/yanzheng-demo.mp4) · [字幕SRT](https://github.com/Halo-Welt/yanzheng-ai-native-investment/releases/download/demo-v1/yanzheng-demo.srt)  
   **108.88秒 / 1920×1080 / 25fps / 中文字幕**。直接录制公开线上产品，原速保留两次真实DeepSeek审校，展示发现问题、查看证据、修订、重新核验、人工复核、导出和历史记录。无讲PPT片段。详细时间轴及制作说明见 [DEMO.md](DEMO.md)。

## 交付范围

产品采用接近同花顺的红白金融工具主题，为独立考试作品。首版仅覆盖贵州茅台公开历史年报8字段，扶摇/iFinD尚未取得授权接入，非实时行情。业务效率与准确率目标不冒充用户实验成绩。

网站和源码均经用户明确授权公开。AI调用使用服务端配置的DeepSeek额度；密钥未进入前端、源码仓库或视频。视频使用构造摘要和公开财务字段，不包含客户画像或真实持仓。

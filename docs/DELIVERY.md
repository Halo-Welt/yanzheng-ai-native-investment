# 提交入口

- Web产品：[打开研证](https://yanzheng-investment-research.halowelt.chatgpt.site)
- 源代码仓库：[Halo-Welt/yanzheng-ai-native-investment](https://github.com/Halo-Welt/yanzheng-ai-native-investment)
- 本地目录：`yan-zheng`；Node22+，`npm ci && npm run dev`。

## 提交材料核对

| 题目要求 | 实物 |
| --- | --- |
| 可操作Web | 输入、真实AI审校、证据、复核、导出、异常演练 |
| 源代码与README | React/Vite前端、DeepSeek服务端、有界工具、启动环境与边界 |
| AI使用与验证 | AI_USAGE.md + live-audit.json |
| 测试说明 | TESTING.md + tests/*.test.mjs + 浏览器验收截图 |
| 60–180秒视频（可选） | 提供DEMO.md现场演示脚本；是否录像以最终交付为准 |

历史数据覆盖贵州茅台年报8字段，扶摇/iFinD尚未授权接通。所有收益与效率目标不是已验证业绩。

访问权限：用户明确授权后，网站与源码仓库均已公开。评审可直接打开网站，无需ChatGPT登录；AI调用使用服务端配置的DeepSeek额度。

验证：35项自动测试通过；1536×1024桌面/393×852移动浏览器主链路、故障、人工复核、导出、历史与隐私开关已实测。完整记录见TESTING.md与design/VERIFICATION.md。

可选视频：未录制；DEMO.md为90秒现场演示脚本，不作为视频提交。

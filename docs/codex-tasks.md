# Codex 开发任务

本项目按功能逐步提交，每个任务完成后使用中文 commit 信息推送到 GitHub。

## 已规划任务

1. 建立 React + Vite 基础项目。
2. 建立 SceneConfig 数据结构和示例 JSON。
3. 实现前台胶囊舱 Demo。
4. 实现后台 3D 场景编辑器 MVP。
5. 加入可复用护工监护端 UI。
6. 加入虚拟书法游戏。

## 验收方式

- 每个任务至少通过 `npm run build`。
- 涉及 3D 或前端界面时，使用浏览器打开本地页面检查主要视图。
- 每次提交前确认 `git status` 中只包含当前任务相关文件。

## 开发记录

- 2026-06-10：完成 P0-01、P0-03、P0-05、P0-06。确认旧版静态原型继续保留在根目录运行，新版 React/Vite 系统通过 `/demo`、`/admin`、`/preview/:sceneId` 访问，并补充 README 与开发计划中的新旧版本关系说明。
- 2026-06-10：完成 P1-08。新增全局错误边界，页面渲染异常时显示友好恢复界面，避免前台、后台或预览端白屏。
- 2026-06-10：完成 P1-09。新增统一加载状态组件，并在 3D 场景首帧渲染前显示加载浮层。
- 2026-06-10：P1 现代前端工程骨架阶段全部完成，阶段总表已更新为完成。
- 2026-06-10：完成 P2-02。补全 SceneConfig 的 `uiPanels` 顶层结构，默认场景、校验器和 schema 文档保持一致。
- 2026-06-10：完成 P2-03。新增 FlowConfig 校验模块和文档，明确主演示流程状态、actions、next 和 duration 结构。
- 2026-06-10：完成 P2-04。新增 PracticeSession 校验模块和文档，可记录开始/结束时间、当前状态、事件、练习数据和护工操作。
- 2026-06-10：完成 P2-05。新增 Report 校验模块和文档，报告包含 sessionId、综合分、分项指标、动态建议和摘要。
- 2026-06-10：完成 P2-06。新增标准默认项目配置 `src/data/defaultProject.json`，保留旧 `project-config.json` 兼容后续迁移。
- 2026-06-10：完成 P2-07。新增默认主演示流程 `src/data/defaultFlow.json`，覆盖 idle 到 finished 的 10 个标准状态。
- 2026-06-10：完成 P2-10。新增统一配置加载器，前台 Demo 与后台 sceneStore 共用默认 Project、Flow、Scene 加载入口。
- 2026-06-10：完成 P2-11。新增统一 JSON 配置导入校验方法，后台 SceneConfig 导入改为先识别类型再校验。
- 2026-06-10：完成 P2-12。新增统一 JSON 导出方法，后台可导出单个场景或当前项目配置包。
- 2026-06-10：P2 数据结构与配置系统阶段全部完成，阶段总表已更新为完成。
- 2026-06-10：完成 P3-01、P3-02。新增 flowStore，`/demo` 默认进入 idle，并在演示控制台显示当前流程状态、历史和可执行操作。
- 2026-06-10：完成 P3-03。开始体验动作会进入 ready_check，并创建 PracticeSession 与初始事件。
- 2026-06-10：完成 P3-04。ready_check 的下一步会进入 enter_experience，并把状态切换事件写入 session。
- 2026-06-10：完成 P3-05。immersive_intro 会同步老人视角、阶段说明和基于 FlowConfig 的剩余时间。
- 2026-06-10：完成 P3-06。calligraphy_tutorial 状态在老人端显示当前练习字“永”和八法笔画说明。
- 2026-06-10：完成 P3-07。practice_game 状态会显示老人端书法练习组件，并在 PracticeSession 中记录练习开始。
- 2026-06-10：完成 P3-08。练习完成后进入 scoring，基于 PracticeSession.practiceData 生成 Report 原型和 score_generated 事件。
- 2026-06-10：完成 P3-09。report 状态新增报告视图，读取 session.report 展示综合分、分项指标和练习建议。
- 2026-06-10：完成 P3-10。caregiver_confirm 状态新增护工确认界面，支持确认结束、重新练习和保存报告。
- 2026-06-10：完成 P3-11。finished 状态会完成 session、写入结束事件并保存到本地，仍可重置或重新开始。
- 2026-06-10：完成 P3-12。暂停会冻结流程计时并暂停书法动画，session 记录暂停操作。

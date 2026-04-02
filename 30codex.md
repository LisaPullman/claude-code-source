# Claude Code 源码30天学习计划（中文）

## 计划目标
- 第1目标：能讲清楚这个项目从命令行启动到一次完整对话请求结束的全链路。
- 第2目标：能讲清楚核心设计：命令系统、查询引擎、工具系统、权限与状态、Bridge远程通道、插件与技能扩展。
- 第3目标：能进行小规模定制（新增一个简单命令或工具）并知道改动影响范围。

## 学习方法（每天固定节奏，建议90-150分钟）
- 20分钟：快速通读当天文件，先画模块关系。
- 40-80分钟：精读关键函数，记录输入/输出/副作用。
- 20-40分钟：做一个微实验（运行、跟踪日志、改一处小逻辑并回滚）。
- 10分钟：写当日总结（必须写“我今天真正理解了什么”）。

## 建议产出物（每天都更新）
- docs/learning/dayXX-notes.md：当日笔记。
- docs/learning/architecture-map.md：持续更新模块关系图。
- docs/learning/glossary.md：术语表（例如 ToolUseContext、AppState、query loop、compact、bridge 等）。
- docs/learning/questions.md：未解问题清单。

## 30天总览
- 第1周：启动链路与项目骨架（先“跑通”）。
- 第2周：核心执行引擎（query + QueryEngine + tools + context）。
- 第3周：系统能力层（commands、state、permissions、tasks、bridge）。
- 第4周：扩展能力与综合实战（plugins/skills、性能、可维护性、定制开发）。

---

## 第1周：启动链路与骨架理解

### Day 1：项目定位与入口全景
- 阅读文件：README.md、package.json、cli.js。
- 目标：理解这是一个终端 Agent 工具，入口是 claude 命令，源码主入口在 src/main.tsx（cli.js为打包产物入口）。
- 练习：画“启动最短路径图”（从执行命令到进入主流程）。
- 当日问题：为什么存在 minified 的 cli.js 与 src/main.tsx 双入口形态？

### Day 2：主入口 main.tsx 第一遍
- 阅读文件：src/main.tsx（先读前300-500行，再按函数跳转）。
- 目标：识别入口阶段做了哪些事情：预取、配置、初始化、命令解析、REPL/非交互分流。
- 练习：列出 main.tsx 的“前置并行优化点”（例如 keychain 预取、mdm 预读等）。
- 产出：一张“main.tsx 功能分层图”。

### Day 3：初始化生命周期
- 阅读文件：src/entrypoints/init.ts、src/bootstrap/state.ts（按需跳转）、src/utils/config.ts（按需）。
- 目标：理解 init 做了什么：配置启用、安全环境变量、网络代理/证书、清理钩子、遥测初始化时机。
- 练习：总结“信任建立前后”初始化差异。
- 当日问题：哪些初始化是阻塞式，哪些是异步后台式？为什么？

### Day 4：命令系统总览
- 阅读文件：src/commands.ts、src/types/command.ts、src/commands/help/index.js（或相近实现文件）。
- 目标：理解命令注册方式、内置命令分类、特性开关（feature gate）与 lazy import 策略。
- 练习：画“命令发现与启用条件”流程图。
- 产出：列出你最关键的10个命令及归属模块。

### Day 5：上下文注入机制
- 阅读文件：src/context.ts、src/utils/claudemd.ts（按需）、src/utils/git.ts（按需）。
- 目标：理解 system context / user context 注入内容、缓存策略、git状态快照作用。
- 练习：回答“为什么提示词要注入 git 状态与日期信息”。
- 微实验：在本地观察不同仓库状态下上下文内容差异。

### Day 6：一次请求的宏观数据流
- 阅读文件：src/query.ts（先总览）、src/QueryEngine.ts（先总览）。
- 目标：先不钻细节，抓住一次请求中的消息流、工具调用、压缩、错误恢复大框架。
- 练习：画“用户输入 -> 模型 -> 工具 -> 模型 -> 输出”的循环图。

### Day 7：第1周复盘
- 任务：不看代码，口述15分钟“系统如何启动并接受第一个请求”。
- 自测清单：
  - 能否说清 main.tsx 与 init.ts 的职责边界。
  - 能否说清命令系统与 query 系统关系。
  - 能否说清 context 注入是如何影响模型行为的。
- 产出：week1-summary.md（不少于800字）。

---

## 第2周：核心执行引擎深挖

### Day 8：query.ts 结构化精读（上）
- 阅读文件：src/query.ts（类型定义、query/queryLoop入口、状态变量）。
- 目标：理解 QueryParams、State、transition 语义与循环退出条件。
- 练习：写出 query loop 的伪代码。

### Day 9：query.ts 结构化精读（中）
- 阅读文件：src/query.ts（工具执行相关、错误分支、压缩相关代码段）。
- 目标：理解工具结果如何回流消息、何时触发 compact、何时重试。
- 练习：总结 3 条“韧性设计”（例如 max_output_tokens 恢复策略）。

### Day 10：query.ts 结构化精读（下）
- 阅读文件：src/query.ts（stop hooks、token budget、事件产出）。
- 目标：掌握 token budget 控制和 stop hook 的意义。
- 练习：画“预算不足时的行为路径”。

### Day 11：QueryEngine 设计
- 阅读文件：src/QueryEngine.ts。
- 目标：理解它如何封装会话状态、消息持久、权限拒绝记录、跨轮次能力。
- 练习：写一段“为什么需要 QueryEngine，而不是直接暴露 query()”。

### Day 12：工具系统入口
- 阅读文件：src/tools.ts、src/Tool.ts。
- 目标：理解工具定义、工具列表构建、按环境和特性开关过滤、权限上下文传递。
- 练习：列出 getAllBaseTools 的设计原则（至少5条）。

### Day 13：工具执行链
- 阅读文件：src/services/tools/toolOrchestration.js、src/services/tools/StreamingToolExecutor.js（按需定位）。
- 目标：掌握工具调度、执行结果格式、异常处理方式。
- 微实验：跟踪一个常见工具（如文件读写工具）的请求-响应路径。

### Day 14：第2周复盘
- 任务：输出“核心引擎设计说明”文档。
- 必含内容：
  - Query loop 状态机。
  - QueryEngine 与 query 的分层关系。
  - 工具上下文 ToolUseContext 的核心字段与作用。
  - 至少2个你认为高价值的鲁棒性机制。

---

## 第3周：系统能力层

### Day 15：AppState 与状态组织
- 阅读文件：src/state/AppStateStore.ts、src/state/store.ts、src/state/onChangeAppState.ts。
- 目标：理解全局状态结构（尤其是任务、MCP、插件、Bridge、权限相关字段）。
- 练习：画状态分区图，标注“UI态 / 会话态 / 基础设施态”。

### Day 16：任务系统
- 阅读文件：src/Task.ts、src/tasks.ts、src/tasks/ 下关键实现（按需）。
- 目标：理解任务生命周期（pending/running/completed/failed/killed）与输出文件策略。
- 练习：总结任务系统为何对 Agent 场景重要。

### Day 17：权限模型
- 阅读文件：src/types/permissions.js、src/utils/permissions/permissionSetup.js、src/utils/permissions/permissions.js。
- 目标：理解 allow/deny/ask、auto mode、安全规则剥离策略。
- 微实验：选一个工具推演 permission check 流程。

### Day 18：Bridge 模式概览
- 阅读文件：src/bridge/bridgeMain.ts、src/bridge/types.ts、src/bridge/workSecret.ts。
- 目标：理解远程桥接的会话生命周期、心跳、重连、session/work 的关系。
- 练习：画“bridge poll loop + session spawner”时序图。

### Day 19：Bridge 细节与容错
- 阅读文件：src/bridge/replBridge.ts、src/bridge/replBridgeTransport.ts、src/bridge/reconnect 相关（按搜索定位）。
- 目标：理解连接状态机与重试退避策略。
- 练习：列出“连接失败时系统如何自愈”的步骤。

### Day 20：命令实现样例深挖
- 阅读文件：src/commands/review.ts、src/commands/security-review.ts、src/commands/commit.ts（任选2-3个重点命令）。
- 目标：学习命令如何组织提示、调用能力、处理结果。
- 练习：抽象“一个高质量命令实现模板”。

### Day 21：第3周复盘
- 任务：写“系统能力层架构报告”。
- 必含：状态、任务、权限、Bridge、命令五块如何协同。

---

## 第4周：扩展能力与综合实战

### Day 22：插件系统
- 阅读文件：src/plugins/、src/utils/plugins/pluginLoader.js、src/utils/plugins/loadPluginCommands.js。
- 目标：理解插件发现、加载、命令注入、错误处理。
- 练习：写“插件生命周期四阶段”。

### Day 23：技能系统
- 阅读文件：src/skills/、src/skills/loadSkillsDir.js、src/skills/bundled/index.js。
- 目标：理解技能加载、缓存、动态触发与命令集成。
- 练习：描述插件与技能在扩展模型中的差异。

### Day 24：MCP 能力层
- 阅读文件：src/services/mcp/ 目录（client、config、types、utils 重点）。
- 目标：理解工具/资源/命令如何通过 MCP 扩展。
- 练习：画 MCP 在 ToolUseContext 中的数据注入路径。

### Day 25：可观测性与成本
- 阅读文件：src/cost-tracker.ts、src/costHook.ts、src/services/analytics/、src/utils/startupProfiler.js。
- 目标：理解成本统计、性能埋点、事件上报边界。
- 练习：列出“性能敏感代码写法”在本项目中的体现（至少5条）。

### Day 26：可靠性工程专题
- 阅读文件：错误处理与重试相关模块（src/services/api/errors.js、withRetry.js、query恢复分支）。
- 目标：提炼统一错误分层：用户可见错误、可重试错误、致命错误。
- 练习：制作“错误分类与处理策略表”。

### Day 27：实战一（新增一个简单命令）
- 建议任务：新增一个只读命令（例如输出当前会话状态摘要）。
- 涉及：命令注册、参数解析、输出格式。
- 验收：命令可执行、无类型报错、不会破坏现有行为。

### Day 28：实战二（新增一个简单工具或包装已有工具）
- 建议任务：封装一个安全只读工具，接入工具清单。
- 涉及：Tool 定义、isEnabled、权限策略、结果格式。
- 验收：可被引擎调用，并在对话中产出预期结果。

### Day 29：实战三（端到端调试）
- 任务：从用户输入开始，跟踪到工具调用、再到模型回复，记录全链路日志。
- 验收：你可以独立解释一次完整会话中每个关键模块的作用。

### Day 30：最终复盘与输出
- 输出1：完整架构文档（不少于3000字）。
- 输出2：一页“新人上手导读图”。
- 输出3：你自己的二次开发建议清单（不少于10条）。
- 最终自测：
  - 我能否在10分钟内讲清项目主设计思路？
  - 我能否在30分钟内定位一个bug的责任模块？
  - 我能否安全地扩展一个命令或工具而不破坏系统？

---

## 每日模板（建议复制为 dayXX-notes.md）
- 今日目标：
- 今日阅读文件：
- 关键流程图：
- 关键类型/函数：
- 我今天理解最深的一点：
- 仍未理解的问题：
- 明天要验证的假设：

## 学习注意事项
- 不要一上来深挖所有子目录，先抓主链路，再回填细节。
- 不要只看类型定义，要结合调用点看真实执行路径。
- 每周至少一次“脱稿复述”，检验是否真的理解。
- 实战改动要小步快跑，优先做只读能力，避免引入副作用。

## 你完成本计划后应具备的能力
- 能从源码层解释该项目的核心架构与设计权衡。
- 能定位大多数功能所在模块并快速导航代码。
- 能做小规模定制开发，并具备基本回归验证能力。

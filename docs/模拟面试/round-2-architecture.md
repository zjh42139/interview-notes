---
title: 二面：架构设计
description: 项目架构设计 + 性能优化实战 + 方案设计题，60 分钟全流程脚本
category: 模拟面试
type: interview
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-10
updated: 2026-07-17
reviewed: null
tags:
  - 架构设计
  - 性能优化
  - 方案设计
  - 模拟面试
---

# 二面：架构设计模拟面试（60 分钟）

## 面试整体说明

**面试定位**：二面的核心是判断候选人是否有架构思维——能否从"功能实现"提升到"系统设计"。这一轮和普通二面（项目深挖）互补：项目面考察你"做了什么"，架构面考察你"怎么想"。

**面试时长**：60 分钟，分为 4 个阶段。

**评分维度**：

| 维度 | 权重 | 说明 |
|------|------|------|
| 架构思维 | 35% | 能讲出设计的为什么，而不只是做了什么 |
| 性能优化 | 25% | 有量化指标、有分析工具、有持续监控意识 |
| 方案设计 | 25% | 面对开放问题能给出可落地的技术方案 |
| 技术视野 | 15% | 了解主流方案、了解 tradeoff、不盲目追新 |

**评级标准**：

| 评级 | 总分 | 典型表现 |
|------|------|----------|
| S | 90+ | 方案设计有量化指标、有降级策略、有技术选型的深层权衡 |
| A | 80-89 | 架构清晰，能回答大部分追问，方案设计合理 |
| B | 65-79 | 能描述结构但讲不清为什么，追问时出现卡顿 |
| C | <65 | 只讲功能、不讲架构，方案设计无从下手 |

---

## 第一阶段：项目架构介绍（0-12 分钟，2 题）

### 环节目标

通过项目分层和组件设计两道题，快速判断候选人是否有架构层面的思考习惯。这一阶段的核心信号是：候选人能否**主动**讲出设计决策的"为什么"，而不是停留在"目录怎么放"。

**面试官核心判断**：
- 讲 "目录结构" = 执行者思维；讲 "分层原则 + 依赖方向" = 设计者思维
- 能画出层级关系图（哪怕口述）的候选人，大概率有架构意识
- 注意候选人是否使用"我们当时考虑到……所以选择了……"这种因果句式——主动提因果 = 有决策参与

---

### 第 1 题：项目分层设计

**面试官话术**："介绍一下你们项目的整体架构——不是功能模块，是代码层面的分层设计。"

**内心 OS**：这个问题的潜台词是"你有没有想过代码为什么要这样组织"。回答"我们的目录是 pages/components/utils"是不够的——那是目录结构，不是架构设计。

**信号识别**：
- **S 级信号**：主动讲依赖方向（"视图层不能直接引数据层"）、讲分层带来的收益（"换 UI 框架只需要改视图层"）、讲跨层调用的约束机制（"通过 composables 暴露接口，组件不能跳过 composable 直接调 API"）
- **A 级信号**：能清晰画出三层架构，每层职责明确，能回答"为什么分三层"
- **B 级信号**：按功能模块描述（"我们有用户模块、订单模块……"），需要引导才能讲出层级关系
- **C 级信号**：只按目录描述（pages/components/utils），无法抽象到分层

**考点**：分层思想 + 依赖方向 + 设计原则

**预期回答**：
- **初级**：按功能分目录——pages/components/store/api。描述停留在"文件放在哪里"，没有抽象出层级概念。可能会说"utils 里放工具函数、components 里放组件"——这是分类，不是分层。

- **中级**：三层架构——视图层（pages/components）、逻辑层（composables/hooks/store）、数据层（api/services/utils）。依赖方向：视图 → 逻辑 → 数据，不允许反向依赖。能解释为什么要控制依赖方向——"如果数据层引用了视图层的类型，换 UI 框架时数据层也得改，违反了依赖倒置原则"。

  典型的中级回答示例：
  > "我们把项目分成了三层。最上层是视图层，包括页面和组件，只负责渲染和事件绑定。中间是逻辑层，用 Pinia store 和 composables 管理业务状态和流程编排。最底层是数据层，封装了 axios 实例、API 函数和缓存策略。依赖方向是单向的：视图层只能调用逻辑层，逻辑层只能调用数据层。数据层完全不知道视图的存在。"

- **高级**：能讲出每层的职责边界和约束——视图层只做渲染和事件绑定，逻辑层做状态管理和业务编排，数据层做请求封装和缓存策略。跨层调用有明确的接口（如 composables 暴露响应式状态给视图，但视图不能直接调 API）。

  高级回答会额外覆盖：
  1. **边界约束的具体实现**：如何防止视图层绕过逻辑层直接调 API？——通过 ESLint 规则（`no-restricted-imports`）禁止 pages/components 直接 import API 模块，或通过架构测试（如 dependency-cruiser）在 CI 中检查。
  2. **跨层通信的接口规范**：逻辑层只暴露 composables/store 给视图，不暴露内部的工具函数。数据层只暴露 API 函数给逻辑层，不暴露 axios 实例。
  3. **分层收益的量化**：换 UI 库时只需改视图层（我们当时从 Element Plus 1.x 升到 2.x，因为业务逻辑都在逻辑层，改动范围被精确控制在视图层，工作量减少了约 60%）。

**追问阶梯**：
1. "为什么不允许视图直接调 API？" → 视图层直接调 API → 业务逻辑散落在组件里 → 复用性差、测试难。通过逻辑层抽象后，同一套逻辑可以在多个组件中复用。进一步：如果有 3 个页面都需要获取用户列表并做相同的过滤逻辑，直接在组件里调 API 意味着同样的过滤代码写了 3 遍——一旦逻辑变了，3 个地方都要改。抽到逻辑层 = 改一处生效。

2. "如果有一个新需求，你怎么判断代码放哪层？" → 涉及 UI = 视图层，涉及数据获取/处理 = 逻辑层，涉及网络请求 = 数据层。更精细的判断标准：**变化的原因相同 = 放同一层**。如果某段代码会因为 UI 调整而变化（如按钮文案、布局），放视图层；会因为业务规则调整而变化（如"满 100 减 20"的规则），放逻辑层；会因为后端接口变化而变化（如字段名调整），放数据层。

3. "你们的逻辑层如果变得很大，怎么继续分层？"（高级追问）→ 当逻辑层膨胀到一定规模时，需要引入**领域分层**：按业务领域拆分 store/composable（如 userStore、orderStore、productStore），每个领域内部再按职责拆分（如 useUserList、useUserAuth、useUserProfile）。更进一步可以引入**应用层**（Application Layer）——编排多个领域逻辑的"用例"层，比如"下单"这个用例会同时涉及用户领域、订单领域、商品领域，由应用层的 composable 来协调。

**评分标准**：

| 分数 | 表现 |
|------|------|
| 90-100 | 主动讲依赖方向 + 边界约束 + 分层收益量化。能画出层级图，能回答"如何保证依赖方向不被破坏" |
| 75-89 | 能清晰描述三层架构和每层职责，依赖方向正确，追问时能给出合理判断标准 |
| 60-74 | 按功能模块描述，需要引导才能讲出层级。依赖方向模糊（"有时候组件也会直接调 API"） |
| <60 | 只能讲目录结构，无分层概念，追问"为什么这样组织"时回答"团队规定的"或"大家都这样" |

---

### 第 2 题：组件设计原则

**面试官话术**："你们项目的组件是怎么拆的？有什么原则或标准吗？"

**内心 OS**：组件拆分是日常开发中频率最高的设计决策，但多数人是凭感觉拆的。有架构意识的候选人会有一套**可复述的决策标准**——不是"觉得大了就拆"，而是"超过 X 行/职责超过 Y 个/变化频率不同"。

**信号识别**：
- **S 级信号**：有明确的拆分决策树（如"先看职责数量 → 再看代码行数 → 最后看复用预期"），能讲出反面案例（"这个组件我们当时没拆，后来付出了什么代价"），提到组件的可测试性作为拆分标准
- **A 级信号**：展示组件 vs 容器组件的区分，有一定的拆分标准（行数、职责数），能举出项目中的实际案例
- **B 级信号**：知道通用组件和业务组件的区别，但拆分标准模糊（"看情况""感觉大了就拆"）
- **C 级信号**：只有一个巨大的 components 目录，无法区分组件类型

**考点**：组件拆分原则 + 复用意识

**预期回答**：
- **初级**：通用组件（Button/Table/Dialog）+ 业务组件（UserForm/OrderList）。只做了分类，没有拆分标准。回答通常是"我们把能复用的提成通用组件"——但什么是"能复用"？判断标准是什么？说不清。

- **中级**：按职责拆分——展示组件（只渲染 props + emit events）vs 容器组件（管理状态 + 调用 API）。展示组件可复用、可测试。能讲出"展示组件不应该知道数据从哪来——它只关心 props 长什么样"。会提到"展示组件因为不依赖 Pinia 和 API，可以在 Storybook 里独立开发和测试"。

- **高级**：拆分决策标准——单组件 < 300 行（超过就拆）、一个组件只做一件事、变化频率不同的部分分开（常变的和稳定的分开）、可复用的部分提为通用组件。反面案例：我们之前有一个 800 行的表单组件——包含了表单校验、提交、错误处理、权限控制。后来拆成了 FormContainer（逻辑）+ FormFields（展示）+ useFormValidation（校验 composable）+ usePermission（权限 composable），每个部分独立可测。

  高级回答会额外覆盖：
  1. **拆分时机**：不是一开始就拆——先用一个组件实现，当出现以下信号时拆分：(a) 组件超过 300 行，(b) 需要为其中某部分写单独测试但很难 mock，(c) 团队多人同时修改同一组件频繁冲突，(d) 其中一部分需要在另一处复用。
  2. **拆分粒度**：过细的拆分比不拆分更糟糕——10 个 20 行的组件比 1 个 200 行的组件更难维护，因为你需要在 10 个文件间跳转才能理解一个完整流程。拆分的最佳粒度是：**一个组件做的事可以用一句话描述，而不需要用"和"连接**。
  3. **测试驱动拆分**：如果一个组件很难写单元测试，通常意味着它该拆了——职责太多导致 mock 成本极高。好的拆分让每个部分都可以用极少的 mock 独立测试。

**追问阶梯**：
1. "通用组件和业务组件的边界在哪？" → 通用组件不引入业务类型、不依赖 Pinia、不直接调 API——纯 props/emit。业务组件可以依赖一切。更精确的判断：**去掉业务语境后，这个组件还能不能用？** 能 = 通用组件，不能 = 业务组件。举例：`<UserSelect>` 是业务组件（依赖用户数据类型和用户 API），`<SearchableSelect>` 是通用组件（只是带搜索的下拉框）。

2. "什么场景下不做拆分更合理？" → 组件被复用次数 < 2 时不需要提前拆分——YAGNI（You Ain't Gonna Need It）。此外：逻辑高度内聚的组件不要强行拆（拆分后反而需要在多个文件间传递大量 props/events——这叫"拆分税"）；一次性页面的子组件如果拆分后只有该页面使用，不如内联在一起（减少文件跳转成本）。

3. "你怎么看待 renderless 组件（无渲染组件）？什么场景适合用？"（高级追问）→ Renderless 组件只提供逻辑、不渲染 DOM，通过 scoped slot 把状态和方法暴露给父组件决定怎么渲染。适合场景：(a) 同一套交互逻辑有多种视觉呈现（如"下拉选择"和"标签选择"底层搜索逻辑一样但 UI 完全不同），(b) 需要复用复杂交互但 UI 高度定制化的场景（如拖拽排序——逻辑很复杂但每个地方的拖拽 UI 都不一样）。不适合场景：逻辑简单或 UI 固定的场景——为了"高级"而用 renderless 是过度设计。

**评分标准**：

| 分数 | 表现 |
|------|------|
| 90-100 | 有完整的拆分决策树（职责→行数→复用→可测试性），能讲反面案例，提到 renderless 组件等进阶模式 |
| 75-89 | 展示/容器组件区分清晰，拆分标准明确（行数/职责），有项目实际案例支撑 |
| 60-74 | 知道通用和业务组件的区别，但拆分标准模糊，案例停留在"我们把复用的提出来了" |
| <60 | 无拆分标准，一个巨大组件目录，无法区分组件类型和职责 |

---

## 第二阶段：性能优化实战（12-28 分钟，2 题）

### 环节目标

这一阶段从"架构设计"切换到"工程落地"，考察候选人是否把性能优化做成了一套**可持续的工程实践**，而非一次性运动。关键信号：有量化、有工具、有监控闭环。

**面试官核心判断**：
- 只列优化手段 = 背八股文；能讲"发现 → 分析 → 优化 → 验证"完整闭环 = 真做过
- 没有优化前后数据的候选人，大概率只是"参与过"而不是"主导过"
- 主动提 Lighthouse CI / PerformanceObserver / 长期监控 = 有工程化意识，额外加分

---

### 第 3 题：性能优化实践与量化

**面试官话术**："说说你在项目中做过的性能优化，最好有具体的优化前后数据对比。"

**内心 OS**：这道题的区分度极高——真做过的候选人会自然说出"优化前 LCP 是 X，优化后降到 Y"，而只是了解概念的候选人会说"我们做了路由懒加载和图片懒加载"然后停在那里等追问。听候选人第一个提到的优化手段也很关键：张口就是"代码分割"的可能是看了优化文章，张口就是"我们通过 Lighthouse 跑分发现 LCP 3.2s，然后用 Webpack Bundle Analyzer 定位到最大的 chunk 是……"的，是真干过的。

**信号识别**：
- **S 级信号**：完整优化案例 + 数据（优化前后对比、测试环境说明、多轮迭代）+ 优化优先级逻辑 + 长期监控机制。主动提到"我们先解决最大的瓶颈（2.4MB 的 vendor chunk 占加载时间的 60%），而不是同时做 10 个优化——那样看不出每个优化的独立效果"
- **A 级信号**：有完整的优化流程和前后数据，但优化手段偏常规（路由懒加载、图片优化、gzip）
- **B 级信号**：列举了优化手段但没有数据支撑，追问"效果如何"时只能回答"快了"或"感觉快了"
- **C 级信号**：只知道路由懒加载——八股文痕迹明显

**考点**：优化方法论 + 量化能力

**预期回答**：
- **初级**：列举优化手段——路由懒加载、图片懒加载、代码分割。停留在"做了什么"层面，没有"为什么选这个"和"效果如何"。可能在回答中用"我们可以用……"而不是"我们用了……"——暗示并未实际操作过。

- **中级**：完整的优化流程——发现问题（Lighthouse/Performance）→ 分析根因（打包分析 treemap）→ 逐个优化 → 量化验证。有具体数据。能讲出分析工具的作用：Lighthouse 告诉你"哪里慢"，Bundle Analyzer 告诉你"为什么大"，Network 面板告诉你"哪个请求是瓶颈"。

- **高级**：完整案例 + 数据 + 监控。优化手段有优先级逻辑（先解决最大的瓶颈，而不是四处撒网）。打包 2.4MB → 400KB，LCP 3.2s → 1.1s。

  高级回答的完整展开：
  > "优化前我们通过 Lighthouse CI 在 CI 管道中跑了 5 次，取中位数：LCP 3.2s、FCP 1.8s、Speed Index 2.9s、Total Blocking Time 420ms。分析发现最大的瓶颈是 vendor chunk 2.4MB——包含了 Element Plus、ECharts、moment.js。我们做了以下几步：
  >
  > **第一轮（解决最大瓶颈）**：(1) moment.js 换成 dayjs——节省 ~200KB gzipped（moment 包含大量 locale 数据）；(2) Element Plus 按需引入——之前是全量引入，改为 unplugin-vue-components 按需导入，节省 ~500KB；(3) ECharts 按需引入——只引入项目中实际使用的折线图、柱状图、饼图，节省 ~300KB。第一轮后 vendor chunk 降到 1.4MB，LCP 降到 2.0s。
  >
  > **第二轮（精细化）**：(1) 路由懒加载——之前所有页面打包在同一个 chunk，改为动态 import 后每个页面独立 chunk，首屏只加载需要的页面代码；(2) 提取 CSS——把 Element Plus 的 CSS 单独提取，避免 JS 加载阻塞 CSS 渲染；(3) preload 关键资源——首屏的字体文件和核心 CSS 用 `<link rel='preload'>` 提前加载。第二轮后 LCP 降到 1.3s。
  >
  > **第三轮（长尾优化）**：(1) 图片——之前用 PNG，改为 WebP + 响应式图片（`<img srcset>`），首屏图片体积从 800KB 降到 120KB；(2) 字体子集化——之前加载完整中文字体包（8MB），改为只包含项目中用到的字符，降到 40KB；(3) Service Worker——预缓存关键资源，二次访问 LCP < 500ms。第三轮后 LCP 降到 1.1s。
  >
  > **验证方法**：每次优化后在 Chrome DevTools 的 Network 面板限速（Fast 3G），打开 Incognito 窗口跑 5 次 Lighthouse，取中位数。同时在生产环境通过 Web Vitals API 采集真实用户的 LCP/FID/CLS 数据，确认优化在真实用户设备上有效。"

**追问阶梯**：
1. "怎么确定优化效果是真实的？" → 同环境对比（都用生产构建、都用 Incognito、多次测试取中位数）。Lighthouse 有波动——单次结果不可靠。进一步：(a) 关闭所有 Chrome 插件（插件会影响 Performance 数据），(b) 用 Lighthouse CI 在 CI 环境中跑（环境更可控），(c) 生产环境通过 RUM（Real User Monitoring）验证——Lighthouse 是实验数据，真实用户的 Web Vitals 才是最终验证。

2. "如果进一步优化，你会做什么？" → Service Worker 预缓存 → 二次访问 0 网络请求；SSR/SSG → 更快首屏但增加运维成本；CDN 边缘缓存。更系统的长尾优化路径：(a) 资源预加载策略——对用户高概率访问的下一页做 prefetch；(b) HTTP/2 Server Push（如果服务器支持）；(c) 骨架屏/loading 策略——不是技术优化，但能改善感知性能（FCP 不变但用户"感觉"更快）；(d) 关键 CSS 内联——把首屏需要的 CSS 直接内联到 HTML 中，避免额外请求。

3. "如果你接手一个新项目，怎么快速定位性能瓶颈？"（高级追问）→ 三步走：(a) 跑 Lighthouse 看宏观指标（LCP/FCP/TBT/CLS）和 Opportunities 建议；(b) 用 Webpack Bundle Analyzer / rollup-plugin-visualizer 看打包体积分布——哪个 chunk 最大、哪些依赖重复打包；(c) 用 Chrome DevTools Performance 面板录制页面加载过程，看火焰图——主线程在做什么、是否有长任务（Long Task > 50ms）、渲染瓶颈在哪。三步走完后基本能把瓶颈按影响大小排出来。

**评分标准**：

| 分数 | 表现 |
|------|------|
| 90-100 | 完整优化案例 + 多轮迭代数据 + 优化优先级逻辑 + 生产环境 RUM 验证。主动提到"先解决最大瓶颈"的方法论 |
| 75-89 | 有完整的发现问题→分析→优化→验证流程，有前后数据对比，优化手段覆盖合理 |
| 60-74 | 列举了优化手段但数据缺失，优化流程不完整（缺少分析或验证环节） |
| <60 | 只会列举优化手段，像在背八股文，无个人实践痕迹 |

---

### 第 4 题：缓存策略设计

**面试官话术**："如果你负责设计项目的缓存体系，你会怎么做？不同资源类型怎么对待？"

**内心 OS**：缓存是性能优化的"基础设施"。大多数候选人知道"静态资源加 hash"，但很少人能系统性地从多个层次思考缓存。真正的区分点在于：能否为不同资源类型制定不同的缓存策略，以及能否解释每层缓存的适用场景和限制。

**信号识别**：
- **S 级信号**：画出完整的缓存层次金字塔（SW → Memory → HTTP → CDN），每层有适用场景和失效策略，能讲出缓存更新时的一致性保障机制
- **A 级信号**：能区分不同资源类型的缓存策略（HTML no-cache / 静态资源 immutable / API 短缓存），对 SW 缓存有一定了解
- **B 级信号**：知道强缓存和协商缓存，但策略单一（所有静态资源设 max-age=31536000）
- **C 级信号**：只知道"加 hash 文件名"

**考点**：缓存层次思维

**预期回答**：
- **初级**：静态资源设长缓存，HTML 不缓存。停留在"给文件名加 hash + max-age 设很大"这种单一策略。

- **中级**：四层缓存——Service Worker（应用层）→ Memory Cache（内存）→ HTTP 缓存（磁盘）→ CDN 缓存（边缘节点）。各层分工明确。能讲出：(a) Service Worker 缓存可以完全控制缓存逻辑（如"离线也能访问"），但只对 HTTPS 和已访问过的页面生效；(b) Memory Cache 是浏览器自动管理的，无法主动控制，适合当前页面内重复使用的资源；(c) HTTP 缓存（强缓存/协商缓存）是最通用的缓存层，通过 Cache-Control 响应头控制；(d) CDN 缓存在边缘节点，减少源站压力和用户地理延迟。

- **高级**：缓存决策树——资源变化频率决定 max-age，可版本化决定是否用 hash 文件名。关键原则：HTML no-cache（更新入口），静态资源 hash + immutable（永久缓存），API GET 短缓存（减轻重复请求压力）。

  高级回答的完整展开：

  **缓存决策树**（逐级判断）：
  ```
  第一步：这个资源能不能用内容 hash 做版本化？
    ├── 能（JS/CSS/字体/图片）→ 文件名加 hash + Cache-Control: max-age=31536000, immutable
    │   - hash 变了 = 新文件 = 新 URL = 浏览器自动获取新版本，旧文件逐渐淘汰
    │   - immutable 告诉浏览器"这个资源永远不会变"，跳过协商缓存的 304 请求
    └── 不能（HTML / API 响应）
        ├── HTML 入口文件 → Cache-Control: no-cache
        │   - no-cache 不等于"不缓存"——浏览器每次都去服务器验证（If-None-Match/If-Modified-Since）
        │   - 内容没变返回 304（不传输 body），内容变了返回 200 + 新的 link/script 标签指向新 hash 文件
        └── API GET 请求
            ├── 变化频率高的数据（实时数据）→ no-store（完全不缓存）
            ├── 变化频率低的数据（字典数据、配置）→ max-age=300 + stale-while-revalidate=600
            │   - stale-while-revalidate：缓存过期后立即返回旧数据，同时后台请求新数据更新缓存
            └── 用户相关数据 → Cache-Control: private, max-age=60
                - private 防止 CDN 缓存用户敏感数据
  ```

  **关键细节**：
  1. **协商缓存的选择**：ETag（强，基于内容 hash） > Last-Modified（弱，基于时间，精度到秒）。两者都设——ETag 优先匹配，不匹配再用 Last-Modified。
  2. **缓存层次协作**：请求一个 JS 文件时的完整链路——(1) 检查 SW 缓存（命中直接返回，不发起网络请求），(2) 发起网络请求 → CDN 边缘节点检查缓存（命中返回，不访问源站），(3) 浏览器检查 Memory Cache（命中返回），(4) 浏览器检查 HTTP 磁盘缓存（强缓存命中直接返回，协商缓存命中返回 304），(5) 全部未命中 → 从服务器获取。
  3. **构建工具侧的配合**：Vite/Webpack 配置 `output.filename: '[name].[contenthash:8].js'`——只有内容变了 hash 才变。CSS 文件也需要 contenthash，因为改了 CSS 不影响 JS 的 hash。

**追问阶梯**：
1. "缓存更新后用户拿到的还是旧版本怎么办？" → HTML no-cache 保证入口最新 → 旧 hash 文件等缓存过期自然淘汰 → 紧急情况 CDN purge。展开：这是**非原子部署**的经典问题——用户打开页面时（加载了旧 HTML 引用的旧 hash JS），此时你部署了新版本（替换了 HTML + 新 hash JS）。用户跳转页面时：新 HTML no-cache 会拿到最新版本，旧 hash JS 文件如果还在服务器上（没被清理）且用户缓存里有，会继续用旧的。解决方案：(a) 保留旧 hash 文件至少 7 天（或直到缓存期过），(b) 关键更新（如安全修复）主动 CDN purge，(c) 在 HTML 中加 `<meta>` 或 Service Worker 做版本检测，发现版本不一致提示用户刷新。

2. "Service Worker 缓存和 HTTP 缓存冲突吗？" → 不冲突——SW 拦截在 HTTP 缓存之前。SW 缓存命中直接返回，不经过 HTTP 缓存层。进一步：SW 可以主动选择哪些请求走网络、哪些走缓存（网络优先 / 缓存优先 / 网络+缓存竞速），这给了前端完全控制缓存策略的能力。但 SW 的代价是复杂度——更新 SW 自身需要等所有旧 SW 控制的标签页关闭（或调用 `skipWaiting()`），不当的 SW 策略可能让用户"困"在旧版本。

3. "你们项目里实际上线了哪几层缓存？遇到了什么问题？"（高级追问）→ 考察候选人是否真的实践过。常见的实践问题：(a) CDN 缓存刷新延迟——发布后部分地区的用户拿到新 HTML 但 CDN 还没更新 CSS/JS（因为 CDN 回源有延迟），导致样式错乱——解决方案是 CSS/JS 用 contenthash 文件名（URL 变了，不存在"旧缓存"问题）；(b) 协商缓存的 ETag 在不同服务器间不一致（跨节点部署时）——同一文件在两台 Nginx 上生成的 ETag 不同，导致 304 判断失败——解决方案是配置 Nginx 使用文件大小+修改时间生成 ETag，确保一致性。

**评分标准**：

| 分数 | 表现 |
|------|------|
| 90-100 | 完整缓存金字塔 + 决策树 + 每种资源类型的具体策略 + 实践中的坑（如 CDN 多节点一致性问题、SW 更新策略） |
| 75-89 | 四层缓存清晰，不同资源类型策略明确，协商缓存机制理解正确 |
| 60-74 | 知道强缓存/协商缓存，但策略单一，对 SW 和 CDN 缓存了解有限 |
| <60 | 只停留在"加 hash + 长缓存"，不了解层次化缓存体系 |

---

## 第三阶段：方案设计题（28-45 分钟，1 大题）

### 环节目标

这是本轮面试的核心——从零设计一个前端监控系统。17 分钟的时间，考察候选人的系统设计能力：能否把一个大问题拆成可实现的模块，并且每个模块都考虑到了关键的工程细节。

**面试官核心判断**：
- 回答结构：上来就写代码 = 缺少系统思维；先画出数据流（采集→上报→存储→告警→展示）= 有架构意识
- 完整性不是最重要的（17 分钟不可能面面俱到），但关键路径必须清晰：**错误怎么捕获 → 数据怎么上报 → 怎么避免影响业务**
- 能主动提 SourceMap、采样率、数据清洗、SDK 体积控制的，是有实际经验的

---

### 第 5 题：设计一个前端监控系统

**面试官话术**："假设你要从零设计一个前端监控系统，包括错误监控、性能监控和用户行为追踪。你会怎么设计？"

**内心 OS**：这是经典的方案设计题。考察的完整度——数据采集→上报→存储→告警→展示。不要求面面俱到，但要有一条清晰的链路。

**高级信号**（这些是区分 S 级的关键）：
- 主动提"首先要定义数据模型——错误事件、性能事件、行为事件的 schema 是什么样的"
- 主动提 SDK 的体积控制——"监控 SDK 不能成为性能负担，核心代码控制在 15KB gzipped 以内"
- 主动提 SourceMap 的安全性问题——"SourceMap 不能公开上传，需要在 CI 中自动上传到监控服务的内网接口，且上传后的 SourceMap 不能通过 URL 直接访问"
- 主动提降级策略——"如果监控服务挂了或被 AdBlock 拦截，不能影响业务功能——所有上报用 try-catch 包裹"
- 主动提告警策略——"不是所有错误都告警，需要设定阈值（如 5 分钟内同错误超过 100 次才告警），防止告警疲劳"

**信号识别**：
- **S 级信号**：有完整的数据流图 + 每种事件的 schema 定义 + 上报策略（采样/合并/降级）+ SourceMap 自动上传方案 + 告警策略和阈值 + SDK 架构设计（插件化）
- **A 级信号**：覆盖了错误、性能、行为三类监控，上报策略合理，有 SourceMap 的意识
- **B 级信号**：能讲出核心的错误捕获和性能采集方式，但上报策略简单（"每出错就上报"），缺少数据清洗和去重
- **C 级信号**：只讲 `window.onerror` 和 `sendBeacon`——停留在几个 API 层面，没有系统设计

**考点**：系统设计 + 数据采集 + 上报策略

**预期回答结构**：

---

#### 一、数据流全景（1-2 分钟）

在写任何代码前，先画出整体数据流：

```
┌─────────────────────────────────────────────────────────┐
│                     用户浏览器                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐   │
│  │ 错误监控  │  │ 性能监控  │  │   用户行为追踪       │   │
│  │ - JS错误 │  │ - WebVitals│  │ - 页面浏览(PV)      │   │
│  │ - 资源错误│  │ - 自定义   │  │ - 点击/输入         │   │
│  │ - Promise│  │   指标    │  │ - 路由跳转           │   │
│  │ - 接口错误│  │ - API耗时 │  │ - 错误前操作快照     │   │
│  └────┬─────┘  └────┬─────┘  └──────────┬───────────┘   │
│       │              │                   │               │
│       └──────────────┼───────────────────┘               │
│                      ▼                                   │
│            ┌─────────────────┐                          │
│            │   上报中心       │                          │
│            │ · 采样控制      │                          │
│            │ · 数据清洗/去重  │                          │
│            │ · 批量合并      │                          │
│            │ · 失败重试/降级  │                          │
│            └────────┬────────┘                          │
│                     │ sendBeacon / fetch / img beacon    │
└─────────────────────┼───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   监控服务端                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ 数据接入层│─▶│ 数据处理层│─▶│ 数据存储层│              │
│  │ · 接收   │  │ · SourceMap│  │ · 时序DB │              │
│  │ · 校验   │  │   反解    │  │ · 日志存储│              │
│  │ · 限流   │  │ · 聚合统计 │  │ · 原始数据│              │
│  └──────────┘  └─────┬────┘  └──────────┘              │
│                      │                                   │
│          ┌───────────┼───────────┐                      │
│          ▼           ▼           ▼                      │
│    ┌─────────┐ ┌─────────┐ ┌─────────┐                 │
│    │  告警   │ │  大盘   │ │ 错误详情│                 │
│    │ 钉钉/邮件│ │ Grafana │ │ 堆栈+录屏│                 │
│    └─────────┘ └─────────┘ └─────────┘                 │
└─────────────────────────────────────────────────────────┘
```

---

#### 二、错误监控（3-4 分钟）

**错误分类**：JS 运行时错误、Promise 未捕获异常、资源加载错误、接口错误、自定义错误（业务异常）。

**1. JS 运行时错误 + 资源加载错误**：

```javascript
// 全局 JS 错误
window.addEventListener('error', (e) => {
  report({ type: 'js_error', message: e.message, stack: e.error?.stack, filename: e.filename, line: e.lineno })
})
// Promise 未捕获异常
window.addEventListener('unhandledrejection', (e) => {
  report({ type: 'promise_error', reason: e.reason?.message || String(e.reason) })
})
// 资源加载错误（用捕获阶段——资源错误不冒泡）
window.addEventListener('error', (e) => {
  if (e.target !== window) report({ type: 'resource_error', src: e.target.src || e.target.href, tag: e.target.tagName })
}, true)
// 接口错误——封装 fetch/axios，拦截非 2xx/超时/网络错误
```

**2. 接口错误拦截（Axios 拦截器封装）**：

```javascript
// axios 响应拦截器
axios.interceptors.response.use(
  response => {
    // 业务错误码（如 { code: 1001, message: 'xxx' }）
    if (response.data.code !== 0) {
      report({
        type: 'api_error',
        api: response.config.url,
        method: response.config.method,
        status: response.status,
        bizCode: response.data.code,
        message: response.data.message,
        requestParams: response.config.params || response.config.data,
        duration: Date.now() - response.config.metadata?.startTime
      })
    }
    return response
  },
  error => {
    // 网络错误 / 超时 / CORS 错误 / 5xx
    report({
      type: 'api_error',
      api: error.config?.url,
      method: error.config?.method,
      status: error.response?.status || 0,
      errorType: error.code === 'ECONNABORTED' ? 'timeout' : 'network_error',
      message: error.message,
      duration: Date.now() - error.config?.metadata?.startTime
    })
    return Promise.reject(error)
  }
)
```

**3. 错误上下文信息**（帮助定位问题的关键）：

每次上报时附带：
- **用户信息**：userId（脱敏）、当前页面 URL、浏览器 User-Agent
- **环境信息**：构建版本号（`__APP_VERSION__`）、环境标识（prod/staging）
- **行为回溯**：错误发生前 10 步用户操作（点击、输入、路由跳转的快照），这是一个长度 10 的环形缓冲区，每条只记录 type + selector + timestamp + value（脱敏后），大约 2KB
- **breadcrumb**：类似 Sentry 的 breadcrumbs，记录关键路径（"进入页面 A" → "点击按钮 B" → "调用 API C" → "API 返回 500" → "报错"）

---

#### 三、性能监控（2-3 分钟）

**1. Web Vitals 核心指标**：

```javascript
// LCP / FID / CLS / INP
import { onLCP, onFID, onCLS, onINP } from 'web-vitals'
onLCP(metric => report({ type: 'web_vital', name: 'LCP', value: metric.value, rating: metric.rating }))
onFID(metric => report({ type: 'web_vital', name: 'FID', value: metric.value, rating: metric.rating }))
onCLS(metric => report({ type: 'web_vital', name: 'CLS', value: metric.value, rating: metric.rating }))
onINP(metric => report({ type: 'web_vital', name: 'INP', value: metric.value, rating: metric.rating }))
// 自定义——首屏时间、API 耗时分布、页面切换耗时
```

每个 Vitals 上报附带 `rating`（good/needs-improvement/poor），便于在监控大盘按评级聚合。

**2. 自定义性能指标**：

```javascript
// 首屏时间（方案：标记关键元素渲染完成的时间点）
// 方式一：在首屏最后一个关键元素的 onMounted 中打点
// 方式二：MutationObserver 监听 DOM 变化，当首屏元素全部渲染后记录
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.name === 'first-screen') {
      report({ type: 'custom_metric', name: 'first_screen_time', value: entry.startTime })
    }
  }
})
observer.observe({ type: 'mark', buffered: true })

// API 耗时分布——在 axios 拦截器中记录每个请求的 duration
// 页面切换耗时——router.beforeEach 打点开始，页面 onMounted 打点结束
```

**3. 页面加载阶段分解**（使用 Navigation Timing API）：

```javascript
const [navigation] = performance.getEntriesByType('navigation')
const timing = {
  dns: navigation.domainLookupEnd - navigation.domainLookupStart,       // DNS 解析
  tcp: navigation.connectEnd - navigation.connectStart,                  // TCP 连接
  ttfb: navigation.responseStart - navigation.requestStart,             // 首字节时间
  dom_parse: navigation.domContentLoadedEventEnd - navigation.domInteractive, // DOM 解析
  resource_load: navigation.loadEventEnd - navigation.domContentLoadedEventEnd, // 资源加载
  total: navigation.loadEventEnd - navigation.fetchStart                 // 总耗时
}
report({ type: 'navigation_timing', ...timing })
```

---

#### 四、上报策略（2-3 分钟）

这是 SDK 设计中最关键的工程细节——平衡数据的完整性和对业务性能的影响。

**1. 采样策略**：

```javascript
const SAMPLING_RULES = {
  error: 1.0,          // 错误 100% 上报——错误数据量相对小且价值极高
  performance: 0.1,    // 性能数据 10% 采样——量大但统计意义足够
  behavior: 0.05,      // 用户行为 5% 采样——量大且个体价值低，聚合分析即可
  api_slow: 1.0,       // 慢请求 100% 上报（超过 3s 的 API 请求）
  api_normal: 0.05     // 正常请求 5% 采样
}

function shouldReport(type) {
  const rate = SAMPLING_RULES[type] ?? 0.1
  return Math.random() < rate
}
```

**2. 上报方式选择**：

| 上报方式 | 适用场景 | 优点 | 缺点 |
|---------|---------|------|------|
| `navigator.sendBeacon()` | 页面关闭时、关键错误 | 不阻塞页面卸载，浏览器保证发送 | 只能 POST，数据量有限（64KB），无法自定义 headers |
| `fetch` + `keepalive: true` | 需要自定义 headers 的场景 | 灵活，支持自定义 headers 和更大数据量 | 部分浏览器不支持 keepalive |
| `<img>` beacon | 降级方案、跨域简单的场景 | 兼容性最好，天然跨域 | 只能 GET，URL 长度限制（~2KB） |
| 批量 `fetch` | 常规定时上报 | 合并请求减少连接开销 | 页面关闭时可能丢失最后一批数据 |

```javascript
// 页面关闭时的上报保障
const pendingReports = [] // 待上报队列

window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    // 页面隐藏/关闭——用 sendBeacon 紧急上报所有待发送数据
    if (pendingReports.length > 0) {
      navigator.sendBeacon('/api/monitor/batch', JSON.stringify(pendingReports))
      pendingReports.length = 0
    }
  }
})

// 也监听 pagehide（比 beforeunload 更可靠，移动端支持更好）
window.addEventListener('pagehide', () => {
  if (pendingReports.length > 0) {
    navigator.sendBeacon('/api/monitor/batch', JSON.stringify(pendingReports))
    pendingReports.length = 0
  }
})
```

**3. 批量上报 + 合并**：

```javascript
const REPORT_CONFIG = {
  maxBatchSize: 10,        // 最多合并 10 条
  maxBatchInterval: 5000,  // 最长等待 5 秒
  maxRetries: 3,           // 最多重试 3 次
  retryDelay: 1000         // 重试间隔 1 秒
}

let batch = []
let timer = null

function report(data) {
  batch.push({ ...data, timestamp: Date.now() })
  if (batch.length >= REPORT_CONFIG.maxBatchSize) {
    flush()
  } else if (!timer) {
    timer = setTimeout(flush, REPORT_CONFIG.maxBatchInterval)
  }
}

function flush() {
  if (batch.length === 0) return
  const payload = batch.splice(0)
  clearTimeout(timer)
  timer = null
  sendWithRetry(payload, REPORT_CONFIG.maxRetries)
}

function sendWithRetry(payload, retriesLeft) {
  fetch('/api/monitor/batch', {
    method: 'POST',
    body: JSON.stringify(payload),
    keepalive: true,
    headers: { 'Content-Type': 'application/json' }
  }).catch(() => {
    if (retriesLeft > 0) {
      // 指数退避重试
      setTimeout(() => sendWithRetry(payload, retriesLeft - 1),
        REPORT_CONFIG.retryDelay * Math.pow(2, REPORT_CONFIG.maxRetries - retriesLeft))
    }
    // retriesLeft === 0：丢弃，不阻塞后续上报
  })
}
```

**4. SDK 体积和性能控制**：

```javascript
// 所有数据采集使用异步 API，不阻塞主线程
// 方案一：requestIdleCallback——在浏览器空闲时处理数据序列化和本地存储
// 方案二：微任务（Promise.resolve().then()）——比宏任务更快，但要注意不要产生长微任务链
// 方案三：Web Worker——把数据序列化、压缩、去重放到 Worker 线程，主线程只做采集

// 上报使用独立域名（如 monitor.example.com），避免和业务请求抢占 HTTP/2 连接池
// SDK 体积控制：核心代码 < 15KB gzipped，按需加载插件（行为录屏、性能采集等）
```

**5. SDK 架构设计（插件化 + 生命周期）**：

SDK 本身的设计也需要体现架构思维——支持插拔、可扩展、按需加载。

```typescript
// SDK 核心架构：内核 + 插件体系
interface MonitorPlugin {
  name: string
  install(monitor: MonitorCore): void   // 插件安装
  uninstall?(): void                      // 插件卸载（可选）
}

class MonitorCore {
  private plugins: Map<string, MonitorPlugin> = new Map()
  private reporter: Reporter              // 上报器
  private options: MonitorOptions

  constructor(options: MonitorOptions) {
    this.options = options
    this.reporter = new Reporter(options.reportUrl, options.sampling)
  }

  // 注册插件
  use(plugin: MonitorPlugin) {
    if (this.plugins.has(plugin.name)) return
    this.plugins.set(plugin.name, plugin)
    plugin.install(this)
  }

  // 插件间通信：一个插件产生的数据可以被另一个插件消费
  // 例如：错误监控插件产生 error 事件 → 用户行为录屏插件消费 → 上报时附带错误前的操作录屏
  report(data: MonitorEvent) {
    this.reporter.report(data)
  }

  getOptions() { return this.options }
}

// 插件示例 1：错误监控插件
class ErrorMonitorPlugin implements MonitorPlugin {
  name = 'error-monitor'
  install(monitor: MonitorCore) {
    window.addEventListener('error', (e) => {
      monitor.report({ type: 'js_error', message: e.message, stack: e.error?.stack })
    })
    window.addEventListener('unhandledrejection', (e) => {
      monitor.report({ type: 'promise_error', reason: String(e.reason) })
    })
  }
}

// 插件示例 2：性能监控插件
class PerformanceMonitorPlugin implements MonitorPlugin {
  name = 'performance-monitor'
  install(monitor: MonitorCore) {
    const opts = monitor.getOptions()
    if (!opts.plugins?.performance?.enabled) return // 支持开关

    // 只在支持的浏览器上加载 web-vitals（动态 import，不增加不必要的体积）
    if ('PerformanceObserver' in window) {
      import('web-vitals').then(({ onLCP, onFID, onCLS, onINP }) => {
        onLCP(m => monitor.report({ type: 'web_vital', name: 'LCP', value: m.value }))
        onFID(m => monitor.report({ type: 'web_vital', name: 'FID', value: m.value }))
        onCLS(m => monitor.report({ type: 'web_vital', name: 'CLS', value: m.value }))
        onINP(m => monitor.report({ type: 'web_vital', name: 'INP', value: m.value }))
      })
    }
  }
}

// 插件示例 3：用户行为录屏插件（rrweb）
class RecordPlugin implements MonitorPlugin {
  name = 'record'
  private stopFn: (() => void) | null = null

  install(monitor: MonitorCore) {
    // 只记录错误发生前 30 秒的操作——不需要全量录屏
    // 使用 rrweb 的 record + 环形缓冲区
    import('rrweb').then(({ record }) => {
      const events: any[] = []
      this.stopFn = record({
        emit(event) {
          events.push(event)
          // 只保留最近 30 秒的事件（环形缓冲区）
          const now = Date.now()
          while (events.length > 0 && now - events[0].timestamp > 30000) {
            events.shift()
          }
          // 当有错误发生时，插件会从 error-monitor 消费错误事件
          // 然后在错误上报中附带这 30 秒的录屏数据
        }
      })
    })
  }

  uninstall() {
    this.stopFn?.()
  }
}

// 初始化：按需加载插件
const monitor = new MonitorCore({
  reportUrl: '/api/monitor',
  sampling: { error: 1.0, performance: 0.1, behavior: 0.05 },
  plugins: {
    error: { enabled: true },
    performance: { enabled: true },
    record: { enabled: false },  // 录屏插件默认关闭——隐私和性能成本高，按需开启
    api: { enabled: true }
  }
})

// 只在需要时加载录屏插件（如核心业务流程、支付页面）
if (isCoreBusinessPage()) {
  monitor.use(new RecordPlugin())
}
monitor.use(new ErrorMonitorPlugin())
monitor.use(new PerformanceMonitorPlugin())
```

**插件化的核心价值**：
- **按需加载**：不是所有项目都需要所有插件。一个文档站可能只需要性能监控，不需要录屏
- **独立迭代**：每个插件的升级不影响其他插件
- **体积可控**：Tree-shaking + 动态 import，SDK 核心 < 5KB，每个插件独立 chunk
- **可测试**：每个插件可以单独 mock MonitorCore 做单元测试

---

#### 五、数据清洗和 SourceMap 反解（2-3 分钟）

**1. 错误去重**：

```javascript
// 客户端侧做预去重——相同错误在 5 分钟内只上报首次 + 累计次数
const errorFingerprintCache = new Map()

function getErrorFingerprint(error) {
  // 指纹 = type + message + stack 的第一帧（文件名:行号:列号）
  const firstFrame = error.stack?.split('\n')[1]?.trim() || ''
  return `${error.type}:${error.message}:${firstFrame}`
}

function deduplicatedReport(error) {
  const fp = getErrorFingerprint(error)
  const cached = errorFingerprintCache.get(fp)
  if (cached && Date.now() - cached.firstTime < 5 * 60 * 1000) {
    cached.count++ // 只计数，不上报
    return
  }
  errorFingerprintCache.set(fp, { firstTime: Date.now(), count: 1 })
  report({ ...error, fingerprint: fp })
  // 定期清理超过 5 分钟的缓存条目，防止内存泄漏
}
```

**2. SourceMap 集成方案**：

这是监控系统中"做了"和"没做"最关键的区别——没有 SourceMap，错误堆栈显示的是压缩后的 `chunk-abc123.js:1:23456`，完全无法定位。

```yaml
# CI/CD 流程中的 SourceMap 上传：

# 1. 构建时生成 SourceMap
# vite.config.ts
build: {
  sourcemap: 'hidden',  # 生成 sourcemap 但不添加 sourceMappingURL 注释
                        # 这样浏览器不会尝试加载 sourcemap，但构建产物中包含 .map 文件
}

# 2. CI 管道中上传 SourceMap 到监控平台（在部署到 CDN 之前）
# .github/workflows/deploy.yml
- name: Build
  run: npm run build
- name: Upload SourceMap
  run: |
    npx @monitor/cli upload-sourcemap \
      --api-key ${{ secrets.MONITOR_API_KEY }} \
      --app-version ${{ github.sha }} \
      --dist ./dist
- name: Deploy to CDN
  run: |
    # 部署时不包含 .map 文件——CDN 上没有 SourceMap
    rsync -av --exclude='*.map' ./dist/ user@cdn:/var/www/
```

关键安全点：
- `sourcemap: 'hidden'`——生成的 `.map` 文件不添加 `sourceMappingURL` 注释，浏览器不会尝试加载
- SourceMap **只上传到监控平台**的内网接口，**不部署到 CDN**——防止任何人通过浏览器 DevTools 看到源码
- 上传时需要 `appVersion`（即 git commit hash 或构建版本号），监控平台根据错误事件中的版本号找到对应的 SourceMap
- 监控平台解析压缩代码的行列号 → 通过 SourceMap 还原为源码位置 → 展示在错误详情页

**3. 数据聚合策略**：

监控平台收到数据后的处理：
- **实时流**：错误事件 → Kafka → Flink/Storm → 实时聚合（5 分钟窗口的错误数量、P50/P95/P99 性能指标）
- **离线批处理**：原始日志 → HDFS/对象存储 → Spark/Hive → 日报/周报（错误趋势、性能退化分析）
- **聚合维度**：按版本号、页面 URL、地区、浏览器类型、用户群组等维度聚合

---

#### 六、告警策略（1-2 分钟）

**告警分级**：

| 级别 | 触发条件 | 通知方式 | 响应时间 | 示例 |
|------|---------|---------|---------|------|
| P0 紧急 | 5 分钟内同错误 > 500 次，或核心页面 JS 错误率 > 5% | 电话 + 钉钉 + 邮件 | 5 分钟内 | 白屏、支付页面 JS 崩溃 |
| P1 严重 | 15 分钟内 API 500 错误率 > 10%，或 LCP 劣化超过 50% | 钉钉 @所有人 + 邮件 | 15 分钟内 | 支付接口大面积 500 |
| P2 警告 | 1 小时内新错误 > 50 次，或 Web Vitals 指标降级 | 钉钉群消息 | 1 小时内 | 新增非关键错误、性能轻微劣化 |
| P3 通知 | 每日汇总、周报趋势 | 邮件/报表 | 工作日处理 | 低频错误、性能趋势变化 |

**告警策略设计原则**：
1. **防止告警疲劳**：不每个错误都告警——设置阈值和聚合窗口。P0/P1 告警必须有**确认机制**（无人确认则自动升级通知方式）
2. **告警收敛**：同一问题的后续告警合并（如"每分钟告警一次"→ 合并为"持续告警中"），不超过每 15 分钟一次
3. **关键路径优先**：优先对核心用户流程（登录→首页→核心功能→支付）设置告警，非核心页面降低告警级别
4. **告警配置化**：告警规则放在配置平台（而非硬编码），支持不同环境不同阈值（灰度环境阈值更低）

**告警升级策略（Escalation Policy）**：

告警不是"发一次就完"——需要有完整的升级链路：

```
P0 告警触发（5分钟内同错误 > 500次）
  │
  ├── 0min: 钉钉群 @值班工程师 + 邮件
  │
  ├── 5min: 无人确认 → 升级为电话通知（值班工程师手机）
  │
  ├── 10min: 仍无人确认 → 电话通知 Tech Lead + 邮件抄送部门负责人
  │
  └── 15min: 仍无响应 → P0 升级为"重大事故"，启动事故处理流程
                → 拉事故处理群（所有相关人员 + 决策者）
                → 决策：回滚 vs 紧急修复 vs 降级
```

**告警抑制规则**（避免告警风暴）：
- **关联告警合并**：如果 API 500 错误率飙升导致多个页面的 JS 错误率也飙升，只保留根因告警（API 500），抑制衍生告警（页面 JS 错误）
- **维护窗口抑制**：在计划内的发布窗口期间（如每天 14:00-15:00），降低告警灵敏度或抑制非关键告警——发布期间的短暂错误是可预期的
- **重复告警去重**：同一个错误指纹在 30 分钟内只发一次 P0/P1 告警，后续相同错误只在告警详情中更新计数

---

#### 七、监控大盘设计（1-2 分钟）

监控数据最终呈现在 Dashboard 上，设计合理的 Dashboard 是"数据产生价值"的最后一步。

**大盘分层设计**：

**第一层：全局概览大盘（给 TL/管理者看）**：
- 核心 Web Vitals 趋势图（LCP P75 / CLS P75 / INP P75 —— 7 天或 30 天趋势）
- 错误率趋势（JS 错误数/ PV —— 折线图，按天聚合）
- API 成功率趋势（成功率 P50 / P95 响应时间 —— 折线图）
- 版本发布标记（在趋势图上标记每次发布的版本号和时间点，一眼看出"哪次发布引入了问题"）
- Top 10 高频错误（表格：错误信息 + 影响用户数 + 趋势箭头 ↑↓）

**第二层：错误详情大盘（给开发排查问题用）**：
- 错误列表（支持按时间、版本、页面 URL、浏览器、地区筛选）
- 错误详情页：完整堆栈（SourceMap 反解后）+ 面包屑 + 用户操作前 10 步 + 发生次数趋势 + 影响的用户列表
- 错误上下文：发生时的页面 URL、用户 ID（脱敏）、User-Agent、网络状态、页面加载时间
- "一键定位"：从错误详情直接跳转到对应 Git 仓库的文件和行号（利用 SourceMap 反解结果 + Git 集成）

**第三层：性能分析大盘（给性能优化专项用）**：
- 按页面分解的 Web Vitals 分布（直方图：p50 / p75 / p90 / p95 / p99）
- 页面加载阶段瀑布图（DNS / TCP / TTFB / DOM Parse / Resource Load —— 堆叠柱状图）
- 按设备类型分解（Desktop / Mobile / Tablet 各自的性能分布）
- 按地区分解（不同 CDN 节点的性能差异）
- 资源加载性能 Top 慢资源（最大的 JS/CSS/图片/字体 —— 表格）

**第四层：用户行为分析大盘（给产品/运营用）**：
- PV/UV 趋势
- 页面访问路径（桑基图 —— 用户从哪个页面来、去了哪个页面）
- 关键流程漏斗（如"商品详情 → 加购 → 下单 → 支付"，每步的转化率）
- 用户操作热力图（点击分布 —— 了解用户实际怎么用产品）

#### 追问阶梯：

1. "怎么避免监控 SDK 影响页面性能？" → 数据采集用异步（微任务/requestIdleCallback）、批量上报、独立域名避免抢占页面的 TCP 连接。展开：(a) SDK 初始化放在 `requestIdleCallback` 中延迟执行（不阻塞首屏渲染），(b) 数据序列化/压缩放 Web Worker，(c) 上报使用独立域名（避免和业务请求共享 HTTP/2 连接池），(d) SDK 本身用 Tree-shaking 只打包用到的插件，(e) 使用 PerformanceObserver（异步）替代 `performance.getEntriesByType()`（同步）做性能数据采集。

2. "跨域脚本的错误怎么拿到详细信息？" → `<script crossorigin="anonymous">` + 服务器 `Access-Control-Allow-Origin`。展开：没有 `crossorigin` 属性的跨域脚本报错时，`error.message` 只会是 `Script error.`，`error.stack` 完全不可用（浏览器安全策略——防止信息泄露）。加了 `crossorigin="anonymous"` 且 CDN 返回 `Access-Control-Allow-Origin: *`，浏览器才会暴露完整错误信息。注意：`crossorigin="anonymous"` 不发 cookie（适合 CDN 静态资源），`crossorigin="use-credentials"` 发 cookie（适合需要认证的资源但一般不用于监控场景）。

3. "如果线上报了一个 `Cannot read properties of undefined`，但 SourceMap 反解后指向了 `a?.b?.c`——这说明什么？"（高级追问）→ 这说明 SourceMap 的**行列号映射不精确**——压缩后的列号可能映射到了可选链表达式的中间而非具体位置。这个问题通常发生在：(a) 使用了某些 Babel/TypeScript 转换插件导致 SourceMap 质量下降，(b) 构建工具链中多个 loader/plugin 各自生成了 SourceMap 但没有正确合并。解决方案：使用 `source-map` 库的 `MappingConsumer` 验证 SourceMap 质量，或者用 Sentry 等专业工具（它们内部处理了 SourceMap 映射的各种边缘情况）。

4. "监控服务本身挂了怎么办？SDK 怎么处理？"（高级追问）→ (a) 所有上报逻辑用 try-catch 包裹，确保 SDK 的任何异常不抛到业务代码，(b) 上报失败时降级——减少上报频率（指数退避）、使用 `sessionStorage` 暂存关键错误（等恢复后补报），(c) 设置最大重试次数（3 次），超过后丢弃，避免无限重试阻塞队列，(d) 设置最大存储上限（如 sessionStorage 中暂存数据不超过 50KB），防止暂存数据撑爆存储，(e) SDK 内部错误走独立的"自监控"通道（如 `console.warn` 或单独的 `_internal_error` 事件上报），用于监控 SDK 自身的健康度。

**评分标准**：

| 分数 | 表现 |
|------|------|
| 90-100 | 完整数据流图 + 三种事件的 schema + 上报策略（采样/合并/降级/SDK 性能）+ SourceMap 自动上传 + CI 集成 + 告警分级策略 + SDK 异常自保护 |
| 75-89 | 覆盖错误/性能/行为三类监控，上报策略合理（采样/批量/beacon），有 SourceMap 意识，能回答追问中的 2-3 个 |
| 60-74 | 能讲出核心的错误捕获和性能采集 API，但上报策略、数据清洗、告警策略有缺失 |
| <60 | 只会几个监控 API（window.onerror / sendBeacon），没有系统设计思路，缺乏上报策略和数据清洗概念 |

---

## 第四阶段：综合追问（45-60 分钟，2 题）

### 环节目标

最后 15 分钟从方案设计回到技术视野和工程素养。这两个问题看似轻松，但能暴露候选人的格局——是只关注前端，还是能从团队/组织层面思考技术决策。

---

### 第 6 题：微前端方案选型

**面试官话术**："如果你们后台管理系统要拆成多个子应用，各团队独立开发部署，你会怎么选技术方案？"

**内心 OS**：微前端是架构面常见的考察点——不是因为所有项目都需要微前端，而是因为这个话题天然涉及 tradeoff 分析、多方案对比、技术选型的深度思考。候选人如果上来就推荐某一个方案而不问场景，减分——"先了解问题，再选方案"是架构师的基本素养。

**信号识别**：
- **S 级信号**：先问场景（"这多个子应用之间的关系是什么？有共享组件吗？部署频率差异大吗？"），再给方案。能分析每种方案的底层原理和边界case。能主动提到"微前端的代价"——不是所有项目都应该拆
- **A 级信号**：能对比 2-3 种方案并说明选型理由，对沙箱机制有一定了解
- **B 级信号**：知道 qiankun 和 Module Federation，但说不清选型理由
- **C 级信号**：只知道 qiankun 或者只说"用 iframe"

**考点**：微前端选型 + tradeoff 分析

**预期回答**：
- **初级**：qiankun 或 Module Federation。停留在"听说 XXX 不错"的层面，无法解释为什么选这个而不是另一个。

- **中级**：qiankun（成熟、基于 single-spa、JS 沙箱+CSS 隔离）vs Module Federation（Webpack 5 原生、去中心化、共享依赖）vs iframe（完美隔离但通信复杂）。能讲出每种方案的优缺点：qiankun 的优点是框架成熟、社区活跃、文档齐全，缺点是基于 single-spa，应用间通信和样式隔离有坑；Module Federation 的优点是原生支持、共享依赖减少重复打包，缺点是只适用于 Webpack 5 项目、配置复杂；iframe 的优点是天然隔离（JS/CSS/运行时完全独立），缺点是 URL 不同步、通信靠 postMessage、弹窗/全局 loading 无法覆盖子应用。

- **高级**：选型取决于场景——应用间强关联 → Module Federation（共享依赖减少重复打包）；应用间弱关联 → qiankun（独立部署互不影响）；第三方嵌入 → iframe（天然隔离）。权衡：JS 沙箱的性能开销（qiankun 的 proxy 沙箱每次访问全局变量都有性能损耗）vs 样式隔离的维护成本（CSS Module/BEM/Shadow DOM）。

  高级回答的完整展开：

  > "在选择方案之前，我需要先了解几个关键约束：
  >
  > 1. **应用间的关系**：这几个子应用是同一个产品（用户无感知切换，如微前端），还是独立的工具集（用户明确知道自己在用不同的系统，如门户集成）？
  > 2. **技术栈限制**：所有子应用都是 Vue3 还是混用 React/Vue/Angular？如果混用，技术栈不同的应用必须选择框架无关的方案（qiankun/iframe）。
  > 3. **部署频率**：各团队独立部署的频率和稳定性要求？如果需要"随时部署、不互相阻塞"，则去中心化方案（Module Federation）更合适。
  > 4. **共享粒度**：有没有需要跨应用复用的组件/工具？如果有，Module Federation 的共享依赖机制可以直接减少重复打包。
  > 5. **团队规模**：几个团队？每个团队的前端能力如何？qiankun 需要主应用团队维护基座，对主应用团队要求更高。
  >
  > 根据以上约束：
  > - **同产品 + 同技术栈 + 需要紧密共享** → Module Federation。所有应用打包在一起，共享 Vue/Vue Router/Pinia/Element Plus 等核心依赖，减少总体积。应用间的路由切换是真正的 SPA 内部跳转。
  > - **同产品 + 不同技术栈或独立部署需求强** → qiankun。主应用（基座）负责路由分发和全局状态（用户信息、权限、主题），子应用各自独立构建部署。代价：基座是单点——挂了影响所有子应用。
  > - **不同产品 + 只需要拼在一起** → iframe。最简单的方案，绝对隔离。适合"老系统嵌入新系统"或"集成第三方页面"的场景。
  >
  > **微前端的隐性代价**（很多人不提但实际很重要）：
  > 1. **调试复杂度**：跨应用的数据流和样式问题排查成本远高于单体应用
  > 2. **构建配置一致性**：所有子应用需要遵循相同的基础配置（publicPath、跨域头、资源路径），否则会出现资源 404
  > 3. **全局状态的归属**：用户信息、权限、主题这些全局状态放基座还是各子应用独立维护？放基座 = 基座变得更重；独立维护 = 数据不一致风险
  > 4. **是否需要微前端？** 如果团队不超过 10 人、应用复杂度可控，Monorepo + 模块化拆分通常是比微前端更好的选择——复杂度更低、开发体验更好"

**追问**：
1. "qiankun 的沙箱怎么实现的？" → JS 沙箱用 Proxy 拦截 window 访问；CSS 沙箱在挂载时加 scope 前缀、卸载时移除。展开：JS 沙箱有两种模式——(a) SnapshotSandbox（快照沙箱）：激活时记录 window 当前状态，失活时恢复快照。兼容性好但性能差（每次切换都要遍历 window 做 diff），且不支持多实例。(b) ProxySandbox（代理沙箱）：用 Proxy 拦截对 window 的读写操作，每个子应用有自己的 fakeWindow。支持多实例（多个子应用同时激活），性能更好但兼容性稍弱（Proxy 不能被 polyfill）。CSS 沙箱也有两种——(a) Scoped CSS：给每个子应用的样式加 `[data-qiankun-xxx]` 属性选择器前缀。(b) Shadow DOM：创建封闭的 DOM 树实现绝对样式隔离——但 Shadow DOM 内有自己的事件模型，部分组件库不支持。

2. "Module Federation 的版本冲突怎么处理？" → `shared` 配置 + `singleton: true` + `requiredVersion`。展开：Module Federation 的 `shared` 配置可以让多个 remote 应用共享同一个依赖（如 vue），避免加载多个副本。`singleton: true` 确保全局只有一份 vue 实例（Vue 不允许同一页面有多个 Vue 实例，会导致响应式系统冲突）。`requiredVersion` 指定最低版本要求（如 `^3.4.0`）。如果版本不兼容：(a) 降级——使用最低兼容版本，(b) 不共享——各自加载自己的版本（体积增加但功能正常），(c) 构建时检查——用 `strictVersion: true` 让不兼容的版本在构建时报错而非运行时崩溃。

3. "如果你加入一个已经在用 qiankun 的项目，发现子应用切换时页面闪烁，你怎么排查？"（高级追问）→ 可能原因排查：(a) 子应用加载机制——qiankun 默认在路由切换时才加载子应用（`fetch` HTML → 解析 JS/CSS → 执行），这个过程中旧的子应用已卸载、新的还没渲染完，产生白屏闪烁。解决：预加载（`prefetch: true` / `prefetchApps`），或 keep-alive 模式让子应用不销毁。(b) CSS 加载延迟——子应用的 CSS 通过 `<style>` 动态插入，如果 CSS 文件较大或网络慢，会有"无样式内容闪烁"（FOUC）。解决：关键 CSS 内联或 preload。(c) 全局状态（如用户信息）在子应用切换时被清空 → 子应用重新请求 → 页面显示 loading。解决：全局状态放基座，子应用通过 props 或全局通信获取。

**评分标准**：

| 分数 | 表现 |
|------|------|
| 90-100 | 先问场景再选方案，3 种方案深度对比 + 底层原理 + 隐性代价 + 反问"是否真的需要微前端" |
| 75-89 | 2-3 种方案对比 + 合理选型理由 + 沙箱机制有一定理解 |
| 60-74 | 知道 1-2 种方案，但说不清为什么选这个，对原理了解浅 |
| <60 | 只报方案名字，不了解 tradeoff |

---

### 第 7 题：技术债务管理

**面试官话术**："最后一道非技术题——你在项目中怎么处理技术债务？什么时候会主动提重构？"

**内心 OS**：技术债务管理是判断一个工程师是否"成熟"的关键维度。初级工程师倾向于推翻重写（"这个代码太烂了，我想用新的技术栈重写"），成熟的工程师更倾向于评估影响和成本，用数据驱动决策。这道题也能看出候选人在团队中的推动力——能否把技术诉求翻译成业务/PM 能理解的语言。

**信号识别**：
- **S 级信号**：有量化评估框架（影响 × 成本矩阵），会翻译成业务语言和 PM 沟通，有渐进式重构的策略，"把重构揉进需求"而非"单独排重构期"
- **A 级信号**：有评估标准（影响/成本），能有理有据地和 PM 沟通
- **B 级信号**：知道技术债不好，但缺乏评估标准和推动策略
- **C 级信号**："有技术债就做"或"等有时间了再重构"——缺乏判断标准和策略

**考点**：工程素养 + 沟通能力

**预期回答**：
- **初级**："有技术债就做"——缺乏判断标准。可能会说"技术债不好，应该尽早还"——这是正确但无用的回答，因为没有区分"哪些优先处理"和"什么时候处理"。

- **中级**：根据影响程度和修复成本判断——高影响+低成本优先（如修复构建 warning）、高影响+高成本排期逐步做（如升级依赖）、低影响的不主动提。已经有一定的评估框架，但量化手段不足——如何衡量"影响"？如何估算"成本"？

  典型中级回答：
  > "我会把技术债按影响和修复成本分成四个象限。高影响+低成本的（如 ESLint warning 堆积）优先处理——直接在当前迭代中顺手修掉。高影响+高成本的（如升级 Vue 2 到 Vue 3）排入技术迭代，通常需要单独排期。低影响的（如不规范的变量命名）在相关代码改动时顺带修复。"

- **高级**：量化和沟通——用数据说明技术债的影响（如"这个 old package 的构建耗时占 30%，升级后会降为 5%——预期节省 CI 时间约 2 分钟/次"）。把技术债翻译成业务价值——"修复这个问题能让发版时间从 8 分钟降到 3 分钟，每月节省 X 人时"。

  高级回答的完整展开：

  > "我的技术债管理有三个核心原则：
  >
  > **1. 量化影响，不凭感觉**：
  > 不说'这个依赖太老了'，而是说'当前 package A v2.x 在 CI 构建中耗时占 30%（平均 2 分钟），升级到 v3.x 后构建耗时预计降为 30 秒。按团队每天 10 次 CI 触发计算，每月节省约 10 人时'。用具体的、可验证的数据，而不是主观感受。
  >
  > **2. 翻译成业务语言**：
  > PM 和业务方不关心'代码质量'——他们关心交付速度和稳定性。所以我把技术债的影响翻译成：
  > - '这个模块每次改需求都要多花 1 天，因为代码耦合太紧'（影响交付速度）
  > - '上个月这个模块出了 3 次线上问题，根源是这里的异常处理逻辑分散在 5 个文件中，很容易漏'（影响稳定性）
  > - '新人接手这个模块需要 2 周而不是 3 天，因为缺少类型定义和测试'（影响团队效率）
  >
  > **3. 渐进式重构，不要求'重构排期'**：
  > 我不会去跟 PM 说'给我两周专门重构'——没有 PM 会同意。我的做法是：在每个需求的开发过程中，把相关代码的重构揉进去。这叫**童子军原则**（Boy Scout Rule）：离开营地时比来时更干净。具体做法：
  > - 接到一个'修改用户列表页的筛选条件'的需求时，如果发现列表页的 API 调用直接写在组件里，可以顺便抽一个 `useUserList` composable
  > - 每次改动的范围略大于需求本身（多 20-30% 的工作量），但换来相关代码质量的持续提升
  > - 这样 3 个月后回头看，核心模块基本都已被重构过，且没有一次'大重构'的风险
  >
  > **技术债优先级矩阵**：
  >
  > |  | 高影响 | 中影响 | 低影响 |
  > |--|--------|--------|--------|
  > | **低成本** | 立即做（当前迭代） | 当前或下个迭代 | 顺带做 |
  > | **中成本** | 下个迭代排期 | 列入技术迭代 backlog | 不做 |
  > | **高成本** | 拆分后逐步做 | 战略级——需要对齐团队决定做不做 | 永远不做 |
  >
  > 判断'高成本'的一项必须拆分为小步骤——比如'升级 Vue 2 到 Vue 3'不是一口气做完，而是：先升级构建工具 → 迁移 Composition API → 替换不兼容的依赖库 → 迁移 Vue Router/Pinia → 全量验证。每步独立可发布、可回滚。
  >
  > **关于重写 vs 重构**：重写是最后手段。我在之前的项目中有过教训——用新框架重写了一个运行了 2 年的老模块，花了 3 个月。结果发现老模块里藏了大量业务 corner case（边界情况），新代码不断被 hotfix 打补丁，3 个月后又长得和老代码差不多了。从那以后我遵循的一个原则是：**只在你确定'继续在老代码上加功能比从头写更慢'时才重写**。绝大多数情况下，渐进式重构是更安全、更高效的选择。"

**追问**：
1. "如果 PM 说没有时间做重构怎么办？" → 不要求单独排期——把重构拆碎，揉进需求开发中（每次改动顺带优化）。关键是把重构的好处翻译成 PM 能理解的语言。更进阶的沟通策略：(a) 不要在需求评审时提重构——PM 的关注点在需求上，突然提重构会显得你在"夹带私货"；(b) 在需求评估时把多出的时间打包进工作量的"缓冲"里（如需求预估 3 天，实际排 4 天——多出来的 1 天做质量改进），(c) 在回顾会上用数据说话——"上个迭代因为 XX 模块的代码质量问题，改一个小需求花了 3 天而不是预估的 1 天，建议在下个迭代对这个模块做针对性优化"。

2. "什么时候该重写而不是重构？" → 重写是最后手段——只在当前架构已经无法支撑业务演进时才考虑。一般遵循"重构 > 局部重写 > 整体重写"。具体判断标准：(a) 重构成本 > 重写成本的 2 倍时考虑局部重写（如该模块技术栈和团队完全不匹配且没有 bridge 方案），(b) 当前技术栈已 EOL（如使用 Vue 1.x 且官方不再维护），(c) 代码质量差到"每次改 1 个 bug 引入 3 个新 bug"且缺少测试（修改成本 > 重写成本），(d) 新的业务需求在当前架构下根本无法实现（如 SSR 需求但当前架构是纯 CSR）。**注意**：即使决定重写，也应该采用**绞杀者模式**（Strangler Fig Pattern）——旧系统继续运行，新系统逐步替换旧系统的模块，而不是"停机→重写→上线"的大爆炸模式。

3. "如果你发现团队里有人在业务代码中不断引入新的技术债，你怎么处理？"（高级追问）→ 区分情况处理：(a) 如果是能力问题（不知道怎么写更好）→ Code Review 时给具体建议 + 分享最佳实践文档；(b) 如果是时间压力（知道不好但赶进度）→ 和 TL/PM 沟通调整排期预期，同时让开发者在代码中加 `// TODO: refactor` 标记（关联到技术债 backlog）；(c) 如果是态度问题（不在乎代码质量）→ 1:1 沟通，说明"现在的快速交付是以未来的交付速度变慢为代价"；(d) 建立团队共识——定义"什么是技术债"，把它纳入 Code Review Checklist，让全团队对技术债有共同语言和判断标准。

**评分标准**：

| 分数 | 表现 |
|------|------|
| 90-100 | 量化评估框架（影响×成本矩阵）+ 业务语言翻译 + 渐进式重构策略 + 重写 vs 重构的清晰判定标准 + 团队推动经验 |
| 75-89 | 有影响/成本评估标准，能和 PM 有效沟通，有渐进式重构意识 |
| 60-74 | 知道技术债不好但缺乏评估标准，沟通策略停留在"跟 PM 解释"层面 |
| <60 | 无判断标准，或倾向"全部重写"的极端方案 |

---

## 反问环节（面试结尾，约 2-3 分钟）

### 面试官话术

> "好的，我问的差不多了。你对我们团队或者这个岗位有什么想了解的吗？"

**内心 OS**：反问环节是双向评估。好的问题反映候选人的思维深度和真正关心的事情。对于架构面，候选人如果能问出涉及技术决策、工程体系的问题，是额外加分。

### 推荐的反问（针对架构面）

**关于技术架构**（适合本轮氛围）：
- "团队目前的整体技术架构是什么样的？有哪些正在进行的架构演进计划？"
- "你们在选择技术方案时，决策流程是什么样的？前端团队在技术选型上有多少自主权？"
- "Monorepo 还是多仓？选择的原因是？"
- "前端有专门的基建团队吗？监控、CI/CD、组件库是谁在维护？"
- "目前项目中有微前端或者模块联邦吗？如果重新选型会选什么？"
- "部署流程是什么样的？有灰度发布和 A/B 测试机制吗？"

**关于工程体系**：
- "代码审查的流程和深度是什么样的？有自动化检查（lint/test/build）吗？"
- "测试覆盖率大概在什么水平？单元测试、集成测试、E2E 测试的分布如何？"
- "文档文化怎么样？有维护技术文档和 ADR（Architecture Decision Record）的习惯吗？"
- "技术债怎么管理？有专门的技术迭代排期吗？"

**关于成长和团队**：
- "对前端工程师的架构能力怎么评估？晋升到高级/资深需要达到什么标准？"
- "目前团队在技术上遇到的最大挑战是什么？"
- "前端团队的规模和发展规划是怎样的？"

### 不推荐的问题

| 问题 | 为什么不推荐 | 更好的替代问法 |
|------|-------------|--------------|
| "你们用什么技术栈？" | 面试前应该做过功课——这反映了准备不充分 | "看 JD 提到用 Vue3，你们有在关注 Vapor Mode 或 Vue 3.6 的新特性吗？" |
| "加班多吗？" | 负向暗示 | "项目的迭代节奏大概是什么样的？有固定的发布周期吗？" |
| "我今天表现怎么样？" | 让面试官为难 | 等结果，不要当场问 |
| "薪资大概多少？" | 反问环节问这个过早 | HR 面再谈 |
| "可以远程办公吗？" | 如果 JD 没写 = 大概率不行 | "团队的协作模式是怎样的？远程和现场的分布？" |

---

## 面试结束语

### 面试官对候选人

> "感谢你今天的时间，和你交流了很多架构方面的思考，很有收获。后续 HR 会和你沟通下一步流程。"

### 面试官复盘框架（面试结束后自行填写）

---

## 面试后综合评分矩阵

### 各题得分汇总

| 题号 | 题目 | 满分 | 候选人得分 | 关键依据（一句话） |
|------|------|------|-----------|-------------------|
| Q1 | 项目分层设计 | 100 | /100 | |
| Q2 | 组件设计原则 | 100 | /100 | |
| Q3 | 性能优化实践与量化 | 100 | /100 | |
| Q4 | 缓存策略设计 | 100 | /100 | |
| Q5 | 前端监控系统设计 | 100 | /100 | |
| Q6 | 微前端方案选型 | 100 | /100 | |
| Q7 | 技术债务管理 | 100 | /100 | |

### 加权总分计算

| 维度 | 关联题目 | 权重 | 满分 | 候选人得分 | 说明 |
|------|---------|------|------|-----------|------|
| 架构思维 | Q1, Q2, Q6 | 35% | 35 | /35 | 分层思想、组件设计、方案选型的 tradeoff 意识 |
| 性能优化 | Q3, Q4 | 25% | 25 | /25 | 量化能力、工具链、缓存策略的体系化程度 |
| 方案设计 | Q5 | 25% | 25 | /25 | 系统设计能力（数据流、模块划分、工程细节） |
| 技术视野 | Q6, Q7 | 15% | 15 | /15 | 微前端、技术债管理、工程素养 |
| **总分** | | **100%** | **100** | **/100** | |

### 评级与决策

| 评级 | 总分 | 定义 | 决策 |
|------|------|------|------|
| S | 90-100 | 架构思维突出，方案设计有系统观，技术视野广。能独立主导项目的架构设计和技术选型 | **强烈建议通过**。具备高级前端工程师及以上能力 |
| A+ | 85-89 | 架构清晰，方案设计合理，大部分追问回答有深度。在某一两个维度上有突出表现 | **建议通过**。靠谱的中高级前端，可独立负责模块 |
| A | 80-84 | 架构思维清晰，方案合理但细节有欠缺，部分追问回答不够深 | **通过**。合格的中级前端 |
| B+ | 75-79 | 整体 OK，但追问时多处卡顿，方案设计有漏洞但大方向正确 | **待定**。基础功过关，可培养，看其他轮次表现 |
| B | 65-74 | 能描述做了什么但讲不清为什么，方案设计有完整性缺失 | **待定**。可能需要降级（如面的是高级给中级 offer） |
| C | <65 | 只讲功能不讲架构，方案设计无从下手，核心追问无法回答 | **不通过**。能力与目标职级不匹配 |

### 各评级具体画像

**S 级画像**：
- Q1：主动画出层级图 + 依赖方向 + 边界约束（ESLint 规则 / dependency-cruiser）+ 分层收益量化
- Q2：完整拆分决策树 + 反面案例 + renderless/组合模式经验
- Q3：完整优化案例 + 多轮迭代 + 生产环境 RUM 验证 + 优先解决最大瓶颈的方法论
- Q4：完整缓存金字塔 + 决策树 + 每种资源的精确策略 + 实践中踩过的坑
- Q5：数据流图 + event schema + 上报策略（采样/合并/降级/性能控制）+ SourceMap CI 集成 + 告警分级 + SDK 自保护
- Q6：先问场景再选方案 + 3 种方案底层原理 + 隐性代价 + "是否真的需要微前端"的反思
- Q7：量化评估框架 + 业务语言翻译 + 渐进式重构 + 重写决策标准 + 团队推动策略

**A 级画像**：
- 大部分题有清晰的结构化回答，但缺少 S 级的"额外深度"
- 方案设计合理但缺少一些工程细节（如告警策略、SDK 性能控制）
- 追问时 80% 能回答，但 20% 回答不够深或需要思考较长时间

**B 级画像**：
- 能描述做了什么（做了什么分层、用了什么优化手段），但讲不清为什么这样设计
- 方案设计有基本框架但模块间的关系不够清晰
- 追问时约 40-50% 卡顿或回答浅层

**C 级画像**：
- 所有回答停留在"功能罗列"层面，无架构抽象
- Q5（监控系统）回答为零散 API 调用，无系统设计
- 追问基本无法深入，或直接回答"没用过/没想过"

### 三面建议

- **S 级** → 三面重点考察：软素质（沟通/推动力/团队协作）、职业规划、文化匹配度。技术能力已充分验证
- **A 级** → 三面考察：方案设计的深度（给一个更开放的题看上限）、跨团队协作经验、技术规划能力
- **B 级** → 是否进入三面取决于：(a) 是否有某方面特别突出（如 Q5 方案设计很完整但其他一般），(b) 其他轮次（一面基础面）的补充评价
- **C 级** → 不进入三面

---

## 时间控制提示

| 阶段 | 时间 | 注意 |
|------|------|------|
| 项目架构 | 0-12min | 关键看分层逻辑——如果候选人讲不出"为什么这样分层"，不用给太多追问 |
| 性能优化 | 12-28min | 第 3 题如果候选人没有优化数据——这是减分信号，直接跳第 4 题 |
| 方案设计 | 28-45min | 这是给定时间的核心——不需要面面俱到，但要有完整的数据→上报→存储链路 |
| 综合追问 | 45-58min | 微前端话题容易展开太久——控制在 8 分钟内。Q7 技术债务控制在 5 分钟 |
| 反问环节 | 58-60min | 2 分钟——让候选人问 1-2 个问题即可 |

## 时间分配总览

```
00:00 ─── 06:00   Q1：项目分层设计（含追问）
06:00 ─── 12:00   Q2：组件设计原则（含追问）
12:00 ─── 20:00   Q3：性能优化实践与量化（含追问）
20:00 ─── 28:00   Q4：缓存策略设计（含追问）
28:00 ─── 45:00   Q5：前端监控系统设计（含追问）—— 核心，占时最长
45:00 ─── 53:00   Q6：微前端方案选型（含追问）
53:00 ─── 58:00   Q7：技术债务管理（含追问）
58:00 ─── 60:00   反问环节
```

---

## 面试官加压技巧（针对架构面）

1. **"还有呢？"**：三次原则——第一次列出的是准备好的标准答案，第二次是认真思考过的，第三次如果还能答出来，是真懂的。尤其适合 Q4（缓存策略）和 Q5（监控系统设计）。
2. **"如果不用这个方案，你会选什么？为什么？"**：在候选人给出一个方案后，追问替代方案——考察是否真的做过对比调研，还是只了解一种方案。适合 Q6（微前端）和 Q5（监控系统）。
3. **沉默等待**：候选人回答核心问题（如 Q5 的完整方案）后，等 3-5 秒不接话。很多时候候选人会自己补充更深的细节——那些主动补充的才是他们真正掌握的。
4. **边界场景施压**："如果你的方案中 XX 组件挂了怎么办？""如果数据量是现在的 10 倍？"——考察方案的鲁棒性和候选人的应变能力。
5. **"这听起来像八股文"**：如果候选人回答过于流利但缺少个人细节（尤其是 Q3 性能优化），可以追问"能给我看看你在项目里的具体代码或 PR 吗？"——看反应。真做过的会自然地描述具体的代码改动；背八股的会含糊其辞。

---

## 参考答案链接

- [项目分层设计](../前端架构/project-structure.md)
- [组件设计](../前端架构/component-design.md)
- [首屏优化](../性能优化/first-screen.md)
- [缓存策略体系](../性能优化/caching-strategy.md)
- [Web Vitals](../性能优化/web-vitals.md)
- [微前端概述](../前端架构/微前端/overview.md)
- [qiankun](../前端架构/微前端/qiankun.md)
- [Module Federation](../前端架构/微前端/module-federation.md)
- [面试回答：项目性能优化](../面试回答/项目/project-optimization.md)
- [plugin-architecture](../前端架构/plugin-architecture.md)

---

## 附录：高频追问速查表

| 追问关键词 | 所属问题 | 考察点 | S 级回答的核心 |
|-----------|---------|--------|---------------|
| "为什么不允许视图直接调 API" | Q1 | 依赖方向理解 | 依赖倒置原则 + 复用性 + 可测试性 + ESLint 约束 |
| "怎么判断代码放哪层" | Q1 | 分层判断标准 | 变化原因相同放一层 + UI变化/业务变化/接口变化分开 |
| "什么场景不拆分更合理" | Q2 | 避免过度设计 | YAGNI + 内聚性 + "拆分税" |
| "优化效果是真实的吗" | Q3 | 数据可信度 | 同环境对比 + 多轮测试取中位数 + RUM 验证 |
| "缓存更新后用户看到旧版本" | Q4 | 缓存一致性 | HTML no-cache + 旧 hash 自然淘汰 + CDN purge |
| "怎么避免 SDK 影响页面性能" | Q5 | SDK 性能设计 | 异步采集 + 独立域名 + Worker + Tree-shaking |
| "SourceMap 反解后行列号不准" | Q5 | SourceMap 质量 | 多 loader 映射合并 + source-map 库验证 |
| "监控服务挂了 SDK 怎么办" | Q5 | SDK 鲁棒性 | try-catch 包裹 + 降级 + 本地暂存 + 丢弃策略 |
| "qiankun 沙箱怎么实现" | Q6 | 沙箱底层原理 | Proxy sandbox + snapshot sandbox + 多实例支持 |
| "Module Federation 版本冲突" | Q6 | 依赖管理 | shared + singleton + requiredVersion + strictVersion |
| "PM 说没时间做重构" | Q7 | 技术推动力 | 渐进式揉入需求 + 业务语言翻译 + 回顾会数据驱动 |
| "什么时候该重写不是重构" | Q7 | 决策判断 | 重构成本 > 2 倍重写成本 / EOL / 绞杀者模式 |

---

## 附录 B：常见错误回答及纠正指南

以下是架构面中候选人常见的"减分回答"，以及面试官应该如何引导或评估。

### Q1 项目分层 —— 典型错误

| 错误回答 | 为什么错 | 正确方向 |
|---------|---------|---------|
| "我们按功能模块分目录——user、order、product 每个下面有 pages/components/api" | 这是功能划分，不是架构分层。每个模块内部仍然是耦合的 | 横向分层（视图/逻辑/数据）比纵向切模块更重要——先分层再分模块 |
| "我们用的 Nuxt/Next.js，框架已经定了目录结构" | 框架给的是约定，不是架构设计。候选人需要讲出"即使没有框架，我也会这样组织" | 好的回答："框架给了基础结构，我们在此基础上增加了 composables 层处理业务逻辑、services 层封装 API，确保组件的职责单一" |
| "我们没有分层，就是一个 Vue 项目" | 任何项目都有分层——只是候选人没有意识到。比如"组件里直接写 axios"也是一种分层选择（虽然不是好的选择） | 帮助引导："那你们的 API 调用写在组件里还是单独的文件里？为什么要单独放？"——引导候选人意识到"已经在分层了，只是没总结" |

### Q3 性能优化 —— 典型错误

| 错误回答 | 为什么错 | 正确方向 |
|---------|---------|---------|
| "我们用了路由懒加载、图片懒加载、gzip 压缩、CDN……"（一口气列举 10 种手段） | 听起来像在背八股文——没有优先级、没有数据、没有分析过程。真做优化的人不会一次性做 10 件事 | "我们通过 Lighthouse 发现了三个主要问题，其中最大的瓶颈是……所以我们先处理这个，优化后 LCP 从 3s 降到 1.5s。然后……" |
| "我们做了优化，但具体数据我不记得了" | 如果没有数据，很可能只是"参与"而不是"主导"——真正主导优化的人一定会记住核心数据 | 追问具体的优化手段到底做了什么——"路由懒加载是怎么改的？改了哪些路由？"如果能把代码改动细节讲出来，可能是真做过但数据没记住 |
| "我们用 Lighthouse 跑了一下，分数从 45 提高到了 90" | Lighthouse 分数受环境影响大（网络波动、设备性能、插件干扰），单一分数不可靠 | "我们在 CI 中用 Lighthouse CI 跑 5 次取中位数，确认每次优化前后的变化。同时在生产环境通过 RUM 数据验证" |

### Q5 监控系统 —— 典型错误

| 错误回答 | 为什么错 | 正确方向 |
|---------|---------|---------|
| 上来就写 `window.addEventListener('error', ...)` | 缺少系统设计思维——先写代码而不是先画数据流图，说明缺少架构层面的思考 | "我先画一下整体数据流：SDK 端采集 → 批量上报 → 后端数据清洗 → 存储 → 告警/大盘" |
| "错误全部上报，性能数据也全部上报" | 没有采样和成本意识——一个中型应用每天可能有千万级 PV，全量上报每天可能产生 GB 级别的数据 | "错误 100% 上报，性能按 10% 采样，行为按 5% 采样。同时注意：上报数据量不能成为用户的流量负担（移动端尤其重要）" |
| 不提 SourceMap | 没有 SourceMap，压缩后的堆栈 `chunk-abc.js:1:23456` 无法定位。这是区分"做过监控"和"想象监控"的关键 | "SourceMap 在 CI 中自动上传到监控平台，CDN 上不部署。监控平台根据版本号匹配 SourceMap 反解堆栈" |

### Q6 微前端 —— 典型错误

| 错误回答 | 为什么错 | 正确方向 |
|---------|---------|---------|
| "微前端很好，我们项目用了 qiankun" | 只说"用了"不讲"为什么选这个"——可能只是执行者不是决策者 | "我们当时对比了 qiankun、Module Federation 和 iframe。因为我们不同子应用是不同团队维护的不同技术栈（Vue2/Vue3/React），所以选了框架无关的 qiankun" |
| "iframe 太差了，绝对不要用" | 显示了对技术的绝对化判断——iframe 在某些场景下是最好的方案（如嵌入第三方页面） | "iframe 适合完全隔离的场景，比如集成第三方页面或遗留系统。缺点是通信靠 postMessage、URL 不同步、弹窗无法跨应用" |

### Q7 技术债务 —— 典型错误

| 错误回答 | 为什么错 | 正确方向 |
|---------|---------|---------|
| "代码太烂了，我建议用新框架重写" | 典型的初级工程师思维——重写是技术手段不是业务目标。重写 3 个月后发现新代码也被打满补丁 | "先评估影响——是否真的阻碍了业务交付？如果是核心模块且每次改动成本很高，我会：1) 量化当前改一个需求的耗时，2) 评估渐进式重构 vs 重写的成本，3) 如果是重写，用绞杀者模式逐步替换" |
| "技术债就是代码写得不好" | 太笼统——技术债是个可操作的概念，需要能被识别和分类 | "我把技术债分成几类：代码债（耦合、重复、缺少测试）、架构债（选型过时、不支持新需求）、依赖债（旧版本有漏洞、升级成本高）、知识债（缺少文档和注释）" |

---

## 附录 C：每题信号速判指南（面试官速查）

面试过程中时间有限，以下每个问题的"一票否决"信号，看到任何一个就基本判定该题不合格：

| 题号 | 一票否决信号 | 为什么 |
|------|------------|--------|
| Q1 | 只能用目录结构描述架构 | 没有抽象思维能力，停留在文件组织层面 |
| Q2 | 不能区分通用组件和业务组件 | 组件拆分的本质是职责分离，分类是第一步 |
| Q3 | 没有优化前后数据 | 没有量化习惯，优化=拍脑袋 |
| Q4 | 不知道协商缓存和强缓存的区别 | 缓存策略的基础概念缺失 |
| Q5 | 只讲了 `window.onerror` | 监控是一个系统，不是一个 API |
| Q6 | 只报方案名字不说 why | 没有技术选型能力 |
| Q7 | "有技术债就做"或"等有时间了重构" | 缺乏优先级判断和工程策略 |

---

## 更新记录

- 2026-07-10：新建（4 阶段 7 题 + 项目架构 + 性能优化 + 监控系统设计 + 技术债务）
- 2026-07-17：大规模扩展。每道题新增评分标准、信号识别、内心OS；Q5 扩展至完整方案设计（数据流图、模块代码、告警策略、SourceMap CI 集成）；新增反问环节、面试后评分矩阵、时间分配总览、加压技巧、高频追问速查表

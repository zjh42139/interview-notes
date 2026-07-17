---
title: 更新日志
description: 知识库变更记录
---

# Changelog

## 2026-07-18

### Phase 2 覆盖率补齐 + Phase 3 事实审计（第 1 批：浏览器/JS/Vue3/CSS/工程化）

**Phase 2（覆盖率）**:
- 题库补 🎤 回答稿链接 44 条（HTML +10、浏览器 +4、TS +6、Vue3 +4、网络 +3、CSS +3、工程化 +3、性能 +3、VueRouter +3、JS +2、项目 +2、Pinia +1）
- 修正 8 处 🎤/答案参考错配（网络 Q9 缓存稿、Q15 RESTful、项目 Q7 微前端/Q8 SSR/Q9 监控/Q10 部署、性能 Q1/Q2/Q4 精度升级、工程化 Q4 HMR）
- 新增知识文件 `VueRouter/vue-router-4.md`（249 行，VR4 新特性 + Composition API + NavigationFailure），题库 Q8 已改挂

**Phase 3 第 1 批（事实审计，123 文件，修复 40 P0 + ~180 P1）**:
- **浏览器**（16 P0）: cookie Lax 攻击面示例错误、nginx `etag off` 指令错误、CSP unsafe-eval 方向反、Mixed Content 行为反、4 个安全篇 shell 脚本残留清理、Lighthouse 12 移除 PWA 维度等
- **JavaScript**（8 P0）: async 输出题答案错（`1 3 4 2 5`→`1 3 4 5 2`）、Proxy receiver 演示用错属性类型、SharedArrayBuffer transfer 方向反、DataView 字节序示例输出错等
- **Vue3**（13 P0）: lifecycle 父子挂载顺序图错、KeepAlive「销毁重建」实为 DOM move、SSR 渲染器机制三连错、v-if+v-for「编译器退化」虚构机制、nextTick 宏任务渲染时机方向反等
- **CSS**（2 P0）: at-layer !important 反转方向完全反、sticky overflow:clip 说反（clip 恰是保 sticky 的方案）
- **工程化**（1 P0）: ESM 循环引用示例整段不可运行且结论全错；7 项版本时效修正（husky v9、ESLint 9 flat config、Node 22 require(esm)、Tailwind v4 等）

### Phase 1 全模块真题校验（17/17）

以近半年真实面经为基准，对全部 17 个模块题库做差集校准。每模块搜索 10-20 个面经来源，产出差异报告后统一应用。

- **总量变化**：~284 → ~340 道题（新增 56 道高频缺失题）
- **新增题亮点**：CSS 盒模型/flex:1（必考第一题此前缺失）、Vue3 v-if vs v-show（秒答级必考）、网络 GET vs POST（面经第一高频）、TS 可辨识联合、VueRouter VR4 新特性、Pinia 响应式原理/状态边界（具名真题）、前端架构 Monorepo+qiankun 沙箱三连（3→9 题）、HR offer 博弈/空窗期、手写题 CSS 手写分类、算法 DFS/双指针/哈希分组
- **权重校准**：~70 处星级调整——纠正「高星过密」（浏览器 8 处降星恢复区分度）、系统性低估的基础秒答题升星（ref vs reactive、防抖节流、HTTP 缓存、离职原因等）
- **P0 事实错误修正**：Pinia Q1 两条（Vuex5 说法失实、mutation 存在理由错误归因 defineProperty）；VueRouter Q6 重写为 VR4 语义（isNavigationFailure 替代 catch 吞错）+ Q3 `*` 通配符改 `:pathMatch(.*)*`；CSS Q18 层叠 !important 方向写反；Git master→main
- **内容现代化**：JS 深拷贝补 structuredClone、Q32 XHR 重心改 fetch+AbortController、性能 Q11 TBT 锚点改 INP、HTML loading=lazy 兼容性表述更新、工程化补 Vite 预构建/Rspack/迁移实战
- **格式修复**：JS 16 处标题乱码统一、工程化/HR 编号断档重排、浏览器 Q17/Q18 与性能 Q11 与网络 Q16 补齐模板段落、CSS Q12/Q17 重复题合并
- **结构同步**：题库 index 计数 12 处更新；HR 双文件（面试题库/HR.md 与 HR/面试题.md）同步为 17 题
- **覆盖率缺口清单**：详见 `.ai/audit-phase1-log.md`（~25 项，Phase 2/3 处理）

### CICD 题库真题校准

- **权重调整**：2 处——Q4 灰度发布升 ⭐⭐⭐⭐（补「快速回滚」追问 + 延伸 `gray-release.md`）；Q2 Docker 降 ⭐⭐（3 年前端岗多为加分项，30秒答补多阶段构建）
- **内容修正**：Q3 答案参考 `jenkins.md` → `../工程化/eslint-husky.md`（主题匹配）；Q1 追问补「CI 构建加速」
- **新增 2 题**：Q5 部署后如何通知用户刷新（⭐⭐⭐⭐ 中级，version.json 轮询/WS/SW/响应头对比）、Q6 部署后静态资源缓存策略（⭐⭐⭐⭐ 中级，html no-cache + hash 长缓存 + 覆盖式 vs 非覆盖式，延伸交叉引用浏览器题库 Q5）——补齐「部署后」环节缺口
- **覆盖率缺口**：Q5/Q6 暂无精准知识文件，分别暂指 `overview.md` / `webpack.md`——建议后续在 `docs/CICD/` 新建部署策略篇
- **计数同步**：题库 index CICD 4→6

### 网络题库真题校准

- **权重调整**：6 处——Q9 HTTP 缓存、Q4 跨域升 ⭐⭐⭐⭐⭐；Q13 Token 存储升 ⭐⭐⭐⭐；Q14 OSI、Q5 CDN、Q16 MITM 降 ⭐⭐⭐
- **题目扩展**：Q4 从聚焦预检扩展为「同源策略 + 跨域方案全景 + 预检机制」，答案参考改指 `cors.md`；Q7 从「WS vs SSE」扩展为「短轮询/长轮询/SSE/WebSocket 四方案对比」并补选型表
- **新增 Q17**：GET vs POST + HTTP 方法语义（⭐⭐⭐⭐⭐ 初级）——面经第一高频题，答案参考 `http-methods.md`
- **格式修复**：Q16 补齐「考察点/追问预测」段落
- **计数同步**：题库 index 16→17；`网络/index.md` 陈旧计数 15→17

## 2026-07-16（续 8）

### Vue3+TS 文件泛型显示修复

**问题**：`vue3-ts-practice.md` 和 `vue3-ts-answer.md` 中 `defineProps&lt;T&gt;()` 在 backtick 内显示为转义符号文本（`&lt;T&gt;` 而非 `<T>`）。

**根因**：早期为规避 Vue SFC 对 `<T>` 的解析，全局使用 HTML 实体。但实体在 backtick inline code 内不会被浏览器解码为 `<`——直接显示 `&lt;` 文本。

**修复策略**：
- Heading 内 `\&lt;`（破转义）→ `<`：backtick 已保护，无需实体
- Inline backtick code 内 `&lt;T&gt;` → `<T>`：backtick 已保护，无需实体
- Fenced code block 内：原本就是 `<T>`，无需改动
- Bold/plain text 内：保留 `&lt;T&gt;` 实体（不在 backtick 保护范围内，Vue SFC 会解析为 HTML 标签）

修复过程发现 Python `re.sub` 中 `[^\x60]` 会跨行匹配——从一行 backtick 跨越到另一行的 `&lt;`，误改 plain text 实体。修复为 `[^\x60\n]` 限制同行匹配。

## 2026-07-16（续 7）

### 阅读指南 v2 + 复习路线重构

**阅读指南大版本升级**：
- 基于面试官视角重新分档（P0 Offer 决定项 / P1 高频 / P2 知道即可 / P3 按公司）
- P0 项目实战从全部 23 篇收紧为 11 个核心文件，SSE/水印/灰度等移入 P1
- KeepAlive P0→P1，Renderer/Scheduler 补入 P0
- Reflect P0→P2（会配合 Proxy 即可）
- Tree Shaking + Vite 原理 + 首屏优化 + 关键渲染路径 P1→P0
- Web Worker + GC + Observer API P2→P1
- 新增「跨模块知识链」章节：异步编程链 / 页面加载链 / 构建优化链 / 安全链
- 新增「按目标调整」：社招 P6 / 校招 / 冲刺两周

**复习路线重构**：
- 删除手动文件清单，改为引用阅读指南档位
- 时间分配调整：JS 4→3 周，Vue 3→2.5 周
- 新增跨模块知识链练习到第四阶段完成标准

## 2026-07-16（续 6）

### 阅读指南 + 手写题验证 + 状态清理

**新增阅读指南**：
- 创建 [阅读指南](阅读指南.md)——基于四档优先级分档体系（🔴精读/🟡理解/⚪速览/⚫可砍），以差异化优势（项目实战+Vue3/TS深度）为核心定位
- 首页 + 导航栏增加入口

**手写题 P0 代码验证（51/51 通过）**：
- 完整测试：Promise（16项）/ bind-call-apply / new / deepClone / debounce-throttle / EventEmitter / compose-pipe / LRU / concurrency-control
- **修复 2 个真实 bug**：
  - `promise.md`：`resolve` 和 `fulfill` 未分离——对数组等非 thenable 对象调用 `Promise.all()` 时 `resolve(results)` 无限递归（`resolve` → `resolvePromise` → `resolve` 循环）。修复：构造函数中拆分 `fulfill`（直接设值）和 `resolve`（检查 thenable 后调用 `fulfill`），`resolvePromise` 在非 thenable 分支调用 `fulfill` 而非 `resolve`
  - `debounce-throttle.md`：`leading=true, trailing=false` 模式缺冷却定时器——每帧都触发 leading 回调退化成了 throttle。修复：始终设置定时器作为冷却期，`trailing` 仅控制冷却结束后是否补执行

**手写题题库更新**：
- 新增 7 题：curry / flatten-unique-sort / tree-conversion / instanceof / version-compare(LazyMan+继承) / object-flatten / Promise.allSettled+any
- 12→19 题，P0/P1/P2 计数更新

**状态字段清理**：
- `status: draft` → `reviewed`（≥200行，237篇）
- `status: draft` → `filled`（100-199行或内容完整的短篇，141篇）
- 0 篇残留 draft——无空占位文件

**TODO 误报确认**：
- 之前 grep 到的 ~30 个 "TODO/待补充" 全部是误报：代码示例中的 `placeholder` 属性/CSS 伪类、curry 占位符功能、模拟面试中故意的练习题模板

## 2026-07-16（续 5）

### 回答稿补齐 + 结构修复（问题 1-8）

**新增 7 篇回答稿（60→67）**：
- HTML 4 篇：semantic-doctype / script-lazy-loading / form-meta-viewport / canvas-svg-history——覆盖 8 道高频题
- VueRouter 2 篇：history-hash / dynamic-routing——覆盖 Q1/Q3
- CSS 1 篇：display-visibility-opacity——覆盖 Q3 隐藏方式对比

**结构修复**：
- sidebar 面试题库补 手写题/算法/CICD/前端架构 4 条目
- sidebar 面试回答新增 HTML(4) + VueRouter(2) + CSS display-visibility(1) 条目
- 面试回答/index.md 67 篇清单完整更新
- 算法/array.md 补版本号比较 + 大数相加两节
- 项目实战/index.md 补 mindmap(错误监控) + 学习顺序三组 19 篇 + 推荐路线
- 交叉链接：性能优化/bundle-optimization ↔ 工程化/code-splitting 互链
- 首页 面试题库 11→16 题集同步

---

## 2026-07-16（续 4）

### HTML + VueRouter + Pinia + Git + CICD 模块深度审计（Phase 2-3）

2 个并行 agent 审计 42 个文件，发现并修复 **14 个确认事实错误**。

**HTML 知识文件（7 修复）**：
- `history-api.md`：**严重**——Vue Router 守卫执行顺序遗漏 3 步骤（beforeRouteUpdate/beforeEnter/beforeResolve），已补全为 12 步完整流程
- `web-worker.md`：**严重**——Dedicated Worker "同名不能重复创建" 错误（混淆了 Shared Worker 行为），已删除
- `block-inline.md`：`<a>` 被错误归类为"块级内容模型"→修正为 phrasing content + transparent 内容模型
- `canvas-svg.md`：`addHitRegion` API 已从规范移除（不是"兼容性差"），已删除
- `src-href.md`：preload+prefetch 混用"加载两次"改为行为依赖浏览器实现
- `responsive-images-resource-hints.md`：`alt="Hreo"` 拼写修正

**VueRouter 知识文件**：16 个文件全部通过，守卫顺序（route-guards.md）正确。

**Pinia 知识文件（4 修复）**：
- `persist.md`：**严重**——`!` 排除前缀语法不存在于 pinia-plugin-persistedstate，已删除
- `vs-vuex.md`：Pinia 体积 ~1KB→~5-6KB（绝对值修正）
- `state.md`：storeToRefs 简化版判断逻辑修正
- `defineStore.md`：拼写修正

**Git 知识文件**：7 个文件全部通过（merge/rebase/reset/stash/冲突/git-flow 描述均正确）。

**CICD 知识文件（3 修复）**：
- `docker.md`：Compose v2 移除 `version` 字段
- `github-actions.md`：secrets 标题过度简化修正
- `stash.md`：`git stash save` 已弃用标注

---

## 2026-07-16（续 3）

### CSS + 工程化 + 性能优化模块深度审计（Phase 2-3）

3 个并行 agent 审计 39 个文件，发现并修复 **~20 个确认事实错误**。

**CSS 知识文件（9 修复）**：
- `stacking-context.md`：**严重**——`position:fixed` + `z-index:auto` 不创建层叠上下文（CSS 2.1 规范明确要求 z-index ≠ auto）
- `at-layer.md`：**严重**——级联顺序遗漏"非 layer !important"最高优先级；layer 内 !important 反转方向确认
- `center-layout.md`：**严重**——transform 不触发重绘（paint）只触发合成（composite），原表述将两个阶段混淆
- `css-performance.md`：**严重**——`contain:strict` 不含 `style`（已从规范移除），实际为 `size layout paint`
- `responsive.md`：`100dvw` 解决移动端地址栏问题，不解决桌面端滚动条
- `box-model.md`：Firefox textarea/select 默认 `border-box` 已统一（Firefox 83+, 2020）
- `bfc.md`：移除已废弃的 `overflow: overlay` 值
- `specificity.md`：未分层样式概念澄清（非"匿名最高层"）

**工程化知识文件（6 修复）**：
- `vite.md`：HMR 不生效原因修正（`defineProps`/`defineEmits` 是编译时宏，不影响运行时依赖图）
- `babel-esbuild.md`：esbuild `??=` 语法降级例子过时→改为 decorator 提案；SWC 版本标注 Vite 6→Vite 3.x
- `vite-deep.md`：DCE 粒度描述修正
- `bundle-optimization.md`：**严重**——terserOptions 配置在默认 esbuild 压缩下不生效，需 `minify:'terser'`

**性能优化知识文件（1 修复）**：
- `web-vitals.md`：INP 百分位定义从过时的"第 75 百分位"修正为"每 50 次交互忽略 1 离群值取 max"

**回答稿（2 修复）**：
- `specificity.md`：**严重**——@layer 中 !important 优先级方向反转（先说"后声明赢"→正确是"先声明赢"）；补全完整级联顺序表

### Phase 2 覆盖率修复

- CSS index：回答稿计数 2→4 篇
- 工程化 index：回答稿计数 1→4 篇
- CSS 题库 Q18：@layer 答案参考从 grid.md 修正为 at-layer.md

---

## 2026-07-16（续 2）

### 浏览器 + 网络模块深度审计（Phase 2-3）

3 个并行 agent 审计 37 个文件（对照 Chrome 行为、RFC 规范、MDN），发现并修复 **14 个确认事实错误**。

**浏览器知识文件（6 修复）**：
- `cookie.md`：SameSite 默认值变更时间 "2026 年前"→ Chrome 80（2020/02）；4KB 大小限制澄清仅 name=value
- `v8-engine.md`：Mermaid 编译管线补全 Sparkplug + Maglev（四层架构）；TurboFan 取代时间 2015→2017(Chrome 59)；Pre-Parser vs Lazy Parser 区分
- `csp.md`：**高危**——"CSP 不能防 innerHTML 注入的事件处理器"修正——内联事件属性属于内联脚本，受 script-src 管控

**网络知识文件（5 修复）**：
- `http-https.md`：TLS 1.2 握手补全 ECDHE 密钥交换 + 前向安全性说明（原描述仅覆盖 RSA 模式）
- `http2-http3.md`：0-RTT 补充重放攻击风险（仅用于幂等请求）
- `tcp.md`：cwnd 初始值 1 MSS→~10 MSS（RFC 6928, IW10, 2013年），标注老教材已过时
- `fetch-api.md`：credentials 默认值描述修正（`same-origin` 而非 `omit`）
- `dns-cdn.md`：Mermaid 图标注修正——本地 DNS 向上查询为迭代而非递归

**回答稿（3 修复）**：
- `url-to-page.md`：async 脚本执行时仍暂停 DOM 解析（下载时才不阻塞）
- `http-https.md`：304 从"3xx 重定向"分类中独立说明（协商缓存非重定向）
- `dns-cdn.md`：30 秒版递归/迭代施动主体修正（浏览器→本地 DNS 是递归，本地 DNS 向上是迭代）

### Phase 2 覆盖率修复

- 浏览器 index：mindmap + 学习顺序 + 表格 补齐 cross-tab-communication
- 网络题库：Q2/Q3/Q5/Q8/Q12 补 🎤 回答稿链接

---

## 2026-07-16（续）

### JavaScript + Vue3 模块深度审计（Phase 2-3）

4 个并行 agent 审计 45 个文件（对照 ECMAScript 规范、Vue3 源码、MDN），发现并修复 **14 个确认事实错误**。

**JS 知识文件（4 修复）**：
- `this.md`："动态作用域"术语修正为"动态绑定"（JS 是词法作用域）
- `event-loop.md`：nextTick 实现注释修正（多级降级是 Vue2 而非 Vue3）
- `promise.md`：finally 行为描述补全（回调抛异常/reject 可改变链状态）
- `class-extends.md`：class 声明"不会提升"→"会提升但进入 TDZ"

**Vue3 知识文件（5 修复）**：
- `scheduler.md`：effect 优先级描述修正（computed 不走 scheduler 队列，三队列: pre → 主 → post）
- `vue3-full-pipeline.md`：PatchFlags 补 STYLE=4；watch callback 确认走 scheduler 回调
- `lifecycle.md`：onMounted 保证子组件已挂载（除 Suspense 异步组件）
- `diff-patch.md`：O(n) 表述澄清（Block Tree + PatchFlag 接近 O(动态节点数)，LIS 理论 O(n log n)）

**JS 回答稿（5 修复）**：
- `event-loop.md`：UI 渲染从宏任务列表移除（Event Loop 独立步骤）
- `prototype-chain.md`："每个函数都有 prototype"→ 排除箭头函数
- `async-await.md`：补 ES2022 顶层 await
- `deep-clone.md`：Map key 也需深拷贝

**Vue3 回答稿（3 修复）**：
- `diff-patch.md`：**严重**——30 秒版+2 分钟版将 Vue2 四方向双端对比错误描述为 Vue3 算法；已修正为两方向+早期退出+LIS 五步法
- `reactivity.md`：嵌套 ref 解包区分 reactive 代理对象 vs 普通对象
- `nextTick.md`：setTimeout 执行时机表述精度提升

### Phase 2 覆盖率修复

- JS index.md：知识地图+学习顺序+表格 补齐 var-let-const/array-methods/modules 3 篇；计数 22→32 题/6→12 回答
- Vue3 index.md：补齐 template-syntax/fallthrough-attrs/async-components/dynamic-components-plugins-ssr 4 篇；计数 17→19 题
- 题库 JS Q7/Q11/Q24/Q30 补 🎤 链接；Q9 🎤 从 closure 修正为 var-let-const

## 2026-07-16

### 全模块知识覆盖率审计

- **知识覆盖率审计**：9 核心模块（JS/Vue3/HTML/CSS/浏览器/网络/TS/工程化/性能优化）+ 5 剩余模块（VueRouter/Pinia/Git/CICD/前端架构）并行审计
- **~35 个新知识文件**：覆盖 CSS(@layer/包含块/:has()/容器查询)、HTML(可访问性/响应式图片/Web Components)、浏览器(跨标签页通信)、Vue3(条件渲染/透传/异步组件/动态组件)、网络(UDP/HTTP方法/代理负载均衡)、工程化(ESLint/Code Splitting/Rollup)、安全(认证安全/数据泄露)、Git(reflog/diff/log/blame) 等
- **新题目**：手写题 12 题、算法 20 题、CICD 4 题、架构 3 题
- **Sidebar 同步**：15 个模块新增条目，build 0 dead link

### 结构调整（方案 Phase B 补完 + Phase D/E）

- **性能优化 +2**：`caching-strategy.md`（四层缓存体系）、`network-optimization.md`（Resource Hints + 压缩 + CDN + HTTP2）
- **网络 +1**：`fetch-api.md`（fetch vs XHR + AbortController + Stream + 三个陷阱 + axios 对比）
- **首页**：25 行平铺表 → 5 分组结构（核心基础/框架生态/工程实践/算法手写/面试冲刺）
- **Plan Mode 方案**：melodic-juggling-muffin.md（8 个结构性问题校验）

### 题型工程

- 新建 `面试题库/手写题.md`（12 题）、`面试题库/算法.md`（20 题）、`面试题库/CICD.md`（4 题）、`面试题库/前端架构.md`（3 题）

## 2026-07-15

### TypeScript 模块 5 阶段审计

- **Phase 1 真题校验**：11→18 题（新增 Q7 TS vs JS / Q10 interface vs type / Q12 void vs never / Q14 typeof/keyof / Q16 协变逆变 / Q17 函数重载 / Q18 enum；Q2/Q5/Q11/Q15 调权）
- **Phase 2 覆盖率**：知识文件 7→14 篇（basic-types/structural-typing/type-narrowing/as-const/enum-class/tsconfig/vue3-ts-practice）；回答稿 1→11 篇（新增 interface-type/extends-infer/keyof-mapped/type-gymnastics/covariance；扩展 generics-utility Q3）
- **Phase 3 事实审计**：4 agent 并行，发现并修复 15 处问题（4 错误+6 存疑+3 satisfies 字面量类型+2 题库链接）
- **Phase 5 结构收尾**：sidebar 5 组分类 + 学习顺序分组 + 首页计数同步

### JavaScript 模块

- **Phase 1 真题校验**：22→32 题（新增 Q23 隐式类型转换 / Q24 Promise 并发调度 / Q25 函数柯里化 / Q26 数组扁平化 / Q27 EventEmitter / Q28 LRU 缓存 / Q29 继承方式 / Q30 defineProperty vs Proxy / Q31 迭代器 / Q32 AJAX/fetch；拆 Q12 + 增强 Q20）
- **Phase 2 回答稿**：6→12 篇（新增 async-await/深拷贝/new-operator/var-let-const/promise-scheduler/defineproperty-proxy）

### 其余 7 模块 Phase 1 真题校验

- Vue3 +2 题（Teleport/Suspense、事件总线）、浏览器 +2（DOM事件流、跨标签页通信）、网络 +1（HTTPS中间人攻击）、CSS +2（层叠上下文、@layer）、HTML +2（dialog/Popover、SEO meta）、工程化 +1（npm安全审计）、性能优化 +1（长任务拆分）
- 回答稿补齐：CSS +2（水平垂直居中、选择器优先级）、工程化 +2（构建优化实战、TreeShaking/HMR）、浏览器 +1（存储方案）、网络 +1（DNS/CDN）
- 回答稿总计 53 篇

### 项目基础设施

- **CLAUDE.md**：项目规范+模板+5阶段审计流程+已知坑
- **全局 CLAUDE.md**：`~/.claude/CLAUDE.md`——思维原则+沟通方式+红线+工程纪律
- **性能优化**：Mermaid 按需加载（页面无脑图跳过 ~1MB 库加载）
- **memory/project-overview.md**：计数同步（2026-07-15）

### 技术事实修复（TS 模块）

- any-unknown-never: `let n: never` 不初始化编译不通过 → throwError()
- extends-infer: `never extends string` 直接写不触发分发，结果为 yes 非 never
- tsconfig: skipLibCheck 跳过所有 .d.ts，typeRoots 不能绕过
- vue3-ts-practice: defineEmits 版本标注颠倒（3.2 函数签名 / 3.3 命名元组）
- satisfies: typeof colors.red 不加 as const 时为 string 非字面量

### 原型链知识补全

- 完整原型链图（Function/Object 构造函数节点 + async/生成器函数例外 + 箭头函数无 prototype）

## 2026-07-13

- **setup 执行时机精确化**：4 处 "创建组件实例之前/组件实例尚未创建" 修正——setup 时内部实例已存在（props 已挂上），不可用的是 Options API 上下文（`this`），不是实例本身。涉及 `lifecycle.md` / `composition-api.md` / `round-1-vue.md`

### 网络模块覆盖率补强

- **+2 知识文件**：`osi-model.md`（OSI 七层/TCP-IP 四层/TCP vs UDP）、`http-cache.md`（从 http-https.md 独立——强缓存+协商缓存+项目策略）
- **+2 回答稿**：`面试回答/网络/tcp.md`、`面试回答/网络/http2-http3.md`
- **mindmap 四组重排**：协议与模型/缓存与安全/基础设施/数据交互
- **学习顺序分组**：四组 9 篇（7→9）
- **题库修复**：Q4 🎤 修正（http-https→cors）；Q14 补 OSI 七层模型（编号连续 15 题）；Q9 答案参考更新（http-https→http-cache）
- **同步**：sidebar + 回答稿 index(29→31) + http-https.md 交叉引用补链
- **文件清单**：`osi-model.md` / `http-cache.md` / `面试回答/网络/tcp.md` / `面试回答/网络/http2-http3.md` / `网络/index.md` / `面试回答/index.md` / `网络/http-https.md` / `面试题库/网络.md` / `config.mts`

### 全链路渲染流程

- **新增 `vue3-full-pipeline.md`**：7 阶段全链路——模板编译→应用初始化→首次渲染→数据变更→异步调度→Diff+Patch→浏览器渲染管线。串联 Compiler/Reactivity/Scheduler/Renderer/Diff/Patch/生命周期/nextTick/浏览器渲染 8 大知识领域。sidebar + mindmap + 学习顺序(核心机制#8) + 知识点索引全量同步

### 全文档事实性审计 + 修复（21 处）

6 路 agent 并行审计 ~230 个文件，发现并修复 21 处技术事实性错误：

- **🔴 严重误导**（7 处）：`promise.md` setTimeout 不是微任务；`reactivity.md` ref 不是 Proxy；`Pinia.md` $onAction true 含义反了；`Vue3.md` nextTick 降级链是 Vue2 的、KeepAlive keys 是 Set 不是数组；`bfc.md` flex/grid 不是 BFC；`this.md` `[[ThisMode]]` 归属说反
- **🟡 不准确**（13 处）：async/await 非 Generator 语法糖；provide/inject 响应式表述；Observer 回调时机；frame-src 未废弃；TCP 慢启动/TIME_WAIT；SSR 括号标注错误；内联元素/文本节点混淆；ALLOW-FROM 废弃未标注；falsy 计数；parseInt 旧规则；ArrayBuffer 越界；hash 注释错误
- **修复文件**：`面试回答/JavaScript/promise.md`、`面试回答/Vue3/reactivity.md`、`面试回答/Vue3/component-communication.md`、`面试题库/Pinia.md`、`面试题库/Vue3.md`、`CSS/bfc.md`、`JavaScript/this.md`、`JavaScript/type-coercion.md`、`JavaScript/arraybuffer-typedarray.md`、`浏览器/observer-api.md`、`浏览器/安全/csp.md`、`网络/tcp.md`、`Vue3/lifecycle.md`、`HTML/lazy-loading.md`、`HTML/iframe.md`、`VueRouter/history-vs-hash.md`

### 生命周期描述修正

- **setup 执行时机**：`lifecycle.md` / `composition-api.md` / `模拟面试/round-1-vue.md` 共 5 处 "beforeCreate 和 created 之间" → "beforeCreate 之前"（Vue 3 官方：setup is called before beforeCreate）
- **unmounted 时机**：`面试回答/Vue3/lifecycle.md` "DOM 移除后、组件销毁前" → "组件实例销毁后"（Vue 3 官方：called after the component has been unmounted）

### JS 模块深度修复

- **题库交叉引用修复**：6 处错误链接修正——Q12(数据类型→type-coercion)、Q13(GC→浏览器/gc)、Q14(for-in-of→for-of-for-in)、Q15(浮点数→type-coercion)、Q17(事件委托→浏览器/dom-event-delegation，移除错误🎤)、Q19(Map/WeakMap→set-map-weakmap)
- **🎤 链接补挂**：Q4(this→this-bind)、Q8(原型链→prototype-chain)、Q16(手写Promise→promise) 回链已有回答稿
- **学习顺序补全**：class-extends/for-of-for-in/generator-iterator 3 个文件从 sidebar 补入学习顺序（15→18 篇）
- **Mindmap 补漏**：for-of-for-in 加入进阶工具分支

### 学习顺序 + Sidebar 对齐

- **Vue3 sidebar 重排**：config.mts 中 18 个条目按学习顺序三组重排（核心机制→组件开发→模式与优化），sidebar 本身成为学习路径
- **JavaScript 学习顺序分类**：三组（核心基础/异步编程/进阶工具），类型转换从 #9 移入核心基础
- **CSS 学习顺序分类**：六组（基础/布局/适配/细节/性能/工程化），继承性归入基础、响应式归入适配；补相关阅读+更新记录
- **HTML 学习顺序分类**：三组（语义与结构/资源与加载/进阶主题）；补相关阅读+更新记录
- **算法学习顺序分类**：三组（基础数据结构/核心算法思想/面试实战），链表+树移入数据结构组
- **工程化学习顺序分类**：三组（包管理与模块/构建工具/样式与质量），pnpm+ESM 归入包管理

## 2026-07-11

### 知识地图 + 学习顺序全量整理

- **Vue3**：mindmap 17→3 大分支（核心机制/组件体系/API与模式）；学习顺序三组分组
- **JavaScript**：mindmap 3 组缩并（核心基础/异步编程/进阶工具）；学习顺序编号修复（补 #13）+ 微调
- **算法**：学习顺序编号去重（修复 #5 出现三次的 bug）+ 滑动窗口去重；mindmap 三组缩并
- **工程化**：补 vite.md / testing.md / esm-module.md 到学习顺序、知识点索引和 mindmap；mindmap 扩大覆盖 Node.js/测试/日志/监控

### 题库全量结构修复

- **结构重排**：10 个文件 ~130 题——30秒答+追问预测从"题目之前"移到"考察点之后"。统一为：标题→频率/难度→题目→考察点→30秒答→追问预测→参考链接
- **JS 追问预测补全**：14 题（Q2/Q5/Q8-Q19）补全追问预测块
- **CSS 格式统一**：`## Q{n}：`→`### Q{n}: `（H2→H3，中文冒号→英文冒号），与其他 14 个文件对齐

### Vue3 模块补强（第二轮）

- **+3 知识文件**：`vue3-vs-vue2.md`（七维度全方位对比）、`transition-animation.md`（Transition/TransitionGroup 动画）、`vue3-performance.md`（四层优化 checklist）
- **+3 sidebar 补漏**：插槽深入、Composables 实战、前端测试体系——此前有文件但网站 sidebar 不可见
- **🎤 链接修复**：Q3→computed-watch、Q4→nextTick、Q6→composition-api、Q9→lifecycle、Q16→v-model（此前创建回答稿后忘回链题库）
- **Q8 知识引用**：Vue3 vs Vue2 答案参考指向新增的 `vue3-vs-vue2.md`
- **diff-patch.md**：新增 `## 编译时优化` 章节（PatchFlag/Block Tree/静态提升/预字符串化）
- **composition-api.md**：新增 `## Vue3 + TypeScript` 章节（defineProps 泛型 / 泛型组件 / defineModel 类型）
- Vue3/index.md 学习顺序 + 知识点索引补全 5 个新条目
- frontmatter：Vue3/index.md 补字段；slots-deep+composables-practice draft→reviewed
- HTML Q12 / 项目 Q1 Q10 补 VueRouter 交叉引用
- Vue3 模块 14→17 篇知识文件，sidebar 18 条目全对齐

### Vue3 生态三模块重构

**Vue3 模块**：
- 题库题号重排（Q13→Q12, Q14→Q13, Q16→Q14, Q17→Q15）+ Q12 补 30秒答+追问预测
- +2 题库题：v-model（Q16）+ 组件通信（Q17），覆盖了此前知识文件有但题库无的高频题
- 交叉引用修正：Q8（Vue3 vs Vue2）index.md→reactivity+composition-api，Q14（Pinia）composition-api→Pinia/vs-vuex
- 题库 15→17 题
- +5 回答稿：nextTick / 生命周期 / computed-watch / Composition API / v-model（3→8 篇）
- +2 知识文件：插槽深入 / Composables 实战
- v-model.md 补 defineModel 段落（Vue 3.4+）
- index.md 补相关阅读区（链向 VueRouter/Pinia/题库/回答稿）

**VueRouter 模块**：
- 新建 面试题库/VueRouter.md（7 题）——路由守卫/动态路由/history vs hash/懒加载/KeepAlive Router/导航故障/scrollBehavior
- sidebar + 题库 index + config.mts 全量同步

**Pinia 模块**：
- 新建 面试题库/Pinia.md（7 题）——vs Vuex/storeToRefs/Setup vs Options/持久化/$patch/$onAction/插件
- index.md status draft→reviewed
- sidebar + 题库 index + config.mts 全量同步

**其他**：
- +1 工程化知识文件：testing.md（Vitest+Vue Test Utils+Playwright）
- VueRouter index.md 补相关阅读区
- HTML Q12 / 项目 Q1 Q5 交叉引用补链
- 题库总数 177→193 题，回答稿 24→29 篇

### 安全模块重构

- **删除重复文件**：`浏览器/xss-csrf.md`（内容已拆分在 `安全/xss.md` + `安全/csrf.md`）、`浏览器/browser-security.md`（内容分布到新文件）
- **+3 知识文件**：
  - `安全/clickjacking.md`：点击劫持 + X-Frame-Options + iframe sandbox + X-Content-Type-Options
  - `安全/https-security.md`：HSTS + 证书链 + Mixed Content + TLS 握手 + mkcert
  - `安全/supply-chain-security.md`：SRI + npm audit + 原型污染 + lockfile + CI 安全集成
- **+2 回答稿**：`csp.md`（CSP 白名单+nonce/hash+灰度部署）、`token-storage.md`（Cookie vs LocalStorage+双Token策略）
- **安全/index.md 重写**：mindmap 4→7 节点、学习顺序 4→7 篇、交叉引用补全
- 浏览器模块 `config.mts` / `index.md` / 交叉引用全量同步（URL 重定向到新文件）
- 题库安全 Q5/Q6/Q7 交叉引用指向新知识文件
- 回答稿清单 22→24 篇

### 题库编号修复

- CSS 题库：Q12→Q15 题号跳跃修复，重排为 Q13→Q16（16 题连续编号）
- JavaScript 题库：Q14→Q16 题号跳跃修复，Q16-23 顺移为 Q15-22（22 题连续编号）
- HTML 题库：15 题重新连续编号 Q1-Q15（原 19 个位置含 4 个空号），统一 `### Q{n}:` 格式和 Q 前缀
- HTML 章节计数修正：语义化 6→5、加载与性能 4→3、元素与事件 5→3、路由与架构 3→4
- 题库首页统计修正：JavaScript 19→22，总计 174→177

### JS 30秒答修复

- 修复 13 处 30秒答错位：Q2/Q5/Q8-Q19 的 30秒答曾被误插入 Q3/Q6/Q20 的 section
- Q14（for...in vs for...of）补全缺失的 30秒答

## 2026-07-10

### 结构重整

**导航分层**：
- 首页 25 行平铺表 → 5 组分层导航（核心基础 / 框架生态 / 工程实践 / 算法手写 / 面试冲刺）
- 路线图加入性能优化、TypeScript、面试回答引用

**模块物理合并**（子目录方式）：
- 安全/ → 浏览器/安全/
- Node/ → 工程化/Node/
- 日志监控/ → 工程化/日志监控/
- 微前端/ → 前端架构/微前端/
- 25 模块 → 21 模块，sidebar 改为折叠子分组

**分组优化**：
- TypeScript 从核心基础移入框架生态（与 VueRouter/Pinia 并列）
- 前端架构 + 微前端 → 架构设计
- 工程实践组 9→7 个模块

### 模块补强

- 性能优化 +2：缓存策略体系（四层缓存 + 决策树）、网络传输优化（Resource Hints + CDN + HTTP2）
- 网络 +1：Fetch API 深度解析（四个陷阱 + AbortController + Stream + axios 对比）
- 算法 +1：堆（二叉堆手写 + Top-K + 数据流中位数）

### 面试回答扩充（15→22）

- CSS +2：盒模型/BFC、Flex/Grid/居中
- TypeScript +1：泛型/工具类型
- 工程化 +1：Vite/Webpack
- 项目 +3：权限RBAC、大文件上传、项目性能优化

### 模拟面试充实（4→6）

- 一面：网络 + 安全（45min 10 题）
- 二面：架构设计（60min 7 题）

### 题库重构

- AI 交叉校验：173→148 题，剔除 26 道低频小众题
- 新增 3 份：性能优化(10 题)、安全(8 题)、Git(8 题)，148→174 题
- 格式统一：HTML entity ⭐→文本、难度 通用/中高级→初级/中级/高级
- 打通题库→回答：8 份题库添加 🎤 回答稿链接
- HR 题库移至 HR/面试题.md

### 规范更新

- **新增「选题与模块治理」章节**：选题三问、模块归属规则、篇幅深度边界
- **新增「题库写作规范」章节**：6 题型模板 + 演化规则 + 通用兜底
- 标准化：difficulty 值统一为初级/中级/高级、清理未定义 section 字段、修复废弃 status 值

---

## 2026-07-09

### 新增

**HTML 模块大规模扩展**（9 篇 + 面试题库）：
- HTML5 表单与约束验证（input 新类型、Constraint Validation API、校验伪类）
- History API 与 SPA 路由（pushState/popstate、hash vs history 模式底层实现）
- Canvas vs SVG（13 维对比、API 速查、第三方库选型、Retina 适配）
- iframe（postMessage 安全三要素、sandbox 沙箱、点击劫持攻防）
- Web Worker（Dedicated/Shared/Service Worker 对比、Transferable、OffscreenCanvas）
- Web Components（Custom Elements + Shadow DOM + Template、事件 retarget）
- a 标签全面解析（tabnabbing 攻击防御、rel 属性全集、ping 埋点）
- HTML 实体与编码（XSS 转义函数、URL 编码、多上下文转义规则）
- 面试题库 HTML 卷（20 题，含频率/公司来源/答题要点/参考答案链接）

### 更新
- HTML 知识地图 mindmap 从 5 分支扩展到 11 分支
- HTML 学习顺序从 6 篇扩展为 15 篇
- 侧边栏 HTML 条目从 8 个增至 16 个

---

## 2026-07-08

### 新增

**JavaScript 模块**：
- 生成器 / 迭代器（iterator protocol、generator yield、async iteration、Redux-Saga 风格）
- Proxy / Reflect（13 个 Proxy traps、vs Object.defineProperty、Reflect receiver、手写 reactive）
- ArrayBuffer / TypedArray（ArrayBuffer/TypedArray/DataView、字节序、5 个项目场景）
- 跨 Realm 场景（Realm 概念、instanceof 跨 Realm 失败、postMessage 结构化克隆、微前端隔离）

**浏览器模块**：
- DOM 事件机制与事件委托（3 阶段事件流、e.target vs e.currentTarget、closest()、非冒泡事件）

**CSS 模块大规模扩展**（11 篇 + 面试题库）：
- 选择器优先级（4 位数权重模型、!important/:is()/:where()/@layer）
- CSS 继承性（可继承属性清单、4 个关键字、a 标签不继承）
- position 定位（5 种定位模式、containing block、sticky 失效、fixed transform 背叛）
- 伪类 vs 伪元素（4 大类伪类、伪元素全集、clearfix vs BFC）
- CSS 渲染性能（CSS Triggers 3 阶段、will-change/contain/content-visibility）
- 移动端 1px（dpr 原理、4 种方案对比）
- transition vs animation（触发对比、steps()、animation 事件）
- 三栏布局（5 种方案：Flex/Grid/圣杯/双飞翼/calc）
- 文本溢出省略（单行 3 属性、多行 4 属性 line-clamp）
- 面试题库 CSS 卷（20 题）
- tailwindcss（Utility-first、Tree Shaking、对比矩阵）

### 修复
- Mermaid Gantt 图 parse error（dateFormat X + "9.7s" 导致 "Invalid date"）→ 替换为 flowchart
- 提交信息英文改中文（8 个 commit message 重写）

---

## 2026-07-07

### 修复
- Mermaid flowDiagram-v2 504 错误（Vite optimizeDeps 预构建 mermaid 子模块 chunk 过期）→ 添加 `optimizeDeps.exclude: ['mermaid']`
- 搜索框不显示（config 在项目根目录 `.vitepress/` 而非 `docs/.vitepress/`）→ 移动配置文件
- Ctrl+K 跳转浏览器 URL 栏（自定义快捷键与 VitePress 原生 Ctrl+K 冲突）→ 移除非原生代码
- 侧边栏语法错误（3 处 `], [` 在对象字面量中）→ 修复为 `}, '/key/': [`
- ESM config 加载错误（`.ts` 导致 esbuild `require('vitepress')`）→ 重命名为 `.mts`
- Mermaid CDN 追踪防护警告（cdn.jsdelivr.net 第三方 localStorage 被浏览器阻止）→ 生产构建改用 `import('mermaid')` 同源打包
- favicon 部署环境不显示（static head 中 `href="/favicon.svg"` 不被 VitePress 自动加 base 前缀）→ 改用 `transformHead` 读取 `siteData.base`
- YAML frontmatter 解析报错（`!important`、`:is()`、`::before` 等被 YAML 解释为 tag/键值对）→ 加引号转义

### 新增
- Ctrl+K 搜索中文翻译（button、modal 全部中文化）
- SVG favicon（蓝色渐变圆角方块 + 白色 `</>`）

---

## 2026-07-06

### 新增

**JavaScript 模块深度填充**（11 篇）：
- this、call/apply/bind、new、闭包、原型链
- Promise、Event Loop、async/await
- 深拷贝、防抖/节流

**CSS 模块**：
- 盒模型、BFC、层叠上下文、Flexbox、Grid、居中方案
- 响应式、rem/vw、CSS 变量、BEM 命名、CSS Modules/Scoped

**HTML 模块**（7 篇）：
- HTML5 语义化、DOCTYPE/Meta、defer/async
- 块级/行内元素、src/href、图片懒加载
- SEO/SSR/CSR/Hydration

**Vue3 模块深度填充**（11 篇）：
- 响应式原理、computed/watch、nextTick、生命周期
- Diff/Patch、KeepAlive、Teleport/Suspense
- Composition API、Renderer、Scheduler

**手写题模块**（8 篇）：
- Promise、bind/call/apply、new、debounce/throttle
- 深拷贝、EventEmitter、compose/pipe

---

## 2026-07-05

### 新增
- 项目初始化：VitePress + 目录结构 + 所有模块骨架
- 17 个模块目录、15 个 index.md 知识地图
- ~120 个知识点占位文件
- Spec v1.1 设计文档
- Writing Rules 写作规范
- Roadmap 复习路线
- .ai/prompts (Writer + Reviewer)

### 计划
- Phase 2：JavaScript + Vue3 + 手写题 深度填充

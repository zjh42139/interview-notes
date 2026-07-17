---
title: HTML 面试题库
description: HTML 高频面试真题，含难度分级和参考答案索引
category: 面试题库
type: interview
score: 0
difficulty: 初级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-09
updated: 2026-07-18
reviewed: null
tags:
  - HTML
  - 面试题
  - 真题
---

---
# HTML 面试题库

> 20 道高频 HTML 面试题，按频率排序。每道题标注难度和参考答案索引。

## HTML5 语义化（5 题）

### Q1: HTML5 新增了哪些语义化标签？和 div 有什么区别？

**30秒答**：header/nav/main/article/section/aside/footer 语义标签替代 div。三个价值：SEO 权重分配、读屏器无障碍导航、代码可读性。article 独立完整可分发；section 需上下文。

**追问预测**：
- "article 和 section 的区别" → article 独立完整内容可独立分发；section 是页面中的一个章节需上下文
- "语义化对 SEO 的影响" → 搜索引擎给 header/nav/main/article 更高权重——理解页面结构
- "dialog 原生弹窗怎么用" → showModal() 打开+::backdrop 遮罩+form method=dialog 自动关闭
> 🏷️ 概念题

**频率**：⭐⭐⭐⭐⭐

**答题要点**：
- 列出 `<header>` `<nav>` `<main>` `<article>` `<section>` `<aside>` `<footer>` 等标签
- 说清 `<article>` vs `<section>` vs `<div>` 的区别（独立性、是否有标题、是否有语义）
- 强调三个价值层面：SEO 权重、可访问性（读屏器快捷跳转）、代码可读性
- 提 `<dialog>` 原生弹窗（`showModal` + `::backdrop` + `form method="dialog"`）

**参考**：[HTML5 语义化](../HTML/html5-semantic.md)
> 🎤 回答稿：[30秒+2分钟版本](../面试回答/HTML/semantic-doctype.md)

---

### Q2: DOCTYPE 是干什么的？不写会怎样？

**30秒答**：DOCTYPE 触发标准模式渲染——不写触发怪异模式(IE5 盒模型)。HTML5 简化为 <!DOCTYPE html>。必须文档第一行——前面不能有空行或 BOM。

**追问预测**：
- "怪异模式和标准模式的区别" → 怪异模式模拟 IE5 盒模型 width 含 padding+border
- "HTML4 和 HTML5 的 DOCTYPE 区别" → HTML4 依赖 DTD(SGML)又臭又长；HTML5 简化
- "DOCTYPE 必须是第一行吗" → 必须——前面不能有空行或 BOM，否则任何浏览器都可能触发怪异模式
> 🏷️ 概念题

**频率**：⭐⭐⭐⭐

**答题要点**：
- DOCTYPE 不是 HTML 标签，是声明，触发标准模式渲染
- 不写或写错 → 怪异模式（Quirks Mode），盒模型变为 IE5 行为（`width` 含 `padding` + `border`）
- HTML4 的 DOCTYPE 依赖 DTD（SGML），HTML5 简化为 `<!DOCTYPE html>`
- `<!DOCTYPE html>` 必须是文档第一行（前面不能有空行、BOM）

**参考**：[DOCTYPE / Meta](../HTML/doctype-meta.md)
> 🎤 回答稿：[30秒+2分钟版本](../面试回答/HTML/semantic-doctype.md)

---

### Q3: meta viewport 是干什么的？怎么写？

**30秒答**：width=device-width 布局视口=设备宽度。不写默认 980px 缩小塞进屏幕字很小。三个视口：布局视口(CSS 基准)、视觉视口(屏幕可见)、理想视口(设备宽度)。

**追问预测**：
- "布局视口和视觉视口的区别" → 布局视口 CSS 布局基准（默认 980px）；视觉视口屏幕可见区域
- "user-scalable=no 为什么不好" → 违反 WCAG 无障碍标准——视觉障碍用户无法放大页面
- "viewport 和 @viewport 的区别" → meta viewport 是 HTML；@viewport 是 CSS 已被废弃
> 🏷️ 概念题

**频率**：⭐⭐⭐⭐

**答题要点**：
- `width=device-width` 让布局视口 = 设备宽度（理想视口）
- 没有 viewport meta 时，手机浏览器默认 980px 布局宽度 → 缩小塞进屏幕 → 字特别小
- 三个视口：布局视口、视觉视口、理想视口
- `user-scalable=no` 违反 WCAG 无障碍标准，不推荐
- `maximum-scale=1.0` 禁缩放会降低可访问性

**参考**：[DOCTYPE / Meta](../HTML/doctype-meta.md)
> 🎤 回答稿：[30秒+2分钟版本](../面试回答/HTML/form-meta-viewport.md)

---

### Q4: HTML5 新增了哪些表单特性？

**30秒答**：新增 input 类型 email/url/number/date/range/color。新增属性 required/pattern/placeholder/autocomplete。Constraint Validation API checkValidity/setCustomValidity。CSS :valid/:invalid 伪类。

**追问预测**：
- "Constraint Validation API 怎么用" → checkValidity()/reportValidity()/setCustomValidity()——自定义校验文案
- "input type=date 的兼容性" → 现代浏览器全部支持。移动端体验更好——弹出原生日期选择器
- "怎么自定义表单校验样式" → :valid/:invalid/:user-invalid CSS 伪类——无需 JS
> 🏷️ 概念题

**频率**：⭐⭐⭐⭐⭐

**答题要点**：
- 新增 input 类型（email/url/number/range/date/time/color/search/tel）
- 新增属性（required/pattern/placeholder/autocomplete/novalidate/inputmode）
- 约束验证 API（checkValidity/reportValidity/setCustomValidity/ValidityState）
- CSS 校验伪类（`:valid`/`:invalid`/`:required`/`:optional`/`:in-range`/`:out-of-range`/`:user-invalid`）
- `<datalist>` 自动补全、`<output>`/`<progress>`/`<meter>`

**参考**：[HTML5 表单](../HTML/form-validation.md)
> 🎤 回答稿：[30秒+2分钟版本](../面试回答/HTML/form-meta-viewport.md)

---

### Q5: em 和 i、strong 和 b 有什么区别？

**30秒答**：em 语义强调——读屏器改变语调，SEO 给权重。i 纯视觉斜体——无语义。strong 语义重要/紧急，b 纯视觉加粗。SEO 给 strong 更高权重。

**追问预测**：
- "bold 和 strong 实际表现一样吗" → 视觉一样——但 strong 语义重要/紧急。读屏器会重读 strong
- "什么时候用 i 不用 em" → 图标/术语/外来语——视觉斜体无强调语义
- "b 和 strong 对 SEO 的影响" → SEO 给 strong 更高权重——关键词用 strong 包装有助排名
> 🏷️ 对比题

**频率**：⭐⭐

**答题要点**：
- `<em>` = 语义强调（读屏器改变语调），`<i>` = 纯视觉斜体
- `<strong>` = 语义重要/紧急，`<b>` = 纯视觉加粗
- 面试亮点：SEO 会给 `<em>` `<strong>` 更高权重

**参考**：[HTML5 语义化](../HTML/html5-semantic.md)
> 🎤 回答稿：[30秒+2分钟版本](../面试回答/HTML/semantic-doctype.md)

---


## 加载与性能（3 题）

### Q6: script 标签的 defer 和 async 有什么区别？

**30秒答**：普通 script 阻塞 DOM 解析立即下载执行。defer 异步下载等 DOM 完成后按顺序执行。async 异步下载下载完立即执行不保证顺序。type=module 默认行为同 defer。

**追问预测**：
- "defer 和 async 的执行时机" → defer DOMContentLoaded 前按顺序执行；async 下载完立即执行不保证顺序
- "type=module 的行为" → 默认行为同 defer——异步下载、等 DOM 完成后执行
- "多个 async script 的执行顺序" → 不保证——谁先下载完谁先执行
- "async/defer 对内联脚本有效吗" → 无效——没有 src 的内联脚本会忽略这两个属性，仍同步执行
> 🏷️ 对比题

**频率**：⭐⭐⭐⭐⭐

**答题要点**：
- defer：异步下载、DOMContentLoaded 前按顺序执行、保证执行顺序
- async：异步下载、下载完立即执行、不保证顺序
- 普通：阻塞 HTML 解析、立即下载并执行
- `type="module"` 默认行为等同于 defer
- 实际选择：Sentry/Aegis 用 async、主应用用 defer/module

**参考**：[defer / async](../HTML/script-defer-async.md)
> 🎤 回答稿：[30秒+2分钟版本](../面试回答/HTML/script-lazy-loading.md)

---


### Q7: 图片懒加载怎么实现？有哪些方式？

**30秒答**：loading=lazy 零代码浏览器原生支持。IntersectionObserver 可自定义提前触发距离。首屏图不懒加载——设 fetchpriority=high。响应式 srcset+sizes 配合懒加载。

**追问预测**：
- "loading=lazy 和 IntersectionObserver 怎么选" → loading=lazy 零代码但不可自定义；IO 灵活可控
- "首屏图片需要懒加载吗" → 不需要——首屏图设 fetchpriority=high 优先加载
- "懒加载对 SEO 的影响" → loading=lazy 不影响——搜索引擎能看到 src 属性。JS 懒加载需 SSR 兜底
> 🏷️ 概念题

**频率**：⭐⭐⭐⭐

**答题要点**：
- `loading="lazy"`（全浏览器基线支持，含 Safari/Firefox 及 iframe，零代码）
- IntersectionObserver（~20 行，`rootMargin: '200px'` 提前加载）
- scroll + getBoundingClientRect（不推荐，性能差）
- 首屏图用 `fetchpriority="high"`，不应懒加载
- 响应式图片 `srcset` + `sizes` 配合懒加载
- 提 LQIP（低质量占位图方案）加分

**参考**：[图片懒加载](../HTML/lazy-loading.md)
> 🎤 回答稿：[30秒+2分钟版本](../面试回答/HTML/script-lazy-loading.md)

---

### Q8: preload / prefetch / preconnect / dns-prefetch 是什么？

**30秒答**：preload 当前页立即高优加载(字体/首屏图)。prefetch 下页可能用空闲低优加载。preconnect 提前建连 DNS+TCP+TLS。dns-prefetch 只 DNS 更轻量。同时 preload+prefetch=两次加载。

**追问预测**：
- "同一资源同时 preload 和 prefetch 会怎样" → 加载两次——浏览器警告。不要同时用
- "preconnect 和 dns-prefetch 的区别" → preconnect DNS+TCP+TLS 全建连；dns-prefetch 只 DNS——更轻量
- "preload 的 as 属性为什么重要" → 告诉浏览器资源类型——决定加载优先级
> 🏷️ 对比题

**频率**：⭐⭐⭐⭐

**答题要点**：
- `preload`：当前页面一定需要，立即高优先级加载
- `prefetch`：下个页面可能需要，空闲时低优先级加载
- `preconnect`：提前建立连接（DNS + TCP + TLS）
- `dns-prefetch`：只做 DNS 解析（轻量）
- 同一资源同时用 preload 和 prefetch 会导致**加载两次**

**参考**：[src / href](../HTML/src-href.md)
> 🎤 回答稿：[30秒+2分钟版本](../面试回答/HTML/script-lazy-loading.md)

---

## 元素与事件（3 题）

### Q9: 块级元素和行内元素有什么区别？

**30秒答**：块级独占一行可设宽高。行内不换行宽高无效。行内块不换行+可设宽高。替换元素 img/input/video 行内但可设宽高有内在尺寸。inline-block 间隙是 HTML 换行=空格字符。

**追问预测**：
- "替换元素是什么" → img/input/video——行内但可设宽高。有 intrinsic size
- "inline-block 间隙问题" → HTML 源码换行=空格字符——父元素 font-size:0 或 float 消除
- "display:flow-root 是什么" → 触发 BFC 的新方案——无 overflow:hidden 的副作用
> 🏷️ 对比题

**频率**：⭐⭐⭐⭐

**答题要点**：
- 块级：独占一行、可设宽高、默认宽度 100%
- 行内：不换行、宽高由内容决定、width/height 无效
- 行内块：不换行 + 可设宽高
- 替换元素（img/input/video）：行内但可设宽高，有 intrinsic size
- inline-block 间隙问题（HTML 源码换行 → 空格字符 → baseline 对齐）

**参考**：[块级 / 行内元素](../HTML/block-inline.md)

---

### Q10: Canvas 和 SVG 有什么区别？

**30秒答**：Canvas 位图无 DOM 节点——大量对象性能好但不支持事件。SVG 矢量图每个图形 DOM 可绑定事件——缩放清晰但 1000+节点会卡。Canvas 需处理 Retina(×dpr)；SVG 天生清晰。

**追问预测**：
- "Canvas 为什么模糊" → 没有处理 devicePixelRatio——需 ×dpr 放大再缩小
- "SVG 能做动画吗" → 可以——SMIL 动画或 CSS animation。Canvas 动画需要 JS 逐帧绘制
- "大量对象用 Canvas 还是 SVG" → Canvas——不创建 DOM 节点。SVG 节点多到 1000+ 会卡
> 🏷️ 对比题

**频率**：⭐⭐⭐

**答题要点**：
- 本质：Canvas 位图 vs SVG 矢量图
- 事件：Canvas 无 DOM（需数学判断点击位置）vs SVG 每个图形可绑定事件
- 性能：Canvas 大量对象更优 vs SVG DOM 节点多在 1000+ 时卡
- 缩放：Canvas 模糊（Retina 需 ×dpr）vs SVG 始终清晰
- 选型：上千个对象用 Canvas，几十个可交互对象用 SVG

**参考**：[Canvas vs SVG](../HTML/canvas-svg.md)
> 🎤 回答稿：[30秒+2分钟版本](../面试回答/HTML/canvas-svg-history.md)

---

### Q11: iframe 有什么优缺点？如何使用 postMessage 通信？

**30秒答**：iframe 天然隔离(独立 window/document)——适合嵌入第三方。postMessage 跨域通信——发送指定 targetOrigin，接收校验 origin。sandbox 按需开放权限。缺点：阻塞父 onload、SEO 差。

**追问预测**：
- "iframe 和微前端的关系" → qiankun/wujie 底层用 iframe 实现隔离——样式和 JS 沙箱
- "postMessage 怎么保证安全" → 发送方指定 targetOrigin；接收方校验 event.origin
- "iframe 的 sandbox 属性" → 按需开放权限——allow-scripts/allow-same-origin/allow-forms
> 🏷️ 概念题

**频率**：⭐⭐⭐⭐

**答题要点**：
- 优点：天然隔离（独立 window/document/JS 环境）、稳定可靠
- 缺点：阻塞父页面 onload、通信成本高、SEO 差
- postMessage 三要素：发送方指定 targetOrigin、接收方校验 origin、校验数据结构
- sandbox 安全沙箱：按需开放权限
- 提微前端的 iframe 方案（wujie）加分

**参考**：[iframe](../HTML/iframe.md)

---



## 路由与架构（4 题）

### Q12: History API 的 pushState 和 replaceState 有什么区别？hash 和 history 模式有什么区别？

**30秒答**：pushState 新增历史记录不触发 popstate。replaceState 替换当前记录。hash 模式 # 后不发送服务端刷新不 404；history 模式 URL 干净需服务端 fallback。vue-router 两种模式底层都是这两个 API。

**追问预测**：
- "pushState 和 replaceState 的区别" → pushState 新增一条历史记录；replaceState 替换当前记录不影响前进后退
- "popstate 什么时候触发" → 前进/后退时——pushState 和 replaceState 本身不触发 popstate
- "hash 和 history 模式怎么选" → hash 兼容性好不用服务端配置；history URL 干净 SEO 好需服务端 fallback
> 🏷️ 对比题

**频率**：⭐⭐⭐⭐⭐

**答题要点**：
- `pushState` 新增历史记录，`replaceState` 替换当前记录
- `popstate` 在前进/后退时触发，`pushState`/`replaceState` 本身不触发
- Hash URL `#` 后内容不发送到服务端，刷新不 404
- History 模式 URL 干净 SEO 好，但刷新需 Nginx `try_files` 配置 fallback
- 提 `history.state` 持久化 + `scrollRestoration` 加分

**参考**：[History API](../HTML/history-api.md)
> 🎤 回答稿：[30秒+2分钟版本](../面试回答/HTML/canvas-svg-history.md)
> 📖 延伸：[Vue Router history vs hash](../VueRouter/history-vs-hash.md)

---

### Q13: Web Worker 是什么？有哪些类型？

**30秒答**：Worker 独立线程跑 JS——不能访问 DOM/window/localStorage。Dedicated 单页面；Shared 同源多页面共享；Service Worker PWA 离线。Transferable 零拷贝传大数据。场景：Excel 导出、大 JSON 解析。

**追问预测**：
- "Worker 能操作 DOM 吗" → 不能——不能访问 window/document/localStorage。Worker 是独立线程无 UI
- "Transferable 和 structured clone 的区别" → Transferable 零拷贝转移所有权（更快）；structured clone 复制数据
- "Shared Worker 和 Dedicated Worker 的区别" → Dedicated 单页面；Shared 同源多页面共享——适合跨 tab 通信
> 🏷️ 概念题

**频率**：⭐⭐⭐⭐

**答题要点**：
- 后台线程运行 JS，不阻塞主线程 UI
- 不能操作 DOM、不能访问 window/localStorage
- 三种 Worker：Dedicated（单页面）、Shared（同源多页面共享）、Service Worker（PWA 离线）
- Transferable 零拷贝传输大数据
- 实用场景：Excel 导出、大 JSON 解析、图片压缩

**参考**：[Web Worker](../HTML/web-worker.md)

---

### Q14: Web Components 是什么？和 Vue/React 组件有什么区别？

**30秒答**：三大标准——Custom Elements 自定义标签、Shadow DOM 样式隔离、HTML Template 内容模板。跨框架可用零依赖。Shadow DOM CSS 变量可穿透、::part 伪元素可选中。无响应式系统生态不完整。

**追问预测**：
- "Shadow DOM 的样式隔离怎么穿透" → CSS 变量（继承属性）和 ::part 伪元素——外部可控
- "Web Components 和 Vue/React 的关系" → WC 是原生标准——跨框架可用。但生态不完整无响应式
- "实际项目用 Web Components 吗" → 少——多数用框架。跨团队共享基础组件时有场景
> 🏷️ 对比题

**频率**：⭐⭐⭐

**答题要点**：
- 三大标准：Custom Elements、Shadow DOM、HTML Template
- Shadow DOM 实现样式隔离，CSS 变量可穿透
- vs 框架组件：原生零依赖、天然跨框架、但无响应式系统
- 适用场景：跨框架共享的基础 UI 组件、设计系统
- 微前端中的角色：wujie/micro-app 底层依赖

**参考**：[Web Components](../HTML/web-components.md)

---

### Q15: CSR / SSR / SSG / ISR 分别是什么？怎么选？

**30秒答**：CSR 空壳+JS 渲染 SEO 差适合后台。SSR 服务端生成 HTML SEO 好适合电商。SSG 构建时预渲染零服务器适合博客。ISR SSG+按需增量更新。选型：toB→CSR；toC 内容→SSG；toC 动态→SSR。

**追问预测**：
- "CSR/SSR/SSG/ISR 各适合什么场景" → CSR 后台系统；SSR 电商/内容；SSG 博客/文档；ISR 需要更新但不用实时
- "SSR 对 SEO 的影响" → 搜索引擎可直接抓取完整 HTML——不需要 JS 渲染
- "Next.js 和 Nuxt 的 SSR 区别" → Next React 生态 ISR 最成熟；Nuxt Vue 生态 SSR 开箱即用
> 🏷️ 对比题

**频率**：⭐⭐⭐⭐⭐

**答题要点**：
- CSR：空壳 HTML + JS 渲染 → SEO 差、首屏慢，适合后台管理
- SSR：服务端生成完整 HTML → SEO 好、服务器压力大，适合电商
- SSG：构建时预渲染 → 性能极致、成本低，适合博客/文档站
- Hydration：SSR HTML → 客户端绑定事件、激活响应式
- 选型：toB 后台用 CSR，toC 内容站用 SSG，电商用 SSR

**参考**：[SEO / SSR](../HTML/seo-ssr.md)

---

## 补充题（5 题）

### Q16: `<dialog>` / Popover API

> ⭐⭐⭐ | 难度：初级

**题目**：HTML5 的 `<dialog>` 元素和 Popover API 如何使用？和手写 Modal 组件比有什么优势？

**30秒答**：`<dialog>` 原生支持模态框——`showModal()` 自动加 backdrop + 焦点管理 + ESC 关闭，不需要手写。Popover API 用 `popover` 属性实现悬浮层——自动顶层渲染 + 点击外部关闭。

> 答案参考：[../HTML/html5-semantic.md](../HTML/html5-semantic.md)

---

### Q17: SEO 相关 meta 标签

> ⭐⭐⭐ | 难度：初级

**题目**：前端可以做哪些 SEO 优化？关键的 meta 标签有哪些？

**30秒答**：`<title>` 页面标题、`<meta name="description">` 描述、Open Graph 标签控制社交分享预览、`<link rel="canonical">` 避免重复内容、语义化 HTML 让搜索引擎理解内容结构、`<img alt>` 图片文本。

> 答案参考：[../HTML/doctype-meta.md](../HTML/doctype-meta.md)

---

### Q18: 无障碍（a11y）与 ARIA

> ⭐⭐⭐⭐ | 难度：中级

**题目**：前端怎么做无障碍（Accessibility）？role 和 aria-* 属性什么时候用？为什么 div 模拟的按钮不如原生 button？

**考察点**：语义化与可访问性的关系、ARIA 使用原则、表单可访问性、键盘导航

**30秒答**：我做 a11y 的第一道防线是语义化标签——button/nav/h1 自带角色、焦点和键盘行为，能用原生就不用 ARIA。语义不够时才补：aria-label 给无文本控件命名、aria-describedby 关联描述文本、aria-hidden 对读屏器隐藏装饰元素。表单用 label 的 for 关联输入框、fieldset+legend 分组。键盘导航靠 tabindex——0 加入焦点序列、-1 移出，inert 让整块区域不可交互。div 模拟按钮要自己补 role、tabindex 和 Enter/Space 键盘事件——原生 button 全部自带。

**追问预测**：
- "ARIA 的第一原则是什么" → 能用原生 HTML 语义就不用 ARIA——div 加 role="button" 不会自动获得键盘行为
- "aria-label 和 aria-labelledby 的区别" → aria-label 直接写文本；aria-labelledby 引用另一个元素的 id
- "tabindex 为什么不建议用正值" → 打乱自然 Tab 顺序难维护——只用 0 和 -1
- "怎么测无障碍" → Lighthouse/axe 自动扫描 + 读屏器（VoiceOver/NVDA）+ 纯键盘走一遍核心流程
> 🏷️ 概念题

> 答案参考：[../HTML/accessibility.md](../HTML/accessibility.md)

---

### Q19: HTML5 新特性总览

> ⭐⭐⭐⭐ | 难度：初级

**题目**：相比 HTML4，HTML5 新增了哪些能力？请分类概述。

**考察点**：HTML5 能力全景、分类归纳、每类的代表 API

**30秒答**：我按六类记：语义化——header/nav/main/article 结构标签；多媒体——audio/video 原生播放摆脱 Flash；图形——canvas 位图、内联 svg 矢量图；存储——localStorage 持久、sessionStorage 会话级；通信——WebSocket 全双工、SSE 服务端单向推送；设备与交互 API——拖拽 draggable、Geolocation 地理位置、History API 无刷新路由。另外还有表单增强（新 input 类型+约束校验）和 Web Worker 多线程。

**追问预测**：
- "localStorage 和 sessionStorage 的区别" → localStorage 持久不过期；sessionStorage 标签页关闭即清除
- "WebSocket 和 SSE 怎么选" → 双向实时（聊天/协作）用 WebSocket；服务端单向推送（行情/通知）用 SSE 更轻
- "挑一两个讲讲项目里怎么用的" → History API 做 SPA 路由、localStorage 存用户偏好——准备好具体场景
> 🏷️ 概念题

> 答案参考：[../HTML/index.md](../HTML/index.md)（知识地图，暂无专门总览文件）

---

### Q20: src 和 href 有什么区别？

> ⭐⭐⭐ | 难度：初级

**题目**：src 和 href 都能引入外部资源，本质区别是什么？分别用在哪些元素上？

**考察点**：资源嵌入 vs 超文本引用、加载阻塞行为、典型元素归类

**30秒答**：src 是 source——资源嵌入，内容会替换进元素成为文档一部分，典型是 script/img/iframe/video；解析到 script src 会暂停 DOM 解析先下载执行，所以才有 defer/async。href 是 hypertext reference——只建立文档和资源的关联，典型是 a/link；link 引 CSS 并行下载不阻塞解析（但阻塞渲染）。一句话：src 拿内容来嵌入，href 建关联去引用。

**追问预测**：
- "为什么 CSS 用 link href 而不是 src" → CSS 是关联到文档的资源不是嵌入内容——并行下载互不阻塞
- "script 的 src 为什么阻塞解析" → JS 可能 document.write 修改后续 HTML——必须等它执行完
- "img 的 src 阻塞解析吗" → 不阻塞——图片异步下载，只影响 load 事件时机
> 🏷️ 对比题

> 答案参考：[../HTML/src-href.md](../HTML/src-href.md)

---

| 模块 | 题目数 | 覆盖文件 |
|------|--------|----------|
| HTML5 语义化 | 5 | html5-semantic, doctype-meta, form-validation |
| 加载与性能 | 3 | script-defer-async, lazy-loading, src-href |
| 元素与事件 | 3 | block-inline, canvas-svg, iframe |
| 路由与架构 | 4 | history-api, web-worker, web-components, seo-ssr |
| 补充题 | 5 | html5-semantic, doctype-meta, accessibility, src-href |

**频率分布**：⭐⭐⭐⭐⭐ ×5｜⭐⭐⭐⭐ ×9｜⭐⭐⭐ ×5｜⭐⭐ ×1

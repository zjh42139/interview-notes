---
title: CSS 面试题
description: CSS 高频面试题合集
category: CSS
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: reviewed
created: 2026-07-08
updated: 2026-07-08
reviewed: 2026-07-08
tags:
  - CSS
  - 面试题
  - BFC
  - Flex
  - Grid
  - 居中
  - 优先级
---

---
# CSS 面试题


> 关联知识点：见每题末尾的 📖 链接

## Q1：BFC 有哪些应用场景？⭐⭐⭐⭐⭐
> 🏷️ 概念题

**考察点**：对 BFC 触发机制和实战应用的理解深度。

**回答要点**：
1. 清除浮动 —— `overflow: hidden` / `display: flow-root` 触发 BFC 包裹浮动子元素
2. 防止外边距重叠 —— 父子/兄弟元素的 margin 重叠，用 BFC 隔开
3. 自适应两栏布局 —— 左侧浮动 + 右侧 BFC（`overflow: auto`），右侧自动填充剩余宽度

**追问**：BFC 和 IFC/FFC/GFC 的关系？（格式化上下文的四种类型）

📖 [BFC](../CSS/bfc.md)
🎤 回答稿：[../面试回答/CSS/box-model-bfc.md](../面试回答/CSS/box-model-bfc.md)

---

## Q2：Flex 和 Grid 的区别？如何选型？⭐⭐⭐⭐⭐
> 🏷️ 对比题

**考察点**：一维 vs 二维布局的认知和工程选型判断。

**回答要点**：
- Flex：**一维布局**（要么管行、要么管列），适合组件级布局（导航栏、按钮组、表单行、卡片内部）
- Grid：**二维布局**（同时管行和列），适合页面级布局（Dashboard、后台管理骨架、瀑布流）
- 选型原则：只需要对齐一排元素 → Flex；需要行+列同时控制 → Grid

📖 [Flexbox](../CSS/flexbox.md) · [Grid](../CSS/grid.md)
🎤 回答稿：[../面试回答/CSS/flexbox-grid-layout.md](../面试回答/CSS/flexbox-grid-layout.md)

---

## Q3：`display:none`、`visibility:hidden`、`opacity:0` 三种隐藏方式的区别？⭐⭐⭐⭐⭐
> 🏷️ 对比题

**考察点**：隐藏元素的三种维度——DOM 存在性、空间占用、事件响应。

| 方式 | DOM 存在 | 占空间 | 可点事件 | 影响子元素 | 过渡动画 |
|------|----------|--------|----------|-----------|----------|
| `display: none` | 脱离文档流 | ❌ 不占 | ❌ | 全部隐藏 | ❌ |
| `visibility: hidden` | 还在 | ✅ 占位 | ❌ | 可单独设为 visible | ⚠️（支持但极少用） |
| `opacity: 0` | 还在 | ✅ 占位 | ✅ 仍可点击 | 全部透明 | ✅ transition |

📖 [盒模型](../CSS/box-model.md) · [CSS 渲染性能](../CSS/css-performance.md)

---

## Q4：`absolute` 相对于谁定位？包含块规则是什么？⭐⭐⭐⭐⭐
> 🏷️ 概念题

**考察点**：CSS 定位参照系的精确理解。

**回答要点**：
- 相对于**最近的 `position ≠ static` 的祖先元素**的 padding-box
- 如果所有祖先都是 `static` → 相对于**初始包含块**（视口）
- 特殊情况：`transform`/`filter`/`perspective`/`will-change`/`contain` 也会创建包含块

📖 [position 定位](../CSS/position.md)

---

## Q5：`position: sticky` 为什么会失效？⭐⭐⭐⭐
> 🏷️ 排查题

**考察点**：sticky 的边界条件和常见踩坑经验。

**回答**：
1. 没有指定阈值（`top`/`right`/`bottom`/`left` 至少一个）
2. 父元素 `overflow: hidden`（切断了滚动容器）
3. 父元素高度等于 sticky 元素高度（没有滚动空间）
4. 祖先元素全由内容撑开（滚动容器是 body）

📖 [position 定位](../CSS/position.md)

---

## Q6：CSS 优先级怎么计算？`!important` 一定最高吗？⭐⭐⭐⭐⭐
> 🏷️ 概念题

**考察点**：选择器特异性计算 + 工程中的样式覆盖策略。

**回答**：
- 四位数权重 (a, b, c, d)：style → ID → 类/属性/伪类 → 类型/伪元素
- 比较规则：高位大的直接胜出，高位相同比下一位，不是十进制进位
- 两个 `!important` 冲突时权重规则重新生效（!important 的权重战争）
- `:where()` 权重永远为 0；`:is()` 取参数中最高权重
- `@layer` 引入权重维度之外的新维度（layer 优先级 > 选择器权重）

📖 [选择器优先级](../CSS/specificity.md)

---

## Q7：`100vh` 在移动端为什么会有问题？怎么解决？⭐⭐⭐⭐
> 🏷️ 排查题

**考察点**：移动端视口机制和 CSS 新单位的理解。

**回答**：
- `100vh` = 包含地址栏的视口高度，移动端地址栏收起/展开时 `100vh` 会大于/小于实际可视区域
- 解决方案：`dvh`（dynamic viewport height）动态视口高度；或 JS 手动设置 `window.innerHeight`；或 `height: 100%` 配合 `html, body { height: 100% }`

📖 [响应式](../CSS/responsive.md)

---

## Q8：`rem`、`vw`、`px` 分别适用于什么场景？⭐⭐⭐⭐
> 🏷️ 对比题

**考察点**：CSS 单位的选型判断。

**回答**：
- `px`：固定尺寸（1px 边框、小图标、精确间距）
- `rem`：字体大小、间距（参照根元素 font-size，方便全局等比缩放）
- `vw`：全屏宽度相关的布局、响应式 font-size（`clamp()` 配合 vw 做流式字号）

📖 [rem / vw](../CSS/rem-vw.md)

---

## Q9：为什么 `margin: auto` 有时候不能居中？⭐⭐⭐⭐
> 🏷️ 概念题

**考察点**：margin auto 生效的前提条件。

**回答**：
- 水平居中：元素必须有**明确宽度**，且是**块级元素**，`margin: 0 auto` 才生效
- 垂直居中：**块级元素** + **有明确高度** + `margin: auto 0` 通常不生效（正常流中上下 margin auto = 0）
- 垂直 `margin: auto` 生效的唯一方式：Flex/Grid 容器中的 `align-items: center` 或 `align-self: center`

📖 [居中方案](../CSS/center-layout.md) · [盒模型](../CSS/box-model.md)

---

## Q10：如何实现水平垂直居中？说出所有方案 ⭐⭐⭐⭐⭐
> 🏷️ 概念题

**考察点**：CSS 居中方案的系统掌握度。

**回答**（5 种方案）：
1. Flex：`display: flex; justify-content: center; align-items: center;`
2. Grid：`display: grid; place-items: center;`
3. 绝对定位 + transform：`position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);`
4. 绝对定位 + margin auto：`position: absolute; top/bottom/left/right: 0; margin: auto; width/height 固定`
5. `text-align: center` + `line-height` = `height`（仅单行文字）

📖 [居中方案](../CSS/center-layout.md)

---

## Q11：外边距重叠（Margin Collapse）是什么？如何解决？⭐⭐⭐⭐
> 🏷️ 概念题

**考察点**：盒模型的一个经典反直觉行为。

**回答**：
- **现象**：垂直方向相邻的两个块级元素的 margin 会合并（取较大值，不是相加）
- **场景**：父子 margin 重叠（子元素的 `margin-top` 传递到父元素）；兄弟 margin 重叠（上一个的 `margin-bottom` 和下一个的 `margin-top` 合并）
- **解决**：触发 BFC（`overflow: hidden` / `display: flow-root`）；用 padding 代替 margin；加 border/padding 隔离

📖 [BFC](../CSS/bfc.md) · [盒模型](../CSS/box-model.md)
🎤 回答稿：[../面试回答/CSS/box-model-bfc.md](../面试回答/CSS/box-model-bfc.md)

---

## Q12：`z-index` 失效的几种情况？⭐⭐⭐⭐
> 🏷️ 排查题

**考察点**：层叠上下文的深层理解。

**回答**：
1. 元素 `position: static`（z-index 只对定位元素生效）
2. 父元素创建了新的层叠上下文且 `z-index` 更低（子元素 z-index 再高也被"锁"在父元素内）
3. `opacity < 1` / `transform` / `filter` / `will-change` 等属性隐式创建层叠上下文
4. `z-index: auto` vs `z-index: 0` —— auto 不创建层叠上下文，0 会创建

📖 [层叠上下文](../CSS/stacking-context.md) · [position 定位](../CSS/position.md)

---



## Q15：`transition` 和 `animation` 有什么区别？⭐⭐⭐⭐
> 🏷️ 对比题

**考察点**：CSS 动画两种机制的选型判断。

**回答**：
- `transition`：被动触发（hover/focus/class 切换），A→B 补间，不能循环
- `animation`：主动执行（页面加载/延迟后），多阶段关键帧，可循环/暂停/反向
- 选型：简单状态切换用 transition，循环/多阶段/入场动画用 animation

📖 [transition vs animation](../CSS/transition-animation.md)

---

## Q16：单行/多行文本溢出省略怎么实现？⭐⭐⭐⭐
> 🏷️ 概念题

**考察点**：文本溢出控制的基础功。

**回答**：
- 单行：`overflow: hidden; white-space: nowrap; text-overflow: ellipsis;`（三件套）
- 多行：`display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: N; overflow: hidden;`（四件套）
- Flex 子元素省略：额外需要 `min-width: 0`

📖 [文本溢出省略](../CSS/text-overflow.md)

---

## Q17：如何清除浮动？clearfix 和 BFC 方案有什么区别？⭐⭐⭐⭐
> 🏷️ 概念题

**考察点**：浮动后高度塌陷的解决思路。

**回答**：
- **clearfix**：`::after { content: ''; display: block; clear: both; }`，在浮动元素后插入清除浮动的虚拟元素
- **BFC 方案**：`overflow: hidden` / `display: flow-root`，触发 BFC 自动包裹浮动子元素
- **区别**：clearfix 需要额外元素/伪元素；BFC 方案更简洁但 `overflow: hidden` 可能裁剪内容；`display: flow-root` 是最佳现代方案

📖 [伪类 vs 伪元素](../CSS/pseudo.md) · [BFC](../CSS/bfc.md)
🎤 回答稿：[../面试回答/CSS/box-model-bfc.md](../面试回答/CSS/box-model-bfc.md)

---

## Q18：CSS 如何实现暗黑模式？⭐⭐⭐⭐
> 🏷️ 场景题

**考察点**：主题切换的工程方案。

**回答**：
1. CSS 变量 + 切换 `[data-theme="dark"]`（最推荐）
2. `prefers-color-scheme: dark` 媒体查询（跟随系统）
3. 方案组合：默认跟随系统 + 手动切换覆盖
4. 防 FOUC（Flash of Unstyled Content）：在 `<head>` 中内联一个 `<script>` 在渲染前读取 localStorage 并设置 data-theme

📖 [CSS 变量](../CSS/css-variables.md)

---



## 相关阅读

- [CSS 知识地图](../CSS/index.md) —— 所有 CSS 知识点索引
- [面试题库总览](./index.md)

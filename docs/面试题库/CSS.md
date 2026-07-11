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

### Q1: BFC 有哪些应用场景？⭐⭐⭐⭐⭐

> 🏷️ 概念题

**考察点**：对 BFC 触发机制和实战应用的理解深度。

**回答要点**：
1. 清除浮动 —— `overflow: hidden` / `display: flow-root` 触发 BFC 包裹浮动子元素
2. 防止外边距重叠 —— 父子/兄弟元素的 margin 重叠，用 BFC 隔开
3. 自适应两栏布局 —— 左侧浮动 + 右侧 BFC（`overflow: auto`），右侧自动填充剩余宽度

**追问**：BFC 和 IFC/FFC/GFC 的关系？（格式化上下文的四种类型）

📖 [BFC](../CSS/bfc.md)
🎤 回答稿：[../面试回答/CSS/box-model-bfc.md](../面试回答/CSS/box-model-bfc.md)

**30秒答**：BFC 独立渲染区域——内部布局不影响外部。触发：overflow:hidden、display:flow-root、float、absolute。三大应用：清除浮动（BFC 包裹浮动子元素）、防 margin 重叠、两栏自适应布局。
**追问预测**：
- "BFC 和 IFC/FFC 的关系" → 四个格式化上下文——BFC 块级、IFC 行内、FFC Flex、GFC Grid
- "overflow:hidden 触发 BFC 的副作用" → 裁剪溢出内容——现代方案 display:flow-root 无副作用
- "Flex 容器是 BFC 吗" → 不是——Flex 创建 FFC。但行为类似——不会和外部 float 重叠

---

### Q2: Flex 和 Grid 的区别？如何选型？⭐⭐⭐⭐⭐

> 🏷️ 对比题

**考察点**：一维 vs 二维布局的认知和工程选型判断。

**回答要点**：
- Flex：**一维布局**（要么管行、要么管列），适合组件级布局（导航栏、按钮组、表单行、卡片内部）
- Grid：**二维布局**（同时管行和列），适合页面级布局（Dashboard、后台管理骨架、瀑布流）
- 选型原则：只需要对齐一排元素 → Flex；需要行+列同时控制 → Grid

📖 [Flexbox](../CSS/flexbox.md) · [Grid](../CSS/grid.md)
🎤 回答稿：[../面试回答/CSS/flexbox-grid-layout.md](../面试回答/CSS/flexbox-grid-layout.md)

**30秒答**：Flex 一维布局——管行或列，适合组件内排列。Grid 二维布局——同时管行和列，适合页面级布局。混用：页面骨架用 Grid，组件内排列用 Flex。fr 单位和 minmax() 是 Grid 独有优势。
**追问预测**：
- "Flexbox 是一维还是二维" → 一维——只管行或列。Grid 二维——同时管行和列
- "什么时候用 Grid 不用 Flex" → 有明确行列结构（Dashboard、后台骨架）用 Grid；组件内排列用 Flex
- "IE 支持 Grid 吗" → IE11 支持旧版 Grid 语法（-ms-前缀/功能有限）。2026 不需要考虑 IE

---

### Q3: `display:none`、`visibility:hidden`、`opacity:0` 三种隐藏方式的区别？⭐⭐⭐⭐⭐

> 🏷️ 对比题

**考察点**：隐藏元素的三种维度——DOM 存在性、空间占用、事件响应。

| 方式 | DOM 存在 | 占空间 | 可点事件 | 影响子元素 | 过渡动画 |
|------|----------|--------|----------|-----------|----------|
| `display: none` | 脱离文档流 | ❌ 不占 | ❌ | 全部隐藏 | ❌ |
| `visibility: hidden` | 还在 | ✅ 占位 | ❌ | 可单独设为 visible | ⚠️（支持但极少用） |
| `opacity: 0` | 还在 | ✅ 占位 | ✅ 仍可点击 | 全部透明 | ✅ transition |

📖 [盒模型](../CSS/box-model.md) · [CSS 渲染性能](../CSS/css-performance.md)

**30秒答**：display:none 移除 DOM 流触发回流——不占位不渲染。visibility:hidden 占位只重绘——子元素设 visible 可恢复。opacity:0 占位可交互——视觉透明但能点击。
**追问预测**：
- "display:none 和 visibility:hidden 哪个更耗性能" → display:none 触发回流——移除 DOM 流；visibility:hidden 只重绘
- "opacity:0 的元素能点击吗" → 能——仍占据空间且响应事件。pointer-events:none 可以禁用交互
- "三者对子元素的影响" → display:none 子元素全不可见；visibility:hidden 子元素设 visible 可恢复可见

---

### Q4: `absolute` 相对于谁定位？包含块规则是什么？⭐⭐⭐⭐⭐

> 🏷️ 概念题

**考察点**：CSS 定位参照系的精确理解。

**回答要点**：
- 相对于**最近的 `position ≠ static` 的祖先元素**的 padding-box
- 如果所有祖先都是 `static` → 相对于**初始包含块**（视口）
- 特殊情况：`transform`/`filter`/`perspective`/`will-change`/`contain` 也会创建包含块

📖 [position 定位](../CSS/position.md)

**30秒答**：absolute 相对最近 position 非 static 祖先定位——没有就用初始包含块(视口)。脱离文档流不占位。和 relative 的区别——relative 占位不脱离流。fixed 相对视口——transform 祖先例外。
**追问预测**：
- "absolute 相对于谁定位" → 最近的 position 非 static 的祖先；找不到就用初始包含块（视口）
- "包含块的规则" → absolute 找 position 非 static 祖先；fixed 永远是视口（除 transform 例外）
- "relative 和 absolute 的区别" → relative 占位不脱离文档流；absolute 脱离文档流不占位

---

### Q5: `position: sticky` 为什么会失效？⭐⭐⭐⭐

> 🏷️ 排查题

**考察点**：sticky 的边界条件和常见踩坑经验。

**回答**：
1. 没有指定阈值（`top`/`right`/`bottom`/`left` 至少一个）
2. 父元素 `overflow: hidden`（切断了滚动容器）
3. 父元素高度等于 sticky 元素高度（没有滚动空间）
4. 祖先元素全由内容撑开（滚动容器是 body）

📖 [position 定位](../CSS/position.md)

**30秒答**：sticky 在容器内滚动到阈值才固定——父元素 overflow:hidden 或高度不够会失效。和 fixed 区别——fixed 始终固定。必须设 top/left 值才生效。
**追问预测**：
- "sticky 失效的常见原因" → 父元素 overflow:hidden 或高度不够、没设 top/left 值
- "sticky 和 fixed 的区别" → sticky 在容器内滚动到阈值才固定；fixed 始终固定
- "sticky 的兼容性" → 现代浏览器全支持。IE 不支持——降级为 relative

---

### Q6: CSS 优先级怎么计算？`!important` 一定最高吗？⭐⭐⭐⭐⭐

> 🏷️ 概念题

**考察点**：选择器特异性计算 + 工程中的样式覆盖策略。

**回答**：
- 四位数权重 (a, b, c, d)：style → ID → 类/属性/伪类 → 类型/伪元素
- 比较规则：高位大的直接胜出，高位相同比下一位，不是十进制进位
- 两个 `!important` 冲突时权重规则重新生效（!important 的权重战争）
- `:where()` 权重永远为 0；`:is()` 取参数中最高权重
- `@layer` 引入权重维度之外的新维度（layer 优先级 > 选择器权重）

📖 [选择器优先级](../CSS/specificity.md)

**30秒答**：!important > 内联 > id > class/伪类/属性 > 元素/伪元素。权值 !important=∞、内联=1000、id=100、class=10、元素=1。权值相同后来居上。用户 !important 高于作者 !important。
**追问预测**：
- "important 一定最高吗" → 用户样式 important > 作者样式 important > 作者普通 > 用户普通 > 浏览器默认
- "内联样式和 !important 谁高" → 作者 !important > 内联样式。但用户 !important 最高
- "怎么覆盖 !important" → 更高优先级的 !important——但这是 bad practice。应该修复源头的优先级问题

---

### Q7: `100vh` 在移动端为什么会有问题？怎么解决？⭐⭐⭐⭐

> 🏷️ 排查题

**考察点**：移动端视口机制和 CSS 新单位的理解。

**回答**：
- `100vh` = 包含地址栏的视口高度，移动端地址栏收起/展开时 `100vh` 会大于/小于实际可视区域
- 解决方案：`dvh`（dynamic viewport height）动态视口高度；或 JS 手动设置 `window.innerHeight`；或 `height: 100%` 配合 `html, body { height: 100% }`

📖 [响应式](../CSS/responsive.md)

**30秒答**：100vh 在移动端浏览器工具栏收起/展开时高度变化——导致布局抖动。解决：dvh(动态视口)、svh(小视口)、lvh(大视口)新单位——或用 JS 动态设 CSS 变量。
**追问预测**：
- "100vh 和 100% 的区别" → vh 是视口高度百分比；% 是父元素高度百分比
- "移动端 100vh 问题怎么解决" → dvh（动态视口高度）/ svh（小视口）/ lvh（大视口）CSS 新单位
- "怎么兼容旧浏览器" → JS 动态计算 window.innerHeight 设置 CSS 变量

---

### Q8: `rem`、`vw`、`px` 分别适用于什么场景？⭐⭐⭐⭐

> 🏷️ 对比题

**考察点**：CSS 单位的选型判断。

**回答**：
- `px`：固定尺寸（1px 边框、小图标、精确间距）
- `rem`：字体大小、间距（参照根元素 font-size，方便全局等比缩放）
- `vw`：全屏宽度相关的布局、响应式 font-size（`clamp()` 配合 vw 做流式字号）

📖 [rem / vw](../CSS/rem-vw.md)

**30秒答**：rem 相对根元素 font-size——适合全局响应式。em 相对父元素——容易叠加。vw 视口宽度 1%。px 固定像素。移动端适配：postcss-px-to-viewport 自动转 vw + rem 做全局缩放。
**追问预测**：
- "rem 和 em 的区别" → rem 根元素 font-size；em 父元素 font-size。rem 更适合全局响应式
- "vw 和 % 的区别" → vw 视口宽度；% 父元素宽度百分比
- "移动端适配用什么单位" → postcss-px-to-viewport 自动转 vw——配合 rem 做全局缩放

---

### Q9: 为什么 `margin: auto` 有时候不能居中？⭐⭐⭐⭐

> 🏷️ 概念题

**考察点**：margin auto 生效的前提条件。

**回答**：
- 水平居中：元素必须有**明确宽度**，且是**块级元素**，`margin: 0 auto` 才生效
- 垂直居中：**块级元素** + **有明确高度** + `margin: auto 0` 通常不生效（正常流中上下 margin auto = 0）
- 垂直 `margin: auto` 生效的唯一方式：Flex/Grid 容器中的 `align-items: center` 或 `align-self: center`

📖 [居中方案](../CSS/center-layout.md) · [盒模型](../CSS/box-model.md)

**30秒答**：margin:auto 水平居中需块级+明确宽度——auto 平分剩余空间。垂直方向 auto=0——规范规定所以不能垂直居中。Flex/Grid 容器中垂直 auto 也生效。
**追问预测**：
- "margin:auto 水平居中条件" → 块级元素 + 有明确宽度——auto 平分剩余空间
- "margin:auto 垂直为什么不行" → 垂直方向 auto = 0——规范规定。Flex/Grid 例外
- "margin:auto 在 Flex 中的行为" → Flex 容器中垂直方向 auto 也有效——可以垂直居中

---

### Q10: 如何实现水平垂直居中？说出所有方案 ⭐⭐⭐⭐⭐

> 🏷️ 概念题

**考察点**：CSS 居中方案的系统掌握度。

**回答**（5 种方案）：
1. Flex：`display: flex; justify-content: center; align-items: center;`
2. Grid：`display: grid; place-items: center;`
3. 绝对定位 + transform：`position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);`
4. 绝对定位 + margin auto：`position: absolute; top/bottom/left/right: 0; margin: auto; width/height 固定`
5. `text-align: center` + `line-height` = `height`（仅单行文字）

📖 [居中方案](../CSS/center-layout.md)

**30秒答**：Flexbox(display:flex+justify-content:center+align-items:center)最通用。Grid(place-items:center)一行最简洁。绝对+transform(top:50%+left:50%+translate(-50%))适合弹窗。不定宽高用 Flex/Grid。
**追问预测**：
- "说出 5 种居中方案" → Flexbox/Grid/绝对定位+transform/绝对定位+margin:auto/table-cell
- "不定宽高怎么居中" → Flexbox 或 Grid——不需要知道宽高。绝对定位+transform 也是
- "居中方案怎么选" → 脱离文档流→绝对定位；不脱离→Flexbox；一行搞定→Grid place-items

---

### Q11: 外边距重叠（Margin Collapse）是什么？如何解决？⭐⭐⭐⭐

> 🏷️ 概念题

**考察点**：盒模型的一个经典反直觉行为。

**回答**：
- **现象**：垂直方向相邻的两个块级元素的 margin 会合并（取较大值，不是相加）
- **场景**：父子 margin 重叠（子元素的 `margin-top` 传递到父元素）；兄弟 margin 重叠（上一个的 `margin-bottom` 和下一个的 `margin-top` 合并）
- **解决**：触发 BFC（`overflow: hidden` / `display: flow-root`）；用 padding 代替 margin；加 border/padding 隔离

📖 [BFC](../CSS/bfc.md) · [盒模型](../CSS/box-model.md)
🎤 回答稿：[../面试回答/CSS/box-model-bfc.md](../面试回答/CSS/box-model-bfc.md)

**30秒答**：相邻块级元素垂直 margin 取最大值不叠加。触发条件：父子间无 border/padding/inline content/BFC 隔开。解决：触发 BFC(overflow:hidden)或加 border/padding 隔开。
**追问预测**：
- "父子 margin 重叠的条件" → 父子间没有 border/padding/inline content/BFC 隔开
- "怎么解决 margin 重叠" → 触发 BFC——overflow:hidden 或 display:flow-root 隔开
- "margin 重叠只发生在垂直方向吗" → 是——水平方向不重叠。写模式改变时方向也会变

---

### Q12: `z-index` 失效的几种情况？⭐⭐⭐⭐

> 🏷️ 排查题

**考察点**：层叠上下文的深层理解。

**回答**：
1. 元素 `position: static`（z-index 只对定位元素生效）
2. 父元素创建了新的层叠上下文且 `z-index` 更低（子元素 z-index 再高也被"锁"在父元素内）
3. `opacity < 1` / `transform` / `filter` / `will-change` 等属性隐式创建层叠上下文
4. `z-index: auto` vs `z-index: 0` —— auto 不创建层叠上下文，0 会创建

📖 [层叠上下文](../CSS/stacking-context.md) · [position 定位](../CSS/position.md)

**30秒答**：z-index 失效：元素没设 position、父级层叠上下文 z-index 更低。层叠上下文由 position+z-index、opacity<1、transform、filter 等创建。子元素 z-index 只在父级层叠上下文内有效。
**追问预测**：
- "z-index 失效的几种情况" → 元素没设 position、父级创建了层叠上下文且 z-index 更低
- "层叠上下文怎么创建" → position+z-index、opacity<1、transform、filter、will-change 等
- "两个层叠上下文之间的 z-index 怎么比" → 比父级层叠上下文的 z-index——子元素 z-index 只在父级内部有效

---

### Q13: `transition` 和 `animation` 有什么区别？⭐⭐⭐⭐

> 🏷️ 对比题

**考察点**：CSS 动画两种机制的选型判断。

**回答**：
- `transition`：被动触发（hover/focus/class 切换），A→B 补间，不能循环
- `animation`：主动执行（页面加载/延迟后），多阶段关键帧，可循环/暂停/反向
- 选型：简单状态切换用 transition，循环/多阶段/入场动画用 animation

📖 [transition vs animation](../CSS/transition-animation.md)

**30秒答**：transition 需要触发条件(hover/focus)只有两个状态——适合简单过渡。animation 自动播放多关键帧——适合复杂动画。性能：用 transform/opacity 做动画 GPU 加速，避免 width/height/top/left 触发回流。
**追问预测**：
- "transition 和 animation 的核心区别" → transition 需要触发条件（hover/focus）且只有两个状态；animation 自动播放多关键帧
- "哪些属性适合 transition" → transform/opacity——只触发合成不触发重排。width/height 触发回流不适合
- "animation 的性能优化" → 用 transform 和 opacity 做动画——GPU 加速。避免动画 width/height/left/top

---

### Q14: 单行/多行文本溢出省略怎么实现？⭐⭐⭐⭐

> 🏷️ 概念题

**考察点**：文本溢出控制的基础功。

**回答**：
- 单行：`overflow: hidden; white-space: nowrap; text-overflow: ellipsis;`（三件套）
- 多行：`display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: N; overflow: hidden;`（四件套）
- Flex 子元素省略：额外需要 `min-width: 0`

📖 [文本溢出省略](../CSS/text-overflow.md)

**30秒答**：单行 text-overflow:ellipsis+white-space:nowrap+overflow:hidden 三件套。多行 -webkit-line-clamp+display:-webkit-box+overflow:hidden。多行兼容性差——Firefox 不支持。
**追问预测**：
- "多行省略的核心属性" → display:-webkit-box + -webkit-line-clamp + -webkit-box-orient:vertical
- "多行省略的兼容性" → -webkit 前缀只 WebKit 内核支持。Firefox 用 JS 截断方案兜底
- "怎么判断文字是否溢出" → el.scrollWidth > el.clientWidth——JS 检测溢出后显示省略

---

### Q15: 如何清除浮动？clearfix 和 BFC 方案有什么区别？⭐⭐⭐⭐

> 🏷️ 概念题

**考察点**：浮动后高度塌陷的解决思路。

**回答**：
- **clearfix**：`::after { content: ''; display: block; clear: both; }`，在浮动元素后插入清除浮动的虚拟元素
- **BFC 方案**：`overflow: hidden` / `display: flow-root`，触发 BFC 自动包裹浮动子元素
- **区别**：clearfix 需要额外元素/伪元素；BFC 方案更简洁但 `overflow: hidden` 可能裁剪内容；`display: flow-root` 是最佳现代方案

📖 [伪类 vs 伪元素](../CSS/pseudo.md) · [BFC](../CSS/bfc.md)
🎤 回答稿：[../面试回答/CSS/box-model-bfc.md](../面试回答/CSS/box-model-bfc.md)

**30秒答**：clearfix ::after+clear:both 在浮动元素后插入清除块。BFC 触发后计算高度包含浮动子元素。现代 Flexbox/Grid 基本不再需要清除浮动。
**追问预测**：
- "clearfix 的原理" → ::after 伪元素 + clear:both——在浮动元素后插入一个清除浮动的块
- "BFC 清除浮动的原理" → BFC 计算高度时包含浮动子元素——触发 BFC 即可包裹浮动
- "现代布局还需要清除浮动吗" → Flexbox/Grid 基本不再需要——浮动在现代布局中已很少使用

---

### Q16: CSS 如何实现暗黑模式？⭐⭐⭐⭐

> 🏷️ 场景题

**考察点**：主题切换的工程方案。

**回答**：
1. CSS 变量 + 切换 `[data-theme="dark"]`（最推荐）
2. `prefers-color-scheme: dark` 媒体查询（跟随系统）
3. 方案组合：默认跟随系统 + 手动切换覆盖
4. 防 FOUC（Flash of Unstyled Content）：在 `<head>` 中内联一个 `<script>` 在渲染前读取 localStorage 并设置 data-theme

📖 [CSS 变量](../CSS/css-variables.md)

**30秒答**：CSS 变量切换主题色值+prefers-color-scheme 媒体查询自动跟随系统+class 切换手动控制。图片用 CSS filter 降低亮度或准备两套资源。
**追问预测**：
- "暗黑模式的实现方式" → CSS 变量切换、prefers-color-scheme 媒体查询、class 切换
- "怎么自动跟随系统" → @media (prefers-color-scheme: dark)——自动匹配系统主题
- "暗黑模式下图片怎么办" → CSS filter 降低亮度、或准备两套图片资源

---

## 相关阅读

- [CSS 知识地图](../CSS/index.md) —— 所有 CSS 知识点索引
- [面试题库总览](./index.md)

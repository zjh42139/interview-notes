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
updated: 2026-07-18
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
🎤 回答稿：[../面试回答/CSS/display-visibility-opacity.md](../面试回答/CSS/display-visibility-opacity.md)

**30秒答**：display:none 移除 DOM 流触发回流——不占位不渲染。visibility:hidden 占位只重绘——子元素设 visible 可恢复。opacity:0 占位可交互——视觉透明但能点击。
**追问预测**：
- "display:none 和 visibility:hidden 哪个更耗性能" → display:none 触发回流——移除 DOM 流；visibility:hidden 只重绘
- "opacity:0 的元素能点击吗" → 能——仍占据空间且响应事件。pointer-events:none 可以禁用交互
- "三者对子元素的影响" → display:none 子元素全不可见；visibility:hidden 子元素设 visible 可恢复可见

---

### Q4: `absolute` 相对于谁定位？包含块规则是什么？⭐⭐⭐⭐

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
🎤 回答稿：[../面试回答/CSS/specificity.md](../面试回答/CSS/specificity.md)

**30秒答**：!important > 内联 > id > class/伪类/属性 > 元素/伪元素。权值 !important=∞、内联=1000、id=100、class=10、元素=1。权值相同后来居上。用户 !important 高于作者 !important。
**追问预测**：
- "important 一定最高吗" → 用户样式 important > 作者样式 important > 作者普通 > 用户普通 > 浏览器默认
- "内联样式和 !important 谁高" → 作者 !important > 内联样式。但用户 !important 最高
- "怎么覆盖 !important" → 更高优先级的 !important——但这是 bad practice。应该修复源头的优先级问题

---

### Q7: `100vh` 在移动端为什么会有问题？怎么解决？⭐⭐⭐

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

### Q9: 为什么 `margin: auto` 有时候不能居中？⭐⭐⭐

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
🎤 回答稿：[../面试回答/CSS/centering.md](../面试回答/CSS/centering.md)

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

### Q12: 层叠上下文是什么？`z-index` 为什么会失效？⭐⭐⭐⭐

> 🏷️ 排查题

**考察点**：层叠上下文的创建条件、z-index 的比较规则、失效场景的排查思路。

**回答**：
- **层叠上下文**：z 轴上的独立渲染层级——决定谁盖谁；`z-index` 只在同一层叠上下文内比较——跨了不看
- **创建条件**：`position` 非 static + `z-index` 非 auto、`opacity < 1`、`transform` / `filter` / `perspective` 非 none、`will-change: transform/opacity` 等
- **失效情况**：
  1. 元素 `position: static`（z-index 只对定位元素和 Flex/Grid 子项生效）
  2. 父元素创建了新的层叠上下文且 `z-index` 更低（子元素 z-index 再高也被"锁"在父元素内）
  3. `z-index: auto` vs `z-index: 0` —— auto 不创建层叠上下文，0 会创建

📖 [层叠上下文](../CSS/stacking-context.md) · [position 定位](../CSS/position.md)

**30秒答**：层叠上下文是 z 轴上的渲染层级——决定谁盖谁，z-index 只在同一层叠上下文内比较。失效两大类：元素没设 position、父级创建了层叠上下文且 z-index 更低——子元素再高也被"锁"在父级内。opacity<1、transform、filter、will-change 都会隐式创建层叠上下文。
**追问预测**：
- "z-index 设 9999 为什么还是被挡住" → 不在同一层叠上下文——父元素的层叠顺序决定了子元素的整体位置
- "层叠上下文怎么创建" → position+z-index 非 auto、opacity<1、transform、filter、perspective、will-change 等
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

### Q15: 如何清除浮动？clearfix 和 BFC 方案有什么区别？⭐⭐⭐

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

### Q17: `@layer` 解决了什么问题？和选择器优先级是什么关系？⭐⭐⭐

> 🏷️ 概念题

**考察点**：层叠维度的新认知——layer 顺序在选择器权重之前生效。

**回答要点**：
- `@layer` 显式声明样式的优先级层次：后声明的 layer 覆盖先声明的，**不受选择器权重影响**
- 比较顺序：先比 layer 顺序，同一 layer 内部才比选择器权重
- 未分层样式（普通声明）高于所有 layer 内样式——第三方库放进 layer，业务样式天然能覆盖
- 典型用法：`@layer reset, framework, overrides;` 一行声明顺序，告别 `!important` 和堆权重

📖 [@layer 层叠规则](../CSS/at-layer.md)

**30秒答**：@layer 让开发者声明样式优先级层次——后声明的 layer 覆盖先声明的，不受选择器权重影响。解决了组件库样式覆盖的噩梦——不用靠 !important 或提高选择器权重。我会把 reset、第三方库、业务样式分层，覆盖关系一目了然。
**追问预测**：
- "@layer 和 !important 在同一个 layer 里谁赢" → !important 永远最高——但跨 layer 时反转：先声明的 layer 中的 !important 反而胜出
- "没放进 layer 的样式和 layer 里的谁优先" → 未分层的普通声明更高——所以把第三方库放进 layer 后不用提权就能覆盖

---

### Q18: `content-box` 和 `border-box` 有什么区别？为什么要全局设置 `border-box`？⭐⭐⭐⭐⭐

> 🏷️ 概念题

**考察点**：两种盒模型的宽度计算公式、全局 border-box 的工程动机、box-sizing 不继承的特性与 inherit 技巧。

**回答要点**：
- `content-box`（默认）：`width` 只是内容区宽度，实际占宽 = width + padding + border
- `border-box`：`width` = 内容 + padding + border 总宽，padding/border 向内挤压内容区
- 全局设置理由：所写即所得——设 200px 就占 200px；加 padding/border 不撑破布局；百分比/栅格计算不溢出
- 继承技巧：`html { box-sizing: border-box; }` + `*, *::before, *::after { box-sizing: inherit; }`——第三方组件要还原默认时只改自身，子树自动跟随

📖 [盒模型](../CSS/box-model.md)
🎤 回答稿：[../面试回答/CSS/box-model-bfc.md](../面试回答/CSS/box-model-bfc.md)

**30秒答**：content-box 是默认值，width 只算内容区，padding 和 border 要往外加；border-box 的 width 直接包含 padding 和 border。我的项目都全局设 border-box——设多宽就占多宽，改内边距不会把布局撑破，百分比布局加 padding 也不会溢出。写法上用 html 设 border-box、其他元素 inherit，第三方组件要还原默认盒模型时局部覆盖就行。
**追问预测**：
- "width:100% 加 padding 为什么会溢出" → content-box 下实际占宽 = 100% + padding——border-box 下 padding 向内挤不溢出
- "box-sizing 会继承吗" → 不继承——所以全局设置要靠 * 通配选择器或 inherit 技巧
- "border-box 为什么叫 IE 盒模型" → IE 怪异模式的默认行为就是 border-box——后来 W3C 用 box-sizing 把它标准化

---

### Q19: `flex: 1` 是什么意思？三个子属性分别怎么工作？⭐⭐⭐⭐⭐

> 🏷️ 概念题

**考察点**：flex 缩写的展开值、grow/shrink/basis 三属性分工、flex-basis 与 width 的优先级、剩余空间的分配计算。

**回答要点**：
- `flex: 1` = `flex-grow: 1; flex-shrink: 1; flex-basis: 0%`
- `flex-grow`：有剩余空间时按比例分配（默认 0 不参与）；`flex-shrink`：空间不足时按 shrink × basis 加权收缩（默认 1）；`flex-basis`：主轴初始尺寸
- `flex-basis` 非 auto 时优先级高于 `width`；basis 为 auto 时回退到 width，再回退到内容宽度
- `flex: 1`（basis 0%）vs `flex: auto`（basis auto）：前者无视内容完全均分；后者先保留内容尺寸再分剩余空间
- 计算示例：容器 600px、两项 basis 各 100px、grow 为 1:2 → 剩余 400px 按 1:2 分 → 最终 233px 和 367px

📖 [Flexbox](../CSS/flexbox.md)
🎤 回答稿：[../面试回答/CSS/flexbox-grid-layout.md](../面试回答/CSS/flexbox-grid-layout.md)

**30秒答**：flex:1 是 flex-grow:1、flex-shrink:1、flex-basis:0% 的缩写。grow 管剩余空间怎么分，shrink 管空间不够时怎么缩，basis 是主轴上的初始尺寸。因为 basis 是 0%，内容宽度不参与分配，所以几个 flex:1 的项目能完全平分容器。它和 flex:auto 的区别就在 basis——auto 会先保留内容尺寸再分剩余空间。另外 basis 不是 auto 时优先级比 width 高。
**追问预测**：
- "flex:1 和 flex:auto 的区别" → basis 0% vs auto——flex:1 完全均分；flex:auto 内容多的项目分得更宽
- "flex-basis 和 width 谁优先" → basis 非 auto 时 basis 赢；basis:auto 才回退到 width
- "flex 子项为什么压不缩、内容溢出" → 子项默认 min-width:auto 不小于内容——设 min-width:0 或 overflow:hidden 才能缩下去

---

### Q20: `position` 的五个值分别有什么区别？⭐⭐⭐⭐

> 🏷️ 对比题

**考察点**：五种定位模式的参照系与文档流影响、sticky 的生效条件、fixed 不相对视口的例外。

| 值 | 参照系 | 脱离文档流 | 典型场景 |
|------|--------|-----------|----------|
| `static` | 默认值，不定位 | ❌ | 正常流 |
| `relative` | 自身原位置 | ❌ 占位 | 微调、给子元素当包含块 |
| `absolute` | 最近非 static 祖先 | ✅ | 弹层、角标 |
| `fixed` | 视口 | ✅ | 悬浮按钮、全局弹窗 |
| `sticky` | 最近滚动容器 | ❌ 占位 | 吸顶导航、表头固定 |

- `sticky` 生效三条件：设了 `top/left` 等阈值、祖先没有 `overflow: hidden`、父容器有滚动空间
- `fixed` 例外：祖先有 `transform` / `filter` / `will-change` 时，包含块变成该祖先而不是视口

📖 [position 定位](../CSS/position.md)

**30秒答**：static 默认不定位；relative 相对自己原位置偏移、还占着位；absolute 相对最近的非 static 祖先、脱离文档流；fixed 相对视口、也脱流；sticky 是 relative 和 fixed 的混合——滚到阈值前占位、到了就吸附。我最常用子绝父相做弹层和角标。注意 fixed 有例外——祖先有 transform 时它改为相对那个祖先定位。
**追问预测**：
- "sticky 为什么不生效" → 三查：没设 top 阈值、祖先 overflow:hidden、父容器没有滚动空间
- "fixed 什么时候不相对视口" → 祖先有 transform/filter/will-change——包含块变成该祖先，弹窗被裁剪的常见坑
- "relative 和 absolute 怎么配合" → 子绝父相——父级 relative 提供包含块又不脱离文档流

---

### Q21: 容器查询 `@container` 和 `:has()` 解决了什么问题？⭐⭐⭐⭐

> 🏷️ 概念题

**考察点**：@container 与 @media 的响应式范式差异、:has() 补齐的选择能力、container-type 的作用、新特性兼容性判断。

**回答要点**：
- `@media` 响应**视口**尺寸；`@container` 响应**祖先容器**尺寸——组件级响应式，同一组件放侧栏和主区能各自适配
- 用法：容器声明 `container-type: inline-size`（可加 `container-name`），后代写 `@container (min-width: 400px) { ... }`
- `:has()` 是"父选择器"/关系选择器：按后代或后续兄弟反选元素——`.card:has(img)`、`form:has(:invalid)` 以前只能靠 JS 加类
- 支持现状：两者 2023 年起 Chrome/Safari/Firefox 全支持、已进 Baseline，2026 生产可用；旧浏览器用 `@supports` 渐进增强

📖 [:has() / 嵌套 / 容器查询](../CSS/has-nesting-container.md)

**30秒答**：@media 按视口做响应式，@container 按父容器尺寸做响应式——同一个组件放在宽窄不同的容器里能各自适配，这才是组件级响应式。用法是父容器设 container-type:inline-size，后代里写 @container 条件。:has() 相当于父选择器——比如 .card:has(img) 选中含图卡片、form:has(:invalid) 让提交按钮置灰，以前这些都得靠 JS。这两个特性主流浏览器都已支持，我在新项目里会直接用。
**追问预测**：
- "@container 和 @media 怎么选" → 页面骨架跟视口走用 @media；可复用组件跟容器走用 @container
- "container-type 为什么必须声明" → 建立尺寸隔离（containment）防止"子元素影响容器尺寸再触发查询"的循环——不声明查询不生效
- ":has() 有性能问题吗" → 浏览器已优化、可放心用——但避免在 :has() 里放过于宽泛的选择器

---

### Q22: 哪些 CSS 属性触发回流、重绘、仅合成？动画为什么首选 transform/opacity？⭐⭐⭐⭐

> 🏷️ 概念题

**考察点**：CSS 属性在渲染流水线中的三档分类、合成层与 GPU 加速原理、减少回流的工程手段。

**回答要点**：
- **触发回流（Layout）**：几何类——`width/height`、`margin/padding`、`top/left`、`font-size`、`display`；回流必然连带重绘
- **仅重绘（Paint）**：外观类——`color`、`background`、`border-color`、`visibility`、`box-shadow`
- **仅合成（Composite）**：`transform`、`opacity`（`filter` 也是）——跳过 Layout 和 Paint，在合成器线程完成，主线程卡顿也不掉帧
- 减少回流：批量改 class 而非逐条改 style、动画元素 `absolute/fixed` 脱流缩小影响范围、读写分离避免强制同步布局、`will-change` 提升合成层（慎用）

📖 [CSS 渲染性能](../CSS/css-performance.md) · [回流与重绘](../浏览器/reflow-repaint.md)

**30秒答**：改几何信息的属性触发回流——宽高、margin、top/left、font-size，回流一定连带重绘；只改外观的触发重绘——颜色、背景、box-shadow；transform 和 opacity 只触发合成——跳过布局和绘制、在合成器线程处理，所以动画我只用这两个属性。减少回流靠批量改 class、动画元素脱离文档流、读写分离避免布局抖动。
**追问预测**：
- "为什么 transform 动画主线程卡了也不掉帧" → 合成在独立的合成器线程执行——不依赖主线程
- "读 offsetHeight 为什么强制回流" → 浏览器要返回最新布局值——把攒着的样式修改立刻结算；循环里读写交替就是布局抖动
- "will-change 能随便加吗" → 不能——每个合成层占内存，滥用反而更卡；动画结束应移除

**延伸**：回流/重绘的完整机制（触发时机、浏览器批处理优化）见 [浏览器题库 Q2「回流与重绘」](./浏览器.md)

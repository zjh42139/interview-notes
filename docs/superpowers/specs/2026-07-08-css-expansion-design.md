# CSS 模块扩展 + 面试题库 CSS 分类 设计方案

> **日期：** 2026-07-08
> **状态：** 已确认
> **范围：** 11 个新文件（9 CSS 知识点 + 1 工程化 + 1 面试题库）

## 一、新增文件清单

### CSS 知识点（9 篇）

| # | 文件路径 | 频率 | 难度 | 核心内容 |
|---|----------|------|------|---------|
| 1 | `docs/CSS/specificity.md` | ⭐⭐⭐⭐⭐ | 中级 | 权重计算（0-0-0-0）、`!important` 例外、`:is()`/`:where()`/`@layer` 对优先级的影响 |
| 2 | `docs/CSS/inheritance.md` | ⭐⭐⭐⭐ | 初级 | 可继承/不可继承属性速查、`inherit`/`initial`/`unset`/`revert` 四个关键字、与层叠的关系、a 标签颜色不继承的原因 |
| 3 | `docs/CSS/position.md` | ⭐⭐⭐⭐⭐ | 中级 | static/relative/absolute/fixed/sticky 五种定位、包含块（containing block）规则、sticky 失效情景 |
| 4 | `docs/CSS/pseudo.md` | ⭐⭐⭐⭐ | 初级 | 单冒号 vs 双冒号、动态伪类/结构伪类对比、`::before`/`::after` 必须配合 `content`、clearfix 作为子章节 |
| 5 | `docs/CSS/css-performance.md` | ⭐⭐⭐⭐ | 高级 | CSS Triggers 对照表（Layout/Paint/Composite）、`will-change`/`contain`/`content-visibility`、动画只动 transform/opacity、与 `docs/浏览器/reflow-repaint.md` 分工（CSS 开发者视角，链接引用不重复内容） |
| 6 | `docs/CSS/mobile-1px.md` | ⭐⭐⭐ | 中级 | dpr 物理像素、伪元素 + transform scale、viewport + rem、`border-image`/`box-shadow` 等方案对比 |
| 7 | `docs/CSS/transition-animation.md` | ⭐⭐⭐⭐ | 中级 | 触发方式、关键帧、`fill-mode`、`steps()` 逐帧动画、性能（只动 transform/opacity） |
| 8 | `docs/CSS/three-column-layout.md` | ⭐⭐⭐⭐ | 中级 | 圣杯/双飞翼、flex、grid、calc、绝对定位五种方案，手写题视角 |
| 9 | `docs/CSS/text-overflow.md` | ⭐⭐⭐⭐ | 初级 | 单行省略三件套、多行 `-webkit-line-clamp`、`word-break`/`overflow-wrap` 换行控制 |

### 工程化模块（1 篇）

| # | 文件路径 | 核心内容 |
|---|----------|---------|
| 10 | `docs/工程化/tailwindcss.md` | 原子化 CSS 理念、Tree Shaking、`@apply`/`@layer`、与 BEM/CSS Modules 的对比选型 |

### 面试题库（1 篇）

| # | 文件路径 | 题目数 |
|---|----------|--------|
| 11 | `docs/面试题库/CSS.md` | 20 题 |

## 二、CSS 侧边栏重排

按学习依赖链重新排序（现有文件 + 新文件）：

```
知识地图 → 盒模型 → 选择器优先级 → CSS继承性 → BFC → position全家桶
→ 层叠上下文 → Flexbox → Grid → 居中方案 → 三栏布局 → 响应式
→ rem/vw → 移动端1px → 文本溢出 → transition vs animation
→ 伪类vs伪元素 → CSS渲染性能 → CSS变量 → BEM → CSS Modules/Scoped
```

## 三、面试题库 CSS.md 题目（20 题）

| # | 题目 | 频率 | 对应知识点 |
|---|------|------|-----------|
| 1 | BFC 有哪些应用场景？ | ⭐⭐⭐⭐⭐ | bfc.md |
| 2 | Flex 和 Grid 的区别？如何选型？ | ⭐⭐⭐⭐⭐ | flexbox.md, grid.md |
| 3 | `display:none`、`visibility:hidden`、`opacity:0` 三种隐藏方式的区别？ | ⭐⭐⭐⭐⭐ | 盒模型 / 渲染性能 |
| 4 | `absolute` 相对于谁定位？包含块规则是什么？ | ⭐⭐⭐⭐⭐ | position.md |
| 5 | `position: sticky` 为什么会失效？ | ⭐⭐⭐⭐ | position.md |
| 6 | CSS 优先级怎么计算？`!important` 一定最高吗？ | ⭐⭐⭐⭐⭐ | specificity.md |
| 7 | `100vh` 在移动端为什么有问题？怎么解决？ | ⭐⭐⭐⭐ | responsive.md, rem-vw.md |
| 8 | `rem`、`vw`、`px` 分别适用于什么场景？ | ⭐⭐⭐⭐ | rem-vw.md |
| 9 | 为什么 `margin: auto` 有时候不能居中？ | ⭐⭐⭐⭐ | box-model.md, center-layout.md |
| 10 | 如何实现水平垂直居中？说出所有方案 | ⭐⭐⭐⭐⭐ | center-layout.md |
| 11 | 外边距重叠是什么？如何解决？ | ⭐⭐⭐⭐ | box-model.md, bfc.md |
| 12 | `z-index` 失效的几种情况？ | ⭐⭐⭐⭐ | stacking-context.md, position.md |
| 13 | `line-height` 和 `vertical-align` 的关系？ | ⭐⭐⭐ | —（面试题库特有） |
| 14 | CSS 如何实现三角形？ | ⭐⭐⭐ | —（面试题库特有） |
| 15 | `transition` 和 `animation` 有什么区别？ | ⭐⭐⭐⭐ | transition-animation.md |
| 16 | 单行/多行文本溢出省略怎么实现？ | ⭐⭐⭐⭐ | text-overflow.md |
| 17 | 如何清除浮动？clearfix 和 BFC 方案有什么区别？ | ⭐⭐⭐⭐ | pseudo.md, bfc.md |
| 18 | CSS 如何实现暗黑模式？ | ⭐⭐⭐⭐ | css-variables.md |
| 19 | CSS 继承性——哪些属性会继承？为什么 a 标签颜色不继承？ | ⭐⭐⭐ | inheritance.md |
| 20 | 为什么要避免 CSS `@import`？ | ⭐⭐⭐ | css-performance.md |

## 四、故意不纳入的话题

| 话题 | 理由 |
|------|------|
| Sass/Less 预处理器 | CSS 变量 + 嵌套 + `@layer` 已原生化，在 css-variables.md 对比表中一笔带过 |
| `@layer` 层叠层 | 太新，面试极少问，在 specificity.md 中一句话提及 |
| `@container` 容器查询 | 已在 responsive.md + grid.md 中提及 |
| CSS reset/normalize | 太基础，不独立成篇 |
| `aspect-ratio` | 一句话能讲清的属性 |
| CSS Sprites | HTTP2 普及后已过时 |

## 五、实施要点

1. **CSS 渲染性能篇与浏览器 reflow-repaint 篇的分工**：CSS 篇聚焦开发者视角（写什么 CSS 不触发重排），浏览器篇聚焦渲染管线原理。两者通过 相关阅读 链接互引，不重复内容。
2. **面试题库 CSS.md 格式**：与现有 8 个分类文件一致（题目 + 考察点 + 代码示例 + 交叉引用），状态 `reviewed`。
3. **clearfix**：作为 `pseudo.md` 的子章节，不作为独立页面。
4. **tailwindcss**：放在 `工程化/` 模块，与 BEM、CSS Modules 并列。

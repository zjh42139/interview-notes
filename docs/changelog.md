---
title: 更新日志
description: 知识库变更记录
---

# Changelog

## 2026-07-11

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

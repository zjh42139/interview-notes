# CLAUDE.md

## 项目概况

VitePress 前端面试知识库，Vue3 生态为主，以真实大厂面试为标准。

- **路径**：`docs/` 下有 20+ 模块，~200 篇知识文件，~36 篇回答稿
- **技术栈**：VitePress 1.6.4 + Mermaid mindmap + GitHub Pages
- **仓库**：`https://github.com/zjh42139/interview-notes`（main 分支）

## 核心规则

### 工作流

1. **先分析后写代码**。任何非平凡改动先给出分析/方案，用户确认后再动手。唯一例外：单行拼写修正、用户明确说"全修"/"执行"/"开始"。
2. **构建通过才提交**。每次改动后跑 `npx vitepress build docs`，0 dead link 才 `git commit`。
3. **中文沟通**。所有解释、注释、commit message 用中文。技术术语（PatchFlag、Composition API、Proxy 等）保留原文。
4. **changelog 同步**。提交前更新 `docs/changelog.md`，按日期倒序。
5. **push 前确认**。用户明确说"推送"才 `git push`。

### commit 格式

```
type(scope): 中文简短描述

- 具体改动 1
- 具体改动 2
```

type: `feat` | `fix` | `docs` | `refactor` | `style`

### 文件命名

- 知识文件：kebab-case，如 `vue3-vs-vue2.md`、`diff-patch.md`
- 模块 index：每个目录下 `index.md` 是知识地图
- 中文目录保留不改成英文：`面试题库/`、`面试回答/`

### 路径引用

- 同模块：`[../JavaScript/promise.md](../JavaScript/promise.md)`
- 从 `面试题库/` 到知识文件：`../TypeScript/generics.md`（一层 `..`）
- 从 `面试回答/` 到知识文件：`../../TypeScript/generics.md`（两层 `..`）

### Frontmatter 标准

```yaml
---
title: 页面标题
description: 简短描述
category: 模块名
type: mechanism | interview | practice | strategy
difficulty: 初级 | 中级 | 中高级 | 高级
frequency: ⭐⭐⭐⭐⭐  # 或 null
status: draft | filled | reviewed
created: 2026-07-14
updated: 2026-07-14
tags:
  - tag1
  - tag2
---
```

## 文档模板

### 知识文件（～150-250 行）

```
一句话总结 → 核心机制（mermaid 图） → 深度拓展 → 项目实战 → 易错点 → 面试信号表 → 相关阅读 → 更新记录
```

### 面试回答稿（～100-150 行）

```
30 秒版本 → 2 分钟版本 → 追问预判（表格） → 别踩的坑 → 相关阅读 → 更新记录
```

### 题库

```
Q 标题 → 频率/难度 → 题目 → 考察点 → 30 秒答 → 追问预测 → 答案参考 → 🎤 回答稿 → 延伸
```

## 模块审计（5 阶段标准流程）

对任意模块做深度审计时，按顺序执行——**顺序不能动**，每一步都是下一步的输入，不会产生回头补的问题。

### Phase 1: 真题校验（上游定基准）

校准题库，避免题库本身偏离真实面试。

- 搜索近半年面经（牛客/掘金/小红书），收集该模块的高频考点
- 将真题与现有题库做差集：补缺失题、删过时题、调权重
- 产出：校准后的题库 = 后续所有"覆盖率"决策的基准

> 如果题库是从个人经验凭感觉写的，用它做覆盖率基准 = 用猜测验证猜测。真题才是上游。

### Phase 2: 覆盖率审计（确定要写什么）

一次性补完所有缺失的文件——这是唯一会改变项目结构的一步。

- 题库 → 知识文件：每道题有对应文件？"答案参考"指向最精准的文件？
- 题库 → 回答稿：⭐⭐⭐⭐⭐ 高频题有 🎤？
- 官方规范 → 知识文件：Handbook/MDN/RFC 高频章节 90%+ 覆盖？
- 缺的全部补齐：新文件 + sidebar + index + 首页计数
- build 验证，确认新增文件无死链

### Phase 3: 事实审计（写对了没有）

逐篇逐行核对技术准确性。**这是最核心的一步**，推荐使用并行 agent。

核查维度：
- 代码示例在 strict 模式下能否通过编译
- 类型行为描述是否准确（void vs undefined、never 赋值、分布式条件类型触发条件）
- 版本标注是否正确（Vue 3.2/3.3、TS 4.x/5.x 特性）
- 术语是否恰当（协变/逆变、子类型关系图）
- 编译产物描述是否正确（enum、namespace、private 等）
- tsconfig 选项副作用（skipLibCheck 范围、typeRoots 边界）

> build 查不出这些错误。事实性错误有复利效应——面试者把错误认知带到面试里，整个模块可信度就崩了。

### Phase 4: 一致性审计（互相不矛盾）

检查跨文件一致性。Agent 审单篇看不到冲突，需要专门的跨文件对齐。

- 跨文件一致性：同主题不同文件的说法不矛盾，互引正确
- 易错点正确性：易错点本身不能是错的
- 知识文件 ↔ 回答稿对齐：同题结论一致，🎤 链接指向正确文件

### Phase 5: 结构收尾（链接和计数）

修所有机械性错误。

1. 五处交叉比对：sidebar / index 索引表 / 学习顺序 / mindmap / 实际目录
2. 交叉引用：题库→知识文件 / 题库→🎤 / 知识文件互链 / 其他模块入链
3. 计数同步：首页模块文章数 / 面试回答总数
4. Frontmatter 一致性：status/difficulty 在 index.md 和文件自身之间一致
5. build 验证，0 dead link

## 已知注意事项

- **Vue SFC 解析**：`.md` 文件中 `<T>` 等尖括号模式会被 VitePress 的 Vue 编译器解析为 HTML 标签。在 fenced code block 外使用泛型写法（如 `defineProps<T>()`）时，必须用 `` `backticks` `` 包裹或使用 `&lt;` / `&gt;` 实体。否则 build 报 `Element is missing end tag`。
- **@import 必须在 CSS 文件最顶部**——在 `custom.css` 中 `@import url(...)` 必须写在任何规则之前。
- **`/TypeScript/` sidebar 用 `collapsible: false`** 与其他模块保持一致。

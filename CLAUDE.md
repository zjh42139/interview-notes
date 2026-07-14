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

## 模块审计清单

对任意模块做深度检查时，逐项过：

1. 知识文件 vs sidebar vs mindmap vs 学习顺序 —— 四处列表是否一致
2. 题库 → 知识文件交叉引用 —— 每题的"答案参考"是否指向最精准的文件
3. 题库 → 回答稿 🎤 链接 —— 已有回答稿的题是否都回链了
4. mindmap 覆盖 —— sidebar 中所有文件是否都在 mindmap 中出现
5. 学习顺序分组 —— 是否有分类标题
6. sidebar 顺序 —— 是否与学习顺序一致
7. 回答稿覆盖 —— ⭐⭐⭐⭐⭐ 高频题是否有对应回答稿
8. 死链接 —— 任何路径变更后必须 build 验证

## 已知注意事项

- **Vue SFC 解析**：`.md` 文件中 `<T>` 等尖括号模式会被 VitePress 的 Vue 编译器解析为 HTML 标签。在 fenced code block 外使用泛型写法（如 `defineProps<T>()`）时，必须用 `` `backticks` `` 包裹或使用 `&lt;` / `&gt;` 实体。否则 build 报 `Element is missing end tag`。
- **@import 必须在 CSS 文件最顶部**——在 `custom.css` 中 `@import url(...)` 必须写在任何规则之前。
- **`/TypeScript/` sidebar 用 `collapsible: false`** 与其他模块保持一致。

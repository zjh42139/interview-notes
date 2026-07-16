---
title: "diff / log / blame / hooks 实战"
description: git diff/log/blame 高频用法、pre-commit/commit-msg hooks 工程实践
category: Git
type: mechanism
score: 75
difficulty: 中级
frequency: ⭐⭐⭐
status: filled
created: 2026-07-16
tags:
  - diff
  - log
  - hooks
---

# diff / log / blame / hooks 实战

> ⭐⭐⭐｜难度：中级

## 一句话总结

**`git diff` 看改了啥（--cached 看暂存区）、`git log` 看历史（--oneline --graph --decorate 最常用组合）、`git blame` 找谁写的、Git hooks 在特定操作前后自动执行（pre-commit lint 最常用）。**

## 核心机制

### diff / log / blame

```bash
# diff：改动对比
git diff                    # 工作区 vs 暂存区（还没 add 的改动）
git diff --cached           # 暂存区 vs 最新 commit（add 了还没 commit）
git diff HEAD~1             # 最新 commit vs 当前

# log：历史查看（最常用组合）
git log --oneline --graph --decorate --all
# * abc123 (HEAD -> main) feat: add login
# * def456 feat: add dashboard

# blame：文件每行是谁写的
git blame src/utils.ts      # 每行的 commit hash + author + 时间
git blame -L 10,20 file.ts  # 只看 10-20 行
```

### Git Hooks 项目落地

```bash
# .husky/pre-commit —— 提交前自动 lint
npx lint-staged

# .husky/commit-msg —— 检查 commit message 格式
npx commitlint --edit $1
```

**常规配置**：`pre-commit` 跑 lint-staged（增量 ESLint）→ `commit-msg` 检查 conventional commits 格式 → CI 里再跑全量 lint + test 做兜底。

## 相关阅读

- [commit 规范](./commit-spec.md)
- [ESLint / Husky](../工程化/eslint-husky.md)

## 更新记录

- 2026-07-16：新建——diff/log/blame 高频组合+hooks 工程落地

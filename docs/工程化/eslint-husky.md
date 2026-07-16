---
title: "ESLint / Husky / lint-staged"
description: 代码规范工具链——ESLint 规则配置、Husky git hooks、lint-staged 增量检查、Prettier 分工
category: 工程化
type: mechanism
score: 75
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-16
tags:
  - ESLint
  - Husky
  - lint-staged
  - 代码规范
---

# ESLint / Husky / lint-staged

> ⭐⭐⭐⭐⭐｜难度：中级｜所有项目必备

## 一句话总结

**ESLint 检查代码质量（潜在 bug + 风格）、Prettier 统一格式（只关心怎么打印）、Husky 在 git commit 前触发检查、lint-staged 只检查改动的文件——四者组合 = 团队代码规范的自动化落地。**

## 核心机制

### ESLint —— 代码质量检查

```javascript
// .eslintrc.js — 规则配置
module.exports = {
  extends: [
    'eslint:recommended',                  // 内置推荐规则
    'plugin:@typescript-eslint/recommended', // TS 规则
  ],
  rules: {
    'no-unused-vars': 'error',             // 未使用变量 = 报错
    'no-console': 'warn',                  // console.log = 警告
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
```

**ESLint vs Prettier 分工**：ESLint 关心代码**对不对**（未使用变量、类型错误、潜在 bug）；Prettier 关心代码**好不好看**（缩进、引号、分号）。ESLint 也能格式化但推荐用 Prettier 接管——`eslint-config-prettier` 关闭冲突规则。

### Husky —— Git Hooks 管理

```bash
# 安装后配置 .husky/pre-commit
npx husky add .husky/pre-commit "npx lint-staged"
```

Git 原生的 hooks 在 `.git/hooks/` 下——不会被 git 跟踪。Husky 把 hooks 放到 `.husky/` 目录，可以被 git 管理——团队成员 clone 后自动生效。

### lint-staged —— 只检查改动文件

```json
// package.json
{
  "lint-staged": {
    "*.{js,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,scss}": ["stylelint --fix"],
    "*.md": ["prettier --write"]
  }
}
```

**为什么只检查 staged 文件**：全量 lint 在大型项目可能需要几分钟——commit 时等不了。lint-staged 只取 `git diff --cached --name-only` 的文件，增量检查——几秒完成。

### 完整工作流

```
开发者 git commit
  → Husky 触发 pre-commit hook
    → lint-staged 取 staged 文件列表
      → ESLint 检查 JS/TS（含 --fix 自动修复）
      → Prettier 格式化
      → 全部通过 → commit 成功
      → 有错误 → commit 被阻止
```

## 深度拓展

### CI 兜底检查

本地 hooks 可以被 `git commit --no-verify` 跳过。CI 里再加一层 ESLint + TypeScript 类型检查——`npm run lint && npx tsc --noEmit`。双重保障：Husky 提供本地快速反馈，CI 提供最终防线。

### ESLint Flat Config（新格式）

ESLint 9.x 引入 flat config（`eslint.config.js`），替代 `.eslintrc`。新格式更简洁、支持 ESM、去掉了 extends 的级联复杂性。老旧项目仍然用 `.eslintrc`——面试加分点：能说出新旧格式的差异。

## 易错点

❌ **Husky 失效了** —— clone 后 `.husky/` 目录存在但 hooks 没激活。`npx husky install` 或 package.json 的 prepare script 自动触发。

❌ **只配 ESLint 不配 Prettier** —— ESLint 的格式规则和 Prettier 冲突——代码改来改去。`eslint-config-prettier` 关掉 ESLint 的格式规则——Prettier 完全接管格式。

❌ **CI 里没配 lint** —— 开发者本地能用 `--no-verify` 跳过 Husky。CI 是最后的防线。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "项目里怎么保证代码规范" | 追问 Husky+lint-staged 流水线 |
| "ESLint 和 Prettier 有什么区别" | 追问分工——ESLint 查 bug，Prettier 管格式 |
| "有人跳过 husky 怎么办" | 追问 CI 兜底检查 |

## 相关阅读

- [构建优化实战](../面试回答/工程化/build-optimization.md)
- [pnpm](./pnpm.md)

## 更新记录

- 2026-07-16：新建——ESLint/Prettier 分工+Husky+lint-staged 流水线+CI 兜底

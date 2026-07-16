---
title: "Rollup / Prettier / Source Map"
description: Rollup 与 Webpack 设计哲学差异、Prettier 配置策略、Source Map 类型选择与安全
category: 工程化
type: mechanism
score: 75
difficulty: 中级
frequency: ⭐⭐⭐
status: filled
created: 2026-07-16
tags:
  - Rollup
  - Prettier
  - SourceMap
---

# Rollup / Prettier / Source Map

> ⭐⭐⭐｜难度：中级｜工程化工具链补完

## Rollup —— 库打包的标准选择

**Rollup vs Webpack 设计哲学**：

| | Rollup | Webpack |
|---|--------|---------|
| 定位 | 库/框架打包 | 应用打包 |
| 输出 | ESM/CJS/UMD 多格式 | 主要为浏览器 |
| Tree Shaking | 原生支持（ESM 静态分析） | 需要配置 |
| 代码分割 | 有限 | 完善（splitChunks） |
| 生态 | 插件较少但够用 | 插件极丰富 |

**Vite 为什么用 Rollup 做生产构建？** Rollup 输出的 ESM 更干净、Tree Shaking 更彻底，生成库的体积比 Webpack 小 5-15%。开发阶段 Vite 用 esbuild 做预构建（快），生产用 Rollup 打包（干净）。

## Prettier —— 格式统一

```json
// .prettierrc
{
  "semi": true,        // 分号
  "singleQuote": true, // 单引号
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2
}
```

**ESLint vs Prettier 分工**：ESLint 管代码对不对（bug/类型/最佳实践），Prettier 管代码好不好看（缩进/引号/分号）。`eslint-config-prettier` 关掉 ESLint 的格式规则——避免两者冲突。

## Source Map —— 调试与安全的平衡

| 类型 | 大小 | 质量 | 生产建议 |
|------|:---:|:---:|------|
| `eval` | 无文件 | 低 | ❌ |
| `cheap-source-map` | 小 | 行映射 | 开发环境 |
| `source-map` | 大 | 完整 | ❌ 暴露源码 |
| `hidden-source-map` | 大 | 完整 | ✅ 上传 Sentry，不发布 |
| `nosources-source-map` | 中 | 堆栈 | ✅ 调试有堆栈，看不到源码 |

**生产环境最佳实践**：构建时生成 `hidden-source-map`→上传到 Sentry→不部署到服务器。用户看不到源码，Sentry 可以把错误堆栈映射到源码位置。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "Vite 为什么用 Rollup 打包" | 追问 Rollup 比 Webpack 好在哪——ESM 输出更干净 |
| "生产环境 SourceMap 怎么处理" | 追问 hidden-source-map——上传 Sentry 不发布 |

## 相关阅读

- [Vite](./vite.md)
- [ESLint / Husky](./eslint-husky.md)

## 更新记录

- 2026-07-16：新建——Rollup vs Webpack+Prettier+SourceMap 安全

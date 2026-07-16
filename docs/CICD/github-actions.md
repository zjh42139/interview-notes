---
title: GitHub Actions
description: GitHub Actions 是 GitHub 内置的 CI/CD 平台，面试中如果能手写完整的 workflow 文件并解释每一步，就是"有实际项目 CI/CD 经验"的最强信号
category: CICD
type: api-reference
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
tags:
  - GitHub Actions
  - CI/CD
  - Workflow
  - 自动部署
---

# GitHub Actions

> ⭐⭐⭐⭐⭐｜难度：中级

**GitHub Actions 是 GitHub 的亲儿子，也是前端面试中 CI/CD 问题的默认答案。它免费、和 GitHub 深度集成、生态丰富。面试官最想听到的不是"我用过"，而是"我能写出一个 .yml 文件，解释每一行在做什么"。**

## 一句话总结

**GitHub Actions 是 GitHub 的事件驱动型 CI/CD 平台。你在仓库 `.github/workflows/` 下放一个 YAML 文件，定义"当 XX 事件发生时，在 YY 系统上执行 ZZ 步骤"。核心抽象是 workflow > job > step，社区 marketplace 提供了上万现成的 action 可以直接组合使用。**

---

## 核心机制

### 核心概念层级

```
Workflow（工作流）          一个完整的 CI/CD 流程，一个 .yml 文件 = 一个 Workflow
  ├── Job（作业）           一组 Step 的集合，在同一 Runner 上执行
  │     ├── Step（步骤）    最小执行单元：可以是一条 shell 命令，也可以是一个 action
  │     │     ├── run        直接执行 shell 命令
  │     │     └── uses       引用一个社区/自定义 action
  │     └── ...
  └── Job 2（可并行执行）
        └── ...
```

| 概念 | 说明 | 关键特性 |
|------|------|----------|
| **Workflow** | `.github/workflows/*.yml` 文件 | 由事件触发（push / PR / 定时 / 手动） |
| **Job** | 在同一个 Runner 上的执行单元 | 默认并行，可通过 `needs` 串行 |
| **Step** | Job 内的执行步骤 | 可以是 `run` 命令或 `uses` action |
| **Action** | 可复用的代码单元 | npm 包一样的生态，可从 marketplace 引用 |
| **Runner** | 执行 Job 的机器 | GitHub 托管（ubuntu/macos/windows）或自建 |

### 触发方式（Event Triggers）

```yaml
on:
  # 代码推送——最常用
  push:
    branches: [main, develop]
    paths:
      - 'src/**'          # 只有 src 目录变化才触发
      - 'package.json'

  # PR 事件——提交 / 修改 / 合并 PR 时触发
  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened]

  # 定时任务（Cron）——每天凌晨 2 点
  schedule:
    - cron: '0 2 * * *'

  # 手动触发——在 GitHub 页面上点按钮
  workflow_dispatch:
    inputs:
      environment:
        description: '部署到哪个环境'
        required: true
        default: 'staging'
        type: choice
        options: ['staging', 'production']
```

### 常用 Actions

| Action | 用途 | 几乎每次都会用 |
|--------|------|:---:|
| `actions/checkout@v4` | 拉取仓库代码 | ✅ |
| `actions/setup-node@v4` | 安装 Node.js 环境 | ✅ |
| `pnpm/action-setup@v2` | 安装 pnpm 包管理器 | ✅ |
| `actions/cache@v3` | 缓存依赖，加速构建 | ✅ |
| `actions/upload-artifact@v3` | 上传构建产物供后续 Job 使用 | ✅ |
| `peaceiris/actions-gh-pages@v3` | 部署到 GitHub Pages | 按需 |

**缓存示例**：

```yaml
- name: Cache pnpm store
  uses: actions/cache@v3
  with:
    path: ~/.pnpm-store           # 缓存的路径
    key: pnpm-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml') }}
    # key 变化时重建缓存，未变化时复用
    restore-keys: |
      pnpm-${{ runner.os }}-
```

### 矩阵构建（Matrix Build）

当你想同时在多个 Node 版本上运行测试时，矩阵构建可以并行执行：

```yaml
jobs:
  test:
    strategy:
      matrix:
        node-version: [18, 20, 22]    # 3 个版本各跑一次
        os: [ubuntu-latest]            # 可选多 OS
      fail-fast: false                 # 某个版本失败不取消其他
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm test
```

**面试要点**：矩阵构建一次性回答了"你的项目兼容哪些 Node 版本"——不是嘴上说的，而是 CI 自动验证的。

### 环境变量和 Secrets

```yaml
env:
  NODE_VERSION: '20'                 # Workflow 级别环境变量

jobs:
  build:
    env:
      APP_ENV: production            # Job 级别环境变量
    steps:
      - name: Deploy
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}  # Step 级别
          # secrets 在 GitHub 仓库 Settings → Secrets 中配置
          # 在日志中自动脱敏（显示为 ***）
        run: |
          echo "Node: $NODE_VERSION"
          deploy --token $DEPLOY_TOKEN --env $APP_ENV
```

---

## 深度拓展

### 追问1：Job 之间如何共享数据？

默认情况下，不同 Job 运行在**不同的 Runner** 上，文件系统不共享。共享数据需要：

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: npm run build
      - uses: actions/upload-artifact@v3    # 上传产物
        with:
          name: dist-files
          path: dist/

  deploy:
    needs: build                            # 等 build 完成再执行
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v3  # 下载产物
        with:
          name: dist-files
          path: dist/
      - run: deploy-script                    # 使用 dist/ 进行部署
```

**关键点**：`needs` 定义 Job 依赖关系（串行），`upload/download-artifact` 传递文件。

### 追问2：如何实现"合并到 main 才部署，PR 只做检查"？

用条件判断 `if`：

```yaml
jobs:
  deploy:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    # 只在 push 到 main 分支时执行
    runs-on: ubuntu-latest
    steps:
      - run: deploy-to-production

  preview-deploy:
    if: github.event_name == 'pull_request'
    # 只在 PR 时执行——部署到预览环境
    runs-on: ubuntu-latest
    steps:
      - run: deploy-to-preview
```

---

## 项目实战

### VitePress 项目自动构建 + 部署到 GitHub Pages

这是面试中最可能让你手写的场景。以下是一个完整的 workflow 文件，逐行都有注释：

```yaml
# .github/workflows/deploy.yml
name: Deploy VitePress site to Pages

on:
  push:
    branches: [main]                # main 分支 push 时触发
  workflow_dispatch:                # 允许手动触发

# 设置 GITHUB_TOKEN 的权限，供部署步骤使用
permissions:
  contents: read
  pages: write
  id-token: write

# 确保同一时间只有一个部署在运行
concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout               # ① 拉取代码
        uses: actions/checkout@v4

      - name: Setup pnpm             # ② 安装 pnpm（通过包管理器核心版本号）
        uses: pnpm/action-setup@v2
        with:
          version: 9

      - name: Setup Node             # ③ 安装 Node（读取 .nvmrc 或手动指定）
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm                # 自动缓存 pnpm store

      - name: Install dependencies   # ④ 安装依赖
        run: pnpm install --frozen-lockfile
        # --frozen-lockfile: 不修改 lock 文件，CI 中必须加

      - name: Build                  # ⑤ 构建项目
        run: pnpm docs:build         # VitePress 的构建命令

      - name: Upload artifact        # ⑥ 上传构建产物
        uses: actions/upload-pages-artifact@v3
        with:
          path: docs/.vitepress/dist  # VitePress 默认输出目录

  deploy:
    needs: build                     # 等 build 完成
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages  # ⑦ 部署到 GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**面试时解释的层次**：

1. "这个 workflow 在每次 push main 时自动把 VitePress 文档部署到 GitHub Pages"
2. "分两个 Job：build 负责构建和上传产物，deploy 负责把产物发布到 Pages 服务"
3. "用 `--frozen-lockfile` 保证 CI 环境的依赖版本和本地 lock 文件一致"
4. "`cache: pnpm` 让 setup-node 自动缓存 pnpm 的全局 store，加速安装"

---

## 易错点

- **"CI 中 `npm install` 就行"**：错。CI 中必须用 `npm ci` 或 `pnpm install --frozen-lockfile`，否则 CI 可能自动修改 lock 文件，导致生产环境的依赖版本和 CI 验证的版本不一致。
- **"secrets 不能在 PR 分支上使用"**：GitHub 对 fork 仓库的 PR 默认不传递 secrets，防止恶意代码窃取。如果你 fork 了开源仓库提 PR，CI 里是读不到 secrets 的。
- **"Job 之间默认共享文件"**：不共享。每个 Job 跑在独立 Runner 上，需要用 `upload-artifact` / `download-artifact` 传递文件。
- **"Runner 就是自己的电脑"**：不是。GitHub 托管的 Runner 是一次性的（每次 Job 结束后环境销毁），不要依赖上一次 Job 留下的文件。
- **"所有 Job 都是串行的"**：默认是并行的。用 `needs` 才能控制串行顺序。

---

## 相关阅读

- [GitHub Actions 官方文档](https://docs.github.com/en/actions)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [CI/CD 概述](./overview.md) —— 理解 CI/CD 的整体概念和流水线设计思路
- [Docker 基础](./docker.md) —— 在 CI 中构建 Docker 镜像并推送至容器仓库

---

## 更新记录

- 2026-07-06：完成完整内容，补充 VitePress 完整 workflow 示例、矩阵构建、Job 间数据共享、secrets 安全机制

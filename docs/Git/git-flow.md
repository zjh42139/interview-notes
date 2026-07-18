---
title: Git Flow
description: Git 分支策略是团队协作的骨架，理解 Git Flow / GitHub Flow / Trunk-Based Development 三种模型的差异、优缺点和适用场景，是架构方向的核心问题
category: Git
type: api-reference
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-18
tags:
  - Git
  - 分支策略
  - Git Flow
  - GitHub Flow
  - Trunk-Based Development
---

# Git Flow

> ⭐⭐⭐⭐｜难度：中级

## 一句话总结

> Git 分支策略决定了团队"代码从哪来、到哪去、怎么合"。最主流的三种模型：**Git Flow**（重型，适合有固定发布周期的企业项目）、**GitHub Flow**（轻量，适合持续交付的 Web 应用）、**Trunk-Based Development**（极简，适合 CI/CD 成熟、有 feature flag 能力的团队）。

面试时这样开口："选择分支策略的关键是看团队的发布节奏和协作规模。Git Flow 用 master + develop + feature + release + hotfix 五类分支，适合需要维护多个版本的企业软件；GitHub Flow 只用 main + feature branch + PR，适合持续部署的 SaaS 产品。我们团队用的是简化版 Git Flow：保留 master、develop、feature、hotfix 分支，去掉了 release 分支，因为我们的后台管理系统是单版本发布的。"

## 核心机制

### Git Flow：经典的五分支模型

```
master    ★─────●─────────────────────★ v1.0     ★ v2.0
                  \                 /          /
develop   ●──●──●──●──●──●──●────●──●──●──●──●
               \    /     \    /      /
feature/A  ●──●──●──●     feature/B  ●──●
                              \         /
release/v1.0                 ●──●──●──●
                                       \
hotfix/bug                     ●──●──●──●
```

五类分支及其职责：

| 分支 | 生命周期 | 来源 | 合并到 | 命名 |
|------|---------|------|--------|------|
| **master/main** | 永久 | — | — | `main` |
| **develop** | 永久 | — | — | `develop` |
| **feature** | 临时（功能开发） | develop | develop | `feature/user-login` |
| **release** | 临时（发布准备） | develop | main + develop | `release/2.1.0` |
| **hotfix** | 临时（紧急修复） | main | main + develop | `hotfix/login-crash` |

**完整流程**：

```bash
# 1. 创建 feature 分支（Git 2.23+ 用 switch -c，替代 checkout -b）
git switch -c feature/user-export develop
# 开发 → 多次提交 → 开发完成

# 2. 合入 develop
git switch develop
git merge --no-ff feature/user-export
git branch -d feature/user-export

# 3. 准备发布：从 develop 分出 release 分支
git switch -c release/2.1.0 develop
# 在 release 上：修小 bug、更新版本号、更新 CHANGELOG
# 禁止在这里加新功能

# 4. 发布到 main
git switch main
git merge --no-ff release/2.1.0
git tag -a v2.1.0 -m "Release version 2.1.0"

# 5. 把 release 的修改合回 develop
git switch develop
git merge --no-ff release/2.1.0
git branch -d release/2.1.0

# 6. 紧急修复（hotfix）
git switch -c hotfix/login-crash main
# 修复 → 提交
git switch main
git merge --no-ff hotfix/login-crash
git tag -a v2.1.1 -m "Hotfix: login crash on Safari"
git switch develop
git merge --no-ff hotfix/login-crash
git branch -d hotfix/login-crash
```

### GitHub Flow：简化模型

```
main ──●────────●────────●──●──★ deploy
        \      / \      /
feature/A ●──●──●   feature/B ●──●
```

核心原则只有 6 个字：**分支、PR、部署**。

1. `main` 分支始终可部署
2. 任何新功能从 `main` 拉分支
3. 开发完成后提 Pull Request
4. Code Review 通过后合并到 `main`
5. 合并后立即部署

```bash
# GitHub Flow 全流程
git switch -c feature/dark-mode main
# 开发 + 推送
git push origin feature/dark-mode
# 创建 PR → Code Review → 合并
git switch main
git pull origin main
# 部署（自动或手动）
```

### Trunk-Based Development（TBD）：主干开发

```
main ──●─●─●─●─●─●─●─●──★ deploy
         \    /
short-lived ●──●   （分支生命周期 < 1 天）
```

核心理念：**所有人都直接在 main（trunk）上做小步提交，不创建长期分支**。如果需要隔离半成品功能，用 feature flag 控制。

```bash
# TBD 的一天
git pull origin main
# 改代码
git add -p                # 小粒度选择提交
git commit -m "feat: add export button to user list"
git pull --rebase origin main  # 拉取 + 变基
git push origin main
# 重复上面的流程，每天可以提交多次到 main
```

## 深度拓展

### 追问：三种模型怎么选？

| 维度 | Git Flow | GitHub Flow | TBD |
|------|----------|-------------|-----|
| **团队规模** | 10+ 人，多团队 | 3-20 人 | 任意（需要纪律） |
| **发布频率** | 固定周期（2周/月） | 随时发布 | 每天多次 |
| **多版本维护** | 需要（如 v1.x LTS + v2.x） | 不需要 | 不需要 |
| **分支数量** | 5 类，可能同时有 20+ 分支 | 2 类（main + feature） | 1 类（main） |
| **Code Review** | feature 合入 develop 时 | PR 合入 main 时 | commit 粒度 review |
| **回滚方式** | revert merge commit | revert merge commit 或 redeploy | revert commit 或 feature flag 关闭 |
| **适合项目** | 企业软件、手机 App、SDK | SaaS、网站、后台系统 | 微服务、成熟 CI/CD 团队 |

### 追问：为什么有人说 "Git Flow 已死"？

2010 年 Git Flow 提出时，发布一个版本需要经过 QA、打包、分发，周期两周到一个月。现在有了 CI/CD，代码合并后几分钟就能上线。Git Flow 的 release 分支成为了**不必要的瓶颈**。

但 Git Flow 并没有"死"——它在多版本管理模式中仍然不可替代。比如你维护一个 UI 组件库：
- v1.x 基于 Vue2，需要长期支持
- v2.x 基于 Vue3，主流开发
- hotfix 需要同时修到 v1 和 v2

这种场景下，Git Flow 的多分支管理正是刚需。

### 追问：Vue3 后台管理系统最适合哪种？

**推荐：GitHub Flow 的变体**（在实际项目中最常见）。

真实落地方式：

```bash
# 保留 main（生产）和 develop（开发）两条长期分支
# feature 从 develop 拉出，合回 develop
# develop 稳定后整体 merge 到 main，打 tag 发布
# hotfix 从 main 拉出，合回 main + develop

# 比起标准 Git Flow，去掉了 release 分支
# 比起 GitHub Flow，多了 develop 缓冲层
```

去掉 release 分支的理由：后台系统通常是单租户单版本部署，没有"同时发布 v1 和 v2"的需求。develop 到 main 就是一次发布，不需要单独的 release 缓冲。

## 项目实战

### 后台管理系统团队规范（示例）

```markdown
# 分支命名规范
feature/<module>-<description>   # feature/user-export, feature/dashboard-chart
hotfix/<description>              # hotfix/login-crash
release/<version>                 # release/2.1.0 (保留，但不强制)

# 合并规范
- feature → develop: merge --no-ff
- develop → main: merge --no-ff + tag
- hotfix → main: merge --no-ff + tag
- hotfix → develop: cherry-pick 或 merge
- 日常同步: develop 上 git pull --rebase

# 保护分支
- main: 禁止直接 push，只接受 merge
- develop: 禁止直接 push，只接受 merge
- 所有合并必须通过 PR + 至少一人 Approve
```

### CICD 配合

```yaml
# develop 分支 → 自动部署到测试环境
# main 分支 + tag → 自动部署到生产环境
# feature 分支 → 可选：部署到预览环境（PR preview）

name: Deploy
on:
  push:
    branches: [develop]
    tags: ['v*']

jobs:
  deploy-test:
    if: github.ref == 'refs/heads/develop'
    # 部署到 test.example.com

  deploy-prod:
    if: startsWith(github.ref, 'refs/tags/v')
    # 部署到 admin.example.com
```

## 易错点

- **生搬硬套 Git Flow**：团队只有 3 个人也用完整的 Git Flow，feature + release + hotfix 全上，维护分支比写代码还累。3-5 人团队用 GitHub Flow 足够了
- **develop 和 main 越走越远**：长期不同步 develop 和 main，最终合并时遇到 massive 冲突。解法：每次 main 发版后立刻把 main merge 回 develop，保持同步
- **hotfix 忘了合回 develop**：只修了 main，develop 上仍然带 bug，下一版本会复现。CI 可以加一步检查：hotfix 分支 merge 到 main 后，自动开 PR 合并回 develop
- **feature 分支存在太长时间**：一个 feature 开发了 3 周还没合，和 develop 之间的差异已经几百个 commit。解法：大功能拆成小功能，每个 3 天内合入。如果真需要长期开发，用 feature flag 在 TBD 模式下开发
- **release 分支上继续加新功能**：release 的唯一任务是修 bug + 更新元信息。加新功能意味着这些功能没有经过 develop 的正常 review 流程，风险极高

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "Git Flow 的流程是怎样的" | 追问 main/develop/feature/release/hotfix 分支模型 |
| "Git Flow 和 Trunk-Based 有什么区别" | 追问长期分支 vs 主干开发 + 短分支的 CI/CD 适配差异 |
| "你们团队用什么分支策略" | 追问根据团队规模和发布节奏选择——小团队简化版 Git Flow |

## 相关阅读

- [merge vs rebase](./merge-vs-rebase.md)
- [tag](./tag.md)
- [冲突处理](./conflict-resolution.md)
- [A successful Git branching model (Git Flow 原始文章)](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Flow 官方说明](https://docs.github.com/en/get-started/using-github/github-flow)
- [Trunk Based Development 官网](https://trunkbaseddevelopment.com/)

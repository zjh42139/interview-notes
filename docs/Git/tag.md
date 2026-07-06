---
title: tag
description: Git 标签用于标记发布版本，是 CI/CD 自动发布流程的触发器，配合语义化版本规范（Semantic Versioning）形成完整的版本管理闭环
category: Git
difficulty: 初级
frequency: ⭐⭐⭐
status: filled
created: 2026-07-06
updated: 2026-07-06
tags:
  - Git
  - tag
  - 版本管理
  - CI/CD
---

# tag

> ⭐⭐⭐｜难度：初级｜项目：★★★★

## 一句话总结

> Git tag 是一个"不会动的分支指针"——它永远指向某个特定的 commit，无论后续有多少提交。tag 的主要用途是标记发布版本（v1.0.0、v2.1.3），配合 Semantic Versioning 语义化版本规范，让团队有统一的标准来回答"这个版本包含什么？"。

面试时这样开口："tag 分两种：轻量标签只是一个指针，附注标签是一个完整的 Git 对象，包含 tagger 信息、时间戳和备注。项目中使用附注标签，配合语义化版本 major.minor.patch 命名。CI/CD 中监听 tag 推送事件来触发自动构建和发布。"

## 核心机制

### 轻量标签 vs 附注标签

```bash
# 轻量标签：只是一个指向 commit 的引用，没有额外信息
git tag v1.0.0
# 相当于一个不可移动的分支，没有标签作者、日期、备注

# 附注标签：一个完整的 Git 对象，存储在 .git/objects 中
git tag -a v1.0.0 -m "Release version 1.0.0: user management module"
# 包含：tagger 名字、邮箱、日期、备注、可选 GPG 签名
```

本质区别：

| 特性 | 轻量标签 | 附注标签 |
|------|---------|---------|
| 存储 | 只是一个 ref 文件 | 完整的 Git 对象（有独立的 hash） |
| 元信息 | 无 | 作者、日期、备注 |
| GPG 签名 | 不支持 | 支持 `-s` |
| 适用场景 | 临时标记、个人备忘 | **正式发布（推荐）** |

团队成员应该统一用附注标签，它能回答：谁打的这个 tag？什么时候？为什么？

### 标签操作命令

```bash
# 列出所有标签
git tag
git tag -l "v2.*"   # 筛选：v2 开头的所有版本

# 查看标签详情
git show v1.0.0     # 附注标签会显示 tagger、日期、备注、对应 commit

# 给历史 commit 打标签
git tag -a v0.9.0 <commit-hash> -m "Pre-release version"

# 删除本地标签
git tag -d v1.0.0

# 推送标签到远程
git push origin v1.0.0          # 推送单个标签
git push origin --tags           # 推送所有本地标签（谨慎！会推送临时标签）

# 删除远程标签
git push origin --delete v1.0.0
# 或
git push origin :refs/tags/v1.0.0

# 检出标签（进入 detached HEAD 状态）
git checkout v1.0.0
# 如果需要在标签上修改代码，从标签创建分支：
git checkout -b hotfix/from-v1.0.0 v1.0.0
```

**注意**：`git push` 默认不推送标签，需要显式指定。这是常见的新手坑——本地打了 tag，以为已经发布，实际远程什么都没有。

### 语义化版本（Semantic Versioning）

标准格式：`MAJOR.MINOR.PATCH`，如 `2.1.3`

```bash
v1.0.0  # 初始版本
v1.0.1  # PATCH：修复 bug，向后兼容
v1.1.0  # MINOR：新增功能，向后兼容
v2.0.0  # MAJOR：不兼容的 API 变更
```

在 Conventional Commits 体系中，这三个数字可以自动推算：

- `feat` commit -> MINOR 版本 +1
- `fix` commit -> PATCH 版本 +1
- `BREAKING CHANGE` 或 `feat!` -> MAJOR 版本 +1

附加标签：
- `v1.0.0-alpha.1`：内测版本
- `v1.0.0-beta.1`：公测版本
- `v1.0.0-rc.1`：发布候选（Release Candidate）

## 深度拓展

### 追问：tag 和 branch 有什么区别？

核心区别：**branch 会移动，tag 不会**。

- branch 是一个**可变指针**：当你提交时，branch 自动指向最新 commit
- tag 是一个**不可变指针**：打上后永远指向那个 commit，除非你手动删除重建

这带来一个实际问题：如果在 tag 指向的 commit 之前有遗漏的 bug 修复，你需要：
1. 在这个 tag 上新建分支
2. cherry-pick 修复 commit
3. 重新打一个新的 tag（不能覆盖旧的 tag）

```bash
git checkout -b release/1.0.1 v1.0.0
git cherry-pick <hotfix-commit>
git tag -a v1.0.1 -m "hotfix: login page crash on Safari"
```

### 追问：CI/CD 中怎么用 tag 触发自动发布？

```yaml
# GitHub Actions 示例：推送 tag 时自动构建和发布
name: Release
on:
  push:
    tags:
      - 'v*'  # 匹配 v1.0.0, v2.1.3 等所有版本标签

jobs:
  build-and-release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build
        run: npm run build
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          tag_name: ${{ github.ref_name }}
          generate_release_notes: true
```

Vue3 后台管理系统中，当 tag `v2.1.0` 被推送，CI 自动：
1. 检出代码
2. `npm run build` 构建生产版本
3. 打包 dist 目录
4. 上传到服务器或创建 GitHub Release
5. 发送钉钉/企微通知

## 项目实战

### 后台管理系统的版本发布流程

在一个 Vue3 + Element Plus 后台系统中，标准的版本发布流程：

```bash
# 第一步：开发完成，所有功能合入 main
git checkout main
git merge --no-ff feature/user-management
git merge --no-ff feature/order-export

# 第二步：运行测试 + 构建验证
npm run test
npm run build

# 第三步：生成 changelog + 自动打 tag（用 standard-version）
npm run release -- --release-as minor
# 自动完成：
# - 分析上次 tag 以来的所有 feat/fix commit
# - 生成 CHANGELOG.md
# - bump package.json version 到 2.2.0
# - git tag -a v2.2.0
# - git commit "chore(release): 2.2.0"

# 第四步：推送代码和标签
git push origin main
git push origin v2.2.0

# 第五步：CI 检测到 tag v2.2.0，自动触发部署流水线
```

### 误打标签后的补救

```bash
# 场景：tag 打在了错误的 commit 上
# 当前：v2.1.0 指向 commit A，但应该指向 commit B

# 1. 删除旧 tag（本地 + 远程）
git tag -d v2.1.0
git push origin --delete v2.1.0

# 2. 重新打在正确的 commit 上
git tag -a v2.1.0 <commit-B-hash> -m "Release version 2.1.0"

# 3. 推送新 tag
git push origin v2.1.0

# 注意：如果已经有 CI 基于旧 tag 触发了部署，需要手动触发一次重新部署
```

## 易错点

- **用轻量标签代替附注标签做正式发布**：丢失了 tagger、日期、备注信息，半年后没人知道 v1.0.0 是谁什么时候打的
- **`git push` 忘记推送 tag**：默认不推送，记得 `git push origin vX.X.X` 或配置 `push.followTags = true`
- **`git push origin --tags` 推送了脏标签**：会把所有本地临时标签（如 `test`、`temp`）都推送到远程，污染团队的标签列表。建议只用 `git push origin vX.X.X` 明确推送
- **在标签上直接开发**：`git checkout v1.0.0` 进入 detached HEAD 状态，在这里提交会"悬空"。如果需要修改，先从 tag 创建分支
- **tag 名称没有统一规范**：有的用 `v1.0.0`，有的用 `1.0.0`，有的用 `release-1.0.0`。团队统一 `v` 前缀 + 三数版本号

## 相关阅读

- [Commit 规范](./commit-spec.md)
- [Git Flow](./git-flow.md)
- [语义化版本规范](https://semver.org/lang/zh-CN/)
- [Git 官方文档：git-tag](https://git-scm.com/docs/git-tag)
- [GitHub：创建 Release](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)

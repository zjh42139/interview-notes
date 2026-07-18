---
title: fetch vs pull
description: Git fetch 和 pull 的本质区别、FETCH_HEAD 概念、pull --rebase 推荐原因、fetch 后手动操作的完整流程
category: Git
type: mechanism
difficulty: 初级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-18
updated: 2026-07-18
tags:
  - Git
  - fetch
  - pull
  - 远程同步
---

# fetch vs pull

> `git pull` 是一个复合命令——它做了 `fetch` + 合并。很多开发者每天 `git pull` 却不知道背后有两步，这是面试最容易被问倒的基础题之一。

## 一句话总结

`git pull` = `git fetch` + 合并（默认 merge，可配 rebase）。`fetch` 只下载远程数据到本地仓库，不修改工作区；`pull` 在下载后自动合并，直接更新本地文件。推荐团队协作使用 `pull --rebase` 保持线性历史。

## 核心机制

### fetch：只下载，不改工作区

```bash
# 从默认远程仓库（origin）下载所有分支的更新
git fetch

# 从指定远程仓库下载
git fetch origin

# 下载指定分支
git fetch origin main
```

`git fetch` 做的事：
1. 连接远程仓库，下载本地没有的 commit、tree、blob 对象
2. 更新 `.git/refs/remotes/origin/xxx` 远程跟踪分支指针
3. **不修改本地工作区、不修改当前分支、不修改 HEAD**

fetch 后的状态：

```
远程:
  origin/main: D---E---F

本地 fetch 前:
  main: D---E

本地 fetch 后:
  main: D---E         (本地分支指针未移动)
  origin/main: D---E---F   (远程跟踪分支更新了)
```

### pull = fetch + merge（默认）

```bash
# 以下两条等价
git pull origin main
git fetch origin main && git merge origin/main
```

默认行为：拉取远程提交，执行 `git merge` 产生合并节点。

```
# fetch 后状态
      G---H  (本地 main)
     /
D---E---F  (origin/main)

# pull 执行 merge 后
      G---H
     /     \
D---E---F---I  (本地 main，I 是 merge commit)
```

### pull --rebase = fetch + rebase

```bash
git pull --rebase

# 等价于
git fetch && git rebase origin/main

# 设置为默认行为
git config --global pull.rebase true
```

执行 rebase 后，提交历史是一条直线：

```
# 变基前
      G---H  (本地 main)
     /
D---E---F  (origin/main)

# pull --rebase 后
D---E---F---G'---H'  (本地 main，G'H' 是重新应用的提交)
```

### FETCH_HEAD 是什么

`FETCH_HEAD` 是 git 记录「上次 fetch 拉取到的分支 tip」的简短引用。每次 `git fetch` 都会更新它。当你不指定 `git pull` 的分支时，Git 读取 `FETCH_HEAD` 来确定该合并哪个分支的哪个 commit。

```bash
# 查看 FETCH_HEAD 的内容
cat .git/FETCH_HEAD
# abc123...  branch 'main' of https://github.com/user/repo
```

大多数日常操作不需要直接使用 `FETCH_HEAD`，但了解它有助于理解 `git pull` 为什么能「自动知道合并谁」。

### 远程跟踪分支更新时机

远程跟踪分支（`origin/main`、`origin/feature` 等）**只在下述操作时更新**：

- `git fetch` / `git pull`
- `git remote update`

**不会自动刷新**——只要没执行过 fetch，`origin/main` 就永远是上一次同步的状态，不会因为别人推了代码就自动更新。这是很多新手困惑「明明别人推了代码，为什么我 git log 看不到」的根本原因。

## 深度拓展

### 为什么团队协作推荐 pull --rebase

**避免多余的 merge commit**。假设你和同事都在 `main` 分支上开发：

```
# 默认 pull（merge）
同事推了 F，你自己本地在 E 上改了 G

git pull 后:
D---E---F---G
       \     /
        -------
留下了 "Merge branch 'main' of github.com:xxx/repo" 这种无意义的合并节点
```

这种自动生成的 merge commit 没有语义价值——它不代表功能合并，只是「同步远程代码」的副作用。大量这种合并节点让提交历史难以阅读，`git blame` 时还要多跳一层。

```
# pull --rebase
同样场景，git pull --rebase 后:
D---E---F---G' (干净的线性历史)

G' 是 G 在 F 之上的重放，不产生额外合并节点
```

**一句话总结**：`pull --rebase` 让「同步远程代码」这件事在提交历史中不可见——因为它本身就不是一个值得被记录的事件。

### fetch 后手动操作的完整流程

推荐在以下场景用 fetch + 手动操作替代直接 pull：

```bash
# 1. 先看看远程有什么更新
git fetch origin

# 2. 查看远程比本地多了哪些提交
git log origin/main ^HEAD
# 或更直观的写法
git log HEAD..origin/main

# Git 2.23+ 推荐用 switch 切分支
# 3. 根据情况决定合并方式
# 情况 A：本地没有新提交，直接 fast-forward
git merge origin/main

# 情况 B：本地有提交，用 rebase 保持线性
git rebase origin/main

# 情况 C：想保留合并历史（长期分支）
git merge --no-ff origin/main
```

**为什么要先 fetch 再手动操作？**

- 可以先用 `git log` / `git diff` 检查远程更新了什么
- 避免意外冲突——先看到冲突范围再做心理准备
- 如果远程有 breaking change，可以在 merge 前做预案
- 这是理解 Git 工作方式的第一步

## 项目实战

### 日常开发工作流

```bash
# 早上到公司：同步最新代码
git switch main
git fetch origin
git rebase origin/main

# 切出功能分支
git switch -c feature/xxx

# 开发过程中——
# 期间同事在 main 上合了新的提交，同步到当前功能分支
git fetch origin
git rebase origin/main
# 有冲突就解决后 git add . && git rebase --continue

# 功能完成，推到远程前最后同步一次
git fetch origin
git rebase origin/main

# 推送
git push origin feature/xxx
```

### 一条线上保持线性历史

```bash
# 设置全局 pull --rebase，不用每次都加 --rebase
git config --global pull.rebase true

# 效果：之后 git pull 默认等价于 git pull --rebase
# 如果某次确实需要 merge，显式写:
git pull --no-rebase
```

## 易错点

**混淆 fetch 和 pull**

> 面试时最常见的基础扣分点：说「`git pull` 就是从远程下载代码」。更准确的表述是「`git fetch` 下载远程数据但不合并，`git pull` = fetch + 合并」。能区分两者的候选人说明不只是死记命令。

**pull 前没 stash 或 commit 本地改动**

> 工作区有未提交的修改时执行 `git pull`，Git 会拒绝合并（`error: Your local changes to the following files would be overwritten by merge`）。正确做法：先 `git stash` 暂存 → `git pull` → `git stash pop` 恢复，或先 commit 再 pull。

**对 `git pull --force` 的理解**

> `git pull --force` 其实是 `git fetch --force` + merge。`--force` 传给的是 fetch 阶段——允许覆盖本地的远程跟踪分支（`origin/main`），而不是 force merge。很多开发者误以为它是「强拉远程代码覆盖本地」，实际不是。

**pull --rebase 冲突处理不当会丢提交**

> rebase 过程中解决冲突后必须 `git rebase --continue` 继续。如果执行 `git rebase --abort` 放弃重放，会回到 rebase 前的状态——但在 rebase 过程中已经解决的冲突修改会丢失。另外，如果 rebase 进行一半误执行 `git pull --rebase` 再次触发 rebase，会嵌套 rebase 导致提交混乱。合并过程中想放弃时回到 merge 版本：`git merge --abort`；两者都可用 `git status` 检查当前是否在 rebase/merge 流程中。

## 面试信号

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "fetch 和 pull 有什么区别" | 追问 pull 等于 fetch + 哪个操作——明白 FETCH_HEAD 作用 |
| "git pull 后出现 merge commit 怎么避免" | 追问 `--rebase` 原理——说明线性历史的团队优势 |
| "为什么 fetch 后本地代码没变" | 追问 fetch 只更新远程跟踪分支——理解本地/远程分支的指针分离 |

## 相关阅读

- [merge vs rebase](./merge-vs-rebase.md) -- pull --rebase 的底层原理
- [冲突处理](./conflict-resolution.md) -- pull/rebase 冲突的解决流程
- [stash](./stash.md) -- pull 前暂存本地改动的工具
- [Git 官方文档：git-fetch](https://git-scm.com/docs/git-fetch)
- [Git 官方文档：git-pull](https://git-scm.com/docs/git-pull)

## 更新记录

- 2026-07-18：初始创建

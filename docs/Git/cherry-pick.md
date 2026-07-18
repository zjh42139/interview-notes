---
title: cherry-pick
description: git cherry-pick 用于将某个（或某几个）提交精确复制到当前分支，是 hotfix 场景和误提交修复中最常用的高级命令之一
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
  - cherry-pick
  - hotfix
  - 提交管理
---

# cherry-pick

> ⭐⭐⭐⭐｜难度：中级

## 一句话总结

> `git cherry-pick` 字面意思是"摘樱桃"——从别的分支上精准摘一个或多个 commit，把它们的变更（diff）应用到当前分支。它不是合并整个分支，而是**挑选你需要的提交**。

面试时这样开口："cherry-pick 最常见的使用场景是 hotfix：在 release 分支上修了一个紧急 bug，同时要把这个修复同步到 main 和 develop 分支。用 cherry-pick 而不是 merge，可以避免把 release 分支上的其他改动也带进来。还有一个场景是你不小心把 commit 提交到了错误的分支，cherry-pick 到正确分支后再在原分支 reset 掉。"

## 核心机制

### 原理

cherry-pick 的底层机制和 rebase 非常相似：**找到该 commit 相对于其 parent 的 diff，把这个 diff 当作 patch，应用到当前分支的 HEAD 上，生成一个新的 commit**。

```
# 分支情况
      A---B---C---D  feature
     /
E---F---G  main

# 你只想要 feature 分支上的 C 这个 commit
git switch main
git cherry-pick C

# 结果：C 的 diff 被应用到 main 上，生成新 commit C'
E---F---G---C'  main
```

注意：C' 的 **内容** 和 C 一样，但是一个全新的 commit，hash 完全不同，parent 是 G 而不是 B。message 默认保留原 message；只有加 `-x` 参数时才会在末尾追加 `(cherry picked from commit <原hash>)`。

### 基本用法

```bash
# 单个 commit
git cherry-pick <commit-hash>

# 多个不连续的 commit
git cherry-pick <hash-A> <hash-C> <hash-F>

# 连续的 commit 范围（不包含 A，从 A 之后到 B）
git cherry-pick A..B

# 包含 A 的范围
git cherry-pick A^..B
```

### cherry-pick 中的冲突处理

cherry-pick 和 merge、rebase 一样会遇到冲突。解决流程一样：

```bash
# cherry-pick 遇到冲突
git cherry-pick abc123
# error: could not apply abc123...

# 手动解决冲突文件中的 <<<<<<< ======= >>>>>>> 标记
# 然后：
git add .
git cherry-pick --continue

# 如果不想处理了：
git cherry-pick --abort
```

### 常用参数

```bash
# -n / --no-commit：只把变更放到暂存区和工作区，不自动提交
git cherry-pick -n <hash>
# 适合：想挑多个 commit 的代码，但合并成一个 commit 提交

# -e / --edit：允许修改 commit message
git cherry-pick -e <hash>

# -x：在 commit message 后追加来源信息（推荐，方便追溯）
git cherry-pick -x <hash>
# message 末尾自动添加：(cherry picked from commit abc123)
```

## 深度拓展

### 追问：cherry-pick 和 merge 的选择

| 场景 | 用什么 | 理由 |
|------|--------|------|
| 把一个分支的所有改动合入另一个分支 | merge | cherry-pick 一个个摘会累死 |
| 只需要分支中的某几个 commit | cherry-pick | merge 会把整条分支的历史都带过来 |
| hotfix 同步到多个长期分支 | cherry-pick | 只同步修复的那一个 commit，不污染目标分支 |
| 误提交到错误分支，移到正确分支 | cherry-pick + reset | 摘过去后，在原分支上 reset 掉 |

### 追问：cherry-pick 的潜在问题

1. **重复提交**：同一个修复以不同 hash 出现在两个分支上，将来 merge 时 Git 无法把它们识别为同一个变更，可能再次产生冲突。`-x` 记录的来源信息只用于人工追溯，Git 合并时并不使用它
2. **缺少上下文**：cherry-pick 只摘了 diff，不包含依赖。如果 C 依赖了 B 加的一个工具函数，你只 cherry-pick C 到 main，main 上没有那个工具函数，代码跑不起来
3. **功能碎片化**：过度使用 cherry-pick 会导致不同分支之间的功能碎片化，难以 track 哪些改动在哪些分支上

**建议**：cherry-pick 是救急工具，不是日常开发流程。hotfix 应该第一时间升格为正式流程（比如合并到所有长期分支），而不是靠 cherry-pick 打补丁。

## 项目实战

### 后台管理系统 hotfix 标准操作

场景：Vue3 后台系统 v2.1.0 已经上线，在 `release/2.1.0` 分支上发现一个权限校验的严重 bug。

```bash
# 1. 在 release 分支上修复
git switch release/2.1.0
# 修改 src/utils/permission.js
git add . && git commit -m "fix(permission): router guard missing token refresh check"

# 记录 commit hash，假设是 abc123

# 2. 把修复同步到 main（生产主分支）
git switch main
git cherry-pick -x abc123
git push origin main

# 3. 把修复同步到 develop（开发主分支，用于下一版本）
git switch develop
git cherry-pick -x abc123
git push origin develop

# 4. 发布 hotfix 版本
git switch release/2.1.0
git tag -a v2.1.1 -m "hotfix: permission guard token refresh"
git push origin v2.1.1
```

用 `-x` 参数的好处：所有分支的 commit message 都有 `(cherry picked from commit abc123)`，将来追溯时能快速关联。

### 误提交到错误分支的救急操作

```bash
# 情况：你本应在 feature/user 分支上开发，但不小心在 main 上做了 commit
git log --oneline
# def456 (HEAD -> main) feat(user): add user export功能
# ghi789 feat(order): add order list page

# 1. 切到正确的分支
git switch feature/user

# 2. 把错误的 commit cherry-pick 过来
git cherry-pick def456

# 3. 回到 main，删掉错误的 commit
git switch main
git reset --hard HEAD~1  # 把 def456 从 main 删除

# 注意：如果 def456 已经 push 了，reset 后需要 force push，
# 且要通知团队成员
```

## 易错点

- **cherry-pick 了有依赖的 commit**：只摘了 C，但 C 的代码依赖了 B 的函数。解法：要么用 `A..C` 摘连续范围，要么检查依赖关系
- **忘记 `--continue` 或 `--abort`**：和 rebase 一样，cherry-pick 进行中不能执行其他操作。`git status` 查看当前状态，`git cherry-pick --abort` 放弃
- **用 cherry-pick 代替 merge 管理功能分支**：cherry-pick 不记录合并关系，将来 merge 时 Git 不知道这些提交已经存在，容易产生"已被应用的变更再次合并"的冲突
- **cherry-pick 一个 merge commit**：merge commit 有多个 parent，直接 cherry-pick 需要指定 `-m` 参数告诉 Git 以哪个 parent 为基准，否则会报错。一般不推荐 cherry-pick merge commit，用 merge 代替

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "cherry-pick 怎么用" | 追问 `git cherry-pick <commit>` 把指定提交应用到当前分支 |
| "cherry-pick 冲突了怎么办" | 追问解决冲突后 `git cherry-pick --continue` |
| "cherry-pick 和 merge 有什么区别" | 追问 merge 合并整个分支历史——cherry-pick 只挑单个提交 |

## 相关阅读

- [merge vs rebase](./merge-vs-rebase.md)
- [冲突处理](./conflict-resolution.md)
- [Git 官方文档：git-cherry-pick](https://git-scm.com/docs/git-cherry-pick)
- [Atlassian：Git Cherry Pick](https://www.atlassian.com/git/tutorials/cherry-pick)

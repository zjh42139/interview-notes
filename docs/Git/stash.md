---
title: stash
description: git stash 用于临时保存工作区的未提交修改，让你可以在不丢失进度的前提下快速切换上下文，是日常开发中使用频率最高的"救急"命令
category: Git
type: api-reference
score: 0
difficulty: 初级
frequency: ⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
tags:
  - Git
  - stash
  - 工作流
  - 上下文切换
---

# stash

> ⭐⭐⭐⭐｜难度：初级｜项目：★★★★★

## 一句话总结

> `git stash` 把你的工作区和暂存区"保存为一个临时快照"，然后把工作区恢复到和 HEAD 一样干净的状态。等处理完其他事情后，再用 `git stash pop` 把快照恢复回来。本质是一条**临时性的、本地的、轻量级的代码存档**。

面试时这样开口："stash 最典型的使用场景是：你正在 feature 分支上写功能，突然线上有个紧急 bug 需要立刻修。代码写到一半不能提交（会污染历史），但又不能丢。这时候 `git stash` 一键保存现场，切到 hotfix 分支修完 bug，切回来 `git stash pop` 恢复继续开发。整个过程不会产生任何无意义的 WIP 提交。"

## 核心机制

### stash 的本质

git stash 操作的是一块特殊的存储区域，不是分支，也不是远程仓库的一部分。它的数据结构是一个**栈**——后进先出。

每次执行 `git stash`，Git 做了三件事：

1. 把暂存区（staged）的修改记下来
2. 把工作区（tracked files 的修改）记下来
3. 用 HEAD 的状态重置工作区和暂存区

stash 默认**不保存**两种情况：
- 未跟踪的新文件（untracked files），除非加 `-u`
- 被 `.gitignore` 忽略的文件，除非加 `-a`

### 核心命令

```bash
# 最基本的：暂存当前所有修改
git stash
# 等效于 git stash push

# 暂存并附带备注（强烈推荐，否则以后分不清）
git stash save "正在开发用户列表的分页功能"

# 或者用 push 语法（新版推荐）
git stash push -m "正在开发用户列表的分页功能"

# 包含未跟踪的文件
git stash -u
# 或 git stash --include-untracked

# 恢复最近一次暂存并删除 stash 记录
git stash pop

# 恢复最近一次暂存但保留 stash 记录（可以多次 apply）
git stash apply

# 恢复指定的某一次 stash
git stash pop stash@{1}
git stash apply stash@{2}

# 查看所有 stash 列表
git stash list
# stash@{0}: On feature/user: 正在开发用户列表的分页功能
# stash@{1}: On main: 修了一个小样式问题

# 查看某个 stash 的具体内容
git stash show -p stash@{0}

# 删除最近一次 stash
git stash drop

# 删除指定 stash
git stash drop stash@{1}

# 清空所有 stash
git stash clear
```

### pop vs apply

这是面试中容易被追问的点：

| 命令 | 效果 | 使用场景 |
|------|------|----------|
| `git stash pop` | 恢复 + **自动删除** stash 记录 | 确认只需要恢复一次，用完即删 |
| `git stash apply` | 只恢复，**不删除** stash 记录 | 想尝试恢复后不丢失备份，或者想把同一个 stash 恢复到多个分支 |

**坑**：`git stash pop` 恢复时如果产生冲突，冲突解决后 stash 记录**不会被自动删除**，需要手动 `git stash drop`。这是为了防止你冲突还没解决完 stash 就没了。

### 只暂存部分文件

```bash
# 交互式选择哪些改动要 stash
git stash push -p

# 只 stash 特定文件
git stash push -- src/views/user/index.vue src/api/user.js
```

## 深度拓展

### 追问：stash 后的文件去哪里了？

stash 的数据存在 `.git/refs/stash` 里，结构类似一个特殊的 merge commit——它有两个 parent：
- parent 1：HEAD（当前分支的最新提交）
- parent 2：暂存区 + 工作区的状态

你可以用 `git log --graph stash` 看到 stash 的引用。这也是 `git stash pop` 失败时 stash 还在的原因——它本质上是一个 dangling commit。

### 追问：stash 和临时 commit（WIP）怎么选？

| 方式 | 优点 | 缺点 |
|------|------|------|
| `git stash` | 不污染提交历史，一个命令搞定 | stash 只在本地，容易忘记清理，栈深了难管理 |
| `git commit -m "WIP: xxx"` | 可以 push 到远程备份，有明确记录 | 会在提交历史中留下 WIP 标记，需要后续 squash |

**团队建议**：临时离开用 stash。如果要过夜或者跨设备开发，做一个 WIP commit 然后第二天 `git reset HEAD~1` 或 `rebase -i` squash 掉。

### 追问：stash 能跨分支使用吗？

可以。stash 是全局的，不属于任何分支。你在 feature/A 上 stash，切换到 feature/B 上也能 `git stash pop`。这也意味着要注意：**pop 到错误的分支可能导致代码放错地方**。建议 stash 时备注清楚当前分支和内容。

## 项目实战

### 后台管理系统的典型 stash 工作流

场景：Vue3 后台管理系统开发中，正在 `feature/dashboard` 分支上重构数据大屏页面。

```bash
# 上午 10:00 -- 正在开发中，突然收到线上报警
# 工作区有改动：改了 3 个文件，新增了 1 个 ECharts 配置文件

# 1. 暂存现场（带备注！）
git stash push -m "dashboard: 重构数据大屏 ECharts 配置抽离，完成 60%"

# 2. 创建 hotfix 分支修 bug
git checkout main
git checkout -b hotfix/dashboard-timeout

# 3. 修 bug、提交、合入 main、发布
git add . && git commit -m "fix(dashboard): request timeout when data > 10000 rows"
git checkout main && git merge --no-ff hotfix/dashboard-timeout
git push origin main

# 4. 回到 feature 分支继续开发
git checkout feature/dashboard
git stash pop
# 工作区恢复到上午 10:00 的状态，继续开发

# 5. 确认无冲突，stash 已自动删除
git stash list
# (空，stash 已清除)
```

### stash 冲突处理

```bash
# pop 时产生冲突：主分支上 dashboard 页面的某行代码也被 hotfix 改过
git stash pop
# CONFLICT: src/views/dashboard/index.vue

# 1. 先解决冲突（和 merge 冲突解决一样）
# 手动编辑 src/views/dashboard/index.vue，删除 <<<<<<< ======= >>>>>>>

# 2. 标记已解决
git add src/views/dashboard/index.vue

# 3. stash 记录还在（因为 pop 产生冲突时不会删除）
git stash drop  # 手动删除
```

## 易错点

- **不写备注导致 stash 堆积**：一个月下来 `git stash list` 有 20 条，每条都是 "WIP on feature/xxx"，完全分不清哪个是哪个。习惯只用 `git stash save "message"`
- **`git stash pop` 后忘记处理冲突**：pop 产生冲突后不会自动删除 stash，如果下次再 pop，会把同一个 stash 再次应用到已经部分恢复的代码上，雪上加霜
- **stash 里包含 node_modules**：如果在项目根目录执行 `git stash -u`，会暂存所有未跟踪文件包括 node_modules——巨大无比，potentially 几万文件的 stash。确保 `.gitignore` 配置正确
- **误以为 stash 是备份机制**：stash 是临时暂存，不是长期存储。换电脑、clone 新仓库、clean 操作都会导致 stash 丢失。重要代码及时 commit
- **stash 后忘了自己 stash 了什么**：用 `git stash show -p stash@{0}` 查看具体变更内容

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "stash 怎么用" | 追问 `stash push` 暂存、`stash pop` 恢复、`stash list` 查看 |
| "stash pop 和 stash apply 有什么区别" | 追问 pop 恢复后删除 stash——apply 保留在 stash 列表中 |
| "怎么 stash 部分文件" | 追问 `stash push -p` 交互式选择或 `stash push -- <file>` 指定文件 |

## 相关阅读

- [merge vs rebase](./merge-vs-rebase.md)
- [冲突处理](./conflict-resolution.md)
- [Git 官方文档：git-stash](https://git-scm.com/docs/git-stash)
- [Atlassian：Git Stash](https://www.atlassian.com/git/tutorials/saving-changes/git-stash)

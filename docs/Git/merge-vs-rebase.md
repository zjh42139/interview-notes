---
title: merge vs rebase
description: merge 和 rebase 是 Git 合并代码的两种核心策略，理解它们的原理、区别和适用场景是区分初中高级开发者的关键分水岭
category: Git
type: comparison
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-18
tags:
  - Git
  - merge
  - rebase
  - 分支策略
---

# merge vs rebase

> ⭐⭐⭐⭐⭐｜难度：中级

## 一句话总结

> `git merge` 创建一个新的"合并提交"来整合两个分支，保留完整的历史记录和分支拓扑。`git rebase` 把当前分支的提交"重放"到目标分支的最新提交之后，让历史变成一条直线。面试核心：**merge 保留真相，rebase 美化历史**。

面试时这样开口："merge 和 rebase 的最终代码状态是一样的，区别在于提交历史的形状。merge 会产生一个合并节点，历史是分叉再合并的图结构；rebase 会把你的提交移到最后，历史是一条直线。我们的团队规范是：功能分支合入主干用 `merge --no-ff` 保留合并节点，个人分支同步主干用 `rebase` 保持历史整洁。"

## 核心机制

### merge 的原理

merge 有三种情况：

**Fast-forward（快进合并）**：目标分支没有新提交，直接把指针移过去。

```
# 合并前
      A---B---C  feature
     /
D---E          main

# git merge feature（fast-forward，无合并节点）
D---E---A---B---C  feature, main
```

**Three-way merge（三方合并）**：两个分支都有新提交，Git 找到共同祖先，计算三方差异，自动合并或产生冲突。

```
# 合并前
      A---B---C  feature
     /
D---E---F---G  main

# git merge feature（三方合并，生成合并节点 H）
      A---B---C
     /         \
D---E---F---G---H  main
```

**关键参数**：

- `git merge <branch>`：默认行为，能 fast-forward 就 fast-forward
- `git merge --no-ff <branch>`：强制创建合并节点（推荐，保留合并痕迹）
- `git merge --squash <branch>`：把所有提交的变更压缩后放入暂存区，**需要再手动 `git commit`** 才会生成那一个提交，不保留原分支历史（适合临时分支）

### rebase 的原理

rebase 的核心操作：**找到分叉点，把你在这条分支上的提交一个个"摘下来"，按顺序重新应用到目标分支的最新提交上**。

```
# 变基前
      A---B---C  feature
     /
D---E---F  main

# git rebase main（在 feature 分支上执行）
D---E---F---A'---B'---C'  feature
```

注意：A'、B'、C' 是**全新的 commit**，hash 值和原来的 A、B、C 完全不一样，因为它们的 parent 变了。这就是 rebase 改写历史的本质。

rebase 中的冲突处理也比 merge 更"累"——如果三个 commit 每个都和 main 有冲突，rebase 会让你**逐个 commit 解决冲突**，每个解决后 `git rebase --continue`，直到所有 commit 重放完毕。

## 深度拓展

### 追问：黄金规则是什么？为什么？

> **永远不要对已经推送到远程的分支做 rebase。**

原因：rebase 会重写 commit hash。假设你和同事共享 feature 分支，你 rebase 了并 force push，同事本地还是旧 hash。同事再次推送时，Git 会发现历史分叉，只能 force push 覆盖，导致你 rebase 的提交丢失——结果是两个人互相覆盖，谁也保不住自己的代码。

如果已经推送到远程但确实需要 rebase（比如清理 commit 历史），正确做法：

1. 通知所有协作者"我要 rebase feature 分支"
2. 执行 rebase
3. force push 到远程
4. 所有协作者 `git fetch && git reset --hard origin/feature` 强制同步

### 追问：什么场景用 merge？什么场景用 rebase？

| 场景 | 推荐 | 理由 |
|------|------|------|
| feature 分支合入 main/master | `merge --no-ff` | 保留合并节点，清晰标识"某个功能在哪次合并中引入的"，方便整体回滚 |
| release 分支合入 main | `merge --no-ff` | 同上，发布应该是一个明确的事件节点 |
| hotfix 分支合入 main | `merge --no-ff` | 紧急修复需要可追溯的合并记录 |
| 开发 feature 时同步 main 的最新代码 | `rebase` | 避免无意义的 merge commit "merge main into feature"，保持 feature 分支历史线性 |
| 提交 PR 前整理 commit 历史 | `rebase -i` | 用交互式 rebase 把 "fix typo"、"wip" 这类临时提交合并成有意义的提交 |
| 两个长期分支之间 | `merge` | 长期分支之间的 rebase 代价太大，冲突处理工作量爆炸 |

### 追问：`rebase -i` 能做什么？

交互式 rebase 是整理提交历史的利器：

```bash
git rebase -i HEAD~3  # 对最近 3 个 commit 进行操作
```

会弹出编辑器，每个 commit 前有一个 pick 命令，可以改为：

- `reword`：修改 commit message
- `squash`：合并到前一个 commit，保留 message
- `fixup`：合并到前一个 commit，丢弃 message（适合 "fix typo" 类提交）
- `drop`：删除这个 commit
- `edit`：暂停 rebase，让你修改这个 commit 的内容

典型场景：开发 feature 时有 10 个小提交，PR 前用 `rebase -i` 合并成 3 个有意义的提交，让 code review 更容易。

## 项目实战

### Vue3 后台管理系统的分支策略

在一个 Vue3 + Element Plus 后台项目中，我们这样约定：

```bash
# 日常开发：从最新 main 切出功能分支
git switch main && git pull      # Git 2.23+ 用 switch 切分支，替代职责混杂的 checkout
git switch -c feature/user-management

# 开发过程中，每天下班前同步 main 的最新代码（用 rebase）
git fetch origin main
git rebase origin/main
# 如有冲突，解决后 git add . && git rebase --continue

# 功能开发完成，整理提交历史准备 PR
git rebase -i main  # 把 "wip"、"fix lint" 等临时提交合并

# 代码审查通过，合入 main
git switch main
git merge --no-ff feature/user-management
# 这样 main 上会留下一个 merge commit：
# "Merge branch 'feature/user-management' into main"
# 将来如果这个功能有问题，git revert -m 1 <merge-commit> 一次性回滚整个功能
```

### 踩坑：rebase 后 push 不上去

```bash
git push origin feature/xxx
# ! [rejected] feature/xxx -> feature/xxx (non-fast-forward)
# error: failed to push some refs
```

这说明你 rebase 后的分支和远程分支历史不一致。如果确认远程分支只有你一个人在用：

```bash
git push --force-with-lease origin feature/xxx
# --force-with-lease 比 --force 安全：如果远程有别人的新提交，会拒绝推送
```

## 易错点

- **对公共分支做 rebase**：最常见的 Git 灾难。记住"私有分支 rebase，公共分支 merge"
- **解决 rebase 冲突后忘记 `--continue`**：`git status` 会提示你 "rebase in progress"，执行 `git rebase --continue` 继续，或 `git rebase --abort` 放弃
- **`--squash` 合并后丢失提交信息**：`merge --squash` 只把代码变更合过来，不保留任何提交记录，只有在你确定不需要这段历史时才用
- **混淆 `merge --squash` 和 `rebase -i squash`**：前者是 merge 时压缩，后者是 rebase 时合并
- **认为 rebase 比 merge 更好/更差**：两者是工具，没有优劣，只有场景区别。团队规范比个人偏好重要

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "merge 和 rebase 有什么区别" | 追问 merge 保留分支历史——rebase 把提交搬到目标分支顶端 |
| "什么时候用 rebase" | 追问个人分支整理提交历史、同步主分支更新——公共分支不要 rebase |
| "rebase 后 push 为什么要 --force" | 追问 rebase 重写了提交哈希——远程不知道你是同一条线 |

## 相关阅读

- [冲突处理](./conflict-resolution.md)
- [Git Flow](./git-flow.md)
- [cherry-pick](./cherry-pick.md)
- [Git 官方文档：git-merge](https://git-scm.com/docs/git-merge)
- [Git 官方文档：git-rebase](https://git-scm.com/docs/git-rebase)
- [Atlassian：Merging vs. Rebasing](https://www.atlassian.com/git/tutorials/merging-vs-rebasing)

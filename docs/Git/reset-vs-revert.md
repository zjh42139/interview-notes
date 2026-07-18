---
title: reset vs revert
description: git reset 和 git revert 是 Git 撤销操作的两种核心方式，理解它们的原理差异和适用场景是代码回滚的关键能力
category: Git
type: api-reference
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-18
tags:
  - git
  - reset
  - revert
  - 回滚
  - 撤销
---

# reset vs revert

> ⭐⭐⭐⭐｜难度：中级

## 一句话总结

> `git reset` 是"回到过去"——移动 HEAD 指针到指定的历史 commit，可以改写提交历史。`git revert` 是"否定某个 commit"——新建一个反向 commit 来撤销指定 commit 的更改，不改写历史。面试核心：**reset 改历史（危险，适合本地），revert 不改历史（安全，适合公共分支）。**

面试时这样开口："reset 和 revert 都能撤销代码，但本质完全不同。reset 是移动 HEAD 指针，让分支回到某个历史状态——可以理解成'删除'了后面的 commit；revert 是创建一个新的反向 commit 来抵消目标 commit 的改动——原来的 commit 还在，只是效果被反转了。已推送的公共分支永远用 revert，本地未推送的分支用 reset。"

## 核心机制

### git reset 的三种模式

reset 的本质是移动 HEAD 和当前分支指针到指定的 commit。根据作用范围不同，有三种模式：

```bash
git reset --soft  HEAD~1   # 只移动 HEAD，不移暂存区和工作区
git reset --mixed HEAD~1   # 移动 HEAD + 重置暂存区（默认）
git reset --hard  HEAD~1   # 移动 HEAD + 重置暂存区 + 重置工作区
```

**示意图**：假设当前状态是 commit A -> B -> C（HEAD 在 C），执行 `git reset HEAD~1`：

| 模式 | HEAD 指向 | 暂存区（Stage） | 工作区（Working Dir） | 修改去哪了 |
|------|----------|----------------|---------------------|-----------|
| `--soft` | B | 保持 C 的快照 | 保持 C 的内容 | 修改还在暂存区，可以直接 commit |
| `--mixed`（默认） | B | 清空（匹配 B） | 保持 C 的内容 | 修改回到"未暂存"状态（红色） |
| `--hard` | B | 清空（匹配 B） | 重置为 B 的内容 | **修改全部丢失！** |

**--soft 的典型场景**：你已经 commit 了，但发现 commit message 写错了，或者想多攒几个小 commit 再一起提交：

```bash
git reset --soft HEAD~1    # 撤销最近一次 commit，改动回到暂存区
# 修改 commit message 后重新提交
git commit -m "feat: 正确的提交信息"
```

**--mixed 的典型场景**：commit 之后发现少改了一个文件，或者想重新组织暂存内容：

```bash
git reset HEAD~1           # 撤销 commit，改动回到工作区（未暂存）
git add src/foo.ts          # 重新挑选要提交的文件
git commit -m "feat: 重新组织的提交"
```

**--hard 的危险性与 reflog 恢复**：

```bash
git reset --hard HEAD~3     # 危险！最近 3 个 commit 的改动全部丢失
# 但还没真的"丢失"——Git 的 reflog 能找回：
git reflog                   # 找到之前 HEAD 的 hash（例如 abc1234）
git reset --hard abc1234     # 恢复到 reset 之前的状态
```

> `git reflog` 记录了 HEAD 的所有移动历史（可达的记录默认保留 90 天；**不可达的记录——比如被 reset 丢弃的 commit——默认只保留 30 天**），是 reset --hard 的后悔药。但要注意：只有曾经 commit 过的内容才能通过 reflog 找回，从未 commit 的工作区修改无法恢复。

**补充（Git 2.23+）**：只想撤销**单个文件**时，现代命令是 `git restore`——`git restore <file>` 丢弃工作区改动，`git restore --staged <file>` 取消暂存。它们分别替代旧写法 `git checkout -- <file>` 和 `git reset HEAD <file>`，语义更清晰。

### git revert 的原理

revert 不做"回到过去"这件事，而是**创建一个新的反向 commit**：

```bash
# 假设历史是 A -> B -> C -> D（HEAD 在 D）
# 发现 B 引入了一个 bug，需要撤销 B 的改动

git revert B
# 结果：A -> B -> C -> D -> E（HEAD 在 E）
# 其中 E 是对 B 的"反向操作"——B 加了什么，E 就删什么；B 删了什么，E 就加回来
```

revert 的三大特点：

1. **不改历史**：B 这个 commit 依然在历史中，只是它的效果被 E 抵消了
2. **可能冲突**：如果 C 或 D 修改了 B 改过的同一行代码，revert 时会冲突，需要手动解决
3. **可以 revert 任意位置的 commit**：不一定是 HEAD，可以是历史上的任意一个 commit

**revert 一个 merge commit**：

```bash
# 撤销一个 merge commit 时，需要指定 -m 参数来选择保留哪个 parent
git revert -m 1 <merge-commit-hash>
# -m 1 表示保留第一个 parent（通常是 main 分支），撤销被合入分支的所有改动
```

## 深度拓展

### 场景决策矩阵

| 场景 | 推荐 | 理由 |
|------|------|------|
| 本地 commit 了，还没 push | `reset` | 没推送就改历史，没人受影响 |
| 本地 commit + push 了，别人没基于你的分支工作 | `reset` + `force push` | 确认独享分支才能 force push |
| 已推送到公共分支（main/develop） | `revert` | 黄金规则：不改已推送的历史 |
| 需要撤销的不是最新 commit，而是中间的某个 | `revert` | reset 回退会把后面的 commit 一并丢弃，无法只撤销中间某一个 |
| 线上出 bug，需要紧急回滚 | `revert` | 最快、最安全，留下完整审计记录 |
| 想清理本地的 "wip"、"fix typo" 类垃圾 commit | `revert` 不适用 | 用 `git rebase -i` 的 squash/fixup |

### 追问：已经 push 了还能 reset 吗？

可以，但需要 `git push --force-with-lease`。这是一把双刃剑——没有别人基于你的分支工作时，force push 是安全的；但如果有人已经拉取了旧历史，他们的下一次 push 会覆盖你的 force push，造成混乱。

**正确流程**（仅限个人分支）：

```bash
git reset --hard HEAD~2         # 本地回退 2 个 commit
git push --force-with-lease origin feature/xxx
# --force-with-lease：如果远程有别人新 push 的 commit，拒绝推送（比 --force 安全）
```

### 追问：线上发现一个 bug，是一个已推送的 commit 引入的，怎么办？

这是面试中的经典场景题。标准答案：

> "用 `git revert`。第一步，`git log` 找到引入 bug 的那个 commit 的 hash。第二步，`git revert <commit-hash>`，Git 会生成一个反向 commit。如果有冲突，手动解决后 `git add . && git revert --continue`。第三步，`git push` 推送到远程。整个过程不改写历史，所有操作都有审计记录，是最安全的线上回滚方式。"

追问："如果这个 commit 后面有很多依赖它的提交，revert 会不会很麻烦？" —— 答：可能会产生大量冲突，这时可以考虑"反向修复"——不 revert，而是直接提交一个新的 commit 来修复 bug。但如果 bug 涉及数据问题或者需要紧急回滚上线，revert 依然是首选。

### 危险操作防护

1. **`git reset --hard` 前先 `git stash`**：把工作区未提交的修改暂存起来，防止丢失
2. **push 前用 `git log --oneline origin/main..HEAD`**：确认自己将要推送的 commit 列表
3. **团队统一使用 `--force-with-lease` 而非 `--force`**：多一层远程保护
4. **main/master 分支设置 protected branch**：GitHub/GitLab 上禁止直接 force push 到保护分支

## 项目实战

### 实战 1：紧急回滚生产环境

```bash
# 某次部署后发现首页白屏，确认是 commit abc1234 导致的
# 这个 commit 已经推送到 main 分支

# Step 1：找到问题 commit
git log --oneline -10

# Step 2：revert（注意：revert 会打开编辑器让你确认 commit message）
git revert abc1234
# 默认 message：Revert "feat: 首页改版"
# 可以改成：Revert "feat: 首页改版" —— 导致白屏，紧急回滚

# Step 3：推送到远程，触发 CI/CD 重新部署
git push origin main
```

### 实战 2：本地开发时撤销错误的 commit

```bash
# 场景：刚 commit 了 3 个文件，发现其中 1 个文件不应该在这次提交
# 如果还没 push，用 reset --mixed：

git reset --mixed HEAD~1     # 撤销 commit，所有改动回到工作区（未暂存状态）
git add src/components/UserList.vue src/utils/api.ts  # 只重新添加正确的文件
git commit -m "feat: 用户列表组件"                     # 重新提交

# 剩余的 src/types/user.d.ts 留在工作区，等下次再提交
```

### 实战 3：reset --hard 后的恢复

```bash
# 不小心执行了 git reset --hard HEAD~5
# 不要慌，查 reflog：

git reflog
# 输出示例：
# abc1234 HEAD@{0}: reset: moving to HEAD~5
# def5678 HEAD@{1}: commit: feat: 完成权限模块  ← 这就是被"丢弃"的最新 commit
# ...

git reset --hard def5678    # 回到 reset 之前的状态
# 所有 commit 都回来了
```

## 易错点

- **混淆 `reset` 和 `revert` 的适用场景**：记住"公共分支用 revert，私有分支用 reset"
- **`reset --hard` 后忘记 reflog**：reflog 是最后的救命稻草，但只能恢复 commit 过的内容，未 commit 的工作区改动无法恢复
- **revert 不指定 `-m` 参数就撤销 merge commit**：Git 不知道要保留哪个 parent，会报错 `error: commit xxx is a merge but no -m option was given`
- **以为 `reset` 只能往后退**：`git reset --hard <任意commit-hash>` 可以跳到任何 commit，甚至向前跳（只要那个 commit 在 reflog 中存在）
- **`--mixed` 和 `--soft` 分不清**：--soft 改动在暂存区（绿色，可以直接 commit），--mixed 改动在工作区（红色，需要重新 add）
- **revert 之后的 commit 是全新的 hash**：revert 只保证内容被抵消，不保证 hash 不变

## 面试信号

当面试官问"如何撤销一个 commit"，他真正想听的是你能否区分场景：

> "这取决于 commit 是否已经推送。如果还没 push，我会用 `git reset` —— 根据需求选择 soft/mixed/hard。如果已经 push 到了公共分支，必须用 `git revert`，因为这不会改写历史，其他协作者的仓库不会出问题。另外，如果只是想修改最近一次 commit 的 message 或者补充文件，用 `git commit --amend` 就够了。"

如果能主动提到 `reflog` 恢复和 `--force-with-lease` 的安全用法，说明你有真实的 Git 操作经验，这是强烈的加分信号。

## 相关阅读

- [merge vs rebase](./merge-vs-rebase.md)
- [cherry-pick](./cherry-pick.md)
- [冲突处理](./conflict-resolution.md)
- [Git 官方文档：git-reset](https://git-scm.com/docs/git-reset)
- [Git 官方文档：git-revert](https://git-scm.com/docs/git-revert)

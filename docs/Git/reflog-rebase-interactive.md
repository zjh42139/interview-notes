---
title: "reflog / rebase -i / 内部原理"
description: git reflog 恢复误删、rebase -i squash/fixup、Git 四种对象(blob/tree/commit/tag)
category: Git
type: mechanism
score: 80
difficulty: 中高级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-16
updated: 2026-07-18
tags:
  - reflog
  - rebase -i
  - Git 内部原理
---

# reflog / rebase -i / 内部原理

> ⭐⭐⭐⭐｜难度：中高级｜区分中级和高级的 Git 分水岭

## 一句话总结

**`git reflog` 是救命命令——记录 HEAD 的所有移动历史，30 天内的"丢失"commit 都能找回。`rebase -i` 压缩/重排/修改历史——让提交记录干净。Git 内部四种对象（blob/tree/commit/tag）构成 `.git` 目录——理解它们才理解 Git 的底层。**

## 核心机制

### git reflog —— 救命稻草

```bash
# 不小心 reset --hard 后找回
git reflog                    # 查看 HEAD 历史
# 找到 reset 前的 commit hash
git reset --hard HEAD@{3}     # 回到 3 步之前

# 误删分支找回
git branch -D feature-x       # 删了
git reflog                     # 找到分支 tip
git branch feature-x <hash>   # 恢复
```

**reflog 是纯本地的**——不会随 push 共享，clone 出来的新仓库里也没有。默认保留 90 天（可达的记录）和 30 天（不可达的记录，比如被 reset 丢弃的 commit）。

### rebase -i —— 交互式变基

```bash
git rebase -i HEAD~5   # 对最近 5 个 commit 做交互

# 编辑器打开后——可选操作：
# pick abc123  feat: add login     → 保留这个 commit
# squash def456 feat: fix login    → 合并到上一个 commit
# reword ghi789 feat: add dashboard → 保留但修改 message
# drop   jkl012 feat: debug         → 删除这个 commit
# edit   mno345 feat: add users     → 暂停让你修改这个 commit
```

**squash vs fixup**：squash 合并并保留 message；fixup 合并并丢弃 message——用上一个 commit 的 message。

### Git 四种对象

```bash
# blob：文件内容（不含文件名）——SHA-1 哈希存储
# tree：目录结构——记录文件名→blob 映射 + 子 tree
# commit：指向 tree + 父 commit + author/committer/message
# tag：附注标签的对象——指向 commit + 标签信息（轻量标签只是一个 ref，不产生 tag 对象）

git cat-file -p HEAD       # 查看 HEAD 指向的 commit 内容
git cat-file -p HEAD^{tree} # 查看 tree 内容
git cat-file -p <blob-hash> # 查看文件内容
```

**面试话术**："Git 的底层是一个内容寻址文件系统——文件名不重要，内容 hash 是 key。同样的内容只存一份，这是 Git 天然的去重机制。"

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "reset --hard 后怎么找回" | 追问 reflog |
| "10 个 commit 怎么合并" | 追问 rebase -i squash |
| "Git 内部怎么存储" | 追问四种对象 |

## 相关阅读

- [merge vs rebase](./merge-vs-rebase.md)
- [reset vs revert](./reset-vs-revert.md)

## 更新记录

- 2026-07-18：事实修正——reflog"push/fetch 不记录"改为"纯本地、不随 push/clone 共享"；tag 对象仅附注标签产生；去掉"去重=压缩"的不准确表述
- 2026-07-16：新建——reflog+rebase -i+内部对象

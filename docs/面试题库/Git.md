---
title: Git 高频面试题
description: Git 面试真题——日常协作流程、merge/rebase、冲突处理、版本回退、工作流
category: 面试题库
type: interview
score: 0
difficulty: 初级
status: filled
created: 2026-07-10
updated: 2026-07-18
reviewed: null
tags:
  - Git
  - merge
  - rebase
  - 冲突
  - 工作流
---

# Git 高频面试题

> 收录前端面试中的高频 Git 真题，共 11 道。
> Q1-Q8 按出现频率从高到低排列，Q9-Q11 为 2026-07 真题校验新增。

---

### Q1: merge 和 rebase 的区别
> ⭐⭐⭐⭐⭐ | 难度：中级 | 对比题

**题目**：`git merge` 和 `git rebase` 有什么区别？什么时候用哪个？

**维度对比**：

| 维度 | merge | rebase |
|------|-------|--------|
| 结果 | 生成一个 merge commit | 把分支的 commit 搬到目标分支顶端，历史线性 |
| 历史 | 保留真实的分支历史（非线性的提交图） | 改写历史——commit hash 会变 |
| 冲突 | 一次解决（在 merge commit 中） | 可能每个 commit 都要解决一次 |
| 适用 | 公共分支合并（main ← feature） | 个人分支整理（整理本地 commit 再推） |
| 黄金规则 | 对公共分支永远用 merge | **永远不要 rebase 已经 push 的 commit** |

**一句话本质区别**：merge 保留"发生了什么"（有分叉、有合并点），rebase 改写"看起来像按顺序发生的"（一条直线）。

**追问预测**：
- "rebase 后 push 需要加什么参数？" → `--force-with-lease`（比 `-f` 安全——会检查远程是否被他人更新）
- "什么时候用 squash merge？" → 合并前把所有 commit 压成一个，保留干净的 master 历史

> 📖 答案参考：[merge vs rebase](../Git/merge-vs-rebase.md)

---

### Q2: reset 和 revert 的区别
> ⭐⭐⭐⭐⭐ | 难度：中级 | 对比题

**题目**：`git reset` 和 `git revert` 有什么区别？`reset --hard`、`--soft`、`--mixed` 分别是什么？

**30 秒版**：reset 是回退到某个 commit（修改历史），revert 是创建一个新的 commit 来撤销某个 commit（不改历史）。reset 用于本地未 push 的回退，revert 用于已 push 的回退。

**2 分钟版**：reset 三模式——`--soft` 只移动 HEAD（保留暂存区和工作区）、`--mixed` 默认/移动 HEAD + 清暂存区（保留工作区）、`--hard` 全部清空（HEAD/暂存区/工作区全部回退——不可恢复）。revert 是安全的公共历史修改方式——会产生一个新的反向 commit。

**追问预测**：
- "reset --hard 后能恢复吗？" → `git reflog` 找到丢失的 commit hash，再 reset 回去
- "团队开发中误推了错误的 commit 怎么办？" → revert（安全不破坏历史）

> 📖 答案参考：[reset vs revert](../Git/reset-vs-revert.md)

---

### Q3: 冲突怎么解决
> ⭐⭐⭐⭐⭐ | 难度：中级 | 排查题

**题目**：合并冲突时你怎么处理？有哪些工具可以辅助？

**排查步骤**：
1. `git status` 查看冲突文件列表
2. 打开冲突文件 → 找到 `<<<<<<<` `=======` `>>>>>>>` 标记
3. 手动选择保留哪一边的代码（或两边都保留 + 手动合并）
4. 推荐工具：VS Code 内置冲突编辑器（Accept Current/Incoming/Both）、VS Code 三方合并编辑器（1.69+，冲突文件右下角 Resolve in Merge Editor 进入，Incoming/Current/Result 三栏对照）、GitKraken、Beyond Compare
5. 解决后 `git add` 标记已解决 + `git commit` 完成合并
6. 如果冲突复杂 → `git merge --abort` 取消合并，分步处理

**追问预测**：
- "怎么减少冲突？" → 小 commit 频繁合并、及时 pull/rebase、模块化减少同一文件改动
- "冲突标记以外还有哪些信号？" → `git diff --name-only --diff-filter=U` 只看冲突文件

> 📖 答案参考：[冲突处理](../Git/conflict-resolution.md)

---

### Q4: stash 的使用场景
> ⭐⭐⭐⭐ | 难度：初级 | 概念题

**题目**：`git stash` 是做什么的？有哪些常用操作？

**30 秒版**：临时保存当前工作区的修改，让工作区恢复干净。常用场景：正在写代码时需要切分支——但不想提交半成品。`git stash` 保存 → 切分支处理 → 切回来 → `git stash pop` 恢复。

**2 分钟版**：常用命令——`git stash`（保存工作区+暂存区）、`git stash pop`（恢复+删除栈顶）、`git stash list`（查看所有 stash）、`git stash apply stash@{1}`（恢复指定 stash 不删除）、`git stash drop`（删除）。stash 本质是按栈存储的临时 commit。

**追问预测**：
- "stash 和临时 commit 有什么区别？" → stash 不进入提交历史，更轻量。临时的 WIP commit 能 push 到远端（备份）
- "stash 能存 untracked 文件吗？" → `git stash -u` 或 `git stash --include-untracked`

> 📖 答案参考：[stash](../Git/stash.md)

---

### Q5: Git Flow 工作流
> ⭐⭐⭐ | 难度：中级 | 概念题

**题目**：你们团队用的是什么 Git 工作流？Git Flow、GitHub Flow、Trunk-Based 有什么区别？

**回答框架**：
1. **Git Flow**：main + develop + feature + release + hotfix 五个分支。适合有固定发布周期的项目（每月/每两周发版）
2. **GitHub Flow**：只有 main + feature 分支。feature 分支提 PR → review → squash merge。适合持续部署
3. **Trunk-Based**：所有人往 main（trunk）提交，通过 feature flag 控制未完成功能。适合 CI/CD 高度成熟的大团队
4. 前端小团队最常用 GitHub Flow——简单、PR review 质量、配合 CI 自动化

**追问预测**：
- "hotfix 和 feature 分支有什么区别？" → hotfix 从 main 拉、修完合回 main + develop；feature 从 develop 拉、合回 develop
- "你们团队的 commit 规范？" → Conventional Commits（`feat:` / `fix:` / `refactor:`）

> 📖 答案参考：[Git Flow](../Git/git-flow.md)

---

### Q6: cherry-pick 的使用场景
> ⭐⭐⭐ | 难度：中级 | 概念题

**题目**：`git cherry-pick` 是做什么的？什么场景下需要用到？

**30 秒版**：把某个（或某几个）特定的 commit 从另一个分支"摘"过来。场景：hotfix 修复了一个 bug，想把修复同时应用到 release 分支和 develop 分支——但不想要 release 分支上其他的 commit。

**2 分钟版**：`git cherry-pick <commit-hash>` 把指定 commit 的变更应用到当前分支。多个 commit 可以按顺序 cherry-pick。cherry-pick 会产生新的 commit hash（因为 parent 变了）。冲突时和 merge 一样手动解决。cherry-pick 是"点对点移植"——适合只移植特定修复而不合并整个分支的场景。

**追问预测**：
- "cherry-pick 和 merge 有什么区别？" → merge 合并整个分支的所有 commit，cherry-pick 挑一个或几个 commit
- "cherry-pick 后的 commit hash 为什么变了？" → commit hash 包含 parent 信息，parent 不同则 hash 不同

> 📖 答案参考：[cherry-pick](../Git/cherry-pick.md)

---

### Q7: Commit 规范与语义化提交
> ⭐⭐⭐ | 难度：初级 | 概念题

**题目**：你们团队的 commit message 规范是什么？Conventional Commits 的格式是什么样的？

**回答框架**：
1. **格式**：`<type>(<scope>): <subject>`。type：feat/fix/docs/style/refactor/test/chore。scope 可选
2. **示例**：`feat(permission): add v-permission directive for button-level access control`
3. **为什么规范**：1) 生成 changelog 自动化；2) 语义化版本自动升级（feat→minor、fix→patch、BREAKING CHANGE→major）；3) 历史可读性
4. **工具**：`commitlint` + `husky` 做 pre-commit 校验；`commitizen` 交互式生成符合规范的 commit

**追问预测**：
- "BREAKING CHANGE 怎么标记？" → footer 写 `BREAKING CHANGE: description` 或 type 后加 `!`
- "angular commit 规范和 conventional commits 有什么区别？" → Conventional Commits 是 Angular 规范的精简标准化版

> 📖 答案参考：[Commit 规范](../Git/commit-spec.md)

---

### Q8: 误操作恢复指南
> ⭐⭐⭐ | 难度：中级 | 排查题

**题目**：不小心 `git reset --hard` 了，能恢复吗？误删了分支怎么办？

**排查步骤**：
1. **reset --hard 恢复**：`git reflog` → 找到操作前的 commit hash → `git reset --hard <hash>`（ref-log 默认保留 90 天）
2. **误删分支**：`git reflog` 找该分支最后一次 commit → `git checkout -b <branch-name> <hash>`
3. **commit message 写错**：`git commit --amend -m "new message"`（只改最近一次）
4. **文件误删**：`git checkout -- <file>` 或 `git restore <file>`

**追问预测**：
- "reflog 的记录什么时候会被清除？" → 默认 90 天。`git gc` 也会清理不可达对象
- "amend 后的旧 commit 去哪了？" → 变成 orphan commit，reflog 里还能找到一段时间

> 📖 答案参考：[reset vs revert](../Git/reset-vs-revert.md)

---

### Q9: Git 常用命令与日常协作流程
> ⭐⭐⭐⭐⭐ | 难度：初级 | 开放题

**题目**：说说你工作中是怎么用 Git 的？从接到需求到代码合入主干，完整走一遍你的日常流程。

**考察点**：
- 有没有真实的多人协作经验（而不是背命令清单）
- 分支意识：是否习惯在独立 feature 分支上开发
- 同步姿势：push 前如何与主干同步（pull --rebase）、冲突当场怎么处理
- 流程闭环：PR/MR → code review → 合并 → 删分支的完整链路

**30 秒答**：我拿到需求先 `git pull` 更新 main，从 main 上 `git checkout -b feature/xxx` 切功能分支。开发过程中小步提交，commit message 按团队规范写。推之前先 `git pull --rebase origin main` 同步主干，有冲突当场解决。然后 `git push` 推分支、提 PR/MR，同事 review 通过后合入 main，CI 自动构建部署，最后删掉功能分支。我的原则是：main 永远可部署，所有变更走 PR 进主干。

**追问预测**：
- "你们用的是 Git Flow 还是 GitHub Flow？" → 一句话对比：Git Flow 五分支重流程、适合固定发版周期；GitHub Flow 只有 main + feature、适合持续部署——前端小团队多用后者（详见 Q5）
- "为什么用 pull --rebase 不直接 pull？" → 避免产生 "Merge branch 'main' into feature" 噪音 commit，分支历史保持一条直线（详见 Q11）
- "PR 合并时选 merge 还是 squash？" → 团队常用 squash merge——main 上一个功能一个 commit，回滚和 review 都干净

> 📖 答案参考：[Git Flow](../Git/git-flow.md)、[merge vs rebase](../Git/merge-vs-rebase.md)

---

### Q10: 多个 commit 合并成一个
> ⭐⭐⭐⭐ | 难度：中级 | 操作场景题

**题目**：本地开发提了一堆零碎 commit（"wip"、"fix typo"），合入主干前想把它们压成一个，有哪几种做法？各自适合什么场景？（字节 2026-04 真题）

**考察点**：
- `rebase -i` 交互式操作的熟练度（squash vs fixup）
- 是否知道 `merge --squash`、`reset --soft` 两条备选路径
- 场景判断：整理本地历史和合并分支用的工具不一样
- 改写历史的安全边界（已 push 的 commit 怎么办）

**30 秒答**：最常用 `git rebase -i HEAD~n`，第一个 commit 留 pick，后面的改成 squash（合并且保留 message）或 fixup（合并且丢弃 message）。第二种是合分支时用 `git merge --squash feature`，把整个分支的改动压成一个 commit 落到当前分支。第三种偷懒做法：`git reset --soft HEAD~n` 回退 HEAD 但改动全留在暂存区，直接重新 `git commit` 一个。我的习惯：整理自己分支内部历史用 rebase -i，合并临时分支用 merge --squash。如果被压缩的 commit 已经 push 过，推送要加 `--force-with-lease`，而且只对个人分支做。

**追问预测**：
- "squash 和 fixup 有什么区别？" → squash 合并并保留 message 让你编辑；fixup 合并并直接丢弃 message
- "merge --squash 和 rebase -i 里的 squash 有什么区别？" → 前者是合分支时把整条分支压成一个 commit（不保留原分支历史）；后者是整理当前分支自己的提交历史
- "已经 push 的 commit 还能压缩吗？" → 能，但要 `git push --force-with-lease`，且只能对没有别人协作的个人分支做（黄金规则）

> 📖 答案参考：[reflog / rebase -i / 内部原理](../Git/reflog-rebase-interactive.md)、[merge vs rebase](../Git/merge-vs-rebase.md)

---

### Q11: fetch 和 pull 的区别
> ⭐⭐⭐⭐ | 难度：初级 | 对比题

**题目**：`git fetch` 和 `git pull` 有什么区别？团队协作中为什么推荐 `git pull --rebase`？

**考察点**：
- 核心等式：pull = fetch + merge（pull --rebase = fetch + rebase）
- fetch 只更新远程跟踪分支（origin/main）、不动工作区——"先看再合"的安全性
- pull --rebase 带来线性历史的价值
- FETCH_HEAD、远程跟踪分支等概念是否清楚

**30 秒答**：fetch 只把远程最新的 commit 下载到本地的远程跟踪分支（比如 origin/main），不碰我的工作区和当前分支；pull 等于 fetch + merge，下载后直接把远程改动合进当前分支。所以 fetch 更安全——我可以先 `git log HEAD..origin/main` 看看远程改了什么再决定怎么合。团队协作我习惯 `git pull --rebase`，它等于 fetch + rebase，把我本地未推送的 commit 重放到远程最新提交之后，不会像普通 pull 那样产生 "Merge branch" 噪音 commit，多人同一分支协作历史也是一条直线。可以 `git config pull.rebase true` 设为默认。

**追问预测**：
- "pull --rebase 遇到冲突怎么办？" → 逐个 commit 解决，`git add` 后 `git rebase --continue`；想放弃就 `git rebase --abort` 回到 pull 前状态
- "FETCH_HEAD 是什么？" → fetch 完成后 Git 把取回的分支头记录在 `.git/FETCH_HEAD`，`git merge FETCH_HEAD` 等价于 pull 的第二步
- "fetch 之后怎么看远程有哪些新提交？" → `git log HEAD..origin/main --oneline` 或 `git diff HEAD origin/main`

> 📖 答案参考：[fetch vs pull](../Git/fetch-vs-pull.md)
> 延伸：[merge vs rebase](../Git/merge-vs-rebase.md)（pull --rebase 依赖的 rebase 机制）

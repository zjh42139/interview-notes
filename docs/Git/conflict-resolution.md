---
title: 冲突处理
description: Git 冲突是多人协作中的日常问题，掌握冲突的产生原因、标记解读、解决流程和预防策略是团队开发的必备技能
category: Git
type: api-reference
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
tags:
  - Git
  - 冲突
  - 协作
  - merge
---

# 冲突处理

> ⭐⭐⭐⭐⭐｜难度：中级

## 一句话总结

> Git 冲突的本质是**两个分支修改了同一个文件的同一行（或相邻行），Git 无法自动判断以哪个版本为准**。冲突不是 bug，是 Git 保护你代码的机制——它宁可停下来让你手动决策，也不替你瞎合并。

面试时这样开口："冲突通常发生在 merge、rebase、cherry-pick 时。处理流程是：`git status` 找到冲突文件 -> 手动编辑解决 -> `git add` 标记已解决 -> `git commit` 或 `git merge --continue`。我们的项目有明确的冲突处理规范：谁改的谁解决、尽量小粒度提交、每天同步主干代码。"

## 核心机制

### 冲突是怎么产生的

冲突的根本原因是 Git 的合并算法**无法自动裁决**。Git 做三方合并时，会比较三个版本：

1. **共同祖先（base）**：两个分支分裂时的最后一个相同提交
2. **当前分支（ours）**：你所在分支的最新提交
3. **被合并分支（theirs）**：你正在合入的那个分支的最新提交

如果 ours 和 theirs 都对同一处代码做了不同修改，Git 不知道该采用哪个，就会标记为冲突。

```
# 场景：两个开发者改了同一个文件的同一行
# main 分支 (ours)：  const API_URL = 'https://api.example.com/v2'
# feature 分支 (theirs)：const API_URL = 'https://api.example.com/v3'
# base（共同祖先）：     const API_URL = 'https://api.example.com/v1'
# Git 不知道到底是 v2 还是 v3，产生冲突
```

### 冲突标记解读

冲突文件中的标记格式：

```
<<<<<<< HEAD          -- 当前分支（ours）的代码
const API_URL = 'https://api.example.com/v2';
const TIMEOUT = 5000;
=======               -- 分割线
const API_URL = 'https://api.example.com/v3';
const TIMEOUT = 10000;
>>>>>>> feature/api-update  -- 被合并分支（theirs）的代码
```

从上到下三部分：
- `<<<<<<< HEAD` 到 `=======`：你当前分支的版本
- `=======` 到 `>>>>>>> feature/xxx`：要合并进来的分支的版本
- 你需要的最终代码可能是选其中一个、或两者的组合

### 标准解决流程

```bash
# 1. 触发冲突（merge 或 rebase）
git merge feature/user-list
# Auto-merging src/views/user/index.vue
# CONFLICT (content): Merge conflict in src/views/user/index.vue
# Automatic merge failed; fix conflicts and then commit the result.

# 2. 查看冲突文件列表
git status
# Unmerged paths:
#   both modified:   src/views/user/index.vue
#   both modified:   src/api/user.js

# 3. 手动编辑冲突文件，删除冲突标记，保留最终代码

# 4. 标记冲突已解决
git add src/views/user/index.vue src/api/user.js

# 5. 完成合并
git merge --continue  # merge 场景
# 或
git rebase --continue # rebase 场景
# 或
git commit            # 也可以用普通 commit（merge 会默认生成 merge message）

# 6. 如果搞砸了，放弃
git merge --abort     # 回到 merge 前的状态
# 或
git rebase --abort    # 回到 rebase 前的状态
```

### VS Code / WebStorm 可视化解决

VS Code 内置了三路合并编辑器，比手改标记高效得多：

- 左侧窗口：当前分支（ours）
- 右侧窗口：被合并分支（theirs）
- 底部窗口：合并结果
- 点击 `Accept Current` / `Accept Incoming` / `Accept Both` 按钮选择版本
- 也可以直接在合并结果区域手动编辑

WebStorm 类似，右键冲突文件 -> Git -> Resolve Conflicts，弹出可视化合并窗口，逐冲突点选择。

**建议**：日常简单冲突直接手改标记就好，复杂冲突（比如整个函数逻辑被两个人重写）用 IDE 可视化工具更安全。

## 深度拓展

### 追问：merge 冲突 vs rebase 冲突，处理上有什么区别？

**核心区别：rebase 的冲突需要多次处理。**

merge 产生冲突时，只解决一次——所有差异集中在一个合并节点。

rebase 产生冲突时，每个被重放的 commit 都可能触发冲突。如果有 5 个 commit 都和 main 有冲突，你需要解决 5 次，每次 `git rebase --continue`。这既是代价（繁琐），也是好处（每次冲突范围小，容易定位问题）。

```bash
# rebase 过程中解决完一次冲突后
git add .
git rebase --continue
# 可能立刻又出现冲突，重复上面的过程
# 直到所有 commit 重放完毕
```

另一个细节：rebase 中 **ours 和 theirs 的含义是反的**。merge 时 HEAD 是当前分支，theirs 是被合入分支。rebase 时因为你在"借用"目标分支的提交来重放，ours/theirs 的指向会让人困惑。建议用 VS Code 的 "Accept Incoming" 等术语，不要用 ours/theirs。

### 追问：怎么判断哪些文件有冲突？

```bash
# 查看冲突文件（未合并状态）
git status

# 只看冲突文件名
git diff --name-only --diff-filter=U

# 查看某一处冲突的三个版本
git diff :1:file.js  # base（共同祖先）
git diff :2:file.js  # ours（当前分支）
git diff :3:file.js  # theirs（被合并分支）

# 查看所有冲突位置
git diff --check
```

## 项目实战

### 后台管理系统中的高频冲突场景

在一个 Vue3 + Element Plus 后台项目中，冲突最容易出现在这些地方：

**场景一：路由配置文件 `src/router/index.js`**

多人同时添加新页面路由，都往 `routes` 数组末尾追加：

```javascript
// 开发者 A 的分支
{ path: '/user/list', component: UserList },
// 开发者 B 的分支
{ path: '/order/list', component: OrderList },
```

合并时出现相邻行冲突。**预防策略**：把路由按模块拆分到不同文件（`user-routes.js`、`order-routes.js`），各人改各人的文件。

**场景二：公共组件 `src/components/`**

两个人都改了同一个公共组件——这是最难处理的冲突。**预防策略**：改公共组件前在群里通知，或者用 story 拆分到不同分支时间段。

**场景三：API 层 `src/api/`**

同时新增接口方法，只要不是同一行通常不会冲突。但如果两个人改了同一个接口的参数结构，需要沟通确认。

### 团队冲突处理规范

```markdown
1. 冲突由产生冲突的开发者解决，不是由合并者单独解决
   - 你改了 A 文件的逻辑，别人也改了 A 文件，merge 时你俩一起看
2. 不确定冲突如何解决时，找代码原作者沟通，不要自己猜测
3. 解决冲突后，运行相关模块的测试，确保功能正常
4. 如果是 UI 组件冲突，解决后在本地启动项目肉眼检查效果
5. 复杂冲突（整个函数被重写），用 git diff 核对原始差异后重新手写合并版
```

## 易错点

- **不检查冲突就直接 add 然后 commit**：结果就是提交了带 `<<<<<<<` 标记的代码到仓库，项目直接编译报错。遇到冲突后必须确保所有冲突标记都删除了
- **解决冲突后又改了别的东西**：冲突解决 commit 应该只包含冲突解决，不要顺便重构或修 bug。把不相关的改动混在一起，将来出了问题是该回滚还是不该回滚？
- **`merge --abort` 之前没有 stash 自己的改动**：abort 只撤销合并操作，不会丢失你在合并前未提交的修改（那些本来就不在 merge 范围内）。但为了安全，merge 前先 stash 或 commit
- **多人同时解决同一冲突**：如果 merge commit 推上去后，另一个人也 merge 并遇到冲突，信息要及时同步，避免重复劳动
- **冲突标记删了但代码逻辑不对**：比如只保留了自己的代码，删掉了别人修复的 bug。解决原则：**理解双方意图再做决定**

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "冲突怎么解决" | 追问 Git 标记冲突区域（<<<===>>>）→ 手动编辑 → add → commit |
| "怎么避免冲突" | 追问频繁 pull、小粒度提交、模块拆分减少多人改同一文件 |
| "rebase 冲突和 merge 冲突的区别" | 追问 rebase 要逐 commit 解决冲突——比 merge 更细粒度 |

## 相关阅读

- [merge vs rebase](./merge-vs-rebase.md)
- [cherry-pick](./cherry-pick.md)
- [stash](./stash.md)
- [Git 官方文档：Basic Merge Conflicts](https://git-scm.com/docs/git-merge#_how_conflicts_are_presented)
- [VS Code：Resolve merge conflicts](https://code.visualstudio.com/docs/editor/versioncontrol#_merge-conflicts)

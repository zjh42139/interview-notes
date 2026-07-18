---
title: bisect
description: git bisect 使用二分查找算法在提交历史中定位引入 bug 的那个 commit，是最被低估但面试会加分的 Git 调试技能
category: Git
type: api-reference
score: 0
difficulty: 初级
frequency: ⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-18
tags:
  - Git
  - bisect
  - 调试
  - 二分查找
---

# bisect

> ⭐⭐⭐｜难度：初级

## 一句话总结

> `git bisect` 是 Git 内置的二分查找调试工具。当你知道某个版本是好的、某个版本是有 bug 的，但不清楚中间哪个 commit 引入了 bug 时，bisect 会**自动将范围一分为二**，让你标记中间点是 "good" 还是 "bad"，重复这个操作直到精确定位到引入 bug 的那个提交。

面试时这样开口："bisect 特别适合在 commit 历史很长的情况下追查 bug。手动流程是你标记一个 good 和 bad 的 commit，Git 自动跳到中间点让你测试，你标记 good 或 bad，Git 继续二分，一般 10 步之内就能在上千个 commit 中找到问题。更强大的是 `git bisect run`，可以直接接一个测试脚本自动化整个二分过程。"

## 核心机制

### 二分查找原理

假设 commit 历史中有 1024 个提交（2^10），从 good 到 bad 之间的线路上：

```
good --- ? --- ? --- ? --- ... --- ? --- bad
  1      2     3     4           1023   1024
```

传统方法：从 bad 往前一个一个检查，最多查 1023 次。
二分查找：每次排除一半，最多查 log2(1024) = 10 次。

bisect 的每一步：
1. Git 把当前范围从中间切一刀，HEAD 移到中间那个 commit
2. 你测试这个版本有没有 bug
3. 如果没 bug -> `git bisect good`（bug 在后半段）
4. 如果有 bug -> `git bisect bad`（bug 在前半段）
5. Git 继续二分，直到范围缩小到一个 commit

### 手动二分流程

```bash
# 1. 开始 bisect
git bisect start

# 2. 标记当前版本有 bug（通常是 HEAD）
git bisect bad HEAD
# 或直接 git bisect bad（默认 HEAD）

# 3. 标记一个确认没有 bug 的版本
git bisect good v2.0.0
# 或 git bisect good <commit-hash>

# Git 自动检出中间 commit：
# Bisecting: 256 revisions left to test after this (roughly 8 steps)

# 4. 在这个 commit 上测试功能是否有 bug
# 有 bug -> git bisect bad
# 没 bug -> git bisect good

# 5. 重复第 4 步，直到：
# abc123 is the first bad commit
# commit abc123
# Author: zhangsan <zhangsan@example.com>
# Date:   Mon Jun 15 10:30:00 2026 +0800
#
#     refactor(permission): extract route guard logic

# 6. 结束 bisect，回到正常状态
git bisect reset
```

### 自动化二分：`git bisect run`

最强大的用法——不需要手动标记，写个测试脚本，Git 自动跑完整个二分过程：

```bash
git bisect start HEAD v2.0.0
git bisect run npm test -- --testPathPattern="login"
# 或
git bisect run node check-bug.js
```

自动化规则：脚本的退出码决定标记：
- 退出码 0 = good（没 bug）
- 退出码 1~127（不含 125）= bad（有 bug）
- 退出码 125 = skip（这个版本无法测试，跳过）

```bash
# 实际项目中的例子：某次重构后登录功能坏了
git bisect start HEAD v2.0.0

# 用一个简单的 curl 检查登录接口是否正常
git bisect run sh -c '
  npm run dev &
  DEV_PID=$!
  sleep 5
  curl -s http://localhost:3000/api/login \
    -X POST \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"test\",\"password\":\"123456\"}" \
    | grep -q "token"
  RESULT=$?
  kill $DEV_PID 2>/dev/null
  exit $RESULT
'
```

这个脚本：
1. 启动开发服务器
2. 等 5 秒确保服务就绪
3. 发送登录请求
4. 检查响应中是否包含 "token"
5. 关掉开发服务器
6. 返回结果给 bisect

## 深度拓展

### 追问：什么时候用 bisect？什么时候用 `git log -p` 手动查？

| 场景 | 方法 | 理由 |
|------|------|------|
| bug 容易复现，历史超过 50 个 commit | `git bisect` | 手动查太慢，二分效率碾压 |
| bug 难以自动判断（如 UI 样式异常） | `git bisect`（手动标记） | 每一步手动打开浏览器检查视觉 |
| 有对应的自动化测试 | `git bisect run <test>` | 全自动，放那跑就行，几分钟出结果 |
| 只有最近 2~3 个 commit | `git log -p` 直接看 diff | bisect 反而多此一举 |
| bug 非常明显，看 commit message 就能猜到 | `git log --oneline` | 一眼能看出 `refactor(login)` 那个提交是嫌疑人 |

### 追问：bisect 过程中如果某一步无法编译/无法测试怎么办？

```bash
# 这个 commit 本身有问题，无法在这个版本上判断 bug 是否存在
git bisect skip
# Git 会换一个相邻的 commit 继续二分，不影响最终定位
```

常见原因：
- 某个中间 commit 本身编译就报错（比如 CI 没跑过被 force push 到主线了）
- 某步依赖的数据库表结构变了，测试跑不起来

## 项目实战

### 后台管理系统 bug 追查实战

场景：Vue3 后台管理系统的用户列表页面，在某个版本后发现**搜索功能失效**，但没人记得是什么时候引入的。

```bash
# 1. 确认范围
# v2.0.0（一个月前）搜索功能正常
# HEAD（当前）搜索功能坏了 → 中间可能有 200+ 个 commit

# 2. 启动 bisect
git bisect start HEAD v2.0.0
# Bisecting: 128 revisions left to test after this (roughly 7 steps)

# 3. 在当前中间版本手动测试
# npm run dev → 打开浏览器 → 进入用户列表 → 点击搜索 → 没结果！
git bisect bad

# 4. Git 自动跳到下一个中间点
# npm run dev → 再次测试 → 搜索正常！
git bisect good

# 5. 重复 4 次后...
# d34db33 is the first bad commit
# commit d34db33
# Author: lisi <lisi@example.com>
# Date:   Wed Jun 17 2026
#
#     refactor(api): unify request params format
#
#     把 user search 的请求参数从 params 改为 data

# 6. 看 diff，发现搜索参数从 GET query string 被改成了 POST body，
#    但后端搜索接口仍然只读 query string，导致搜索失效
git show d34db33

# 7. 结束 bisect
git bisect reset
```

关键收获：不需要 review 200 个 commit，只用了 7 步就定位到问题。

## 易错点

- **忘记 `git bisect reset`**：bisect 结束后仍处于 bisect 模式，HEAD 可能指在某个中间 commit 上。继续提交会导致混乱。测试完记得 reset
- **good 和 bad 搞反**：如果第一次标记反了（把坏的标成 good，好的标成 bad），bisect 会往反方向二分。没关系，重新开始即可
- **范围太大导致某步测试时间过长**：如果 good 和 bad 之间隔了半年 1000+ commit，每一步都要 `npm i && npm run build`，可以考虑先把大范围拆成几个阶段
- **bisect skip 跳过太多相邻 commit**：如果一连 10 个 commit 都无法测试，bisect 无法继续。这种情况应该先修好构建问题
- **以为 bisect 只能找 bug**：除了找 bug 回归，也可以找**性能回归**——把测试脚本改成性能基准测试，退出码按性能是否达标返回

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "bisect 怎么用来定位 bug" | 追问二分查找的思想——标记 good/bad 后自动二分到引入 bug 的 commit |
| "bisect 和 git blame 有什么区别" | 追问 bisect 是"哪次提交引入的"，blame 是"谁写的这行" |

## 相关阅读

- [Git 官方文档：git-bisect](https://git-scm.com/docs/git-bisect)
- [Git 官方文档：git bisect run 详解](https://git-scm.com/docs/git-bisect#_bisect_run)
- [Pro Git：二分查找](https://git-scm.com/book/zh/v2/Git-%E5%B7%A5%E5%85%B7-%E4%BD%BF%E7%94%A8-Git-%E8%B0%83%E8%AF%95#_binary_search)

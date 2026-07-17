---
title: 线上问题定位
description: 从错误发现到修复的完整排查链路
category: 日志监控
type: api-reference
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
reviewed: null
tags:
  - 线上排查
  - 问题定位
  - 灰度回滚
  - Source Map
---

# 线上问题定位

## ✅ 核心机制

### 场景：线上出 bug，怎么定位？

这是面试最高频的场景题之一。完整排查链路分四步，每步有明确的工具和产出。

### 第一步：Sentry 查看错误堆栈 + Breadcrumbs

打开 Sentry 对应项目，找到报错事件，关注三点：

1. **错误堆栈（Stack Trace）**：找到报错的文件、行号、函数名。前提是 Source Map 已上传，否则只能看到 `chunk-abc123.js:1:23456`，无法定位。
2. **Breadcrumbs（面包屑）**：用户报错前的操作序列——点击了什么、导航到哪个页面、发出了什么请求。这是复现问题的关键线索。
3. **错误聚合信息**：Sentry 会聚合相同错误，查看影响面——多少用户、多少次、从哪个版本开始。

```text
// Sentry 中看到的典型信息
Error: Cannot read properties of undefined (reading 'price')
  at OrderDetail.renderPrice (order-detail.js:142:23)  ← Source Map 还原后

Breadcrumbs:
  10:23:01  navigation  → /order/detail?id=12345
  10:23:05  click       → [button] "立即支付"
  10:23:07  xhr         → POST /api/order/pay 500
  10:23:08  error       → TypeError: Cannot read properties of undefined
```

### 第二步：查看用户操作路径

通过 Sentry 的 Session Replay 可以直接回放报错时的页面操作录屏。没有 Replay 时结合 Breadcrumbs 中的 URL 参数、表单数据、接口请求记录来构建复现路径。

### 第三步：日志系统查看接口报错

**目标**：确认是前端解析错误还是后端逻辑错误。

使用 SLS（阿里云日志服务）或 ELK 搜索相关日志，关注三点：

- **请求参数**：前端传的数据是否正确
- **响应体**：后端返回的数据结构是否与前端预期一致（字段缺失、类型变更）
- **后端日志**：后端是否也报了错，错误级别是什么

很多时候前端报错 `Cannot read properties of undefined`，**根因是后端接口返回的数据结构变了**（字段改名、字段下沉到子对象等）。

### 第四步：设备 / 浏览器 / 系统版本

**目标**：确认是否为兼容性问题。

Sentry Event 详情页显示用户环境：浏览器及版本、操作系统、设备型号、屏幕分辨率。如果报错集中在特定浏览器或特定版本，大概率是兼容性问题。例如：旧版 iOS Safari（< 16.4）不支持 `lookbehind` 正则、旧版 Chrome（< 92）不支持 `Array.prototype.at()`。

## ⭐ 深度拓展

### 5. Source Map 的价值与风险

**价值**：将压缩混淆后的代码映射回源文件 + 行号 + 列号。没有 Source Map，调试如同大海捞针。

**风险**：`.map` 文件包含完整源码，公开等于源码泄露。**必须**在 Nginx 限制访问：

```nginx
location ~* \.map$ { deny all; }
```

或在构建后直接删除（确保 Sentry 已上传完毕）：

```bash
"build": "vite build && sentry-cli sourcemaps inject ./dist && sentry-cli sourcemaps upload ./dist && rm -rf ./dist/**/*.map"
```

### 6. 灰度发布 + 快速回滚

如果 bug 是新版本引入的，最快的修复方式不是改代码，而是**回滚到上一个稳定版本**。

灰度策略：金丝雀发布（5% 流量）→ 分段放量（5%→25%→50%→100%，每阶段观察 10 分钟）→ 错误率超过阈值（如增加 2%）自动回滚。

结合 Sentry 的 Release 功能，可精确对比新旧版本的错误率差异。

## ⭕ 项目实战

### 排查实战：一个生产环境报错的完整故事

**现象**：订单详情页 `Cannot read properties of undefined (reading 'amount')` 错误数突然飙升。

| 步骤 | 操作 | 发现 |
|------|------|------|
| 1 | Sentry 看堆栈 | `order-detail.js:156`，`orderInfo.price.amount` |
| 2 | Sentry 看 Release | 10 分钟前刚发布 v2.3.1 |
| 3 | 看 Breadcrumbs | 用户进入页面后立刻报错，无其他操作 |
| 4 | SLS 搜接口日志 | 后端返回的 `price` 缺少 `amount`，只有 `currency` 和 `value` |
| 5 | 问后端 | 后端 v2.3.1 将 `amount` 改名为 `value`，未通知前端 |
| 6 | 回滚 | 回滚到 v2.3.0，错误消失 |

**复盘**：前端缺少接口字段的类型校验（可选链 `?.` 仅掩盖，需 TS 严格类型 / Joi / Zod）；后端字段变更未同步通知；灰度放量时未观察 Sentry 错误率就全量放开。

### 易错点

| 易错点 | 正确做法 |
|--------|----------|
| 看到报错就改代码 | 先看 Release，确认是新版引入还是历史遗留 |
| Source Map 未上传 | CI 流程强制检查上传是否成功 |
| `.map` 文件公开 | Nginx 限制访问 + 构建后自动删除 |
| 用 `try-catch` 吞错误 | 业务代码不随意 catch 后不处理，否则 Sentry 无法捕获 |
| 只依赖 Sentry | 需配合日志系统（ELK/SLS）和 APM 三者使用 |

### 面试信号

> **"从 Sentry → 日志 → 设备信息 → 回滚，形成完整排查链路"**

回答框架：

1. **Sentry 三板斧**：错误堆栈（定位代码）→ Breadcrumbs（复现路径）→ Release（确认版本）
2. **日志系统查接口**：SLS/ELK 搜索请求参数和响应体，确认前后端归属
3. **设备信息看兼容性**：是否集中在特定浏览器/系统/设备
4. **快速止血**：新版本引入 → 回滚；老 bug → 紧急修复 + hotfix

核心逻辑：**先定位（哪里错）→ 再追溯（为什么错）→ 最后止血（回滚 or 修复）**。思路清晰、步骤完整，说明有独立处理线上事故的能力。

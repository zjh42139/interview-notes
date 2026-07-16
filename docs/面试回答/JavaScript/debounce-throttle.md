---
title: 防抖 / 节流 面试回答
description: 面试中如何回答防抖和节流——30 秒速答 + 2 分钟详解 + 追问预判
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-06
updated: 2026-07-10
reviewed: null
tags:
  - 防抖
  - 节流
  - debounce
  - throttle
  - 面试回答
---

# 防抖 / 节流 面试回答

## Q1: 防抖和节流有什么区别？各适用什么场景？

### 30 秒版本

"防抖——连续触发只执行最后一次。场景：搜索框输入。节流——连续触发按固定频率执行。场景：滚动事件。一句话：防抖是'你不停我就不动，停了再做'，节流是'不管你多快，我按规定节奏做'。"

### 2 分钟版本

"两个都是高频事件的性能优化手段，核心都是**用 setTimeout 控制执行频率**，但逻辑完全不同：

**防抖（Debounce）**：每次触发都重置计时器。用户停止触发后 wait 毫秒才执行。典型场景——搜索框输入。用户连续输入 "a"→"ab"→"abc"，前两次触发都被重置了，只有最后一次 "abc" 停下来 300ms 后才发请求。这避免了每次按键都发一次 API。

**节流（Throttle）**：一段时间内只执行一次。第一次触发后立即执行，wait 毫秒内再触发都会被忽略。典型场景——页面滚动。用户疯狂滚动，每秒触发几十次 scroll 事件——节流后每秒只执行一次滚动处理函数，性能消耗降为原来的 1/60。

**两种变体**：
- 防抖有 leading 模式——首次立即执行，后续防抖。适合按钮点击——点第一次立即响应，防止后续快速连点
- 节流有 trailing 模式——间隔结束时再执行一次。适合需要最后一帧数据的场景——比如滚动到底部时最后一次更新位置

**实际项目中的选择**：窗口 resize → 防抖；按钮提交 → 防抖（leading）；滚动加载更多 → 节流；鼠标拖拽 → 节流。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "手写一个防抖" | 核心：`let timer; return function(...args) { clearTimeout(timer); timer = setTimeout(() => fn.apply(this, args), wait) }`。注意 this 绑定和参数传递 |
| "手写一个节流" | 两种实现——时间戳版（`now - last >= wait` 时执行）和定时器版（timer 存在时忽略，不存在时 setTimeout 后清 timer） |
| "underscore/lodash 的 debounce 还有哪些参数" | leading（首次立即执行）、trailing（结束后执行最后一次）、maxWait（最长等待时间——防止防抖被无限推迟） |

## 别踩的坑

1. **this 丢失** —— 防抖返回的函数里调原始函数时，忘记传 this 和参数
2. **节流和防抖只用 setTimeout** —— 可以用时间戳 + setTimeout 组合，更灵活
3. **忘了清理** —— 组件卸载时应 `clearTimeout` 未执行的 timer

## 相关阅读

- [防抖 / 节流 知识文档](../../JavaScript/debounce-throttle.md)
- [手写防抖 / 节流](../../手写题/debounce-throttle.md)
- [this / bind 面试回答](./this-bind.md)

## 更新记录

- 2026-07-10：重写（30秒/2分钟/追问预判/易错点 标准格式）

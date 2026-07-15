---
title: 跨标签页通信
description: 浏览器多标签页通信方案——BroadcastChannel、postMessage、localStorage事件、SharedWorker 四种方式对比
category: 浏览器
type: mechanism
score: 75
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-16
tags:
  - 跨标签页通信
  - BroadcastChannel
  - postMessage
  - SharedWorker
---

# 跨标签页通信

> ⭐⭐⭐⭐｜难度：中级｜协同编辑/多窗口同步的核心技术

## 一句话总结

**浏览器多标签页之间通信有四种方案——BroadcastChannel（同源广播最简洁）、postMessage（跨域/iframe 通信）、localStorage + storage 事件（轻量但有竞态）、SharedWorker（单一线程中转最强大）。选型看是否需要跨域、数据量大小、实时性要求。**

## 核心机制

### 方案对比

| 方案 | 同源 | 跨域 | 实时性 | 数据量 | 复杂度 |
|------|:---:|:---:|:---:|:---:|:---:|
| BroadcastChannel | ✅ | ❌ | 实时 | 任意 | 低 |
| postMessage | ✅ | ✅ | 实时 | 任意（结构化克隆） | 中 |
| localStorage + storage | ✅ | ❌ | 非实时 | ~5MB | 低 |
| SharedWorker | ✅ | ❌ | 实时 | 任意 | 高 |
| window.open + opener | ✅ | ❌ | 实时 | 任意 | 低（仅父子窗口） |

### BroadcastChannel —— 最简洁的同源广播

```javascript
// 标签页 A
const channel = new BroadcastChannel('app');
channel.postMessage({ type: 'logout' });

// 标签页 B —— 同源任意标签页都能收到
const channel = new BroadcastChannel('app');
channel.onmessage = (event) => {
  if (event.data.type === 'logout') {
    // 一个标签页退出，全部退出
    router.push('/login');
  }
};
// 用完关闭
channel.close();
```

**场景**：一个标签页退出登录 → 所有标签页同步退出。用户偏好变更 → 全标签页同步。

### postMessage —— 跨域/iframe 通信

```javascript
// 父页面 → iframe
iframe.contentWindow.postMessage({ type: 'update' }, 'https://trusted.com');

// iframe → 父页面
window.parent.postMessage({ type: 'done' }, 'https://parent.com');

// 接收方
window.addEventListener('message', (event) => {
  // ⚠️ 必须验证 origin！否则任意页面都能发消息
  if (event.origin !== 'https://trusted.com') return;
  console.log(event.data);
});
```

**安全要点**：始终验证 `event.origin`。不验证的话任何页面都可以给你的页面发消息——相当于给你的跨窗口通信开了后门。

### localStorage + storage 事件

```javascript
// 标签页 A：写入 localStorage
localStorage.setItem('theme', 'dark');

// 标签页 B：监听到变化
window.addEventListener('storage', (event) => {
  if (event.key === 'theme') {
    console.log(event.newValue); // 'dark'
  }
});
```

**特点**：写入的标签页自身不会触发 storage 事件——只通知其他标签页。适合简单的状态同步。不适合高频写入——storage 事件非实时、可能被合并。

### SharedWorker

```javascript
// worker.js
const ports = new Set();
self.onconnect = (e) => {
  const port = e.ports[0];
  ports.add(port);
  port.onmessage = (e) => {
    // 收到一个页面的消息，广播给所有页面
    ports.forEach(p => p.postMessage(e.data));
  };
};
// 所有连接这个 Worker 的页面实时通信——同源共享单一线程
```

**场景**：多标签页实时协作——多个页面共享同一个 WebSocket 连接，由 Worker 管理。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "多标签页怎么通信" | 追问四种方案对比——"跨域怎么办" |
| "localStorage 怎么跨标签页同步" | 追问 storage 事件——"写入的那个页面能收到吗" |
| "postMessage 安全吗" | 追问 origin 验证 |

## 相关阅读

- [同源策略](./same-origin-policy.md)
- [Web Worker](./web-worker.md)
- [浏览器存储方案](./storage.md)

## 更新记录

- 2026-07-16：新建——四种方案对比表+BroadcastChannel/postMessage/storage/SharedWorker

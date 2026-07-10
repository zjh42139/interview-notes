---
title: WebSocket 实战
description: WebSocket 实战涵盖前端连接管理、心跳检测、断线重连（指数退避）、消息确认机制（ACK），以及和 SSE 的对比选型
category: 项目实战
type: project
score: 0
section: 业务场景
difficulty: 中高级
frequency: ⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
reviewed: null
tags:
  - WebSocket
  - 心跳检测
  - 断线重连
  - SSE
---

# WebSocket 实战

> "WebSocket 不只是 `new WebSocket(url)`。心跳怎么设计？断线后如何自动重连？重连策略用固定间隔还是指数退避？消息丢失了怎么保证可靠性？——把这些问题回答清楚，才叫真正在项目里用过 WebSocket。"

---

## 一句话总结

WebSocket 的封装核心在于 **连接管理**（connect / disconnect / reconnect）、**心跳检测**（每 30s 发 ping / 90s 未收 pong 则断开）、**指数退避重连**（1s -> 2s -> 4s -> 8s -> max 30s）和 **消息 ACK 机制**（确保消息不丢失），与 SSE 的区别是 WS 双向通信、SSE 仅服务端推送。

---

## 核心机制

### 1. WebSocket 封装（含心跳 + 重连）

```typescript
// src/utils/websocket.ts
type MessageHandler = (data: any) => void

interface WSOptions {
  url: string
  heartbeatInterval?: number    // 心跳间隔，默认 30s
  heartbeatTimeout?: number     // 心跳超时，默认 90s
  reconnectDelay?: number       // 初始重连延迟，默认 1s
  maxReconnectDelay?: number    // 最大重连延迟，默认 30s
  maxReconnectAttempts?: number // 最大重连次数，默认 10
  onMessage?: MessageHandler
  onOpen?: () => void
  onClose?: () => void
  onError?: (e: Event) => void
}

export class WSClient {
  private ws: WebSocket | null = null
  private opts: Required<WSOptions>
  private reconnectTimer: number | null = null
  private heartbeatTimer: number | null = null
  private heartbeatTimeoutTimer: number | null = null
  private reconnectAttempts = 0
  private pendingMessages: string[] = []  // 消息队列（连接未就绪时暂存）
  private ackCallbacks = new Map<string, () => void>()  // ACK 回调
  private isManualClose = false

  constructor(opts: WSOptions) {
    this.opts = {
      heartbeatInterval: 30000,
      heartbeatTimeout: 90000,
      reconnectDelay: 1000,
      maxReconnectDelay: 30000,
      maxReconnectAttempts: 10,
      onMessage: () => {},
      onOpen: () => {},
      onClose: () => {},
      onError: () => {},
      ...opts,
    }
  }

  // ---------- 连接 ----------
  connect() {
    this.isManualClose = false
    this.ws = new WebSocket(this.opts.url)

    this.ws.onopen = () => {
      this.reconnectAttempts = 0
      this.startHeartbeat()
      this.flushPendingMessages()   // 发送队列中的消息
      this.opts.onOpen()
    }

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      // 如果是 pong 心跳回复，仅重置超时计时器
      if (msg.type === 'pong') {
        this.resetHeartbeatTimeout()
        return
      }
      // 如果是 ACK，触发对应回调
      if (msg.type === 'ack' && this.ackCallbacks.has(msg.msgId)) {
        this.ackCallbacks.get(msg.msgId)!()
        this.ackCallbacks.delete(msg.msgId)
        return
      }
      this.opts.onMessage(msg)
    }

    this.ws.onclose = () => {
      this.clearTimers()
      this.opts.onClose()
      if (!this.isManualClose) {
        this.scheduleReconnect()
      }
    }

    this.ws.onerror = (e) => {
      this.opts.onError(e)
    }
  }

  // ---------- 发送消息（含 ACK） ----------
  send(data: any, needAck = false): Promise<void> {
    const msg = { ...data, msgId: Date.now() + '_' + Math.random() }

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg))
    } else {
      // 连接未就绪，放入队列等待
      this.pendingMessages.push(JSON.stringify(msg))
    }

    if (needAck) {
      return new Promise((resolve, reject) => {
        this.ackCallbacks.set(msg.msgId, resolve)
        // 5s 超时
        setTimeout(() => {
          if (this.ackCallbacks.has(msg.msgId)) {
            this.ackCallbacks.delete(msg.msgId)
            reject(new Error('ACK timeout'))
          }
        }, 5000)
      })
    }
    return Promise.resolve()
  }

  // ---------- 发送队列 ----------
  private flushPendingMessages() {
    while (this.pendingMessages.length > 0) {
      this.ws!.send(this.pendingMessages.shift()!)
    }
  }

  // ---------- 心跳 ----------
  private startHeartbeat() {
    this.heartbeatTimer = window.setInterval(() => {
      this.send({ type: 'ping' })
      // 启动超时检测：90s 内没收到 pong 则认为断开
      this.heartbeatTimeoutTimer = window.setTimeout(() => {
        console.warn('[WS] 心跳超时，主动断开')
        this.ws?.close()
      }, this.opts.heartbeatTimeout)
    }, this.opts.heartbeatInterval)
  }

  private resetHeartbeatTimeout() {
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer)
    }
  }

  // ---------- 指数退避重连 ----------
  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.opts.maxReconnectAttempts) {
      console.error('[WS] 已达最大重连次数，停止重连')
      return
    }
    // 指数退避：1s -> 2s -> 4s -> 8s -> ... -> max 30s
    const delay = Math.min(
      this.opts.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.opts.maxReconnectDelay
    )
    this.reconnectAttempts++
    console.log(`[WS] 将在 ${delay}ms 后第 ${this.reconnectAttempts} 次重连`)

    this.reconnectTimer = window.setTimeout(() => {
      this.connect()
    }, delay)
  }

  // ---------- 清理 ----------
  private clearTimers() {
    if (this.reconnectTimer) { clearTimeout(this.reconnectTimer); this.reconnectTimer = null }
    if (this.heartbeatTimer) { clearInterval(this.heartbeatTimer); this.heartbeatTimer = null }
    if (this.heartbeatTimeoutTimer) { clearTimeout(this.heartbeatTimeoutTimer); this.heartbeatTimeoutTimer = null }
  }

  disconnect() {
    this.isManualClose = true
    this.clearTimers()
    this.ws?.close()
    this.ws = null
  }
}
```

### 2. Vue3 中使用

```typescript
// src/hooks/useWSNotification.ts
import { ref, onUnmounted } from 'vue'
import { WSClient } from '@/utils/websocket'
import { useUserStore } from '@/stores/user'

const notifications = ref<any[]>([])
const isConnected = ref(false)

let client: WSClient | null = null

export function useWSNotification() {
  function connect() {
    const token = useUserStore().token
    client = new WSClient({
      url: `wss://api.example.com/ws?token=${token}`,
      onMessage: (data) => {
        if (data.type === 'notification') {
          notifications.value.unshift(data.payload)
        }
      },
      onOpen: () => { isConnected.value = true },
      onClose: () => { isConnected.value = false },
    })
    client.connect()
  }

  onUnmounted(() => {
    client?.disconnect()
  })

  return { notifications, isConnected, connect }
}
```

---

## 深度拓展

### 追问 1：WS 和 SSE（Server-Sent Events）怎么选？

| 对比维度 | WebSocket | SSE |
|----------|-----------|-----|
| 通信方向 | 双向（全双工） | 单向（服务器 -> 客户端） |
| 协议 | ws:// / wss:// | HTTP（长连接） |
| 二进制数据 | 支持 | 仅文本（可 Base64 编码二进制） |
| 自动重连 | 需手动实现 | 浏览器内置（`EventSource` 自动重连） |
| 断线恢复 | 需手动实现 | 支持 `Last-Event-ID` 断点续传 |
| 浏览器兼容 | 所有现代浏览器 | 所有现代浏览器（IE 不支持） |
| 适用场景 | 聊天、协作编辑、实时游戏 | 通知推送、股票行情、日志流 |

> **选型原则**：单向推送用 SSE（更简单、更轻量），双向通信用 WebSocket。

### 追问 2：指数退避 vs 固定间隔重连

```
固定间隔：每次等 3s，连接失败一直 3s
指数退避：1s -> 2s -> 4s -> 8s -> 16s -> 30s（封顶）

优势：
- 避免大量客户端同时重连造成服务端雪崩（"thundering herd"问题）
- 给服务端更多恢复时间
```

公式：`delay = min(initialDelay * 2^attempt, maxDelay)`

### 追问 3：消息ACK机制的实现

ACK（Acknowledgement）确保关键消息不丢失：

```typescript
// 客户端发送
await client.send({ type: 'order', payload: { id: 123 } }, true)
// 服务端收到后回复 { type: 'ack', msgId: '...' }
// 客户端收到 ACK 后 resolve Promise

// 如果 5s 未收到 ACK，Promise reject，客户端可重发
```

服务端（Node.js 示例）：

```javascript
ws.on('message', (data) => {
  const msg = JSON.parse(data)
  // 回复 ACK
  ws.send(JSON.stringify({ type: 'ack', msgId: msg.msgId }))
  // 处理业务逻辑
  handleMessage(msg)
})
```

---

## 项目实战

### 后台管理系统中的 WebSocket 应用场景

| 场景 | 方向 | 说明 |
|------|------|------|
| 消息通知 | 服务端 -> 客户端 | 新消息实时推送，桌面通知 |
| 权限变更推送 | 服务端 -> 客户端 | 管理员修改权限后，刷新受影响用户的页面 |
| 大文件上传进度 | 客户端 <-> 服务端 | 双向：上传分片 + 服务端推送进度 |
| 在线用户列表 | 服务端 -> 客户端 | 实时更新在线状态 |

### 权限变更推送实现

```typescript
// 监听权限变更消息
client.send = (data) => { /* ... 正常发送 */ }

// 收到权限变更推送时
if (msg.type === 'permission_changed') {
  const userStore = useUserStore()
  userStore.refreshPermissions()    // 重新拉取最新权限
  ElMessage.warning('您的权限已更新，部分功能可能已变更')
}
```

---

## 易错点

1. **心跳定时器泄漏**：组件卸载或 WebSocket 断开后，`setInterval` / `setTimeout` 仍在运行。必须在 `disconnect()` 和 `onUnmounted` 中清除所有定时器。

2. **重连风暴**：大量客户端同时断开后使用相同的固定间隔重连，会在同一时刻全部请求服务器，造成"惊群效应"。解决方案：指数退避 + 随机延迟（jitter）。

3. **消息重复**：重连后，之前已发送但未收到 ACK 的消息会被重发，服务端需要根据 `msgId` 做幂等处理，避免重复处理同一消息。

4. **忘记手动关闭**：页面通过 `router.push` 跳转时，WebSocket 连接不会自动断开，一直保持连接浪费资源。应在组件 `onUnmounted` 或路由守卫中主动断开。

---

## 相关阅读

- [登录鉴权](../认证鉴权/login-auth.md) — WS 连接时的 Token 鉴权
- [大文件上传](./big-file-upload.md) — WS 推送上传进度
- [组件封装实践](./component-encapsulation.md) — 实时通知组件的封装

---

## 更新记录

- 2026-07-06：完成内容填充，新增 WSClient 完整封装（心跳/重连/ACK/消息队列）、SSE 对比、指数退避原理、后台管理应用场景、权限变更推送

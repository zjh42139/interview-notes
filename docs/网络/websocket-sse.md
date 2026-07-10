---
title: WebSocket / SSE
description: WebSocket 是全双工通信协议（双向），SSE 是服务端到客户端的单向推送（基于 HTTP），各有适用场景
category: 网络
type: comparison
score: 0
difficulty: 中级
frequency: ⭐⭐⭐
status: reviewed
created: 2026-07-05
updated: 2026-07-05
reviewed: 2026-07-05
tags:
  - WebSocket
  - SSE
  - 实时通信
---

# WebSocket / SSE

> 频率: 3/5 | 难度: 中级 | 项目相关: 核心

## 一句话总结

WebSocket 是全双工通信协议，客户端和服务端可以随时互相发消息，适合需要双向高频交互的场景；SSE（Server-Sent Events）是服务端到客户端的单向推送，基于 HTTP 协议，更轻量，适合只需要服务端主动推送、客户端不需要发数据的场景。

## 核心机制

### WebSocket 握手 — 从 HTTP 升级到 WS

WebSocket 的连接建立依赖 HTTP，但建立后就完全跑自己的协议了：

1. 客户端发 HTTP GET 请求，带 `Upgrade: websocket` 和 `Connection: Upgrade` 头。
2. 服务端返回 `101 Switching Protocols`，握手完成。
3. 这个 TCP 连接从此不再走 HTTP 协议，而是 WebSocket 的二进制帧协议，双方可同时互发文本帧和二进制帧。

### SSE — 服务端推送的标准 HTTP 方案

SSE 就是 HTTP 的一个"长连接响应"——服务端返回一个不会结束的 response body，`Content-Type: text/event-stream`。每条消息以 `data:` 开头、空行分隔。浏览器用 `EventSource` API 消费，自带自动重连：

```js
const es = new EventSource('/api/notifications/stream')
es.onmessage = (event) => {
  const data = JSON.parse(event.data)
  ElNotification({ title: '新消息', message: data.message })
}
// 连接断了自动重连；服务端通过 id 字段告知续传起点
```

### WebSocket vs SSE 对比

| 维度 | WebSocket | SSE |
|------|-----------|-----|
| 通信方向 | 双向（全双工） | 单向（服务端 -> 客户端） |
| 底层协议 | 独立 WS 协议（ws://） | 标准 HTTP |
| 二进制数据 | 原生支持 | 仅文本（需 base64 编码） |
| 重连机制 | 需手动实现 | EventSource 自动重连 |
| 消息追踪 | 需手动实现 | 支持 ID 断点续传 |
| 经过代理/防火墙 | 可能被阻断（Upgrade 头） | 无问题（普通 HTTP） |
| 浏览器兼容 | 完全支持 | IE 不支持 EventSource |

## 深度拓展

### WebSocket 的心跳保活机制

TCP 长连接无数据传输时，中间网络设备（NAT、负载均衡、代理）可能断开。心跳用于保活：客户端每 30s 发一个 WebSocket ping 帧，服务端回 pong 帧；连续 3 次无 pong 视为断开，主动重连。实际项目中很多团队用**应用层心跳**替代协议层 ping/pong，因为浏览器 WebSocket API 不暴露 ping/pong 接口。

### SSE 的自动重连和 EventSource API

`EventSource` 相比 `WebSocket` 最大的优势是内置重连：断开后浏览器自动重试。服务端通过 `id:` 字段标记消息 ID，重连时客户端请求头带上 `Last-Event-Id`，服务端知道从哪里续传——比 WebSocket 掉线丢消息可靠得多。服务端还可通过 `retry:` 字段控制重连间隔。

### WebSocket vs Socket.IO

Socket.IO 是 WebSocket 的**上层封装**，不是替代品。它提供：自动降级（不支持 WS 时切到 HTTP 长轮询）、自动重连（指数退避）、Namespace（逻辑分组）和 Room（组内广播）。结论：简单双向通信用原生 WebSocket（0 额外体积）；需要 room 广播、命名空间、内置退避重连时上 Socket.IO。

## 项目实战

### 后台管理系统消息通知 — 用 SSE

后台管理右上角的铃铛通知（订单、审批、公告），天然适合 SSE——只需服务端推送、无需客户端回发。Vue3 + Element Plus 后台中的实现：

```ts
// composables/useNotificationStream.ts
export function useNotificationStream() {
  const notifications = ref<Notification[]>([])
  let es: EventSource | null = null
  onMounted(() => {
    es = new EventSource(`/api/notifications/stream?token=${getToken()}`)
    es.onmessage = (e) => {
      const n = JSON.parse(e.data)
      notifications.value.unshift(n)
      ElNotification({ title: n.title, message: n.content })
    }
  })
  onUnmounted(() => es?.close())
  return { notifications }
}
```

SSE 走标准 HTTP 端口，不需要 Nginx 做额外的 WebSocket 代理配置，在公司内网环境下代理/网关不会阻断。

### 实时数据看板 — 用 WebSocket

数据大屏/实时看板（订单量、用户活跃度、系统监控）需要双向高频通信——客户端切换数据维度，服务端持续推送。用 WebSocket：

```ts
// composables/useDashboardWS.ts
export function useDashboardWS() {
  const metrics = ref(null)
  let ws = null, timer = null
  function connect() {
    ws = new WebSocket(`wss://${location.host}/ws/dashboard`)
    ws.onmessage = (e) => metrics.value = JSON.parse(e.data)
    ws.onclose = () => timer = setTimeout(connect, 1000 * Math.min(++attempts, 30))
  }
  onMounted(connect)
  onUnmounted(() => { ws?.close(); clearTimeout(timer) })
  return { metrics, switchMetric: (t) => ws?.send(JSON.stringify({ metric: t })) }
}
```

### 文件上传进度 — WebSocket 实时反馈

大文件分片上传的进度反馈也可以用 WebSocket：服务端每处理完一个分片就推一条 `{ fileId, progress }` 消息给前端，前端实时更新进度条。对比客户端轮询方案，实时推送省去了轮询的 HTTP 开销，延迟也远低于轮询间隔。

## 易错点

- **SSE 同域下自动携带 Cookie**：用户专属通知无需额外鉴权；但跨域 SSE 的 `withCredentials` 比 CORS 更麻烦。
- **Nginx 反向代理需额外配置才支持 WebSocket**：因为长连接，Nginx 默认超时和缓冲会导致过早断开，需要 `proxy_http_version 1.1` + `proxy_set_header Upgrade` + `proxy_set_header Connection "upgrade"`。
- **服务端 WebSocket 连接数有限**：浏览器没有硬性限制，但 Node.js 服务端有。通过心跳及时回收死连接，单节点可支撑 5000+ 并发。

## 相关阅读

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "WebSocket 和 HTTP 有什么区别" | 追问握手时的 HTTP Upgrade 机制 |
| "WebSocket 和 SSE 怎么选" | 追问 SSE 的自动重连和 event ID 机制 |
| "WebSocket 断线了怎么办" | 追问心跳检测（ping/pong）+ 指数退避重连 |
| "多实例 WebSocket 怎么共享" | 追问 Redis Pub/Sub 或 MQ 跨进程广播 |

- [MDN: WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [MDN: Server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [http-https](./http-https.md) — WebSocket 和 SSE 基于的底层 HTTP 协议
- [cors](./cors.md) — 跨域场景下的 WebSocket/SSE 配置

## 更新记录

- 2026-07-05：完成 Phase 2 填充（reviewed）

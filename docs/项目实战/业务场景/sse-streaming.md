---
title: SSE 流式输出 / AI 对话
description: SSE（Server-Sent Events）流式输出实战——AI 对话、实时日志推送、进度通知的协议选型与实现
category: 项目实战
type: practice
score: 85
difficulty: 高级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-16
tags:
  - SSE
  - 流式输出
  - AI
  - ReadableStream
  - 面试回答
---

# SSE 流式输出 / AI 对话

> ⭐⭐⭐⭐⭐｜难度：高级｜2025-2026 面试最热方向

**SSE 是 HTTP 协议上的服务端推送技术——比 WebSocket 轻量、比轮询实时。AI 对话、日志实时推送、大文件下载进度都是 SSE 的典型场景。面试中能说清"为什么用 SSE 而不是 WebSocket"比能用更重要。**

## 一句话总结

**SSE 基于 HTTP 单向推送——服务端可以持续向客户端发送数据，客户端通过 `EventSource` 或 `fetch + ReadableStream` 接收。AI 对话场景首选 SSE：单向（AI 生成→用户展示）、自动重连、基于 HTTP 无额外协议开销。**

## SSE vs WebSocket 选型

| 维度 | SSE | WebSocket |
|------|-----|-----------|
| 方向 | 服务端→客户端 单向 | 双向通信 |
| 协议 | HTTP/1.1 或 HTTP/2 | 独立 ws:// 协议 |
| 自动重连 | 内置（`EventSource` 自动重连） | 需手动实现 |
| 二进制数据 | ❌ 仅文本（可 Base64 编码） | ✅ 原生支持二进制帧 |
| 穿透防火墙 | ✅ 走 HTTP 端口，无额外配置 | ⚠️ 部分企业防火墙拦截 ws:// |
| 使用复杂度 | 极低（`new EventSource(url)`） | 中等（心跳/重连/序列化） |
| AI 对话 | ✅ 最佳选择 | ❌ 过度设计 |

## 核心实现

### EventSource（基础用法）

```typescript
// 最简单的方式——但功能有限（仅 GET、不可自定义 headers）
const es = new EventSource('/api/chat/stream?message=hello')

es.onmessage = (event) => {
  console.log('收到:', event.data)
  // 增量追加到 UI
}

es.onerror = () => {
  // EventSource 会自动重连，这里做 UI 提示
  console.log('连接断开，正在重连...')
}

// 主动关闭
es.close()
```

### fetch + ReadableStream（生产级）

```typescript
// 生产环境用 fetch——支持 POST、自定义 headers、AbortController
async function streamChat(message: string, onChunk: (text: string) => void) {
  const controller = new AbortController()

  try {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
      signal: controller.signal,
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const reader = response.body!.getReader()
    const decoder = new TextDecoder('utf-8', { stream: true })  // stream 模式防 UTF-8 乱码

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      onChunk(chunk)  // 逐块渲染到 UI
    }
  } catch (err: any) {
    if (err.name === 'AbortError') return  // 用户取消
    throw err
  }
}
```

### 指数退避重连

```typescript
class SSEClient {
  private retryCount = 0
  private baseDelay = 1000  // 初始 1s

  async connect(url: string) {
    const delay = Math.min(this.baseDelay * Math.pow(2, this.retryCount), 30000)  // 最多 30s
    try {
      await this.stream(url)
      this.retryCount = 0  // 成功后重置
    } catch {
      this.retryCount++
      await new Promise(r => setTimeout(r, delay + Math.random() * 1000))  // 加随机抖动
      this.connect(url)
    }
  }
}
```

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "为什么用 SSE 不用 WebSocket" | 追问"AI 对话需要双向通信吗"——不需要，用户发消息走普通 POST，AI 回复走 SSE |
| "Unicode 乱码怎么处理" | TextDecoder stream 模式——跨 chunk 的 UTF-8 多字节字符不会断裂 |

## 相关阅读

- [WebSocket / SSE](../../网络/websocket-sse.md)
- [Fetch API 深度解析](../../网络/fetch-api.md)

## 更新记录

- 2026-07-16：新建——Phase 2 覆盖率审计补齐

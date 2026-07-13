---
title: HTTP/2 HTTP/3 面试回答
description: 面试中如何回答 HTTP/2 多路复用和 HTTP/3 QUIC——30 秒速答 + 2 分钟详解 + 追问预判
category: 面试回答
type: interview
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-13
updated: 2026-07-13
reviewed: null
tags:
  - HTTP2
  - HTTP3
  - QUIC
  - 多路复用
  - 面试回答
---

# HTTP/2 HTTP/3 面试回答

## Q1: HTTP/2 相比 HTTP/1.1 做了哪些改进？多路复用原理？

### 30 秒版本

"HTTP/2 四个核心改进：二进制分帧——把 HTTP 报文拆成帧和流、多路复用——一个 TCP 连接并发多个请求互不阻塞、头部压缩 HPACK——请求头去重减少传输、服务器推送——服务端主动推关键资源。HTTP/2 下不需要合并文件和雪碧图——多路复用让小文件并发加载反而更快。"

### 2 分钟版本

"从 HTTP/1.1 的痛点说起。HTTP/1.1 最大的问题是队头阻塞——一个 TCP 连接上同一时间只能处理一个请求，前一个卡住后面全排队。浏览器可以开 6 个连接缓解，但连接本身就是开销（TCP 握手+TLS 握手），6 个连接也有限。

**HTTP/2 的解法——二进制分帧层**。在 HTTP 和 TCP 之间加了一层，把请求/响应拆成独立的帧，每个帧标上 Stream ID。同一个 TCP 连接上，多个 Stream 的帧交错发送，接收方按 Stream ID 重新组装。相当于把单车道变成了多车道——所有请求同时跑，互不阻塞。

**头部压缩 HPACK**：HTTP/1.1 的请求头每次都要完整发送（Cookie、User-Agent 动辄几百字节）。HPACK 用静态表+动态表+Huffman 编码压缩——相同的头只发一次引用。比如第二次请求同域名的 Cookie 只发一个表索引，几百字节变成几个字节。

**服务器推送**：服务端知道客户端请求了 index.html，可以主动把 `style.css`、`app.js` 一起推过去，省去客户端解析 HTML 后重新发请求的往返时间。但注意——推送可能浪费（浏览器已有缓存），Chrome 已经移除了 Server Push 支持，改为用 103 Early Hints。

**HTTP/2 仍然有队头阻塞**——这次在 TCP 层面。TCP 丢一个包，所有 Stream 都等重传，因为 TCP 按字节流保证顺序。这就是 HTTP/3 要解决的问题。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "HTTP2 下还需要合并文件吗" | 不需要——多路复用让小文件并发加载反而更快。合并文件会降低缓存效率——改一行代码整个 bundle 缓存失效。CSS 里的小图标也不需要雪碧图了 |
| "HTTP2 的队头阻塞是什么" | TCP 层面的——一个包丢了所有 Stream 都等重传。HTTP/3 用 QUIC 基于 UDP，每个 Stream 独立——一个 Stream 丢包不影响其他 Stream |
| "HTTP3 为什么基于 UDP" | TCP 协议栈在操作系统内核——升级需要所有操作系统统一行动几乎不可能。QUIC 在用户态（应用层）实现——可以随浏览器版本快速迭代 |

## Q2: HTTP/3 和 QUIC 是怎么回事？

### 30 秒版本

"HTTP/3 基于 QUIC——在 UDP 上自实现了 TCP 的可靠性和多路复用。核心优势：零 RTT 恢复连接——缓存服务端配置下次直发数据；连接迁移——基于 Connection ID 而非 IP，切换网络不断连；流独立——不共用一个 TCP，丢包只影响一个流。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "QUIC 怎么保证可靠性" | 在应用层实现了类似 TCP 的确认重传+拥塞控制——收到数据回 ACK，丢了重传。只是每个 Stream 独立——Stream A 丢包=Stream A 重传，Stream B 不受影响 |
| "0-RTT 的风险" | 重放攻击——攻击者捕获 0-RTT 数据包重发，服务端会当作有效请求处理。所以 0-RTT 只用于幂等的 GET 请求，不用于 POST/PUT |
| "连接迁移是什么" | QUIC 不用 IP+端口标识连接，用 64 位的 Connection ID。WiFi 切 4G、IP 变了——Connection ID 不变——连接无缝继续，不用重新握手 |

## 别踩的坑

1. **"HTTP/3 就是 HTTP over UDP"太粗糙** —— QUIC 在 UDP 之上实现了完整的可靠传输层，说"HTTP/3 基于 QUIC（运行在 UDP 之上）"更准确
2. **把 Server Push 当成 HTTP/2 的核心卖点** —— 实际上已在 Chrome 中移除，面试中应该说"Server Push 曾是一大特性，但实践中容易浪费带宽"
3. **说 HTTP/2 完全解决了队头阻塞** —— 只解决了 HTTP 层队头阻塞，TCP 层的还在。HTTP/3 才解决 TCP 层的问题

## 相关阅读

- [HTTP2 / HTTP3 知识文档](../../网络/http2-http3.md)
- [HTTP / HTTPS 面试回答](./http-https.md)
- [TCP 面试回答](./tcp.md)

## 更新记录

- 2026-07-13：新建（30秒/2分钟/追问预判/易错点 标准格式）

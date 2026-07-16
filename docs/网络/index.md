---
title: 网络 知识地图
description: 网络面试知识体系
category: 网络
---

# 网络 知识地图

```mermaid
mindmap
  root((网络))
    协议与模型
      OSI 七层 / TCP/IP 四层
      TCP
        三次握手
        四次挥手
      HTTP / HTTPS
      HTTP2 / HTTP3
    缓存与安全
      HTTP 缓存
        Cache-Control
        ETag / 304
      CORS
    基础设施
      DNS / CDN
    数据交互
      WebSocket / SSE
      Fetch API
        AbortController
        Stream
```

## 推荐学习顺序

### 一、协议与模型

1. ⭐⭐⭐⭐   [OSI 七层 / TCP/IP 四层](./osi-model.md)
2. ⭐⭐⭐⭐⭐ [TCP](./tcp.md)
3. ⭐⭐⭐⭐⭐ [HTTP / HTTPS](./http-https.md)
4. ⭐⭐⭐⭐   [HTTP2 / HTTP3](./http2-http3.md)

### 二、缓存与安全

5. ⭐⭐⭐⭐⭐ [HTTP 缓存](./http-cache.md)
6. ⭐⭐⭐⭐⭐ [CORS](./cors.md)

### 三、基础设施

7. ⭐⭐⭐⭐   [DNS / CDN](./dns-cdn.md)

### 四、数据交互（按优先级）

8. ⭐⭐⭐⭐   [Fetch API 深度解析](./fetch-api.md)
9. ⭐⭐⭐     [WebSocket / SSE](./websocket-sse.md)
10. ⭐⭐       [UDP 协议](./udp.md)
11. ⭐⭐       [HTTP 请求方法](./http-methods.md)
12. ⭐⭐       [代理/负载均衡](./proxy-lb.md)

> 说明：UDP/代理/负载均衡 偏基础设施，前端面试深挖概率低。理解基本概念（UDP 无连接、正向/反向代理区别、Nginx 负载均衡基础）即可，不需要和 HTTP/TCP/CORS 同等深度。

## 知识点索引

| 知识点 | 频率 | 难度 | 手写 | 状态 |
|--------|------|------|------|------|
| [OSI 七层 / TCP/IP 四层](./osi-model.md) | ⭐⭐⭐⭐ | 中级 | — | draft |
| [TCP](./tcp.md) | ⭐⭐⭐⭐⭐ | 高级 | — | draft |
| [HTTP / HTTPS](./http-https.md) | ⭐⭐⭐⭐⭐ | 中级 | — | draft |
| [HTTP2 / HTTP3](./http2-http3.md) | ⭐⭐⭐⭐ | 高级 | — | draft |
| [HTTP 缓存](./http-cache.md) | ⭐⭐⭐⭐⭐ | 中级 | — | draft |
| [CORS](./cors.md) | ⭐⭐⭐⭐⭐ | 中级 | — | draft |
| [DNS / CDN](./dns-cdn.md) | ⭐⭐⭐⭐ | 中级 | — | draft |
| [WebSocket / SSE](./websocket-sse.md) | ⭐⭐⭐ | 中级 | — | draft |
| [Fetch API 深度解析](./fetch-api.md) | ⭐⭐⭐⭐ | 中级 | — | draft |

## 相关阅读

- [面试题库：网络](../面试题库/网络.md) — 15 道网络高频真题
- [面试回答：网络](../面试回答/网络/http-https.md) — 4 篇网络逐字回答稿
- [浏览器知识地图](../浏览器/index.md) — 浏览器缓存、渲染流程、安全

## 更新记录

- 2026-07-13：新增 osi-model.md + http-cache.md；mindmap 四组分类 + 学习顺序分组
- 2026-07-05：初始创建

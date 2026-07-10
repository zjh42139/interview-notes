---
title: HTTP/HTTPS 面试回答
description: HTTP 和 HTTPS 的 30 秒速答和 2 分钟深度回答
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-10
updated: 2026-07-10
---

# HTTP / HTTPS 面试回答

> 对应题库：[面试题库/网络](../../面试题库/网络.md)

## 30 秒版

HTTP 是浏览器和服务器通信的协议——无状态、基于请求-响应模型。HTTPS 在 HTTP 和 TCP 之间加了一层 TLS 加密——保证数据的机密性（中间人看不到）、完整性（数据没被篡改）和身份认证（你确实在跟真正的服务器通信）。HTTPS 慢在 TLS 握手多了一到两个 RTT，但 HTTP/2 之后只用一个 TCP 连接，这点额外开销被多路复用省下来了。

---

## 2 分钟版

**第一：HTTP 的核心特征。**

HTTP 是无状态的——每次请求都是独立的，服务器不记得你。解决方案是 Cookie + Session 或 Token。HTTP/1.1 引入了 Keep-Alive——复用同一个 TCP 连接发多个请求，减少 TCP 握手的开销。但 HTTP/1.1 的队头阻塞——同一个连接上的请求必须按顺序响应，前一个慢后面全等。HTTP/2 用多路复用解决了这个问题——一个连接上同时传输多个请求和响应，互不阻塞。

**第二：HTTPS = HTTP + TLS。**

TLS 握手过程：客户端发 ClientHello（支持的加密套件 + 随机数）→ 服务端回 ServerHello（选定的加密套件 + 随机数 + 证书）→ 客户端验证证书（CA 签名链）→ 客户端生成 Pre-Master Secret，用证书中的公钥加密发给服务端 → 双方用两个随机数 + Pre-Master Secret 算出会话密钥 → 之后全用对称加密通信。为什么最终用对称加密？非对称加密太慢——TLS 只在前几步用 RSA/ECDHE 交换密钥，后续用 AES 等对称加密。

**第三：HTTP 状态码体系。**

1xx 信息、2xx 成功（200 OK / 201 Created / 204 No Content）、3xx 重定向（301 永久 / 302 临时 / 304 Not Modified）、4xx 客户端错误（400 Bad Request / 401 Unauthorized / 403 Forbidden / 404 Not Found / 405 Method Not Allowed）、5xx 服务端错误（500 Internal Server Error / 502 Bad Gateway / 503 Service Unavailable）。301 和 302 的关键区别——301 永久重定向浏览器会记住，下次直接跳新 URL 不经过旧地址；302 临时重定向浏览器每次都先访问旧地址。

**第四：GET 和 POST 的区别。**

语义层面——GET 获取资源、POST 创建资源。GET 参数在 URL 中（有长度限制、可被缓存、可收藏、会保留在浏览器历史中）、POST 参数在请求体中（无长度限制、不可缓存）。安全的 GET 应该是幂等的——多次请求结果一致、不改变服务端状态。RESTful 规范中 GET 不能做写操作。

---

## 追问预判

| 追问 | 回应要点 |
|------|----------|
| "TLS 握手中证书的作用" | 证书里包含服务端公钥和域名——CA 的私钥对证书签名，浏览器用 CA 公钥验证签名。如果中间人篡改了证书，浏览器会证书链校验不通过提告警 |
| "HTTPS 真的慢很多吗" | HTTP/2 时代 HTTPS 反而快——因为 HTTP/2 浏览器只支持 HTTPS。TLS 握手的 1-2 RTT 被 HTTP/2 的多路复用赚回来了——一根连接顶 HTTP/1.1 六根 |
| "301 和 302 对 SEO 的影响" | 搜索引擎看到 301 会把权重转移到新 URL——旧 URL 不再被收录。302 只是临时跳——旧 URL 继续保留。所以改版用 301，临时维护用 302 |

---

## 别踩的坑

- "HTTPS 不是端到端加密"——TLS 到 CDN 节点就可能中断了。如果 CDN 回源用的是 HTTP，那段链路就是明文的。全链路加密需要 CDN 回源也配 HTTPS
- "把所有 POST 都改成 GET"——GET 参数暴露在 URL 中，敏感数据不要用 GET；GET 请求会被浏览器缓存、被代理服务器记录日志。密码、Token 用 POST
- "HTTPS 完全防中间人"——中间人攻击如果拿到了伪造证书（CA 被攻破），HTTPS 也可能被破解。这就是为什么有 Certificate Transparency 和 HPKP

---
title: 跨域 / CORS 面试回答
description: 面试中如何回答跨域和 CORS——30 秒速答 + 2 分钟详解 + 追问预判
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-06
updated: 2026-07-10
reviewed: null
tags:
  - CORS
  - 跨域
  - 同源策略
  - JSONP
  - 面试回答
---

# 跨域 / CORS 面试回答

## Q1: 什么是跨域？CORS 怎么解决？

### 30 秒版本

"跨域是浏览器的同源策略——协议、域名、端口任一不同就不能访问对方资源。CORS 是标准跨域方案——服务器在响应里加 `Access-Control-Allow-Origin` 头，浏览器检查通过就允许访问。"

### 2 分钟版本

"同源策略限制了三样：DOM 访问、Cookie 读取、AJAX 请求。`<img>` `<script>` `<link>` 加载资源不受限制——这就是 JSONP 能跨域的原理。

**CORS 两种请求**：

**简单请求**：GET/POST/HEAD + 三种 Content-Type（text/plain、multipart/form-data、x-www-form-urlencoded）+ 无自定义头。浏览器直接发请求，服务器返回 `Access-Control-Allow-Origin`，浏览器检查通过→JS 读到响应。

**预检请求（Preflight）**：不满足简单请求条件——比如 `Content-Type: application/json` 或自定义头 `Authorization`——浏览器先发 OPTIONS 问服务器"这个请求你能接受吗？"。服务器返回 `Access-Control-Allow-Methods/Headers` 等头。通过→浏览器才发正式请求。不通过→404 或 CORS 错误。

**其他跨域方案**：JSONP（`<script>` 不受限/只 GET/古老）、代理（Nginx 反向代理/devServer proxy）、postMessage（iframe 通信）、WebSocket（不受同源限制）。

**实践**：开发环境用 Vite `server.proxy` 代理；生产环境 Nginx 统一 CORS 头 + 反向代理。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "简单请求和预检请求的分界" | 三个条件同时满足才简单——方法、Content-Type、无自定义头。一个不满足就触发预检 |
| "JSONP 为什么被淘汰" | 只支持 GET、无错误处理、XSS 风险。CORS 更标准更安全 |
| "CORS 能带 Cookie 吗" | 默认不带。需前端 `credentials: 'include'` + 后端 `Access-Control-Allow-Credentials: true` + Origin 不能是 `*` |

## 别踩的坑

1. **"跨域是后端问题"** —— 减分。跨域是浏览器行为——后端返回了数据但浏览器不让 JS 读。前端要理解 CORS 才能排查
2. **OPTIONS 请求 404** —— 很多后端只注册 GET/POST，OPTIONS 直接 404
3. **`Access-Control-Allow-Origin: *` 和 `credentials: 'include'` 互斥** —— 要带 Cookie 就不能用 `*`

## 相关阅读

- [CORS 知识文档](../../网络/cors.md)
- [同源策略](../../浏览器/same-origin-policy.md)
- [HTTP / HTTPS 面试回答](./http-https.md)

## 更新记录

- 2026-07-10：重写（30秒/2分钟/追问预判/易错点 标准格式）

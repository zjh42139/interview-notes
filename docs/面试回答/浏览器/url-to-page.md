---
title: URL 到页面展示 面试回答
description: 面试中如何回答从输入 URL 到页面展示的完整过程——30 秒速答 + 2 分钟详解 + 追问预判
category: 面试回答
type: interview
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-06
updated: 2026-07-10
reviewed: null
tags:
  - URL到页面
  - 渲染流程
  - DNS
  - TCP
  - 面试回答
---

# URL 到页面展示 面试回答

> 面试中最经典的串联题。面试官不指望你所有细节全讲完——看的是你组织逻辑和重点分配。

## Q1: 从输入 URL 到页面展示，发生了什么？

### 30 秒版本

"两大段——网络段和渲染段。网络：DNS 解析域名→IP → TCP 连接（HTTPS 加 TLS 握手）→ 发 HTTP 请求 → 服务器返回 HTML。渲染：HTML 解析成 DOM 树 → CSS 解析成 CSSOM → 合成渲染树 → 布局计算位置 → 绘制 → 合成显示。"

### 2 分钟版本

"分六个阶段：

**1. DNS 解析（域名→IP）**：浏览器 DNS 缓存 → OS hosts → 本地 DNS 服务器 → 递归查询根/顶级/权威 DNS。`dns-prefetch` 可提前做这一步。

**2. TCP 连接（传输层）**：三次握手 SYN→SYN-ACK→ACK。HTTPS 加 TLS 握手（证书验证 + 密钥协商）。HTTP3 用 QUIC（UDP）替代 TCP+TLS。

**3. HTTP 请求**：浏览器构建请求行+头+体→服务器处理后返回响应。HTTP2 多路复用让多请求共享一个 TCP 连接。

**4. HTML 解析成 DOM**：字节→字符→Token→节点→DOM 树。`<script>` 标签暂停 DOM 解析。`defer` 异步下载、等 DOM 解析完再执行——不阻塞解析；`async` 异步下载、**执行时仍暂停 DOM 解析**（不管 DOM 是否解析完）。CSS 不阻塞 DOM 解析但阻塞渲染——渲染树需要 CSSOM。

**5. CSS 计算和渲染树**：CSS 解析成 CSSOM → 和 DOM 合并成渲染树。`display: none` 不出现在渲染树中。

**6. 布局→绘制→合成**：布局计算每个节点的几何位置→绘制生成像素→合成各层合并显示。重排/重绘的优化点——减少布局计算、避免不必要绘制、利用 GPU 合成层。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "DNS 解析具体过程" | 递归查询（本地 DNS 代查）→ 迭代查询（根→顶级→权威逐级返回）。有 CDN 时 DNS 返回最近的 CDN 节点 IP |
| "三次握手为什么是三次" | 防止旧连接请求。两次的话——客户端发 SYN 网络延迟→以为丢了→重发→旧 SYN 后到→服务器直接建连但客户端不要了 |
| "TCP 和 UDP 区别" | TCP 可靠有序（握手+重传+拥塞控制），UDP 不可靠但快。HTTP3 基于 QUIC(UDP) 自实现了可靠性和多路复用 |

## 别踩的坑

1. **只讲网络不讲渲染** —— 一半人讲到 HTTP 响应就停了。面试官心里完整链路到"屏幕像素"
2. **DOM 和 CSS 解析关系说错** —— 两者并行，但渲染树必须等 CSSOM。CSS 下载不阻塞 DOM 解析
3. **"script 阻塞一切"太绝对** —— 普通 script 阻塞解析；defer 等 DOM 完成再执行；async 下载完就执行

## 相关阅读

- [URL 到页面 知识文档](../../浏览器/url-to-page.md)
- [渲染流程](../../浏览器/render-process.md)
- [DNS / CDN](../../网络/dns-cdn.md)

## 更新记录

- 2026-07-10：重写（30秒/2分钟/追问预判/易错点 标准格式）

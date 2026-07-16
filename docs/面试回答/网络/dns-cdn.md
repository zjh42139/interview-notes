---
title: DNS / CDN 面试回答
description: 面试中如何回答 DNS 解析过程和 CDN 加速原理
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-15
updated: 2026-07-15
reviewed: null
tags:
  - 网络
  - DNS
  - CDN
  - 面试回答
---

# DNS / CDN 面试回答

> URL 到页面展示的前两步。面试官要的是完整链路，不是背名词。

## Q1: DNS 解析过程是怎样的？

### 30 秒版本

"DNS 将域名解析为 IP 地址。从浏览器缓存→系统 hosts→本地 DNS。浏览器向本地 DNS 发起**递归查询**——本地 DNS 服务器帮你跑完全程，你只等结果。本地 DNS 服务器向上逐级查询时用的是**迭代查询**——根域名服务器 → 顶级域名服务器 → 权威 DNS，每级告诉它下一跳的地址。"

### 2 分钟版本

**完整查询链路（假设访问 www.example.com）**：

1. 浏览器 DNS 缓存——最快，chrome://net-internals 可看
2. 操作系统 hosts 文件——本地覆盖
3. 本地 DNS 服务器（ISP/路由器）——开始真正的网络查询
4. 根域名服务器——返回 .com 顶级域名的 DNS 地址
5. .com 顶级域名服务器——返回 example.com 的权威 DNS 地址
6. example.com 权威 DNS——返回 www.example.com 的 IP

**递归 vs 迭代**：步骤 3→4→5→6 是迭代——每步返回下一跳地址。但浏览器到本地 DNS 是递归——本地 DNS 帮你跑完全程，你只等结果。

**DNS 优化**：
- `dns-prefetch`：提前解析第三方域名——`&lt;link rel="dns-prefetch" href="//api.example.com">`
- CDN 用 CNAME 把域名指向 CDN 的域名，由 CDN 的 DNS 系统返回最近的节点 IP
- 浏览器限制：Chrome 缓存 DNS 记录约 1 分钟，失败重试有指数退避

## Q2: CDN 的工作原理是什么？

### 30 秒版本

"CDN 把静态资源分发到全球边缘节点——用户访问时 DNS 智能解析返回离用户最近的节点 IP。命中缓存直接返回——延迟从 100ms 降到 5ms。未命中回源站拉取——第一次慢后续快。CDN 是 HTTP 缓存的物理延伸：Cache-Control 控制时长，CDN 控制距离。"

### 2 分钟版本

**CDN 的三个核心技术**：

1. **DNS 智能解析**：用户在北京访问→DNS 返回北京节点 IP——而非源站（上海）IP。原理是 CNAME + GeoDNS——域名 CNAME 到 CDN 域名，CDN 的 DNS 根据请求来源 IP 返回最近节点。

2. **边缘缓存**：CDN 节点存一份资源副本——用户请求到达边缘节点，命中缓存直接返回（~5ms vs 回源 ~30ms）。没命中就回源→缓存→后续请求命中。缓存 TTL 由源站的 Cache-Control 决定。

3. **内容刷新/预热**：发版后主动通知 CDN 清除旧缓存（刷新）或提前拉取新资源到边缘节点（预热）。

**面试话术**："CDN 是 HTTP 缓存的物理延伸——Cache-Control 控制时间维度（缓存多久），CDN 控制空间维度（离用户多远）。配合 hash 文件名实现永久缓存 + CDN 全球分发——用户访问静态资源几乎零延迟。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "DNS 查询用 TCP 还是 UDP" | 默认 UDP（快、轻量）。响应超过 512 字节或区域传送时用 TCP |
| "CDN 回源是什么" | 边缘节点没缓存→向源站拉取→缓存到边缘→返回用户。用户感觉到的只有第一次慢 |
| "怎么保证 CDN 缓存和源站一致" | 文件名 hash 是最可靠的方式——内容变了文件名就变了，旧缓存不影响。不能 hash 的资源用 CDN 刷新/预热 |

## 别踩的坑

1. **DNS 解析不完全是递归** —— 浏览器到本地 DNS 是递归，本地 DNS 向上查询是迭代。面试说"全部递归"会被追问。
2. **CDN 缓存了 HTML 入口文件** —— HTML 用 no-cache 协商缓存，不能强缓存。否则用户看到的是旧版本页面。

## 相关阅读

- [HTTP / HTTPS](./http-https.md)
- [HTTP 缓存](../../网络/http-cache.md)
- [URL 到页面展示](../../浏览器/url-to-page.md)

## 更新记录

- 2026-07-15：新建（DNS 递归+迭代 / CDN 三技术 / 缓存一致性问题）

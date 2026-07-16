---
title: 网络传输优化
description: 资源提示（preload/prefetch/preconnect/dns-prefetch）、压缩（Gzip/Brotli）、CDN 部署策略、HTTP2 多路复用对打包策略的影响
category: 性能优化
type: mechanism
score: 78
difficulty: 高级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-16
tags:
  - 网络优化
  - preload
  - prefetch
  - Brotli
  - CDN
  - HTTP2
---

# 网络传输优化

> ⭐⭐⭐⭐｜难度：高级｜"首屏优化"的自然延伸

**面试官问完首屏优化，一定会往下追：资源怎么加载更快？这和打包优化有什么区别？**

## 一句话总结

**网络传输优化三件事——让浏览器提前建立连接（preconnect/dns-prefetch）、提前下载关键资源（preload/prefetch）、让传输体积更小（压缩+CDN+HTTP2 多路复用）。**

## 核心机制

### Resource Hints——提前告诉浏览器要做什么

```html
<!-- DNS 预解析：提前做 DNS 查询 -->
<link rel="dns-prefetch" href="https://api.example.com">

<!-- 预连接：DNS + TCP + TLS 全做完，适合确定会用的第三方域 -->
<link rel="preconnect" href="https://cdn.example.com">

<!-- 预加载：当前页面确定会用的关键资源，高优先级下载 -->
<link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>

<!-- 预获取：下个页面可能用到的资源，低优先级、空闲时下载 -->
<link rel="prefetch" href="/page2.js">
```

| 类型 | 做什么 | 优先级 | 适用场景 |
|------|--------|:---:|---------|
| `dns-prefetch` | 仅 DNS 解析 | 低 | 不确定会不会用的第三方域名 |
| `preconnect` | DNS + TCP + TLS | 中 | 确定会用但当前没在请求的域名（CDN、API） |
| `preload` | 强制提前下载 | **高** | 首屏关键资源（字体、首屏 CSS/JS、Hero 图片） |
| `prefetch` | 空闲时下载 | 低 | 下一页/后续路由的 JS bundle |

**preload 使用注意**：
- 必须指定 `as` 属性（script/style/font/image），否则浏览器不知道按什么策略下载
- 字体文件必须加 `crossorigin`，即使同域
- 不要 preload 所有资源——只 preload 首屏关键路径上的一定会用的资源，否则浪费带宽

### 压缩——让文件变小

**Gzip**：兼容性最好，几乎所有服务器/CDN 默认开启。压缩比约 70%。

**Brotli**：Google 开发的现代压缩算法，比 Gzip 小 20-30%。所有现代浏览器都支持。HTTPS 下自动可用。

```nginx
# Nginx 开启 Brotli（需 brotli 模块）
brotli on;
brotli_comp_level 6;         # 压缩级别 0-11，6 是性价比最优
brotli_types text/plain text/css application/javascript image/svg+xml;
```

**压缩策略**：文本类资源（HTML/CSS/JS/SVG/JSON）用 Brotli；图片/视频不要压缩（它们本身已压缩，再压反而变慢）。

### CDN 部署策略

- **静态资源走 CDN**（JS/CSS/图片/字体），动态 API 不走 CDN
- **内容哈希文件名**（`app.a1b2c3.js`）+ 强缓存 = 永久缓存，变更即失效
- **多区域部署**：国内用阿里云/腾讯云 CDN，海外用 Cloudflare

### HTTP2 多路复用——改变了打包策略

HTTP/1.1 的瓶颈：每个 TCP 连接同时只能处理 6-8 个请求（浏览器限制）。所以以前会做**资源合并**——把所有 JS 打成一个 vendor.js、所有 CSS 拼成一个 app.css。

HTTP/2 支持**多路复用**——一个 TCP 连接可以并发传多个文件：

- **不再需要过度合并**：拆成多个小文件反而利用多路复用并行加载
- **但也不要拆太碎**：每个文件仍有开销，按路由拆分 code-split 即可
- **CSS/JS 不用再合并成一个大文件**，Vite/Rollup 默认的 code split 策略就是为 HTTP2 设计的

## 项目实战

Vue3 后台管理系统 Nginx 配置：

```nginx
# 静态资源缓存 + 压缩
location /assets/ {
  expires 1y;
  add_header Cache-Control "public, immutable";
  brotli on;
  gzip on;
}

# HTML 入口不走强缓存
location / {
  add_header Cache-Control "no-cache";
  brotli on;
}
```

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "preload 和 prefetch 区别" | 追问"什么时候用哪个"——首屏关键资源 vs 下一页 |
| "你们怎么做首屏优化" | 追问"除了代码层面，网络传输做了什么" |
| "HTTP2 对前端有什么影响" | 追问"为什么不合并文件了"——多路复用 |

## 相关阅读

- [首屏优化](./first-screen.md)
- [打包优化](./bundle-optimization.md)
- [HTTP2 / HTTP3](../网络/http2-http3.md)
- [DNS / CDN](../网络/dns-cdn.md)

## 更新记录

- 2026-07-16：新建——Resource Hints + 压缩 + CDN + HTTP2 影响

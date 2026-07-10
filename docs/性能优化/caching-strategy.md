---
title: 缓存策略体系
description: 前端缓存的全景图——HTTP 缓存、Memory Cache、Service Worker 缓存、CDN 缓存，以及面试中"你项目里怎么做缓存的"的综合回答
category: 性能优化
type: mechanism
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-10
updated: 2026-07-10
reviewed: null
tags:
  - 缓存
  - HTTP缓存
  - Service Worker
  - CDN
  - Memory Cache
---

# 缓存策略体系

> ⭐⭐⭐⭐⭐｜难度：高级｜项目：★★★★★

## 一句话总结

**前端缓存不是只有"强缓存和协商缓存"——那是 HTTP 层面。完整的缓存体系从上到下包括：Service Worker（应用层，最顶层）、Memory Cache（浏览器内存，页面内有效）、HTTP 缓存（磁盘，跨页面）、CDN 缓存（边缘节点，加速分发）。面试中当被问到"你项目里怎么做缓存"，需要把这四层串起来讲。**

## 缓存四层体系

```
┌─────────────────────────────┐
│    Service Worker Cache      │  ← JS 完全控制，离线可用
│    (Cache API / Workbox)     │     优先级最高——拦截请求直接返回
├─────────────────────────────┤
│    Memory Cache (内存)       │  ← 页面关闭即失效，容量最小
│    存储：JS/CSS/图片解码后   │     速度最快——读取为 0ms
├─────────────────────────────┤
│    HTTP 缓存 (磁盘)          │  ← 跨页面持久化，容量较大
│    强缓存 + 协商缓存         │     多数静态资源的主力缓存
├─────────────────────────────┤
│    CDN 缓存 (边缘节点)       │  ← 离用户最近的缓存层
│    命中则不到源服务器        │     减少延迟 + 回源带宽
└─────────────────────────────┘
```

## 第一层：HTTP 缓存（磁盘）

详见 [浏览器缓存](../浏览器/cache.md)，这里补充面试中容易漏的点：

### 缓存决策树

```
这个资源应该怎么缓存？

  变化频率高？（API 响应）
    → no-cache 协商缓存——每次都问服务器
    → 或 no-store——完全不缓存（交易类接口）

  变化频率低 + 有版本号？（app.a1b2c3.js）
    → max-age=31536000（一年）——强缓存
    → 文件名变了就是新资源，旧缓存自动失效

  变化频率低 + 无版本号？（logo.png）
    → max-age=86400 + ETag/Last-Modified——短期强缓存 + 协商兜底

  HTML 入口文件？
    → no-cache 或 max-age=0——必须每次验证
    → 否则发版后 JS/CSS 已更新但 HTML 还是旧的 → 白屏
```

### 实际项目的缓存配置（Nginx）

```nginx
# HTML：每次验证
location / {
    add_header Cache-Control "no-cache, must-revalidate";
}

# 带 hash 的静态资源：永久缓存
location ~* \.(js|css)$ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}

# 图片/字体：短期缓存 + 协商
location ~* \.(png|jpg|svg|woff2)$ {
    add_header Cache-Control "public, max-age=86400";
}
```

## 第二层：Memory Cache

浏览器自动管理，你无法用 JS 直接控制，但可以**利用它的规律**：

| 特征 | 说明 |
|------|------|
| 存储位置 | 浏览器内存（RAM） |
| 生命周期 | 页面关闭即释放 |
| 容量 | 几 MB～十几 MB，因浏览器和设备而异 |
| 命中条件 | 同一页面内重复请求同一资源（如图片重复使用） |
| prefetch/preload | `<link rel="preload">` 的资源会进入 Memory Cache |

**面试要点**：Memory Cache 是浏览器实现细节，不是规范。不同浏览器行为不完全一致。面试时说"第一层是 Service Worker，第二层是 Memory Cache"就够了——不要过度展开，除非面试官追问。

## 第三层：Service Worker 缓存

这是唯一由前端 JS 完全控制的缓存层：

```javascript
// 安装阶段——预缓存关键资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('v1').then(cache =>
      cache.addAll(['/', '/app.js', '/app.css'])
    )
  )
})

// 请求拦截——缓存优先策略
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      // 缓存命中直接返回，否则走网络
      return cached || fetch(event.request).then(response => {
        // 网络响应存入缓存（运行时缓存）
        return caches.open('v1').then(cache => {
          cache.put(event.request, response.clone())
          return response
        })
      })
    })
  )
})
```

### 三种缓存策略

| 策略 | 逻辑 | 适用场景 |
|------|------|---------|
| **Cache First** | 先查缓存，没有再发网络 | 不常变的资源（app shell、字体） |
| **Network First** | 先发网络，失败用缓存 | 需要尽量新的数据（API、timeline） |
| **Stale-While-Revalidate** | 返回缓存的同时后台更新 | 非关键资源——效果快 + 下次拿到新的 |

## 第四层：CDN 缓存

CDN 是分布式边缘缓存——用户请求先到最近的 CDN 节点，命中则直接返回，不回到你的源服务器。

```
用户（深圳）→ CDN 边缘节点（深圳）→ [缓存命中] → 直接返回（5ms）
                                  → [缓存未命中] → 回源到你的服务器（北京，30ms+）
```

**CDN 缓存 key 的影响**：CDN 通常以完整 URL 作为缓存 key。`?v=1` 和 `?v=2` 是两个不同的缓存条目。这就是为什么文件名 hash 比 query string 更可靠——有些 CDN 默认忽略 query string。

## 项目实战

### 后台管理系统缓存策略（综合案例）

1. **HTML 入口**：`Cache-Control: no-cache`——每次验证。nginx 下发 `<meta>` 标签无法控制缓存，必须 HTTP 头设置
2. **JS/CSS（带 hash）**：`max-age=31536000, immutable`——文件名变了就是新版本。和每次发版的 HTML 配合，做到无缝更新
3. **用户头像/Logo**：`max-age=86400` + ETag——一天内强缓存。用户换头像可能不立即生效，但可接受
4. **API 响应**：GET 列表接口 `max-age=10`（10 秒短缓存，减轻列表页频繁切换的请求压力）。POST/PUT/DELETE 不缓存
5. **大数据字典（省市区）**：Service Worker 预缓存 + 版本号管理。数据不常变但体积大，SW 缓存避免每次加载

## 易错点

1. **HTML 设了强缓存** —— 最常见的缓存事故。发版后 JS/CSS 都更新了但 HTML 还是旧的 → 引用不到新资源 → 白屏。这个在面试里是经典"踩坑题"
2. **只用 max-age 不用 immutable** —— 没有 immutable，浏览器在强缓存有效期内仍可能发条件请求验证。加 `immutable` 明确告诉浏览器"过期前绝对不变"
3. **Service Worker 缓存不设版本号** —— SW 文件变了浏览器才会触发更新检测。但 SW 里 `caches.open('v1')` 如果永远 v1——旧缓存永远不被清理。需要版本管理 + 旧版本清理逻辑
4. **CDN 缓存没考虑 purge 策略** —— 紧急修复上线后 CDN 还有旧缓存，用户看到的仍然是旧版本。CDN 的缓存刷新（purge）机制必须可用

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "你项目里怎么做缓存的" | 追问 URL 换了但 HTML 没换——怎么保证用户拿到最新（回答：HTML no-cache + 静态资源 hash 文件名） |
| "强缓存和协商缓存哪个优先" | 追问为什么 HTML 要 no-cache（发版后用户立刻看到新版本） |
| "Service Worker 缓存和 HTTP 缓存什么关系" | 追问 SW 缓存优先级更高——SW 拦截在 HTTP 缓存之前 |
| "CDN 缓存怎么更新" | 追问 CDN purge + 文件名 hash 兜底——两种手段配合 |

## 相关阅读

- [浏览器缓存](../浏览器/cache.md)
- [Service Worker](../浏览器/service-worker.md)
- [首屏优化](./first-screen.md)
- [打包优化](./bundle-optimization.md)

## 更新记录

- 2026-07-10：新建（四层缓存体系 + 缓存决策树 + Nginx 配置 + SW 三种策略 + 项目案例）

---
title: 浏览器缓存 面试回答
description: 浏览器缓存的 30 秒速答和 2 分钟深度回答
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-10
updated: 2026-07-10
---

# 浏览器缓存 面试回答

> 对应题库：[面试题库/浏览器 Q5](../../面试题库/浏览器.md)

## 30 秒版

浏览器缓存分两大类——强缓存和协商缓存。强缓存命中时浏览器不发请求，直接拿本地缓存，状态码返回 200，速度最快。它由 Cache-Control（相对时间）和 Expires（绝对时间）控制。协商缓存是强缓存过期后，浏览器发请求给服务器确认文件有没有变——没变就返回 304 继续用缓存，变了就返回 200 带新文件。它由 ETag（内容哈希）或 Last-Modified（修改时间）控制。

---

## 2 分钟版

**第一：强缓存——不发请求的缓存。**

Cache-Control 是现代标准——`max-age=3600` 表示 3600 秒内直接用缓存。还有几个重要指令：`no-cache` 不是"不缓存"，而是"每次都要去服务器确认一次"——走协商缓存。`no-store` 才是真正的"不缓存"，每次都重新请求。`public`——CDN 也可以缓存，`private`——只有浏览器可以缓存。`immutable`——告诉浏览器这个资源永远不会变，即使点了刷新也别发请求确认。

Expires 是旧方案——`Expires: Tue, 19 Jan 2038 03:14:07 GMT`，问题在客户端时间不准，所以被 Cache-Control 替代。两者同时存在时 Cache-Control 优先。

**第二：协商缓存——发请求但可能不下载。**

强缓存过期后走协商缓存。浏览器发请求带上两个条件头：`If-None-Match: "abc123"`（对应 ETag）和 `If-Modified-Since: Tue, 19 Jan 2038...`（对应 Last-Modified）。服务器对比——ETag 匹配 → 文件没变 → 返回 304 空响应体，浏览器继续用本地缓存。Last-Modified 匹配也一样 304。都没匹配 → 文件变了 → 返回 200 + 新文件。

ETag 比 Last-Modified 更精确——Last-Modified 只能精确到秒，如果文件在 1 秒内改了两次，Last-Modified 检测不到。而且 ETag 基于文件内容，改了就是新值。

**第三：实际的缓存策略。**

现代前端项目的标准做法——index.html 用 `Cache-Control: no-cache`（每次校验，确保入口文件最新），JS/CSS/图片用 `Cache-Control: max-age=31536000, immutable`（文件名带 hash，内容变了 hash 就变、URL 就不同、不存在"更新"的问题，可以永不过期）。这套策略解决了"到底多长叫合理"的问题——文件名 hash 让"内容变化"和"URL 变化"一一对应，不再需要猜缓存时间。

**第四：缓存位置。**

200 from memory cache——内存缓存，速度最快，关闭 Tab 就没了。200 from disk cache——磁盘缓存，关了再开还在。304 Not Modified——协商缓存命中。Service Worker——可以完全控制缓存策略，优先级最高。

---

## 追问预判

| 追问 | 回应要点 |
|------|----------|
| "no-cache 和 no-store 的区别" | no-cache 不是不缓存——它是"每次都验证"，本质走协商缓存。no-store 才是不缓存——每次都重新下载 |
| "为什么不用 Last-Modified 只用 ETag" | ETag 更精确——Last-Modified 只到秒级，一秒内多次修改检测不到。但 ETag 消耗服务器资源（需要计算哈希），大文件场景两者配合——Last-Modified 做预检，匹配才继续比 ETag |
| "刷新页面时缓存行为" | F5（普通刷新）会发请求验证——跳过强缓存走协商缓存。Ctrl+F5（强制刷新）彻底不走缓存——请求头带 `Cache-Control: no-cache` 和 `Pragma: no-cache` |

---

## 别踩的坑

- "no-cache 是不缓存"——不是。看到 no-cache 就说不缓存直接挂——面试官等的就是纠正你这个点
- "max-age 过期就一定重新下载"——不是。过期只是"需要验证"，服务器返回 304 就不下载——继续用旧文件
- "cdn 缓存和浏览器缓存是两回事"——浏览器缓存看 Cache-Control，CDN 缓存有自己的一套策略。当资源设置了 public 时 CDN 才会缓存

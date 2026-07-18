---
title: HTTP 请求方法 面试回答
description: 面试中如何回答 GET/POST 区别、HTTP 方法语义与幂等性——30 秒速答 + 2 分钟详解 + 追问预判
category: 网络
type: interview
difficulty: 初级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-18
updated: 2026-07-18
tags:
  - HTTP
  - GET
  - POST
  - 幂等性
  - RESTful
  - 面试回答
---

# HTTP 请求方法 面试回答

## Q: GET 和 POST 有什么区别？HTTP 方法的语义和幂等性怎么理解？

### 30 秒版本

"GET 和 POST 的本质区别不是参数位置或长度限制——而是语义和幂等性。GET 表示'获取资源'：安全（不改变服务器状态）、幂等（调一次和调十次结果一样）、可缓存。POST 表示'创建/提交'：不安全、不幂等（调一次创建一条数据）、不可缓存。网上传的'GET URL 有 2KB 限制'是老旧 IE 浏览器的实现限制，RFC 协议没有规定 URL 最大长度——实际上现代浏览器支持远超此值。另外 PUT 是全量替换且幂等、PATCH 是部分更新不保证幂等、DELETE 是删除且幂等。选 HTTP 方法看两个维度：是否安全（只读还是改数据）、是否幂等（重复执行结果是否一致）。RESTful 设计核心原则：动词表示操作、名词复数表示资源、状态码传递结果——`GET /api/users` 不是 `POST /api/getUserList`。"

### 2 分钟版本

"分三块展开：GET vs POST 的完整对比、幂等性和安全性的概念及为什么重要、RESTful 方法选型和常见面试追问。

**一、GET vs POST——远超参数位置的差异。**

从 8 个维度做完整对比。参数位置：GET 放 URL query string（`?key=val`），POST 放请求体（body）。缓存：GET 可被浏览器/CDN 缓存（`Cache-Control` 头控制），POST 默认不可缓存（RFC 7234 规定 POST 响应只有在包含明确 freshness info 时才可缓存，实际极少用）。书签/分享：GET URL 可收藏、可复制分享、可被搜索引擎爬取索引；POST 不可收藏。后退/刷新行为：浏览器对 GET 静默重新发送请求，对 POST 弹出"确认重新提交"提示——因为 POST 不幂等，重复提交有副作用。

安全性（数据暴露层面）：HTTPS 下 URL 路径和请求体都被 TLS 加密，网络嗅探层面安全等级完全一样。POST "更安全"的唯一理由是参数不在浏览器历史记录、服务器访问日志（access log）、Referer 请求头中——所以密码/token 确实不该放 URL，理由不是加密不够而是持久化泄露风险。长度限制：RFC 7230 未规定 URL 最大长度。老 IE 约 2083 字符（约 2KB），现代浏览器 Chrome/Edge 约 2MB URL 上限（取决于操作系统和网络栈）。真正的瓶颈在服务器端：Nginx 默认 `large_client_header_buffers` 限制请求头 8KB，超过返回 414 URI Too Long。GET body：RFC 7231 说"GET 请求的 payload 没有定义的语义"，规范不建议但没禁止——部分代理和浏览器确实会丢弃 GET body，不要依赖它传数据。

**二、幂等性和安全性——HTTP 方法分类的两个核心维度。**

幂等（Idempotent）：同一个请求执行一次和执行多次，服务器最终状态相同。GET 查十次数据不变——幂等。PUT "把用户 1 的邮箱设为 zhang@test.com"——发一次和发十次结果都是 zhang@test.com，幂等。DELETE 第一次删返回 204，再删返回 404——资源不存在的状态是确定的，幂等（状态码可以不同，只要最终状态一致）。POST 每次创建一条新数据——调十次创建十条，不幂等。PATCH 看语义："设置邮箱为 xxx" 幂等，"余额加 100 元" 不幂等——所以 PATCH 标为"不保证幂等"。

安全（Safe）：只读不改。GET/HEAD/OPTIONS 是安全的，POST/PUT/PATCH/DELETE 不是。这两个概念为什么重要：幂等性决定出错重试策略——GET/PUT/DELETE 请求超时可以安全重试，POST 重试需配合幂等键去重。安全性决定预加载行为——浏览器可以安全预取 GET 链接（`<link rel="prefetch">`），绝不会预取 POST 表单。

**三、RESTful 方法选型——用规范的方式设计 API。**

核心原则：`/users`（名词复数）是资源集合，`/users/1` 是单个资源。GET `/users` 查列表（200 + JSON 数组），POST `/users` 新增（201 + Location 头），GET `/users/1` 查详情，PUT `/users/1` 全量替换（传整个对象），PATCH `/users/1` 部分更新（只传改的字段），DELETE `/users/1` 删除（204 无返回体）。嵌套关系用 URL 路径：`/users/1/orders`——用户 1 的订单。

实际选择：90% 更新场景用 PATCH——用户只改了邮箱传 `{ "email": "new@test.com" }` 即可，不需要 PUT 把整个 profile 传上来。PATCH 请求体格式没有强制规范——可以是 JSON Merge Patch（RFC 7396，直接传要覆盖的字段，`null` 表示删除字段），也可以是 JSON Patch（RFC 6902，`[{ "op": "replace", "path": "/email", "value": "new" }]` 操作数组，支持 add/remove/replace/move/copy/test 操作）。面试提到两种 PATCH 格式会加分。

OPTIONS 方法：CORS 预检请求。跨域且非简单请求（用了 PUT/DELETE 或 Content-Type: application/json 或有自定义请求头）时，浏览器自动先发 OPTIONS 查询服务器"允许哪些方法/头/源"，服务器返回 `Access-Control-Allow-Methods` 等头部——通过后才发真正的请求。简单请求的三个条件：方法限 GET/HEAD/POST；Content-Type 限 `text/plain` / `multipart/form-data` / `application/x-www-form-urlencoded`；无自定义头。现代前后端分离项目基本都不是简单请求——所以 OPTIONS 很常见。"

### 追问预判

| 面试官追问 | 你的应答要点 |
|-----------|---------|
| "PUT 和 PATCH 到底怎么选" | PUT 是"不管之前什么样，现在就是这样"——全量替换、幂等。PATCH 是"只改这些字段"——增量更新、不保证幂等。选择：客户端拥有资源的完整最新表示——用 PUT（先 GET 拿到数据、修改后 PUT 回传，符合幂等语义）。只改了部分字段——用 PATCH，节省带宽。注意 PATCH 的语义由操作内容决定：`{ "email": "new" }` 幂等（替换就是替换），`{ "op": "increment", "field": "balance", "value": 100 }` 不幂等（每次加 100）。后端实现时要根据业务语义决定，不要对 PATCH 操作做"一定是幂等"的假设 |
| "POST 创建和 PUT 创建有什么区别" | PUT 创建——客户端指定 URI：`PUT /users/zhang { ... }`，客户端说"在这个位置放这个资源"。POST 创建——服务器分配 URI：`POST /users { ... }`，服务器返回 `201 Created` + `Location: /users/42`。所以 PUT 幂等——同 URI 放两次是同一份数据；POST 不幂等——每次给新 ID。这也就是 GitHub API 设计：`PUT /repos/:owner/:repo` 创建仓库（仓库名客户端决定），`POST /repos/:owner/:repo/issues` 创建 issue（issue 号服务器分配） |
| "OPTIONS 预检什么情况下不会发" | 简单请求不触发预检。三个条件 AND 关系：方法限 GET/HEAD/POST；Content-Type 限 `text/plain`/`multipart/form-data`/`application/x-www-form-urlencoded`；无自定义请求头（如 `Authorization`/`X-Requested-With` 都不行）。即用了 `Content-Type: application/json` 就不是简单请求——自动触发预检。现代前后端分离中几乎所有 AJAX 都带 `Authorization` header 或用 JSON body——所以 OPTIONS 是常态。面试时不仅要解释 OPTIONS 是预检请求，还要准确说出简单请求的三条件——这证明你真的理解 CORS 机制 |

## 别踩的坑

1. **"GET 请求有 2KB 的长度限制"——把浏览器实现当协议规范。** RFC 没有规定 URL 最大长度。老 IE 约 2KB 是历史包袱。现代浏览器上限远超此值，真正的瓶颈在服务器：Nginx 默认 8KB 请求头限制，超出返回 414。不要把大量数据塞 GET URL——用 POST body。也不要说"GET 不能有 body"作为绝对真理——规范说"没有定义的语义、不推荐"而非"禁止"。
2. **"POST 比 GET 安全因为参数在请求体里"——HTTPS 下没区别。** TLS 加密整个 HTTP 报文——URL 路径和请求体都在加密信道里，抓包都看不到。POST 的唯一安全优势是参数不进入浏览器历史/服务器 access log/Referer 头——所以密码/token 不放 URL，原因不是"HTTPS 不加密 URL"而是"日志和历史的持久化泄露"。面试时说"POST 更安全"如果不解释为什么会被追问到露馅。
3. **"RESTful 是标准必须遵守"——它是架构风格不是协议规范。** REST 是 Roy Fielding 博士论文提出的约束风格，不像 RFC 那样是行业标准。但面试中问 API 设计答不上 RESTful 原则（资源用名词复数、HTTP 动词表示操作、状态码传递结果）会被认为基础不扎实——因为它已是业界约定俗成的实践。正确态度：理解 RESTful 原则，但知道它不是强制规范。

## 相关阅读

- [HTTP 请求方法 知识文档](../../网络/http-methods.md)
- [HTTP / HTTPS](./http-https.md)
- [CORS](./cors.md)
- [HTTP2 / HTTP3](./http2-http3.md)
- [面试题库：网络](../../面试题库/网络.md)

## 更新记录

- 2026-07-18：新建（30秒/2分钟/追问预判/别踩坑 标准格式）

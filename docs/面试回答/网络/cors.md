---
title: 跨域 CORS 面试回答
description: 跨域和 CORS 的 30 秒速答和 2 分钟深度回答
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-10
updated: 2026-07-10
---

# 跨域 / CORS 面试回答

> 对应题库：[面试题库/网络](../../面试题库/网络.md)

## 30 秒版

跨域是浏览器的同源策略阻止了一个源的 JS 访问另一个源的资源。CORS 就是解决这个问题的标准方案——服务端设置 `Access-Control-Allow-Origin` 告诉浏览器"允许哪些源访问我"。复杂请求（非 GET/POST 或有自定义头）浏览器会先发一个 OPTIONS 预检请求，确认服务端允许后才发真正的请求。注意：跨域请求发出去了、服务端也处理了、响应也返回了——浏览器只是不让 JS 读响应。

---

## 2 分钟版

**第一：同源策略和跨域的本质。**

同源 = 协议 + 域名 + 端口完全相同。同源策略限制三件事：跨域 JS 不能读另一个源的 DOM、不能读 Cookie/Storage、不能读 AJAX 响应。但 `<script>`、`<img>`、`<link>` 这些标签不受同源限制——它们的 src/href 可以跨域加载。JSONP 就是利用 `<script>` 不受限——动态创建 script 标签，服务端返回一段调用指定回调函数的 JS。

**第二：CORS 的三种场景。**

简单请求——GET/HEAD/POST + 三种 Content-Type 之一（`application/x-www-form-urlencoded`、`multipart/form-data`、`text/plain`）+ 无自定义头。浏览器直接发请求，检查响应头 `Access-Control-Allow-Origin`。预检请求——DELETE/PUT 方法或带自定义头。浏览器先发 OPTIONS 请求"问一下"服务端允不允许，服务端返回 `Access-Control-Allow-Methods: DELETE, PUT` 和 `Access-Control-Allow-Headers: X-Custom-Token`，浏览器收到允许后才发真正的请求。携带凭证——需要 `withCredentials: true`，服务端必须返回 `Access-Control-Allow-Credentials: true` 且 origin 不能用 `*`。

**第三：跨域的其他方案。**

JSONP：只支持 GET、没有错误处理、有 XSS 风险——现代项目基本不用。代理：开发环境 Vite 的 `server.proxy`，生产 Nginx 反向代理——请求发给同源，代理转发到真实服务端。PostMessage：iframe 跨域通信的标准——发送方指定 targetOrigin，接收方校验 event.origin。WebSocket 不受同源限制——它有自己的安全模型。

**第四：一定要强调的陷阱。**

CORS 请求发出去了！服务端收到并处理了！只是浏览器阻止 JS 读取响应！这正是 CSRF 能成功的前提。攻击者不能读响应，但请求本身已经造成了副作用——转账已经完成、密码已经改了。

---

## 追问预判

| 追问 | 回应要点 |
|------|----------|
| "OPTIONS 预检请求可以缓存吗" | 可以。`Access-Control-Max-Age: 3600` 让浏览器缓存预检结果 1 小时——这段时间内同样类型的请求不再发预检。Chrome 最大缓存 2 小时 |
| "JSONP 为什么只能 GET" | 因为 `<script src="...">` 只能发 GET 请求——它不是一个 AJAX 调用，只是浏览器加载 script 资源。POST/PUT/DELETE 无法用 script 标签模拟 |
| "nginx 代理为什么能解决跨域" | 因为跨域是浏览器的限制——不是服务端的限制。Nginx 把 `/api` 反向代理到真实服务器，浏览器眼里请求一直是发给同源的 |

---

## 别踩的坑

- "跨域是服务端不让访问"——不是。浏览器和服务端都能看到请求，限制只发生在浏览器。用 Postman/curl 从来不会遇到跨域问题，因为它们不是浏览器
- "Access-Control-Allow-Origin: * 能通杀"——能，但不能配合 withCredentials。带 Cookie 的跨域请求必须指定具体 origin
- "忘了 OPTIONS 请求"——接口加了跨域头还是 404/405——检查服务端是否处理了 OPTIONS 方法的请求

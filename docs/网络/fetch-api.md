---
title: Fetch API 深度解析
description: fetch vs XHR、Request/Response 对象、AbortController 中断、Stream 读取、超时实现、错误处理（fetch 不 reject 非 200）、与 axios 对比
category: 网络
type: api-reference
score: 72
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-16
tags:
  - Fetch
  - XHR
  - AbortController
  - Stream
  - axios
---

# Fetch API 深度解析

> ⭐⭐⭐⭐｜难度：中级｜必须知道 fetch 的坑

**fetch 是现代浏览器内置的请求 API，比 XHR 更简洁，但有三个致命陷阱面试必问：不 reject 非 200、不支持超时、中断要用 AbortController。**

## 一句话总结

**fetch 是浏览器原生请求 API——Promise 风格、流式响应、更现代的架构。但默认不 reject 非 200 状态码、不支持超时、需手动处理 cookie。axios 在这些方面做了封装。**

## fetch vs XHR

| 维度 | fetch | XHR |
|------|-------|-----|
| API 风格 | Promise 链式调用 | 回调 + 事件监听 |
| 语法简洁度 | `fetch(url).then(r => r.json())` | 需 `new XMLHttpRequest()` + `onload` + `onerror` |
| 请求/响应流 | 内置 Request/Response 对象 | `xhr.responseText` |
| 上传进度 | **不支持**（需 ReadableStream 变通） | `xhr.upload.onprogress` |
| 下载进度 | `response.body.getReader()` 流式读取 | `xhr.onprogress` |
| 请求取消 | AbortController | `xhr.abort()` |
| Cookie | 默认 `same-origin`（同源请求发送 cookie，跨域请求不发送） | 默认发送同源 cookie，跨域需 `withCredentials = true` |
| 超时 | **不支持**（需 AbortController + setTimeout） | `xhr.timeout` |
| 非 200 处理 | **不 reject**，需手动 `if (!res.ok) throw` | `onload` + 手动判断 `xhr.status` |

**结论**：日常开发推荐 axios（封装了超时、自动 JSON 解析、拦截器），但也必须会手写 fetch——面试手写题常考基于 fetch + AbortController 实现超时和请求取消。

## 核心用法

### Request / Response 对象

```javascript
// Request 对象：可配置 method/headers/body/signal 等
const request = new Request('/api/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: 1 }),
});

// fetch 接受 URL 字符串或 Request 对象
const response = await fetch(request);

// Response 对象：status/ok/headers/body
console.log(response.status);   // 200
console.log(response.ok);       // true（status 200-299）
console.log(response.headers.get('Content-Type'));

// 读取 body
const json = await response.json();        // 解析 JSON
const text = await response.text();        // 纯文本
const blob = await response.blob();        // 二进制（图片等）
const buffer = await response.arrayBuffer(); // ArrayBuffer
```

### AbortController —— 中断请求

```javascript
const controller = new AbortController();

fetch('/api/slow-endpoint', { signal: controller.signal })
  .then(res => res.json())
  .catch(err => {
    if (err.name === 'AbortError') {
      console.log('请求已被取消');
    }
  });

// 500ms 后取消
setTimeout(() => controller.abort(), 500);
```

### 超时实现——fetch 不支持超时，用 AbortController 模拟

```javascript
function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  return fetch(url, { ...options, signal: controller.signal })
    .then((response) => {
      clearTimeout(timer);
      return response;
    })
    .catch((err) => {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        throw new Error(`请求超时: ${timeout}ms`);
      }
      throw err;
    });
}
```

**注意**：AbortController.abort() 不能中止已经到达服务端的请求——它只是让浏览器停止等待响应。服务端该执行的还是会执行。

### Stream 读取——大文件下载进度

```javascript
const response = await fetch('/api/large-file');
const reader = response.body.getReader();
const contentLength = +response.headers.get('Content-Length');

let received = 0;
const chunks = [];

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  chunks.push(value);
  received += value.length;
  console.log(`进度: ${((received / contentLength) * 100).toFixed(1)}%`);
}

const blob = new Blob(chunks);
```

## 错误处理——三个陷阱

**陷阱 1：非 200 不 reject**

```javascript
// ❌ 这样写是错的——404 和 500 也走进 then
fetch('/api/user/999')
  .then(res => res.json())
  .then(data => console.log(data))    // 404 时 data 可能是错误消息的 JSON
  .catch(err => console.error(err));  // 只有网络错误才进 catch

// ✅ 正确写法
const response = await fetch('/api/user/999');
if (!response.ok) {
  throw new Error(`HTTP ${response.status}: ${response.statusText}`);
}
const data = await response.json();
```

**陷阱 2：跨域 cookie 默认不发送**

```javascript
// 需要携带 cookie 时必须显式设置
fetch('/api/user', { credentials: 'include' });
// fetch 的 credentials 默认值为 'same-origin'
// 行为：同源请求自动发 cookie，跨域请求不发 cookie
// 注意：'omit' 是同源也不发；'include' 是跨域也发
```

**陷阱 3：fetch 只有网络层错误才 reject——DNS 失败、连接超时、无法连接**

## 与 axios 对比

| 场景 | fetch | axios |
|------|-------|-------|
| 自动 JSON 转换 | 手动 `.json()` | 自动，`response.data` |
| 请求/响应拦截器 | 无，需自行封装 | 内置 `interceptors` |
| 超时 | 需 AbortController 模拟 | `timeout: 5000` |
| 上传进度 | 不支持 | `onUploadProgress` |
| 取消请求 | AbortController（较新 API） | CancelToken 或 AbortController |
| 浏览器兼容 | 现代浏览器均支持 | 支持 IE11（XHR 内核） |
| 体积 | 0（原生 API） | ~13KB gzipped |

**选择建议**：管理后台项目优先 axios（拦截器统一处理 token/错误/loading）。轻量场景或 Service Worker 中用 fetch（原生支持）。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "fetch 和 axios 有什么区别" | 追问陷阱——"fetch 404 会进 catch 吗" |
| "怎么取消 fetch 请求" | 追问 AbortController——"abort 后服务端还会执行吗" |
| "fetch 怎么实现超时" | 追问"除了 setTimeout + abort 还有别的方法吗"——没有 |

## 相关阅读

- [HTTP / HTTPS](./http-https.md)
- [CORS](./cors.md)
- [手写题：Promise 并发调度](../手写题/concurrency-control.md)

## 更新记录

- 2026-07-16：新建——fetch vs XHR + AbortController + Stream + 三个陷阱 + axios 对比

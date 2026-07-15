---
title: HTTP 请求方法
description: GET/POST/PUT/PATCH/DELETE 区别、安全性与幂等性、OPTIONS 预检请求、RESTful 动词选择
category: 网络
type: mechanism
score: 80
difficulty: 初级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-16
tags:
  - HTTP
  - GET
  - POST
  - RESTful
---

# HTTP 请求方法

> ⭐⭐⭐⭐⭐｜难度：初级｜基础但考得最多的 HTTP 题

## 一句话总结

**GET 获取资源（安全+幂等+可缓存）、POST 创建资源（不安全+不幂等+不可缓存）、PUT 全量更新（幂等）、PATCH 部分更新（不幂等）、DELETE 删除（幂等）。选方法看两个维度——是否安全（不改变服务器状态）、是否幂等（重复执行结果相同）。**

## 核心机制

### 常用方法对比

| 方法 | 语义 | 安全 | 幂等 | 请求体 | 缓存 |
|------|------|:---:|:---:|:---:|:---:|
| GET | 获取资源 | ✅ | ✅ | ❌ | ✅ |
| POST | 创建/提交 | ❌ | ❌ | ✅ | ❌ |
| PUT | 全量替换 | ❌ | ✅ | ✅ | ❌ |
| PATCH | 部分修改 | ❌ | ❌ | ✅ | ❌ |
| DELETE | 删除 | ❌ | ✅ | ❌ | ❌ |
| HEAD | 获取头部（无body） | ✅ | ✅ | ❌ | ✅ |
| OPTIONS | 查询支持的方法 | ✅ | ✅ | ❌ | ❌ |

### GET vs POST —— 经典面试题

| | GET | POST |
|---|------|------|
| 参数位置 | URL 查询字符串 | 请求体 |
| 长度限制 | URL 长度 ~2KB（浏览器限制） | 理论上无限制 |
| 缓存 | 可缓存 | 不可缓存 |
| 书签 | 可收藏 | 不可收藏 |
| 幂等性 | 是 | 否 |
| 安全性 | 参数暴露在 URL | 参数在请求体中 |
| 后退/刷新 | 无害 | 浏览器会提示重新提交 |

**面试话术**："GET 和 POST 的区别不是长度限制——那是浏览器限制不是 HTTP 协议限制。真正的区别是语义——GET 表示"获取"，POST 表示"提交"。用 GET 删数据——搜索引擎的爬虫爬一遍你的链接就把数据全删了。"

### PUT vs PATCH

```http
// PUT：全量替换——传整个对象
PUT /users/1
{ "name": "张三", "email": "zhang@example.com" }

// PATCH：部分更新——只传改动的字段
PATCH /users/1
{ "email": "zhang@example.com" }
```

PUT 的语义是"不管之前什么样，现在就是这样"——全量替换。PATCH 的语义是"只改这些字段"——部分更新。项目里 90% 的更新场景用 PATCH——用户只改了邮箱就只传邮箱字段。

### OPTIONS —— CORS 预检请求

当请求不是"简单请求"时（PUT/DELETE/Content-Type: application/json），浏览器自动先发 OPTIONS 预检——询问服务器"允许什么方法/头/源"。服务器返回 `Access-Control-Allow-Methods` 等头——通过后浏览器才发真正请求。

## 深度拓展

### RESTful API 设计原则

- **资源用名词复数**：`/users` 不是 `/getUserList`
- **HTTP 动词表示操作**：GET 查、POST 增、PUT/PATCH 改、DELETE 删
- **嵌套资源表示关系**：`/users/1/orders`——用户 1 的订单
- **状态码传递结果**：201 创建成功、204 删除成功无返回体、400 参数错误

反例：`POST /api/getUserList`——动词在 URL 里、名词用单数、所有操作都用 POST。正例：`GET /api/users`。

## 易错点

❌ **GET 请求不能有 Body** —— 规范没说不能（只是说不推荐），部分浏览器/代理可能丢掉 GET 的 Body。不要去试——用 query 参数。

❌ **POST 比 GET 安全** —— URL 参数和 HTTPS 请求体都是加密的（TLS 加密整个 HTTP 报文）。POST "更安全"只是不被浏览器历史/日志记录——对网络嗅探来说没区别。

❌ **RESTful 是新标准** —— 只是设计风格不是协议标准。不用 RESTful 不犯法——但面试问你"怎么设计 API"，答不上 RESTful 原则属于基础不扎实。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "GET 和 POST 区别" | 追问幂等性 / 安全性 |
| "PUT 和 PATCH 选哪个" | 追问幂等性——PUT 幂等、PATCH 不保证 |
| "OPTIONS 请求是什么" | 追问 CORS 预检触发条件 |

## 相关阅读

- [HTTP / HTTPS](./http-https.md)
- [CORS](./cors.md)
- [TCP](./tcp.md)

## 更新记录

- 2026-07-16：新建——方法对比表+GET vs POST+PUT vs PATCH+RESTful 设计原则

---
title: 请求重试
description: 请求失败自动重试——Axios 拦截器实现指数退避 + 重试策略 + 幂等性保证
category: 项目实战
type: practice
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-17
tags:
  - 请求重试
  - Axios
  - 指数退避
  - 幂等性
---

# 请求重试

> ⭐⭐⭐⭐｜难度：中级｜Axios 封装的自然延伸

## 一句话总结

**请求重试的核心三要素：指数退避（1s → 2s → 4s）、重试条件（网络错误/5xx/超时——GET 能重试，POST 需谨慎）、最大次数（通常 3 次）。配合 Axios 拦截器实现——响应拦截器捕获错误 → 判断类型 → 递增重试计数 → 延迟后重新发起。**

## 基础实现

```ts
// utils/request.ts —— Axios 实例 + 重试拦截器
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

interface RetryConfig extends InternalAxiosRequestConfig {
  __retryCount?: number
}

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 基础延迟 1s

// 需要重试的错误类型
function shouldRetry(error: AxiosError): boolean {
  // 网络错误（无响应）—— 一定重试
  if (!error.response) return true

  const status = error.response.status
  // 5xx 服务端错误 —— 重试
  if (status >= 500 && status <= 599) return true
  // 429 限流 —— 重试（等更久）
  if (status === 429) return true

  // 4xx 客户端错误 —— 不重试（请求本身有问题，重试也是同样的错）
  return false
}

const http = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig
    if (!config) return Promise.reject(error)

    // 初始化重试计数
    config.__retryCount = config.__retryCount || 0

    if (config.__retryCount >= MAX_RETRIES || !shouldRetry(error)) {
      return Promise.reject(error)
    }

    config.__retryCount++
    console.warn(
      `请求失败，第 ${config.__retryCount}/${MAX_RETRIES} 次重试：${config.url}`
    )

    // 指数退避 + 随机抖动（避免惊群效应）
    const delay = RETRY_DELAY * Math.pow(2, config.__retryCount - 1)
    const jitter = delay * 0.3 * Math.random() // ±30% 随机偏移
    await new Promise((resolve) => setTimeout(resolve, delay + jitter))

    return http(config) // 用原始 config 重新发起请求
  }
)
```

## 关键决策：什么能重试、什么不能

| 请求方法 | 是否重试 | 原因 |
|---------|:---:|------|
| `GET` | ✅ 可以 | 幂等——重复执行不会产生副作用 |
| `HEAD` / `OPTIONS` | ✅ 可以 | 同样幂等 |
| `PUT` | ⚠️ 谨慎 | 理论上幂等，但最好只在网络错误时重试 |
| `POST` | ❌ 不建议 | 非幂等——重复请求可能创建重复数据 |
| `PATCH` | ❌ 不建议 | 同 POST |
| `DELETE` | ⚠️ 谨慎 | 理论上幂等（删了再删还是删），但第二次会 404 |

**实际策略**：GET 默认重试，POST 需要手动标记 `config.allowRetry = true` 才重试。

## 进阶：幂等键去重

对于需要重试的 POST 请求（如支付），用幂等键保证重复请求不会创建多条记录：

```ts
// 前端生成唯一幂等键
import { v4 as uuidv4 } from 'uuid'

http.interceptors.request.use((config) => {
  if (config.method === 'post') {
    config.headers['X-Idempotency-Key'] = uuidv4()
  }
  return config
})
// 后端收到重复的 X-Idempotency-Key 时直接返回第一次的结果
```

## 易错点

1. **POST 请求盲目重试——创建了重复数据**：POST 是非幂等的——创建订单的 POST 重试 3 次 = 3 个重复订单。解决：默认只重试 GET，POST 需要显式标记 `config.allowRetry = true` 且配合幂等键。

2. **指数退避没加随机抖动——惊群效应**：如果 N 个客户端同时因服务端重启而失败，按同样的退避间隔重试——它们会在同一个时刻同时发起重试，把刚恢复的服务再次打挂。必须在退避时间上叠加 ±30% 随机偏移。

3. **重试次数上限太低或太高**：设 1 次不够（网络偶尔抖动一次），设 10 次太多（用户等不了了）。3 次是最佳平衡点——覆盖了瞬时网络错误的 95% 场景，总等待时间不超过 7s（1+2+4）。

4. **429 限流响应该退得更久**：服务端返回 429 时，应该用 `Retry-After` 响应头中的秒数作为退避时间——而不是用客户端自己的公式。忽略 `Retry-After` 会导致继续被限流。

5. **重试期间的 UI 状态没有反馈**：用户点击提交后按钮一直 loading 但不知道发生了什么——是网络慢？还是在重试？应该在重试时给用户一个轻提示——"网络不稳定，正在重试(1/3)"。

## 面试追问

| 追问 | 回答 |
|------|------|
| "POST 请求重试会产生什么问题" | 非幂等——比如创建订单的 POST，重试 3 次可能创建 3 个重复订单。解决方案：幂等键——第一次请求成功就缓存结果，重复请求直接返回缓存 |
| "指数退避为什么加随机抖动" | 惊群效应——如果 N 个客户端同时失败、同时按同样间隔重试，会在同一时刻打爆服务端。随机抖动把重试时间分散开 |
| "重试超限后怎么处理" | 不能静默吞掉——用户需要知道操作失败了。弹 Toast 提示 + 禁用提交按钮 + 记录 Sentry 错误日志 |

## 相关阅读

- [Axios 封装](./axios-encapsulation.md)
- [防重复请求](./request-dedup.md)
- [错误处理 / 前端监控](../基础设施/error-monitoring.md)

## 更新记录

- 2026-07-17：新建——覆盖率审计补齐

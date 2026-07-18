---
title: Axios 封装
description: Axios 封装是通过拦截器+请求/响应统一处理实现的 HTTP 请求管理方案，涵盖类型定义、错误处理、Token 注入等完整实践
category: 项目实战
type: project
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - Axios
  - 拦截器
  - 请求封装
  - 错误处理
  - TypeScript
---

# Axios 封装

> "Axios 封装不是包一层皮，而是建立整个项目的 HTTP 通信规范——让每一个请求都经过统一的类型检查、错误处理和用户反馈。"

---

## 一句话总结

Axios 封装是通过**请求/响应拦截器 + 统一响应格式处理 + 错误分级反馈**实现的 HTTP 请求管理方案，让项目中所有接口调用具有一致的行为——自动携带 Token、统一提取数据、静默或提示错误、支持请求取消。

---

## 核心机制

### 1. 实例创建与配置分层

不同业务域创建独立的 Axios 实例，每个实例拥有各自的 `baseURL`、`timeout` 和拦截器逻辑。

```typescript
// src/utils/http/index.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

// ---------- 类型定义 ----------
export interface ResponseData<T = unknown> {
  code: number          // 业务状态码：0/200 表示成功
  data: T               // 泛型数据体
  message: string       // 提示信息
}

// 创建实例的工厂函数
function createAxiosInstance(baseURL: string, timeout = 15000): AxiosInstance {
  const instance = axios.create({ baseURL, timeout })

  // --- 请求拦截器 ---
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // 1. 注入 Token
      const token = localStorage.getItem('accessToken')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      // 2. 按需注入租户 ID / 语言等
      return config
    },
    (error) => Promise.reject(error)
  )

  // --- 响应拦截器 ---
  instance.interceptors.response.use(
    (response: AxiosResponse<ResponseData>) => {
      const { code, data, message } = response.data
      if (code === 0 || code === 200) {
        return data as any          // 直接返回 data，调用方无需 .data.data
      }
      // 业务异常：后端返回了可展示的错误信息
      ElMessage.error(message || '请求失败')
      return Promise.reject(new Error(message))
    },
    (error) => {
      // HTTP 层异常（网络断开、超时、5xx 等）
      if (error.response) {
        const status = error.response.status
        const strategy: Record<number, string> = {
          401: '登录已过期，请重新登录',
          403: '没有权限访问该资源',
          404: '请求的资源不存在',
          500: '服务器内部错误',
        }
        ElMessage.error(strategy[status] || `请求失败 (${status})`)
        if (status === 401) {
          // 触发 Token 刷新或跳转登录（详见 token-refresh 文档）
          window.dispatchEvent(new CustomEvent('auth:unauthorized'))
        }
      } else if (error.code === 'ECONNABORTED') {
        ElMessage.error('请求超时，请稍后重试')
      } else {
        ElMessage.error('网络异常，请检查网络连接')
      }
      return Promise.reject(error)
    }
  )
  return instance
}

// 导出各业务域实例
export const http = createAxiosInstance(import.meta.env.VITE_API_BASE_URL)
export const httpUpload = createAxiosInstance(import.meta.env.VITE_API_BASE_URL, 60000)
```

### 2. 响应拦截器的"数据剥离"设计

响应拦截器中将 `response.data` 解包为 `code + data + message`，成功时只返回 `data`，这样调用方拿到的是**业务数据本身**，不需要写 `res.data.data`。这是面试中最能体现封装深度的细节。

### 3. 错误处理分级

| 层级 | 处理方式 | 示例 |
|------|---------|------|
| 网络层 | 超时、断网 | `ElMessage.error('网络异常')` |
| HTTP 层 | 401/403/5xx | 按状态码映射文案 |
| 业务层 | code !== 0 | 展示 `message` 字段内容 |
| 组件层 | try/catch | 局部降级、重试逻辑 |

---

## 深度拓展

### 追问 1：为什么要创建多个 Axios 实例？

不同场景对超时、Header、错误处理的要求不同。例如：
- **通用请求**：15s 超时，需要 Token，无感刷新 401；
- **文件上传**：60s 超时，携带 `Content-Type: multipart/form-data`；
- **下载导出**：`responseType: 'blob'`，错误提示不是 JSON 解析而是 Blob 转 JSON。

同时，多个实例可以实现**请求隔离**：一个实例的拦截器逻辑变更不会影响其他业务域。

### 追问 2：请求重试机制（指数退避）

```typescript
// 失败重试（Axios 拦截器 + 指数退避）
instance.interceptors.response.use(undefined, async (error) => {
  const config = error.config
  // 仅对 GET 请求重试，最多 3 次
  config.__retryCount = config.__retryCount ?? 0
  if (config.method === 'get' && config.__retryCount < 3) {
    config.__retryCount++
    const delay = Math.pow(2, config.__retryCount - 1) * 1000  // 1s, 2s, 4s
    await new Promise((r) => setTimeout(r, delay))
    return instance(config)
  }
  return Promise.reject(error)
})
```

完整的重试策略（重试条件判定、随机抖动防惊群、幂等键）见[请求重试](./request-retry.md)。

### 追问 3：并发请求的错误处理

```typescript
// Promise.allSettled 拿到所有结果再做决策
const results = await Promise.allSettled([
  http.get('/api/users'),
  http.get('/api/roles'),
  http.get('/api/menus'),
])
const [users, roles, menus] = results.map((r) =>
  r.status === 'fulfilled' ? r.value : []
)
```

---

## 项目实战

在 Vue3 + Element Plus 后台管理系统中，封装后的接口调用示例如下：

```typescript
// src/api/user.ts    ——— 业务接口层
import { http } from '@/utils/http'
import type { UserInfo, UserQuery, PageResult } from '@/types'

export const userApi = {
  getList(params: UserQuery): Promise<PageResult<UserInfo>> {
    return http.get('/api/users', { params })
  },
  create(data: Partial<UserInfo>): Promise<UserInfo> {
    return http.post('/api/users', data)
  },
  update(id: number, data: Partial<UserInfo>): Promise<void> {
    return http.put(`/api/users/${id}`, data)
  },
  delete(id: number): Promise<void> {
    return http.delete(`/api/users/${id}`)
  },
}

// 组件中使用 —— 返回值已是业务数据，不需要 .data
const list = await userApi.getList({ page: 1, size: 20 })
```

请求取消的封装（Vue3 composable）：

```typescript
// src/composables/useRequest.ts
import { ref, onUnmounted } from 'vue'

export function useRequest<T>(fetcher: (signal: AbortSignal) => Promise<T>) {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const abortController = ref<AbortController>()

  async function execute() {
    abortController.value?.abort()
    abortController.value = new AbortController()
    loading.value = true
    error.value = null
    try {
      return await fetcher(abortController.value.signal)
    } catch (e: any) {
      if (e?.name !== 'CanceledError') {
        error.value = e.message
      }
      throw e
    } finally {
      loading.value = false
    }
  }

  onUnmounted(() => abortController.value?.abort())
  return { loading, error, execute }
}
```

---

## 易错点

1. **拦截器中忘记返回 config/reject**：请求拦截器必须 `return config`，否则请求不会发出；响应拦截器的错误分支必须 `return Promise.reject(error)`，否则调用方的 catch 拿不到错误。

2. **在拦截器中做了太多事情**：权限校验、路由跳转等逻辑不应写在 Axios 拦截器里，应该收拢到路由守卫。拦截器只做"请求参数增强"和"响应数据归一化"。

3. **Token 注入时机错误**：如果在模块顶层读取 `localStorage`，首次加载时可能还没有 Token。应该在**拦截器函数体内**动态读取，保证每次请求都拿到最新 Token。

4. **同时写多个 `request` 拦截器**：Axios 支持多个同类型拦截器，但执行顺序容易混淆——后注册的先执行。建议一个实例只注册一个 request 和一个 response 拦截器，复杂逻辑通过函数组合处理。

---

## 相关阅读

- [防重复请求](./request-dedup.md) — 如何用拦截器实现请求去重
- [请求重试](./request-retry.md) — 指数退避/重试条件/幂等键的完整策略
- [Mock](./mock.md) — 开发阶段的 mock 数据方案
- [Token 刷新](../认证鉴权/token-refresh.md) — 401 拦截 + 双 Token 无感刷新
- [登录鉴权](../认证鉴权/login-auth.md) — 登录流程与路由守卫鉴权
- [文件上传](../业务场景/file-upload.md) — 上传专用实例 + 进度处理

---

## 更新记录

- 2026-07-18：一致性审计——重试延迟示例统一为 1s/2s/4s（与 request-retry.md 对齐），补请求重试互链
- 2026-07-05：完成内容填充（Phase 2），新增完整 TypeScript 代码示例、错误分级策略、易错点

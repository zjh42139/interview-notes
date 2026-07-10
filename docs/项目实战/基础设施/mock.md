---
title: Mock
description: Mock 是在开发阶段模拟后端接口的技术，涵盖方案选型、数据生成、开关切换的完整实践
category: 项目实战
type: project
score: 0
difficulty: 初级
frequency: ⭐⭐⭐⭐
status: reviewed
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - Mock
  - Mock.js
  - vite-plugin-mock
  - MSW
  - 接口模拟
---

# Mock

> "后端还没写好接口的时候，前端怎么调试？Mock 不是'造假数据'，而是为前端建立一个可控、可复现的开发环境。"

---

## 一句话总结

Mock 是在后端接口未就绪时，通过**拦截网络请求 + 返回模拟数据**让前端独立开发调试的技术方案，核心价值在于前后端解耦并行开发、异常场景可控复现。

---

## 核心机制

### 1. 主流 Mock 方案对比

| 方案 | 拦截层级 | 优点 | 缺点 |
|------|---------|------|------|
| **vite-plugin-mock** | Dev Server 层（中间件） | 配置简单、支持 HMR、不侵入代码 | 仅开发环境生效 |
| **Mock.js** | XHR 层（重写 XMLHttpRequest） | 随机数据生成能力极强 | 劫持原生 XHR，无法在 Network 面板看到请求 |
| **MSW (Mock Service Worker)** | Service Worker 层 | 标准 fetch/XHR 都支持、Network 可见、可复用测试 | 配置相对复杂、需要浏览器支持 SW |
| **json-server** | 独立 HTTP Server | 完整的 REST 模拟、支持分页排序 | 需要额外启动进程、数据是静态的 |

### 2. vite-plugin-mock 的工作原理

```
浏览器发出请求 → Vite Dev Server 接收 → 匹配 Mock 规则？
  ├── 匹配 → 返回 Mock 数据（不经过后端）
  └── 不匹配 → 通过 proxy 转发到真实后端
```

它是 Vite 的中间件插件，在 `configureServer` 钩子中注册路由处理器，优先级高于 proxy。

### 3. Mock 数据生成策略

- **静态数据**：手写固定 JSON，适合简单列表/详情接口
- **动态数据**：用 Mock.js 的 `@name`、`@datetime`、`@url` 等占位符生成随机数据
- **业务模拟**：在 Mock 函数中写逻辑，如分页、搜索过滤、排序等

---

## 项目实战

### Vite + vite-plugin-mock 配置

```bash
npm i -D vite-plugin-mock mockjs
npm i -D @types/mockjs        # TypeScript 类型提示
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { viteMockServe } from 'vite-plugin-mock'

export default defineConfig({
  plugins: [
    viteMockServe({
      mockPath: 'mock',         // mock 文件目录
      enable: true,             // 是否开启（建议通过环境变量控制）
      logger: true,             // 控制台显示请求日志
    }),
  ],
})
```

### Mock 文件示例：用户管理 CRUD

```typescript
// mock/user.ts
import { MockMethod } from 'vite-plugin-mock'
import Mock from 'mockjs'

// 内存数据库
let userList = Array.from({ length: 86 }, (_, i) => ({
  id: i + 1,
  username: Mock.mock('@cname'),
  email: Mock.mock('@email'),
  role: Mock.mock('@pick(["admin", "editor", "viewer"])'),
  status: Mock.mock('@pick(["active", "disabled"])'),
  createTime: Mock.mock('@datetime("yyyy-MM-dd HH:mm:ss")'),
}))

export default [
  // 分页列表
  {
    url: '/api/users',
    method: 'get',
    response: ({ query }: any) => {
      const { page = 1, size = 20, username = '', role = '' } = query
      let filtered = userList
      if (username) {
        filtered = filtered.filter((u) => u.username.includes(username))
      }
      if (role) {
        filtered = filtered.filter((u) => u.role === role)
      }
      const start = (Number(page) - 1) * Number(size)
      const list = filtered.slice(start, start + Number(size))
      return {
        code: 0,
        data: { list, total: filtered.length, page: Number(page), size: Number(size) },
        message: 'ok',
      }
    },
  },
  // 详情
  {
    url: '/api/users/:id',
    method: 'get',
    response: ({ query }: any) => {
      const user = userList.find((u) => u.id === Number(query.id))
      return user
        ? { code: 0, data: user, message: 'ok' }
        : { code: 404, data: null, message: '用户不存在' }
    },
  },
  // 创建
  {
    url: '/api/users',
    method: 'post',
    response: ({ body }: any) => {
      const newUser = { id: userList.length + 1, ...body, createTime: new Date().toISOString() }
      userList.unshift(newUser)
      return { code: 0, data: newUser, message: '创建成功' }
    },
  },
  // 更新
  {
    url: '/api/users/:id',
    method: 'put',
    response: ({ query, body }: any) => {
      const idx = userList.findIndex((u) => u.id === Number(query.id))
      if (idx > -1) {
        userList[idx] = { ...userList[idx], ...body }
        return { code: 0, data: userList[idx], message: '更新成功' }
      }
      return { code: 404, data: null, message: '用户不存在' }
    },
  },
  // 删除
  {
    url: '/api/users/:id',
    method: 'delete',
    response: ({ query }: any) => {
      const idx = userList.findIndex((u) => u.id === Number(query.id))
      if (idx > -1) {
        userList.splice(idx, 1)
        return { code: 0, data: null, message: '删除成功' }
      }
      return { code: 404, data: null, message: '用户不存在' }
    },
  },
] as MockMethod[]
```

### 环境变量开关：Mock / 真实接口切换

```typescript
// .env.development
VITE_USE_MOCK = true
VITE_API_BASE_URL = ''

// Axios 封装中通过环境变量控制
const baseURL = import.meta.env.VITE_USE_MOCK === 'true'
  ? ''                                      // Mock 模式：所有请求走 Vite Dev Server
  : import.meta.env.VITE_API_BASE_URL       // 真实模式：走代理或真实后端

// vite.config.ts 动态开关
viteMockServe({ enable: process.env.VITE_USE_MOCK === 'true' })
```

切换 Mock 和真实接口只需要修改 `.env.development` 中的 `VITE_USE_MOCK` 字段，**重启 dev server** 即可生效。

---

## 深度拓展

### 追问 1：Mock.js 为什么不推荐了？

Mock.js 通过重写 `XMLHttpRequest.prototype.send` 来拦截请求，这导致：
- **Network 面板看不到请求**：无法排查请求是否真的发出了
- **不支持 fetch API**：项目中混用 axios 和 fetch 时 fetch 的请求无法 Mock
- **类型安全弱**：生成的数据无类型约束

现代推荐方案：**vite-plugin-mock**（开发阶段）+ **MSW**（需要 Network 可见或跨环境复用测试时）。

### 追问 2：如何在单元测试中 Mock 接口？

MSW (Mock Service Worker) 在不同环境复用 Mock：

```typescript
// mocks/handlers.ts  —— 开发 + 测试共享
import { http, HttpResponse } from 'msw'
export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json({ code: 0, data: { list: [], total: 0 }, message: 'ok' })
  }),
]

// vitest.setup.ts
import { setupServer } from 'msw/node'
import { handlers } from './mocks/handlers'
export const server = setupServer(...handlers)
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

---

## 易错点

1. **Mock 数据格式与真实接口不一致**：后端返回的是 `{ success: true, result: [...] }`，Mock 返回的是 `{ code: 0, data: [...] }`，上线后全部报错。解决：在项目初期和后端**约定统一的响应格式**（如 `{ code, data, message }`），Mock 严格遵守。

2. **Mock 模式未关闭就上生产**：生产环境 `VITE_USE_MOCK=true`，所有用户请求都是假数据。解决：打包时环境变量校验 + CI 环节检查。

3. **Mock.js 语法兼容性问题**：`Mock.mock('@cname()')` 在某版本会报错，升级后语法又变了。建议在 Mock 文件中统一使用稳定的 API，避免依赖内部实现。

---

## 相关阅读

- [Axios 封装](./axios-encapsulation.md) — Mock 数据最终仍然通过 Axios 实例进入业务层
- [文件上传](../业务场景/file-upload.md) — 文件上传接口的 Mock 方式不同（需处理 Blob/FormData）
- [登录鉴权](../认证鉴权/login-auth.md) — 登录接口的 Mock（模拟 Token 生成）

---

## 更新记录

- 2026-07-05：完成内容填充（Phase 2），新增方案对比、完整 CRUD Mock 示例、环境变量开关策略

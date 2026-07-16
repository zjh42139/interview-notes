---
title: async / await
description: JavaScript 中 async/await 的底层原理与 Generator 的关系
category: JavaScript
type: mechanism
score: 86
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - async
  - await
  - Promise
  - Generator
---

# async / await

> &#11088;&#11088;&#11088;&#11088;｜难度：中级&#9733;&#9733;&#9733;

## 一句话总结

**async/await 是 Promise + Generator 的语法糖，让你用同步的写法写异步代码**。async 函数返回 Promise，await 在 Promise resolve 前暂停函数执行，背后的自动执行器（Generator runner）帮你处理了 `.then()` 的嵌套。

## 核心机制

### async 函数的本质

```ts
// 这两段代码完全等价：
async function fetchUser(): Promise<User> {
  const res = await fetch("/api/user")
  return res.json()
}

function fetchUser(): Promise<User> {
  return fetch("/api/user").then((res) => res.json())
}
```

async 函数做三件事：
1. 返回值自动包装成 Promise（如果本身不是 Promise 的话）
2. 函数体内的 await 暂停执行，等 Promise settle
3. 如果抛出异常，返回 rejected Promise

### await 的执行时机 -- 微任务分界线

```ts
async function demo() {
  console.log("1")
  await Promise.resolve()
  console.log("2") // 注意：这里的代码在微任务中执行！
}
demo()
console.log("3")

// 输出：1 3 2
```

**await 后面的代码**等价于 `.then(() => { ... })` 里的代码，属于微任务。面试题中出现 `async/await + setTimeout + Promise.then` 混排时，关键是把每个 `await` 后面的代码当作一个 `.then` 微任务。

### 错误处理：try/catch vs .catch()

```ts
// 方式 1：try/catch -- 最直观
async function getData() {
  try {
    const data = await fetch("/api/data")
    return data
  } catch (err) {
    console.error("请求失败:", err)
    return { fallback: true } // 降级数据
  }
}

// 方式 2：.catch() -- 函数式风格
async function getData() {
  const data = await fetch("/api/data").catch((err) => {
    console.error("请求失败:", err)
    return { fallback: true }
  })
  return data
}
```

两种方式等价。try/catch 的好处是能捕获同一个 try 块中多个 await 的错误；.catch() 的好处是可以逐个 Promise 单独处理。

### `return await` vs `return`：何时需要 await？

```ts
// 场景 1：不需要 return await — 返回值本身不是异步操作的错误栈一部分
async function foo() {
  return fetch("/api/data") // 直接返回 Promise，调用方 await 时错误栈指向调用方
}

// 场景 2：需要 return await — try/catch 内必须 await 才能捕获
async function bar() {
  try {
    return await fetch("/api/data") // ✅ await 让 reject 被 try/catch 捕获
  } catch (e) {
    console.error("请求失败:", e)   // 如果去掉 await，这里的 catch 永远不会触发
    return null
  }
}
```

**关键区别**：
1. **错误栈（stack trace）**：`return await` 会在当前 async 函数帧暂停，错误栈会包含当前函数，方便定位问题；`return` 直接返回 Promise，错误栈跳过当前函数帧。
2. **性能**：`return await` 会产生一个额外的微任务（await 的 then 包装），在不需要 try/catch 的场景下是多余的。
3. **ESLint 规则**：`no-return-await` 规则会提示移除不必要的 `return await`。

**结论**：只有在 try/catch 块内需要捕获 reject 时使用 `return await`，其他情况直接 `return` 即可。

## 深度拓展

### async/await 和 Promise.then 的执行顺序差异

```ts
async function foo() {
  console.log("1")
  await bar()
  console.log("2") // 微任务 1
}
async function bar() {
  console.log("3")
  return Promise.resolve()
}
foo()

Promise.resolve()
  .then(() => console.log("4"))
  .then(() => console.log("5"))

// 输出：1 3 4 2 5
```

这题的坑：`await bar()` 中，bar 返回 `Promise.resolve()`，规范要求 `await` 对返回值调用 `Promise.resolve()` 包装，这会产生**额外的微任务**。所以 2 延迟了两个微任务 tick。

简化记忆：**async 函数中遇到 await，后面的代码等价于 2 层 Promise.then 嵌套**（V8 优化前是 3 层）。

### 顶层 await（ES2022）

```ts
// ES Module 中可以直接在顶层用 await
// db.ts
const db = await createConnection("mongodb://localhost:27017")
export default db

// 使用 db 的模块会自动等待连接建立
import db from "./db"
// 这里可以安全使用 db，因为顶层 await 保证了连接完成
```

### for await...of -- 异步迭代

```ts
// 处理分页接口时非常有用
async function* fetchPages(url: string) {
  let page = 1
  while (true) {
    const res = await fetch(`${url}?page=${page}`)
    const data = await res.json()
    if (data.length === 0) break
    yield data
    page++
  }
}

// 按页消费，每页数据到了就处理
for await (const page of fetchPages("/api/users")) {
  page.forEach((user) => console.log(user.name))
}
```

### Generator 本质：async/await 的底层

```ts
// async/await 的底层等价于 Generator + 自动执行器：
function* fetchUserGen() {
  const res = yield fetch("/api/user")
  return res.json()
}

// 自动执行器（co 库的核心逻辑）
function asyncToGenerator(generatorFn: () => Generator<any, any, any>) {
  return function () {
    const gen = generatorFn()
    return new Promise((resolve, reject) => {
      function step(nextFn: (val: any) => IteratorResult<any>) {
        let result: IteratorResult<any>
        try {
          result = nextFn()
        } catch (e) {
          return reject(e)
        }
        if (result.done) return resolve(result.value)
        Promise.resolve(result.value).then(
          (val) => step(() => gen.next(val)),
          (err) => step(() => gen.throw(err))
        )
      }
      step(() => gen.next())
    })
  }
}
```

Babel 也是这么编译 async/await 的 -- 转成 Generator + regeneratorRuntime。

## 项目实战

### 1. Vue3 setup 中直接使用 await（需要 Suspense）

```ts
// 组件级数据初始化 — setup 中用顶层 await
// <template> 需要用 <Suspense> 包裹
async function setup() {
  const userList = await fetchUserList() // 直接 await，不用 .then
  const roleList = await fetchRoleList()
  return { userList, roleList }
}

// 在父组件中用 Suspense 处理加载状态
// <Suspense>
//   <template #default><UserTable /></template>
//   <template #fallback><Loading /></template>
// </Suspense>
```

### 2. 多个独立请求用 Promise.all 而非串行 await

```ts
// ❌ 串行 — 总耗时 = t1 + t2 + t3
const users = await fetchUsers()
const roles = await fetchRoles()
const perms = await fetchPermissions()

// ✅ 并行 — 总耗时 = max(t1, t2, t3)
const [users, roles, perms] = await Promise.all([
  fetchUsers(),
  fetchRoles(),
  fetchPermissions(),
])
```

项目中后台管理系统的 Dashboard 页面通常同时需要多个接口数据，这种优化能让加载时间从 3 秒降到 1 秒。

### 3. 路由守卫中使用 async/await

```ts
// 项目中的权限路由守卫
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated && to.meta.requiresAuth) {
    try {
      await authStore.fetchUserInfo() // 尝试用存储的 token 获取用户信息
      next()
    } catch {
      next("/login?redirect=" + to.fullPath)
    }
  } else {
    next()
  }
})
```

### 4. 接口请求错误处理的最佳实践

```ts
// 项目中封装的统一请求函数
async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const { data } = await service.request<ApiResponse<T>>(config)
    if (data.code === 0) return data.data
    throw new ApiError(data.code, data.message)
  } catch (err) {
    if (err instanceof ApiError) {
      ElMessage.error(err.message)
    } else if (axios.isAxiosError(err)) {
      ElMessage.error("网络异常，请检查网络连接")
    }
    throw err // 重新抛出让调用方决定是否继续处理
  }
}
```

## 易错点

1. **async 函数一定返回 resolve 的 Promise** -- 如果函数体内抛出异常，返回的是 rejected Promise
2. **await 后面的代码是同步执行的** -- await 后面的代码是微任务，不是同步的；验证方式是在 await 前后加 console.log 观察顺序
3. **用 await 等待 setTimeout** -- `await setTimeout(() => {}, 1000)` 不会等 1 秒；setTimeout 返回的是 timer ID（数字），不是 Promise。正确做法是 `await new Promise(r => setTimeout(r, 1000))`
4. **在 forEach 中用 async/await 不会等待** -- `[1,2,3].forEach(async (i) => { await delay(1000); console.log(i) })` 三个几乎同时输出；换成 `for...of` 才能串行等待
5. **忘记 Promise.all 导致串行请求** -- 多个无依赖的异步操作应该并行，性能差异巨大

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| 给代码判断输出顺序（async + Promise + setTimeout 混合） | 这是 Event Loop 的必考题 |
| "async/await 原理" | 追问 Generator 原理 → 手写自动执行器 |
| "怎么处理 async 函数的错误" | try/catch vs .catch() 的取舍 |
| "多个 await 如何优化" | Promise.all 并行请求 |
| "forEach 中用 await 有什么问题" | for...of 串行 vs Promise.all 并行 |

## 相关阅读

- [上一篇](./event-loop.md)
- [下一篇](./call-apply-bind.md)
- [Promise](./promise.md)
- [Event Loop](./event-loop.md)
- [手写题：Promise](../手写题/promise.md)

## 更新记录

- 2026-07-05：Phase 2 深度填充（Generator 关联 + 微任务时序 + 项目实战 + 执行顺序必考题）

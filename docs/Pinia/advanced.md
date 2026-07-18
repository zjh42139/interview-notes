---
title: "Pinia 进阶：组件外使用 / TS / SSR / Options API"
description: Pinia 在 setup 外使用 Store（路由守卫/axios 拦截器）、TypeScript 类型推导、SSR 状态水合、Options API 兼容
category: Pinia
type: mechanism
score: 75
difficulty: 中高级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-16
updated: 2026-07-18
tags:
  - Pinia
  - TypeScript
  - SSR
---

# Pinia 进阶

> ⭐⭐⭐⭐｜难度：中高级｜踩坑指南

## 一句话总结

**在 setup 外使用 Pinia Store 是项目中最容易踩的坑——要么保证调用发生在 `app.use(pinia)` 之后，要么手动传入 pinia 实例。Pinia 的 TS 类型推导是自动的——setup store 零手动标注。SSR 中服务端序列化状态、客户端挂载前水合；跨请求状态污染靠「每个请求新建 app + pinia 实例」避免。**

## 核心机制

### 在组件外使用 Store

```javascript
// ❌ 报错：getActivePinia() was called but there was no active Pinia
import { useUserStore } from '@/stores/user';
const userStore = useUserStore(); // 在 setup 外调用 → Error

// ✅ 方案一：手动传入 pinia 实例
import { useUserStore } from '@/stores/user';
import pinia from '@/stores'; // 导出的 pinia 实例
const userStore = useUserStore(pinia);

// ✅ 方案二：在函数内部调用（确保 pinia 已激活）
router.beforeEach((to, from) => {
  const userStore = useUserStore(); // beforeEach 在 app.use(pinia) 之后执行——OK
  if (!userStore.token && to.meta.requiresAuth) return '/login';
});
```

**关键规则**：`useXxxStore()` 必须在 `app.use(pinia)` 之后调用。路由守卫、axios 拦截器初始化晚于 `app.use`——可以直接调用。独立的工具函数文件中调用——需要手动传 pinia 实例。

### TypeScript 类型推导

```typescript
// Setup Store：类型自动推导——零手动标注
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0);
  const double = computed(() => count.value * 2);
  function increment() { count.value++ }
  return { count, double, increment };
});
// useCounterStore() 返回的 store 实例上 ref 会被自动解包：count: number、double: number（只读）、increment: () => void

// Options Store：同样自动推导
export const useUserStore = defineStore('user', {
  state: () => ({ name: '', age: 0 }),
  getters: { isAdult: (state) => state.age >= 18 },
  actions: { setName(name: string) { this.name = name } },
});
```

**Pinia 的类型推导不需要手动写 `StoreDefinition` 或 `ReturnType`——`defineStore` 返回类型自动推断。这是 Pinia 相比 Vuex 最大的 TS 优势。**

### SSR 状态水合

```javascript
// 服务端：渲染后提取 store 状态
const pinia = createPinia();
const app = createApp(App).use(pinia);
// ... 渲染完成后
const state = JSON.stringify(pinia.state.value); // 序列化所有 store
// 注意：直接 stringify 注入 HTML 有 XSS 风险（如 </script> 截断），生产环境用 devalue 等安全序列化

// 客户端：hydrate 服务端状态
// 在 createPinia 后、app.mount 前
pinia.state.value = JSON.parse(window.__INITIAL_STATE__);
```

**状态污染问题（Cross-Request State Pollution）**：如果把 app/pinia 实例创建在模块顶层被所有请求共享（错误做法），A 用户的数据会泄漏给 B 用户。正确做法：在每个请求的处理函数里新建 app + pinia 实例（Vue SSR 的标准模式），不要复用单例。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "路由守卫里怎么用 Pinia" | 追问"为什么 setup 外会报错"——缺少 active pinia |
| "Pinia 的 TS 类型需要手动写吗" | 追问 "defineStore 自动推断" |

## 相关阅读

- [defineStore](./defineStore.md)
- [路由守卫](../VueRouter/route-guards.md)

## 更新记录

- 2026-07-18：事实审计：修正 store 实例类型注释（ref 自动解包，非 Ref 类型）、SSR 状态污染前提（模块级单例才共享，标准模式是每请求新建实例）、补充序列化 XSS 注意
- 2026-07-16：新建——组件外使用+TS推导+SSR水合+状态污染

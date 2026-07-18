---
title: 动态路由
description: Vue Router 动态路由注册、权限路由实现与 addRoute 的坑点详解
category: VueRouter
type: api-reference
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-18
tags:
  - addRoute
  - removeRoute
  - 动态路由
  - 权限路由
  - 异步路由
---

# 动态路由

> 后台管理系统面试的"分水岭"考点。说自己做过权限路由，但说不清楚 `addRoute` 之后需要 `next` 重新匹配 —— 基本判定没真正做过。这一块能讲透，等于证明了"我确实独立负责过后台项目"。

## 一句话总结

Vue Router 的 `addRoute()` 和 `removeRoute()` 允许在运行时动态增删路由规则，核心应用场景是**权限路由**：用户登录后根据角色拉取不同的路由表，动态注入到 router 实例中，实现"不同角色看到不同菜单"。

## 核心机制

### 1. `router.addRoute()` —— 运行时注入路由

`addRoute` 有两种用法：

```ts
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    // 初始只有公共路由：登录页、404
    { path: '/login', name: 'Login', component: () => import('@/views/login/index.vue') },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/error/404.vue') },
  ]
})

// 方式1：直接注册一级路由
router.addRoute({
  path: '/dashboard',
  name: 'Dashboard',
  component: DashboardLayout,
  children: [
    { path: '', component: () => import('@/views/dashboard/index.vue') }
  ]
})

// 方式2：注册到某个已存在的父路由的 children 里
router.addRoute('Dashboard', {
  path: 'users',
  name: 'Users',
  component: () => import('@/views/dashboard/users/index.vue')
})
// 结果：/dashboard/users → 渲染 DashboardLayout > Users 的嵌套
```

addRoute 的规则：
- `addRoute(route)` — 注册为顶级路由
- `addRoute(parentName, route)` — 注册为 `parentName` 路由的子路由
- 如果与已有路由**重名**，会**先删除旧路由，再添加新路由**（这一点经常被忽略但很重要）

### 2. 权限路由的完整实现

这是整个考点最核心的部分 —— 登录后动态加载权限路由。

```ts
// store/permission.ts
import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'
import router from '@/router'
import { asyncRoutes, constantRoutes } from '@/router/routes'

const usePermissionStore = defineStore('permission', () => {
  // 根据角色过滤出有权限的路由
  function filterAsyncRoutes(routes: RouteRecordRaw[], roles: string[]): RouteRecordRaw[] {
    return routes
      .filter(route => {
        if (route.meta?.roles) {
          return route.meta.roles.some((r: string) => roles.includes(r))
        }
        return true
      })
      .map(route => ({
        ...route,
        children: route.children ? filterAsyncRoutes(route.children, roles) : undefined
      }))
  }

  // 动态添加路由
  function addRoutes(routes: RouteRecordRaw[]) {
    routes.forEach(route => router.addRoute(route))
  }

  return { filterAsyncRoutes, addRoutes }
})
```

```ts
// router/permission.ts —— 全局前置守卫 + 权限路由加载
import router from './index'
import { useUserStore } from '@/store/user'
import { usePermissionStore } from '@/store/permission'
import { whiteList } from './routes'   // 白名单路由（login, 404 等不需要权限的）

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  if (userStore.token) {
    if (to.path === '/login') {
      // 已登录还去登录页 → 重定向到首页
      next({ path: '/' })
    } else {
      if (!userStore.roles.length) {
        // 有 token 但没有角色信息 → 拉取用户信息和角色
        try {
          const { roles } = await userStore.fetchUserInfo()
          // 根据角色过滤异步路由
          const accessedRoutes = permissionStore.filterAsyncRoutes(asyncRoutes, roles)
          // 动态注入
          accessedRoutes.forEach(route => router.addRoute(route))
          // ========== 关键一步 ==========
          // addRoute 后路由表已更新，但当前导航仍会命中原来的匹配结果（可能是 404）
          // 需要 hack 方式重新触发匹配：
          next({ ...to, replace: true })
          // ============================
        } catch {
          // 拉取失败 → 清 token，回登录页
          userStore.resetToken()
          next(`/login?redirect=${to.path}`)
        }
      } else {
        // 已有角色信息，正常放行
        next()
      }
    }
  } else {
    // 未登录
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
  }
})
```

**`next({ ...to, replace: true })` 为什么是必需的？**

当你调用 `addRoute()` 时，当前导航的匹配已经完成了。`next()` 只是"放行当前匹配结果"，并不会因为路由表更新而重新匹配。所以需要用 `next({ ...to, replace: true })` 重新触发一次导航，让 Vue Router 用更新后的路由表重新匹配 `to`，这样才能命中新增路由的正确组件。

如果不加这一步，现象是：登录后侧边栏有菜单，但点击菜单跳转匹配到 404 —— 因为点击时路由表已经更新了（`addRoute` 已执行），但**登录后首次重定向的匹配结果**还是旧的。

### 3. `router.removeRoute()` — 运行时移除路由

```ts
// 通过路由名称移除
router.removeRoute('Dashboard')

// 移除后，该路由及其所有子路由都不再可匹配
// 常用于：用户登出时清理动态路由，防止其他用户登录后看到上一用户的路由
```

完整的登出清理逻辑：

```ts
// store/user.ts
function resetToken() {
  // 1. 移除所有动态添加的路由（遍历已注册的路由名称）
  router.getRoutes().forEach(route => {
    const name = route.name as string
    // 只移除动态注入的，保留基础路由（login、404 等）
    if (name && importedRouteNames.has(name)) {
      router.removeRoute(name)
    }
  })
  // 2. 清除 token 和用户信息
  token.value = ''
  roles.value = []
}
```

### 4. `router.hasRoute()` / `router.getRoutes()` — 运行时检查

```ts
// 检查某个路由是否已注册
if (!router.hasRoute('Dashboard')) {
  router.addRoute({ name: 'Dashboard', path: '/dashboard', component: Dashboard })
}

// 获取当前所有已注册路由
const allRoutes = router.getRoutes()
```

## 深度拓展

### 追问1：addRoute 底层做了什么？

核心就是把路由记录编译成 matcher（路径匹配器）插入内部数据结构。注意 VR4 已**不再使用 path-to-regexp**（`pathList` / `pathMap` 那套是 VR3 的实现），而是自研路径解析器，为每条 path 计算**评分**。matcher 内部维护两个结构：
- **`matchers` 数组**：所有路由的 matcher，按路径评分插入排序——匹配时按分数从高到低找第一个命中的
- **`matcherMap`**：路由 name → matcher 的 Map，供命名路由跳转和 `removeRoute('name')` 查找

`addRoute` 本质上就是编译新记录、按评分插入 `matchers` 数组、同步更新 name 的 Map。名称冲突时先删后加，保证同名路由始终只有最新的一条。

### 追问2：为什么要用 `replace: true` 而不是 `push`？

从逻辑上讲，`next({ ...to, replace: true })` 执行了一次"无痕重定向"：URL 保持不变，历史记录栈不增加新条目。如果使用 `next({ ...to })`（即 push），浏览器历史记录栈会多一条，用户在重定向目标页按"后退"时会回到同一页面的同一条历史记录上，体验很差。

### 追问3：addRoute 完成后为什么不用 `next()` 触发重匹配？

```ts
// ❌ 错误写法
accessedRoutes.forEach(route => router.addRoute(route))
next()  // 不会重新匹配！to 的匹配结果在 beforeEnter 被调用时已经确定了

// ✅ 正确写法
accessedRoutes.forEach(route => router.addRoute(route))
next({ ...to, replace: true })  // 重新触发整个导航流程
```

这背后的原因是导航解析流程是**一次性**的：守卫（`beforeEach`）回调执行时，路由对象 `to` 已经是匹配好的结果了（`to.matched` 数组已经固定）。`next()` 只是说"用这个匹配结果继续"，不会重新计算 `to.matched`。而 `next({ ...to })` 本质是发起一次新的导航，让路由表从匹配到守卫全部重新走一遍。

### 追问4：为什么要区分 asyncRoutes 和 constantRoutes？

```ts
// constantRoutes: 不需要权限的公共路由，router 初始化时就注册
export const constantRoutes: RouteRecordRaw[] = [
  { path: '/login', component: () => import('@/views/login/index.vue') },
  { path: '/404', component: () => import('@/views/error/404.vue') },
]

// asyncRoutes: 需要权限的动态路由，登录后根据角色过滤再 addRoute
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    component: Layout,
    meta: { title: '仪表盘', roles: ['admin', 'editor'] },
    children: [...]
  },
  {
    path: '/system',
    component: Layout,
    meta: { title: '系统管理', roles: ['admin'] },  // 仅管理员可见
    children: [
      { path: 'user', meta: { title: '用户管理' }, ... },
      { path: 'role', meta: { title: '角色管理' }, ... },
    ]
  }
]
```

这样设计的好处是：**前端代码打包时，所有业务路由组件都会进入构建产物（懒加载的 `import()` 也只是拆成独立 chunk，并非不打包），但只有当前角色有权限的路由才会被加入到路由表中。菜单渲染也完全基于 `router.getRoutes()` 来生成**，保证了"真正的权限控制在前端路由层面"，而不是仅靠菜单的 `v-if` 隐藏。

## 项目实战

```ts
// 完整的 登录 → 拉权限 → addRoute → 生成菜单 流程
// 1. 路由定义（router/modules/）按业务模块拆分
// router/modules/system.ts
export default {
  path: '/system',
  component: Layout,
  redirect: '/system/user',
  meta: { title: '系统管理', icon: 'Setting', roles: ['admin'] },
  children: [
    {
      path: 'user',
      name: 'SystemUser',
      component: () => import('@/views/system/user/index.vue'),
      meta: { title: '用户管理' }
    },
    {
      path: 'role',
      name: 'SystemRole',
      component: () => import('@/views/system/role/index.vue'),
      meta: { title: '角色管理' }
    }
  ]
}

// 2. 侧边栏根据 router.getRoutes() 动态渲染
// components/Sidebar/index.vue
const menuRoutes = computed(() => {
  return router.getRoutes()
    .filter(r => r.meta?.title && !r.meta?.hidden)  // 有标题且不隐藏
    .filter(r => r.children?.length)                 // 有子路由的父级菜单
    .sort((a, b) => (a.meta?.sort ?? 99) - (b.meta?.sort ?? 99))
})

// 3. 按钮级权限配合自定义指令
// directives/permission.ts
const vPermission: Directive = {
  mounted(el, binding) {
    const { value } = binding  // 需要的权限标识，如 'system:user:delete'
    const userStore = useUserStore()
    if (value && !userStore.permissions.includes(value)) {
      el.parentNode?.removeChild(el)
    }
  }
}
```

## 易错点

**❌ addRoute 后忘记 `next({ ...to, replace: true })`**
结果：路由表更新了，但首次重定向仍匹配到 404。这是最常见的 bug。

**❌ 登出时不清理动态路由**
用户 A 登出后，用户 B 在同一浏览器登录。如果不清理动态路由，B 会看到 A 的路由和菜单。必须登出时 `removeRoute` 所有动态注入的路由。

**❌ 用 localStorage 存路由表而不是根据角色实时计算**
路由权限应该基于当前用户的角色**在内存中实时计算**，而不是从 localStorage 读一个缓存的路由表。后者会导致角色变更后权限不更新的安全问题。

**❌ `router.addRoute` 只在登录成功的回调里调用，不在 `beforeEach` 里兜底**
只在登录页组件里 addRoute 的话，用户在业务页面**刷新**时（token 还在，但路由表已重置为初始状态）不会再走登录逻辑，当前 URL 直接被 404 兜底路由吃掉。权限路由的注入必须放在 `beforeEach` 的"有 token 但路由未注入"分支里，保证刷新、直接输 URL 等任何入口都先注入、再重新匹配。

## 面试信号

当面试官问"你们项目的权限是怎么做的"，你的回答骨架：

1. **路由分级**：constantRoutes（公共路由）+ asyncRoutes（权限路由），后者按业务模块拆分文件，每个路由有 `meta.roles` 字段
2. **登录流程**：登录成功 → 存储 token → 进入 `beforeEach` → 发现没有角色信息 → 调接口获取用户角色 → 根据角色过滤 asyncRoutes → `addRoute` 逐个注入 → `next({ ...to, replace: true })` 重新匹配
3. **菜单生成**：侧边栏基于 `router.getRoutes()` 动态渲染，有权限才有菜单，不做菜单的 `v-if` 假隐藏
4. **登出清理**：`removeRoute` 删除所有动态路由 + 清 token + 清角色
5. **按钮权限**：自定义指令 `v-permission` 基于用户权限数组做 DOM 级别的增删

## 相关阅读

- [路由守卫](./route-guards.md) — 动态路由与 beforeEach 的配合是权限系统的核心
- [路由懒加载](./lazy-loading.md) — asyncRoutes 中的组件应全部使用懒加载
- [导航故障处理](./navigation-failures.md) — `next({ ...to })` 重发导航按重定向处理，不产生 failure，用 `redirectedFrom` 检测
- [../项目实战/权限系统/动态路由原理](../项目实战/权限系统/dynamic-route.md) — 权限系统完整设计

## 更新记录

- 2026-07-18：事实修正（Phase 3 二审）——补 `RouteRecordRaw` 类型导入；打包说明更正（懒加载 `import()` 同样产出 chunk，非 static import）；重发导航定性改为重定向语义（`redirectedFrom`），非 cancelled 失败
- 2026-07-18：事实修正（Phase 3）——matcher 内部结构改为 VR4 口径（自研解析器 + 评分排序，非 path-to-regexp / pathMap）、addRoute 调用时机易错点重写、相关阅读的失败类型改为 cancelled
- 2026-07：完整填充（Phase 1），含权限路由全流程、addRoute 底层逻辑、next 重匹配原理

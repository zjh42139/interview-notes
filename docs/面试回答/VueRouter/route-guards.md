---
title: 路由守卫 / 动态路由 面试回答
description: 面试中如何回答 Vue Router 路由守卫和动态权限路由——beforeEach 鉴权 + addRoute 角色路由
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-15
updated: 2026-07-15
reviewed: null
tags:
  - VueRouter
  - 路由守卫
  - 动态路由
  - 面试回答
---

# 路由守卫 / 动态路由 面试回答

> 后台管理系统的必问题。面试官要的不是"beforeEach 是全局守卫"，而是"你项目里权限路由怎么实现的"。

## Q1: 路由守卫有哪些？你的项目里怎么用路由守卫做鉴权？

### 30 秒版本

"三种守卫——全局 beforeEach（鉴权入口）、路由独享 beforeEnter（单条路由控制）、组件内 beforeRouteEnter（组件级拦截）。项目里用 beforeEach 做统一鉴权——检查 Token 是否存在、从 Pinia 拿用户权限、用 addRoute 动态注册该角色可见的路由。未登录跳登录页、无权限跳 403。"

### 2 分钟版本

**三层守卫体系**：

```javascript
// 全局前置守卫：所有路由的统一入口
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 1. 未登录 → 跳登录页（白名单路由除外）
  if (!userStore.token && to.meta.requiresAuth) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // 2. 已登录但动态路由未注册 → 先注册再放行
  if (userStore.token && !userStore.routesLoaded) {
    const routes = generateRoutes(userStore.permissions)
    routes.forEach(r => router.addRoute(r))
    userStore.routesLoaded = true
    next({ ...to, replace: true })  // 重试当前导航
    return
  }

  // 3. 已登录 → 权限校验
  if (to.meta.permission && !userStore.hasPermission(to.meta.permission)) {
    next({ name: '403' })
    return
  }

  next()
})
```

**动态路由方案**：后端返回角色权限列表 → 前端根据权限筛选路由表 → `addRoute()` 逐条注册。侧边栏菜单也根据同一份权限数据动态渲染——菜单和路由同源，不会出现"菜单有入口但路由没注册"。

**组件内守卫**：`beforeRouteLeave`——用户编辑表单未保存时弹窗确认。`beforeRouteUpdate`——同一组件路由参数变化时重新加载数据。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "动态路由为什么不用 router.addRoute 一次性传入" | addRoute 一次只注册一条。权限路由通常有嵌套——父路由 addRoute 后，子路由需追加到父路由的 children |
| "权限更新后怎么让路由生效" | 退出登录→清 Token→重定向到登录页→重新登录→重新拉权限→重新 addRoute。或监听权限变化后 router.replace 当前页强制重渲染 |
| "Hash 和 History 模式怎么选" | History 更干净、支持 SSR。Hash 不需要服务端配置。后台管理系统用 Hash 最省事——不涉及 SEO，服务端不用配 fallback |

## 别踩的坑

1. **动态路由重复注册** —— 每次 beforeEach 都 addRoute 会报重复路由警告。用 `routesLoaded` 标记防重复。
2. **addRoute 后直接 next()** —— 路由注册是异步生效的，需要 `next({ ...to, replace: true })` 重新触发导航。
3. **权限路由没处理 404 兜底** —— 动态路由最后加一条 `path: '/:pathMatch(.*)'` 匹配所有未注册的路由。

## 相关阅读

- [组件通信](../Vue3/component-communication.md)
- [权限系统设计](../项目/permission-rbac.md)

## 更新记录

- 2026-07-15：新建（三层守卫体系 + 动态路由 addRoute 流程 + 三个常见坑）

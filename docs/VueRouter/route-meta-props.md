---
title: "路由元信息 / 传参 / 编程式导航"
description: Vue Router 路由 meta 字段、路由传参与 props 解耦、router.push/replace/go 编程式导航
category: VueRouter
type: mechanism
score: 80
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-16
tags:
  - 路由元信息
  - 路由传参
  - 编程式导航
---

# 路由元信息 / 传参 / 编程式导航

> ⭐⭐⭐⭐⭐｜难度：中级｜后台管理系统最常用的路由 API

## 一句话总结

**`meta` 挂载权限/标题/图标等路由级配置——`router.beforeEach` 中读取做鉴权和面包屑。路由传参三种方式——params（RESTful）、query（?key=val）、props 解耦（组件不依赖 $route）。编程式导航 `router.push/replace/go` 替代 `&lt;router-link>` 实现条件跳转。**

## 核心机制

### 路由元信息 meta

```javascript
const routes = [
  {
    path: '/users',
    component: Users,
    meta: {
      requiresAuth: true,      // 需要登录
      permission: 'user:view', // 权限码
      title: '用户管理',       // 面包屑/页面标题
      icon: 'user',            // 侧边栏图标
      keepAlive: true,         // 是否缓存
    },
  },
];

// 在全局守卫中使用 meta
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '后台管理系统';
  if (to.meta.requiresAuth && !hasToken()) next('/login');
  else next();
});
```

**典型用途**：鉴权标记、权限码、动态标题、侧边栏配置、缓存控制。所有路由级别的配置全放 meta——组件只管展示，路由管权限和组织。

### 路由传参三种方式

```javascript
// 1. params —— RESTful 风格，/user/:id
router.push({ name: 'user', params: { id: 1 } });    // /user/1
// 获取：route.params.id

// 2. query —— ?key=val，刷新不丢
router.push({ path: '/user', query: { id: 1, tab: 'profile' } }); // /user?id=1&tab=profile
// 获取：route.query.id

// 3. props 解耦 —— 组件不依赖 $route
const routes = [
  { path: '/user/:id', component: User, props: true },
  // User 组件 props: { id: String } —— 直接当 props 用
  { path: '/user/:id', component: User, props: (route) => ({ userId: route.params.id }) },
];
```

**params vs query**：params 只传 id/单号——RESTful、简洁；query 传筛选条件——刷新不丢、可分享。不要把所有参数塞 params——URL 会变得不可读。

### 编程式导航

```javascript
// push：添加历史记录——用户可后退
router.push({ name: 'dashboard' });
router.push({ path: '/users', query: { page: 2 } });

// replace：替换当前记录——不可后退（登录后不回到登录页）
router.replace({ name: 'home' });

// go：前进/后退
router.go(-1);  // 后退一页
router.go(1);   // 前进一页
```

**登录后跳转的经典模式**：`router.replace(redirect || '/')`——replace 防止用户按后退回到登录页。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "路由参数怎么传" | 追问 params vs query——"什么时候用哪个" |
| "meta 字段有什么用" | 追问鉴权配合——"beforeEach 怎么读 meta" |

## 相关阅读

- [路由守卫](./route-guards.md)
- [动态路由](./dynamic-routing.md)

## 更新记录

- 2026-07-16：新建——meta/props/params-vs-query/编程式导航

---
title: Vue Router 知识地图
description: Vue Router 面试知识体系，从路由模式到实战场景
category: VueRouter
---

# Vue Router 知识地图

```mermaid
mindmap
  root((Vue Router))
    路由模式
      Hash 模式
        hashchange 事件
        不会发送到服务器
      History 模式
        pushState / replaceState
        popstate 事件
        需要服务端配置
    动态路由
      addRoute
      removeRoute
      hasRoute
      权限路由实现
    路由守卫
      全局守卫
        beforeEach
        beforeResolve
        afterEach
      路由独享守卫
        beforeEnter
      组件内守卫
        beforeRouteEnter
        beforeRouteUpdate
        beforeRouteLeave
    路由懒加载
      () => import()
      魔法注释 chunkName
      分组打包策略
    KeepAlive + Router
      router-view v-slot
      include / exclude
      onActivated / onDeactivated
    滚动行为
      scrollBehavior
      savedPosition
    导航故障
      NavigationFailureType
      router.isReady
      router.onError
```

## 推荐学习顺序

1. ⭐⭐⭐⭐⭐ [history / hash 模式](./history-vs-hash.md)
2. ⭐⭐⭐⭐⭐ [路由守卫](./route-guards.md)
3. ⭐⭐⭐⭐⭐ [动态路由](./dynamic-routing.md)
4. ⭐⭐⭐⭐   [路由懒加载](./lazy-loading.md)
5. ⭐⭐⭐⭐   [KeepAlive + Router](./keepalive-integration.md)
6. ⭐⭐⭐     [scrollBehavior](./scroll-behavior.md)
7. ⭐⭐⭐     [导航故障处理](./navigation-failures.md)

## 知识点索引

| 知识点 | 频率 | 难度 | 手写 | 状态 |
|--------|------|------|------|------|
| [history / hash 模式](./history-vs-hash.md) | ⭐⭐⭐⭐⭐ | 初级 | — | filled |
| [路由守卫](./route-guards.md) | ⭐⭐⭐⭐⭐ | 中级 | — | filled |
| [动态路由](./dynamic-routing.md) | ⭐⭐⭐⭐⭐ | 高级 | — | filled |
| [路由懒加载](./lazy-loading.md) | ⭐⭐⭐⭐ | 初级 | — | filled |
| [KeepAlive + Router](./keepalive-integration.md) | ⭐⭐⭐⭐ | 中级 | — | filled |
| [scrollBehavior](./scroll-behavior.md) | ⭐⭐⭐ | 初级 | — | filled |
| [导航故障处理](./navigation-failures.md) | ⭐⭐⭐ | 中级 | — | filled |

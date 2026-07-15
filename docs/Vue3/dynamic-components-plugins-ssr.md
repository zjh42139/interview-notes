---
title: "动态组件 / 插件 / SSR"
description: Vue3 动态组件 component :is、插件 install/app.use 机制、SSR/SSG 基础概念
category: Vue3
type: mechanism
score: 72
difficulty: 中高级
frequency: ⭐⭐⭐
status: draft
created: 2026-07-16
tags:
  - 动态组件
  - 插件
  - SSR
---

# 动态组件 / 插件 / SSR

> ⭐⭐⭐｜难度：中高级

## 动态组件

```vue
<!-- component :is — 切换不同组件但保持位置 -->
<component :is="currentTab" />
<KeepAlive>
  <component :is="currentTab" />
</KeepAlive>

<script setup>
const currentTab = computed(() => tabs[active.value].component);
// 切换 tab 时组件自动切换——配合 KeepAlive 状态保留
</script>
```

## 插件

```javascript
// 插件是一个包含 install 方法的对象或函数
const myPlugin = {
  install(app, options) {
    // 1. 全局注册组件
    app.component('MyButton', MyButton);
    // 2. 全局注入
    app.provide('apiBase', options.apiBase);
    // 3. 挂载全局属性
    app.config.globalProperties.$http = axios;
    // 4. 注册自定义指令
    app.directive('permission', permissionDirective);
  },
};

app.use(myPlugin, { apiBase: '/api' });
```

**app.use 做了什么？** 调用插件的 `install(app, options)`→插件拿到 app 实例→注册全局资源。`app.use` 自动防重复——同一个插件只安装一次。

## SSR / SSG 概念

| | CSR | SSR | SSG |
|---|-----|-----|-----|
| 渲染位置 | 浏览器 | 服务端 | 构建时 |
| 首屏速度 | 慢 | 快 | 最快 |
| SEO | 差 | 好 | 最好 |
| 服务器负载 | 无 | 高 | 无 |
| 适用场景 | 后台系统 | 内容+个性化 | 文档/博客/营销页 |

**Vue3 SSR 框架**：Nuxt 3——基于 Vite+Nitro 引擎，内置 SSR/SSG/ISR 多种渲染模式。`useFetch`/`useAsyncData` 在服务端和客户端各执行一次——hydration 后接管。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "app.use 做了什么" | 追问 install 方法和插件防重复 |
| "CSR/SSR/SSG 怎么选" | 追问场景对比——"后台管理系统不需要 SSR" |

## 相关阅读

- [异步组件](./async-components.md)
- [Composition API](./composition-api.md)

## 更新记录

- 2026-07-16：新建——动态组件+插件+SSR/SSG

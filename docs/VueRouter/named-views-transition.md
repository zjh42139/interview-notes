---
title: "命名视图 / 数据获取 / 过渡动画"
description: Vue Router 命名视图多布局、导航完成后获取数据 vs beforeRouteEnter、路由过渡动画
category: VueRouter
type: mechanism
score: 75
difficulty: 中级
frequency: ⭐⭐⭐
status: filled
created: 2026-07-16
updated: 2026-07-18
tags:
  - 命名视图
  - 数据获取
  - 过渡动画
---

# 命名视图 / 数据获取 / 过渡动画

> ⭐⭐⭐｜难度：中级

## 一句话总结

**命名视图让一个路由渲染多个组件（sidebar+main 同时）。数据获取两种时机——导航完成后获取（用户体验好、有 loading 状态）和导航前获取（beforeRouteEnter，数据好了才进页面）。`&lt;Transition>` 包裹 `&lt;RouterView>` 实现页面切换动画。**

## 核心机制

### 命名视图

```vue
<!-- 一个路由同时渲染多个组件 -->
<RouterView name="sidebar" />
<RouterView />  <!-- default -->

<!-- 路由配置 -->
{
  path: '/dashboard',
  components: {
    default: DashboardMain,
    sidebar: DashboardSidebar,
  },
}
```

**场景**：经典左右布局——左侧菜单栏 + 右侧内容区，每个路由可以有不同的 sidebar 内容。

### 数据获取

```javascript
// 方式一：导航完成后获取（推荐）
// 页面立即渲染 + loading 骨架 → 数据回来填充
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();
const data = ref(null);
const loading = ref(true);
onMounted(async () => {
  data.value = await fetchData(route.params.id);
  loading.value = false;
});

// 方式二：导航前获取（beforeRouteEnter）
// 数据好了才进页面——用户感受不到 loading 但跳转有延迟
beforeRouteEnter(to, from, next) {
  fetchData(to.params.id).then(data => {
    next(vm => vm.data = data);
  });
}
```

**选型**：用户看得到 loading→方式一（首屏友好）。需要数据完整渲染→方式二（详情页、编辑页）。

### 过渡动画

```vue
<RouterView v-slot="{ Component }">
  <Transition name="fade" mode="out-in">
    <component :is="Component" />
  </Transition>
</RouterView>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
```

`mode="out-in"`——先出后进，避免两个页面同时可见的闪烁。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "页面切换动画怎么实现" | 追问 Transition+RouterView |
| "数据什么时候加载" | 追问导航后 vs 导航前 |

## 相关阅读

- [路由守卫](./route-guards.md)
- [KeepAlive 集成](./keepalive-integration.md)

## 更新记录

- 2026-07-18：事实修正（Phase 3 二审）——数据获取示例补 `useRoute` 导入与定义（原代码引用未定义的 `route`）
- 2026-07-16：新建——命名视图+数据获取时机+路由过渡动画

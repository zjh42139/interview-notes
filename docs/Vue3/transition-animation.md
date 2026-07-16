---
title: Transition / TransitionGroup 动画
description: Vue3 的 Transition 和 TransitionGroup 组件：六个 class 的阶段、JavaScript 钩子、列表动画、与 KeepAlive/Router 的配合
category: Vue3
type: mechanism
score: 0
difficulty: 中级
frequency: ⭐⭐⭐
status: reviewed
created: 2026-07-11
updated: 2026-07-11
reviewed: null
tags:
  - Transition
  - TransitionGroup
  - 动画
  - v-enter
  - v-leave
  - 过渡
---

# Transition / TransitionGroup 动画

> Vue3 内置的 Transition 和 TransitionGroup 提供了声明式的进入/离开动画——不需要手写 CSS 动画的生命周期管理。面试通常不会单考这个，但"路由切换动画怎么做""列表增删动画怎么实现"是常见的综合追问。

## 一句话总结

**`<Transition>` 为单个元素的进入/离开添加过渡动画（六个 class + JavaScript 钩子）；`<TransitionGroup>` 为列表元素的增删移动添加动画（额外加了 v-move 类实现 FLIP）。两者都是纯 CSS 驱动的声明式动画——Vue 只在合适的时机添加/移除 class。**

---

## 核心机制

### Transition 的六个 class

```
进入（Enter）：
  v-enter-from     — 进入的起始状态（添加到 DOM 的下一帧移除）
  v-enter-active   — 进入的过渡过程（全程存在，定义 transition 属性）
  v-enter-to       — 进入的结束状态（过渡结束后移除）

离开（Leave）：
  v-leave-from     — 离开的起始状态
  v-leave-active   — 离开的过渡过程
  v-leave-to       — 离开的结束状态
```

时间线：
```
Enter:  [v-enter-from] ──(transition)──► [v-enter-to]
         └── v-enter-active ──────────┘
         
Leave:  [v-leave-from] ──(transition)──► [v-leave-to]
         └── v-leave-active ──────────┘
```

### 基本用法

```vue
<template>
  <button @click="show = !show">Toggle</button>
  <Transition name="fade">
    <p v-if="show">Hello</p>
  </Transition>
</template>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
```

### 自定义 class 名——配合动画库

```vue
<Transition
  enter-active-class="animate__animated animate__fadeIn"
  leave-active-class="animate__animated animate__fadeOut"
  :duration="{ enter: 500, leave: 300 }"
>
  <p v-if="show">Animated</p>
</Transition>
```

这样可以用 Animate.css、GSAP 等任意 CSS 动画库——替换 Vue 默认的 v-enter-from 等 class。

### JavaScript 钩子

```vue
<Transition
  @before-enter="onBeforeEnter"
  @enter="onEnter"
  @after-enter="onAfterEnter"
  @enter-cancelled="onEnterCancelled"
  @before-leave="onBeforeLeave"
  @leave="onLeave"
  @after-leave="onAfterLeave"
  @leave-cancelled="onLeaveCancelled"
>
  <p v-if="show">Hello</p>
</Transition>

<script setup>
// enter 钩子——用 GSAP 或 JS 驱动的动画
function onEnter(el, done) {
  gsap.from(el, { opacity: 0, duration: 0.5, onComplete: done })
  // done() 调用表示动画结束——Vue 继续后续流程
}
</script>
```

**关键点**：JavaScript 钩子中的 `done` 回调——必须调用，否则 Vue 认为动画未完成，不会移除 v-enter-active 类。

---

## TransitionGroup — 列表动画

Transition 只能包裹单个元素（v-if/v-show）。TransitionGroup 可以包裹列表（v-for），额外提供 **v-move** 类处理元素位置变化。

```vue
<TransitionGroup name="list" tag="ul">
  <li v-for="item in items" :key="item.id">
    {{ item.name }}
  </li>
</TransitionGroup>

<style>
.list-enter-active, .list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from, .list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
/* FLIP: 元素移动到新位置时的过渡 */
.list-move {
  transition: transform 0.5s ease;
}
/* 离开的元素需要脱离文档流——不影响其他元素的位置 */
.list-leave-active {
  position: absolute;
}
</style>
```

**FLIP 原理**：TransitionGroup 在元素位置变化时，记录旧位置（First）→ 新位置（Last）→ 计算位移（Invert）→ 用 transform 动画从旧位置移到新位置（Play）。`v-move` 类的 transition 就是用来平滑这个位移过程的。

---

## 实战模式

### 路由切换动画

```vue
<router-view v-slot="{ Component }">
  <Transition name="page" mode="out-in">
    <component :is="Component" />
  </Transition>
</router-view>

<style>
.page-enter-active, .page-leave-active {
  transition: all 0.3s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
```

`mode="out-in"`：旧元素完全离开后再插入新元素——避免两个元素同时占位导致的布局跳动。

### Transition + KeepAlive

```vue
<router-view v-slot="{ Component }">
  <Transition name="page" mode="out-in">
    <KeepAlive :include="['Home', 'List']">
      <component :is="Component" />
    </KeepAlive>
  </Transition>
</router-view>
```

Transition 负责视觉过渡，KeepAlive 负责组件缓存——两者各司其职。

---

## 易错点

1. **Transition 的 `name` 属性不能动态改** —— 动态改了也不会触发动画重跑。用 key 替代——修改 key 强制重新挂载
2. **Transition 只能有一个直接子元素** —— 不能包裹多个 `<p>`。多个元素用 `<TransitionGroup>`
3. **离开动画的 `position: absolute`** —— list 中元素离开时如果不脱离文档流——其他元素会突然跳位。`.list-leave-active { position: absolute }`
4. **JS 钩子不调 done()** —— Vue 会一直等待动画结束——`v-enter-active` 类不会移除。纯 JS 动画必须调 done()
5. **`appear` 属性** —— 组件首次渲染时也触发进入动画。`<Transition appear>` 或 `<TransitionGroup appear>`

## 相关阅读

- [KeepAlive](./keepalive.md) — Transition + KeepAlive 的配合
- [Teleport / Suspense](./teleport-suspense.md) — 另一个内置动画相关的组件
- [Vue Router KeepAlive 集成](../VueRouter/keepalive-integration.md) — 路由级缓存 + 动画

## 更新记录

- 2026-07-11：新建（六个 class + JS 钩子 + TransitionGroup FLIP + 路由动画 + KeepAlive 配合）

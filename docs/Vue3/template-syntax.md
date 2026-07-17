---
title: "条件渲染 / 列表渲染"
description: v-if vs v-show 区别、template 元素、v-for 与 key 的作用、v-if 与 v-for 优先级
category: Vue3
type: mechanism
score: 85
difficulty: 初级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-16
tags:
  - v-if
  - v-show
  - v-for
  - key
---

# 条件渲染 / 列表渲染

> ⭐⭐⭐⭐⭐｜难度：初级｜Vue3 基础使用最高频考点

## 一句话总结

**v-if 控制DOM是否存在（切换开销大、初始渲染快）、v-show 控制display（初始渲染全执行、切换开销小）。v-for 必须绑定唯一 key——帮助 Diff 算法复用 DOM。Vue3 中 v-if 优先级高于 v-for——不推荐两者同标签使用。**

## 核心机制

### v-if vs v-show

```vue
<!-- v-if：DOM 完全销毁/重建——切换开销大 -->
<div v-if="visible">内容</div>
<!-- visible=false 时，这个 div 不存在于 DOM 中 -->

<!-- v-show：display:none——初始渲染总是执行 -->
<div v-show="visible">内容</div>
<!-- visible=false 时，<div style="display:none">内容</div> -->

<!-- v-if / v-else-if / v-else 链 -->
<div v-if="status === 'loading'">加载中</div>
<div v-else-if="status === 'error'">出错了</div>
<div v-else>正常内容</div>
```

| | v-if | v-show |
|---|------|--------|
| 原理 | 条件为 false 时 DOM 不存在 | 条件为 false 时 `display:none` |
| 切换开销 | 大（销毁+重建 DOM） | 小（只改 CSS） |
| 初始渲染 | 条件 false 时不渲染 | 始终渲染 |
| 适用场景 | 切换频率低（Tab 切换单页） | 切换频率高（展开/收起、弹框显隐） |
| 生命周期 | 切换时触发挂载/卸载钩子（onMounted/onUnmounted） | 不触发 |

**选型决策**：频繁切换用 v-show、一次性/低频切换用 v-if。侧边栏折叠用 v-show、页面级 Tab 用 v-if（配合 KeepAlive）。

### template 元素

```vue
<!-- template 不会渲染到 DOM——用它包裹多个元素而不引入额外标签 -->
<template v-if="loggedIn">
  <span>用户名</span>
  <button>退出</button>
</template>
<!-- 渲染后只有 span 和 button，没有 template -->
```

### v-for 与 key

```vue
<!-- key 帮助 Diff 识别节点——不能是 index！ -->
<div v-for="item in list" :key="item.id">{{ item.name }}</div>

<!-- ❌ 用 index 当 key -->
<div v-for="(item, index) in list" :key="index">
```
**为什么不能用 index 当 key？** 列表开头插入/删除元素，所有后续元素的 index 全变——key(=index) 会对上"错误的"数据，Diff 把旧节点**就地错位复用**：每个节点都要 patch 更新内容（性能浪费），且节点内部状态（input 输入值、组件状态、动画）会留在原位置造成错乱。只有静态列表（从不增删改排序）可以用 index。

### v-if 和 v-for 的优先级

Vue3：`v-if` 优先级 > `v-for`。**不推荐同标签使用**——v-if 先执行时 v-for 的变量还未定义，直接报错。

```vue
<!-- ❌ 不要同标签用 -->
<li v-for="item in items" v-if="item.active">{{ item.name }}</li>

<!-- ✅ 用 computed 过滤 -->
<li v-for="item in activeItems" :key="item.id">{{ item.name }}</li>
<script setup>
const activeItems = computed(() => items.value.filter(i => i.active))
</script>

<!-- ✅ 或用 template 包裹 -->
<template v-for="item in items" :key="item.id">
  <li v-if="item.active">{{ item.name }}</li>
</template>
```

## 深度拓展

### key 在 Diff 中的作用

没有 key 时，Vue 按节点顺序逐个对比——复用同一位置的旧节点。有 key 时，Vue 先按 key 做快速匹配——找到可复用的节点，再处理新增/删除/移动。key 让 Diff 从 O(n) 的"位置匹配"升级为 O(n) 的"身份匹配"——节点可以跨位置复用。

### 数组变更检测

Vue3 用 Proxy——数组的 push/pop/shift/unshift/splice/sort/reverse 全部自动触发更新。不需要 Vue2 的 `$set` 或重写数组方法。直接 `arr[0] = newValue` 也会触发——这是 Proxy 相比 defineProperty 的重要改进。

## 易错点

❌ **用 index 当 key** —— 面试必问。列表有增删时 index 全乱——节点被就地错位复用，全量 patch + 内部状态错位。

❌ **v-for 和 v-if 同标签** —— Vue3 中 v-if 优先级更高——变量未定义直接报错。至少用 template 包一层。

❌ **v-if 和 v-show 随便选** —— 频繁切换的侧边栏/弹窗用 v-show；Tab 切换页用 v-if+KeepAlive（避免每次重建组件）。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "v-if 和 v-show 有什么区别" | 追问 DOM 存在性 vs display:none |
| "为什么 v-for 要加 key" | 追问 index 为什么不行——Diff 算法复用 |
| "v-if 和 v-for 能同标签吗" | 追问优先级——"Vue2 和 Vue3 的差异是什么" |

## 相关阅读

- [Diff / Patch](./diff-patch.md) —— key 在 Diff 中的底层作用
- [Vue3 响应式原理](./reactivity.md) —— Proxy 实现数组变更检测
- [生命周期](./lifecycle.md)

## 更新记录

- 2026-07-16：新建——v-if/v-show+template+v-for+key+优先级+数组变更检测

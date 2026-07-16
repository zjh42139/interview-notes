---
title: 透传 Attributes（$attrs）
description: Vue3 透传 Attributes 机制——$attrs 访问、inheritAttrs、class/style 合并规则、组件封装中的实际应用
category: Vue3
type: mechanism
score: 80
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-16
tags:
  - $attrs
  - 透传
  - inheritAttrs
  - 组件封装
---

# 透传 Attributes（$attrs）

> ⭐⭐⭐⭐｜难度：中级｜组件封装的核心技术

## 一句话总结

**父组件传给子组件的非 props 属性自动"穿透"到子组件的根元素上——class 和 style 会合并而非覆盖。`inheritAttrs: false` 阻止自动透传，`$attrs` 手动分配这些属性给指定元素——组件二次封装的核心手段。**

## 核心机制

### 默认透传行为

```vue
<!-- 父组件 -->
<MyInput type="text" placeholder="请输入" class="custom" />

<!-- MyInput.vue —— 单根元素 -->
<template>
  <input :value="modelValue" />
</template>
<!-- 渲染结果：<input value="..." type="text" placeholder="请输入" class="custom" /> -->
<!-- type 和 placeholder 自动穿透到根元素 input 上 -->
```

父组件写了 `type="text"` 和 `class="custom"`——子组件内部没有声明这些 props，自动透传到根 `&lt;input>` 上。

### class 和 style 的合并规则

```vue
<!-- 父组件传了 class="custom" -->
<MyButton class="custom" />

<!-- MyButton 根元素自己有 class="btn" -->
<button class="btn">点击</button>

<!-- 渲染结果：class 合并而不是覆盖 -->
<button class="btn custom">点击</button>
```

透传的 class/style 和组件自身的 class/style **合并**——这是 Vue3 特意设计的。合并后外部样式和组件内部样式同时生效——组件库（Element Plus）的所有组件靠这个机制实现外部定制样式。

### inheritAttrs: false

不需要透传时——显式关闭：

```vue
<script setup>
defineOptions({ inheritAttrs: false })
</script>
```

关闭后父组件传的非 props 属性不会自动挂在根元素上——根元素更干净。但属性没有消失——存在 `$attrs` 里，手动分配。

### $attrs —— 手动分配透传属性

组件封装的核心模式：

```vue
<!-- 给 Element Plus 的 ElInput 二次封装 -->
<template>
  <div class="my-input-wrapper">
    <label>{{ label }}</label>
    <ElInput v-bind="$attrs" />
    <!-- v-bind="$attrs" 把父组件传给 MyInput 的属性全部转发给 ElInput -->
  </div>
</template>

<script setup>
defineOptions({ inheritAttrs: false })
defineProps({ label: String })
</script>
```

父组件使用 `&lt;MyInput label="用户名" placeholder="请输入" />`——`placeholder` 被 `$attrs` 转发给了 `ElInput`。wrapper div 上没有属性的痕迹。

## 深度拓展

### $attrs vs props 的选择

| | props | $attrs |
|---|------|--------|
| 声明式/显式 | ✅ defineProps 声明 | ❌ 隐式传入 |
| 类型检查 | ✅ TS 泛型 | ❌ 无 |
| 透传给子组件 | 手动绑定 | `v-bind="$attrs"` 一行 |
| 调试友好 | ✅ DevTools 可看 | ❌ 看不到 |

**选型**：组件自己用的属性→props。只是转发给子组件的属性→$attrs。二次封装 Element Plus 时——`placeholder/size/disabled` 等属性全部走 $attrs 透传，不用每个都声明 props。

## 易错点

❌ **多根元素组件不会自动透传** —— Vue3 支持多根元素（Fragment），但没有单一根元素时属性不知道透传给谁——控制台会警告。需要显式 `v-bind="$attrs"` 指定。

❌ **$attrs 不是响应式的** —— $attrs 对象里的值变化组件不会重渲染。但包含了透传的非 props 属性——同时包含 class 和 style（Vue3 独有，Vue2 不含）。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "非 props 属性怎么传递" | 追问 $attrs 透传机制 |
| "class 为什么能同时生效" | 追问 class/style 合并规则 |
| "二次封装 Element Plus 怎么做" | 追问 inheritAttrs+$attrs+v-bind |

## 相关阅读

- [组件通信](./component-communication.md)
- [v-model](./v-model.md)

## 更新记录

- 2026-07-16：新建——透传机制+class合并+inheritAttrs+$attrs转发+多根元素

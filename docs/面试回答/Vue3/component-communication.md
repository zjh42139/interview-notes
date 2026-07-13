---
title: 组件通信 面试回答
description: 面试中如何回答 Vue3 组件通信方案——30 秒速答 + 2 分钟详解 + 追问预判
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-06
updated: 2026-07-10
reviewed: null
tags:
  - 组件通信
  - props
  - emits
  - provide/inject
  - Pinia
  - 面试回答
---

# 组件通信 面试回答

## Q1: Vue3 组件间有哪些通信方式？怎么选？

### 30 秒版本

"Vue3 组件通信方式从近到远说：父子组件用 props + emits、兄弟或跨层级用 Pinia、深层嵌套用 provide/inject、全局事件用 mitt 或 Pinia、路由参数用 useRoute。最常用的是 props/emits + Pinia 的组合——简单直白，覆盖 90% 场景。"

### 2 分钟版本

"按通信距离分层选择：

**父子通信——props + emits**：Props 父传子（单向数据流，子不能改 props），emits 子传父（`$emit` + defineEmits）。这是 Vue 最基本也是最推荐的通信方式。v-model 本质是 props + emits 的语法糖——`v-model:visible="val"` 展开就是 `:visible="val" @update:visible="val = $event"`。

**兄弟/跨层级——Pinia**：中等复杂度以上的项目，兄弟组件通信直接用 Pinia。全局响应式状态——A 组件改 store，B 组件自动更新，不需要中间人。尽量避免通过父组件中转——耦合高、可维护性差。

**深层嵌套——provide/inject**：适合组件树深层传值——比如表单组件传校验规则、主题配置。注意 inject 的默认值——组件被单独使用时不会因为缺少 provide 而报错。

**全局事件——mitt 或 Pinia**：Vue3 移除了 `$on/$off`。全局事件的场景很少了——绝大多数可以用 Pinia 替代。剩下的（如跨组件库通信）用 mitt——轻量 EventEmitter。

**路由传参——useRoute + useRouter**：页面间通信——query/params 传参。注意 params 在 `createWebHistory` 下刷新会丢失。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "provide/inject 是响应式的吗" | 取决于你 provide 的值——传 ref 就是响应式的、传普通字符串就不是。provide/inject 本身只是透传，不创造也不剥离响应式 |
| "Pinia 和 Vuex 有什么区别" | Pinia 更轻量——没有 mutations（actions 直接改 state）、完全 TS 类型推导、去掉了 modules（用多个 store 替代）、支持 Composition API 风格 |
| "Vue3 为什么移除 $on/$off" | EventBus 模式容易导致事件名冲突、事件流不清晰、难以 debug。Pinia 的状态管理是更可预测的替代方案 |

## 别踩的坑

1. **"子组件改 props"** —— 绝对不要。子组件通过 emit 通知父组件改，或者用 `v-model` 双向绑定
2. **provide/inject 当状态管理用** —— provide/inject 适合组件库/表单这种有明确层级关系的场景。全局状态管理还是用 Pinia，provide/inject 不适合跨页面
3. **所有跨组件通信都用 Pinia** —— 父子通信用 props/emits 足够。不要把简单问题复杂化

## 相关阅读

- [v-model](../../Vue3/v-model.md)
- [Composition API](../../Vue3/composition-api.md)
- [组件通信 知识文档](../../Vue3/component-communication.md)

## 更新记录

- 2026-07-10：重写（30秒/2分钟/追问预判/易错点 标准格式）

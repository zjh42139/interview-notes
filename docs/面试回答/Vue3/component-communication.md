---
title: 组件通信 面试回答
description: Vue3 组件通信的 30 秒速答和 2 分钟深度回答
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-10
updated: 2026-07-10
---

# 组件通信 面试回答

> 对应题库：[面试题库/Vue3](../../面试题库/Vue3.md)

## 30 秒版

Vue3 组件通信有 8 种方式。父子之间用 props + emits——这是最基本的单向数据流。跨层级用 provide/inject——祖先注入后代直接拿。全局状态用 Pinia。兄弟和任意组件之间可以用事件总线（不推荐）或者共享状态。还有 v-model 双向绑定、$refs 直接访问、$parent/$root（不推荐）、路由参数传值。

---

## 2 分钟版

**第一：props + emits——父子通信的标准。**

props 是父传子——父组件把数据绑定到子组件的属性上，子组件用 `defineProps` 接收。Vue 的单向数据流原则——子组件不应该修改 props，要改就通过 emit 发事件让父改。emits 是子传父——子组件 `defineEmits` 声明事件，`emit('update', value)` 触发，父组件 `@update="handleUpdate"` 响应。v-model 本质就是 `:modelValue` + `@update:modelValue` 的语法糖。

**第二：provide/inject——跨层级利器。**

父组件 `provide('key', value)`，无论隔多少层，后代 `inject('key')` 都能拿到。适合主题、语言、权限这些"需要所有后代都知道"的数据。如果 provide 的是 ref，后代拿到的也是响应式的——改了后代自动更新。注意 provide 的值如果不是响应式的，改了后代不会更新——所以传数据的时候要传 ref 或 reactive，不要传普通值。

**第三：全局状态——Pinia。**

当组件树太深、或者数据在多个不相干的组件之间共享时，props/emits 逐层传递太痛苦——这叫 prop drilling。Pinia 解决这个问题——store 是全局的，任何组件都可以直接读写。Pinia 比 Vuex 更简洁——没有 mutation，state 直接改，getter 就是 computed，action 支持 async。

**第四：其他方式及什么时候用。**

`$refs`——直接访问子组件实例，适合"父组件需要调用子组件的方法"（如 `el-form.validate()`）。事件总线（mitt）——Vue3 移除了 `$on/$off`，需要第三方库。适合没有关联的两个组件之间通信——但全局事件难追踪，不如 Pinia 清晰。路由参数——`/user/:id` 通过 `useRoute().params` 拿数据，适合页面跳转时传递简单 ID。

---

## 追问预判

| 追问 | 回应要点 |
|------|----------|
| "provide/inject 和 props 怎么选" | props 用于有明确父子关系的场景——数据流清晰可追踪。provide/inject 用于跨多层的场景——避免中间组件"透传"不需要的 props |  
| "为什么 Vue3 移除了 $on/$off" | 全局事件总线让数据流难以追踪——一个事件可以在任何地方被触发和监听。Pinia/Composition API 的 hook 封装能达到同样效果但更可预测 |
| "兄弟组件通信怎么最优雅" | 共享父组件状态——把状态提升到父组件，两兄弟都通过 props 接收。如果兄弟无共同父组件，用 Pinia store |

---

## 别踩的坑

- "props 是只读的还去改"——改 props 不会报错（非生产环境下 Vue 会警告），但数据流会乱。应该 emit 让父改或用 computed 派生
- "provide 了普通值而不是 ref"——普通值改了后代不会响应——必须传响应式对象
- "把所有状态都放 Pinia"——全局状态太多会让数据流不可追踪。组件内部的 UI 状态（弹窗开不开、tab 选哪个）留在组件内，只有跨组件共享的才放 Pinia

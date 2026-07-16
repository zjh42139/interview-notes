---
title: v-model 面试回答
description: 面试中如何回答 v-model——30 秒速答 + 2 分钟详解 + 追问预判
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-11
updated: 2026-07-11
reviewed: null
tags:
  - v-model
  - 双向绑定
  - 语法糖
  - 组件通信
  - defineModel
  - 面试回答
---

# v-model 面试回答

## Q1: v-model 是什么？在原生元素和组件上分别怎么展开？

### 30 秒版本

"v-model 是 prop + event 的语法糖。原生 `<input>` 上等价于 `:value + @input`（不同元素对应不同属性和事件）。组件上默认等价于 `:modelValue + @update:modelValue`。Vue3 支持多个 v-model、自定义修饰符、v-model 参数——替代了 Vue2 的 .sync 修饰符。"

### 2 分钟版本

"v-model 看起来像双向绑定，但 Vue 仍然是单向数据流——v-model 只是帮你同时写了 prop 和 event handler 而已。

**原生元素的展开规则**：
- `<input type="text">`：展开为 `:value="val" @input="val = $event.target.value"`
- `<input type="checkbox">`：展开为 `:checked="val" @change="val = $event.target.checked"`
- `<select>`：展开为 `:value="val" @change="val = $event.target.value"`

**组件上的展开**：
- 默认：`<Child :modelValue="val" @update:modelValue="val = $event" />`
- 子组件：`defineProps(['modelValue'])` + `defineEmits(['update:modelValue'])`
- 子组件用 `emit('update:modelValue', newValue)` 通知父组件更新

**Vue3 的 v-model 升级**：
1. 多个 v-model：`<Child v-model:title="title" v-model:content="content" />`→子组件 emit `update:title` 和 `update:content`
2. 自定义修饰符：`v-model.capitalize="val"`→子组件的 `modelModifiers` prop 包含 `{ capitalize: true }`
3. Vue 3.4+ defineModel：`const model = defineModel()`——一行替代 prop+emit，自动推断类型

**Vue3 合并了 Vue2 的 .sync**：Vue2 的 `:title.sync="title"` 在 Vue3 中统一为 `v-model:title="title"`。现在不需要记住两个不同的语法了。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "v-model 是双向绑定吗" | 语法上是双向的——但本质是单向数据流 + 事件监听。数据始终从父流向子，子通过 emit 通知父更新 |
| "defineModel 和 prop+emit 有什么区别" | defineModel 是 Vue3.4 的编译宏——更简洁、自动生成 prop 和 emit。生成的代码和手动写 prop+emit 完全等价 |
| "v-model 修饰符怎么处理" | 子组件通过 `modelModifiers` prop 接收修饰符对象——如 `.capitalize` → `modelModifiers.capitalize === true`。在 emit 前处理数据即可 |

## Q2: Vue3 的 v-model 相比 Vue2 有哪些变化？

### 30 秒版本

"Vue3 的 v-model 三处大改：默认 prop 从 value 改为 modelValue、取消了 .sync 改为 v-model 参数语法、支持任意多个 v-model。可选绑定的 prop 和 event 名都改了——`v-model:title` 替代 `:title.sync`。"

### 追问预判

| 面试官追问 | 你的回答 |
|-----------|---------|
| "Vue2 的 .sync 在 Vue3 中怎么写" | `:title.sync="val"`→`v-model:title="val"`。功能等价——语法统一到 v-model 参数 |
| "Vue2 的 v-model 在 Vue3 还能用吗" | 组件上的默认 v-model（无参数）——prop 名从 value 变为 modelValue。需要适配 |

## 别踩的坑

1. **"v-model 绑定的值可以直接改"** —— 不能改 prop。Vue 会警告："避免直接修改 prop"。必须通过 emit 通知父组件改
2. **defineModel 需要 Vue 3.4+** —— 老项目用 prop+emit 手动写
3. **多个 v-model 时 event 命名** —— 非默认 v-model（如 `v-model:title`）emit 的是 `update:title`，不是 `update:modelValue`

## 相关阅读

- [v-model 知识文档](../../Vue3/v-model.md)
- [组件通信 面试回答](./component-communication.md)
- [响应式原理 面试回答](./reactivity.md)

## 更新记录

- 2026-07-11：新建（30秒/2分钟/追问预判/易错点 标准格式）

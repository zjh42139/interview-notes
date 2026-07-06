---
title: 组件封装实践
description: 组件封装实践以用户选择器为例，从需求分析到接口设计、实现、优化的完整过程，涵盖 Props/Events/Slots/Expose 四个维度及 loading/empty/error 三种状态
category: 项目实战
section: 业务场景
difficulty: 中高级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-06
updated: 2026-07-06
reviewed: null
tags:
  - 组件封装
  - Props设计
  - 接口设计
  - 状态管理
---

# 组件封装实践

> "封装组件不只是写个 `.vue` 文件。Props 怎么设计才灵活？暴露出哪些方法？loading/empty/error 三种状态有没有覆盖？——从这四个维度讲清楚，面试官就知道你不再是个只会用组件的人。"

---

## 一句话总结

组件封装应从 **Props 设计**（modelValue / multiple / disabled / placeholder）、**Events 设计**（update:modelValue / change）、**Slots 设计**（default / empty / prefix）和 **Expose 暴露方法**（refresh / reset）四个维度设计接口，同时覆盖 **loading / empty / error** 三种异步状态。

---

## 核心机制：以"用户选择器"为例

### 1. 需求分析

在后台管理系统中，多个页面都需要"选择一个或多个用户"：任务分配、审批流程、权限授予... 如果不封装，每个页面都要写一遍获取用户列表、搜索、分页的逻辑。封装成 `UserSelector` 组件后，使用方只需：

```vue
<UserSelector v-model="selectedUsers" multiple placeholder="请选择审批人" />
```

### 2. 接口设计

**四维度接口设计模型：**

| 维度 | 说明 | UserSelector 示例 |
|------|------|-------------------|
| Props | 外部传入的配置 | `modelValue`, `multiple`, `disabled`, `placeholder` |
| Events | 组件向外的通信 | `update:modelValue`, `change` |
| Slots | 内容自定义 | `default`（选项内容）, `empty`（空数据）, `prefix`（前缀图标） |
| Expose | 暴露给父组件的方法 | `refresh()`, `reset()`, `focus()` |

### 3. 完整实现

```vue
<!-- src/components/UserSelector.vue -->
<template>
  <el-select
    v-model="selected"
    :multiple="multiple"
    :disabled="disabled"
    :placeholder="placeholder"
    :loading="loading"
    filterable
    remote
    :remote-method="handleSearch"
    @change="handleChange"
    @visible-change="handleVisibleChange"
  >
    <template v-if="multiple" #prefix>
      <slot name="prefix">
        <el-icon><User /></el-icon>
      </slot>
    </template>

    <!-- loading 状态 -->
    <el-option v-if="loading" value="" disabled>
      <el-skeleton :rows="1" animated />
    </el-option>

    <!-- empty 状态 -->
    <div v-if="!loading && options.length === 0" class="empty-state">
      <slot name="empty">
        <el-icon><Inbox /></el-icon>
        <span>暂无数据</span>
      </slot>
    </div>

    <!-- error 状态 -->
    <div v-if="error" class="error-state">
      <el-icon><WarningFilled /></el-icon>
      <span>{{ error }}</span>
      <el-button size="small" @click="fetchUsers">重试</el-button>
    </div>

    <!-- 正常选项 -->
    <el-option
      v-for="user in options"
      :key="user.id"
      :label="user.name"
      :value="user.id"
    >
      <slot :user="user">
        <div class="user-option">
          <el-avatar :size="24" :src="user.avatar" />
          <span>{{ user.name }}</span>
          <span class="dept">{{ user.department }}</span>
        </div>
      </slot>
    </el-option>
  </el-select>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { debounce } from 'lodash-es'
import { getUserList } from '@/api/user'
import type { User } from '@/types/user'

// ========== Props ==========
interface Props {
  modelValue: number | number[]
  multiple?: boolean
  disabled?: boolean
  placeholder?: string
  maxCount?: number            // 多选时最多选择人数
}
const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  disabled: false,
  placeholder: '请选择用户',
})

// ========== Events ==========
const emit = defineEmits<{
  'update:modelValue': [value: number | number[]]
  change: [value: number | number[]]
}>()

// ========== 状态 ==========
const options = ref<User[]>([])
const loading = ref(false)
const error = ref('')
const searchKeyword = ref('')

// 双向绑定
const selected = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
    emit('change', val)
  },
})

// ========== 数据获取 ==========
async function fetchUsers(keyword = '') {
  loading.value = true
  error.value = ''
  try {
    const res = await getUserList({ keyword, pageSize: 50 })
    options.value = res.data.list
  } catch (e: any) {
    error.value = e.message || '加载失败，请重试'
    options.value = []
  } finally {
    loading.value = false
  }
}

// 搜索防抖
const handleSearch = debounce((query: string) => {
  searchKeyword.value = query
  fetchUsers(query)
}, 300)

// 打开下拉时加载
function handleVisibleChange(visible: boolean) {
  if (visible && options.value.length === 0) {
    fetchUsers()
  }
}

// ========== Expose 暴露方法 ==========
function refresh() {
  fetchUsers(searchKeyword.value)
}
function reset() {
  options.value = []
  searchKeyword.value = ''
  error.value = ''
}

defineExpose({ refresh, reset })
</script>
```

---

## 深度拓展

### 追问 1：v-model 的实现原理

`v-model` 本质上是 `modelValue` prop + `update:modelValue` 事件的语法糖。通过 `computed` 的 get/set 实现：

```typescript
// Vue 编译后等价于：
// :model-value="selectedUsers" @update:model-value="val => selectedUsers = val"

const selected = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})
```

支持多个 v-model（如 `v-model:visible`）：

```typescript
// 父组件：<UserSelector v-model="users" v-model:visible="dialogVisible" />
const props = defineProps<{
  modelValue: number[]
  visible: boolean
}>()
const emit = defineEmits<{
  'update:modelValue': [value: number[]]
  'update:visible': [value: boolean]
}>()
```

### 追问 2：Slots 的灵活性设计

| Slot 类型 | 用途 | 示例 |
|-----------|------|------|
| 默认 slot | 自定义选项内容 | 加头像、部门信息 |
| 具名 slot（`#empty`） | 空数据时展示 | 插图 + 引导文案 |
| 具名 slot（`#prefix`） | 前缀图标自定义 | 不同场景不同图标 |
| 作用域 slot | 传递数据给父组件 | `#default="{ user }"` 获取当前行数据 |

### 追问 3：loading / empty / error 三种状态的覆盖

| 状态 | 触发条件 | 展示内容 |
|------|----------|----------|
| loading | 请求进行中 | 骨架屏 / Loading 动画 |
| empty | 请求成功但无数据 | 空状态插图 + "暂无数据" |
| error | 请求失败 | 错误信息 + "重试" 按钮 |

面试时要强调：**"每个异步组件我都覆盖了 loading / empty / error 三种状态"**，这是一个有经验的开发者的标志。

---

## 项目实战

### 后台管理系统中的复用组件清单

典型后台管理系统中值得封装的业务组件：

| 组件 | 复用场景 | 复杂度 |
|------|----------|--------|
| UserSelector | 任务分配、审批、权限 | 中 |
| DeptTree | 组织架构选择 | 高 |
| FileUploader | 多处文件上传 | 中 |
| DateRangePicker | 多处日期范围筛选 | 低 |
| ExportButton | 各处导出功能 | 低 |

### 组件文档规范（推荐）

```markdown
## UserSelector

### Props
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | number \| number[] | - | 选中的用户 ID |
| multiple | boolean | false | 是否多选 |
| disabled | boolean | false | 是否禁用 |
| placeholder | string | '请选择用户' | 占位文本 |

### Events
| 事件名 | 参数 | 说明 |
|--------|------|------|
| update:modelValue | (value) | 选中值变化 |
| change | (value) | 选中值变化（同上） |

### Slots
| 插槽名 | 作用域 | 说明 |
|--------|--------|------|
| default | { user } | 自定义选项内容 |
| empty | - | 空数据展示 |
```

---

## 易错点

1. **Props 和 v-model 不生效**：组件内部直接修改了 `props.modelValue`（如 `props.modelValue = xxx`），但 Props 是只读的。正确做法：通过 `emit('update:modelValue', val)` 通知父组件修改，或用 `computed` get/set 代理。

2. **`defineExpose` 忘记导出方法**：父组件通过 `ref` 调用子组件方法时（如 `userSelectorRef.value.refresh()`），子组件必须用 `defineExpose` 显式暴露方法，否则拿不到。

3. **`v-for` 中的 key 使用 index**：选项列表增删时 index 改变会导致 DOM 复用出错，必须用唯一 ID 做 key（如 `:key="user.id"`）。

4. **防抖函数未正确销毁**：组件卸载时 `debounce` 返回的函数仍可能执行，导致访问已销毁的响应式数据报错。在 `onUnmounted` 中调用 `.cancel()`。

---

## 相关阅读

- [Vue3 Composition API](../../Vue3/composition-api) — Props / Events / Slots 基础语法
- [ECharts 实战](./echarts.md) — 图表组件的封装方法
- [大文件上传](./big-file-upload.md) — FileUploader 组件的设计方案

---

## 更新记录

- 2026-07-06：完成内容填充，新增 UserSelector 完整案例、Props/Events/Slots/Expose 四维度设计、loading/empty/error 三状态覆盖、v-model 原理、组件文档规范

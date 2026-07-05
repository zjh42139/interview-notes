---
title: 防重复请求
description: 防重复请求是在短时间内阻止相同请求的重复发送，通过请求 Key 去重 + AbortController 取消 + Loading 状态三重防护，保障数据一致性
category: 项目实战
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: completed
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - 防重复
  - AbortController
  - 取消请求
  - 并发
  - 竞态条件
---

# 防重复请求

> "面试官问：用户快速点击了 10 次提交按钮，你的系统会发生什么？——这就是防重复请求要回答的问题。"

---

## 一句话总结

防重复请求是通过**请求 Key 去重（pendingRequests Map）+ AbortController 取消前一个 + UI 层 loading/disabled 状态**三重防护，确保同一时刻不会存在两个相同语义的请求，避免带宽浪费和数据不一致。

---

## 核心机制

### 1. 请求 Key 生成策略

唯一标识一个请求的核心是生成稳定的 key：

```typescript
function generateRequestKey(config: InternalAxiosRequestConfig): string {
  const { method, url, params, data } = config
  // url + method + 参数序列化 保证语义相同 = key 相同
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&')
}
```

注意：`JSON.stringify` 对 key 顺序敏感，`{a:1,b:2}` 和 `{b:2,a:1}` 会生成不同的 key。生产环境建议用稳定排序的序列化方案或直接用 `qs.stringify`。

### 2. 请求队列管理

```typescript
// 全局请求池
const pendingRequests = new Map<string, AbortController>()

function addPending(config: InternalAxiosRequestConfig): void {
  const key = generateRequestKey(config)
  // 已存在同 key 请求 → 取消前一个
  pendingRequests.get(key)?.abort()
  const controller = new AbortController()
  config.signal = controller.signal
  pendingRequests.set(key, controller)
}

function removePending(config: InternalAxiosRequestConfig): void {
  const key = generateRequestKey(config)
  pendingRequests.delete(key)
}

// 在 Axios 拦截器中集成
instance.interceptors.request.use((config) => {
  addPending(config)       // 发出前：加入队列并取消前一个
  return config
})

instance.interceptors.response.use(
  (response) => {
    removePending(response.config)   // 成功后：移除
    return response
  },
  (error) => {
    if (!axios.isCancel(error)) {
      removePending(error.config)    // 非取消类失败：移除
    }
    return Promise.reject(error)
  }
)
```

### 3. 三种防护层级

| 层级 | 手段 | 适用场景 |
|------|------|---------|
| UI 层 | `loading` + `disabled` | 表单提交、按钮点击 |
| 请求层 | `pendingRequests Map` + `AbortController` | GET 请求去重、Tab 切换 |
| 业务层 | 防抖（debounce） | 搜索框输入、筛选条件变化 |

三层依次递进：UI 层最快、最直接；请求层最稳、覆盖全局；业务层让高频操作不产生冗余请求。

---

## 深度拓展

### 追问 1：竞态条件——后发请求先返回怎么办？

典型场景：用户连续切换两个 Tab，Tab A 的数据量很大、返回慢，Tab B 的数据量小、返回快。结果：页面先渲染 B 的数据，然后被 A 的迟滞响应覆盖。

解决方案：

```typescript
// 方案1：请求级 AbortController（推荐）
let tabController: AbortController | null = null
async function switchTab(tabId: string) {
  tabController?.abort()              // 取消上一个 Tab 的请求
  tabController = new AbortController()
  const data = await http.get(`/api/tabs/${tabId}`, {
    signal: tabController.signal,
  })
  // render data...
}

// 方案2：版本号校验（兼容无法取消的场景）
let tabVersion = ref(0)
async function switchTab(tabId: string) {
  const version = ++tabVersion.value
  const data = await http.get(`/api/tabs/${tabId}`)
  if (version === tabVersion.value) {   // 只处理最新一次的结果
    // render data...
  }
}
```

### 追问 2：API 层 vs 组件层去重，哪个更好？

**API 层去重**（拦截器统一处理）的优点是全局生效、无侵入；缺点是粒度粗，某些场景需要"允许重复发送"（如并发上传分片）。**组件层去重**（每个请求自行管理）优点是灵活；缺点是容易遗漏。

**最佳实践**：拦截器只取消"完全相同的 GET 请求"（幂等性保证），POST/PUT/DELETE 等非幂等请求由 UI 层的 loading + disabled 防护。

### 追问 3：搜索防抖 + 取消请求的组合

```typescript
import { ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'

const keyword = ref('')
const loading = ref(false)
let searchController: AbortController | null = null

// 300ms 防抖 + 取消上一次搜索
const debouncedSearch = useDebounceFn(async (kw: string) => {
  searchController?.abort()
  searchController = new AbortController()
  loading.value = true
  try {
    const list = await http.get('/api/search', {
      params: { keyword: kw },
      signal: searchController.signal,
    })
    // render list...
  } catch (e: any) {
    if (e?.name !== 'CanceledError') { /* handle error */ }
  } finally {
    loading.value = false
  }
}, 300)

watch(keyword, (val) => debouncedSearch(val))
```

---

## 项目实战

### 场景 1：表单提交——UI 层防护

```vue
<template>
  <el-form @submit.prevent="handleSubmit">
    <!-- ... -->
    <el-button type="primary" :loading="submitting" :disabled="submitting" @click="handleSubmit">
      {{ submitting ? '提交中...' : '确认提交' }}
    </el-button>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const submitting = ref(false)

async function handleSubmit() {
  if (submitting.value) return        // 防止快速双击
  submitting.value = true
  try {
    await http.post('/api/submit', formData)
    ElMessage.success('提交成功')
  } finally {
    submitting.value = false          // 放在 finally 里，保证失败也能恢复
  }
}
</script>
```

### 场景 2：多 Tab 切换——请求层防护

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
const activeTab = ref('tab1')
let tabAbortController: AbortController | null = null

async function loadTabData(tab: string) {
  tabAbortController?.abort()
  tabAbortController = new AbortController()
  const data = await http.get(`/api/dashboard/${tab}`, {
    signal: tabAbortController.signal,
  })
  // 渲染数据...
}

watch(activeTab, loadTabData, { immediate: true })
</script>
```

---

## 易错点

1. **`loading.value = false` 写在 try 里而不是 finally 里**：如果请求抛出异常，按钮会永远 disabled。

2. **AbortController 取消后不处理 CanceledError**：被取消的请求会抛出 `CanceledError`（axios 中叫 `Cancel`），如果你在 catch 里弹了错误提示，用户会看到莫名其妙的报错。必须判断 `axios.isCancel(error)` 或 `error.name === 'CanceledError'`。

3. **POST 请求也做自动去重**：POST 是非幂等操作，如果前一个 POST 被取消，后端可能已经写入数据但前端不知道。POST 只应该用 UI 层 loading + disabled 防护，不能自动 abort。

4. **忘记在组件卸载时取消请求**：组件销毁后请求回调可能访问已销毁的响应式数据。用 `onUnmounted` + `AbortController` 清理。

---

## 相关阅读

- [Axios 封装](./axios-encapsulation.md) — 拦截器基座，本文在基座上增加去重能力
- [防抖节流](../../JavaScript/debounce-throttle.md) — 前端防抖的实现原理
- [文件上传](../业务场景/file-upload.md) — 大文件分片上传的并发控制

---

## 更新记录

- 2026-07-05：完成内容填充（Phase 2），新增竞态条件分析、三层防护模型、完整代码示例

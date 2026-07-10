---
title: Diff / Patch
description: Vue3 的虚拟 DOM Diff 算法与 patch 机制，包含 LIS 最长递增子序列
category: Vue3
type: mechanism
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-05
updated: 2026-07-05
reviewed: 2026-07-05
tags:
  - Diff
  - patch
  - patchKeyedChildren
  - LIS
  - Key
  - Block Tree
  - PatchFlag
---

# Diff / Patch

> 面试官问"v-for 为什么需要 key"，顺着这条线能问到 LIS 手写。Vue3 的 Diff 已经不再是 Vue2 那套双端对比了，这是一个核心区分点。

## 一句话总结

Vue3 Diff 通过 **Block Tree 跳过静态节点** + **PatchFlag 标记动态类型** + **5 步法处理子节点** + **LIS 最小化移动**，将 Diff 时间复杂度从理论上优化到 O(n)。简单说：编译器告诉运行时要对比什么，运行时就不需要盲比了。

## 核心机制

### 1. 编译时优化：Block Tree + PatchFlag

这是 Vue3 Diff 快的关键 —— **把运行时的工作提前到编译时做**。

```html
<!-- 编译前 -->
<div>
  <h1>{{ title }}</h1>
  <p>static text</p>
  <span :class="cls">{{ count }}</span>
</div>

<!-- 编译后（简化表示） -->
<div>
  <h1>{{ title }}</h1>          <!-- PatchFlag: TEXT -->
  <p>static text</p>            <!-- 无 PatchFlag，被 hoist 成常量 -->
  <span :class="cls">{{ count }}</span> <!-- PatchFlag: CLASS | TEXT -->
</div>
```

编译器生成一个 `dynamicChildren` 数组，在 diff 时**只遍历动态子节点**，静态节点直接复用。这被称为 **Block Tree** 或 **靶向更新**。

```ts
// 编译产物中的 openBlock / createBlock
// Block 节点会收集所有动态子孙节点到 dynamicChildren
const vnode = createBlock('div', null, [
  createVNode('h1', { text: ctx.title }, null, PatchFlags.TEXT),
  createVNode('span', { class: ctx.cls, text: ctx.count }, null, PatchFlags.CLASS | PatchFlags.TEXT),
])
// vnode.dynamicChildren = [h1, span] — 静态 p 不在其中
```

### 2. patchKeyedChildren 五步法

面试时必须能说出这 5 步。这是 Vue3 相比 Vue2 双端对比的最大改进。

```mermaid
flowchart TD
    A[新旧 children 数组] --> B{"都有 key？"}
    B -->|否| C[走 patchUnkeyedChildren<br/>暴力对比]
    B -->|是| D[Step1: 头部对比<br/>相同 key 的节点直接 patch]
    D --> E[Step2: 尾部对比<br/>从末尾找相同 key 节点直接 patch]
    E --> F{"旧节点遍历完？"}
    F -->|是| G[Step3: 挂载新节点<br/>剩余新节点全部 mount]
    F -->|否| H{"新节点遍历完？"}
    H -->|是| I[Step4: 卸载旧节点<br/>剩余旧节点全部 unmount]
    H -->|否| J[Step5: 乱序处理<br/>构建 key→index 映射 + LIS]
    J --> K[移动 DOM 到正确位置]
```

**Step 5 乱序处理详细过程**：

```ts
// 伪代码：patchKeyedChildren 的核心逻辑
function patchKeyedChildren(c1: VNode[], c2: VNode[]) {
  let i = 0, e1 = c1.length - 1, e2 = c2.length - 1

  // Step 1: 头部对比 — 从头开始找相同 key
  while (i <= e1 && i <= e2 && c1[i].key === c2[i].key) {
    patch(c1[i], c2[i])  // 递归更新
    i++
  }
  // Step 2: 尾部对比 — 从尾开始找相同 key
  while (i <= e1 && i <= e2 && c1[e1].key === c2[e2].key) {
    patch(c1[e1], c2[e2])
    e1--; e2--
  }
  // Step 3:  旧节点已遍历完 → 新节点剩余的全部挂载
  if (i > e1) { while (i <= e2) mount(c2[i++]) }
  // Step 4:  新节点已遍历完 → 旧节点剩余的全部卸载
  else if (i > e2) { while (i <= e1) unmount(c1[i++]) }
  // Step 5:  乱序处理
  else {
    // 5a: 为新节点建 key→index 映射
    const keyToNewIndex = new Map()
    for (let j = i; j <= e2; j++) keyToNewIndex.set(c2[j].key, j)

    // 5b: 遍历旧节点，找出可复用的
    const toBePatched = e2 - i + 1
    const newIndexToOldIndex = new Array(toBePatched).fill(0)

    for (let j = i; j <= e1; j++) {
      const newIndex = keyToNewIndex.get(c1[j].key)
      if (newIndex !== undefined) {
        newIndexToOldIndex[newIndex - i] = j + 1  // 记录旧位置
        patch(c1[j], c2[newIndex])                 // 复用并更新
      } else {
        unmount(c1[j])                              // key 不在新列表中，删除
      }
    }

    // 5c: LIS 计算最少移动
    const lis = getSequence(newIndexToOldIndex)
    // 5d: 倒序遍历，挂载新节点 / 移动复用节点
    // ...
  }
}
```

### 3. LIS（最长递增子序列）：为什么能减少 DOM 移动

核心思想：**找出那些在新旧数组中相对顺序已经正确的节点，保留它们不动，只移动其余节点**。

```ts
// 例：旧 [a, b, c, d, e, f, g] → 新 [a, b, e, c, d, h, f, g]
// 经过头尾对比后剩余中间部分
// 旧中间部分:  [c, d, e]       新中间部分:  [e, c, d, h]
// newIndexToOldIndex: [4, 2, 3, 0]   (0 表示新节点需要挂载)
//      含义: e在旧数组位置4, c在2, d在3, h是新的(0)
// 递增子序列: [2, 3] 即 [c, d] 的索引(1, 2) —— 这俩相对顺序是对的
// 不需要移动 c, d；移动 e 到前面；挂载 h
```

```ts
// 手写简化版 LIS（贪心 + 二分，O(n log n)）
function getSequence(arr: number[]): number[] {
  const result = [0]                    // 递增子序列的索引栈
  const prev = arr.slice()              // 每个元素的前驱索引

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] === 0) continue          // 0 表示新增节点，跳过
    const last = result[result.length - 1]
    if (arr[i] > arr[last]) {           // 比栈顶大，直接入栈
      prev[i] = last
      result.push(i)
    } else {                            // 二分查找替换位置
      let l = 0, r = result.length - 1
      while (l < r) {
        const mid = (l + r) >> 1
        if (arr[result[mid]] < arr[i]) l = mid + 1
        else r = mid
      }
      if (arr[i] < arr[result[l]]) {
        prev[i] = result[l - 1] || 0
        result[l] = i
      }
    }
  }
  // 回溯构建最终序列
  let len = result.length, last = result[len - 1]
  while (len-- > 0) {
    result[len] = last
    last = prev[last]
  }
  return result
}

// getSequence([4, 2, 3, 0]) → [1, 2]（c, d 的索引），表示 c,d 不用移动
```

## 深度拓展

### 追问1：Vue2 双端对比 vs Vue3 五步法

Vue2 使用 **双指针从两端向中间收拢**（oldStart/oldEnd/newStart/newEnd 四个指针同时移动）。优点是不需要 Map 映射，内存小；缺点是无法利用编译优化，且某些极端情况（如头部移动到尾部）需要更多操作。

Vue3 五步法**先处理头尾相同节点（大多数场景的真实情况）**，再处理中间乱序部分。加上编译时的 PatchFlag 和 Block Tree，实际 Diff 量远小于 Vue2。

### 追问2：为什么有 key 比没 key 快？

没 key 时 Vue3 走 `patchUnkeyedChildren`，只能**按位置逐个对比**。如果列表头部插入了一个元素，后面的所有节点都会被认为"变了"，全部更新一遍。有 key 时走 `patchKeyedChildren`，通过 key 精确匹配复用，能准确识别"头部插入"这种场景，只更新新增节点。

```html
<!-- 无 key：插头部 → 全部重新 patch -->
<!-- 旧 [A, B, C]  新 [D, A, B, C] -->
<!-- 对比: A≠D 更新, B≠A 更新, C≠B 更新, 挂载 C -->

<!-- 有 key：插头部 → 只挂载 D -->
<!-- 旧 [A(k1), B(k2), C(k3)]  新 [D(k4), A(k1), B(k2), C(k3)] -->
<!-- 对比: k4 新挂载, k1/k2/k3 直接复用（头尾对比+Map匹配） -->
```

## 项目实战

```html
<!-- 1. 表格列表用唯一 id 做 key -->
<el-table :data="tableData" row-key="id">
  <!-- row-key 确保行更新时精确 Diff，不会错位 -->
</el-table>

<!-- 2. v-for 和 v-if 不要同时使用 -->
<!-- ❌ Vue3 中 v-if 优先级更高，v-for 的变量在 v-if 中可能未定义 -->
<!-- ✅ 用 computed 过滤后再 v-for -->
<template v-for="item in activeItems" :key="item.id">
  <ListItem :data="item" />
</template>

<!-- 3. 递归组件也必须设置稳定的 key -->
<template v-for="node in treeData" :key="node.id">
  <TreeNode :data="node" />
</template>
```

```ts
// 4. 列表数据的不可变更新模式（配合 Diff 最大化复用）
// ✅ 不要原地修改，创建新引用
function updateItem(id: string, updates: Partial<Item>) {
  tableData.value = tableData.value.map(item =>
    item.id === id ? { ...item, ...updates } : item
  )
}

// ❌ 原地修改 —— 引用不变，但 key 相同，patch 时会更细致对比字段，依然正确但语义不清
// tableData.value.find(i => i.id === id)!.status = 'done'
```

## 易错点

**❌ Vue3 Diff 和 React Diff 一样**
Vue3 用 LIS 算法最小化移动（贪心保留相对顺序正确的节点），React 只做右移（从左到右，找到就复用，否则挂载+删除）。Vue3 的 DOM 移动次数更少。

**❌ key 用 index 没问题**
有副作用：当列表顺序改变（排序、筛选、删除头部元素）时，index 对应的数据已经变了，但 key 不变，导致 Diff 复用错误节点的 DOM，可能出现 input 输入内容错位、动画异常等问题。必须用 `item.id`。

**❌ Block Tree 是运行时优化**
Block Tree 的 `dynamicChildren` 是在**编译时**由编译器生成的（`openBlock`/`createBlock`），运行时只是消费编译产物。

## 面试信号

| 面试官问 | 你的回答深度 | 信号含义 |
|---------|------------|---------|
| "v-for 为什么需要 key" | Diff 算法 + patchKeyedChildren | 基础关 |
| "Vue3 Diff 和 Vue2 区别" | 双端对比→五步法 + 编译优化 | 进阶关 |
| "有 key 和无 key 性能差多少" | 能用代码模拟说明 | 实战关 |
| "最小化 DOM 移动怎么做到的" | LIS 算法原理 + 可手写 | 高阶关 |
| "手写 LIS" | 贪心+二分 O(n log n) | 定级关 |

## 相关阅读

- [Renderer](./renderer.md) — patch 函数的宿主，如何驱动真实 DOM
- [响应式原理](./reactivity.md) — 数据变更如何触发 Diff
- [KeepAlive](./keepalive.md) — Diff 到 KeepAlive 组件时的特殊处理

## 更新记录

- 2026-07：完整填充（Phase 2），加入 patchKeyedChildren 流程图、LIS 手写、Vue2 vs Vue3 对比

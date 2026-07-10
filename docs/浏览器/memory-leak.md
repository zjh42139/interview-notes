---
title: 内存泄漏排查
description: 前端内存泄漏的 4 种常见模式、Chrome DevTools 排查三步法和 WeakMap/WeakRef 防御机制
category: 浏览器
type: api-reference
score: 82
difficulty: 高级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-10
updated: 2026-07-10
reviewed: null
tags:
  - 内存泄漏
  - DevTools
  - 排查
  - WeakMap
  - WeakRef
---

# 内存泄漏排查

> &#11088;&#11088;&#11088;&#11088;&#11088;｜难度：高级｜项目：&#9733;&#9733;&#9733;&#9733;

## 一句话总结

**内存泄漏的本质是"用完了但没告诉 GC 可以回收"——全局变量、忘记清理的定时器、闭包中的 DOM 引用、detached DOM 节点，这四种模式覆盖了 90% 的前端泄漏场景。排查靠 Chrome DevTools 的三步法：Performance 录屏 → Memory 堆快照对比 → Allocation Timeline 定位。**

## 核心机制

### 四种常见泄漏模式

```javascript
// ===== 模式 1：意外的全局变量 =====
function createUser() {
  name = '张三'  // ❌ 没有 var/let/const → 变成 window.name
  this.age = 25  // ❌ 非 new 调用 → this = window
}
createUser()
// window.name 持有 '张三'，window.age 持有 25 → 永远不被回收

// ✅ 修复：严格模式 'use strict' + let/const
// 'use strict' 下意外全局变量直接报错

// ===== 模式 2：被遗忘的定时器 / 事件监听 =====
class ChatComponent {
  mount() {
    this.timer = setInterval(() => {
      this.fetchMessages()  // 闭包引用 this（ChatComponent 实例）
    }, 3000)
    window.addEventListener('resize', this.onResize)
  }
  // ❌ unmount 时忘记 clearInterval + removeEventListener
  // ChatComponent 实例被 timer 和 event listener 引用 → 无法回收
  // 即使组件已从 DOM 中移除，实例依然活着

  destroy() {
    clearInterval(this.timer)           // ✅ 必须清理
    window.removeEventListener('resize', this.onResize)  // ✅ 必须清理
  }
}

// ===== 模式 3：闭包中的 DOM 引用 =====
function setupEditor() {
  const editor = document.getElementById('editor')  // 拿到 DOM 引用

  return {
    destroy() {
      editor.remove()       // DOM 被从文档中移除
      // ❌ 但 editor 变量还在闭包中 → detached DOM 无法被 GC
      // destroy 函数的闭包持有 editor 变量 → 变量持有 DOM 节点
    }
  }
}
// ✅ 修复：destroy 结束时置 null
editor = null

// ===== 模式 4：Detached DOM 节点 =====
// 场景：JS 持有已从页面移除的 DOM 节点的引用
let cachedRows = []
function cacheTableData() {
  const rows = document.querySelectorAll('tr.data-row')
  cachedRows = Array.from(rows)  // 缓存了 DOM 引用
}
// 之后重新渲染表格 → 旧的 tr 从 DOM 中移除
// 但 cachedRows 仍然持有这些 tr 的引用
// → 这些 tr 是 "detached DOM" —— 不在文档中但不会被回收
```

### JS 引用类型对 GC 的影响

```javascript
// 强引用（Strong Reference）—— 阻止 GC
const map = new Map()
let obj = { data: 'important' }
map.set(obj, 'cached')    // Map 持有 obj 的强引用
obj = null                // obj 变量清空，但 Map 还引用着 → 不会回收

// 弱引用（Weak Reference）—— 不阻止 GC
const weakMap = new WeakMap()
let obj2 = { data: 'cacheable' }
weakMap.set(obj2, 'cached')  // WeakMap 持有 obj2 的弱引用
obj2 = null                   // 没有其他强引用 → obj2 被 GC 回收
// → WeakMap 中对应的 key-value 自动消失

// WeakRef —— 更细粒度的弱引用控制（ES2021）
let obj3 = { data: 'maybe-cached' }
const ref = new WeakRef(obj3)
// 之后想用时：
const cached = ref.deref()
if (cached) {
  // obj3 还在，可以用
} else {
  // obj3 已被 GC 回收，需要重新创建
}
obj3 = null  // 唯一的强引用断了 → GC 可以回收

// FinalizationRegistry —— GC 回调（极少使用，了解即可）
const registry = new FinalizationRegistry((heldValue) => {
  console.log(`对象被回收了，清理关联资源：${heldValue}`)
})
registry.register(obj, 'associated-resource')
```

## 深度拓展

### Chrome DevTools 排查三步法

```
步骤 1：Performance 面板 —— 确认泄漏存在
  ① 打开 Performance 面板，勾选 "Memory" 复选框
  ② 点击录制 → 执行怀疑泄漏的操作（打开/关闭弹窗、切换页面等）
  ③ 停止录制 → 看 "JS Heap" 曲线
  ④ 如果曲线呈"锯齿形"（升-降-升-降）→ 正常：分配-回收循环
     如果曲线呈"台阶形"（升-升-升-不降）→ 泄漏！内存只涨不跌

步骤 2：Memory 面板 —— 堆快照对比
  ① 打开 Memory 面板，选 "Heap snapshot"
  ② 执行操作前 → 拍快照 1
  ③ 执行操作（如反复打开/关闭弹窗 5 次）
  ④ 执行操作后 → 拍快照 2
  ⑤ 快照 2 上方选 "Comparison" 视图，对比对象选快照 1
  ⑥ 按 "Delta"（新增对象数）排序
  → 看到大量相同类型的对象 → 这些就是泄漏的嫌疑人

  怎么看：
  constructor 列 → 什么类型的对象在增长
  Distance 列 → 对象到 GC Root 的距离
  Retained Size → 这个对象 + 它引用的所有对象占了多少内存
  Shallow Size → 对象本身占了多少内存

步骤 3：Allocation instrumentation on timeline —— 精确定位代码行
  ① Memory 面板选 "Allocation instrumentation on timeline"
  ② 开始录制
  ③ 执行一次怀疑泄漏的操作
  ④ 停止录制
  → 时间线上每个蓝色柱子 = 一次内存分配
  → 点击柱子 → 看到哪些对象是在哪一行代码中创建的
  → 精确到文件和行号
```

### 常见泄漏场景速查

| 场景 | 泄漏原因 | 修复 |
|------|----------|------|
| `setInterval` 未清理 | 回调闭包持有组件引用 | `clearInterval` + 在 `destroy`/`unmount`/`useEffect` 清理中调用 |
| `addEventListener` 未移除 | 监听器闭包持有 DOM 引用 | `removeEventListener` 配对使用 |
| `IntersectionObserver` 未断开 | `observe()` 后没 `unobserve()` | `observer.unobserve(el)` 或 `observer.disconnect()` |
| WebSocket 未关闭 | 连接对象持有回调和消息队列 | `ws.close()` + 置 null |
| `fetch` 请求未取消 | 请求完成前组件已销毁但回调仍引用组件状态 | `AbortController.abort()` + `signal` |
| 闭包缓存大量数据 | 闭包中的变量无法释放 | 限制缓存大小，用 LRU 淘汰 |
| `console.log(大对象)` | 浏览器 DevTools 保留日志引用 | 生产环境移除 `console.log` |
| Pinia / Redux store 持有组件引用 | Store 中存了 DOM ref 或组件实例 | 只存可序列化数据，不存引用类型 |

### 框架中的内存泄漏陷阱

```javascript
// React —— useEffect 清理
useEffect(() => {
  const timer = setInterval(() => tick(), 1000)
  window.addEventListener('resize', handleResize)
  const observer = new IntersectionObserver(callback)
  observer.observe(ref.current)

  return () => {  // ← 清理函数必须写全！
    clearInterval(timer)
    window.removeEventListener('resize', handleResize)
    observer.disconnect()
  }
}, [])

// Vue3 —— onUnmounted / watch 清理
const stop = watch(source, callback)
onUnmounted(() => {
  stop()         // 停止 watch
  clearInterval(timer)
})
```

## 项目实战

### 后台管理系统泄漏案例分析

1. **标签页路由中的 ECharts 实例**：每次切换标签页时创建新的 ECharts 实例，但旧实例没调用 `dispose()` → 5 分钟后页面占用 2GB 内存。修复：路由离开时 `chart.dispose()` + 在 `onBeforeUnmount` 中清理
2. **实时数据大屏的 WebSocket**：页面离开后 WebSocket 连接还在接收数据，回调中的 `setState` 更新已卸载组件的状态。修复：`onUnmounted` 中 `ws.close()` + `AbortController` 取消未完成的 fetch
3. **文件上传进度页面的闭包**：上传回调闭包引用了整个 fileList（含 file 对象的 Blob 引用，大文件可达数百 MB）。修复：完成上传后释放 file 引用（`file = null`）

## 易错点

1. **`console.log` 在生产环境泄漏** —— `console.log(obj)` 在 DevTools 打开时，浏览器会保留所有日志对象的引用。生产环境移除 console 或用 `console.clear()`
2. **WeakMap 的 key 必须是对象** —— `weakMap.set('string-key', value)` 会抛 TypeError
3. **堆快照里的 "Distance" 为 0 不代表没有泄漏** —— 只说明对象直接可达。需要看 Retained Size 和对比增长
4. **`weakMap.set(obj, data)` 中 obj 回收后 data 也消失** —— WeakMap 的 value 不需要是弱引用；但 key 回收 → 整个 entry 被移除 → value 也没了

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "你怎么排查内存泄漏" | 追问 DevTools Memory 面板的堆快照对比步骤 |
| "WeakMap 和 Map 有什么区别" | 追问 WeakRef 的 `deref()` 什么时候返回 null |
| "setInterval 为什么会导致泄漏" | 追问闭包引用链 + 清理时机的完整链路 |
| "你的项目遇到过内存问题吗" | 追问具体排查过程和最终定位到的代码行 |

## 相关阅读

- [垃圾回收 GC](./gc.md)
- [浏览器 DevTools](./devtools.md)
- [requestAnimationFrame](./request-animation-frame.md)

## 更新记录

- 2026-07-10：新建（四种泄漏模式 + WeakMap/WeakRef/FinalizationRegistry + DevTools 排查三步法 + 常见泄漏场景速查表 + 框架陷阱）

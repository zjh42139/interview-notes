---
title: Vue3 性能优化 Checklist
description: Vue3 项目性能优化的完整路径：响应式层面、组件层面、构建层面、运行时层面的优化手段与量化指标
category: Vue3
type: practice
score: 0
difficulty: 高级
frequency: ⭐⭐⭐⭐
status: reviewed
created: 2026-07-11
updated: 2026-07-11
reviewed: null
tags:
  - 性能优化
  - v-memo
  - shallowRef
  - KeepAlive
  - 懒加载
  - computed
---

# Vue3 性能优化 Checklist

> "你们项目做了哪些性能优化"——这道题的答案不能只有"路由懒加载"。Vue3 提供了很多专属的优化 API——知道它们并说出"为什么用这个能优化"才是高级回答。

## 一句话总结

**Vue3 性能优化分四个层面：响应式优化（shallowRef/markRaw 避免不必要的深度代理）、组件优化（KeepAlive缓存/v-memo跳过子树/computed缓存计算结果）、构建优化（路由懒加载/异步组件/Tree Shaking）、运行时优化（大列表虚拟滚动/非响应数据冻结/防抖节流）。**

---

## 优化 Checklist（按收益排序）

### 一、响应式层面

#### 1. shallowRef — 大数据不深度代理

```javascript
// ❌ 差：大量数据深度代理——每个属性都变成 getter/setter
const list = ref(bigArray)  // 10000 条数据的数组，每条 20 个字段

// ✅ 好：只代理 .value 的替换——不关心内部字段变化
const list = shallowRef(bigArray)
// 更新时替换整个值：list.value = newData
```

**场景**：列表数据只整体替换、不做局部修改。

#### 2. markRaw — 标记永不响应式

```javascript
// ❌ 差：第三方库实例（ECharts/地图）被深度代理——大量无用追踪 + 可能报错
const chart = ref(null)
chart.value = echarts.init(el)  // ECharts 实例有上千个内部属性

// ✅ 好：标记后 reactive 会跳过它
const chart = shallowRef(null)  
chart.value = markRaw(echarts.init(el))
```

**场景**：第三方库实例、复杂的非响应式数据结构（树形控件的数据源、富文本编辑器的文档对象）。

#### 3. computed vs methods

```javascript
// ❌ 差：模板中每次 re-render 都重新执行
<div>{{ formatPrice(price) }}</div>

// ✅ 好：price 不变时直接返回缓存
const formatted = computed(() => formatPrice(price.value))
<div>{{ formatted }}</div>
```

---

### 二、组件层面

#### 4. KeepAlive — 缓存不活跃组件

Tab 切换、列表→详情→列表——用户频繁往返的组件不走销毁重建。缓存后 onActivated/onDeactivated 替代 mount/unmount。

#### 5. v-memo — 子树跳过更新

```html
<!-- Vue3.2+：依赖值不变时跳过整个子树的 Diff -->
<div v-memo="[items.length]">
  <ExpensiveList :items="items" />
</div>
<!-- items.length 不变 → ExpensiveList 完全跳过 Diff -->
```

**场景**：大列表、复杂图表——依赖已知且不常变。

#### 6. v-once — 一次性渲染

```html
<!-- 只渲染一次，之后永不更新 -->
<div v-once>
  <h1>{{ title }}</h1>
  <p>{{ description }}</p>
</div>
```

**场景**：页面标题、版权信息、纯静态内容——确保只渲染一次后被编译器标记为静态。

#### 7. 异步组件

```javascript
// 减少首屏 JS 体积——只在需要时才加载
const HeavyChart = defineAsyncComponent(() => import('./HeavyChart.vue'))
```

配合 Suspense 做加载态/错误态。

---

### 三、Diff 层面（编译器自动优化，但理解原理能指导写法）

#### 8. 静态内容写到外面

```html
<!-- ❌ 差：v-for 的内部包含了静态模板——每条都重新 Diff -->
<li v-for="item in list" :key="item.id">
  <span class="icon">📁</span>  <!-- 永远不会变的静态内容 -->
  <span>{{ item.name }}</span>
</li>

<!-- ✅ 更好：复用同一个静态结构 -->
<li v-for="item in list" :key="item.id">
  <FileIcon />  <!-- 组件内有自己的 PatchFlag，跳过静态部分 -->
  <span>{{ item.name }}</span>
</li>
```

编译器的静态提升会自动处理大部分情况——不需要过度优化。但了解这个机制能帮助你在极端场景下写出更优的模板。

#### 9. key 的正确使用

```html
<!-- ❌ 差：index 当 key——数组位置变化时所有元素重建 -->
<li v-for="(item, index) in list" :key="index">

<!-- ✅ 好：用稳定的唯一标识 -->
<li v-for="item in list" :key="item.id">
```

---

### 四、构建与加载

#### 10. 路由懒加载

```javascript
const routes = [
  { path: '/dashboard', component: () => import('./Dashboard.vue') },
  { path: '/settings', component: () => import('./Settings.vue') },
]
```

首页路由不同步懒加载——保证首屏速度。次要页面全拆分。

#### 11. 第三方库按需引入

```javascript
// ❌ 差：全量引入——打包 600KB+
import ElementPlus from 'element-plus'

// ✅ 好：按需引入——打包只含用到的组件
import { ElButton, ElTable } from 'element-plus'
// 配合 unplugin-vue-components 自动按需
```

#### 12. Tree Shaking — Vue3 天然支持

Vue3 的 API 全部按需导出（`import { ref, computed } from 'vue'`）——未使用的 API 打包时自动移除。Vue2 全挂在 `this` 上——无法 tree shake。

---

### 五、运行时优化

#### 13. Object.freeze — 纯展示数据

```javascript
// 从后端拿到只用于展示的大数组——不需要响应式
const products = Object.freeze(rawData)
// Vue 遇到 Object.freeze 的对象会跳过响应式代理
```

#### 14. 虚拟滚动 — 万级列表

```javascript
// 不使用：v-for 渲染全部 10000 条 → 10000 个 DOM 节点
// 使用：vue-virtual-scroller 或自定义——只渲染可视区的 ~20 条
```

---

## 面试怎么答"Vue3 性能优化"

**30 秒版**："四层优化——响应式层 shallowRef/markRaw 避免不必要代理；组件层 KeepAlive+v-memo 减少渲染；构建层路由懒加载+按需引入；运行时层 Object.freeze+虚拟滚动。每个优化都是因为理解了 Vue3 的底层机制才选的。"

**2 分钟版**：按项目经验讲——说一个你真实做过的优化，量化前后对比。"列表页从 2000 条数据渲染 2.3s→用 shallowRef 不做每条的深度代理→0.4s。因为 2000×20 字段 = 40000 个 Proxy 的创建开销全砍了，而我们只做整体替换不需要局部追踪。"

---

## 易错点

1. **"性能优化就是加缓存"** —— 缓存是手段不是目的。要理解什么场景收益最大——频繁往返的页面缓存才有意义，一次性页面缓存反而浪费内存
2. **shallowRef 不能用于局部修改** —— `shallowRef([...]).value[3].name = 'new'` 不会触发更新。shallowRef 只追踪 `.value` 的替换
3. **v-memo 的依赖数组** —— 依赖写多了等于没用（总是变），写少了漏掉变化。只写真正决定子树是否重渲染的关键依赖
4. **过度优化** —— 100 行数据的简单列表不需要虚拟滚动——虚拟滚动有固定高度限制和实现复杂度。先用 Performance 面板定位真正的瓶颈

## 相关阅读

- [响应式原理](./reactivity.md) — shallowRef/markRaw 的底层机制
- [computed / watch](./computed-watch.md) — computed 缓存原理
- [KeepAlive](./keepalive.md) — 组件级缓存
- [Diff / Patch](./diff-patch.md) — PatchFlag 编译器优化
- [Vue Router 路由懒加载](../VueRouter/lazy-loading.md)
- [性能优化 知识模块](../性能优化/index.md) — 通用 Web 性能优化

## 更新记录

- 2026-07-11：新建（四层优化体系 + 14 项 checklist + 面试回答模板）

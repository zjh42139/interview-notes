---
title: ECharts 实战
description: ECharts 实战通过 useECharts composable 封装图表初始化和响应式更新，支持 ResizeObserver 自适应、大数据量优化和内存管理，适用于后台仪表盘数据看板
category: 项目实战
type: project
score: 0
section: 业务场景
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
reviewed: null
tags:
  - ECharts
  - 数据可视化
  - 图表封装
  - 性能优化
---

# ECharts 实战

> "ECharts 不只是 `setOption`。图表数据变化时如何自动更新？窗口缩放时图表怎么跟着自适应？多个图表实例如何统一管理？组件卸载时实例有没有正确销毁？——每个问题都关系着页面的性能和稳定性。"

---

## 一句话总结

ECharts 通过 **`useECharts` composable** 封装 init / setOption / resize / dispose 四个生命周期，通过 **watch 监听数据变化** 自动更新图表，通过 **ResizeObserver 或 window.resize 防抖** 实现自适应，通过 **`large` 模式 + `sampling`** 优化大数据量渲染，组件卸载时 **必须调用 `dispose()`** 释放内存。

---

## 核心机制

### 1. `useECharts` Composable 封装

```typescript
// src/hooks/useECharts.ts
import { ref, watch, onMounted, onUnmounted, type Ref } from 'vue'
import * as echarts from 'echarts'
import { debounce } from 'lodash-es'
import type { EChartsOption, ECharts } from 'echarts'

interface UseEChartsOptions {
  theme?: string               // 主题名称，如 'dark'
  autoResize?: boolean         // 是否自动 resize，默认 true
}

export function useECharts(options: UseEChartsOptions = {}) {
  const { theme, autoResize = true } = options

  const chartRef = ref<HTMLElement | null>(null)   // 模板 ref
  let chartInstance: ECharts | null = null
  let resizeObserver: ResizeObserver | null = null

  // ---------- 初始化 ----------
  function initChart() {
    if (!chartRef.value) return
    chartInstance = echarts.init(chartRef.value, theme)
  }

  // ---------- 设置数据 ----------
  function setOption(option: EChartsOption, notMerge = true) {
    if (!chartInstance) {
      console.warn('[useECharts] 图表实例未初始化，请先调用 initChart()')
      return
    }
    chartInstance.setOption(option, { notMerge })
  }

  // ---------- Resize ----------
  function startResize() {
    if (!autoResize || !chartRef.value) return

    resizeObserver = new ResizeObserver(
      debounce(() => {
        chartInstance?.resize()
      }, 200)   // 防抖 200ms
    )
    resizeObserver.observe(chartRef.value)
  }

  function stopResize() {
    resizeObserver?.disconnect()
    resizeObserver = null
  }

  // ---------- 销毁 ----------
  function dispose() {
    stopResize()
    if (chartInstance) {
      chartInstance.dispose()
      chartInstance = null
    }
  }

  // ---------- 工具方法 ----------
  function getInstance() {
    return chartInstance
  }

  function showLoading() {
    chartInstance?.showLoading()
  }

  function hideLoading() {
    chartInstance?.hideLoading()
  }

  onMounted(() => {
    initChart()
    startResize()
  })

  onUnmounted(() => {
    dispose()     // 组件卸载时销毁实例，防止内存泄漏
  })

  return {
    chartRef,
    setOption,
    dispose,
    getInstance,
    showLoading,
    hideLoading,
  }
}
```

### 2. 组件中使用

```vue
<!-- src/views/dashboard/components/SalesChart.vue -->
<template>
  <div ref="chartRef" class="chart-container" v-loading="loading"></div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useECharts } from '@/hooks/useECharts'
import { getSalesData } from '@/api/dashboard'

const { chartRef, setOption, showLoading, hideLoading } = useECharts()
const loading = ref(false)

// 获取数据
const salesData = ref<any[]>([])
async function fetchData() {
  loading.value = true
  showLoading()
  try {
    const res = await getSalesData()
    salesData.value = res.data
  } finally {
    loading.value = false
    hideLoading()
  }
}

// 监听数据变化，自动更新图表
watch(salesData, (data) => {
  if (!data.length) return

  setOption({
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.map((d) => d.month) },
    yAxis: { type: 'value' },
    series: [{
      type: 'line',
      data: data.map((d) => d.amount),
      smooth: true,
      areaStyle: { opacity: 0.15 },
    }],
  })
})

fetchData()
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 400px;
}
</style>
```

---

## 深度拓展

### 追问 1：大数据量性能优化

当数据量上万时，ECharts 的默认渲染会卡顿。优化策略：

```typescript
// 1. 折线图 / 柱状图：使用 large 模式
setOption({
  series: [{
    type: 'line',
    large: true,           // 开启大数据量优化
    largeThreshold: 2000,  // 数据量超过此阈值时启用
    sampling: 'lttb',      // 降采样算法（Largest-Triangle-Three-Buckets）
    data: hugeData,        // 上万条数据
  }],
})

// 2. 分片渲染：将大量数据分批次加入
async function renderInChunks(data: any[], chunkSize = 500) {
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize)
    setOption({ series: [{ data: chunk }] }, false)  // notMerge = false 追加
    await new Promise((resolve) => setTimeout(resolve, 50))  // 让出主线程
  }
}

// 3. 关闭不必要的动画
setOption({ animation: false })
```

### 追问 2：ResizeObserver vs window.resize

| 方式 | 优点 | 缺点 |
|------|------|------|
| `window.resize` | 简单 | 容器大小变化但窗口不变时不触发（如侧边栏折叠） |
| `ResizeObserver` | 精确监听元素尺寸变化 | IE 不支持（需要 polyfill） |

**推荐使用 `ResizeObserver`**，因为容器尺寸变化不等于窗口尺寸变化（例如侧边栏收起/展开、父元素 flex 布局改变等场景）。

### 追问 3：多图表实例管理

后台仪表盘通常有 4-8 个图表，需要统一管理：

```typescript
// src/hooks/useChartManager.ts
import { useECharts } from './useECharts'

export function useChartManager() {
  const charts = new Map<string, ReturnType<typeof useECharts>>()

  function register(name: string) {
    const chart = useECharts()
    charts.set(name, chart)
    return chart
  }

  function resizeAll() {
    charts.forEach((chart) => {
      chart.getInstance()?.resize()
    })
  }

  function disposeAll() {
    charts.forEach((chart) => {
      chart.dispose()
    })
    charts.clear()
  }

  return { register, resizeAll, disposeAll }
}
```

### 追问 4：主题定制

```typescript
// 注册自定义主题
echarts.registerTheme('my-theme', {
  color: ['#5470c6', '#91cc75', '#fac858', '#ee6666'],
  backgroundColor: 'transparent',
  textStyle: { fontFamily: 'PingFang SC, Microsoft YaHei' },
  // ...完整的主题配置
})

// 使用时传入主题名
const { chartRef, setOption } = useECharts({ theme: 'my-theme' })
```

---

## 项目实战

### 后台仪表盘数据看板

```
典型布局：
┌────────────────────────────────────┐
│  概览卡片行（4 个 Stat 卡片）       │
├──────────────┬─────────────────────┤
│  销售趋势图   │   产品分类饼图       │
│  (line)      │   (pie)            │
├──────────────┼─────────────────────┤
│  地域分布地图  │   订单量柱状图       │
│  (map)       │   (bar)            │
└──────────────┴─────────────────────┘
```

每个图表使用独立的 `useECharts()` 实例，数据通过统一的 API 接口获取，使用 `watch` 自动响应数据变化。

---

## 易错点

1. **忘记 `dispose()` 导致内存泄漏**：组件卸载时没有调用 `chartInstance.dispose()`，ECharts 实例和绑定的 DOM 元素、事件监听器无法被 GC 回收。`useECharts` composable 已在 `onUnmounted` 中自动处理，但手动管理时务必注意。

2. **容器尺寸为 0**：初始化时 `chartRef.value` 的父容器可能被 `v-if` / `v-show` 隐藏，或者 CSS 没有设置 `height`，导致图表渲染失败。解决：确保容器有明确的宽高，或使用 `nextTick` 后再初始化。

3. **`setOption` 的 `notMerge` 参数用错**：`notMerge: true` 完全替换配置（推荐用于初始化和数据切换），`notMerge: false` 合并配置（用于追加数据）。切换图表类型时必须用 `notMerge: true`，否则旧的 series 配置残留。

4. **`resize` 调用频繁导致卡顿**：窗口拖动时每帧都触发 resize 会严重消耗性能。必须加防抖（200-300ms）。

---

## 相关阅读

- [主题切换](./theme-switch.md) — ECharts 暗黑模式的适配方案
- [组件封装实践](./component-encapsulation.md) — 图表组件封装的设计思路
- [大数据表格](./big-data-table.md) — 大数据表格的虚拟滚动优化
- [项目优化](../项目优化/project-optimization.md) — 仪表盘整体性能优化

---

## 更新记录

- 2026-07-06：完成内容填充，新增 useECharts composable 完整封装、大数据量优化（large/sampling/分片渲染）、ResizeObserver 自适应、多图表实例管理、内存管理

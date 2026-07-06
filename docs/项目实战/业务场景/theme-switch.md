---
title: 主题切换
description: 主题切换通过 CSS 变量 + data-theme 属性实现亮/暗主题切换，支持 Element Plus 暗黑模式适配、FOUC 避免、自定义组件适配和持久化用户选择
category: 项目实战
section: 业务场景
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-06
updated: 2026-07-06
reviewed: null
tags:
  - 主题切换
  - 暗黑模式
  - CSS变量
  - Element Plus
---

# 主题切换

> "暗黑模式不只是加个 class。切换主题时页面会不会闪屏（FOUC）？Element Plus 的组件怎么跟着变？自定义组件的颜色如何统一管理？——三个维度都讲清楚才叫真做过。"

---

## 一句话总结

主题切换通过 **CSS 变量 + `document.documentElement.setAttribute('data-theme', 'dark')`** 实现亮/暗主题切换，配合 **Element Plus 的暗黑模式 class** 和 **在 `<head>` 中同步执行 JS 避免 FOUC**，用户选择通过 **localStorage 持久化**。

---

## 核心机制

### 1. CSS 变量方案（推荐）

```css
/* src/styles/variables.css */
:root {
  /* 亮色主题（默认） */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f7fa;
  --text-primary: #303133;
  --text-secondary: #606266;
  --border-color: #dcdfe6;
  --brand-color: #409eff;
  --shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 暗色主题 */
:root[data-theme='dark'] {
  --bg-primary: #141414;
  --bg-secondary: #1d1d1d;
  --text-primary: #e5eaf3;
  --text-secondary: #a3a6ad;
  --border-color: #4c4d4f;
  --brand-color: #409eff;
  --shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
}
```

组件中使用 CSS 变量：

```vue
<style scoped>
.sidebar {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border-right: 1px solid var(--border-color);
  transition: background-color 0.3s, color 0.3s;  /* 平滑过渡 */
}
</style>
```

### 2. 切换逻辑 + Element Plus 适配

```typescript
// src/hooks/useTheme.ts
import { ref, watchEffect } from 'vue'

type Theme = 'light' | 'dark'

const theme = ref<Theme>(
  (localStorage.getItem('app-theme') as Theme) || 'light'
)

// 应用到 DOM + Element Plus
watchEffect(() => {
  const root = document.documentElement
  root.setAttribute('data-theme', theme.value)

  // Element Plus 暗黑模式通过添加 class 触发
  if (theme.value === 'dark') {
    root.classList.add('dark')           // Element Plus 官方暗黑模式
  } else {
    root.classList.remove('dark')
  }

  localStorage.setItem('app-theme', theme.value)
})

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return { theme, toggleTheme }
}
```

Element Plus 的暗黑模式在 `main.ts` 中引入：

```typescript
// src/main.ts
import 'element-plus/theme-chalk/dark/css-vars.css'
```

### 3. 避免 FOUC（页面闪烁）

在 `index.html` 的 `<head>` 中同步执行 JS，在页面渲染前设置好主题：

```html
<!-- index.html -->
<head>
  <script>
    // 同步执行，在页面渲染前设置主题属性，避免闪烁
    (function() {
      var theme = localStorage.getItem('app-theme') || 'light';
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    })();
  </script>
  <!-- 之后再加载 CSS，此时 data-theme 已就位 -->
</head>
```

**原理**：浏览器解析 HTML 是同步的，`<script>` 块会阻塞后续内容的解析，因此 JS 执行完毕、`data-theme` 属性设置好后，才会继续解析 CSS 和渲染页面，从而避免从亮色闪到暗色的 FOUC。

---

## 深度拓展

### 追问 1：多套主题（不只是亮/暗）怎么扩展？

```css
/* 品牌定制主题，Beyond light/dark */
:root[data-theme='blue'] {
  --brand-color: #1890ff;
  --bg-primary: #e6f7ff;
}

:root[data-theme='green'] {
  --brand-color: #52c41a;
  --bg-primary: #f6ffed;
}
```

切换时只需修改 `data-theme` 属性值，所有使用 `var(--brand-color)` 的元素自动变化。

### 追问 2：CSS 变量 vs CSS-in-JS（如 Tailwind dark: 前缀）

| 方案 | 优点 | 缺点 |
|------|------|------|
| CSS 变量 + data-theme | 零运行时开销、全局统一管理 | 需要维护变量表 |
| Tailwind `dark:` | 原子化、粒度细 | HTML 中到处是 `dark:xxx`，修改繁琐 |
| CSS-in-JS（Emotion 等） | JS 动态计算 | 运行时开销、SSR 复杂 |

**推荐**：中小项目用 CSS 变量，大项目可配合 Tailwind `dark:` 原子类加快开发。

### 追问 3：ECharts 图表的暗黑模式适配

```typescript
// src/hooks/useECharts.ts
import { useTheme } from './useTheme'

const { theme } = useTheme()

// 监听主题变化，更新图表
watch(theme, (val) => {
  chartInstance?.dispose()
  initChart(val)   // 重新初始化（或使用 ECharts 的 dark 主题）
})

function initChart(theme: string) {
  const chart = echarts.init(dom, theme === 'dark' ? 'dark' : undefined)
  // ...
}
```

ECharts 内置了 `'dark'` 主题，直接传入即可。也可以通过 `echarts.registerTheme()` 注册自定义主题。

### 追问 4：系统偏好跟随（`prefers-color-scheme`）

```typescript
// 跟随系统主题偏好的自动切换
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

function followSystemTheme() {
  theme.value = mediaQuery.matches ? 'dark' : 'light'
}

// 监听系统主题变化
mediaQuery.addEventListener('change', followSystemTheme)

// 用户手动切换后，取消跟随系统
function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  // 用户手动切换后，不再监听系统变化
  mediaQuery.removeEventListener('change', followSystemTheme)
}
```

---

## 项目实战

### 后台管理系统主题切换完整流程

```
1. 设计阶段：
   - 让 UI 设计师提供亮/暗两套色板
   - 将色板映射为 CSS 变量名（bg-primary, text-primary ...）

2. 开发阶段：
   - 在 variables.css 中定义两套变量
   - 所有组件使用 var(--xxx) 而非硬编码颜色
   - Element Plus 引入 dark/css-vars.css
   - index.html 中加入 FOUC 防护脚本

3. 测试阶段：
   - 遍历所有页面，检查暗黑模式下的可读性
   - 检查第三方组件（图表、编辑器）是否适配
   - 测试 FOUC：刷新页面看是否有闪烁
```

### 组件中使用

```vue
<template>
  <div class="page-container">
    <el-button @click="toggleTheme">
      {{ theme === 'light' ? '🌙 暗黑模式' : '☀️ 亮色模式' }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '@/hooks/useTheme'
const { theme, toggleTheme } = useTheme()
</script>

<style scoped>
.page-container {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  transition: background-color 0.3s, color 0.3s;
}
</style>
```

---

## 易错点

1. **FOUC（页面闪烁）**：在 Vue 挂载后才设置主题属性，导致页面先用默认（亮色）渲染，再闪成暗色。解决方案：在 `<head>` 中同步 JS 设置属性，必须在任何 CSS 加载前执行。

2. **Element Plus 部分组件未适配**：只是设置了 CSS 变量，但没有引入 `element-plus/theme-chalk/dark/css-vars.css`，导致 Element Plus 的弹窗、下拉菜单等仍然是亮色。

3. **第三方组件（编辑器、图表）不受 CSS 变量控制**：Monaco Editor、ECharts 等有自己的主题机制，需要单独配置，不能只靠全局 CSS 变量。

4. **`transition` 导致的性能问题**：给太多元素加 `transition`，切换主题时产生大量重绘。建议只对关键容器加过渡，避免 `transition: all`。

---

## 相关阅读

- [ECharts 实战](./echarts.md) — 图表的暗黑模式适配
- [组件封装实践](./component-encapsulation.md) — 封装支持主题切换的组件
- [项目优化](../项目优化/project-optimization.md) — CSS 变量对性能的影响

---

## 更新记录

- 2026-07-06：完成内容填充，新增 CSS 变量方案、Element Plus 适配、FOUC 避免、系统偏好跟随、多套主题扩展、ECharts 暗黑适配

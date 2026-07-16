---
title: Canvas vs SVG
description: Canvas 位图与 SVG 矢量图的本质区别、性能对比、API 差异和选型指南
category: HTML
type: comparison
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-09
updated: 2026-07-09
reviewed: null
tags:
  - Canvas
  - SVG
  - 可视化
  - ECharts
  - 性能
---

# Canvas vs SVG

> &#11088;&#11088;&#11088;&#11088;｜难度：中级｜项目：&#9733;&#9733;&#9733;

## 一句话总结

**Canvas 是"画完就忘"的位图画布（像素级操作、无 DOM 节点），SVG 是"画了就记住"的矢量图形（每个图形都是独立 DOM 节点、可绑定事件、CSS 可控制）。选型标准：上千个对象用 Canvas，几十个可交互对象用 SVG。**

## 核心机制

### 一张表讲清本质区别

| 维度 | Canvas | SVG |
|------|--------|-----|
| 本质 | **位图**（像素网格） | **矢量图**（数学公式描述） |
| DOM | **无 DOM 节点**，只有一个 `<canvas>` 元素 | 每个图形都是**独立 DOM 节点** |
| 事件 | **无法绑定事件到单个图形**（需要 hit region 或数学判断点击位置） | 每个图形**可独立绑定事件**（`onclick`、`:hover`…） |
| CSS | CSS 只能影响 `<canvas>` 元素本身，无法改变画布内容 | **CSS 可直接控制图形样式**（fill/stroke/transform） |
| 缩放 | 放大会**模糊/锯齿**（分辨率固定） | 放大会**自动重绘**，始终清晰 |
| 内存 | 内存占用固定（一块画布像素缓冲区） | 元素越多 DOM 越多，内存线性增长 |
| 性能 | 大量对象**极快**（只操作像素） | 对象超过 1000 个**明显卡顿**（DOM 开销） |
| 修改 | 查到旧像素 → 擦掉 → 画新的 | `element.setAttribute('x', 100)` |
| 可访问性 | 差（只是一张图片，读屏器无法识别） | 好（每个图形都可加 ARIA 标签） |

### Canvas 基本 API（2D 上下文）

```javascript
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

// --- 基础形状 ---
ctx.fillStyle = '#3451b2'
ctx.fillRect(0, 0, 100, 50)        // 填充矩形
ctx.strokeRect(0, 0, 100, 50)      // 描边矩形
ctx.clearRect(10, 10, 80, 30)      // 擦除矩形区域

// --- 路径绘制 ---
ctx.beginPath()
ctx.moveTo(50, 0)
ctx.lineTo(100, 100)
ctx.lineTo(0, 100)
ctx.closePath()                    // 闭合回到起点
ctx.fillStyle = 'rgba(52,81,178,0.5)'
ctx.fill()                         // 填充
ctx.stroke()                       // 描边

// --- 圆弧 ---
ctx.arc(100, 100, 50, 0, Math.PI * 2)  // 圆心(x,y)、半径、起始角、结束角

// --- 文字 ---
ctx.font = '20px sans-serif'
ctx.fillText('Hello Canvas', 50, 50)
ctx.strokeText('Hello Canvas', 50, 80)

// --- 图片 ---
const img = new Image()
img.onload = () => ctx.drawImage(img, 0, 0, 200, 100)  // 绘制图片到画布

// --- 导出图片 ---
canvas.toDataURL('image/png')      // base64
canvas.toBlob(blob => { /* ... */ })  // Blob（异步）

// --- 像素操作 ---
const imageData = ctx.getImageData(0, 0, 100, 100)
// imageData.data 是 Uint8ClampedArray，每 4 个元素表示一个像素 [R, G, B, A]
for (let i = 0; i < imageData.data.length; i += 4) {
  imageData.data[i]     = 255 - imageData.data[i]     // 反色 → R
  imageData.data[i + 1] = 255 - imageData.data[i + 1] // 反色 → G
  imageData.data[i + 2] = 255 - imageData.data[i + 2] // 反色 → B
}
ctx.putImageData(imageData, 0, 0)
```

### SVG 基本元素

```html
<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <!-- 矩形 -->
  <rect x="10" y="10" width="100" height="60" rx="4" fill="#3451b2" stroke="#234090" stroke-width="2" />

  <!-- 圆形 -->
  <circle cx="200" cy="40" r="30" fill="#f56c6c" />

  <!-- 椭圆 -->
  <ellipse cx="300" cy="40" rx="40" ry="25" fill="#67c23a" />

  <!-- 线段 -->
  <line x1="10" y1="100" x2="390" y2="100" stroke="#999" stroke-width="1" />

  <!-- 折线 -->
  <polyline points="10,150 100,120 200,160 300,100 390,140" fill="none" stroke="#3451b2" stroke-width="2" />

  <!-- 多边形 -->
  <polygon points="200,200 250,260 150,260" fill="#e6a23c" />

  <!-- 路径（最强元素，几乎所有图形都可以用 path 描述） -->
  <path d="M 10 300 C 50 250, 150 350, 200 300 S 350 250, 390 300" fill="none" stroke="#3451b2" stroke-width="2" />

  <!-- 文字 -->
  <text x="200" y="250" text-anchor="middle" font-size="20" font-family="sans-serif">
    可交互的 SVG 文字
  </text>

  <!-- 分组（批量变换、批量绑定事件） -->
  <g transform="translate(50, 50) rotate(45)">
    <rect x="0" y="0" width="100" height="60" fill="#3451b2" />
    <text x="50" y="35" text-anchor="middle" fill="white">旋转的</text>
  </g>

  <!-- defs：定义可复用的渐变/滤镜/符号 -->
  <defs>
    <linearGradient id="myGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3451b2" />
      <stop offset="100%" stop-color="#f56c6c" />
    </linearGradient>
  </defs>
  <rect x="10" y="350" width="380" height="40" fill="url(#myGrad)" />
</svg>
```

## 深度拓展

### 性能对比与选型

```
对象数量低（< 100） + 需要交互 → SVG 更优
  ✓ 每个图形独立 DOM 节点，可直接绑定 click/hover
  ✓ CSS 可直接控制样式（如 :hover 高亮）
  ✓ 不需要 JS 做 hit-test 判断点击了哪个元素

对象数量高（> 1000） + 不需要交互 → Canvas 更优
  ✓ 没有 DOM 节点开销，只擦除和重绘像素
  ✓ 内存占用固定（固定分辨率的像素缓冲区）
  ✓ 适合：实时图表、游戏、粒子效果、热力图

对象数量高 + 需要交互 → Canvas + hit region / 数学计算
  ✓ 在 Canvas 中用数学判断点击位置（点是否在矩形/圆形/路径内）
  ✓ 或使用上层库（ECharts/Fabric.js/Konva.js）的封装
```

### 第三方库的底层选择

| 库 | 基于 | 适用场景 | 备注 |
|----|------|----------|------|
| ECharts 5 | **Canvas**（默认）/ SVG（可选） | 数据可视化 | `renderer: 'canvas'` 是默认值 |
| D3.js | **SVG**（主要）/ Canvas（可选） | 数据绑定到 DOM | "Data-Driven Documents" |
| Fabric.js | **Canvas** | 图片编辑、设计工具 | 对象模型在 Canvas 之上 |
| Konva.js | **Canvas** | 交互式 Canvas | 虚拟 DOM 层 + 事件系统 |
| Three.js | **WebGL**（GPU 上的 Canvas） | 3D 场景 | WebGL 是 Canvas 的 3D 上下文 |
| AntV G2/G6 | **Canvas** | 统计图表/图可视化 | 阿里系标准方案 |

### Canvas 的分辨率适配（Retina 屏）

```javascript
// Canvas 在高分屏上的模糊问题：需要按 devicePixelRatio 缩放
const canvas = document.querySelector('canvas')
const dpr = window.devicePixelRatio || 1

// 1. 画布像素 = CSS 尺寸 × DPR
canvas.width  = canvas.offsetWidth  * dpr
canvas.height = canvas.offsetHeight * dpr

// 2. 缩放上下文，让所有绘制自动放大
const ctx = canvas.getContext('2d')
ctx.scale(dpr, dpr)

// 3. CSS 尺寸不变（canvas 元素宽高用 CSS 控制）
// canvas { width: 400px; height: 300px; }
// 画布内部实际是 800×600（dpr=2），CSS 显示 400×300
```

## 项目实战

### 后台管理系统中的可视化选型

1. **数据统计大屏**（折线图、柱状图、饼图、地图）：用 ECharts Canvas 模式——图表节点多、不需要独立交互每个数据点
2. **流程图编辑器**（拖拽节点、连线）：用 SVG（react-flow / vue-flow 基于 SVG）——节点数有限、交互密集
3. **图片裁剪/水印**：用 Canvas——操作像素、导出 blob
4. **文件预览缩略图**：用 Canvas 在前端生成缩略图（drawImage + toBlob），减少后端存储压力

## 易错点

1. **Canvas 宽高必须通过属性设（或 JS），不能用 CSS** —— CSS `width:400px` 只是拉伸缩放，不改变画布分辨率；`<canvas width="400" height="300">` 或 `canvas.width = 400` 才设置真实分辨率
2. **Canvas 状态栈** —— `ctx.save()` / `ctx.restore()` 保存/恢复的是填充色、描边色、变换矩阵、字体等全部状态。忘记 restore 会导致样式泄露到后面的绘制
3. **SVG 大量节点性能差** —— 10000 个 `<circle>` 就是 10000 个 DOM 节点，绑定 10000 个事件监听器，渲染/更新/删除都会卡
4. **SVG 的 `<path>` 命令区分大小写** —— 大写 = 绝对坐标，小写 = 相对坐标，`M 10 10` ≠ `m 10 10`
5. **Canvas `getImageData` 受同源策略限制** —— 如果画布上绘制了跨域图片，`toDataURL` 和 `getImageData` 都会报安全错误。需要给图片设置 `crossOrigin="anonymous"` 且 CDN 返回 CORS 头

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "Canvas 和 SVG 有什么区别" | 追问 10000 个点画折线图你用哪个 |
| "ECharts 底层是什么" | 追问什么情况下 ECharts 切换成 SVG |
| "Canvas 怎么响应点击" | 追问 hit-test 的数学实现 |
| "SVG 为什么比 Canvas 卡" | 追问 DOM 节点多的性能瓶颈 |

## 相关阅读

- [图片懒加载](./lazy-loading.md)
- [Web Worker](./web-worker.md) —— Canvas 在 Worker 中渲染（OffscreenCanvas）
- [CSS 渲染性能](../CSS/css-performance.md)

## 更新记录

- 2026-07-09：新建（Canvas/SVG 本质区别表 + 双 API 速查 + 第三方库底层选型 + Retina 适配 + 项目实战）

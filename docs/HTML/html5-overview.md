---
title: HTML5 新特性总览
description: HTML5 新增特性全景：语义化、多媒体、图形、存储、通信、API、性能，面试必备的体系化梳理
category: HTML
type: mechanism
difficulty: 初级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-18
updated: 2026-07-18
tags:
  - HTML5
  - 新特性
  - 语义化
  - Canvas
  - WebSocket
---

# HTML5 新特性总览

> HTML5 不是某个单一技术，而是一整套 Web 平台的升级包。面试时不能只背标签名，要按体系分类、说出每一类解决了什么问题。

## 一句话总结

HTML5 将 HTML 从「文档标记语言」升级为「Web 应用平台」，新增语义化标签、多媒体支持（audio/video 替代 Flash）、图形能力（Canvas/SVG）、本地存储（localStorage/IndexedDB）、通信（WebSocket/SSE/WebRTC）、设备 API（地理位置/拖拽/Notification）和性能优化（lazy loading/responsive images）。

## 核心机制

### 一、语义化标签

用正确的标签描述内容结构，替代 `<div class="xxx">` 的纯视觉时代。

| 代表标签 | 用途 |
|---------|------|
| `header` / `nav` / `main` / `article` / `section` / `aside` / `footer` | 页面结构分区 |
| `dialog` | 原生弹窗，支持 `showModal()` 和 `::backdrop` |
| `details` + `summary` | 原生折叠面板，无需 JS |
| `figure` + `figcaption` | 图片/图表的语义容器 |
| `time` | 日期时间，SEO 友好 |

不深入展开，详情见 [HTML5 语义化](./html5-semantic.md)。

### 二、多媒体

HTML5 通过 `audio` 和 `video` 标签让浏览器原生支持音视频播放，终结了 Flash 播放器的时代。

```html
<video controls poster="cover.jpg">
  <source src="movie.webm" type="video/webm">
  <source src="movie.mp4" type="video/mp4">
  您的浏览器不支持 video 标签
</video>
```

- `audio` / `video` 标签原生播放，支持 `controls` / `autoplay` / `loop` 属性
- `<source>` 多格式降级，浏览器选择第一个支持的格式
- 配合 `Media Source Extensions` 可实现流媒体播放

### 三、图形

| 技术 | 类型 | 适用场景 |
|------|------|---------|
| Canvas | 位图 | 游戏、图表、图像处理、视频截图 |
| SVG | 矢量图 | 图标、数据可视化、可缩放的图形 |

Canvas 通过 JS 操作像素级渲染，输出是位图；SVG 是 XML 描述的矢量图形，支持 CSS 样式和 DOM 事件。选型详情见 [Canvas vs SVG](./canvas-svg.md)。

### 四、客户端存储

| 存储方案 | 容量 | 过期策略 | 适用场景 |
|---------|------|---------|---------|
| localStorage | ~5MB | 永久（除非手动清除） | 用户偏好、主题设置 |
| sessionStorage | ~5MB | 标签页关闭即清除 | 单次会话临时数据 |
| IndexedDB | 远超 5MB | 永久 | 大量结构化数据、离线应用 |

详情见 [浏览器存储](../浏览器/storage.md)。

### 五、通信

| API | 特点 | 适用场景 |
|-----|------|---------|
| WebSocket | 全双工，低延迟 | 即时聊天、实时协作、数据推送 |
| Server-Sent Events | 服务端单向推送，HTTP 自动重连 | 通知推送、股票行情 |
| WebRTC | P2P 音视频 | 视频通话、屏幕共享、文件传输 |

详情见 [WebSocket / SSE](../网络/websocket-sse.md)。

### 六、设备与系统 API

- **Drag and Drop**：原生拖拽，无需模拟 mousedown/mousemove/mouseup
- **Geolocation**：`navigator.geolocation.getCurrentPosition()` 获取位置
- **History API**：`pushState` / `replaceState` + `popstate` 事件，SPA 路由基础
- **Notification**：`Notification.requestPermission()` 系统级桌面通知
- **Web Worker**：独立线程执行耗时计算，不阻塞主线程

### 七、性能与加载

- **`loading="lazy"`**：`img` 和 `iframe` 原生懒加载，无需 JS 实现
- **`fetchpriority`**：`high` / `low` 资源加载优先级控制
- **`picture` + `srcset`**：根据屏幕宽度/DPR 加载不同尺寸图片，节省带宽

```html
<img
  src="photo-800.jpg"
  srcset="photo-400.jpg 400w, photo-800.jpg 800w, photo-1200.jpg 1200w"
  sizes="(max-width: 600px) 400px, 800px"
  loading="lazy"
  alt="响应式图片"
>
```

### 八、表单增强

新增 `input` 类型（email/date/color/range 等）、约束验证 API（`checkValidity()` / `setCustomValidity()`）、`datalist` 自动补全、`output` 计算结果展示。详情见 [HTML5 表单与约束验证](./form-validation.md)。

## 深度拓展

### 面试追问：HTML5 是最新版本吗？

不是。HTML 不再有版本号。2019 年起 W3C 和 WHATWG 达成协议，HTML 以 WHATWG 的 **Living Standard**（持续演进）为标准，不再冻结版本号。这意味着「HTML5」已经成为一个品牌术语，泛指现代 Web 标准，而不是某个特定版本。

### 面试追问：和 HTML4 最大的区别是什么？

核心转变：**从文档标记 → 应用平台**。

HTML4 的目的是描述文档结构（标题、段落、列表），交互靠表单提交，多媒体靠 Flash 插件。HTML5 原生支持富媒体、本地存储、离线应用、实时通信、图形绘制——浏览器成为一个「准操作系统」。

## 易错点

**把 XHTML2 说成 HTML5**

> XML 风格的 XHTML2 路线已被废弃（2009 年 W3C 停止推进）。HTML5 遵循的是「宽松解析」哲学——浏览器对语法错误高度容错，不像 XML 那样「一处非法字符整个页面不渲染」。

**把 CSS3 / ES6 的功劳归于 HTML5**

> HTML5 是「现代前端三大件」中 HTML 的那部分。`flexbox` / `grid` / `transition` 是 CSS 标准，`Promise` / `arrow function` / `const` 是 ES6 标准——都独立于 HTML5。面试时说「HTML5 带来了 flex 布局」会被扣分。

## 面试信号

| 面试官问 | 你要能答 |
|----------|---------|
| "HTML5 有哪些新特性" | 按八大类体系化回答，不要只背标签名 |
| "HTML5 是最新版本吗" | 不是，现在是 Living Standard 持续演进 |
| "和 HTML4 的最大区别" | 从文档标记到应用平台的范式转变 |
| "Canvas 和 SVG 有什么区别" | 位图 vs 矢量图，选型标准 |
| "HTML5 和 CSS3/ES6 是一回事吗" | 不是，三者独立演进 |

## 相关阅读

- [HTML5 语义化](./html5-semantic.md) -- 语义化标签的详细用法
- [Canvas vs SVG](./canvas-svg.md) -- 图形方案选型
- [History API 与 SPA 路由](./history-api.md) -- SPA 路由的底层基础
- [HTML5 表单与约束验证](./form-validation.md) -- 新表单类型和验证 API
- [图片懒加载](./lazy-loading.md) -- loading="lazy" 和响应式图片

## 更新记录

- 2026-07-18：初始创建

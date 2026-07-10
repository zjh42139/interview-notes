---
title: 图片懒加载
description: 图片懒加载的三种实现方式：loading=lazy、IntersectionObserver、滚动事件
category: HTML
type: api-reference
score: 0
difficulty: 中级
frequency: ⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
reviewed: null
tags:
  - 懒加载
  - loading=lazy
  - IntersectionObserver
  - srcset
  - 性能优化
---

# 图片懒加载

> 一句话总结：图片懒加载的核心是"进入视口再加载"，减少首屏请求数从而加速页面渲染。

## 核心机制

### 三种实现方式对比

| 方式 | 兼容性 | 代码量 | 灵活性 | 推荐度 |
|------|--------|--------|--------|--------|
| `loading="lazy"` | Chrome 77+ | 零代码 | 低 | ⭐⭐⭐⭐⭐ |
| IntersectionObserver | IE 不支持 | ~20行 | 高 | ⭐⭐⭐⭐ |
| scroll 事件监听 | 全兼容 | ~50行 | 中 | ⭐⭐ |

### 1. 原生 loading="lazy"（推荐）

```html
<img src="photo.jpg" loading="lazy" alt="照片" />
<iframe src="page.html" loading="lazy"></iframe>
```

浏览器自动管理：图片接近视口时（通常在 1250px-2500px 范围内，取决于网络质量和浏览器实现）开始加载。

**优点**：零 JS、性能最优（浏览器可以在布局阶段就知道哪些图片需要加载）
**局限**：无法控制加载阈值、无法做 placeholder 动画、IE 不支持

### 2. IntersectionObserver 实现

```javascript
function lazyLoad(selector = 'img[data-src]') {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const img = entry.target;
        img.src = img.dataset.src;          // 真正开始加载
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;  // 响应式图片也生效
        }
        img.classList.add('loaded');        // 可以触发 CSS 过渡
        observer.unobserve(img);            // 加载后取消观察
      });
    },
    {
      rootMargin: '200px',   // 提前 200px 开始加载
      threshold: 0,           // 刚进入就触发
    }
  );

  document.querySelectorAll(selector).forEach((img) => observer.observe(img));
}
```

```html
<!-- 使用 data-src 替代 src -->
<img data-src="photo.jpg" src="placeholder.svg" alt="照片" />
```

**`rootMargin: '200px'`** 是提升体验的关键——图片在视口下方 200px 时就开始加载，用户滚动到时已加载完。

### 3. scroll 事件（不推荐用于新项目）

传统的 `scroll` + `getBoundingClientRect()` 方案在高频滚动时性能极差——需要手动 throttle 且 `getBoundingClientRect()` 会触发强制同步布局。

```javascript
// 不推荐：每次 scroll 都触发 reflow
window.addEventListener('scroll', () => {
  images.forEach((img) => {
    const rect = img.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      img.src = img.dataset.src;
    }
  });
});
```

## 深度拓展

### 响应式图片 + 懒加载

```html
<img
  src="placeholder.svg"
  data-src="photo-800w.jpg"
  data-srcset="photo-400w.jpg 400w, photo-800w.jpg 800w, photo-1200w.jpg 1200w"
  data-sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px"
  loading="lazy"
  alt="照片"
/>
```

`srcset` + `sizes` 让浏览器根据设备像素比和视口宽度自动选择最佳分辨率，`loading="lazy"` 叠加懒加载——**两者配合，首屏零图片请求，后续也只加载最合适的尺寸**。

### picture 元素做艺术指导

```html
<picture>
  <!-- 移动端（窄屏）用竖版裁剪 -->
  <source media="(max-width: 600px)" srcset="hero-mobile.jpg" />
  <!-- 桌面端用横版裁剪 -->
  <source media="(min-width: 601px)" srcset="hero-desktop.jpg" />
  <!-- 降级 -->
  <img src="hero.jpg" alt="主横幅" loading="lazy" />
</picture>
```

`<picture>` 让不同设备使用不同图片——不是同一个图片的不同分辨率，而是**完全不同的图片**（裁剪比例不同）。

### 渐进式占位图技术

```html
<div class="image-wrapper">
  <!-- 模糊占位：22 字节的 base64 缩略图 -->
  <img src="data:image/jpeg;base64,/9j/2wBDA..." class="placeholder" />

  <!-- 真实图片：加载后覆盖占位 -->
  <img
    data-src="photo-full.jpg"
    class="real"
    loading="lazy"
    onload="this.style.opacity=1"
  />
</div>
```

```css
.image-wrapper { position: relative; overflow: hidden; }
.placeholder { filter: blur(20px); transform: scale(1.1); }
.real {
  position: absolute; inset: 0;
  opacity: 0; transition: opacity 0.5s;
}
```

结合 base64 的低质量占位图（LQIP）和 CSS 模糊过渡，实现"模糊变清晰"的加载体验——这在技术面中经常被问到。

### WebP / AVIF 降级

```html
<picture>
  <source srcset="photo.avif" type="image/avif" />
  <source srcset="photo.webp" type="image/webp" />
  <img src="photo.jpg" alt="照片" loading="lazy" />
</picture>
```

浏览器按 source 顺序检查，第一个支持的格式被使用。不支持 AVIF → 检查 WebP → 降级到 JPG。

## 项目实战

### 后台管理系统中的图片懒加载

在我们项目中：

1. **表格中的用户头像**（几十行）：用 `loading="lazy"` 原生化，一行代码解决
2. **富文本编辑器中的图片**：`v-md-editor` 预览区的图片用 DOM 级别的 IntersectionObserver 批量懒加载
3. **文件管理页面的缩略图列表**：虚拟列表 + IntersectionObserver 双重优化——不在视口的行不渲染，渲染了但未进入视口的图片不加载
4. **大图预览**：图片查看器里预加载前一张和后一张（`preload`），中间的当前显示大图，形成无缝体验

## 易错点

### 1. loading="lazy" 不能和 width/height auto 一起用

如果 `<img>` 没有显式设置尺寸（width/height 属性或 CSS），浏览器不知道图片的占位高度，会导致**布局偏移（CLS）**——用户看到的内容突然被加载的图片推走。

```html
<!-- ❌ 坏：布局会跳动 -->
<img src="photo.jpg" loading="lazy" />

<!-- ✅ 好：预留空间 -->
<img src="photo.jpg" loading="lazy" width="800" height="600" style="height:auto" />
```

### 2. 首屏图片不应该懒加载

`loading="lazy"` 对首屏图片不仅没用，还可能增加 LCP（Largest Contentful Paint），因为浏览器需要额外判断图片是否在视口内。**首屏关键图片用 `fetchpriority="high"`**：

```html
<img src="hero.jpg" fetchpriority="high" alt="首屏横幅" />
```

### 3. IntersectionObserver 不能观察内联元素

`IntersectionObserver` 必须观察 DOM 元素（Element），不能观察文本节点或伪元素。

## 面试信号

这道题的面试亮点在于**从方案演进的角度回答**：

> "第一代用 scroll + getBoundingClientRect，但有性能问题——每次滚动触发 reflow。第二代用 IntersectionObserver，性能好但需要了解 rootMargin 控制预加载距离。现代用 loading='lazy' 最省事。但实际项目通常是组合——loading='lazy' 处理大多数场景，IntersectionObserver 处理需要自定义加载阈值的场景，首屏关键图用 fetchpriority='high'。"

如果能提到 LQIP（低质量占位图）和 WebP/AVIF 降级的组合使用，直接到高级评价。

## 相关阅读

- [图片优化](../性能优化/image-optimization.md)
- [Web Vitals / CLS](../性能优化/web-vitals.md)
- [虚拟列表](../性能优化/virtual-list.md)
- [defer / async](./script-defer-async.md)

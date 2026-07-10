---
title: 图片优化
description: 图片加载性能优化：格式选择、响应式图片、懒加载与 CDN 图片处理
category: 性能优化
type: api-reference
score: 0
difficulty: 初级
frequency: ⭐⭐⭐
status: draft
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - 图片
  - WebP
  - AVIF
  - lazy loading
  - CDN
---

# 图片优化

> ⭐⭐⭐｜难度：初级｜项目：★★★

**图片通常是页面上体积最大的资源（平均占页面总大小的 40-60%），但图片优化也是最容易被忽视的性能切入点。** 这道题看起来简单，但回答出"从格式选择到 CDN 参数拼接到响应式图片再到 LQIP 占位"的完整链路，就超过了 90% 的候选人。

## 一句话总结

**图片优化通过格式选择、尺寸裁剪、懒加载和 CDN 分发，减少图片加载对性能的影响，尤其是对 LCP 和带宽成本的直接影响。**

## 核心机制

### 格式选择指南

```ts
// 五种主流图片格式的选择决策树：
//
// 需要透明？ ──Yes──> 用 WebP（兼容性好）或 PNG（无损需求）
//    │
//   No
//    │
// 照片/复杂色彩？ ──Yes──> AVIF > WebP > JPEG
//    │
//   No
//    │
// Logo/图标？ ──Yes──> SVG（矢量无限缩放，文件极小）
```

```ts
// 各格式对比
// JPEG:   有损压缩，不支持透明，适合照片，文件小，兼容性 100%
// PNG:    无损压缩，支持透明，适合 Logo/截图（大面积纯色），文件较大
// WebP:   有损+无损+透明+动画全支持，比 JPEG 小 25-35%，兼容性 97%+
// AVIF:   比 WebP 再小 ~30%，支持 HDR，兼容性 93%+（Chrome 85+/Firefox 93+）
// SVG:    矢量 XML，无限缩放，适合图标/Logo，文件极小
```

关键原则：**照片场景下从不需要 PNG**。一张 200KB 的 PNG 照片转成 WebP 可能只有 50KB，质量几乎无差别。

### 响应式图片 -- 同一个位置不同尺寸

```html
<!-- 方案一：srcset + sizes — 浏览器根据屏幕宽度自动选择 -->
<img
  src="hero-800w.webp"
  srcset="hero-400w.webp 400w, hero-800w.webp 800w, hero-1200w.webp 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  alt="Hero banner"
/>

<!-- 方案二：picture + source — 根据格式支持和屏幕条件选择 -->
<picture>
  <source srcset="hero.avif" type="image/avif" />
  <source srcset="hero.webp" type="image/webp" />
  <img src="hero.jpg" alt="Hero banner" width="800" height="400" />
</picture>
```

`picture` 的 `source` 按顺序匹配，第一个支持的格式生效。所以 AVIF 放最前（最优格式），WebP 次之，JPEG 兜底。

### 懒加载 -- 从一行属性到自定义逻辑

```ts
// 原生懒加载（Chrome 77+，最简单的用法）
<img src="below-fold.jpg" loading="lazy" alt="" />
// loading="lazy" 告诉浏览器：这张图等到接近视口时再加载

// Intersection Observer（自定义逻辑，设置预加载距离）
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        img.src = img.dataset.src!      // 开始真正加载
        observer.unobserve(img)          // 只加载一次
      }
    })
  },
  { rootMargin: "200px" } // 距离视口 200px 就开始加载
)

document.querySelectorAll("img[data-src]").forEach((img) => observer.observe(img))
```

### CDN 图片处理 -- URL 即参数

```ts
// 阿里云 OSS：在 URL 上拼参数即可实时处理图片
// 原图: https://cdn.example.com/photo.jpg
// 裁剪 + 压缩 + 转 WebP:
const url = "https://cdn.example.com/photo.jpg?x-oss-process=image/resize,w_200/format,webp/quality,q_80"

// 七牛云：
const url = "https://cdn.example.com/photo.jpg?imageView2/1/w/200/h/200/format/webp"

// 封装工具函数，根据显示位置自动拼接参数
function getImageUrl(path: string, width: number): string {
  const base = "https://cdn.example.com"
  return `${base}${path}?x-oss-process=image/resize,w_${width}/format,webp/quality,q_80`
}
// 头像用缩略图（40x40），详情页用大图（800x800），节省 90%+ 带宽
```

## 深度拓展

### 渐进式 JPEG vs 基线 JPEG

```ts
// 基线 JPEG（Baseline）：从上到下逐行显示
// 渐进式 JPEG（Progressive）：分多次扫描，从模糊到清晰
// 渐进式 JPEG 用户感知更好（立刻看到模糊轮廓，逐步清晰）
// 但解码耗时略高（需要多次扫描）
```

### SVG 优化

```ts
// svgo 工具：去除注释/元数据/无用属性/合并路径，体积可减 30-50%
// 命令：npx svgo --multipass logo.svg -o logo.min.svg

// SVG 内联 vs 外部引用：
// 内联：减少 HTTP 请求，但增加 HTML 体积，适合小图标
// 外部：可缓存，适合大 SVG
// SVG 雪碧图(symbol + use)：减少请求 + 支持 CSS 控制颜色
<svg><use href="#icon-search" /></svg>
```

### LQIP -- 低质量图片占位

```ts
// 三种方案，从简单到复杂：
// 1. LQIP:  把原图缩小到 20-30px 再放大显示，模糊但体积极小（< 1KB）
// 2. SQIP:  用 SVG 几何形状近似图片内容，有艺术感
// 3. BlurHash: 字符串编码模糊图片，后端返回字符串，前端解码渲染
//    "L6DcF]D*009F~q%MD%M{IUD%M{M{_3" — 这串字符就是一张模糊图的编码

// BlurHash 的使用（通用方案，Twitter/Medium 都在用）
import { decode } from "blurhash"
const pixels = decode(blurhash, 32, 32) // 32x32 像素
const canvas = document.createElement("canvas")
// ... render pixels to canvas
```

## 项目实战

### 1. 上传前客户端压缩

```ts
import Compressor from "compressorjs"

function compressBeforeUpload(file: File): Promise<File> {
  return new Promise((resolve) => {
    new Compressor(file, {
      maxWidth: 1920,       // 限制最大宽度
      maxHeight: 1920,
      quality: 0.8,         // 压缩质量
      convertSize: 500_000, // 超过 500KB 才压缩
      success: (result) => resolve(result as File),
    })
  })
}

// 上传前压缩：2MB 照片 -> 200KB，上传快 10 倍，存储成本也低
const compressed = await compressBeforeUpload(rawFile)
await uploadToOSS(compressed)
```

### 2. CDN 图片参数动态处理

```ts
// 封装工具函数，自动拼接 CDN 裁剪参数
export function cdnImage(path: string, options: { w?: number; h?: number; q?: number } = {}) {
  const { w, h, q = 80 } = options
  const params = new URLSearchParams()
  if (w) params.set("w", String(w))
  if (h) params.set("h", String(h))
  params.set("q", String(q))
  params.set("fmt", "webp") // 自动转 WebP
  return `${CDN_BASE}${path}?${params.toString()}`
}

// 使用：列表头像请求 40x40 缩略图，原图可能是 800x800
<img :src="cdnImage(user.avatar, { w: 40, h: 40 })" />
```

### 3. 用户头像裁剪上传

```ts
// vue-advanced-cropper — 固定输出尺寸，统一 200x200
<cropper
  ref="cropperRef"
  :src="previewUrl"
  :stencil-props="{ aspectRatio: 1 }"
  @change="onCropChange"
/>

async function uploadCropped() {
  const { canvas } = cropperRef.value.getResult()
  const blob: Blob = await new Promise((r) => canvas.toBlob(r, "image/webp", 0.85))
  const file = new File([blob], "avatar.webp", { type: "image/webp" })
  await upload(file)
}
```

## 易错点

1. **所有场景都用 PNG** -- 照片用 JPEG/WebP 体积更小，PNG 只适合透明和纯色（Logo、截图）
2. **不管什么图都上 AVIF** -- 先检查浏览器支持，用 `<picture>` 标签做降级，AVIF -> WebP -> JPEG 逐层兜底
3. **只压质量不压尺寸** -- 2000px 宽的图在 300px 的卡片里显示，带宽浪费 95%。先裁剪尺寸，再压缩质量
4. **懒加载所有图片** -- 首屏图片不要用 `loading="lazy"`（会延迟 LCP），首屏以上正常加载，首屏以下懒加载
5. **CSS background-image 不优化** -- background-image 也是图片请求，同样需要合适格式和尺寸；可以用 `image-set()` 做响应式

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "图片怎么优化" | 追问 WebP/AVIF 格式 + srcset 响应式 + loading=lazy + CDN + 压缩 |
| "为什么不能用 PNG 替代 JPEG" | 追问 JPEG 有损压缩适合照片——PNG 无损适合图标/截图 |
| "渐进式加载怎么实现" | 追问 LQIP 低质量占位→原图加载后过渡替换 |

## 相关阅读

- [首屏优化](./first-screen.md)
- [打包优化](./bundle-optimization.md)
- [Web Vitals](./web-vitals.md)
- [性能优化知识地图](./index.md)

## 更新记录

- 2026-07-05：Phase 2 深度填充（格式选择 + 响应式图片 + 懒加载 + CDN 处理 + LQIP + 项目实战）

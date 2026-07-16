---
title: 打包优化
description: 前端打包优化：代码分割、Tree Shaking、压缩与缓存策略
category: 性能优化
type: api-reference
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - 打包
  - code splitting
  - lazy loading
  - chunk
---

# 打包优化

> ⭐⭐⭐⭐｜难度：中级｜项目：★★★

**打包优化的核心不是跑一个命令把体积减半，而是建立"体积会重新长回来"的防御体系。** 面试时能说出 Code Splitting + Tree Shaking + 压缩 + 缓存四板斧，并能解释它们各自的原理和适用边界，基本就站稳了。

## 一句话总结

**打包优化通过代码分割、Tree Shaking、压缩和合理的缓存策略，减少 JS bundle 的体积和加载时间，让代码更快到达用户的浏览器。**

## 核心机制

### 代码分割 -- Code Splitting 的四个维度

```ts
// 1. route-level：每个路由独立 chunk（最基础）
const routes = [
  { path: "/a", component: () => import("@/views/A.vue") },
  { path: "/b", component: () => import("@/views/B.vue") },
]

// 2. component-level：大型组件动态加载
// 富文本编辑器、图表库、视频播放器等重型组件
const Editor = defineAsyncComponent(() => import("@/components/RichEditor.vue"))
const Chart = defineAsyncComponent(() => import("@/components/BigChart.vue"))

// 3. vendor 拆分：node_modules 独立 chunk，利用浏览器缓存
// 依赖不变时 chunk hash 不变，用户浏览器直接从缓存读取

// 4. shared chunk：多入口共享的模块提取为公共 chunk
// webpack 的 splitChunks.minChunks 自动处理
```

拆包的目标不是"尽可能多拆"，而是让**频繁变动的业务代码**和**不常变动的依赖**分开。页面迭代时用户只需要重新下载业务 chunk（几十 KB），vendor chunk（几百 KB）继续走缓存。

### Tree Shaking -- 为什么有时候"摇"不掉

Tree Shaking 依赖 ESM 的静态导入/导出语法，打包工具在编译时分析依赖图，标记并删除未使用的代码。

```ts
// 能 shake 掉：静态 import，编译时就知道用到了谁
import { debounce } from "lodash-es"  // 只引入 debounce，其余不打包

// 不能 shake 掉：动态 require，运行时才知道
const _ = require("lodash")           // 整个 lodash 都打包进来

// 必要条件：
// 1. ESM 语法（import/export）
// 2. sideEffects 字段标记（package.json）
// 3. 函数无副作用（纯函数，调用可被安全删除）
```

```json
// package.json — 关键配置
{
  "sideEffects": ["*.css", "*.less"]   // 标记有副作用的文件，防止被误删
}
```

如果 `sideEffects: false` 但项目里有 `import "./style.css"`，Tree Shaking 会认为这个 import 没用而删掉它，导致样式丢失。

### 压缩 -- 三层的压缩体系

```ts
// 第一层：代码压缩 — 删除空格/注释/缩短变量名
// webpack: TerserPlugin（默认，JS）  +  CssMinimizerPlugin（CSS）
// Vite:    esbuild（速度是 terser 的 10-100 倍）

// 第二层：网络传输压缩 — 服务端开启，对文本资源压缩后传输
// Gzip:    压缩率 60-80%，Nginx 默认支持
// Brotli:  比 Gzip 再小 ~20%，但压缩慢，适合构建时预生成 .br 文件

// 第三层：现代化语法 — 更短的语法 = 更小的体积
// 可选链 ?.、空值合并 ?? 都是更短的等价写法
```

### 缓存策略 -- Hash 的学问

```ts
// 文件名 hash 的三种策略：
// [hash]      每次构建全局 hash 都变，不利于缓存
// [chunkhash] 同 chunk 内容不变 hash 不变，推荐
// [contenthash] 文件内容不变 hash 不变，最精细

// 输出配置示例（Vite / Rollup）
output: {
  entryFileNames: "js/[name]-[hash:8].js",       // 入口
  chunkFileNames: "js/[name]-[hash:8].js",       // 异步 chunk
  assetFileNames: "assets/[name]-[hash:8][extname]", // CSS/图片等
}
```

## 深度拓展

### Vite 的 manualChunks 拆包策略

```ts
// vite.config.ts — 生产环境的拆包策略
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-vue": ["vue", "vue-router", "pinia"],   // 框架层
          "vendor-ui": ["element-plus"],                   // UI 库（体积大）
          "vendor-echarts": ["echarts"],                   // 图表库（体积大，非必需）
          "vendor-utils": ["dayjs", "lodash-es"],          // 工具库
        },
      },
    },
  },
})
```

拆包原则：把**体积大且稳定**的库单独拆出（echarts、element-plus），让框架层和工具库分开。不要把 node_modules 全打进一个 vendor，体积动辄 1MB+ 的 vendor 缓存命中率极低。

### 动态 import 的 magic comments

```ts
// webpack 的 magic comments（Vite/Rollup 部分支持）
import(
  /* webpackChunkName: "my-chunk" */       // 命名 chunk
  /* webpackPrefetch: true */              // 空闲时预加载（<link rel="prefetch">）
  /* webpackPreload: true */               // 并行加载（<link rel="preload">）
  "./heavy-module"
)
```

### module / nomodule 双版本策略

现代浏览器支持 ES2015+ 语法（更简短的代码 = 更小的 bundle），老浏览器需要 ES5 的降级版本。构建时生成两套产物：

```html
<!-- 现代浏览器加载 ESM 版本（小） -->
<script type="module" src="app.esm.js"></script>
<!-- 老浏览器加载 ES5 版本（大） -->
<script nomodule src="app.legacy.js"></script>
```

Vite 通过 `@vitejs/plugin-legacy` 自动处理这套机制。

## 项目实战

### 1. Vite 完整构建配置

```ts
// vite.config.ts — 生产级构建配置
export default defineConfig({
  build: {
    target: "es2015",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 500, // 超过 500KB 警告
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["vue", "vue-router", "pinia"],
          element: ["element-plus"],
        },
      },
    },
    // Vite 默认使用 esbuild 压缩，需显式设 minify: 'terser' 才生效
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: true, drop_debugger: true },
    },
    // 或直接用 esbuild 的配置（无需切换 minify）：
    // esbuild: { drop: ['console', 'debugger'] },
  },
})
```

### 2. Element Plus 按需导入

```ts
// 不需要手动注册组件，unplugin 自动处理
// vite.config.ts
import AutoImport from "unplugin-auto-import/vite"
import Components from "unplugin-vue-components/vite"
import { ElementPlusResolver } from "unplugin-vue-components/resolvers"

export default {
  plugins: [
    AutoImport({ resolvers: [ElementPlusResolver()] }),    // 自动 import composition API
    Components({ resolvers: [ElementPlusResolver()] }),    // 自动注册组件
  ],
}
// 效果：只打包实际用到的组件，element-plus 全量 1MB+ -> 按需 200KB
```

### 3. lodash 按需引入的正确姿势

```ts
// ❌ 全量引入 — 280KB 全部打包
import _ from "lodash"

// ✅ 按需引入 ESM 版本 — 只打包用到的函数
import { debounce, throttle, cloneDeep } from "lodash-es"

// ✅ 更细粒度（只引入单个函数，适用于只用一个函数的情况）
import debounce from "lodash-es/debounce"
```

## 易错点

1. **node_modules 全打进一个 vendor** -- 一个 1.5MB 的 vendor.js，任何一个小依赖升级都导致整个 vendor hash 变化，缓存全部失效。拆分成稳定的框架层和多变的工具层更合理
2. **sideEffects: false 删掉了 CSS** -- 需要标记 `sideEffects: ["*.css", "*.less"]`，否则直接 import 的样式文件会被 Tree Shaking 误删
3. **不配置输出 hash** -- 文件名不带 hash，每次部署用户都要重新下载所有资源，浏览器缓存完全用不上
4. **动态 import 没设置加载状态** -- 组件加载时需要 `<Suspense>` 或骨架屏兜底，否则网络慢时用户看到空白
5. **压缩只在构建时做** -- 服务端 Nginx 也要开启 Gzip（或预生成 .br 文件），网络传输体积才是用户真正感知的

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "打包体积怎么优化" | 追问 Tree Shaking + 按需引入 + code splitting + gzip 的组合拳 |
| "webpack-bundle-analyzer 怎么用" | 追问可视化分析每个 chunk 的大小——定位大依赖和重复打包 |
| "路由懒加载的原理" | 追问 dynamic import 返回 Promise——webpack 自动拆成独立 chunk |

## 相关阅读

- [首屏优化](./first-screen.md)
- [Web Vitals](./web-vitals.md)
- [Vite 工程化](../工程化/vite.md)
- [Tree Shaking 原理](../工程化/tree-shaking.md)
- [性能优化知识地图](./index.md)

## 更新记录

- 2026-07-05：Phase 2 深度填充（Code Splitting + Tree Shaking + 压缩三层体系 + manualChunks 策略 + 项目实战）

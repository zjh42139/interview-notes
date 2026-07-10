---
title: Web Worker
description: Web Worker 在独立线程中运行 JavaScript，通过 postMessage 与主线程通信，用于执行耗时计算任务而不阻塞主线程 UI 渲染
category: 浏览器
type: api-reference
score: 0
difficulty: 中级
frequency: ⭐⭐⭐
status: reviewed
created: 2026-07-05
updated: 2026-07-05
reviewed: 2026-07-05
tags:
  - Web Worker
  - 多线程
  - postMessage
---

# Web Worker

> 面试官问"大数据量导出时页面卡死了怎么办"，Web Worker 就是你的答案。它是浏览器给前端开的"后门"——让你在后台线程跑重计算，主线程该渲染渲染，该交互交互。

## 一句话总结

**Web Worker 在独立于主线程的后台线程中运行 JavaScript，通过 `postMessage` 进行线程间消息通信，适合处理 CPU 密集型任务（大数据计算、文件处理、密码学操作），不能访问 DOM / window / document，从而天然避免了多线程共享状态的竞争问题。**

---

## 核心机制

### 专用 Worker（Dedicated Worker）vs 共享 Worker（Shared Worker）

| 类型 | 归属 | 可被访问 | 生命周期 | 使用场景 |
|------|------|---------|---------|---------|
| **Dedicated Worker** | 单一页面/脚本 | 只有创建它的页面 | 页面关闭则 Worker 终止 | 99% 的场景（导出、计算、解析） |
| **Shared Worker** | 同源的所有页面 | 同源的任意标签页/iframe | 所有关联页面关闭才终止 | 跨标签页共享状态（WebSocket 连接池、跨标签页消息中转） |

面试中 99% 的问题都是关于 Dedicated Worker 的。Shared Worker 了解一下概念即可——实际项目中用得很少，因为浏览器兼容性和调试成本较高。

### postMessage：结构化克隆传递数据

Worker 和主线程之间通过 `postMessage(data)` 发送消息，通过 `onmessage` 事件接收消息：

```javascript
// main.js
const worker = new Worker('./worker.js');
worker.postMessage({ type: 'CALC', payload: hugeArray });
worker.onmessage = (e) => {
  console.log('Worker 返回结果:', e.data);
};

// worker.js
self.onmessage = (e) => {
  const result = heavyCalculation(e.data.payload);
  self.postMessage(result);
};
```

**postMessage 传递数据时默认使用"结构化克隆"（Structured Clone）**——类似于 `JSON.parse(JSON.stringify(obj))` 的深拷贝，但效率更高，且支持更多类型（Date、RegExp、Map、Set、Blob、File、ImageData 等）。

**关键点**：结构化克隆是**拷贝**，不是共享内存。主线程和 Worker 中的数据是完全独立的，修改一边不影响另一边。这是安全的，但当数据量很大时（几百 MB），拷贝本身就是性能瓶颈。

### Transferable Objects：零拷贝转移所有权

对于大数据（ArrayBuffer、MessagePort），可以用**可转移对象**——把所有权从主线程"转移"到 Worker，主线程无法再访问该数据：

```javascript
// 转移后 mainBuffer 在主线程中变为空（byteLength = 0）
worker.postMessage(mainBuffer, [mainBuffer]);
// mainBuffer 现在已经不可用了 —— 所有权在 Worker 中
```

这相当于移动语义——速度快到接近零开销，因为实际数据没有复制，只是指针换了个主人。典型场景：Canvas 图像数据、WebGL 缓冲区、大文件内容。

### Worker 中不能访问什么

Worker 运行在完全独立的 JS 环境中，**没有以下全局对象**：

- `window`、`document`、`parent` —— 不能操作 DOM
- `localStorage`、`sessionStorage` —— 不能直接访问存储（但可通过 postMessage 让主线程代理）
- **可以访问**：`navigator`、`location`（只读）、`fetch`、`WebSocket`、`IndexedDB`、`setTimeout`、`setInterval`、`console`

**面试金句**：Worker 不能操作 DOM 是设计特性而非限制——它避免了多线程并发修改 UI 带来的锁和竞态问题。Android/iOS 的 UI 框架也是同样的设计，只有主线程能操作 UI。

---

## 深度拓展

### 追问1：Vite 中如何使用 Web Worker

Vite 原生支持 Web Worker，有两种方式：

**方式一：`new URL` 构造（推荐）**：

```typescript
// main.ts
const worker = new Worker(
  new URL('./workers/data-processor.ts', import.meta.url),
  { type: 'module' }  // 支持 ES module
);
worker.postMessage(rawData);
worker.onmessage = (e) => console.log(e.data);
```

Vite 会自动识别 `new URL(..., import.meta.url)` 模式，把 Worker 文件单独打包成一个 chunk，并处理开发和生产环境的路径差异。

**方式二：`?worker` 导入后缀**：

```typescript
import DataWorker from './workers/data-processor?worker';
const worker = new DataWorker();
worker.postMessage(data);
```

这种方式更简洁，Worker 文件会被自动编译和分离。生产构建时，Worker 会被单独打包，文件名带 hash，与主线程代码独立。

### 追问2：Comlink 库简化 Worker 通信

原生 postMessage 是消息驱动的一一你得手动管理消息类型、序列化、错误处理。当 Worker 里有多个函数时，代码很快变得混乱。

[Comlink](https://github.com/GoogleChromeLabs/comlink) 是 Google 推出的库，让 Worker 通信像调用本地函数一样简单：

```typescript
// worker.ts
import { expose } from 'comlink';

const api = {
  calculateStats(data: number[]) {
    const sorted = data.sort((a, b) => a - b);
    return { min: sorted[0], max: sorted.at(-1), median: sorted[Math.floor(sorted.length / 2)] };
  },
  async fetchAndProcess(url: string) {
    const res = await fetch(url);
    return processData(await res.json());
  },
};
expose(api);

// main.ts
import { wrap } from 'comlink';
const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
const api = wrap<typeof import('./worker')>(worker);

// 像调用本地 async 函数一样 —— 自动使用 postMessage
const stats = await api.calculateStats(millionNumbers);
```

Comlink 底层仍是 postMessage，但它封装了序列化、Promise 映射和错误传递。

### 追问3：SharedArrayBuffer + Atomics 实现共享内存

如果你真的需要共享内存（而非拷贝），可以用 `SharedArrayBuffer` + `Atomics`：

```javascript
// 主线程
const sab = new SharedArrayBuffer(1024);
const view = new Int32Array(sab);
worker.postMessage(sab);

// Worker
self.onmessage = (e) => {
  const view = new Int32Array(e.data);
  Atomics.add(view, 0, 1);    // 原子操作，保证线程安全
  Atomics.wait(view, 0, 1);   // 等待条件满足
};
```

`Atomics` 提供原子操作（add、sub、compareExchange）和同步原语（wait、notify），避免了竞态条件。`SharedArrayBuffer` 在 Spectre 漏洞后曾一度被禁用，现在已恢复——前提是页面设置了 `Cross-Origin-Opener-Policy` 和 `Cross-Origin-Embedder-Policy` 头。

### 追问4：Service Worker vs Web Worker

面试官可能会问你这两者的区别：

| 维度 | Web Worker | Service Worker |
|------|-----------|---------------|
| **用途** | 计算密集型任务 | 网络代理、缓存、推送通知 |
| **生命周期** | 页面关闭即终止 | 独立于页面，浏览器管理 |
| **作用范围** | 创建它的页面 | 注册它的整个域 |
| **能拦截网络请求** | 不能 | **能**（fetch 事件） |
| **DOM 访问** | 不能 | 不能 |
| **持久化** | 否 | 是（可独立运行） |
| **典型场景** | Excel 导出、MD5 计算 | 离线缓存、PWA、消息推送 |

---

## 项目实战

### 1. 大数据量 Excel 导出在 Worker 中处理

在 Vue3 后台系统中，管理员导出 10 万条订单数据。如果用主线程处理，页面直接冻结 5 秒。

```typescript
// composables/useExport.ts
export function useLargeExport() {
  const exporting = ref(false);
  const progress = ref(0);

  async function exportOrders(filters: Record<string, any>) {
    exporting.value = true;
    progress.value = 0;

    // 在主线程中请求数据
    const res = await fetch('/api/orders/export?' + new URLSearchParams(filters));
    const rawData = await res.json();

    // 将重量级处理交给 Worker
    const worker = new Worker(
      new URL('../workers/excel-builder.worker.ts', import.meta.url),
      { type: 'module' }
    );

    return new Promise<void>((resolve, reject) => {
      worker.postMessage({ type: 'BUILD_EXCEL', data: rawData });
      worker.onmessage = (e) => {
        if (e.data.type === 'PROGRESS') {
          progress.value = e.data.percent;  // 实时更新进度条
        } else if (e.data.type === 'DONE') {
          // Worker 返回 { blob, fileName }，主线程触发下载
          const url = URL.createObjectURL(e.data.blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = e.data.fileName;
          a.click();
          URL.revokeObjectURL(url);
          worker.terminate();  // 完成即销毁，释放内存
          exporting.value = false;
          resolve();
        }
      };
      worker.onerror = reject;
    });
  }

  return { exporting, progress, exportOrders };
}
```

在 Worker 文件中，我们用 `exceljs` 库构建工作簿——10 万行数据的样式、合并、自动列宽计算全部在 Worker 中完成，主线程只负责触发下载这一"轻操作"。

### 2. 大文件 MD5 计算

上传大文件（500MB+）需要计算 MD5 用于断点续传校验。在主线程中计算 500MB 文件的哈希值可能耗时 10 秒以上——用 Worker：

```typescript
// workers/file-hash.worker.ts
import SparkMD5 from 'spark-md5';

self.onmessage = async (e) => {
  const file: File = e.data;
  const chunkSize = 2 * 1024 * 1024; // 2MB 分片
  const spark = new SparkMD5.ArrayBuffer();
  const totalChunks = Math.ceil(file.size / chunkSize);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const chunk = file.slice(start, start + chunkSize);
    const buffer = await chunk.arrayBuffer();
    spark.append(buffer);
    // 发送进度
    self.postMessage({ type: 'PROGRESS', percent: Math.round((i / totalChunks) * 100) });
  }

  self.postMessage({ type: 'DONE', md5: spark.end() });
};
```

### 3. 复杂 JSON 数据处理

后台系统有一个"数据报表"页面，后端返回 5 万条原始记录，前端需要按部门、月份、产品线做三维交叉聚合——这种树形聚合计算在 Worker 中完成，主线程只负责渲染最终结果（可能已经被聚合到几百行）。

### 4. 密码学操作

前端做端到端加密（E2EE）时，RSA 密钥生成（2048 位）在主线程耗时 500ms-2s。放在 Worker 中执行，用户界面始终可交互。

---

## 相关阅读

- [MDN: Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [MDN: Using Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
- [Comlink — Google Chrome Labs](https://github.com/GoogleChromeLabs/comlink)
- [Vite: Web Workers](https://vitejs.dev/guide/features.html#web-workers)
- [性能优化/bundle-optimization](../性能优化/bundle-optimization) —— Worker 文件如何被构建工具分离和优化

---

## 更新记录

- 2026-07-05：完成完整内容，补充 Vite Worker 使用、Comlink、SharedArrayBuffer、项目实战案例（Phase 2）

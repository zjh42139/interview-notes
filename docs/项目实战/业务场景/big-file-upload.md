---
title: 大文件上传
description: 大文件上传通过分片切割、断点续传、秒传检测和并发控制实现高效可靠的大文件传输，配合 Web Worker 计算 hash 避免阻塞主线程，适用于后管系统的视频和压缩包上传
category: 项目实战
section: 业务场景
difficulty: 中高级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-06
updated: 2026-07-06
reviewed: null
tags:
  - 大文件上传
  - 分片上传
  - 断点续传
  - 秒传
  - Web Worker
---

# 大文件上传

> "大文件上传是前端面试的压轴题。分片怎么切？秒传怎么实现？断点续传的状态记录在哪里？hash 计算会不会卡住页面？并发上传如何控制数量？——分片、秒传、断点、并发控制，四个维度一个都不能少。"

---

## 一句话总结

大文件上传通过 **Blob.slice 分片切割 + Promise 并发池控制并发数** 上传分片，通过 **Web Worker 计算 SHA-256 hash** 避免阻塞主线程，通过 **hash 比对实现秒传**，通过 **localStorage + 后端校验实现断点续传**，四个核心机制协同工作。

---

## 核心机制

### 1. Web Worker 中计算文件 hash

大文件（如 2GB 视频）在主线程计算 MD5 会阻塞 UI 数秒，必须放入 Worker：

```typescript
// src/workers/hash.worker.ts
import SparkMD5 from 'spark-md5'

self.onmessage = async (e: MessageEvent<File>) => {
  const file = e.data
  const spark = new SparkMD5.ArrayBuffer()
  const chunkSize = 5 * 1024 * 1024   // 5MB 分片读取

  let offset = 0
  while (offset < file.size) {
    const chunk = file.slice(offset, offset + chunkSize)
    const buffer = await chunk.arrayBuffer()
    spark.append(buffer)

    // 向主线程报告进度
    const progress = Math.round((offset / file.size) * 100)
    self.postMessage({ type: 'progress', progress })

    offset += chunkSize
  }

  const hash = spark.end()
  self.postMessage({ type: 'complete', hash })
}
```

主线程调用 Worker：

```typescript
// src/utils/hash.ts
let worker: Worker | null = null

export function computeHash(
  file: File,
  onProgress?: (p: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    // 每次创建新的 Worker 实例（Worker 用完即销毁）
    worker = new Worker(
      new URL('../workers/hash.worker.ts', import.meta.url),
      { type: 'module' }
    )

    worker.onmessage = (e) => {
      const { type, progress, hash } = e.data
      if (type === 'progress') {
        onProgress?.(progress)
      } else if (type === 'complete') {
        resolve(hash)
        worker?.terminate()
        worker = null
      }
    }
    worker.onerror = (e) => {
      reject(e)
      worker?.terminate()
    }
    worker.postMessage(file)
  })
}
```

### 2. 并发池控制

```typescript
// src/utils/concurrent-pool.ts
export async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  maxConcurrent: number
): Promise<T[]> {
  const results: T[] = new Array(tasks.length)
  let currentIndex = 0

  async function runNext(): Promise<void> {
    while (currentIndex < tasks.length) {
      const index = currentIndex++
      results[index] = await tasks[index]()
    }
  }

  // 启动 maxConcurrent 个 worker
  const workers = Array.from({ length: Math.min(maxConcurrent, tasks.length) }, () =>
    runNext()
  )
  await Promise.all(workers)

  return results
}
```

### 3. 分片上传主流程

```typescript
// src/utils/big-file-upload.ts
import { computeHash } from './hash'
import { runWithConcurrency } from './concurrent-pool'
import { httpUpload } from '@/utils/http'

const CHUNK_SIZE = 5 * 1024 * 1024   // 5MB 每片
const MAX_CONCURRENT = 3              // 最多 3 个并发

interface UploadCallbacks {
  onHashProgress?: (p: number) => void
  onUploadProgress?: (p: number) => void
}

export async function uploadBigFile(
  file: File,
  callbacks: UploadCallbacks = {}
): Promise<string> {
  // ========== 1. 计算 hash（Web Worker） ==========
  const fileHash = await computeHash(file, callbacks.onHashProgress)

  // ========== 2. 秒传检测 ==========
  try {
    const { data } = await httpUpload.post('/api/upload/check', { fileHash })
    if (data.exist) {
      callbacks.onUploadProgress?.(100)
      return data.url   // 秒传成功！
    }
  } catch { /* 继续上传 */ }

  // ========== 3. 获取已上传分片（断点续传） ==========
  let uploadedChunks: number[] = []
  try {
    const { data } = await httpUpload.get('/api/upload/chunks', {
      params: { fileHash },
    })
    uploadedChunks = data.uploadedChunks || []
  } catch { /* 继续 */ }

  // 同时检查 localStorage 中的记录（双重保险）
  const localRecord = JSON.parse(
    localStorage.getItem(`upload_${fileHash}`) || '[]'
  )
  uploadedChunks = [...new Set([...uploadedChunks, ...localRecord])]

  // ========== 4. 创建分片 ==========
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
  const pendingChunks: { index: number; blob: Blob }[] = []

  for (let i = 0; i < totalChunks; i++) {
    if (!uploadedChunks.includes(i)) {
      pendingChunks.push({
        index: i,
        blob: file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
      })
    }
  }

  // ========== 5. 并发上传分片 ==========
  let completedChunks = uploadedChunks.length

  const tasks = pendingChunks.map((chunk) => {
    return async () => {
      const formData = new FormData()
      formData.append('chunk', chunk.blob)
      formData.append('fileHash', fileHash)
      formData.append('chunkIndex', String(chunk.index))
      formData.append('totalChunks', String(totalChunks))
      formData.append('fileName', file.name)

      await httpUpload.post('/api/upload/chunk', formData)

      completedChunks++
      callbacks.onUploadProgress?.(
        Math.round((completedChunks / totalChunks) * 100)
      )

      // 记录到 localStorage
      saveUploadedChunk(fileHash, chunk.index)
    }
  })

  await runWithConcurrency(tasks, MAX_CONCURRENT)

  // ========== 6. 通知后端合并 ==========
  const { data } = await httpUpload.post('/api/upload/merge', {
    fileHash,
    fileName: file.name,
    totalChunks,
    chunkSize: CHUNK_SIZE,
  })

  // 清理记录
  clearUploadedChunks(fileHash)

  return data.url
}

// ---------- 分片记录辅助函数 ----------
function saveUploadedChunk(fileHash: string, index: number) {
  const key = `upload_${fileHash}`
  const list: number[] = JSON.parse(localStorage.getItem(key) || '[]')
  if (!list.includes(index)) {
    list.push(index)
    localStorage.setItem(key, JSON.stringify(list))
  }
}

function clearUploadedChunks(fileHash: string) {
  localStorage.removeItem(`upload_${fileHash}`)
}
```

---

## 深度拓展

### 追问 1：秒传的完整流程

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  前端     │         │  后端     │         │  数据库    │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │  1. 计算文件 SHA-256    │                  │
     │  2. POST /check {hash}  │                  │
     │───────────────────────>│                  │
     │                        │  3. 查询 hash     │
     │                        │─────────────────>│
     │                        │  4. 返回结果      │
     │                        │<─────────────────│
     │  5. { exist: true, url }                   │
     │<───────────────────────│                  │
     │  6. 直接使用 url，跳过上传                 │
```

**秒传的前提**：后端在第一次上传完文件合并后，将 fileHash 和文件路径存入数据库。下次相同 hash 的文件再上传时，直接返回已有路径。

### 追问 2：断点续传两种方案对比

| 方案 | 存储位置 | 优点 | 缺点 |
|------|----------|------|------|
| localStorage | 浏览器本地 | 不依赖后端、即时查询 | 换浏览器/清缓存后丢失 |
| 后端记录 | 数据库/Redis | 不受客户端环境影响 | 需要额外接口、多一次请求 |

**推荐：双重保险**——优先取后端记录，同时 localStorage 做兜底（后端记录可能是上一次在其他浏览器上传的，localStorage 覆盖本地记录）。

### 追问 3：为什么 hash 计算要用 Web Worker？

| 文件大小 | 主线程计算时间 | 页面表现 |
|----------|---------------|----------|
| 100MB | ~0.5s | 轻微卡顿 |
| 500MB | ~2.5s | 明显卡顿，UI 无响应 |
| 2GB | ~10s | **页面冻结**，用户体验极差 |

Web Worker 在独立线程中运行，完全不阻塞主线程的 UI 渲染和用户交互。

### 追问 4：并发数如何确定？

- 浏览器对同一域名的并发连接数限制为 6 个（HTTP/1.1）
- 并发数过大：占满连接数，影响页面其他请求
- 并发数过小：上传速度慢
- **推荐 3-5 个并发**，在速度和稳定性之间取得平衡

---

## 项目实战

### 后管系统的视频上传方案

```
业务场景：运营人员上传培训视频（500MB ~ 2GB）

完整流程：
1. 用户拖入视频文件
2. 前端校验：文件类型（mp4/avi/mkv）、文件大小（上限 5GB）
3. Web Worker 计算 SHA-256 hash（同时显示 hash 计算进度条）
4. 秒传检测：若服务端已有，直接完成
5. 断点续传检测：获取已上传分片索引
6. 并发上传分片（3 个并发，5MB/片），展示上传进度
7. 全部分片上传完成，通知后端合并
8. 后端异步转码（不同分辨率），前端轮询转码进度
9. 转码完成，视频可播放
```

### 上传进度展示组件

```vue
<template>
  <div class="upload-progress">
    <div v-if="hashProgress < 100" class="step">
      <span>正在计算文件摘要...</span>
      <el-progress :percentage="hashProgress" />
    </div>
    <div v-else class="step">
      <span>{{ uploaded ? '秒传成功' : '正在上传...' }}</span>
      <el-progress :percentage="uploadProgress" :status="status" />
      <span class="detail">
        {{ completedChunks }} / {{ totalChunks }} 分片
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const hashProgress = ref(0)
const uploadProgress = ref(0)
const completedChunks = ref(0)
const totalChunks = ref(0)
const uploaded = ref(false)

const status = computed(() => {
  if (uploaded.value) return 'success'
  if (uploadProgress.value === 100) return 'success'
  return ''
})
</script>
```

---

## 易错点

1. **`file.slice()` 不会复制内容**：`Blob.slice()` 返回的是原 Blob 的引用视图（view），不会复制数据，所以创建大量分片不会造成内存翻倍。但通过 `new File([chunk], ...)` 包装会复制数据，应直接用原始 Blob 上传。

2. **并发池 Promise 泄漏**：如果某个分片上传失败，没有 catch 错误，会导致 `Promise.all` 永远不会 resolve，所有后续流程卡死。每个分片的 task 内部必须 try-catch 或返回错误供外部处理。

3. **文件 hash 碰撞**：MD5 理论上存在碰撞可能（虽然概率极低）。对安全性要求高的场景，建议使用 SHA-256（256 位），碰撞概率接近零。

4. **localStorage 容量限制**：大多数浏览器 localStorage 限制 5-10MB。分片数量多时（如 2GB 文件 = 400 个分片），只存索引数组（每个 4 字节）通常没问题，但不要存分片内容。

---

## 相关阅读

- [文件上传](./file-upload.md) — 小文件上传的基础方案（FormData + Axios）
- [WebSocket 实战](./websocket.md) — 通过 WebSocket 实时推送上传进度
- [Axios 封装](../基础设施/axios-encapsulation.md) — 上传专用 Axios 实例的封装

---

## 更新记录

- 2026-07-06：完成内容填充，新增大文件上传完整方案（Web Worker hash、并发池、秒传检测、断点续传）、进度展示组件、和 file-upload.md 的差异化定位

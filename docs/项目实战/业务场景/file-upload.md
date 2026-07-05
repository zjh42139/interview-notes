---
title: 文件上传
description: 文件上传通过 FormData + Axios 实现，支持分片上传、断点续传、并发控制、进度监控，涵盖大文件优化和秒传机制
category: 项目实战
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: completed
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - 文件上传
  - 断点续传
  - 分片上传
  - 大文件
  - 进度监控
---

# 文件上传

> "文件上传不只是 `<input type='file'>` 加 FormData。当文件大到几百 MB 时，你需要分片、断点续传、并发控制、进度监控——每一个都是面试亮点。"

---

## 一句话总结

文件上传是通过 **FormData + Axios 上传文件**，配合 **Blob.slice 分片切割 + 并发上传 + 服务端合并** 处理大文件，通过 **localStorage 记录已上传分片** 实现断点续传，通过 **Axios onUploadProgress** 实现进度监控。

---

## 核心机制

### 1. 单文件 / 多文件上传（基础版）

```typescript
// src/utils/upload.ts
import { httpUpload } from '@/utils/http'

export interface UploadOptions {
  onProgress?: (percent: number) => void
  signal?: AbortSignal
}

export async function uploadFile(
  file: File,
  options: UploadOptions = {}
): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('name', file.name)

  const { data } = await httpUpload.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    signal: options.signal,
    onUploadProgress: (progressEvent) => {
      if (options.onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100)
        options.onProgress(percent)
      }
    },
  })
  return data.url   // 返回文件访问 URL
}
```

### 2. 分片上传（大文件核心方案）

**原理**：用 `Blob.slice()` 将文件切成多片，并发上传所有分片，最后通知后端合并。

```typescript
// src/utils/chunk-upload.ts
import SparkMD5 from 'spark-md5'
import { httpUpload } from '@/utils/http'
import type { AxiosProgressEvent } from 'axios'

const CHUNK_SIZE = 5 * 1024 * 1024  // 每片 5MB
const MAX_CONCURRENT = 3            // 最大并发数

// ---------- 计算文件 Hash（用于秒传 & 断点续传） ----------
function computeFileHash(file: File): Promise<string> {
  return new Promise((resolve) => {
    const spark = new SparkMD5.ArrayBuffer()
    const reader = new FileReader()
    reader.onload = (e) => {
      spark.append(e.target!.result as ArrayBuffer)
      resolve(spark.end())
    }
    reader.readAsArrayBuffer(file)
  })
}

// ---------- 切片 ----------
function createChunks(file: File): Blob[] {
  const chunks: Blob[] = []
  let start = 0
  while (start < file.size) {
    chunks.push(file.slice(start, start + CHUNK_SIZE))
    start += CHUNK_SIZE
  }
  return chunks
}

// ---------- 断点续传：检查已上传的分片 ----------
async function getUploadedChunks(fileHash: string): Promise<number[]> {
  const res = await httpUpload.get('/api/upload/chunks', {
    params: { fileHash },
  })
  return res.data.uploadedChunks   // 返回已上传的分片索引数组
}

// ---------- 并发上传分片（带并发控制） ----------
async function uploadChunks(
  chunks: Blob[],
  fileHash: string,
  fileName: string,
  uploadedChunks: number[],
  onProgress: (percent: number) => void
): Promise<void> {
  const totalChunks = chunks.length
  let completedChunks = uploadedChunks.length   // 已完成的（包括之前上传的）

  // 需要上传的分片索引
  const pending = chunks
    .map((_, i) => i)
    .filter((i) => !uploadedChunks.includes(i))

  // 并发控制：每次最多 MAX_CONCURRENT 个请求
  const pool = new Set<Promise<void>>()

  for (const index of pending) {
    const task = (async () => {
      const formData = new FormData()
      formData.append('chunk', chunks[index])
      formData.append('fileHash', fileHash)
      formData.append('chunkIndex', String(index))
      formData.append('totalChunks', String(totalChunks))
      formData.append('fileName', fileName)

      await httpUpload.post('/api/upload/chunk', formData)
      completedChunks++
      onProgress(Math.round((completedChunks / totalChunks) * 100))
      // 记录已上传分片（用于断点续传）
      saveUploadedChunk(fileHash, index)
    })()

    pool.add(task)
    // 任务完成就从池里移除
    task.finally(() => pool.delete(task))

    // 控制并发数
    if (pool.size >= MAX_CONCURRENT) {
      await Promise.race(pool)
    }
  }
  // 等待所有任务完成
  await Promise.all(pool)
}

// ---------- 合并分片 ----------
async function mergeChunks(fileHash: string, fileName: string): Promise<string> {
  const { data } = await httpUpload.post('/api/upload/merge', {
    fileHash, fileName, chunkSize: CHUNK_SIZE,
  })
  return data.url
}

// ---------- 主函数：完整的分片上传流程 ----------
export async function chunkedUpload(
  file: File,
  onProgress: (percent: number) => void
): Promise<string> {
  // 1. 计算文件 Hash
  const fileHash = await computeFileHash(file)

  // 2. 秒传检测：如果文件已存在，直接返回 URL
  try {
    const { data } = await httpUpload.post('/api/upload/check', { fileHash })
    if (data.exist) {
      onProgress(100)
      return data.url   // 秒传！
    }
  } catch { /* 继续上传 */ }

  // 3. 断点续传：获取已上传的分片
  const uploadedChunks = await getUploadedChunks(fileHash)

  // 4. 切片 + 并发上传
  const chunks = createChunks(file)
  await uploadChunks(chunks, fileHash, file.name, uploadedChunks, onProgress)

  // 5. 通知后端合并
  const url = await mergeChunks(fileHash, file.name)
  clearUploadedChunks(fileHash)   // 清理 localStorage

  return url
}

// ---------- localStorage 记录已上传分片 ----------
function saveUploadedChunk(fileHash: string, index: number) {
  const key = `upload_${fileHash}`
  const list = JSON.parse(localStorage.getItem(key) || '[]')
  list.push(index)
  localStorage.setItem(key, JSON.stringify(list))
}

function clearUploadedChunks(fileHash: string) {
  localStorage.removeItem(`upload_${fileHash}`)
}
```

---

## 深度拓展

### 追问 1：秒传是怎么实现的？

秒传的核心是 **文件 Hash 唯一性**：
1. 前端计算文件的 MD5/SHA-256
2. 发送 `POST /api/upload/check { fileHash }` 给后端
3. 后端查数据库：如果此 Hash 的文件已存在 → 直接返回已有 URL，省去上传

注意：MD5 计算大文件可能耗时几秒，可以用 Web Worker 计算 Hash 避免阻塞主线程。

### 追问 2：图片上传前压缩预览

```typescript
// 使用 Canvas 压缩图片
async function compressImage(file: File, maxWidth = 1920, quality = 0.8): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ratio = Math.min(maxWidth / img.width, 1)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => resolve(blob!), file.type, quality)
    }
    img.src = URL.createObjectURL(file)
  })
}
```

### 追问 3：文件类型和大小校验

```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
const MAX_SIZE = 10 * 1024 * 1024  // 10MB

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `不支持的文件类型：${file.type}，仅支持 ${ALLOWED_TYPES.join(', ')}`
  }
  if (file.size > MAX_SIZE) {
    return `文件过大：${(file.size / 1024 / 1024).toFixed(1)}MB，最大 ${MAX_SIZE / 1024 / 1024}MB`
  }
  return null  // 校验通过
}
```

---

## 项目实战

### Element Plus Upload 组件封装

```vue
<template>
  <el-upload
    :http-request="customUpload"       <!-- 接管上传逻辑 -->
    :before-upload="beforeUpload"
    :on-remove="handleRemove"
    :file-list="fileList"
    :limit="5"
    drag
  >
    <el-icon><UploadFilled /></el-icon>
    <div>将文件拖到此处，或<em>点击上传</em></div>
    <template #tip>
      <div class="el-upload__tip">
        支持 jpg/png/pdf，单文件不超过 10MB
      </div>
    </template>
  </el-upload>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { UploadRequestOptions, UploadFile } from 'element-plus'
import { ElMessage } from 'element-plus'

const fileList = ref<UploadFile[]>([])

function beforeUpload(file: File) {
  const error = validateFile(file)
  if (error) { ElMessage.error(error); return false }
  return true
}

async function customUpload(options: UploadRequestOptions) {
  try {
    const url = await chunkedUpload(options.file, (percent) => {
      options.onProgress({ percent })    // 同步进度到 Element Plus
    })
    options.onSuccess({ url }, options.file)
  } catch (e: any) {
    options.onError(e)
  }
}
</script>
```

---

## 易错点

1. **`onUploadProgress` 中的 `progressEvent.total` 可能为 0**：当后端没有返回 `Content-Length` 时 total 为空。需做防御：`if (progressEvent.total) { ... }`。

2. **FormData 中文件名中文乱码**：后端可能按 ISO-8859-1 解码文件名。解决：前端 encodeURIComponent 或后端统一使用 UTF-8。

3. **并发上传分片时顺序错乱**：每个分片都携带 `chunkIndex`，后端根据 index 写入对应位置。与请求发出的顺序无关——分片的顺序由 `chunkIndex` 保证。

4. **Blob.slice 内存问题**：`file.slice()` 不会复制文件内容，它返回的是原 Blob 的引用窗口，内存友好。但浏览器可能限制并发文件读取数，用 `MAX_CONCURRENT` 控制。

---

## 相关阅读

- [Axios 封装](../基础设施/axios-encapsulation.md) — 上传专用 Axios 实例的创建
- [Excel 导入导出](./excel-import-export.md) — Excel 文件的上传与下载
- [防重复请求](../基础设施/request-dedup.md) — 上传按钮的 loading 防护

---

## 更新记录

- 2026-07-05：完成内容填充（Phase 2），新增分片上传完整代码、秒传方案、并发控制、Element Plus 组件封装

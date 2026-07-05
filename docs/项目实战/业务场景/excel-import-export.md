---
title: Excel 导入导出
description: Excel 导入导出通过 xlsx（SheetJS）库操作文件，涵盖 FileReader 读取、JSON 转换、数据校验、Blob 下载、分 Sheet 大文件策略
category: 项目实战
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: completed
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - Excel
  - xlsx
  - 导入
  - 导出
  - 批量处理
  - SheetJS
---

# Excel 导入导出

> "后台管理系统的产品经理最爱说：'加个导出 Excel 功能吧。' —— 但面试官关心的是：你的导出能处理 10 万条数据吗？导入时校验失败的行怎么反馈给用户？"

---

## 一句话总结

Excel 导入导出是通过 **xlsx（SheetJS）库**在浏览器端完成 Excel 文件的读写：导入走 `FileReader → ArrayBuffer → xlsx.read → JSON → 数据校验` 链路；导出走 `JSON → xlsx.utils.json_to_sheet → xlsx.write → Blob → 触发下载` 链路。

---

## 核心机制

### 1. Excel 导入流程

```typescript
// src/utils/excel.ts
import * as XLSX from 'xlsx'
import { ElMessage } from 'element-plus'

export interface ImportResult<T> {
  list: T[]
  errors: Array<{ row: number; field: string; message: string }>
  totalRows: number
  successRows: number
}

/**
 * 读取 Excel 文件并转换为 JSON
 */
export async function readExcel<T = Record<string, any>>(
  file: File
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        // 取第一个 Sheet
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json<T>(firstSheet, {
          defval: '',           // 空单元格默认值
          raw: false,           // 不保留原始格式（日期显示为字符串）
        })
        resolve(json)
      } catch (err) {
        reject(new Error('文件解析失败，请确认文件格式正确'))
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 带数据校验的导入
 * @param file Excel 文件
 * @param validator 自定义校验函数
 */
export async function importWithValidation<T>(
  file: File,
  validator: (row: T, index: number) => string[]  // 返回该行的错误信息列表
): Promise<ImportResult<T>> {
  const rawList = await readExcel<T>(file)
  const list: T[] = []
  const errors: ImportResult<T>['errors'] = []

  rawList.forEach((row, i) => {
    const rowErrors = validator(row, i)
    if (rowErrors.length === 0) {
      list.push(row)
    } else {
      rowErrors.forEach((msg) => {
        errors.push({ row: i + 2, field: '', message: msg })   // +2: 标题行 + 0-based
      })
    }
  })

  return {
    list,
    errors,
    totalRows: rawList.length,
    successRows: list.length,
  }
}
```

### 2. Excel 导出流程

```typescript
/**
 * 将 JSON 数据导出为 Excel 文件并触发下载
 */
export function exportExcel<T = Record<string, any>>(
  data: T[],
  fileName: string,
  options?: {
    sheetName?: string
    columns?: Array<{ header: string; key: string; width?: number }>
  }
): void {
  // 1. 格式化数据（按 columns 映射中文表头）
  const exportData = options?.columns
    ? data.map((row) => {
        const mapped: Record<string, any> = {}
        options.columns!.forEach((col) => {
          mapped[col.header] = (row as any)[col.key]
        })
        return mapped
      })
    : data

  // 2. 创建 Worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData)

  // 3. 设置列宽（可选）
  if (options?.columns) {
    worksheet['!cols'] = options.columns.map((col) => ({
      wch: col.width || 20,
    }))
  }

  // 4. 创建 Workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    options?.sheetName || 'Sheet1'
  )

  // 5. 写为 ArrayBuffer 并触发下载
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  downloadBlob(buffer, `${fileName}.xlsx`)
}

/**
 * 触发浏览器下载
 */
function downloadBlob(data: ArrayBuffer, fileName: string): void {
  const blob = new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
```

### 3. 大数据量导出 —— 分 Sheet 策略

```typescript
/**
 * 大数据量分 Sheet 导出
 * 每个 Sheet 最多 10000 行（Excel 单 Sheet 上限约 104 万行，但浏览器内存先扛不住）
 */
export function exportLargeData<T>(
  data: T[],
  fileName: string,
  options?: { columns?: Array<{ header: string; key: string; width?: number }>; rowsPerSheet?: number }
): void {
  const rowsPerSheet = options?.rowsPerSheet || 10000
  const workbook = XLSX.utils.book_new()

  const totalSheets = Math.ceil(data.length / rowsPerSheet)
  for (let i = 0; i < totalSheets; i++) {
    const sheetData = data.slice(i * rowsPerSheet, (i + 1) * rowsPerSheet)
    const formatted = options?.columns
      ? sheetData.map((row) => {
          const mapped: Record<string, any> = {}
          options.columns!.forEach((col) => {
            mapped[col.header] = (row as any)[col.key]
          })
          return mapped
        })
      : sheetData

    const ws = XLSX.utils.json_to_sheet(formatted)
    if (options?.columns) {
      ws['!cols'] = options.columns.map((c) => ({ wch: c.width || 20 }))
    }
    XLSX.utils.book_append_sheet(workbook, ws, `数据${i + 1}`)
  }

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  downloadBlob(buffer, `${fileName}.xlsx`)
}
```

---

## 深度拓展

### 追问 1：导出数据量太大浏览器卡死怎么办？

| 方案 | 思路 | 适用量级 |
|------|------|---------|
| 分 Sheet | 每个 Sheet 1 万行，多 Sheet 写入 | < 10 万行 |
| **后端导出** | 后端生成文件 → 返回下载 URL → 前端 `<a>` 下载 | 任意量级 |
| Web Worker | Worker 线程中执行 `XLSX.write`，不阻塞主线程 | < 5 万行 |

**最佳实践**：超过 5 万行建议走**后端导出**。前端做导出请求 → 后端生成文件放到 OSS → 返回下载链接。进度通知可用 WebSocket 或轮询。

### 追问 2：导入校验的具体策略

```typescript
// 典型的导入校验器
function userImportValidator(row: any, index: number): string[] {
  const errors: string[] = []
  if (!row['用户名']?.trim()) errors.push(`第${index + 2}行：用户名为必填`)
  if (row['手机号'] && !/^1[3-9]\d{9}$/.test(row['手机号'])) {
    errors.push(`第${index + 2}行：手机号格式不正确`)
  }
  if (row['年龄'] && (row['年龄'] < 0 || row['年龄'] > 150)) {
    errors.push(`第${index + 2}行：年龄不在合理范围内`)
  }
  return errors
}
```

### 追问 3：Excel 模板下载

```typescript
// 下载导入模板（只有表头，没有数据）
export function downloadTemplate(
  fileName: string,
  columns: Array<{ header: string; width?: number }>
): void {
  const worksheet = XLSX.utils.aoa_to_sheet([columns.map((c) => c.header)])
  worksheet['!cols'] = columns.map((c) => ({ wch: c.width || 20 }))
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '模板')
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  downloadBlob(buffer, `${fileName}_导入模板.xlsx`)
}
```

---

## 项目实战

### Element Plus 表格导出 Excel

```typescript
// 复用表格的 columns 配置直接导出
interface TableColumn {
  prop: string
  label: string
  visible?: boolean
}

function exportTableData<T extends Record<string, any>>(
  data: T[],
  columns: TableColumn[],
  fileName: string
): void {
  const visibleCols = columns.filter((c) => c.visible !== false)
  exportExcel(data, fileName, {
    columns: visibleCols.map((c) => ({
      header: c.label,
      key: c.prop,
      width: 20,
    })),
  })
}
```

### 导入预览 + 错误行高亮

```vue
<template>
  <div>
    <input type="file" accept=".xlsx,.xls" @change="handleImport" />
    <!-- 校验错误提示 -->
    <el-alert v-if="errors.length" type="warning" :title="`${errors.length} 条数据校验失败`" closable />
    <!-- 预览表格 -->
    <el-table :data="previewList" border>
      <el-table-column
        v-for="col in columns"
        :key="col.key"
        :prop="col.key"
        :label="col.header"
        :class-name="({ rowIndex }) => errorRows.includes(rowIndex) ? 'error-row' : ''"
      />
    </el-table>
  </div>
</template>
```

---

## 易错点

1. **日期格式在 xlsx 中变成数字**：Excel 的日期底层是序列号（如 `44927`）。解决：读取时设置 `raw: false`，xlsx 会自动格式化为字符串；或者在获取时判断类型 `cellType === 'd'`。

2. **CSV 和 XLSX 混淆**：CSV 无类型信息、无多 Sheet、编码易乱码。正式功能用 xlsx 格式，CSV 只做轻量导出。

3. **前端导出的文件无法在 WPS / Office 中打开**：`bookType: 'xlsx'` 要与 Blob `type` 的 MIME 类型一致。常见错误：type 写成 `application/vnd.ms-excel`（那是 .xls 的老格式）。

4. **导入大 Excel 导致页面假死**：`sheet_to_json` 是同步的，处理 10 万行数据可能耗时数秒。解决：大文件交给 Worker 线程处理，或提示用户"导入中..."并分批读取。

---

## 相关阅读

- [文件上传](./file-upload.md) — Excel 文件的上传（FormData / 大文件分片）
- [大数据表格](./big-data-table.md) — 导入后大表单的渲染优化
- [防重复请求](../基础设施/request-dedup.md) — 导出按钮防重复点击

---

## 更新记录

- 2026-07-05：完成内容填充（Phase 2），新增完整导入导出工具函数、分 Sheet 策略、数据校验、模板下载

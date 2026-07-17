---
title: 富文本编辑器
description: 富文本编辑器选型与集成——Tiptap/Quill/TinyMCE 对比与实践
category: 项目实战
type: practice
difficulty: 中高级
frequency: ⭐⭐⭐
status: filled
created: 2026-07-17
tags:
  - 富文本
  - Tiptap
  - Quill
  - 内容编辑
  - XSS
---

# 富文本编辑器

> ⭐⭐⭐｜难度：中高级｜后台管理系统高频需求

## 一句话总结

**富文本编辑器的选型核心看四点：是否基于 ProseMirror（扩展性）、XSS 防护机制、体积和首屏加载、是否支持协同编辑。Vue3 后台管理系统首选 Tiptap（ProseMirror + Vue3 一等公民 + 类型安全）。**

## 核心方案对比

| 方案 | 内核 | 体积 | 扩展性 | Vue3 支持 | 适用场景 |
|------|------|:---:|:---:|:---:|------|
| **Tiptap** | ProseMirror | 中等 | 极强 | 一等公民 | 需要自定义工具栏/节点/样式的项目 |
| **Quill** | 自研 | 小 | 中等 | 第三方 | 简单富文本——不需要复杂定制 |
| **TinyMCE** | 自研 | 大 | 强 | 官方支持 | 企业级——需要完整编辑器生态 |
| **WangEditor** | Slate | 小 | 中等 | 官方支持 | 国内项目——中文文档好、体积小 |
| **Lexical** | 自研（Meta） | 中等 | 极强 | 社区 | 新一代方案——架构优秀但不成熟 |

## Tiptap 实战

```ts
// 安装：npm install @tiptap/vue-3 @tiptap/starter-kit @tiptap/extension-placeholder

// composables/useRichEditor.ts
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { watch, onBeforeUnmount } from 'vue'

export function useRichEditor(content: Ref<string>, placeholder = '请输入内容...') {
  const editor = useEditor({
    content: content.value,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] }, // 只允许 h1-h3
      }),
      Placeholder.configure({ placeholder }),
    ],
    // XSS 关键：ProseMirror 默认只输出结构化 JSON，不会执行 HTML
    // 前端展示用 v-html 时务必配合 DOMPurify 做二次过滤
    onUpdate: ({ editor }) => {
      content.value = editor.getHTML() // 保存 HTML
    },
  })

  // 富文本编辑器挂载时获取焦点会消耗大量 DOM 操作
  // 建议默认不自动聚焦，有需要时手动调用 editor.commands.focus()
  watch(content, (newVal) => {
    // 外部修改内容时同步——注意避免循环更新
    if (editor.value && newVal !== editor.value.getHTML()) {
      editor.value.commands.setContent(newVal, false) // false = 不触发 onUpdate
    }
  })

  onBeforeUnmount(() => {
    editor.value?.destroy()
  })

  return { editor }
}
```

```vue
<!-- RichEditor.vue — 封装后的组件 -->
<template>
  <div class="rich-editor">
    <div v-if="editor" class="toolbar">
      <button @click="editor.chain().toggleBold().run()" :class="{ active: editor.isActive('bold') }">
        <strong>B</strong>
      </button>
      <button @click="editor.chain().toggleItalic().run()" :class="{ active: editor.isActive('italic') }">
        <em>I</em>
      </button>
      <button @click="editor.chain().toggleHeading({ level: 2 }).run()">H2</button>
      <button @click="editor.chain().toggleBulletList().run()">• 列表</button>
      <button @click="editor.chain().toggleBlockquote().run()">引用</button>
    </div>
    <EditorContent :editor="editor" />
  </div>
</template>
```

## XSS 防护——富文本的安全底线

富文本编辑器的最大风险是 XSS——用户输入的内容会以 HTML 形式展示给其他人：

```ts
// ❌ 直接 v-html 展示——如果编辑器允许 script 标签，直接 XSS
<div v-html="rawHtml" />

// ✅ 后端展示前用 DOMPurify 清洗
import DOMPurify from 'dompurify'
const safeHtml = DOMPurify.sanitize(rawHtml, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'blockquote', 'a', 'img'],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'title'],
})
```

**关键原则**：
1. 前端过滤是辅助，后端必须做最终清洗——不能信任任何客户端数据
2. ProseMirror（Tiptap 内核）本身输出结构化 JSON schema，天然防 XSS——比直接暴露 HTML 安全一层
3. CSP 头设 `script-src 'self'` 作为最后一道防线

## 图片上传集成

```ts
// Tiptap 自定义 Image 扩展 —— 支持直接粘贴/拖拽上传
import Image from '@tiptap/extension-image'

const CustomImage = Image.extend({
  addAttributes() {
    return { src: {}, alt: { default: null }, title: { default: null } }
  },
}).configure({
  // 粘贴图片时自动上传到 OSS
  handlePaste: (view, event) => {
    const items = event.clipboardData?.items
    // ... 读取 File → upload → 插入 markdown 语法
  },
})
```

## 面试追问

| 追问 | 回答 |
|------|------|
| "富文本怎么防 XSS" | 三层防线：编辑器层（ProseMirror 结构化输出）+ 展示层（DOMPurify）+ CSP 头 |
| "Tiptap 和 Quill 怎么选" | 需要自定义节点/工具栏 → Tiptap；简单富文本不用定制 → Quill。Tiptap 核心优势是 ProseMirror 的 Schema 驱动架构——能精确控制文档模型 |
| "图片粘贴怎么处理" | 监听 paste 事件 → 提取 File → 上传 OSS → 拿到 URL → 插入编辑器。Tiptap 可通过扩展节点自定义上传流程 |
| "协同编辑怎么实现" | Tiptap 基于 ProseMirror 的 OT/CRDT 方案（如 Yjs + y-prosemirror）。核心是操作转换——A 的插入不会覆盖 B 的删除 |

## 相关阅读

- [大文件上传](./big-file-upload.md)
- [文件上传](./file-upload.md)
- [浏览器 XSS](../../浏览器/安全/xss.md)
- [CSP](../../浏览器/安全/csp.md)

## 更新记录

- 2026-07-17：新建——覆盖率审计补齐

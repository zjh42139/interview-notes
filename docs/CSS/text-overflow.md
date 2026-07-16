---
title: 文本溢出省略
description: CSS 单行/多行文本溢出省略的原理、兼容方案与多行截断最佳实践
category: CSS
type: api-reference
score: 0
difficulty: 初级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-08
updated: 2026-07-08
reviewed: null
tags:
  - text-overflow
  - line-clamp
  - 文本溢出
  - 省略号
  - word-break
---

# 文本溢出省略

> &#11088;&#11088;&#11088;&#11088;｜难度：初级&#9733;&#9733;&#9733;&#9733;

## 一句话总结

**单行省略用 `text-overflow: ellipsis` 三件套，多行省略用 `-webkit-line-clamp` 四件套。** 理解 `white-space`、`word-break`、`overflow-wrap` 如何控制换行，就能处理 90% 的文本溢出场景。

## 核心机制

### 单行文本溢出省略

```css
/* 三件套缺一不可 */
.ellipsis {
  overflow: hidden;           /* ① 溢出隐藏 */
  white-space: nowrap;        /* ② 强制不换行 */
  text-overflow: ellipsis;    /* ③ 溢出显示省略号 */
}

/* 其他 text-overflow 值 */
text-overflow: clip;          /* 直接截断（默认） */
text-overflow: ellipsis;      /* 省略号 … */
text-overflow: "  ...";       /* 自定义省略字符串（Firefox 支持） */
```

### 多行文本溢出省略

```css
/* 四件套 —— -webkit-line-clamp 方案 */
.line-clamp-2 {
  display: -webkit-box;              /* ① 弹性盒子模型 */
  -webkit-box-orient: vertical;      /* ② 垂直排列 */
  -webkit-line-clamp: 2;             /* ③ 第 N 行截断 */
  overflow: hidden;                  /* ④ 溢出隐藏 */
}

/* ⚠️ 兼容性：基于 -webkit- 前缀，但不是只有 WebKit 支持
   2026 年：Chrome/Edge/Firefox/Safari 全兼容
   IE 不支持（IE 已淘汰，可以忽略） */
```

### 换行控制三件套

```css
/* word-break —— 控制是否可在词内断行 */
word-break: normal;           /* 默认：空格断行，CJK 任意断行 */
word-break: break-all;        /* 任意位置断行（在单词内部也可以断） */
word-break: keep-all;         /* 只在空格处断行（CJK 文本也不会任意断） */

/* overflow-wrap（原名 word-wrap） —— 长单词/URL 溢出时是否断行 */
overflow-wrap: normal;        /* 默认：长单词不拆，可能溢出 */
overflow-wrap: break-word;    /* 长单词/URL 溢出时强制拆开换行 */
/* break-word vs break-all: break-word 只在"可能溢出时"才拆单词，
   break-all 不管溢不溢出都按字符拆 */

/* white-space —— 控制空格和换行符的处理 */
white-space: normal;          /* 默认：合并空格、自动换行 */
white-space: nowrap;          /* 合并空格、不换行（单行省略的关键） */
white-space: pre;             /* 保留空格和换行、不自动换行 */
white-space: pre-wrap;        /* 保留空格和换行、自动换行 */
white-space: pre-line;        /* 合并空格、保留换行、自动换行 */
white-space: break-spaces;    /* 类似 pre-wrap，但长空格也会断行 */
```

## 深度拓展

### line-clamp 的实现原理

`-webkit-line-clamp` 不是独立的 CSS 属性，它依赖 `display: -webkit-box` 和 `-webkit-box-orient: vertical` 的配合。这三者组合后，弹性盒子的每一行（line）就是一个 box，`-webkit-line-clamp: N` 限制最多显示 N 个 box，超出的用省略号截断。

### 非 WebKit 兼容的多行省略方案

```css
/* 方案：max-height + 伪元素遮罩（兼容性好，但复杂） */
.fallback-clamp {
  position: relative;
  max-height: 3em;       /* line-height × 2 行 */
  overflow: hidden;
  line-height: 1.5;
}
.fallback-clamp::after {
  content: '...';
  position: absolute;
  right: 0;
  bottom: 0;
  padding-left: 20px;
  background: linear-gradient(to right, transparent, white 50%);
}
```

不推荐在生产环境使用（hacky、脆弱），仅供参考。2026 年 `line-clamp` 兼容性已经足够好。

### 表格单元格内省略

```css
/* 表格 td 内省略需要额外处理 */
td.ellipsis {
  max-width: 0;             /* 关键：让 td 可以收缩到小于内容宽度 */
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
/* 或直接用 table-layout: fixed */
table { table-layout: fixed; width: 100%; }
```

## 项目实战

### 后台管理表格列省略

```vue
<template>
  <el-table-column label="备注" min-width="150" show-overflow-tooltip>
    <!-- Element Plus: show-overflow-tooltip 自动处理省略 + hover 显示完整内容 -->
  </el-table-column>
</template>
```

```css
/* 手动省略 + Tooltip */
.cell-ellipsis {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
```

### 卡片标题两行省略

```css
.card-title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  font-size: 14px;
  line-height: 1.5;
  max-height: calc(14px * 1.5 * 2);  /* 后备方案：精确高度截断 */
}
```

### 搜索历史列表单行省略

```css
.search-history li {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 100%;  /* 确保不超出父容器 */
}
```

## 易错点

1. **只写 `text-overflow: ellipsis` 不生效** —— 缺少 `overflow: hidden` + `white-space: nowrap`，三件套缺一不可
2. **多行省略忘了 `display: -webkit-box`** —— 少了它 `-webkit-line-clamp` 完全不生效
3. **`break-all` 让英文单词碎掉** —— 视觉效果差，一般用 `overflow-wrap: break-word` 更合理
4. **Flex 子元素省略失效** —— flex 子元素默认 `min-width: auto`，需要加 `min-width: 0`
5. **`line-clamp` 和 `padding` 冲突** —— 多行省略的元素如果设置了 padding-bottom，省略号位置可能计算错误

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "单行文本溢出怎么实现" | 追问三件套为什么缺一个都不行 |
| "多行文本截断怎么做" | 追问 line-clamp 的兼容性 + 降级方案 |
| "word-break 和 overflow-wrap 区别" | 追问 break-all 和 break-word 的实际效果差异 |

## 相关阅读

- [盒模型](./box-model.md)
- [CSS 渲染性能](./css-performance.md)

## 更新记录

- 2026-07-08：新建（单行三件套 + 多行四件套 + 换行控制 + 表格省略 + 项目实战）

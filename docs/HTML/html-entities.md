---
title: HTML 实体与编码
description: HTML 字符实体、URL 编码、XSS 防御中的转义机制，以及 innerHTML vs textContent 的安全差异
category: HTML
difficulty: 初级
frequency: ⭐⭐⭐
status: drafted
created: 2026-07-09
updated: 2026-07-09
reviewed: null
tags:
  - HTML实体
  - URL编码
  - XSS
  - 转义
  - innerHTML
---

# HTML 实体与编码

> &#11088;&#11088;&#11088;｜难度：初级｜项目：&#9733;&#9733;

## 一句话总结

**HTML 实体（`&lt;` `&amp;` 等）将"有 HTML 含义的字符"安全地显示在页面上；URL 编码（`encodeURIComponent`）将"有 URL 含义的字符"安全地放在 URL 参数中——两者是 XSS 防御的第一道防线。**

## 核心机制

### 一、为什么需要 HTML 实体

HTML 中 `<` `>` `"` `&` 有特殊含义。如果你要在页面上**显示**这些字符本身，就需要转义：

```html
<!-- 你想在页面上显示：<script>alert('xss')</script> 这段文字 -->
<!-- 如果直接写，浏览器会把它当成真实的 script 标签执行 -->
<!-- 需要用 HTML 实体转义： -->

&lt;script&gt;alert(&apos;xss&apos;);&lt;/script&gt;
```

### 二、核心 HTML 实体清单

| 字符 | 实体名 | 实体编号 | 记忆 |
|------|--------|----------|------|
| `<` | `&lt;` | `&#60;` | **l**ess **t**han |
| `>` | `&gt;` | `&#62;` | **g**reater **t**han |
| `&` | `&amp;` | `&#38;` | **amp**ersand |
| `"` | `&quot;` | `&#34;` | **quot**ation mark |
| `'` | `&apos;` | `&#39;` | **apo****s**trophe |
| 空格 | `&nbsp;` | `&#160;` | **n**on-**b**reaking **sp**ace |

```html
<!-- 使用示例 -->
<p>2 &lt; 3 &amp;&amp; 5 &gt; 4</p>
<!-- 渲染：2 < 3 && 5 > 4 -->

<p>属性值中放引号：&lt;img alt=&quot;他说：&amp;quot;你好&amp;quot;&quot;&gt;</p>

<!-- 多个连续空格：普通空格会被合并为一个，&nbsp; 不会被合并 -->
<p>这是三个普通空格   会被合并</p>
<p>这是三个不间断空格&nbsp;&nbsp;&nbsp;不会合并</p>
```

### 三、XSS 防御中的 HTML 转义

**始终转义 `<` `"` `'` `&`**。XSS 的常见入口是 `innerHTML` 和在 HTML 属性中使用用户输入：

```javascript
// ❌ 危险：用户输入直接被插入为 HTML
function showComment(userInput) {
  document.getElementById('comment').innerHTML = userInput
}
// 用户输入：<img src=x onerror="alert('XSS')">
// → XSS 攻击成功！

// ✅ 安全：转义后插入
const ESC_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (ch) => ESC_MAP[ch])
}
document.getElementById('comment').innerHTML = escapeHtml(userInput)
// 用户输入被转义后变成无害的文字显示在页面上

// ✅ 更简单：用 textContent（不会解析 HTML）
document.getElementById('comment').textContent = userInput
// textContent 始终将内容作为纯文本处理，天然安全
```

**`innerHTML` vs `textContent` vs `innerText` 的安全差异**：

| 属性 | 是否解析 HTML | 是否触发回流 | 安全 |
|------|-------------|-------------|------|
| `innerHTML` | 是 | 是 | ❌ 需手动转义 |
| `textContent` | 否 | 是 | ✅ 天然安全 |
| `innerText` | 否 | 是（需样式计算） | ✅ 但比 textContent 慢 |

### 四、URL 编码

URL 中的某些字符也有特殊含义（`&` 分隔参数、`=` 赋值、`?` 开始 query、`#` 开始 hash），如果参数值包含这些字符就需要编码：

```javascript
// URL 中不安全字符 → 必须编码
const keyword = 'vue & react'
const encoded = encodeURIComponent(keyword)  // 'vue%20%26%20react'
const url = `https://api.example.com/search?q=${encoded}`
// 结果：https://api.example.com/search?q=vue%20%26%20react

// encodeURI vs encodeURIComponent 的区别：
const path = '/搜索/你好.js'

encodeURI(path)           // '/%E6%90%9C%E7%B4%A2/%E4%BD%A0%E5%A5%BD.js'
// 保留：: / ? # [ ] @ ! $ & ' ( ) * + , ; =（认为这些是 URL 语法字符）
// 用途：编码完整 URL

encodeURIComponent(path)  // '%2F%E6%90%9C%E7%B4%A2%2F%E4%BD%A0%E5%A5%BD.js'
// / 也被编码为 %2F
// 用途：编码 URL 参数的值

// 解码：
decodeURI('%E4%BD%A0%E5%A5%BD')          // '你好'
decodeURIComponent('%2F%E6%90%9C%E7%B4%A2')     // '/搜索'
```

### 五、常见编码速查

```javascript
// 1. Base64
btoa('Hello 你好')  // 报错（btoa 只处理 Latin1）
// 正确做法：
btoa(unescape(encodeURIComponent('Hello 你好')))  // SGVsbG8g5L2g5aW9
// 或：
btoa(String.fromCharCode(...new TextEncoder().encode('Hello 你好')))

// 2. Unicode 转义
'你好'  // '你好'（JS 字符串内）
'&#x4F60;&#x597D;'   // HTML 实体（十六进制）
'&#20320;&#22909;'   // HTML 实体（十进制）

// 3. emoji 编码
'😀'.codePointAt(0)     // 128512
'\\u{1F600}'            // ES6 Unicode 转义
'&#x1F600;'             // HTML 实体
```

## 深度拓展

### 不同上下文的转义规则

**XSS 防御的核心原则：在正确的上下文中使用正确的转义**：

| 上下文 | 需要转义的字符 | 示例 |
|--------|-------------|------|
| HTML 正文 | `<` `>` `&` | `<p>${escapeHtml(text)}</p>` |
| HTML 属性值（双引号） | `"` `&` | `<input value="${escapeAttr(text)}">` |
| HTML 属性值（单引号） | `'` `&` | `<input value='${escapeAttr(text)}'>` |
| HTML 属性值（无引号） | 空格 `"` `'` `=` `<` `>` `` ` `` `&` | **永远不要用无引号属性** |
| `<script>` 块中 | `</script>` 序列 | `JSON.stringify(data)` |
| CSS 中 | 无安全的转义方法 | **禁止将用户输入放入 `<style>` 或 style 属性** |
| URL 参数中 | 非 ASCII + URL 特殊字符 | `encodeURIComponent(text)` |
| JavaScript 字符串中 | `"` `'` `\` 换行符 | `JSON.stringify(text).slice(1, -1)` |

### `<pre>` + `<code>` 中的实体使用

```html
<pre><code>
// 想显示这段 HTML 代码：
&lt;div class=&quot;container&quot;&gt;
  &lt;p&gt;Hello World&lt;/p&gt;
&lt;/div&gt;
</code></pre>
```

在 Markdown 中，用三个反引号围住的代码块会自动转义，无需手动写实体。但如果在 HTML 中直接写 `<pre><code>`，**必须手动转义**。

### Emoji 和 Unicode 在 HTML 中的处理

```html
<!-- 四种写法等效 -->
<p>😀</p>                      <!-- 直接写 emoji -->
<p>&#x1F600;</p>               <!-- 十六进制实体 -->
<p>&#128512;</p>               <!-- 十进制实体 -->
<p>\1F600</p>                  <!-- CSS 中可以 -->

<!-- 零宽字符的坑（复制粘贴调试的噩梦） -->
<p>​​​</p>                      <!-- 这行有三个零宽空格，
                                     你看不见但它影响了 JS 的字符串比对 -->
```

## 项目实战

### 后台管理系统中的编码实践

1. **用户输入的统一转义**：评论、昵称、反馈等所有 UGC 内容在后端落库前转义一次，前端渲染时用 `textContent` 或 `v-text`（Vue 的 `{{ }}` 自动转义 HTML）
2. **搜索框特殊字符**：用户输入 `&` `?` `#` 时，前端 `encodeURIComponent` 后拼接到搜索 API 的 query 参数
3. **文件名下载**：中文文件名的 Content-Disposition 需要 `encodeURIComponent` 处理，否则浏览器显示乱码
4. **富文本编辑器**：v-md-editor 的预览模式使用 DOMPurify（白名单 HTML 标签）而非简单转义，因为富文本需要保留 `<b>` `<table>` 等安全标签

## 易错点

1. **`&nbsp;` 和普通空格在文本复制中的差异** —— `&nbsp;` 复制到 IDE 中会变成不可见字符，导致代码编译报错
2. **`encodeURI` 不会编码 `&` `?` `=` `#`** —— 用 `encodeURI` 编码 URL 参数值是常见错误，参数值必须用 `encodeURIComponent`
3. **HTML 实体在 `<script>` 标签内不生效** —— `<script>` 的内容是 raw text，`&lt;` 不会被解析为 `<`。在 `<script>` 中对用户数据用 `JSON.stringify` + `.slice(1, -1)`
4. **两次编码问题** —— 前端 `encodeURIComponent` 后，后端又做了一次 URL decode → 参数值变成未编码的原始值 → 拼 SQL / HTML 时出现注入。规则：只做一次编码，消费端对应做一次解码
5. **`innerHTML` 配合 `textContent` 的误区** —— 先用 `textContent` 赋值再读 `innerHTML` 不会有转义效果，这是两个独立路径

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "XSS 怎么防御" | 追问 HTML 实体转义能防所有 XSS 吗（不能——属性注入和 JS 上下文需要不同转义） |
| "innerHTML 和 textContent 有什么区别" | 追问 XSS 攻击场景 + 正确的转义函数 |
| "URL 中怎么传中文" | 追问 encodeURIComponent 和 encodeURI 的区别 |
| "用户评论怎么安全显示" | 追问后端存储和前端渲染分别做什么处理 |

## 相关阅读

- [跨域 CORS](../网络/cors.md)
- [块级 / 行内元素](./block-inline.md)
- [DOCTYPE / Meta](./doctype-meta.md)

## 更新记录

- 2026-07-09：新建（HTML 实体表 + URL 编码 + XSS 转义函数 + 多上下文转义规则 + innerHTML vs textContent + 易错点）

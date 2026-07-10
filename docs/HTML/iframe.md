---
title: iframe
description: iframe 的跨域通信、安全沙箱、性能影响和微前端基础
category: HTML
type: api-reference
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-09
updated: 2026-07-09
reviewed: null
tags:
  - iframe
  - postMessage
  - sandbox
  - 微前端
  - 安全
  - 点击劫持
---

# iframe

> &#11088;&#11088;&#11088;&#11088;｜难度：中级｜项目：&#9733;&#9733;&#9733;

## 一句话总结

**iframe 是一个独立的"页面中的页面"——有自己完整的 window/document、JS 执行环境和同源策略隔离。它既是微前端最天然的隔离方案，也是 XSS 防御和点击劫持攻击的焦点。**

## 核心机制

### 基本用法

```html
<iframe
  src="https://example.com/widget"
  width="100%"
  height="400"
  frameborder="0"
  allowfullscreen
  loading="lazy"
  sandbox="allow-scripts allow-same-origin"
  title="嵌入的组件说明（可访问性必须）"
></iframe>
```

### iframe 的关键特性

```javascript
// 1. 每个 iframe 有独立的 window 对象
const iframe = document.querySelector('iframe')
console.log(iframe.contentWindow)   // iframe 自己的 window
console.log(iframe.contentDocument) // iframe 自己的 document
// 上面两个属性只有在"同源"条件下才能访问，跨域会抛 DOMException

// 2. iframe 的 window 可以访问父页面
// （在 iframe 内部）：
window.parent          // 父窗口
window.top             // 顶层窗口（处理多层嵌套）
window.self            // 自身

// 3. frameElement —— 嵌入当前页面的 iframe 元素
// 仅在 iframe 内的脚本中可访问：
window.frameElement    // 嵌入当前页的 <iframe> 元素
// 顶层页面中 window.frameElement === null
```

## 深度拓展

### 一、跨域通信：postMessage

**这是 iframe 面试的核心考点。** 同源 iframe 可以直接操作对方 DOM，但跨域 iframe 只能通过 `postMessage` 通信：

```javascript
// ===== 父页面 → iframe =====
const iframe = document.querySelector('iframe')
// 等待 iframe 加载完成再发送
iframe.addEventListener('load', () => {
  iframe.contentWindow.postMessage(
    { type: 'INIT', data: { userId: 42, theme: 'dark' } },
    'https://child.example.com'  // ⚠️ 指定 targetOrigin，不要用 '*'
  )
})

// ===== iframe 内部接收消息 =====
window.addEventListener('message', (event) => {
  // ⚠️ 始终校验 origin！
  if (event.origin !== 'https://parent.example.com') return

  const { type, data } = event.data
  if (type === 'INIT') {
    console.log('收到父页面数据：', data)
  }
})

// ===== iframe → 父页面 =====
window.parent.postMessage(
  { type: 'READY', height: 600 },
  'https://parent.example.com'  // 指定父页面 origin
)

// ===== 父页面接收 iframe 消息 =====
window.addEventListener('message', (event) => {
  // ⚠️ 必须校验 iframe 的 origin
  if (event.origin !== 'https://child.example.com') return

  if (event.data.type === 'READY') {
    // 常见场景：iframe 内容高度变化时通知父页面调整高度
    iframe.style.height = event.data.height + 'px'
  }
})
```

**postMessage 安全三要素**：
1. **发送方必须指定 `targetOrigin`**（永远不要用 `'*'`）
2. **接收方必须校验 `event.origin`**（数据可能来自任何源）
3. **接收方必须校验 `event.data` 结构**（攻击者可能发送畸形数据）

```javascript
// ❌ 危险写法
window.addEventListener('message', (e) => {
  eval(e.data.code) // 来自任何源的消息都直接执行！
})

// ✅ 安全写法
window.addEventListener('message', (e) => {
  if (e.origin !== 'https://trusted.example.com') return
  if (typeof e.data !== 'object' || !e.data.type) return
  // 白名单校验通过后再处理
})
```

### 二、sandbox 安全沙箱

`sandbox` 属性按需开放权限，默认情况下**所有限制全部开启**（最安全）：

```html
<!-- 没有任何权限：不能执行脚本、不能提交表单、不能弹窗…… -->
<iframe sandbox src="untrusted.html"></iframe>

<!-- 按需开放：只开放需要的权限 -->
<iframe
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
  src="widget.html"
></iframe>
```

| sandbox 值 | 允许的行为 | 不加的风险 |
|------------|-----------|-----------|
| — （无 sandbox 属性） | **一切**都允许 | 无隔离 |
| `sandbox`（空值） | **一切**都禁止 | 无 |
| `allow-scripts` | 执行 JS（但不允许 `allow-same-origin` 的同时开启） | 可执行恶意脚本 |
| `allow-same-origin` | 同源策略豁免（访问 cookie/localStorage） | ⚠️ **与 allow-scripts 同时使用时，iframe 可以移除自己的 sandbox 属性，绕过所有限制** |
| `allow-forms` | 提交表单 | 可发起 CSRF |
| `allow-popups` | `window.open()` 弹窗 | 弹窗广告 |
| `allow-top-navigation` | 修改 `top.location` | **可劫持父页面跳转钓鱼站** |
| `allow-downloads` | 触发下载 | 下载恶意文件 |

**`allow-scripts` + `allow-same-origin` 的组合漏洞**：当两者同时存在时，iframe 内的脚本可以移除自己的 sandbox 属性——因为 sandbox 是 DOM 属性 + `allow-same-origin` 允许修改。解决方案：**不要同时使用这两个属性**。如果需要脚本执行又需要读写 cookie，把内容放到同源独立域名下。

### 三、安全攻防

```
攻击方向 1：点击劫持（Clickjacking）
  攻击者页面：
    <iframe src="https://bank.com/transfer?to=hacker" style="opacity:0; position:absolute; top:0">
    </iframe>
    <button>点击领取奖励！</button>
  用户在不知情的情况下点击了透明的银行转账按钮。

  防御：X-Frame-Options HTTP 响应头
    X-Frame-Options: DENY          — 禁止任何页面嵌入此页面
    X-Frame-Options: SAMEORIGIN    — 只允许同源页面嵌入
    X-Frame-Options: ALLOW-FROM https://trusted.com  — 仅允许指定源

  升级方案：CSP frame-ancestors（比 X-Frame-Options 更灵活）
    Content-Security-Policy: frame-ancestors 'self' https://trusted.com

攻击方向 2：iframe 内恶意页面劫持父页面
  iframe 内脚本：
    window.top.location = 'https://phishing-site.com/login'
  将父页面导航到钓鱼站。

  防御：sandbox 不开放 allow-top-navigation
  或在父页面监听 beforeunload 事件：
    window.addEventListener('beforeunload', (e) => {
      if (document.hasFocus()) return  // 用户主动离开才放行
      e.preventDefault()
    })
```

### 四、性能影响

```html
<!-- iframe 的 window.onload 会阻塞父页面的 load 事件 -->
<!-- 如果 iframe 里的资源（大图、慢接口）卡住，父页面的 loading 图标一直转 -->
```

**解决方案**：

```javascript
// 动态创建 iframe（避开阻塞父页面 onload）：
const iframe = document.createElement('iframe')
iframe.src = '/widget.html'
document.body.appendChild(iframe)
// 此时 iframe 的 onload 不会阻塞父页面

// 或用 loading="lazy" 延迟加载非首屏 iframe：
<iframe src="/below-fold.html" loading="lazy"></iframe>
```

## 项目实战

### 微前端（qiankun / wujie）的 iframe 方案

```
qiankun（阿里）：
  核心基于 single-spa，通过 HTML Entry 加载子应用资源（JS/CSS），
  用 Proxy sandbox 做 JS 隔离（快照 + 代理），不是真正的 iframe。
  优势：无 DOM 隔断、路由无缝、性能好
  劣势：JS 隔离有边界情况（eval/new Function 等沙箱逃逸）

wujie（腾讯）：
  iframe + Web Components 混合方案。
  用 iframe 实现 JS 隔离（天然硬隔离），
  用 Web Components 的 Shadow DOM 实现 CSS 隔离，
  通过 proxy 将 iframe 的 DOM 渲染到主应用的 Web Component 中。
  优势：真实浏览器隔离（比 Proxy sandbox 更可靠）
  劣势：通信成本高（每次 DOM 操作走 postMessage）

micro-app（京东）：
  CustomElement + 类 iframe 沙箱。
  把子应用的 HTML/CSS/JS 放在一个隔离的容器中运行。
```

## 易错点

1. **`window.parent` 在 iframe 内修改需同源** —— 跨域 iframe 不能读写父页面的任何属性，`window.parent.document` 会直接抛异常
2. **postMessage 的 `targetOrigin` 写 `'*'`** —— 这是最常犯的安全错误，等于把消息广播给任何源
3. **同源 iframe 也能被限制** —— 即使同源，加了 `sandbox` 属性后访问权限也被限制
4. **iframe 的 `display:none` 不阻止加载** —— 隐藏的 iframe 依然会下载和执行所有资源，只有 `loading="lazy"` + 不在视口才延迟
5. **关于 `<frame>` 和 `<frameset>`** —— HTML5 中已废弃，不要在新项目中使用

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "iframe 有什么缺点" | 追问微前端为什么不用 iframe 直接做 |
| "postMessage 怎么用" | 追问 `targetOrigin` 用 `'*'` 有什么安全风险 |
| "怎么防止你的页面被 iframe 嵌入" | 追问 `X-Frame-Options` 和 CSP `frame-ancestors` 的区别 |
| "sandbox 怎么配" | 追问 `allow-scripts`+`allow-same-origin` 的漏洞 |

## 相关阅读

- [web-components](./web-components.md) —— 微前端的 Web Components 方案
- [history-api](./history-api.md) —— SPA 路由与 iframe 路由的差异
- [HTML 实体与编码](./html-entities.md)
- [跨域 CORS](../网络/cors.md)

## 更新记录

- 2026-07-09：新建（postMessage 安全三要素 + sandbox 权限表 + 点击劫持攻防 + 微前端 iframe 方案对比 + 性能陷阱）

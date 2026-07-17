---
title: 点击劫持与 iframe 安全
description: 点击劫持（Clickjacking）的攻击原理、X-Frame-Options / CSP frame-ancestors 防御、iframe sandbox、MIME 嗅探防护
category: 安全
type: security
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: reviewed
created: 2026-07-11
updated: 2026-07-11
reviewed: null
tags:
  - 点击劫持
  - Clickjacking
  - iframe
  - X-Frame-Options
  - frame-ancestors
  - sandbox
  - X-Content-Type-Options
---

# 点击劫持与 iframe 安全

> "点击劫持是利用透明 iframe 叠加，让用户以为在点诱饵按钮，实际在操作被隐藏的目标页面。"

## 一句话总结

**点击劫持（Clickjacking）是 UI 层面的攻击——攻击者把目标网站放在一个透明的 iframe 里，覆盖在诱饵按钮之上。用户看到的是"领红包"按钮，但点击的实际是 iframe 里的"转账确认"。防御手段：X-Frame-Options / CSP frame-ancestors 禁止被嵌入，iframe sandbox 限制被嵌入页面的能力。**

---

## 攻击原理

### 点击劫持的典型场景

```
攻击页面（attacker.com）的结构：

┌─────────────────────────────┐
│  诱饵页面（用户看到的）       │
│                              │
│   🎁 恭喜中奖！              │
│   ┌───────────────┐         │  ← 用户以为在点这个
│   │   领 取 奖 品   │         │
│   └───────────────┘         │
│                              │
│   ┌─────────────────────┐   │
│   │ 透明 iframe          │   │  ← 实际点击了这里
│   │ (bank.com/transfer)  │   │
│   │ opacity: 0           │   │
│   │    ┌───────────────┐ │   │
│   │    │   确 认 转 账   │ │   │  ← 银行的真实按钮
│   │    └───────────────┘ │   │     被透明覆盖在"领奖"上
│   └─────────────────────┘   │
└─────────────────────────────┘
```

攻击条件：
1. 目标网站可以被 iframe 嵌入（没有 X-Frame-Options）
2. 用户在目标网站已登录（Cookie 自动携带）
3. 攻击者能用 CSS 精确定位透明 iframe

### 不止是点击——拖拽劫持（Dragjacking）

攻击者还可以诱导用户拖拽操作（如把重要数据拖入攻击者的输入框），利用的是同样的透明 iframe 叠加原理。

---

## 防御方案

### 第一道：禁止被嵌入

**X-Frame-Options（传统方案）**：

```http
X-Frame-Options: DENY           # 完全禁止任何页面嵌入
X-Frame-Options: SAMEORIGIN     # 只允许同源页面嵌入
```

**CSP frame-ancestors（现代方案，推荐）**：

```http
Content-Security-Policy: frame-ancestors 'none'      # 完全禁止被嵌入
Content-Security-Policy: frame-ancestors 'self'       # 只允许同源嵌入
Content-Security-Policy: frame-ancestors 'self' https://trusted.com  # 白名单
```

`frame-ancestors` 优于 `X-Frame-Options` 的三点：
1. 支持多域名白名单（`X-Frame-Options` 只有 DENY/SAMEORIGIN）
2. 支持 CSP report 收集违规报告
3. 统一的 CSP 策略管理，不需要额外 Header

**两者兼容策略**：

```nginx
# 同时设置：旧浏览器用 X-Frame-Options，新浏览器用 CSP
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Content-Security-Policy "frame-ancestors 'self'" always;
```

浏览器会优先使用 `frame-ancestors`（如果支持 CSP 2.0+）。

### 第二道：iframe sandbox 限制能力

如果业务确实需要嵌入 iframe（如第三方支付页面），用 `sandbox` 属性严格限制被嵌入页面的能力：

```html
<!-- 最严格：什么都干不了 -->
<iframe src="https://payment.com" sandbox=""></iframe>

<!-- 按需开放：只允许脚本执行和表单提交 -->
<iframe src="https://payment.com"
  sandbox="allow-scripts allow-forms allow-same-origin">
</iframe>
```

| sandbox 值 | 开放的能力 |
|-----------|-----------|
| `allow-scripts` | 允许执行 JS（不默认开启） |
| `allow-forms` | 允许表单提交 |
| `allow-same-origin` | 允许访问同源 Cookie/Storage |
| `allow-popups` | 允许 `window.open()` |
| `allow-top-navigation` | 允许修改顶层窗口的 URL |
| `allow-modals` | 允许 `alert()`/`confirm()` |

**安全原则**：只加业务必需的 sandbox 值。特别注意 `allow-scripts` + `allow-same-origin` 组合——当被嵌入页面与宿主页面**同源**时，它可以用脚本移除自己所在 iframe 的 sandbox 属性，等于白设（跨域嵌入无此问题，但仍应最小化授权）。

### 第三道：X-Content-Type-Options 防 MIME 嗅探

```http
X-Content-Type-Options: nosniff
```

**攻击场景**：攻击者上传一个 `.txt` 文件，内容包含 `<script>alert(1)</script>`。如果服务器没有设置正确的 `Content-Type`，浏览器可能会"嗅探"MIME 类型——发现内容像 HTML → 按 HTML 解析 → XSS。

`nosniff` 强制浏览器以服务器声明的 `Content-Type` 为准，不猜测。特别是阻止 `script` 和 `style` 资源的 MIME 嗅探。

### 第四道：JS 兜底（辅助，不依赖）

```javascript
// 检测当前页面是否被 iframe 嵌入
if (window.top !== window.self) {
  // 被嵌入，清空页面内容
  document.body.innerHTML = '';
  // 或跳转出去
  // window.top.location = window.self.location;
}
```

**注意**：JS 防御很容易被绕过（攻击者可以用 `sandbox="allow-scripts"` 禁止被嵌入页面修改 `top.location`），只能作为辅助提示，不能依赖。

---

## 项目实战

### 后台管理系统的完整配置

```nginx
# Nginx — 所有安全头一起配

# 1. 防点击劫持
add_header X-Frame-Options "DENY" always;
add_header Content-Security-Policy "frame-ancestors 'none'" always;

# 2. 防 MIME 嗅探
add_header X-Content-Type-Options "nosniff" always;

# 3. 控制浏览器功能权限
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;

# 4. 控制 Referer 信息泄露
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### 前端 SPA 的 Meta 兜底

```html
<!-- 放在 index.html 的 <head> 中：Referrer-Policy 的标准 meta 写法 -->
<meta name="referrer" content="strict-origin-when-cross-origin">
```

**注意**：`X-Frame-Options`、`X-Content-Type-Options` **只能通过 HTTP 响应头下发，写在 meta 里无效**；CSP 可以用 `<meta http-equiv="Content-Security-Policy">` 设置，但 `frame-ancestors` 等指令在 meta 中会被忽略——防点击劫持必须在服务端配置响应头。

---

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "怎么防止你的页面被 iframe 嵌入" | X-Frame-Options 和 CSP frame-ancestors 有什么区别 |
| "点击劫持除了 X-Frame-Options 还有什么防御" | iframe sandbox 怎么配、JS 防御为什么不可靠 |
| "nosniff 是干什么的" | MIME 嗅探的攻击场景、为什么 script 标签特别危险 |
| "Permissions-Policy 和 CSP 的关系" | 都是限制能力，CSP 管资源加载，PP 管浏览器 API |

---

## 易错点

1. **"加了 X-Frame-Options 就万无一失"** —— 老浏览器可能不支持，上双保险：同时设 `X-Frame-Options` + `frame-ancestors`
2. **同源内容设 `sandbox="allow-scripts allow-same-origin"` 等于没设** —— 同源时被嵌入页面可以用 JS 移除自身 iframe 的 sandbox 属性；跨域嵌入不受此影响，但仍要最小化授权
3. **JS 防御不可靠** —— `if (top !== self) { top.location = self.location }` 可以被 `sandbox="allow-forms"`（无 `allow-top-navigation`）阻止，攻击者也可以反过来用 `sandbox` 限制被攻击页面
4. **`nosniff` 只防 script/style 的 MIME 嗅探** —— 图片、视频等资源类型不受影响

---

## 相关阅读

- [CSP 内容安全策略](./csp.md) —— CSP 全指令详解 + frame-ancestors
- [XSS](./xss.md) —— XSS 的三种类型和四层防御
- [HTTPS 安全](./https-security.md) —— HSTS 防降级攻击
- [同源策略](../same-origin-policy.md) —— iframe 跨域通信与隔离

---

## 更新记录

- 2026-07-11：新建（点击劫持 + iframe sandbox + X-Content-Type-Options + Permissions-Policy）

---
title: 浏览器安全机制
description: CSP、HSTS、X-Frame-Options、SRI、X-Content-Type-Options 等浏览器安全响应头和防御机制
category: 浏览器
type: security
score: 82
difficulty: 高级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-10
updated: 2026-07-10
reviewed: null
tags:
  - CSP
  - HSTS
  - 安全
  - X-Frame-Options
  - SRI
---

# 浏览器安全机制

> &#11088;&#11088;&#11088;&#11088;&#11088;｜难度：高级｜项目：&#9733;&#9733;&#9733;

## 一句话总结

**浏览器安全响应头（CSP/HSTS/X-Frame-Options/SRI/X-Content-Type-Options）是 XSS/CSRF/点击劫持/MITM 攻击的"最后一公里"防线——代码写得再好，没配这些头，攻击者依然能绕过前端所有的校验。**

## 核心机制

### 一张表看完所有安全头

| 安全机制 | 解决的问题 | 一句话 | 面试频率 |
|----------|-----------|--------|----------|
| **CSP** | XSS + 数据注入 | 白名单控制页面能加载哪里的脚本/样式/图片 | ⭐⭐⭐⭐⭐ |
| **HSTS** | HTTP→HTTPS 降级攻击 | 强制浏览器必须用 HTTPS 访问这个域名 | ⭐⭐⭐⭐ |
| **X-Frame-Options** | 点击劫持 | 禁止页面被嵌入 iframe | ⭐⭐⭐⭐ |
| **SRI** | CDN 资源被篡改 | 校验第三方脚本的哈希，不匹配就拒绝执行 | ⭐⭐⭐ |
| **X-Content-Type-Options** | MIME 嗅探攻击 | 禁止浏览器猜测文件类型（`nosniff`） | ⭐⭐⭐ |
| **Referrer-Policy** | 敏感 URL 泄露 | 控制 Referer 头携带多少信息 | ⭐⭐⭐ |
| **Permissions-Policy** | 浏览器功能滥用 | 控制哪些 API 可以用（摄像头/麦克风/定位） | ⭐⭐ |

### CSP（Content Security Policy）—— 最强大的安全头

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-random123' https://cdn.example.com; style-src 'self' 'unsafe-inline'; img-src * data:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.example.com; frame-ancestors 'none'; form-action 'self'; report-uri /csp-report
```

```
CSP 的指令体系：

default-src 'self'      ← 所有资源的默认策略（兜底值）
script-src              ← JS 可以从哪里加载（最重要的指令！）
style-src               ← CSS 可以从哪里加载
img-src                 ← 图片可以从哪里加载
font-src                ← 字体可以从哪里加载
connect-src             ← fetch/XHR/WebSocket 可以连接哪里
frame-src               ← 哪些 URL 可以嵌入为 iframe
frame-ancestors         ← 谁可以把当前页面嵌入为 iframe（替代 X-Frame-Options）
form-action             ← form 的 action 可以提交到哪
report-uri / report-to  ← CSP 违规报告发送到哪里
```

**script-src 的值类型**：

```html
<!-- 1. 来源白名单 -->
Content-Security-Policy: script-src 'self' https://cdn.example.com
<!-- 允许：同源的 JS + https://cdn.example.com 的 JS -->

<!-- 2. nonce（随机数，每次请求重新生成） -->
Content-Security-Policy: script-src 'nonce-r@nd0m2026'
<script nonce="r@nd0m2026">console.log('allowed')</script>
<script>console.log('blocked')</script>  <!-- ❌ 被 CSP 拦截 -->
<!-- nonce 必须每次请求都不同，否则攻击者可以预测 -->

<!-- 3. hash（内联脚本的 SHA 哈希，内容不变则 hash 不变） -->
Content-Security-Policy: script-src 'sha256-abc123...'
<!-- 允许 hash 匹配的内联脚本，不需要 nonce -->

<!-- 4. 'strict-dynamic'（信任已允许的脚本动态创建的脚本） -->
Content-Security-Policy: script-src 'nonce-r@nd0m' 'strict-dynamic'
<!-- 第三方 SDK 中 document.createElement('script') 自动被信任 -->
```

**CSP 的两种部署模式**：

```
Content-Security-Policy: ...        ← 强制模式：违规直接拦截
Content-Security-Policy-Report-Only: ...  ← 仅报告模式：违规只上报不拦截
                                           （灰度上线时先用这个，看报告无问题再切换强制模式）
```

### HSTS（HTTP Strict Transport Security）—— 强制 HTTPS

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

```
没有 HSTS：
  用户输入 bank.com → 浏览器先发 HTTP 请求（默认行为）
  → 攻击者在公共 WiFi 中间人 → 返回伪造页面 → 用户密码被盗

有 HSTS：
  浏览器首次收到 HSTS 头 → 写入"HSTS 预加载列表"（max-age 期间有效）
  → 之后用户输入 bank.com → 浏览器内部自动 307 重定向到 https://bank.com
  → 再也不发起 HTTP 请求 → 中间人没机会拦截

includeSubDomains → 子域名也强制 HTTPS
preload → 能加入浏览器的 HSTS Preload List（硬编码到浏览器源码中）
          → 连第一次都没有 HTTP 的机会
```

### X-Frame-Options —— 防点击劫持

```http
X-Frame-Options: DENY           # 禁止任何页面嵌入
X-Frame-Options: SAMEORIGIN     # 只允许同源页面嵌入
X-Frame-Options: ALLOW-FROM https://trusted.com  # 仅允许指定源嵌入（已废弃）
```

```html
<!-- 建议用 CSP frame-ancestors 替代（更灵活） -->
Content-Security-Policy: frame-ancestors 'self' https://trusted.com
```

### SRI（Subresource Integrity）—— CDN 资源防篡改

```html
<!-- CDN 被黑 / 被中间人篡改 → SRI 阻止执行 -->
<script src="https://cdn.example.com/jquery.min.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kP6QhL1iMPThUd65"
  crossorigin="anonymous">
</script>
<!-- 浏览器下载后计算 SHA → 与 integrity 比对 → 不匹配则拒绝执行 -->

<!-- 生成 integrity 值：
shasum -b -a 384 jquery.min.js | awk '{print $1}' | xxd -r -p | base64
-->
```

### X-Content-Type-Options —— 禁止 MIME 嗅探

```http
X-Content-Type-Options: nosniff
```

```
攻击场景：
  攻击者上传一个文本文件 text.txt（内容包含 <script>alert(1)</script>）
  但服务器配置错误，没有设置 Content-Type
  浏览器 MIME 嗅探发现内容像 HTML → 当成 HTML 解析 → XSS！

nosniff 的作用：
  → 服务器说是什么类型就是什么类型
  → 浏览器不要自作聪明去"猜"
  → Content-Type 不匹配 → 拒绝执行
```

## 深度拓展

### Permissions-Policy（前身 Feature-Policy）

```http
Permissions-Policy: camera=(), microphone=(self), geolocation=(self "https://map.example.com"), payment=()
# camera=() → 完全禁用摄像头
# microphone=(self) → 只允许同源页面使用麦克风
# geolocation=(self "https://map.example.com") → 同源 + map.example.com 可用定位
# payment=() → 完全禁用 Payment Request API
```

### 安全头检查清单

```bash
# 快速检查一个站点的安全头：
curl -I https://example.com | grep -iE '(content-security-policy|strict-transport-security|x-frame-options|x-content-type-options|referrer-policy|permissions-policy)'
```

## 项目实战

### 后台管理系统的安全头配置

```nginx
# Nginx 推荐配置
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.mysite.com; connect-src 'self' https://api.mysite.com; frame-ancestors 'none'" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
```

## 易错点

1. **CSP 的 `script-src 'self'` 不能阻止内联脚本** —— 加 `'unsafe-inline'` 才能执行 `<script>inline</script>`，但这严重削弱了 CSP。正确的做法是用 nonce 或 hash
2. **CSP 的 `default-src` 不会影响 `frame-ancestors`/`form-action`/`report-uri`** —— 这几个指令需要单独设置，`default-src` 管不到它们
3. **CSP 多个策略时取交集** —— 如果 HTTP 头和 meta 同时有 CSP，浏览器取最严格的那个
4. **HSTS 的 max-age 是从上一次看到 HSTS 头开始算的** —— 证书过期后用户访问会被完全拒绝（没有降级到 HTTP 的选项）。这就是为什么 max-age 不要太长
5. **SRI 不适用于动态内容** —— CDN 上经常变化的文件（如每日更新的 JSON），SRI 每次都不同，无法预先计算

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "除了转义，还有什么方式防 XSS" | 追问 CSP 的 nonce  和 hash 有什么区别 |
| "怎么防止你的页面被 iframe 嵌入" | 追问 X-Frame-Options 和 CSP frame-ancestors 的区别 |
| "CDN 的资源被篡改了会怎样" | 追问 SRI 的原理和局限性 |
| "为什么 HTTPS 站点输入域名会先走 HTTP" | 追问 HSTS 的机制和 preload list |

## 相关阅读

- [XSS / CSRF](./xss-csrf.md)
- [同源策略](./same-origin-policy.md)
- [Cookie 深度解析](./cookie.md)
- [HTTPS](../网络/http-https.md)

## 更新记录

- 2026-07-10：新建（CSP 全指令 + HSTS + X-Frame-Options + SRI + X-Content-Type-Options + Permissions-Policy + Nginx 配置清单）

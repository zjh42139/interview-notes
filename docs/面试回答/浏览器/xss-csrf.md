---
title: XSS/CSRF 面试回答
description: XSS 和 CSRF 的 30 秒速答和 2 分钟深度回答
category: 面试回答
type: interview
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: draft
created: 2026-07-10
updated: 2026-07-10
---

# XSS / CSRF 面试回答

> 对应题库：[面试题库/浏览器 Q4](../../面试题库/浏览器.md)

## 30 秒版

XSS 是攻击者在你的页面执行恶意脚本——偷 cookie、劫持页面。防御靠 HTML 实体转义 + CSP + HttpOnly Cookie。CSRF 是攻击者伪造用户发起请求——利用浏览器自动携带 Cookie 的特性。防御靠 SameSite Cookie + CSRF Token。一句话区分：XSS 利用的是网站对脚本的信任，CSRF 利用的是网站对浏览器的信任。

---

## 2 分钟版

**先说 XSS。**

XSS 分三种。反射型——恶意脚本放在 URL 里，被服务端拼到 HTML 回显，需要诱骗用户点击。存储型——攻击者把脚本存在数据库里（评论、昵称），每个访问页面的人都会被攻击，危害最大。DOM 型——前端 JS 直接把用户输入用 innerHTML 拼进页面，服务端从头到尾不知道发生了什么。

防御有四层。第一层 HTML 实体转义——所有用户输入的 `<` 变成 `&lt;`，脚本标签就不会被执行。Vue 的 `{{ }}` 和 React 的 JSX 自动做了这一步——这就是为什么别用 `v-html` 和 `dangerouslySetInnerHTML`。第二层 CSP——HTTP 头声明这个页面只能加载哪些来源的脚本，就算有脚本被注入了也执行不了。第三层 HttpOnly Cookie——设置了 HttpOnly 的 Cookie 对 JS 不可见，攻击脚本读到 `document.cookie` 也是空的。第四层富文本场景用 DOMPurify 做白名单过滤——只允许 `<b>` `<i>` `<a>` 这些安全标签通过。

**再说 CSRF。**

攻击者利用的是浏览器会自动在跨域请求中携带目标站点 Cookie 的特性。你在 A 网站登录 → 浏览器存了 Cookie → 你访问了 B 网站 → B 网站的页面上有一个隐藏的表单 `<form action="A.com/transfer">` → 自动提交 → 浏览器带着你的 Cookie 发送请求 → A 网站以为是你的操作。这就是 CSRF。

防御层级也很清楚。最强的是 SameSite Cookie——设成 Strict 或 Lax 之后，跨站请求根本不带 Cookie，CSRF 直接失效。传统方案是 CSRF Token——服务端生成随机 Token 嵌入页面的表单，攻击者跨域读不到这个 Token，请求提交时校验不通过。再加一层 Referer/Origin 检验——服务端看看请求是从哪个源来的，不是自己的域名就拒绝。最后一道防线是敏感操作独立二次验证——转账、改密码再输一次密码或验证码。

**还有关键的一点**：XSS 可以绕过 CSRF Token。如果页面有存储型 XSS 漏洞，攻击脚本可以读到 DOM 里的 CSRF Token，然后带着 Token 发伪造请求。这就是为什么 XSS 的严重程度高于 CSRF——一个 XSS 可能让所有 CSRF 防御失效。

---

## 追问预判

| 追问 | 回应要点 |
|------|----------|
| "SameSite Lax 能完全防 CSRF 吗" | 不能。img src 发起的 GET 请求在 Lax 下可能依然携带 Cookie（不同浏览器行为有差异）。CSRF 不只有 POST——`<img src="bank.com/delete?id=1">` 可能触发 DELETE 操作 |
| "JSONP 和 CSRF 有什么关系" | JSONP 用 `<script>` 发跨域请求天然携带 Cookie，可以伪造 GET 操作。这就是为什么 JSONP 接口绝对不能做写操作 |
| "HttpOnly 能防 XSS 吗" | 不防 XSS 攻击本身——它只是让偷不到 Cookie。攻击者还可以用 XSS 劫持 DOM、键盘记录、发起钓鱼弹窗。HttpOnly 是止损手段，不是预防手段 |

---

## 别踩的坑

- "把 XSS 和 CSRF 说混"——面试官问 XSS 你答 SameSite Cookie，直接挂。XSS 的核心是"在你的页面跑我的脚本"，CSRF 的核心是"用你的身份发我的请求"
- "只说了 CSP 但不知道 nonce 和 hash 的区别"——nonce 每次请求不同，适合服务端渲染；hash 基于内容不变，适合静态页面
- "认为 CSRF Token 是百分百安全的"——有 XSS 就可以读 Token，token 防御会被瓦解

---
title: Web Storage
description: 浏览器存储方案对比：Cookie、LocalStorage、SessionStorage、IndexedDB 的容量、生命周期、作用域和适用场景
category: 浏览器
difficulty: 初级
frequency: ⭐⭐⭐⭐
status: reviewed
created: 2026-07-05
updated: 2026-07-05
reviewed: 2026-07-05
tags:
  - Cookie
  - LocalStorage
  - SessionStorage
  - IndexedDB
---

# Web Storage

> 面试官问"你们项目的 Token 存在哪里"，不是要你一句话说清，而是要你比较各种方案的取舍——安全、容量、过期策略，每个都要有理由。

## 一句话总结

**Web Storage 是浏览器提供的客户端数据存储体系，包括 Cookie（4KB，每次请求自动携带）、LocalStorage（5-10MB，持久化，同源共享）、SessionStorage（5-10MB，会话级，标签页隔离）和 IndexedDB（无上限，异步，支持事务和索引），各有不同的容量、生命周期和安全模型，需要根据数据敏感度和访问模式选择。**

---

## 核心机制：四种存储方案对比

面试时先甩出这张对比表，然后挑两三个关键差异展开讲。

| 维度 | Cookie | LocalStorage | SessionStorage | IndexedDB |
|------|--------|-------------|---------------|-----------|
| **容量** | 4KB | 5-10MB | 5-10MB | 通常无上限（取决于磁盘空间） |
| **生命周期** | 可设置过期时间，默认会话级 | **永久存储**，除非手动清除 | **标签页关闭即清除** | 永久存储，除非手动清除 |
| **作用域** | 同源 + 可指定 Path | 同源，所有标签页共享 | 同源，**标签页隔离** | 同源，所有标签页共享 |
| **是否随请求发送** | **是**（自动携带到同域请求） | 否 | 否 | 否 |
| **API 类型** | 同步，字符串操作，难用 | 同步，键值对，简单 | 同步，键值对，简单 | **异步**，支持索引+事务，复杂 |
| **安全能力** | HttpOnly + Secure + SameSite | 无，JS 可直接读取 | 无，JS 可直接读取 | 无，JS 可直接读取 |
| **典型场景** | 身份认证（Session ID/Token） | 用户偏好、主题、草稿 | 表单临时数据、页面状态 | 离线数据、大文件、复杂查询 |

### Cookie 的深入理解

Cookie 的核心特点是**每次同源 HTTP 请求都会自动携带到请求头中**。这意味着：

- **优点**：天然适合身份认证，服务端可以直接从 Cookie 拿到 Session ID，不需要前端手动在请求头里加 Token。
- **缺点**：4KB 限制很小，且每次请求都带会增加请求体积（虽然对现代网络影响不大，但带宽浪费客观存在）。

**关键安全属性**（这些面试常考）：

- **`HttpOnly`**：Cookie 不能被 JS `document.cookie` 读取。防止 XSS 攻击者窃取 Token。**存储敏感 Token 时必须设置**。
- **`Secure`**：Cookie 只在 HTTPS 连接中传输。防止中间人攻击嗅探。
- **`SameSite`**：控制跨站请求时是否携带 Cookie，是 CSRF 防护的核心手段。

### LocalStorage 的深入理解

LocalStorage 是**同步 API**——读写操作都会阻塞主线程。对于 5MB 数据量来说，通常几毫秒就能完成，但在以下情况需要注意：

- 频繁读写（如在循环中调用 `localStorage.setItem`）可能导致主线程卡顿
- 存储 JSON 数据时 `JSON.stringify` + `JSON.parse` 也有性能开销
- 在移动端低配设备上，5MB 数据的读写可能达到几十毫秒

### SessionStorage 的深入理解

SessionStorage 最大的特点是**标签页隔离**。即使是在同一个域名下，A 标签页的 SessionStorage 和 B 标签页的 SessionStorage 是完全独立的。这意味着：

- 用户在新标签页打开同一个网站，之前的 SessionStorage 数据**不可见**——这在某些场景下是理想行为（如表单草稿每个标签页独立）
- `window.open` 或 `target="_blank"` 打开的新标签页会**复制**当前标签页的 SessionStorage（但复制后独立）
- 浏览器"恢复标签页"功能通常会恢复 SessionStorage

### IndexedDB 的深入理解

IndexedDB 是浏览器端的"数据库"——支持索引、事务、游标、批量操作，API 基于事件（异步）。它可以存任意类型的数据（Blob、File、ArrayBuffer……），存储空间几乎无上限。

**缺点**：原生 API 极其难用——回调地狱的升级版，事件嵌套事件。所以实际项目中基本都用包装库（Dexie.js、idb、localForage）。

---

## 深度拓展

### 追问1：SameSite 属性如何防御 CSRF？

传统 CSRF 攻击：攻击者网站 `<img src="https://bank.com/transfer?to=hacker&amount=10000">`，浏览器自动携带银行 Cookie 发起请求——因为默认情况下**所有请求都会携带 Cookie**。

`SameSite` 有三个取值：

- **`Strict`**：**完全禁止**跨站携带 Cookie。最安全，但用户从外部链接点击进入网站时可能无法自动登录（因为没有 Cookie）。银行类应用适合。
- **`Lax`**（Chrome 默认值）：**跨站的 GET 导航请求**（用户点击链接、`<a>` 标签）可以携带 Cookie，但跨站的 POST、AJAX、`<img>`、`<iframe>` 请求不能携带。这是用户体验和安全性的平衡点——用户从邮件点击链接进入系统能保持登录态，但 CSRF 的 POST 攻击被阻止。
- **`None`**：允许跨站携带 Cookie，但**必须同时设置 `Secure`**（即只能在 HTTPS 下使用）。第三方嵌入场景（如 iframe 中的支付页面）需要这个设置。

**核心**：设置 `SameSite=Lax`（或 `Strict`）后，攻击者无法通过 `<form action="...">` 或 AJAX 跨站提交带 Cookie 的请求，从根本上防御了 CSRF。这比传统 CSRF Token 方案更简单可靠。

### 追问2：LocalStorage 同步读写为什么可能阻塞渲染？

浏览器的主线程既要执行 JS，也要处理渲染（Layout → Paint → Composite）。`localStorage.setItem()` 和 `getItem()` 是同步的——调用后必须等待磁盘 I/O 完成才返回。虽然通常是毫秒级，但：

- 如果同时操作大量数据（循环写 1000 次），累积延迟可能达到几百毫秒
- 移动端的 eMMC 存储比桌面端 SSD 慢 10 倍以上
- 主线程被阻塞期间，用户点击、滚动都无响应，页面"卡住"

**规避办法**：不要在帧窗口（16ms）内做大量 LocalStorage 操作；大容量数据用 IndexedDB（异步）。

### 追问3：IndexedDB 适用场景和 API 取舍

IndexedDB 适合：
- 离线功能（PWA 的离线数据存储）
- 大量结构化数据（搜索历史、聊天记录）
- 大文件存储（Blob、ArrayBuffer）
- 复杂查询（通过索引按时间、类型等条件筛选）

不适合：
- 简单的键值对（LocalStorage 更合适）
- 需要频繁同步的数据（IndexedDB 没有内置同步机制）

**实践中**：直接用原生 IndexedDB API 是痛苦的。推荐 [Dexie.js](https://dexie.org/)（API 简洁，支持 Promise）或 localForage（自动降级到 LocalStorage）。

---

## 项目实战

### 1. Token 存储方案：分层存储

**最常见的设计：accessToken 内存 + refreshToken HttpOnly Cookie。**

```
// auth store (Pinia)
const accessToken = ref<string | null>(null);  // 只在 JS 内存中

// refreshToken 由后端通过 Set-Cookie 下发
// Set-Cookie: refreshToken=xxx; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=604800
```

**为什么这样设计**：

- `accessToken` 只存在 JS 内存中，**页面刷新后消失**，攻击者通过 XSS 也拿不到持久化的 Token
- `refreshToken` 在 HttpOnly Cookie 中，JS 完全无法读取，XSS 攻击无法窃取
- 页面刷新后，前端用 Cookie 中的 refreshToken 自动换取新 accessToken（静默刷新）
- accessToken 短有效期（15 分钟），即使泄露影响有限；refreshToken 长有效期（7 天），但安全存储

**反模式**：`localStorage.setItem('token', accessToken)`——任何注入的 XSS 脚本都能读取并发送到攻击者服务器。

### 2. 用户偏好设置：LocalStorage

```typescript
// stores/preferences.ts
interface Preferences {
  theme: 'light' | 'dark';
  language: 'zh-CN' | 'en';
  sidebarCollapsed: boolean;
  tablePageSize: number;
}

const PREF_KEY = 'admin_preferences';

export function loadPreferences(): Preferences {
  const raw = localStorage.getItem(PREF_KEY);
  return raw ? JSON.parse(raw) : getDefaults();
}

export function savePreferences(prefs: Preferences) {
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
}
```

用户切换主题、语言后立即写入 LocalStorage，下次打开页面时读取——体验流畅。这些数据不敏感且量小，LocalStorage 是完美选择。

### 3. 大表单草稿防丢失

复杂表单（如合同编辑，几十个字段），用户可能填写到一半关掉了。我们用 LocalStorage 做自动保存：

```typescript
import { watchDebounced } from '@vueuse/core';

watchDebounced(
  () => formData.value,
  (data) => {
    localStorage.setItem('draft_contract_' + contractId.value, JSON.stringify(data));
  },
  { debounce: 2000 }  // 2 秒防抖，避免频繁写入
);

// 进入页面时恢复草稿
const draft = localStorage.getItem('draft_contract_' + contractId.value);
if (draft) {
  ElMessageBox.confirm('检测到未保存的草稿，是否恢复？', '提示', {
    confirmButtonText: '恢复',
    cancelButtonText: '重新填写',
  }).then(() => {
    formData.value = JSON.parse(draft);
  });
}
```

### 4. IndexedDB 做离线数据缓存

后台系统中，用户频繁查看的字典数据（省市区列表、行业分类）可以在 IndexedDB 中做离线缓存。使用 Dexie.js：

```typescript
import Dexie from 'dexie';

const db = new Dexie('AdminCacheDB');
db.version(1).stores({ dict: '&code', '++id' });

// 写入
await db.table('dict').put({ code: 'regions', data: regionList, cachedAt: Date.now() });

// 读取
const cached = await db.table('dict').get({ code: 'regions' });
if (cached && Date.now() - cached.cachedAt < 24 * 3600 * 1000) {
  return cached.data;  // 24 小时内直接使用
}
```

---

## 易错点

- **"Token 存在 LocalStorage 是安全的"**：**不安全**。LocalStorage 可以被任何同源 JS 读取，一次成功的 XSS 注入就能窃取所有 Token。**敏感 Token 应用 HttpOnly Cookie 或仅存内存**。
- **"Cookie 每次请求都携带，太浪费带宽了"**：对现代网络来说，几 KB 的 Cookie 影响极小。真正的问题不是带宽，而是安全——跨站请求自动携带 Cookie 是 CSRF 漏洞的根源。用 `SameSite` 属性解决。
- **"IndexedDB 的容量比 LocalStorage 大，所以所有数据都应该放 IndexedDB"**：过度设计。简单键值对用 LocalStorage 更方便，IndexedDB 的异步 API 复杂度高，杀鸡不用牛刀。
- **"SessionStorage 可以在多个标签页之间共享"**：不能。SessionStorage 是按标签页隔离的——这是它和 LocalStorage 最核心的区别。

---

## 相关阅读

- [MDN: Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [MDN: Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [cache](./cache) —— HTTP 缓存策略，与服务端缓存配合使用
- [安全/token-storage](../安全/token-storage) —— Token 存储的安全最佳实践
- [安全/xss](../安全/xss) —— XSS 攻击原理及防御，理解为什么 LocalStorage 存 Token 危险

---

## 更新记录

- 2026-07-05：完成完整内容，补充四种存储方案对比表、SameSite 详解、Token 分层存储方案（Phase 2）

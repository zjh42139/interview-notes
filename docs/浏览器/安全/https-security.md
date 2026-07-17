---
title: HTTPS 与传输安全
description: HTTPS 的安全维度：HSTS 强制加密、证书链验证、混合内容（Mixed Content）、TLS 握手、中间人攻击防御
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
  - HTTPS
  - HSTS
  - TLS
  - 中间人攻击
  - 证书链
  - Mixed Content
  - 传输安全
---

# HTTPS 与传输安全

> "HTTPS = HTTP + TLS。但只部署 HTTPS 还不够——没配 HSTS，攻击者仍然可以把用户从 HTTPS 降级到 HTTP。"

## 一句话总结

**HTTPS 通过 TLS 加密通信 + 证书链验证身份，防御中间人窃听和篡改。但面试中深度加分的是三个延伸：HSTS 防降级攻击、Mixed Content 防内容泄露、证书链验证防伪造。攻击者只要能让用户访问 HTTP 版本，HTTPS 就形同虚设——HSTS 就是堵这个口的。**

---

## 核心机制

### HTTPS 为什么安全——三个保障

| 保障 | 机制 | 防什么 |
|------|------|--------|
| **加密** | 对称加密（AES/ChaCha20）加密数据 | 防窃听——中间人看到的是密文 |
| **完整性** | HMAC 校验数据未被篡改 | 防篡改——改了数据会被发现 |
| **身份验证** | 证书链（Root CA → Intermediate → Site） | 防冒充——确认你在和真正的目标通信 |

### TLS 握手（简化版）

```
Client                                Server
  │                                      │
  │ ──── ClientHello ──────────────────► │
  │      (支持的加密套件、TLS 版本、随机数)  │
  │                                      │
  │ ◄──── ServerHello ────────────────── │
  │      证书链 + 选择的加密套件 + 随机数    │
  │                                      │
  │ ── 验证证书链 ──                      │
  │ ── 生成 Pre-Master Key ──             │
  │                                      │
  │ ──── (加密的) Pre-Master Key ──────► │
  │                                      │
  │ ──── 双方计算 Session Key ─────────── │
  │ ──── Finished (加密) ──────────────► │
  │ ◄──── Finished (加密) ────────────── │
  │                                      │
  │ ════ 后续通信全部对称加密 ═══════════ │
```

关键点：非对称加密（RSA/ECDH）只用于安全交换对称密钥，后续数据传输用更快的对称加密。

### TLS 1.3 vs 1.2

| 对比维度 | TLS 1.2 | TLS 1.3 |
|---------|---------|---------|
| 握手往返 | 2-RTT | 1-RTT（0-RTT 会话恢复） |
| 加密套件 | 支持不安全算法（RSA 密钥交换、CBC 模式） | 只保留 AEAD 算法 |
| 前向安全性 | 可选 | 强制（只能 ECDHE/DHE） |
| 证书加密 | 明文传输证书 | 证书在握手后期加密传输 |

面试亮点：**TLS 1.3 去掉了所有已知不安全的算法，握手从 2-RTT 降到 1-RTT，且强制前向安全性——即使服务器私钥泄露，历史会话也无法解密。**

---

## HSTS —— HTTPS 的"安全带"

### 没有 HSTS 的问题

```
用户输入 bank.com → 浏览器默认发 HTTP 请求
  → 中间人拦截 → 返回伪造页面 → 用户输入密码 → 密码被盗
```

即使网站配置了 HTTP → HTTPS 的 301 重定向，第一次 HTTP 请求仍然是不安全的。攻击者可以在 301 发生前拦截。

### HSTS 如何解决

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

| 参数 | 说明 |
|------|------|
| `max-age=31536000` | 浏览器记住"这个域名必须用 HTTPS"的有效期（秒），推荐至少 1 年 |
| `includeSubDomains` | 所有子域名也强制 HTTPS（`api.bank.com`、`cdn.bank.com`） |
| `preload` | 允许加入浏览器的 HSTS Preload List（硬编码到 Chrome/Firefox 源码） |

**HSTS Preload List** 的意义：用户首次访问 `bank.com` 之前，浏览器已经从 preload list 知道必须用 HTTPS——连第一次 HTTP 请求都不会发。`https://hstspreload.org` 可以申请加入。

### HSTS 的代价

一旦设置了 `max-age` 很长 + `preload`，在这个时间内，网站无法回退到 HTTP。如果 SSL 证书过期或 HTTPS 配置出问题，用户在 `max-age` 过期前**完全无法访问**网站（浏览器拒绝降级到 HTTP）。

---

## 混合内容（Mixed Content）

部署 HTTPS 后，页面中引用 HTTP 资源会产生混合内容告警：

| 类型 | 示例 | 浏览器行为 |
|------|------|-----------|
| **Active Mixed Content** | `<script src="http://...">`、`<link href="http://...">`、`fetch('http://...')` | **直接阻断**——不会尝试升级 |
| **Passive Mixed Content** | `<img src="http://...">`、`<video>`、`<audio>` | Chrome 86+ / Firefox 127+ **自动升级为 HTTPS**，升级失败则不加载（更早的旧行为是告警但不阻断） |

**记忆**：能执行代码、能读响应的（脚本/样式/fetch/iframe）一律直接阻断；纯展示的（图/音/视频）现代浏览器自动升级、升级失败不加载。

**解决方案**：
1. 所有资源统一使用 `https://` 协议
2. 用 CSP `upgrade-insecure-requests` 让浏览器自动升级所有 HTTP 请求
3. 用相对协议 `//cdn.example.com/lib.js`（继承当前页面的协议）

```http
Content-Security-Policy: upgrade-insecure-requests
```

> 旧指令 `block-all-mixed-content` 已被废弃——设置了 `upgrade-insecure-requests` 后它不再有意义。

---

## 证书链验证

### 证书信任链

```
Root CA（根证书，预装在操作系统/浏览器中）
  └── Intermediate CA（中间证书颁发机构）
        └── Site Certificate（网站证书，绑定了域名）
```

浏览器验证步骤：
1. 网站证书的域名 == 访问的域名 —— 不匹配 → 证书错误
2. 网站证书由 Intermediate CA 签名 —— 用 Intermediate CA 公钥验签
3. Intermediate CA 由 Root CA 签名 —— 验签
4. Root CA 在浏览器信任列表中 —— 不在 → 不受信任
5. 证书在有效期内 —— 过期 → 证书错误

### 证书透明（Certificate Transparency）

Google 推行 CT 日志——所有公开签发的 SSL 证书都会被记录到公共日志中。域主可以监控 CT 日志，及时发现是否有攻击者申请了本域的恶意证书。

---

## 项目实战

### 后台管理系统的 HTTPS/HSTS 配置

```nginx
server {
    listen 80;
    server_name admin.example.com;
    # 永久重定向到 HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name admin.example.com;

    # 证书配置
    ssl_certificate     /etc/nginx/ssl/admin.example.com.pem;
    ssl_certificate_key /etc/nginx/ssl/admin.example.com.key;

    # 只启用安全的 TLS 版本和加密套件
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers on;

    # HSTS（2 年 + 子域名 + preload）
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # 其他安全头
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

### 前端开发环境的 HTTPS

```javascript
// vite.config.ts
export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync('localhost-key.pem'),
      cert: fs.readFileSync('localhost.pem'),
    },
    // 或直接用 mkcert 生成的证书
  },
});
```

```bash
# mkcert 一键生成本地信任的 HTTPS 证书
mkcert -install          # 安装本地 CA
mkcert localhost 127.0.0.1 ::1  # 生成证书
```

---

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "HTTPS 是怎么防中间人攻击的" | 证书链验证的细节、根证书为什么可信 |
| "你的网站配了 HTTPS，为什么还需要 HSTS" | 301 重定向的第一次 HTTP 请求可以被拦截 |
| "TLS 1.3 相比 1.2 优化了什么" | 前向安全性、1-RTT、去掉不安全算法 |
| "HTTPS 页面引用 HTTP 资源会怎样" | 混合内容的 Active/Passive 区分 |

---

## 易错点

1. **"配了 HTTPS 就不需要 HSTS"** —— 301 重定向可以被中间人劫持。HSTS 是在浏览器内核层面强制 HTTPS
2. **HSTS max-age 别设太短** —— 至少 1 年（31536000 秒），否则浏览器会频繁"忘记"这个站点必须用 HTTPS
3. **开发环境忽略证书错误** —— `http://localhost` 本身就是安全上下文（Secure Context），大多数要求 HTTPS 的 API 在 localhost 下用 HTTP 也可用；要真正跑 HTTPS 或用自定义域名，需用 mkcert 生成本地信任的证书，而不是无脑点"忽略证书错误"
4. **内网 IP 无法申请公开 CA 证书** —— 内网服务只能用自签名证书或内部 CA，或使用 `nip.io` 等 DNS 通配符服务

---

## 相关阅读

- [HTTP / HTTPS 基础](../../网络/http-https.md) —— HTTP 协议版本演进、HTTPS 连接建立流程
- [CSP 内容安全策略](./csp.md) —— `upgrade-insecure-requests` 自动升级 HTTP 请求
- [点击劫持与 iframe 安全](./clickjacking.md) —— X-Frame-Options / Permissions-Policy
- [Token 存储安全](./token-storage.md) —— Secure Cookie 确保 Token 只在 HTTPS 下传输

---

## 更新记录

- 2026-07-11：新建（HSTS + 证书链 + Mixed Content + TLS 握手 + mkcert 本地开发）

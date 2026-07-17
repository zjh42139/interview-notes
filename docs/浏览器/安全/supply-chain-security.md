---
title: 前端依赖安全
description: 前端供应链安全：SRI 防 CDN 篡改、npm audit 扫描漏洞、原型污染（Prototype Pollution）、lockfile 版本锁定、package 拼写欺骗
category: 安全
type: security
score: 0
difficulty: 中级
frequency: ⭐⭐⭐
status: reviewed
created: 2026-07-11
updated: 2026-07-11
reviewed: null
tags:
  - SRI
  - npm audit
  - 原型污染
  - Prototype Pollution
  - 供应链安全
  - lockfile
---

# 前端依赖安全

> "你引用的 npm 包不是你写的代码，但它有和你写的代码一样的权限——依赖安全不是后端的事。"

## 一句话总结

**前端依赖安全覆盖三个层面：1) SRI 确保 CDN 资源未被篡改；2) npm audit + lockfile 防止安装到有漏洞或被篡改的依赖；3) 原型污染（Prototype Pollution）是 JS 特有的攻击向量——通过污染 `Object.prototype` 影响所有对象的行为。**

---

## 核心机制

### 一、SRI（Subresource Integrity）—— CDN 资源防篡改

**攻击场景**：你的页面引用了 CDN 上的 jquery.min.js。CDN 被黑 → jquery 文件被替换成恶意版本 → 所有用户浏览器执行恶意代码。

**SRI 防御**：

```html
<!-- CDN 被黑 / 被中间人篡改 → SRI 阻止执行 -->
<script src="https://cdn.example.com/jquery@3.7.0/jquery.min.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kP6QhL1iMPThUd65"
  crossorigin="anonymous">
</script>
```

浏览器下载完脚本后计算 SHA 哈希 → 与 `integrity` 值比对 → 不匹配则拒绝执行，并报错到控制台。

**生成 integrity 值**：

```bash
# 方法 1：openssl
cat jquery.min.js | openssl dgst -sha384 -binary | openssl base64 -A

# 方法 2：shasum（macOS/Linux）
shasum -b -a 384 jquery.min.js | awk '{print $1}' | xxd -r -p | base64
```

**SRI 的最佳实践**：

1. **第三方库 + SRI** —— 从 CDN 引用的 JS/CSS 都加 `integrity`
2. **`crossorigin="anonymous"`** —— CDN 资源必须设 CORS 头，否则 SRI 不生效（浏览器需要读取资源内容计算哈希）
3. **SRI 不适用于动态资源** —— 内容会变化的文件（如每日更新的 JSON）无法预先计算哈希

**SRI 的局限性**：
- 第三方库升级版本 → integrity 值变了 → 忘记更新 integrity → 资源被拒绝 → 页面功能故障
- 只防篡改不防下线 —— CDN 资源被删除，SRI 救不了

### 二、npm 依赖安全

#### npm audit —— 已知漏洞扫描

```bash
npm audit          # 扫描全部依赖的已知漏洞
npm audit fix      # 自动修复兼容的漏洞
npm audit fix --force  # 强制修复（可能包含 breaking changes）
npm audit --json   # JSON 格式输出，适合 CI 集成
```

`npm audit` 检查 `package-lock.json` 中的依赖树，对比 GitHub Advisory Database / npm 安全通告，报告已知漏洞（如原型污染 CVE、命令注入 CVE）。

#### lockfile —— 版本锁定防篡改

```
没有 lockfile：
  package.json: "lodash": "^4.17.0"
  → CI 安装时可能拿到 lodash@4.17.22（被投毒的版本）
  → 开发者本地装的是 lodash@4.17.21（正常版本）
  → 漏洞不在 CI 重现，生产已经中招

有 lockfile：
  package-lock.json 精确锁定 lodash@4.17.21 + sha512 哈希
  → CI 和生产环境安装的都是同一个版本
  → 攻击者即使篡改了 npm registry，哈希不匹配 → 安装失败
```

**必须提交 `package-lock.json`（或 `pnpm-lock.yaml`/`yarn.lock`）到 Git**——这是确保全团队和 CI 使用相同依赖树的唯一方式。

#### package 拼写欺骗（Typosquatting）

攻击者发布拼写相近的恶意包：
- `cross-env`（正版 4000 万周下载） vs `crossenv`（恶意包）
- `lodash` vs `loadsh`
- `eslint` vs `es-lint`

**防范**：安装前确认包名拼写、检查 npm 页面上的周下载量和 GitHub star、优先使用知名包。

#### CI 集成安全检查

```yaml
# .github/workflows/security.yml
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
  - run: npm ci          # 用 lockfile 精确安装
  - run: npm audit --audit-level=high  # 高危漏洞 → CI 失败
```

### 三、原型污染（Prototype Pollution）

#### 攻击原理

```javascript
// 攻击者控制的 JSON 数据
const maliciousData = JSON.parse('{"__proto__": {"isAdmin": true}}');

// 代码用递归合并函数处理用户输入
function merge(target, source) {
  for (const key in source) {
    if (typeof source[key] === 'object') {
      merge(target[key], source[key]);
    } else {
      target[key] = source[key];  // target['__proto__']['isAdmin'] = true !
    }
  }
}

const config = {};
merge(config, maliciousData);

// 现在所有对象都有了 isAdmin = true
console.log({}.isAdmin);  // true  ← 原型被污染！
```

**漏洞产生的条件**：
1. 递归合并函数（`lodash.merge`、自定义 `deepMerge`）处理用户输入
2. 没有校验 `__proto__` / `constructor.prototype` 作为 key 的情况
3. 所有对象都从 `Object.prototype` 继承属性 → 污染影响全局

#### 实际案例

- **CVE-2019-10744**：lodash `defaultsDeep` 原型污染，影响数百万项目
- **CVE-2018-3728**：`hoek` 原型污染，影响 hapi.js 生态
- 攻击后果：RCE（通过污染执行路径）、绕过权限检查、DOS

#### 防御方案

```javascript
// 1. 禁止 __proto__ 作为 key
function safeMerge(target, source) {
  for (const key in source) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;  // 跳过危险 key
    }
    if (typeof source[key] === 'object' && source[key] !== null) {
      target[key] = safeMerge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// 2. 使用 Object.create(null) 创建无原型的对象
const safeConfig = Object.create(null);
// safeConfig 没有 __proto__，污染无法传播

// 3. 冻结 Object.prototype
Object.freeze(Object.prototype);
// 后续无法添加/修改 Object.prototype 上的属性

// 4. 用 Map 替代普通对象存储用户数据
const userData = new Map();
userData.set(key, value);  // Map 不受原型污染影响
```

---

## 项目实战

### 日常安全检查清单

```bash
# 1. 每次安装新包后
npm audit

# 2. 定期检查过期的依赖
npm outdated

# 3. 检查是否有依赖引入了已知漏洞
npx snyk test    # Snyk 提供更全面的漏洞数据库

# 4. 检查 lockfile 是否被意外更新
git diff package-lock.json
```

### 前端构建时做 SRI

```javascript
// vite.config.ts — 用插件自动为 HTML 中的 script/link 加 integrity
import { defineConfig } from 'vite';
import sri from 'vite-plugin-sri';

export default defineConfig({
  plugins: [
    sri({
      algorithms: ['sha384'],     // 推荐 sha384（安全 + 性能平衡）
      publicPath: '/assets/',     // 只对构建产物加 SRI
    }),
  ],
});
```

---

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "CDN 资源被篡改了怎么办" | SRI 的原理和 `crossorigin` 为什么需要 |
| "npm install 之后应该做什么" | `npm audit` 扫描已知漏洞 |
| "原型污染是什么" | `__proto__` 怎么被注入、lodash 的历史漏洞 |
| "为什么不删 lockfile" | CI 和生产环境的一致性、防篡改 |

---

## 易错点

1. **SRI 忘了加 `crossorigin="anonymous"`** —— 跨域资源没有 CORS 时浏览器拿到的是不透明响应，无法校验完整性，带 `integrity` 的资源会**直接加载失败**。检查 CDN 是否返回 `Access-Control-Allow-Origin: *`
2. **npm audit 修漏洞直接用 --force** —— 可能引入 breaking changes，先在开发环境验证
3. **"我们不用 `__proto__`，不可能被原型污染"** —— 很多第三方库内部用递归合并处理配置，自己的代码不直接用不代表库不用
4. **`Object.create(null)` 创建的对象没有 `hasOwnProperty`** —— 需要用 `Object.hasOwn(obj, key)`（ES2022）替代

---

## 相关阅读

- [npm 深入](../../工程化/npm-deep.md) —— npm 包管理机制、lockfile 详解
- [CSP 内容安全策略](./csp.md) —— CSP 也可以限制 script-src 为特定 CDN 域名
- [Token 存储安全](./token-storage.md) —— 另一个依赖层面的安全问题
- [Cookie 深度解析](../cookie.md) —— SRI 与 CSP 的协同防御

---

## 更新记录

- 2026-07-11：新建（SRI + npm audit + 原型污染 + lockfile + CI 安全集成）

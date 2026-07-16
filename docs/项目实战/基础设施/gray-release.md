---
title: 灰度发布 / AB 测试
description: 前端灰度发布策略——Nginx 分流、Cookie 标识、版本回滚，大厂项目经验必备
category: 项目实战
type: practice
score: 78
difficulty: 中高级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-16
tags:
  - 灰度发布
  - Nginx
  - 部署
  - AB 测试
---

# 灰度发布 / AB 测试

> ⭐⭐⭐⭐｜难度：中高级｜字节/美团二面常见

**面试官问"你们项目怎么做灰度发布"，不是在考 Nginx 配置——他在看你有没有"生产级部署"的思维。灰度发布 = 新版本只给部分用户看 → 验证无问题 → 逐步扩大范围 → 全量。**

## 一句话总结

**灰度发布让新版本逐步替代旧版本。实现方案：Nginx 按 Cookie/Header/IP 分流到不同版本目录、或服务端返回不同 index.html、或 CDN 多版本共存配合前端版本号路由。**

## 三种实现方案

### 方案一：Nginx 按 Cookie 分流（最常用）

```nginx
# /etc/nginx/conf.d/app.conf
map $cookie_version $app_root {
    default    /usr/share/nginx/html/stable;  # 默认稳定版
    "canary"   /usr/share/nginx/html/canary;  # 灰度版
}

server {
    listen 80;
    location / {
        root $app_root;
        try_files $uri $uri/ /index.html;
    }
}
```

用户添加 `cookie: version=canary` → 访问灰度版。运营/测试人员手动设 cookie 验证。

### 方案二：按用户 ID hash 取模

```javascript
// 前端入口脚本——在 index.html 中内联
const userId = getUserId()  // 从 cookie/localStorage 获取
const hash = hashCode(userId)

// 10% 灰度
if (hash % 100 < 10) {
  // 加载灰度版本
  document.write('<script src="/canary/app.js"><\/script>')
} else {
  // 加载稳定版本
  document.write('<script src="/stable/app.js"><\/script>')
}
```

### 方案三：CDN 多版本共存

```
发布流程：
1. 构建产物带版本号：/assets/v2.1.0/app.js
2. 灰度用户访问 index.html → 服务端判断 → 返回引用 v2.1.0 的 HTML
3. 稳定用户继续访问旧版 index.html
4. 灰度验证通过 → 更新 CDN 默认版本 → 全量切换
```

## 项目实战

### 前端灰度 SDK

```typescript
// 封装灰度判断逻辑
class GrayRelease {
  static isCanary(userId: string, percentage: number = 10): boolean {
    const hash = this.hash(userId)
    return hash % 100 < percentage
  }

  static getVersion(userId: string): 'stable' | 'canary' {
    return this.isCanary(userId) ? 'canary' : 'stable'
  }

  private static hash(str: string): number {
    let hash = 5381
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0x7fffffff
    }
    return hash
  }
}

// 在应用入口使用
const version = GrayRelease.getVersion(currentUser.id)
if (version === 'canary') {
  console.log('[Gray] 当前用户命中灰度')
}
```

### 回滚机制

```bash
# 发现问题 → 立刻回滚
# 1. 修改 Nginx 配置回指 stable 目录
# 2. 或者修改灰度比例降至 0%
# 3. 或者直接恢复上一个版本的 tag
git checkout v2.0.9  # 回到上一个稳定版本
docker build -t app:stable .
docker-compose up -d
```

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "灰度发布怎么做" | 追问"发现问题怎么回滚"——改 Nginx 配置或降低灰度比例 |
| "CDN 多版本共存怎么处理缓存" | hash 文件名+不同路径——新旧版本不存在缓存冲突 |

## 相关阅读

- [代理/负载均衡](../../网络/proxy-lb.md)
- [CI/CD](../../CICD/overview.md)

## 更新记录

- 2026-07-16：新建——Phase 2 覆盖率审计补齐

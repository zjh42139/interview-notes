---
title: "代理 / 反向代理 / 负载均衡"
description: 正向代理 vs 反向代理、Nginx 配置基础、负载均衡算法、前端项目中的代理实践
category: 网络
type: mechanism
score: 75
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-16
tags:
  - 代理
  - Nginx
  - 负载均衡
  - 反向代理
---

# 代理 / 反向代理 / 负载均衡

> ⭐⭐⭐⭐｜难度：中级｜前后端协作的核心基础设施

## 一句话总结

**正向代理代理客户端（翻墙、企业内网）、反向代理代理服务端（Nginx、负载均衡）。Nginx 是前端最常打交道的反向代理——静态资源服务、API 转发、负载均衡、HTTPS 终端。Vite proxy 在开发环境做的事就是简化版反向代理。**

## 核心机制

### 正向代理 vs 反向代理

| | 正向代理 | 反向代理 |
|---|---------|---------|
| 代理谁 | 客户端 | 服务端 |
| 客户端知道目标吗 | 知道——通过代理访问 | 不知道——以为代理就是服务端 |
| 典型场景 | 翻墙、企业内网、缓存 | Nginx、CDN、API 网关 |
| 配置方 | 客户端配置代理地址 | 服务端配置代理规则 |

### Nginx 基础配置

```nginx
server {
    listen 80;
    server_name example.com;

    # 静态资源——Nginx 直接返回
    location / {
        root /var/www/dist;
        try_files $uri $uri/ /index.html;  # SPA 路由回退
    }

    # API 转发到后端——反向代理的核心
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**try_files**：SPA 路由的核心——先找文件，找不到回退到 index.html。没有这行，刷新 `/dashboard` 页面 Nginx 404。

### 负载均衡算法

```nginx
upstream backend {
    # 轮询（默认）——一个一个来
    server backend1:3000;
    server backend2:3000;

    # 加权轮询——性能好的服务器权重高
    # server backend1:3000 weight=3;
    # server backend2:3000 weight=1;

    # ip_hash——同一客户端固定到同一台服务器（Session 保持）
    # ip_hash;
}

server {
    location /api/ {
        proxy_pass http://backend;
    }
}
```

| 算法 | 原理 | 适用场景 |
|------|------|---------|
| 轮询 | 依次分配 | 无状态服务（RESTful API） |
| 加权轮询 | 按权重分配 | 服务器性能不均 |
| ip_hash | 按客户端 IP hash | 需要 Session 保持 |
| least_conn | 分配给连接数最少的 | 长连接场景（WebSocket） |

## 项目实战

### Vite proxy —— 开发环境反向代理

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,  // 修改请求头的 origin 为目标地址
      },
    },
  },
};
```

Vite proxy 就是开发环境的 Nginx——拦截 `/api` 请求转发到后端。生产环境用 Nginx 替换。

### 前端部署的典型 Nginx 配置

```nginx
# HTTPS 终端 + HTTP2 + 静态资源 + API 代理 + 缓存策略
server {
    listen 443 ssl http2;
    server_name admin.example.com;

    # 静态资源——长期缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由
    location / { try_files $uri /index.html; }

    # API 代理
    location /api/ { proxy_pass http://backend/; }
}
```

## 易错点

❌ **反向代理 = 正向代理反过来** —— 不只是方向相反。正向代理客户端知道代理存在，反向代理客户端不知道。架构意义完全不同。

❌ **代理后 IP 丢失** —— Nginx 代理后后端拿到的 IP 是 Nginx 的 IP。用 `X-Forwarded-For` 和 `X-Real-IP` 头传递真实客户端 IP。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "正向代理和反向代理区别" | 追问"前端项目中哪里用到反向代理" → Vite proxy / Nginx |
| "跨域怎么解决" | 追问反向代理方案——"生产环境配 Nginx" |

## 相关阅读

- [HTTP / HTTPS](./http-https.md)
- [CORS](./cors.md)
- [DNS / CDN](./dns-cdn.md)

## 更新记录

- 2026-07-16：新建——正向/反向代理+Nginx配置+负载均衡+Vite proxy

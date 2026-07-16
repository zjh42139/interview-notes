---
title: Docker 基础
description: Docker 是前端项目容器化部署的核心技术，面试中能写出前端项目的 Dockerfile + 解释多阶段构建的价值，直接证明你有"生产级部署"的经验
category: CICD
type: api-reference
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
tags:
  - Docker
  - 容器化
  - Dockerfile
  - Nginx
  - 多阶段构建
---

# Docker 基础

> ⭐⭐⭐⭐｜难度：中级

**Docker 的核心理念是"一次构建，到处运行"。你用 Dockerfile 把前端项目的构建环境 + 运行环境打包成一个镜像，任何装了 Docker 的机器都能跑出一模一样的结果。面试官不会让你现场写 `docker-compose up`，但会问："你部署前端项目用过什么方式？"——提到 Docker + Nginx 就是标准的中高级答案。**

## 一句话总结

**Docker 是应用容器引擎。你把应用 + 依赖 + 运行时配置写进 Dockerfile 构建成镜像（Image），然后从镜像创建容器（Container）运行。镜像从 Registry（Docker Hub / 私有仓库）分发到任意机器。多阶段构建可以分离编译环境和运行环境，把最终镜像压缩到最小。**

---

## 核心机制

### 三大概念

```
Registry（仓库）            ──►  存放镜像的地方（Docker Hub / 阿里云镜像仓库）
    │
    │  docker pull / docker push
    ▼
Image（镜像）               ──►  只读模板，包含应用 + 运行时 + 环境变量
    │
    │  docker run
    ▼
Container（容器）           ──►  Image 的运行实例，轻量级隔离进程
```

| 概念 | 说明 | 类比 |
|------|------|------|
| **Image** | 只读的应用模板，分层的文件系统 | 面向对象中的"类" |
| **Container** | Image 的运行实例，可读写 | 面向对象中的"实例" |
| **Registry** | 存储和分发 Image 的服务器 | npm registry |
| **Dockerfile** | 构建 Image 的"配方" | `package.json` + 构建脚本 |
| **docker-compose.yml** | 多容器编排"配方" | monorepo 的构建编排脚本 |

### Dockerfile 基本指令

```dockerfile
# ─── 基础指令（按出现顺序） ───

FROM node:20-alpine AS builder       # ① 基础镜像 + 构建阶段别名
WORKDIR /app                         # ② 设置工作目录（没有则自动创建）
COPY package.json pnpm-lock.yaml ./  # ③ 复制依赖文件（先复制以利用缓存）
RUN npm install -g pnpm && pnpm install  # ④ 执行命令（构建时运行，写进镜像层）
COPY . .                             # ⑤ 复制源码
RUN pnpm build                       # ⑥ 构建项目

FROM nginx:alpine                    # ⑦ 第二阶段：全新的轻量镜像
COPY --from=builder /app/dist /usr/share/nginx/html  # ⑧ 从 builder 阶段复制产物
EXPOSE 80                            # ⑨ 声明容器监听端口（文档性质，不实际映射）
CMD ["nginx", "-g", "daemon off;"]   # ⑩ 容器启动命令（运行时执行，非构建时）
```

**面试必须能解释的指令**：

| 指令 | 作用 | 关键细节 |
|------|------|----------|
| `FROM` | 指定基础镜像 | 可以用 `AS alias` 给阶段命名，后续 `--from=alias` 引用 |
| `WORKDIR` | 设置工作目录 | 影响后续 `COPY` / `RUN` / `CMD` 的相对路径 |
| `COPY` | 从宿主机复制文件到镜像 | 先 COPY `package.json` 再 `RUN npm install`，利用 Docker 的层缓存——依赖不变时跳过安装 |
| `RUN` | 构建镜像时执行命令 | 每一条 `RUN` 生成一个新的镜像层 |
| `CMD` | 容器启动时的默认命令 | 只能有一条生效；可被 `docker run` 后的参数覆盖 |
| `EXPOSE` | 声明端口 | 仅文档作用，真正的端口映射在 `docker run -p` 或 compose 中配置 |

### 多阶段构建（Multi-stage Build）

**为什么需要**：前端项目构建需要 Node.js + pnpm + 源码 + node_modules，但运行时只需要 Nginx + 静态文件。如果所有东西都打包进一个镜像，体积可能达到 1GB+，多阶段构建把最终镜像压缩到几十 MB。

```dockerfile
# 阶段 1：构建环境（大而全）
FROM node:20-alpine AS builder       # alpine 版本体积极小(~120MB)
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build                        # 构建产物在 /app/dist

# 阶段 2：运行环境（极简）
FROM nginx:alpine                     # nginx:alpine 只有 ~20MB
COPY --from=builder /app/dist /usr/share/nginx/html
# 只复制 dist 目录，node_modules / 源码 / pnpm 全部丢弃！
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# 最终镜像大小：~20MB（Nginx） + ~2MB（dist）= ~22MB
# 对比单阶段：~120MB（Node） + ~300MB（node_modules） + ~2MB（dist）= ~420MB
```

**面试核心要点**："多阶段构建让最终镜像只包含运行时需要的文件，体积从几百 MB 降到几十 MB，拉取更快，也更安全（没有编译工具链，攻击面更小）。"

### docker-compose：编排多容器

当你的项目涉及多个服务（VitePress 前端 + Nginx 反向代理 + 后端 API），docker-compose 用一个 YAML 文件定义和启动所有容器：

```yaml
# docker-compose.yml (Compose v2+ 不再需要 version 字段)

services:
  frontend:
    build: .                          # 用当前目录的 Dockerfile 构建镜像
    ports:
      - "8080:80"                     # 宿主机 8080 → 容器 80
    depends_on:
      - api                           # 等 api 启动后再启动（不保证 ready，只保证启动顺序）

  api:
    image: node:20-alpine             # 直接用已有镜像（不需要构建）
    working_dir: /app
    ports:
      - "3000:3000"
    volumes:
      - ./api:/app                    # 挂载目录（开发时热更新）
    command: node server.js

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

**面试时不需要手写 compose 文件**，但需要知道它的存在和用途："当我们有多个服务需要一起跑时，用 docker-compose 编排，一个 `docker compose up` 全部启动。"

---

## 深度拓展

### 追问1：前端项目的 Docker 部署流程是怎样的？

**标准回答**：

1. 在项目根目录写 `Dockerfile`（多阶段构建：Node 构建 + Nginx 运行）
2. 写 `nginx.conf`（处理 SPA 路由、静态资源缓存策略、反向代理 API）
3. `docker build -t my-app .` 构建镜像
4. `docker run -d -p 8080:80 my-app` 启动容器
5. 访问 `http://localhost:8080` 验证

**CI/CD 集成**：在 GitHub Actions 中执行 `docker build`，然后把镜像推送到 Docker Hub 或阿里云镜像仓库，服务器上 `docker pull && docker run` 即可更新。

### 追问2：为什么用 Nginx 而不是 `npm run preview`？

| 维度 | Nginx | Vite preview / http-server |
|------|-------|--------------------------|
| **定位** | 生产级 Web 服务器 | 开发/预览用途 |
| **性能** | 高并发、静态文件极致优化 | 一般 |
| **功能** | 反向代理、负载均衡、SSL 终结、Gzip、缓存控制 | 仅提供静态文件服务 |
| **稳定性** | 经过 20 年大规模验证 | 不建议用于生产 |
| **镜像大小** | ~20MB（alpine） | 需要 Node 运行时 ~120MB |

---

## 项目实战

### 面试笔记项目的 Dockerfile + Nginx 配置

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm docs:build

FROM nginx:alpine
COPY --from=builder /app/docs/.vitepress/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf —— SPA 路由 + 静态资源缓存
server {
    listen       80;
    server_name  localhost;

    # 静态资源（带 hash 的文件）—— 长期缓存
    location /assets/ {
        alias   /usr/share/nginx/html/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由回退：所有路径都返回 index.html
    location / {
        root   /usr/share/nginx/html;
        index  index.html;
        try_files $uri $uri/ /index.html;
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
}
```

**面试时解释 nginx.conf 的三个关键配置**：

1. **`try_files $uri $uri/ /index.html`**：解决 SPA 路由问题。用户直接访问 `/about` 时服务器上没有这个文件，回退到 `index.html`，交给前端路由处理。
2. **`expires 1y` + `immutable`**：带 hash 的 JS/CSS 文件名是唯一的，永远不需要重新验证，直接缓存一年。
3. **`gzip`**：压缩文本资源，传输体积减少 60-80%。

---

## 易错点

- **"Docker 就是虚拟机"**：错。Docker 容器共享宿主机操作系统内核，是进程级隔离，不是虚拟化。启动速度是秒级（VM 是分钟级），资源开销远小于 VM。
- **"FROM nginx 就是下载 Nginx 安装包"**：不准确。`FROM nginx:alpine` 是基于别人已经做好的镜像（包含操作系统 + Nginx）再叠加你的文件。这是镜像的分层复用机制。
- **"COPY . . 要放在最前面"**：大忌。应该先 COPY 依赖描述文件 → RUN 安装 → 再 COPY 源码。这样源码变化时只需重新跑 `COPY . .` 和构建，依赖安装层利用缓存跳过。
- **"CMD 和 RUN 是一样的"**：完全不是。`RUN` 在 `docker build` 构建镜像时执行，结果写进镜像层。`CMD` 在 `docker run` 启动容器时执行，是容器的入口进程。
- **"EXPOSE 80 之后容器就能被外部访问"**：不能。`EXPOSE` 只是文档声明，实际端口映射必须通过 `docker run -p 8080:80` 或 docker-compose 的 `ports` 配置。

---

## 相关阅读

- [Docker 官方文档](https://docs.docker.com/)
- [Dockerfile 最佳实践](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Nginx 官方文档](https://nginx.org/en/docs/)
- [Docker Hub](https://hub.docker.com/)
- [CI/CD 概述](./overview.md) —— Docker 在 CI/CD 流水线中的角色
- [GitHub Actions](./github-actions.md) —— CI 中构建和推送 Docker 镜像的 workflow 写法

---

## 更新记录

- 2026-07-06：完成完整内容，补充多阶段构建原理、VitePress 项目 Dockerfile + Nginx 配置、SPA 路由处理、Docker vs VM 对比

---
title: CI/CD 知识地图
description: CI/CD 面试知识体系——从持续集成到容器化部署
category: CICD
difficulty: null
frequency: null
status: filled
created: 2026-07-06
updated: 2026-07-06
reviewed: null
tags:
  - CI/CD
  - GitHub Actions
  - Jenkins
  - Docker
---

# CI/CD 知识地图

```mermaid
mindmap
  root((CI/CD))
    GitHub Actions
      workflow
      job / step
      action
      matrix build
      secrets
    Jenkins
      Jenkinsfile
      Pipeline
      Blue Ocean
    Docker
      Image
      Container
      Dockerfile
      多阶段构建
      docker-compose
    Nginx
      静态资源部署
      反向代理
      SPA 路由
```

## 推荐学习顺序

1. ⭐⭐⭐⭐   [CI/CD 概述](./overview.md) —— 先理解整体概念和流水线思想
2. ⭐⭐⭐⭐⭐ [GitHub Actions](./github-actions.md) —— 面试最高频，必须能手写 workflow
3. ⭐⭐⭐⭐   [Docker 基础](./docker.md) —— 前端容器化部署的必备技能
4. ⭐⭐⭐     [Jenkins](./jenkins.md) —— 了解传统 CI/CD 工具即可

## 知识点索引

| 知识点 | 频率 | 难度 | 手写 | 状态 |
|--------|------|------|------|------|
| [CI/CD 概述](./overview.md) | ⭐⭐⭐⭐ | 初级 | — | filled |
| [GitHub Actions](./github-actions.md) | ⭐⭐⭐⭐⭐ | 中级 | ✅ workflow 文件 | filled |
| [Docker 基础](./docker.md) | ⭐⭐⭐⭐ | 中级 | ✅ Dockerfile | filled |
| [Jenkins](./jenkins.md) | ⭐⭐⭐ | 高级 | — | filled |

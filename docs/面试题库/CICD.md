---
title: CI/CD 高频面试题
category: 面试题库
type: interview
score: 0
difficulty: 中级
status: filled
created: 2026-07-16
tags:
  - CI/CD
  - GitHub Actions
  - Docker
  - 自动化部署
---

# CI/CD 高频面试题

> CI/CD 面试权重较低，通常 1-2 道题，考察工程化思维的完整性而非工具细节。

---

### Q1: 什么是 CI/CD？前端项目怎么做自动化部署？

> ⭐⭐⭐⭐ | 难度：中级

**题目**：CI/CD 分别代表什么？一个完整的前端自动化部署流程是怎样的？

**30秒答**：CI 持续集成——代码 push 后自动 lint/build/test。CD 持续部署——构建产物自动部署到服务器。前端流程：push → lint → test → build → 上传 CDN → 通知。GitHub Actions 触发。

**追问预测**：
- "怎么管理多环境部署" → 分支策略——develop→test、main→staging、tag→production。环境变量区分 API 地址

> 答案参考：[../CICD/github-actions.md](../CICD/github-actions.md)

---

### Q2: Docker 在前端项目中怎么用？

> ⭐⭐⭐ | 难度：中级

**题目**：Docker 的核心概念是什么？前端项目如何用 Docker 实现一致性部署？

**30秒答**：Docker 把应用和环境打包成镜像——开发/测试/生产环境一致。前端：`Dockerfile` 定义 Nginx+静态文件 → `docker build` 构建镜像 → `docker run` 启动容器。解决"我机器上能跑"的问题。

> 答案参考：[../CICD/docker.md](../CICD/docker.md)

---

### Q3: 代码规范怎么在团队落地？

> ⭐⭐⭐⭐ | 难度：中级

**题目**：如何在前端团队推行统一的代码规范？Husky + lint-staged 的作用是什么？

**30秒答**：ESLint + Prettier 统一格式、Husky 在 git commit 前触发 lint、lint-staged 只检查改动的文件——不阻塞提交。CI 里再跑一遍做兜底——本地跳过的 CI 拦。

> 答案参考：[../CICD/jenkins.md](../CICD/jenkins.md)

---

### Q4: 灰度发布是什么？前端怎么做？

> ⭐⭐⭐ | 难度：中高级

**题目**：灰度发布和蓝绿部署有什么区别？前端怎么实现灰度？

**30秒答**：灰度发布——新版本只给部分用户看，验证无问题再全量。前端实现：Nginx 按 cookie/header 分流不同版本、或服务端返回不同 index.html。蓝绿部署——两套完整环境，切换流量——更重但回滚更快。

> 答案参考：[../CICD/github-actions.md](../CICD/github-actions.md)

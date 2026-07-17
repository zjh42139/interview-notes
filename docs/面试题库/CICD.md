---
title: CI/CD 高频面试题
category: 面试题库
type: interview
score: 0
difficulty: 中级
status: filled
created: 2026-07-16
updated: 2026-07-18
tags:
  - CI/CD
  - GitHub Actions
  - Docker
  - 自动化部署
  - 缓存策略
---

# CI/CD 高频面试题

> 收录 CI/CD 高频真题，共 6 题。面试权重较低，通常 1-2 道题，考察工程化思维的完整性而非工具细节——近半年「部署后」环节（版本更新通知/缓存策略/回滚）明显升温。

---

### Q1: 什么是 CI/CD？前端项目怎么做自动化部署？

> ⭐⭐⭐⭐ | 难度：中级

**题目**：CI/CD 分别代表什么？一个完整的前端自动化部署流程是怎样的？

**30秒答**：CI 持续集成——代码 push 后自动 lint/build/test。CD 持续部署——构建产物自动部署到服务器。前端流程：push → lint → test → build → 上传 CDN → 通知。GitHub Actions 触发。

**追问预测**：
- "怎么管理多环境部署" → 分支策略——develop→test、main→staging、tag→production。环境变量区分 API 地址
- "CI 构建怎么加速" → 缓存 node_modules（actions/cache 按 lockfile hash 命中）、lint/test 拆并行 job、增量构建只构建改动部分

> 答案参考：[../CICD/github-actions.md](../CICD/github-actions.md)

---

### Q2: Docker 在前端项目中怎么用？

> ⭐⭐ | 难度：中级

**题目**：Docker 的核心概念是什么？前端项目如何用 Docker 实现一致性部署？

**30秒答**：Docker 把应用和环境打包成镜像——开发/测试/生产环境一致。前端用多阶段构建：`Dockerfile` 里 node 镜像跑 build，产物 COPY 进 Nginx 镜像——最终镜像不含 node_modules，体积小。`docker build` 构建 → `docker run` 启动容器。解决"我机器上能跑"的问题。

> 答案参考：[../CICD/docker.md](../CICD/docker.md)

---

### Q3: 代码规范怎么在团队落地？

> ⭐⭐⭐⭐ | 难度：中级

**题目**：如何在前端团队推行统一的代码规范？Husky + lint-staged 的作用是什么？

**30秒答**：ESLint + Prettier 统一格式、Husky 在 git commit 前触发 lint、lint-staged 只检查改动的文件——不阻塞提交。CI 里再跑一遍做兜底——本地跳过的 CI 拦。

> 答案参考：[../工程化/eslint-husky.md](../工程化/eslint-husky.md)

---

### Q4: 灰度发布是什么？前端怎么做？

> ⭐⭐⭐⭐ | 难度：中高级

**题目**：灰度发布和蓝绿部署有什么区别？前端怎么实现灰度？

**30秒答**：灰度发布——新版本只给部分用户看，验证无问题再全量。前端实现：Nginx 按 cookie/header 分流不同版本、或服务端返回不同 index.html。蓝绿部署——两套完整环境，切换流量——更重但回滚更快。

**追问预测**：
- "线上出问题怎么快速回滚" → 前提是保留历史版本——构建产物按版本归档/Docker 镜像打 tag/CDN 按版本目录存放。回滚就是把 Nginx 或 CDN 指回上一版本——秒级生效，不用重新构建

> 答案参考：[../CICD/github-actions.md](../CICD/github-actions.md)
> 延伸：[../项目实战/基础设施/gray-release.md](../项目实战/基础设施/gray-release.md)

---

### Q5: 前端重新部署后，如何通知用户刷新页面？

> ⭐⭐⭐⭐ | 难度：中级

**题目**：前端发了新版本，但用户还停留在旧页面。如何检测到新版本上线并提示用户刷新？

**考察点**：
- 轮询 `version.json`（最常用）：构建时把版本号（git hash/构建时间戳）写进 public 下的 version.json，前端定时拉取比对
- WebSocket 推送：发版后服务端主动通知——最实时，但要维护长连接，成本高
- Service Worker：监听 `updatefound`/`controllerchange`，新 SW 安装完成即代表有新版本
- 响应头对比：后端/网关在响应头带 `X-App-Version`，axios 响应拦截器里和本地版本比对——蹭业务请求，无需额外轮询
- 用户体验：弹 toast 提示「有新版本」，让用户自己点刷新——不强刷

**30秒答**：我们的做法是构建时生成 version.json 写入版本号，前端定时拉取和本地比对，发现变化就弹 toast 提示"有新版本，点击刷新"——让用户自己选时机，不强刷。也可以在 axios 拦截器里比对响应头 X-App-Version——蹭业务请求，不用额外轮询。WebSocket 推送最实时但成本高；项目本来就有 Service Worker 的话，监听 updatefound 也能检测到新版本。

**追问预测**：
- "什么时机检测合适" → 定时轮询打底 + `visibilitychange` 切回页面时立即检测 + 路由跳转前检测
- "用户不刷新，懒加载旧 chunk 404 了怎么办" → 全局捕获动态 import 失败，提示刷新。根因是覆盖式发布删了旧资源——见 Q6
- "为什么不直接强制刷新" → 用户可能正在填表单，强刷丢数据。提示 + 用户确认才是合理体验

> 答案参考：[../CICD/overview.md](../CICD/overview.md)（部署流程；版本更新通知暂无专门知识文件）

---

### Q6: 部署后的静态资源缓存策略怎么设计？

> ⭐⭐⭐⭐ | 难度：中级

**题目**：发新版本时，`index.html` 和带 hash 的 JS/CSS 分别配什么缓存策略？为什么这样分层？覆盖式发布和非覆盖式发布有什么区别？

**考察点**：
- `index.html`：`Cache-Control: no-cache` 走协商缓存——入口每次校验，保证发版后用户拿到最新 html
- 带 contenthash 的 JS/CSS：`Cache-Control: max-age=31536000, immutable` 长缓存
- 分层原理：内容变 → hash 变 → URL 变——浏览器视为全新资源直接请求，天然缓存失效，不用手动清缓存
- 覆盖式发布：新产物覆盖旧目录——必须先传静态资源再传 html（顺序反了，新 html 引用的资源还没上，404）；且旧资源被删，未刷新用户懒加载旧 chunk 会 404
- 非覆盖式发布：按版本目录存放、旧版本保留——发布无顺序问题，支持秒级回滚和灰度

**30秒答**：我们线上是入口 index.html 设 no-cache 走协商缓存——保证每次拿到最新入口；带 contenthash 的 JS/CSS 设 max-age 一年加 immutable 长缓存——内容一变 hash 就变，URL 变了浏览器自动请求新文件，天然缓存失效。发布顺序上要先传静态资源再传 html——反过来 html 先上、资源还没上就 404。更稳的是非覆盖式发布——按版本目录存，旧版本保留，随时回滚，也不影响还停在旧页面的用户。

**追问预测**：
- "为什么 index.html 不能长缓存" → 发版后 JS/CSS hash 变了，缓存里的旧 html 还引用旧文件——旧文件被覆盖删除就白屏
- "覆盖式发布有什么隐患" → 旧 chunk 被删，停留在旧页面的用户懒加载报 404；部署瞬间还存在新旧 html/资源不一致的窗口
- "CDN 上的旧缓存怎么处理" → hash 资源新 URL 自动回源不用管；index.html 发版后主动 purge/刷新 CDN 缓存

> 答案参考：[../工程化/webpack.md](../工程化/webpack.md)（contenthash 配置；部署侧缓存策略暂无专门知识文件）
> 延伸：强缓存/协商缓存机制见 [./浏览器.md](./浏览器.md) Q5

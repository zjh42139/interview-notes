---
title: "错误处理 / 前端监控体系"
description: 全局错误捕获、Sentry 日志上报、前端性能监控与埋点体系
category: 项目实战
type: mechanism
score: 85
difficulty: 高级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-16
tags:
  - 错误处理
  - 监控
  - 埋点
  - Sentry
---

# 错误处理 / 前端监控体系

> ⭐⭐⭐⭐⭐｜难度：高级｜中高级面试标配

## 一句话总结

**三层错误捕获——`app.config.errorHandler`（Vue）、`window.onerror`（JS 运行时）、`unhandledrejection`（未捕获 Promise）。Sentry 汇总+分类+SourceMap 定位源码行。监控体系三件事——性能监控（Web Vitals）、错误监控（Sentry）、行为埋点（PV/点击/曝光）。**

## 核心机制

### 错误处理三层防线

```javascript
// 1. Vue 组件级错误
app.config.errorHandler = (err, instance, info) => {
  Sentry.captureException(err, { extra: { info } });
  console.error('[Vue Error]', err);
};

// 2. JS 运行时错误
window.onerror = (message, source, line, col, error) => {
  Sentry.captureException(error || message);
};

// 3. 未捕获 Promise 错误
window.addEventListener('unhandledrejection', (event) => {
  Sentry.captureException(event.reason);
});

// 4. 接口层统一拦截（axios 响应拦截器）
axios.interceptors.response.use(
  res => res,
  error => {
    if (!error.response) return Promise.reject(error); // 网络错误
    const { status, data } = error.response;
    if (status === 401) { /* 登录态失效 */ }
    Sentry.captureException(new Error(`API ${status}: ${data.message}`));
    return Promise.reject(error);
  }
);
```

### 前端监控体系

| 类型 | 工具 | 采集指标 |
|------|------|---------|
| 性能 | web-vitals / Lighthouse | LCP/FCP/CLS/INP/TTFB |
| 错误 | Sentry / Fundebug | 错误堆栈+用户操作路径+环境信息 |
| 埋点 | 自研 / GrowingIO / 神策 | PV/UV、点击、曝光、转化 |

**性能指标采集**：
```javascript
import { onLCP, onINP, onCLS } from 'web-vitals';
onLCP(metric => reportMetric('LCP', metric.value));
onCLS(metric => reportMetric('CLS', metric.value));
```

### CI/CD 部署流程

```
git push main
  → GitHub Actions: lint + test + build
    → 产物上传 CDN（JS/CSS/图片）
    → index.html 部署到 Nginx
    → 通知企业微信/钉钉 "部署完成"
```

**多环境策略**：develop → test（自动部署）、main → staging（手动审批）、tag → production（审批+回滚方案）。

## 易错点

1. **SourceMap 没上传导致堆栈不可读**：Sentry/监控平台收到的错误堆栈是压缩后的 `at a at b at c`，完全无法定位源码位置。必须在 CI 构建流程中上传 SourceMap（`sentry-cli releases files upload`），然后删除线上的 `.map` 文件——不能让用户通过 DevTools 看到源码。

2. **unhandledrejection 在不同浏览器行为不一致**：Chrome 会打印警告，Firefox 直接静默吞掉。必须全局监听 `unhandledrejection`，不能依赖浏览器默认行为。

3. **监控 SDK 的初始化放得太晚**：如果 Sentry.init 放在 `main.js` 的 `import` 之后，那 import 阶段的错误就不会被捕获。Sentry 必须是最先被 import 的模块——放在 `main.ts` 的第一行。

4. **把所有错误都上报——造成噪音污染**：用户网络断开导致的 `Network Error`、第三方脚本的广告拦截冲突——这些不是你的 bug 但会淹没真正的错误。必须做错误过滤：同类型错误聚合、浏览器扩展报错过滤、网络状态判断。

5. **性能监控的采样率没设对**：100% 采样会拖垮监控服务——通常 10% 足够做统计分析。关键页面（支付、登录）可以用 100%，其他 5-10%。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "你们项目怎么做错误处理" | 追问三层防线——"Promise 报错能捕获吗" |
| "监控做了哪些" | 追问性能和错误两维度——"SourceMap 怎么上传的" |
| "线上报错你怎么排查" | 追问 Sentry issue 链接→SourceMap 还原→定位 commit→修复发版 的完整流程 |
| "监控怎么和 CI/CD 配" | 追问构建流水线中 release 追踪和 deploy 关联

## 相关阅读

- [Web Vitals](../../性能优化/web-vitals.md)
- [项目优化](../项目优化/project-optimization.md)

## 更新记录

- 2026-07-16：新建——三层错误捕获+监控三体系+CI/CD流水线

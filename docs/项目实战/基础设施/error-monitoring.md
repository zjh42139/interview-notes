---
title: "错误处理 / 前端监控体系"
description: 全局错误捕获、Sentry 日志上报、前端性能监控与埋点体系
category: 项目实战
type: mechanism
score: 85
difficulty: 高级
frequency: ⭐⭐⭐⭐⭐
status: draft
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

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "你们项目怎么做错误处理" | 追问三层防线——"Promise 报错能捕获吗" |
| "监控做了哪些" | 追问性能和错误两维度 |

## 相关阅读

- [Web Vitals](../../性能优化/web-vitals.md)
- [项目优化](../项目优化/project-optimization.md)

## 更新记录

- 2026-07-16：新建——三层错误捕获+监控三体系+CI/CD流水线

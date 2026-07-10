---
title: 埋点系统
description: 埋点方式对比、SDK 设计、PV/UV 上报、数据规范
category: 日志监控
type: api-reference
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
reviewed: null
tags:
  - 埋点
  - 数据采集
  - SDK 设计
  - PV UV
---

# 埋点系统

## ✅ 核心机制

### 1. 三种埋点方式

| 方式 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| **代码埋点** | 开发者手动调用 `track()` 上报 | 精确灵活，可携带业务参数 | 开发成本高，耦合业务代码 |
| **可视化埋点** | 运营人员圈选页面元素生成埋点 | 非开发人员可操作 | 仅支持点击等简单事件 |
| **无埋点（全埋点）** | SDK 自动采集所有点击、输入、跳转 | 接入简单，历史可回溯 | 数据量大，缺少业务语义 |

实际项目三者组合：核心流程代码埋点保证精确性，通用行为无埋点兜底，临时分析可视化埋点快速配置。

### 2. 手动埋点示例

```js
// 点击事件
button.addEventListener('click', () => {
  tracker.track('button_click', {
    buttonName: 'submit_order',
    extraInfo: { orderId: 'xxx', amount: 99.9 },
  });
});

// 停留时长（进入记录时间，离开时上报）
const enterTime = Date.now();
onBeforeUnmount(() => {
  tracker.track('page_duration', {
    pageName: 'order_detail',
    duration: Date.now() - enterTime,
  });
});
```

### 3. PV/UV 自动上报

在路由守卫中自动采集，业务代码零侵入：

```js
// Vue Router
router.afterEach((to, from) => {
  tracker.track('page_view', {
    pageUrl: to.fullPath,
    pageName: to.meta.title || to.name,
    referrer: from?.fullPath || document.referrer,
  });
});
```

PV 直接计数，UV 需**根据设备 ID / 用户 ID 去重**。通常用 `localStorage` 存储匿名标识（UUID）作为未登录用户的唯一 ID。

## ⭐ 深度拓展

### 4. 埋点 SDK 设计

```
[事件采集层]  →  手动埋点 / 自动埋点 / 可视化埋点
      ↓
[公共参数填充]  →  userId, deviceId, timestamp, pageUrl, appVersion
      ↓
[事件队列]  →  内存队列，批量攒够 N 条或每隔 M 秒
      ↓
[发送层]  →  sendBeacon + 失败重试 + 离线缓存
```

**批量上报核心代码**（收集到 10 条或 5s 后统一发送）：

```js
class Tracker {
  queue = [];  maxBatch = 10;  flushInterval = 5000;

  track(eventType, data) {
    this.queue.push({ eventType, data, ...this.getCommonParams() });
    if (this.queue.length >= this.maxBatch) this.flush();
  }

  flush() {
    if (!this.queue.length) return;
    navigator.sendBeacon('/api/track', JSON.stringify(this.queue.splice(0)));
  }

  getCommonParams() {
    return { userId: getUserId(), deviceId: getDeviceId(),
      timestamp: Date.now(), pageUrl: location.href, appVersion: '1.0.0' };
  }
}
```

**失败重试 + 离线缓存**：上报失败时存入 `localStorage`，下次成功后一并发送积压数据，设置最大缓存条数（如 1000 条）防止撑爆存储。

### 5. 数据规范

**通用参数**（每条事件自动附加）：`userId`、`deviceId`（localStorage 生成）、`timestamp`、`pageUrl`、`sessionId`、`appVersion`。

**业务参数**（按事件类型附加）：`eventType`（page_view / button_click / form_submit 等）、`extraData`（JSON 扩展字段）。

## ⭕ 项目实战

### 后台管理系统的埋点封装

在 Axios 拦截器 + 路由守卫中统一处理：

```js
// 路由守卫 — 自动上报 PV
router.afterEach((to) => {
  tracker.track('page_view', { pageUrl: to.fullPath, pageName: to.meta.title });
});

// Axios 请求拦截器 — 记录开始时间
axios.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };
  return config;
});

// Axios 响应拦截器 — 自动上报接口耗时和错误
axios.interceptors.response.use(
  (res) => {
    tracker.track('api_success', {
      url: res.config.url,
      duration: Date.now() - res.config.metadata.startTime,
    });
    return res;
  },
  (error) => {
    tracker.track('api_error', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });
    return Promise.reject(error);
  }
);
```

### 易错点

| 易错点 | 正确做法 |
|--------|----------|
| 页面卸载数据丢失 | 用 `sendBeacon` 而非 `fetch` |
| 敏感信息泄露 | 过滤密码、手机号、身份证，URL 不带 token |
| 重复计数 UV | 设备 ID + 日期去重，同设备同天只算一个 UV |
| 时区问题 | 客户端时间戳可能不准，服务端补 timestamp |
| 数据过大 | 单条事件 ≤ 1KB，批量上报控制总数 |

### 面试信号

> **"能说出手动埋点的 SDK 封装思路 + 注意点"**

回答框架：

1. **分层设计**：代码埋点（核心）+ 无埋点（兜底）+ 可视化埋点（运营自助）
2. **SDK 架构**：采集 → 公共参数填充 → 批量队列 → sendBeacon + 失败重试
3. **统一入口**：路由守卫自动 PV + Axios 拦截器自动 API 耗时
4. **数据规范**：通用参数（userId/deviceId/timestamp）+ 业务参数（eventType/extraData）
5. **注意点**：敏感信息过滤、离线缓存、采样率控制、时区问题

能画出 SDK 架构图并说清各模块职责，说明对数据采集体系有系统性理解。

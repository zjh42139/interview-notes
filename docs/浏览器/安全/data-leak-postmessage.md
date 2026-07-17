---
title: "数据泄露防护 / postMessage 安全"
description: 前端敏感数据脱敏、Sentry 等日志工具的数据过滤、postMessage 通信安全
category: 安全
type: mechanism
score: 75
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-16
tags:
  - 数据泄露
  - 脱敏
  - postMessage
---

# 数据泄露防护 / postMessage 安全

> ⭐⭐⭐⭐｜难度：中级

## 一句话总结

**敏感数据脱敏在前端做——手机号中间四位、身份证出生日期、银行卡号分段显示。错误上报到 Sentry 前过滤敏感字段——`beforeSend` 中删除 password/token/phone。postMessage 的 origin 校验是必须的——不验证来源等于给任意页面开了跨窗口后门。**

## 核心机制

### 敏感数据脱敏

```javascript
// 展示层脱敏——注意：更安全的做法是接口直接返回脱敏字段，完整数据尽量不下发到前端
const maskPhone = (phone) => phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
maskPhone('13812345678'); // 138****5678

// 身份证末位可能是 X，正则要兼容
const maskIdCard = (id) => id.replace(/(\d{4})\d{10}(\d{3}[\dXx])/, '$1**********$2');

// 错误上报时过滤
Sentry.init({
  beforeSend(event) {
    // 删除敏感字段
    delete event.request?.cookies;
    delete event.user?.ip_address;
    // 过滤请求体中的敏感数据
    if (event.request?.data) {
      event.request.data = sanitize(event.request.data);
    }
    return event;
  },
});
```

**关键原则**：敏感数据在后端加密存储——前端只负责展示层脱敏。`console.log` 在生产环境必须清除或过滤——否则 DevTools 直接看到完整数据。

### postMessage 安全

```javascript
// ❌ 危险：不验证 origin——任意页面都可以发消息
window.addEventListener('message', (event) => {
  const data = event.data; // 任何页面都能送到这里
});

// ✅ 必须验证 origin 和 source
window.addEventListener('message', (event) => {
  // 1. 验证来源
  if (event.origin !== 'https://trusted.com') return;
  // 2. 如果是 iframe 通信，验证 source 窗口
  if (event.source !== iframe.contentWindow) return;
  // 3. 验证数据结构——不能信任外部输入
  if (typeof event.data !== 'object' || !event.data.type) return;

  handleMessage(event.data);
});

// 发送时也要指定 targetOrigin——不要用 '*'
targetWindow.postMessage(data, 'https://trusted.com'); // ✅
// targetWindow.postMessage(data, '*'); // ❌ 任何页面都能收到
```

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "手机号在前端怎么展示" | 追问脱敏——"中间四位打码" |
| "Sentry 会泄露用户数据吗" | 追问 beforeSend 过滤 |

## 相关阅读

- [XSS](./xss.md)
- [Token 存储安全](./token-storage.md)

## 更新记录

- 2026-07-16：新建——脱敏+错误上报过滤+postMessage安全

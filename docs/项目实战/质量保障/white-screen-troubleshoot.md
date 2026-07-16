---
title: 白屏排查方法论
description: 线上页面白屏的系统化排查路径——从资源加载到 JS 错误到渲染逻辑的五步排查法
category: 项目实战
type: practice
score: 78
difficulty: 高级
frequency: ⭐⭐⭐⭐
status: draft
created: 2026-07-16
tags:
  - 白屏
  - 排查
  - 错误处理
  - 监控
---

# 白屏排查方法论

> ⭐⭐⭐⭐｜难度：高级｜全部大厂都会问

**面试官问"线上白屏了你怎么排查"，不是在考你知道哪些 API——他在看你的排查思路是不是结构化的。给出一个从外到内、从资源到代码的排查路径。**

## 五步排查法

```
第 1 步：资源层面
├── 打开 Network 面板 → 看是否有 JS/CSS 加载失败（404/500）
├── CDN 挂了？→ 域名 DNS 解析是否正常
├── HTML 入口文件是否返回？→ 最基础的一步
└── 确认：页面空白是否因为"根本没加载到资源"

第 2 步：JS 错误层面
├── 打开 Console → 看是否有红字报错
├── 常见：变量未定义、JSON.parse 失败、接口返回格式变化
├── 检查 Sentry/自研监控 → 看是否有大量错误上报
└── 关键：定位到是哪个 JS 文件、哪一行

第 3 步：渲染逻辑层面
├── Elements 面板 → 检查 `<div id="app">` 里是否有 DOM
├── 空 DOM → 路由匹配失败或根组件未挂载
├── 有 DOM 但不可见 → CSS 问题（display:none / opacity:0 / 高度为 0）
├── Vue DevTools → 检查组件树是否正常渲染
└── 关键：区分"没渲染"和"渲染了但看不到"

第 4 步：接口数据层面
├── Network → 看 API 请求是否 200 / 401 / 500
├── 401 → Token 过期，页面逻辑判断未登录跳走了
├── 接口返回数据结构变更 → 前端解构报错→空白
└── 关键：数据是渲染的前提，没有数据可能没有 UI

第 5 步：环境差异
├── 生产环境才出现？→ 检查环境变量/API 地址/CDN 路径
├── 特定浏览器才出现？→ 检查 Polyfill/浏览器兼容
├── 新版本引入 → 立刻回滚上一版本
└── 最后手段：git bisect 定位到引入问题的 commit
```

## 项目实战

### 1. 自动白屏检测脚本

```typescript
// 在关键节点采样 DOM，如果关键元素缺失则上报告警
function checkWhiteScreen() {
  const root = document.getElementById('app')
  if (!root) {
    reportError({ type: 'white-screen', reason: 'root-missing' })
    return
  }

  // 采样关键点位：main 标签 / 路由视图 / 第一个按钮
  const samples = [
    document.querySelector('main'),
    document.querySelector('.router-view'),
    document.querySelector('button'),
  ]

  const visibleSamples = samples.filter(el => {
    if (!el) return false
    const rect = el.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0
  })

  // 所有采样点都不可见 → 白屏
  if (visibleSamples.length === 0) {
    reportError({ type: 'white-screen', reason: 'no-visible-elements' })
  }
}

// 在 onMounted 中延时检查（等渲染完成）
setTimeout(checkWhiteScreen, 3000)
```

### 2. 应急回滚机制

```bash
# 发现问题后的标准操作流程
1. 确认白屏 → 通知值班人员
2. git log --oneline -5  # 最近 5 个 commit
3. git revert <bad-commit>  # 回滚问题 commit
4. 重新构建 + 部署
5. 验证修复 → 通知团队

# 或者直接回滚到上一个稳定版本的 tag
git checkout <last-stable-tag>
```

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "线上白屏了你怎么排查" | 追问"你怎么确认是前端问题还是后端问题" |
| "你们项目有白屏监控吗" | 追问白屏检测脚本如何区分"真白屏"和"loading 中的正常白屏" |

## 相关阅读

- [错误处理 / 前端监控体系](../基础设施/error-monitoring.md)
- [浏览器 DevTools](../../浏览器/devtools.md)

## 更新记录

- 2026-07-16：新建——Phase 2 覆盖率审计补齐

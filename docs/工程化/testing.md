---
title: 前端测试体系
description: 前端测试分层策略：单元测试（Vitest）、组件测试（Vue Test Utils）、E2E（Playwright/Cypress）的选型与项目实践
category: 工程化
type: practice
score: 0
difficulty: 中高级
frequency: ⭐⭐⭐
status: draft
created: 2026-07-11
updated: 2026-07-11
reviewed: null
tags:
  - 测试
  - Vitest
  - Vue Test Utils
  - Playwright
  - 单元测试
  - E2E
---

# 前端测试体系

> 社招/中高级面试中"你们项目怎么做测试"出现频率在上升。不需要说"覆盖率 90%"，但需要说出测试分层、工具选型和落地策略。

## 一句话总结

**前端测试分三层：单元测试（Vitest）测工具函数+composable、组件测试（Vue Test Utils）测 UI 交互+props/emits、E2E（Playwright）测关键业务流程。后台管理系统的策略：核心业务逻辑 > 公共组件 > 工具函数。覆盖率只是指标，关键在于测了"什么"而非"多少"。**

---

## 核心机制

### 测试金字塔（前端版）

```
        ╱ E2E ╲          ← 关键用户流程（登录→操作→结果）
       ╱  组件  ╲         ← 核心组件交互（表单提交/弹窗显示）
      ╱  单元测试  ╲       ← 工具函数 + composable + store actions
```

| 层级 | 工具 | 速度 | 维护成本 | 覆盖目标 |
|------|------|------|---------|---------|
| 单元 | Vitest | 毫秒 | 低 | 工具函数 > composable > store |
| 组件 | Vitest + Vue Test Utils | 秒 | 中 | 核心业务组件（表单/表格/权限按钮） |
| E2E | Playwright / Cypress | 分钟 | 高 | 关键业务流程（登录→操作→结果） |

### Vitest — 单元测试首选

```javascript
// composable 测试
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('increment should increase count', () => {
    const { count, increment } = useCounter()
    expect(count.value).toBe(0)
    increment()
    expect(count.value).toBe(1)
  })
})
```

Vitest 和 Vite 共享配置（`vite.config.ts`），原生 ESM、HMR 支持，测试文件修改后极速重跑——体验远好于 Jest。

### Vue Test Utils — 组件测试

```javascript
import { mount } from '@vue/test-utils'
import LoginForm from './LoginForm.vue'

describe('LoginForm', () => {
  it('emits submit with form data', async () => {
    const wrapper = mount(LoginForm)
    await wrapper.find('input[name="username"]').setValue('admin')
    await wrapper.find('input[name="password"]').setValue('123456')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')[0][0]).toEqual({
      username: 'admin', password: '123456'
    })
  })
})
```

**组件测试的三类核心断言**：
1. Props → 渲染：传了 prop 后 DOM 是否正确渲染
2. 用户交互 → Emit：点击/输入后是否 emit 正确的事件和数据
3. 条件渲染：v-if/v-show 的显示/隐藏逻辑

### Playwright — E2E 测试

```javascript
test('user can login and see dashboard', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="username"]', 'admin')
  await page.fill('[name="password"]', '123456')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('.welcome')).toContainText('欢迎')
})
```

## 项目实战

### 后台管理系统的测试策略

**P0 必测**（每次提交前跑）：
- 公共 composable（useAuth/usePermission）
- 核心工具函数（格式化/校验/权限判断）
- 关键业务组件（登录表单/权限按钮显示逻辑）

**P1 经常测**（每次发布前跑）：
- 核心用户流程 E2E（登录→创建记录→看到结果）
- 关键组件的交互逻辑

**P2 有时间测**：
- 非核心组件的渲染快照
- 边界条件覆盖

### CI 集成

```yaml
# .github/workflows/test.yml
- run: npx vitest run --coverage    # 单元+组件测试
- run: npx playwright test          # E2E（关键流程）
```

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "你们项目写测试吗" | 用什么工具、覆盖率多少、测了哪些模块 |
| "单元测试和集成测试怎么划分" | 具体例子——哪些是单元、哪些是集成 |
| "E2E 测试的维护成本怎么控制" | 只测关键流程——不是所有功能都需要 E2E |

## 易错点

1. **"覆盖率越高越好"** —— 覆盖率 80% 不代表测试质量高。关键是测对了东西——覆盖核心逻辑比覆盖 getter/setter 重要
2. **"所有组件都要测"** —— 不需要。优先测有状态/有交互/有业务逻辑的组件。纯展示组件（如 Icon/Divider）测了性价比极低
3. **"测试能捕获所有 bug"** —— 不能。测试只能验证你预期的行为——真正的 bug 往往是"没想到的场景"

## 相关阅读

- [Vite 深入](./vite-deep.md) — Vitest 和 Vite 共用配置的原理
- [CI/CD 持续集成](../CICD/overview.md) — 测试在 CI pipeline 中的位置
- [npm 深入](./npm-deep.md) — npm scripts + test 命令

## 更新记录

- 2026-07-11：新建（测试金字塔 + Vitest/Vue Test Utils/Playwright + CI 集成）

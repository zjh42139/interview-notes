---
title: 水印 + 截图防御
description: 前端页面水印（Canvas 生成 + 防删除 + 暗水印）与截图防御方案
category: 项目实战
type: practice
score: 72
difficulty: 中高级
frequency: ⭐⭐⭐
status: filled
created: 2026-07-16
tags:
  - 水印
  - Canvas
  - MutationObserver
  - 安全
---

# 水印 + 截图防御

> ⭐⭐⭐｜难度：中高级｜腾讯/百度安全方向常考

**后台管理系统的信息防泄露方案——前端水印。核心目标是"用户看到的内容带着身份标识，截图后可以追溯来源"。**

## 一句话总结

**Canvas 生成水印图案 → 转为 full-page 半透明遮罩层 → MutationObserver 防止 DOM 删除 → 可选：CSS `pointer-events: none` 不干扰用户操作。**

## 核心实现

### 明水印

```typescript
function createWatermark(text: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 200
  canvas.height = 150
  const ctx = canvas.getContext('2d')!

  ctx.rotate((-20 * Math.PI) / 180)  // 旋转 -20°
  ctx.font = '16px Arial'
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'  // 半透明
  ctx.fillText(text, 20, 100)

  // 转 base64 作为背景图
  const bg = `url(${canvas.toDataURL()})`

  const div = document.createElement('div')
  div.id = '__watermark__'
  div.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: ${bg}; pointer-events: none; z-index: 9999;
  `
  document.body.appendChild(div)
}
```

### MutationObserver 防删除

```typescript
function observeWatermark() {
  const target = document.getElementById('__watermark__')
  if (!target) return

  // 监听自身属性/子节点的变化
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        // 水印被移除了 → 重新插入
        for (const removed of mutation.removedNodes) {
          if (removed === target) {
            document.body.appendChild(target)
          }
        }
      }
      if (mutation.type === 'attributes') {
        // 样式被改了 → 恢复
        if (mutation.attributeName === 'style') {
          target.style.display = ''  // 防止 display:none 隐藏
          target.style.visibility = ''
        }
      }
    }
  })

  observer.observe(target, { attributes: true, childList: true })
  observer.observe(target.parentNode!, { childList: true })
}
```

### 暗水印（频域嵌入）

```typescript
// 更高级的方案：将用户 ID 编码到图片的频域中（DCT 变换 + 逆变换）
// 截图后可以通过解码算法还原出嵌入的信息
// 优点：肉眼不可见、截图后仍能追溯
// 缺点：实现复杂、有损压缩可能丢失水印

// 实际项目中通常用明水印 + 防删除即可
// 暗水印只在信息高度敏感的场景（金融/政务）才需要
```

## 易错点

1. **MutationObserver 死循环**：水印被删除 → MutationObserver 检测到 → 重新创建水印 → 触发新的 mutation 事件 → 再次触发 observer。解决：在重新创建水印时暂时 `disconnect()` observer，创建完成后再重新 `observe`。

2. **z-index 层级冲突**：水印使用 `position: fixed; z-index: 9999` 会遮盖所有弹窗和下拉菜单。解决：将水印的 z-index 设为一个较低值（如 100），页面弹窗的 z-index 统一高于水印层即可。

3. **SPA 路由切换后水印丢失**：如果是 Vue Router 的 SPA 应用，页面路由切换时 DOM 重建会导致水印节点丢失。必须在路由守卫中重新注入水印——`router.afterEach(() => injectWatermark())`。

4. **打印/PDF 导出绕过水印**：`position: fixed` 的水印在 `window.print()` 时可能被浏览器忽略。解决：使用 `@media print { .watermark { display: block !important; } }` 强制打印时显示水印。

5. **暗水印不要只有注释**：暗水印（盲水印）的核心原理是在图片的频域（DCT 系数）中嵌入信息——人眼不可见但算法可提取。即使不实现，面试时也应该能说出原理。最简单的替代方案：在 Canvas 上绘制透明度为 0.01 的水印文字，截图后肉眼不可见但放大后可辨识。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "你们项目怎么防信息泄露" | 追问"水印被用户 F12 删了怎么办" → MutationObserver |
| "水印影响页面交互吗" | pointer-events:none——水印层不拦截鼠标事件 |
| "打印或截图怎么防" | CSS @media print 强制显示 + user-select:none + 键盘截图快捷键无解但可通过盲水印追溯泄漏源 |
| "盲水印什么原理" | 频域水印——在图片 DCT 系数中嵌入比特，LBS 可提取——这是信号处理的知识，面试时说清原理即可 |

## 相关阅读

- [权限系统 RBAC](../权限系统/permission-rbac.md) — 安全体系的核心环节
- [Canvas vs SVG](../../HTML/canvas-svg.md) — Canvas API 基础

## 更新记录

- 2026-07-16：新建——Phase 2 覆盖率审计补齐

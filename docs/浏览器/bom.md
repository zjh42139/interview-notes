---
title: BOM 全景
description: 浏览器对象模型（BOM）的完整 API 地图：navigator、screen、location、history、Blob/File/FileReader 等
category: 浏览器
difficulty: 初级
frequency: ⭐⭐⭐
status: drafted
created: 2026-07-10
updated: 2026-07-10
reviewed: null
tags:
  - BOM
  - navigator
  - location
  - screen
  - Blob
  - FileReader
---

# BOM 全景

> &#11088;&#11088;&#11088;｜难度：初级｜项目：&#9733;&#9733;

## 一句话总结

**BOM（Browser Object Model）是浏览器提供给 JS 的全局能力层——`navigator` 识别设备信息、`screen` 读屏幕尺寸、`location` 解析和操作 URL、`history` 控制浏览器导航。它们不属 ECMAScript，但每天都在用。**

## 核心机制

### BOM 的六大家族

```
window（全局对象，一切的根）
  ├── navigator  → 浏览器和设备信息
  ├── screen     → 屏幕信息
  ├── location   → URL 解析和跳转
  ├── history    → 导航历史
  ├── document   → DOM 入口（严格说是 DOM，因历史原因挂在 window 下）
  └── 其他       → alert/confirm/prompt、Blob/File、fetch、定时器...
```

### navigator —— 设备和浏览器指纹

```javascript
// 1. 基础信息
navigator.userAgent       // UA 字符串（逐渐被 User-Agent Client Hints 取代）
navigator.platform        // 操作系统平台（已废弃，返回空或 'Win32'）
navigator.language        // 浏览器语言 'zh-CN'
navigator.languages       // 语言偏好列表 ['zh-CN', 'en']

// 2. 网络状态
navigator.onLine          // 是否在线（但不保证网络畅通，只表示"浏览器认为在线"）
navigator.connection      // Network Information API（实验性）
// connection.effectiveType → '4g' / '3g' / '2g' / 'slow-2g'
// connection.downlink → 估算带宽（Mbps）
// connection.rtt → 往返时间估算（ms）
// connection.saveData → 用户是否开启了"省流量模式"

// 3. 设备能力
navigator.hardwareConcurrency  // CPU 逻辑核心数（用于决定 Worker 线程数）
navigator.deviceMemory         // 设备内存（GB，0.25/0.5/1/2/4/8）
navigator.maxTouchPoints       // 触摸点数（判断是否是触屏设备）

// 4. 剪贴板
navigator.clipboard.writeText('要复制的文字')    // 写入剪贴板
navigator.clipboard.readText()                  // 读取剪贴板（需要用户授权）

// 5. 权限查询
const status = await navigator.permissions.query({ name: 'geolocation' })
// status.state → 'granted' | 'denied' | 'prompt'
status.addEventListener('change', () => {
  // 用户在浏览器设置中修改权限后触发
})

// 6. 分享（Web Share API）
if (navigator.share) {
  await navigator.share({ title: '标题', text: '描述', url: 'https://...' })
}

// 7. 振动（移动端）
navigator.vibrate(200)          // 振动 200ms
navigator.vibrate([100, 50, 100])  // 振动 100ms → 停 50ms → 振动 100ms

// 8. 电池状态（已废弃但部分浏览器仍可用）
navigator.getBattery?.().then(battery => {
  console.log(battery.level, battery.charging)
})

// 9. 在线状态变化监听
window.addEventListener('online', () => console.log('网络恢复'))
window.addEventListener('offline', () => console.log('网络断开'))
```

### screen —— 屏幕信息

```javascript
screen.width        // 屏幕总宽度（像素） 如 1920
screen.height       // 屏幕总高度（像素） 如 1080
screen.availWidth   // 可用宽度（减去任务栏） 如 1920
screen.availHeight  // 可用高度（减去任务栏） 如 1040
screen.colorDepth   // 色深（通常 24）
screen.pixelDepth   // 像素深度（通常 24）

// ⚠️ 注意：这是物理屏幕信息，不是浏览器窗口大小！
// 浏览器窗口大小：window.innerWidth / window.innerHeight
// 文档可视区大小：document.documentElement.clientWidth / clientHeight
```

### location —— URL 完整控制

```javascript
// URL: https://user:pass@example.com:8080/search?q=vue#results

location.href       // 完整 URL（可写，设置后页面跳转）
location.protocol   // 'https:'
location.host       // 'example.com:8080'（hostname + port）
location.hostname   // 'example.com'
location.port       // '8080'
location.pathname   // '/search'
location.search     // '?q=vue'
location.hash       // '#results'
location.origin     // 'https://example.com:8080'（protocol + host，只读）
location.username   // 'user'（不常用）
location.password   // 'pass'（不常用）

// 页面跳转的几种方式
location.href = '/new-page'       // 新增历史记录，可后退
location.replace('/new-page')     // 替换当前记录，不可后退
location.reload()                 // 刷新页面
location.assign('/new-page')      // 等同于 location.href = '...'

// 解析 URL 参数
const params = new URLSearchParams(location.search)
params.get('q')          // 'vue'
params.getAll('tag')     // ['js', 'css']（多值参数）
params.has('page')       // false
params.set('page', '1')  // 修改
params.append('tag', 'html')  // 追加
params.toString()        // 'q=vue&tag=js&tag=css&page=1&tag=html'
```

### history —— 导航历史

```javascript
// 基础导航（[History API 详解](./history-api.md)）
history.back()       // 后退
history.forward()    // 前进
history.go(-2)       // 后退 2 步
history.go(0)        // 刷新

history.length       // 当前标签页历史记录条数

// SPA 路由基础（详见 ../HTML/history-api.md）
history.pushState(state, title, url)
history.replaceState(state, title, url)
history.state        // 当前 state 对象
window.onpopstate    // 前进/后退时触发

// 滚动恢复
history.scrollRestoration = 'manual'  // SPA 自行管理滚动位置
```

## 深度拓展

### Blob / File / FileReader —— 二进制数据处理

```javascript
// Blob —— 不可变的二进制数据块
const blob = new Blob(['Hello World'], { type: 'text/plain' })
const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' })

// Blob URL —— 内存中的"临时文件"
const url = URL.createObjectURL(blob)  // 'blob:https://example.com/uuid'
// <img src={url} /> → 显示 Blob 中的图片数据
// 用完必须释放！
URL.revokeObjectURL(url)

// File —— Blob 的子类，多了文件名和修改时间
// <input type="file"> → event.target.files[0]
const file = input.files[0]
file.name            // 'report.pdf'
file.size            // 102400（字节）
file.type            // 'application/pdf'
file.lastModified    // 1704067200000（时间戳）

// FileReader —— 异步读取 Blob/File 内容
const reader = new FileReader()

reader.onload = (e) => {
  const base64 = e.target.result    // data:image/png;base64,iVBORw...
  // 用于预览图片、上传 base64 等
}
reader.readAsDataURL(file)          // → base64

reader.onload = (e) => {
  const text = e.target.result      // 文件文本内容
}
reader.readAsText(file, 'UTF-8')    // → 文本

const buffer = await file.arrayBuffer()  // → ArrayBuffer（现代方式，比 FileReader 更简洁）
```

### 弹出框 —— alert / confirm / prompt

```javascript
// ❌ 会阻塞主线程，导致整个浏览器 Tab 冻结
// ❌ UI 不可自定义，不同浏览器外观不同
// ❌ 移动端体验极差
// → 现代项目应该用自定义模态框（el-dialog、ant-modal）

alert('操作完成')                         // 弹窗 + 确定按钮
const ok = confirm('确定删除？')           // 弹窗 + 确定/取消 → 返回 boolean
const name = prompt('请输入姓名', '张三')  // 弹窗 + 输入框 → 返回 string 或 null
```

## 项目实战

### 后台管理系统中的 BOM 应用

1. **自适应布局**：根据 `screen.width` / `window.innerWidth` 决定 sidebar 折叠策略
2. **上传文件预览**：`FileReader.readAsDataURL(file)` 在文件上传前生成缩略图预览
3. **大文件分片上传**：`file.slice(start, end)` 分片 → 创建子 Blob → 逐个上传 → 全部完成后 `URL.revokeObjectURL`
4. **URL 同步筛选条件**：列表页筛选参数通过 `URLSearchParams` 同步到 URL（`replaceState`），刷新页面保留筛选状态
5. **用户离线提示**：`navigator.onLine` + `online`/`offline` 事件给出"当前网络不可用"的友好提示

## 易错点

1. **`navigator.userAgent` 不可靠** —— 任何浏览器都可以伪装 UA。特性检测（`'geolocation' in navigator`）比 UA 检测可靠得多
2. **`screen.width` ≠ 浏览器窗口宽度** —— `screen` 是物理屏幕，`window.innerWidth` 才是浏览器可视区域
3. **`URLSearchParams` 不支持 IE** —— IE 下需要 polyfill 或手动解析 `location.search`
4. **`URL.createObjectURL` 必须手动释放** —— 否则 Blob URL 一直占用内存，直到页面关闭。一个文件的预览流程应该是：读 → 显示 → `revokeObjectURL`
5. **`navigator.onLine` 的"在线"不保证网络真的通** —— 它只表示"没有主动断开网络连接"。实际网络可能延迟大、防火墙拦截。建议用 `fetch('/ping')` 做实际连通性检测

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "怎么判断用户设备类型" | 追问 UA 检测 vs 特性检测的优劣 |
| "文件上传怎么预览" | 追问 FileReader 和 URL.createObjectURL 的区别和选择 |
| "location.href 和 location.replace 有什么区别" | 追问 SPA 中的路由跳转与原生跳转的差异 |
| "怎么监听用户离线/在线" | 追问 navigator.onLine 的局限性 |

## 相关阅读

- [History API 与 SPA 路由](../HTML/history-api.md)
- [Web Storage](./storage.md)
- [图片懒加载](../HTML/lazy-loading.md)
- [浏览器 DevTools](./devtools.md)

## 更新记录

- 2026-07-10：新建（navigator/screen/location/history 四大家族 + Blob/File/FileReader + URLSearchParams + 弹出框 + 项目实战）

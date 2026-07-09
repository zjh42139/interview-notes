---
title: HTML5 表单与约束验证
description: HTML5 表单新特性：input 类型、属性、约束验证 API、自定义校验和最佳实践
category: HTML
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: drafted
created: 2026-07-09
updated: 2026-07-09
reviewed: null
tags:
  - HTML5
  - 表单
  - 约束验证
  - input
  - 校验
---

# HTML5 表单与约束验证

> &#11088;&#11088;&#11088;&#11088;&#11088;｜难度：中级｜项目：&#9733;&#9733;&#9733;

## 一句话总结

**HTML5 表单 = 语义化 input 类型 + 声明式约束属性 + 约束验证 API（Constraint Validation API），三者组合可以实现大部分表单需求而不依赖 JS 校验库。**

## 核心机制

### 一、HTML5 新增的 input 类型（10 种）

```html
<!-- 传统：text + password + checkbox + radio + file + submit + reset -->
<!-- HTML5 新增以下类型： -->

<!-- 1. 邮箱 -->
<input type="email" />
<!-- 浏览器自动校验格式，移动端弹出 @ 键盘 -->

<!-- 2. URL -->
<input type="url" />
<!-- 移动端弹出 / 键盘 -->

<!-- 3. 数字 -->
<input type="number" min="0" max="100" step="0.5" />

<!-- 4. 范围（滑块） -->
<input type="range" min="0" max="100" value="50" />

<!-- 5. 日期时间系列 -->
<input type="date" />        <!-- 2026-07-09 -->
<input type="time" />        <!-- 14:30 -->
<input type="datetime-local" />  <!-- 2026-07-09T14:30 -->
<input type="month" />       <!-- 2026-07 -->
<input type="week" />        <!-- 2026-W28 -->

<!-- 6. 颜色 -->
<input type="color" />       <!-- 原生取色器 -->

<!-- 7. 搜索 -->
<input type="search" />
<!-- 自带清空按钮（WebKit），移动端显示搜索键盘 -->

<!-- 8. 电话 -->
<input type="tel" />
<!-- 移动端弹出数字拨号键盘，但不会自动校验格式 -->
```

### 二、HTML5 新增的表单属性

```html
<form novalidate>  <!-- 禁用浏览器默认校验 -->
  <input
    type="text"
    required                    <!-- 必填 -->
    placeholder="请输入姓名"     <!-- 占位提示文字 -->
    pattern="[a-zA-Z一-龥]+"  <!-- 正则校验 -->
    minlength="2"               <!-- 最小字符数 -->
    maxlength="20"              <!-- 最大字符数 -->
    autocomplete="name"         <!-- 自动填充标识 -->
    autofocus                   <!-- 自动聚焦 -->
    readonly                    <!-- 只读，值会提交 -->
    disabled                    <!-- 禁用，值不会提交 -->
    inputmode="numeric"         <!-- 虚拟键盘类型提示 -->
    spellcheck="true"           <!-- 拼写检查 -->
  />
</form>
```

| 属性 | 作用 | 备注 |
|------|------|------|
| `required` | 必填，空值阻止提交 | 布尔属性 |
| `pattern` | 正则校验（`title` 属性设置错误信息） | 值为无 `/` 的正则字符串 |
| `min`/`max`/`step` | 数值/日期范围的 min/max/步长 | 适用于 number/range/date/time |
| `minlength`/`maxlength` | 字符长度范围 | `maxlength` 还会阻止键盘输入超出 |
| `autocomplete` | 自动填充标识（`name`/`email`/`new-password`/`cc-number`/`tel`…） | 浏览器根据标识智能填充 |
| `novalidate` | 禁止浏览器默认校验（放在 `<form>` 上） | 配合 JS 自定义校验使用 |
| `form` | 将表单外的元素关联到表单（`<input form="myForm">`） | 允许 input 不在 form 内 |

### 三、约束验证 API（Constraint Validation API）

**这是 HTML5 表单最具面试价值的部分**——不用 import 任何库，浏览器原生提供完整的校验体系：

```javascript
const input = document.querySelector('input')
const form = document.querySelector('form')

// 1. 单个元素校验 —— 返回 ValidityState 对象
input.validity
// ValidityState {
//   valid: false,          // 所有约束都满足？
//   valueMissing: true,    // required 但未填？
//   typeMismatch: false,   // type="email"/"url" 格式不对？
//   patternMismatch: false,// pattern 不匹配？
//   tooLong: false,        // 超过 maxlength？
//   tooShort: false,       // 低于 minlength？
//   rangeUnderflow: false, // 小于 min？
//   rangeOverflow: false,  // 大于 max？
//   stepMismatch: false,   // 不满足 step？
//   badInput: false,       // 浏览器无法理解输入（如 number 中输入字母）
//   customError: false,    // 是否有自定义错误？
// }

// 2. 触发校验并显示浏览器默认错误气泡
input.checkValidity()    // 返回 boolean，触发 invalid 事件
input.reportValidity()   // 返回 boolean，额外在 UI 上展示错误气泡

// 3. 设置自定义错误信息
input.setCustomValidity('您输入的手机号已被注册')
// 设置后 input.validity.customError = true
// 清空：input.setCustomValidity('')

// 4. 表单级别校验
form.checkValidity()     // 检查所有子元素的 validity
form.reportValidity()    // 检查并展示第一个错误元素的提示
```

### 四、伪类联动（CSS 校验状态无需一行 JS）

```css
input:valid   { border-color: #67c23a; }    /* 校验通过 */
input:invalid { border-color: #f56c6c; }     /* 校验失败 */
input:required > label::after { content: ' *'; color: red; }
input:optional { opacity: 0.6; }
input:in-range { background: #f0f9eb; }      /* 在 min-max 范围内 */
input:out-of-range { background: #fef0f0; }  /* 超出 min-max */
input:placeholder-shown { font-style: italic; }
input:user-invalid { box-shadow: 0 0 0 2px var(--danger); }
/* :user-invalid 只在用户交互后显示错误（比 :invalid 更智能） */
```

## 深度拓展

### 自定义校验 vs 浏览器校验的策略选择

**为什么 Element Plus / Ant Design 不用浏览器默认校验？**

1. 浏览器默认气泡 UI 不可自定义位置/样式
2. `required` 的空值校验是在 submit 时才触发，不是实时反馈
3. 复杂校验（两个密码一致、用户名唯一性异步检查）超出 Constraint Validation API 的能力

**推荐策略**：浏览器校验 + JS 增强。对于做官网/活动页/简单后台，用 `novalidate` + 自定义 UI 覆盖。但要**理解 Constraint Validation API**——因为面试官很可能让你手写一个校验框架。

```javascript
// 面试常见命题：手写一个表单校验器
class FormValidator {
  constructor(form, rules) {
    this.form = form
    this.rules = rules // { field: [{ validator, message }] }
    this.errors = {}
  }

  validate() {
    this.errors = {}
    for (const [field, validators] of Object.entries(this.rules)) {
      const value = this.form[field].value
      for (const { validator, message } of validators) {
        if (!validator(value)) {
          (this.errors[field] ??= []).push(message)
        }
      }
    }
    return Object.keys(this.errors).length === 0
  }

  showErrors() {
    for (const [field, msgs] of Object.entries(this.errors)) {
      const el = this.form.querySelector(`[data-error="${field}"]`)
      if (el) el.textContent = msgs[0]
      this.form[field].classList.add('is-error')
    }
  }
}
```

### `<datalist>` — 原生自动补全下拉

```html
<input list="browsers" placeholder="选择或输入浏览器" />
<datalist id="browsers">
  <option value="Chrome" />
  <option value="Firefox" />
  <option value="Safari" />
  <option value="Edge" />
</datalist>
<!-- <datalist> 的 value 是建议值，用户可以自由输入 -->
<!-- 和 <select> 的区别：datalist 允许自定义输入 -->
```

### `<output>` `<progress>` `<meter>` — 语义化数据展示

```html
<!-- output：计算结果展示 -->
<form oninput="result.value = Number(a.value) + Number(b.value)">
  <input type="number" name="a" value="0" /> +
  <input type="number" name="b" value="0" /> =
  <output name="result">0</output>
</form>

<!-- progress：进度条（任务完成度） -->
<progress value="70" max="100">70%</progress>

<!-- meter：度量值（磁盘使用率、评分等，有 high/low/optimum 阈值） -->
<meter value="0.6" min="0" max="1" low="0.3" high="0.8" optimum="0.5">60%</meter>
```

### `<fieldset>` + `<legend>` — 表单分组

```html
<form>
  <fieldset>
    <legend>基本信息</legend>
    <!-- disabled 可一次性禁用整个 fieldset 内的所有元素 -->
    <label>姓名：<input type="text" /></label>
    <label>邮箱：<input type="email" /></label>
  </fieldset>
  <fieldset>
    <legend>收货地址</legend>
    <label>省份：<input type="text" autocomplete="address-level1" /></label>
    <label>详细地址：<input type="text" autocomplete="street-address" /></label>
  </fieldset>
</form>
```

## 项目实战

### 后台管理系统中的表单校验体系

1. **登录/注册页**：Element Plus 的 `el-form` 内置 async-validator，底层校验逻辑等价于 Constraint Validation API 的状态机。面试中要能说出"校验规则 → validator 函数 → validity 状态"的映射关系
2. **复杂表单**（如商品创建有 50+ 字段）：用 `el-form` 的 `validateField` 做字段级校验，结合 `tab` 切换将校验分组——这是 Element Plus 的校验机制，底层仍是校验状态机
3. **动态表单**（如添加多个收货地址）：每个动态添加的表单项需要独立的校验实例，`el-form-item` 的 `prop` 绑定路径与数据结构对应
4. **只读表单**：用 `<input readonly>` 或 `<span>` 替代 `<el-input disabled>`——disabled 的值不参与提交，readonly 的值会提交，这是后端最常踩的坑

## 易错点

1. **`maxlength` 只对 `type="text"` 等生效，对 `type="number"` 无效** —— `maxlength` 控制的是 UTF-16 code units，不是数值。限制数字范围用 `min`/`max`
2. **`disabled` 的值不会出现在 FormData 中** —— 如需展示不可编辑的值，用 `readonly`
3. **`pattern` 正则不需要 `/` 包裹** —— `<input pattern="\d{11}">` 而非 `pattern="/\d{11}/"`
4. **`setCustomValidity('')` 不等于移除错误** —— 空字符串表示"没有自定义错误"，不是"没有错误"。如果还有其他约束违反，input 仍然 invalid
5. **`novalidate` 在 `<form>` 上才生效** —— 仅放在 submit 按钮上无效
6. **移动端 `type="number"` 的 step 默认值是 1** —— 输入小数时如果没配 `step="0.01"`，浏览器可能拒绝

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "表单校验怎么做" | 追问 Constraint Validation API 的 `setCustomValidity` 原理 |
| "HTML5 新增了哪些 input 类型" | 追问移动键盘适配和 `inputmode` |
| "如何禁用浏览器默认校验" | 追问 `novalidate` 和自定义校验的关系 |
| "如何实现两个密码一致校验" | 追问 `customError` 和 ValidityState 的 10 个状态位 |

## 相关阅读

- [HTML5 语义化](./html5-semantic.md)
- [块级 / 行内元素](./block-inline.md) —— button 的默认 type
- [HTML 实体与编码](./html-entities.md) —— 表单输入的安全层面
- [Element Plus 表单源码](../Vue3/)

## 更新记录

- 2026-07-09：新建（input 类型全覆盖 + 约束属性表 + Constraint Validation API 详解 + 校验伪类 + 手写校验器 + 易错点）

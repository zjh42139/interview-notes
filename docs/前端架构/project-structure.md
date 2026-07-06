---
title: 项目分层设计
description: Vue3 + TypeScript 项目分层架构：api / hooks / utils / components / views / layout / plugins / types / store / router / assets 的职责边界与依赖方向
category: 前端架构
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: filled
created: 2026-07-06
updated: 2026-07-06
tags:
  - 项目分层
  - 目录结构
  - 依赖方向
  - 架构设计
---

# 项目分层设计

> "你写的代码放在哪个目录，比你怎么写更重要 —— 目录结构就是架构。"

---

## 一句话总结

Vue3 + TypeScript 项目按**职责分层**组织代码，核心原则是**上层依赖下层、下层不引用上层**。典型分层为：`assets`（静态资源） -> `types`（类型定义） -> `utils`（纯工具函数） -> `api`（接口封装） -> `hooks`（逻辑复用） -> `store`（全局状态） -> `components`（组件） -> `views`（页面） -> `layout`（布局壳子） -> `router`（路由编排）。插件层 `plugins` 横切全局能力。

---

## 核心机制

### 1. 典型 Vue3 + TS 项目目录

```
src/
├── api/              # 接口层：HTTP 请求封装
│   ├── request.ts    #   Axios 实例 + 拦截器
│   ├── user.ts       #   用户模块接口
│   └── order.ts      #   订单模块接口
├── assets/           # 静态资源：图片、字体、全局样式
├── components/       # 组件层：可复用的 UI 单元
│   ├── common/       #   通用组件（Button/Table/Dialog 的二次封装）
│   └── business/     #   业务组件（UserSelector/DeptTree/OrderStatusTag）
├── hooks/            # 逻辑层：可复用的状态逻辑（composables）
│   ├── useTable.ts   #   表格分页 + 筛选 + 请求
│   ├── useForm.ts    #   表单校验 + 提交
│   └── useAuth.ts    #   登录态检查
├── layout/           # 布局层：侧边栏、顶栏、标签页
├── plugins/          # 插件层：全局注册
│   ├── element-plus.ts
│   └── permission.ts #   全局 v-permission 指令
├── router/           # 路由层：路由配置 + 守卫
├── store/            # 状态层：Pinia store
│   ├── user.ts
│   └── permission.ts
├── types/            # 类型层：全局 TS 类型声明
│   ├── api.d.ts      #   接口返回类型
│   └── global.d.ts   #   全局类型扩展
├── utils/            # 工具层：纯函数、无副作用
│   ├── format.ts     #   日期/金额格式化
│   ├── storage.ts    #   localStorage 封装
│   └── validate.ts   #   表单校验规则
└── views/            # 页面层：路由对应的页面组件
    ├── dashboard/
    └── system/
        ├── user/
        └── role/
```

### 2. 每一层的职责边界

| 层级 | 职责 | 反问自己 |
|------|------|---------|
| `assets` | 图片、字体、全局 SCSS 变量/mixin | 是否有业务逻辑？有 → 放错了 |
| `types` | 所有 `.d.ts`，全局类型、接口返回类型、枚举 | 是否依赖了其他层？有 → 放错了 |
| `utils` | **纯函数**，无副作用，不引用项目内部模块 | 是否操作了 DOM / 引用了 store？有 → 放 hooks |
| `api` | HTTP 请求函数，一个文件一个业务域 | 是否有 UI 逻辑？有 → 放 hooks |
| `hooks` | **有状态/有副作用的逻辑复用**（useXxx） | 是否与具体页面耦合？是 → 放 views 同级 |
| `store` | 跨组件/跨页面的全局共享状态 | 是否只有一个组件用？是 → 放 hooks |
| `components` | 可复用的 UI 单元，接收 props、发射 emit | 是否包含业务请求？是 → 拆到 hooks 里 |
| `views` | 路由对应的页面，组装 components + hooks | 是否直接在 views 里写通用逻辑？是 → 抽到 hooks |
| `layout` | 页面壳子：侧边栏 + 顶栏 + `<router-view>` | 是否写了业务逻辑？有 → 抽到 hooks 或 store |
| `router` | 路由配置 + 导航守卫 | 守卫逻辑是否太重？是 → 抽到 hooks |
| `plugins` | 第三方库的全局安装 + 全局指令/过滤器 | 是否按需引入更好？是 → 别放这里 |

### 3. hooks vs utils：核心区分

这是面试官最爱追问的边界问题。

```ts
// ❌ 错误：把有状态的逻辑放在 utils
// src/utils/table.ts
import { ref } from 'vue'
export function useTable() {           // utils 里不应该有 ref！
  const loading = ref(false)
  // ...
}

// ✅ 正确：utils 只放纯函数
// src/utils/format.ts
export function formatDate(date: Date, pattern = 'YYYY-MM-DD'): string {
  // 纯函数：相同输入 → 相同输出，无副作用
}

// ✅ 正确：有状态的逻辑放 hooks
// src/hooks/useTable.ts
import { ref } from 'vue'
import { getUserList } from '@/api/user'
export function useTable() {
  const loading = ref(false)
  const data = ref([])
  async function fetchData(params: any) {
    loading.value = true
    data.value = await getUserList(params)
    loading.value = false
  }
  return { loading, data, fetchData }
}
```

**一句话判断**：如果函数体内出现了 `ref` / `reactive` / `onMounted` / `useRouter` / `useStore` 等 Vue API，请放在 `hooks/`；如果函数从头到尾都是纯计算，放在 `utils/`。

### 4. components vs views：什么时候拆

| 场景 | 放哪里 |
|------|--------|
| 只在某一个页面使用的子模块 | `views/user/components/UserForm.vue` |
| 两个以上页面/模块复用 | `components/business/UserForm.vue` |
| 纯 UI 无业务语义 | `components/common/BaseDialog.vue` |

**原则**：出现第二次再抽象。别过早把只在一个页面用的组件提到 `components/`，增加心智负担。

---

## 深度拓展

### 追问：依赖方向为什么重要？

```
router  ───────────────┐
layout ──────────────┐ │
views  ────────────┐ │ │
components ──────┐ │ │ │
hooks ─────────┐ │ │ │ │
store ──────┐ │ │ │ │ │
api ──────┐ │ │ │ │ │ │
utils ──┐ │ │ │ │ │ │ │
types ─┐ │ │ │ │ │ │ │ │
assets ──┘ │ │ │ │ │ │ │ │
           ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼
       依赖方向：上层 → 下层
```

**下层绝不引用上层**，否则会出现：
- 循环依赖（`api` 引了 `store`，`store` 又引了 `api`）
- 无法单独测试（`utils` 测试需要启动整个 Vue 应用）
- 无法跨项目复用（`utils` 强耦合了业务 component）

检测工具：`madge --circular src/` 可以扫描循环依赖。

---

## 项目实战

```ts
// 后台管理系统中的分层示例
// ── api/user.ts ──
export function getUserList(params: PageParams) {
  return request.get<PageResult<User>>('/api/users', { params })
}

// ── hooks/useUserList.ts ──
export function useUserList() {
  const loading = ref(false)
  const list = ref<User[]>([])
  const total = ref(0)
  const query = reactive({ page: 1, size: 10, keyword: '' })

  async function fetch() {
    loading.value = true
    const { data } = await getUserList(query)
    list.value = data.records
    total.value = data.total
    loading.value = false
  }

  return { loading, list, total, query, fetch }
}

// ── views/system/user/index.vue ──
<script setup lang="ts">
const { loading, list, total, query, fetch } = useUserList()

onMounted(() => fetch())
</script>
```

每一层只做自己该做的事：`api` 只定义请求、`hooks` 封装状态和副作用、`views` 只做组装。

---

## 易错点

1. **❌ hooks 里直接操作 DOM**：hooks 应该操作状态，DOM 操作留给组件 template 或指令。
2. **❌ api 层引入 store 做 token 拼接**：token 应该通过 axios 拦截器统一注入，api 文件不感知。
3. **❌ 所有组件都往 `components/` 塞**：导致 `components/` 下有 80+ 个文件，比 `views/` 还大。
4. **❌ `utils/` 里写 `export const BASE_URL = '...'`**：这是配置，放 `config/` 或环境变量，不是工具函数。

---

## 面试信号

能清晰说出下面三句话，架构分层这一关必过：

1. **"上层依赖下层，下层不引用上层"** —— 说出依赖方向
2. **"hooks 存放有副作用的逻辑复用，utils 存放纯函数"** —— 说出 hooks vs utils 边界
3. **"api 层只定义请求函数，不做状态管理"** —— 说出 api vs hooks 边界

---

## 相关阅读

- [组件设计](./component-design.md) — components 层的内部设计原则
- [模块解耦](./module-decoupling.md) — 跨层、跨模块的通信方式
- [Monorepo](./monorepo.md) — 当项目大到需要拆成多个包时的组织方式

---

## 更新记录

- 2026-07-06：完成内容填充，新增每层职责边界表、hooks vs utils 核心区分、依赖方向图

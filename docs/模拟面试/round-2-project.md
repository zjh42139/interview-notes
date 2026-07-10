---
title: 二面：项目经验
description: 项目架构深挖 + 权限系统 + 请求封装 + 性能优化 + 工程化 + 方案设计，60分钟全流程脚本
category: 模拟面试
type: interview
score: 0
difficulty: 中高级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-05
updated: 2026-07-05
reviewed: 2026-07-05
tags:
  - 项目
  - 架构
  - 权限
  - 性能优化
  - 工程化
---

# 二面：项目经验深挖模拟面试（60 分钟）

## 面试整体说明

**面试定位**：二面（项目经验面）是整个面试流程中最关键的一轮。一面考察基础，二面考察深度，三面考察软素质。二面的核心目标是判断候选人是否**真正在项目中做过有深度的技术决策**，而非仅仅 "用过" 这些技术。

**面试时长**：60 分钟，分为 6 个阶段，每个阶段有严格的时间控制。

**评分维度**：

| 维度 | 权重 | 说明 |
|------|------|------|
| 项目深度 | 35% | 对项目的理解是否停留在表面，能否讲出架构设计的原因和权衡 |
| 技术广度 | 25% | 能否由点到面，从实际需求牵引出相关技术领域的知识 |
| 工程化思维 | 20% | 是否有规范化、自动化、可维护性的意识 |
| 方案设计能力 | 15% | 面对开放问题，能否给出合理的技术方案 |
| 沟通表达 | 5% | 逻辑是否清晰，能否把复杂问题讲清楚 |

**评级标准**：

| 评级 | 总分 | 典型表现 |
|------|------|----------|
| S (卓越) | 90+ | 能讲出技术选型的深层权衡，对边界情况有充分的考虑，方案设计有量化指标和降级策略 |
| A (优秀) | 80-89 | 有清晰的架构思维，能回答大部分追问，方案设计合理但细节有欠缺 |
| B (合格) | 65-79 | 能描述做了什么但讲不清为什么，追问时出现多处卡顿，方案设计有漏洞 |
| C (不通过) | <65 | 只讲功能、不讲架构，多个核心问题无法回答，方案设计无从下手 |

---

## 第一阶段：项目架构介绍（0-10 分钟）

### 环节目标

通过候选人对项目的自主介绍，快速建立对其全局架构能力的第一印象。这是面试的 "定调" 环节 -- 前 10 分钟的表现基本决定了后续问题的深浅。

### 面试官话术

> "首先请你用 5 到 8 分钟介绍一下你做过的最有挑战的项目。我希望听到项目背景、整体架构、技术选型和你在其中的角色。画图或口述都可以。如果画图的话，可以边画边讲。"

**面试官内心 OS**：
- 如果候选人一上来就讲 "我做了登录、列表、表单"，基本判定初级；合格的中级候选应该从**业务背景 -> 技术架构 -> 关键决策**这个逻辑链展开
- 注意听候选人是否主动提到**技术选型的理由**，主动提 = 有 Owner 意识；被动答 = 可能就是执行者
- 观察候选人是否使用 "我们" 还是 "我" -- "我们" 过多的候选人可能参与深度有限
- 架构图是否包含：前端层、API 层、认证层、状态管理、路由设计、构建部署 -- 缺的越多，全局观越弱
- 画图过程中是否能解释 **为什么** 这样分层、**为什么** 这样划分模块

### 引导追问（根据候选人的介绍灵活插入）

**追问 A**（考察架构思维）：
> "你提到使用了 Pinia，为什么选择 Pinia 而不是 Vuex？做这个决策时你参考了什么因素？"

**追问 B**（考察技术视野）：
> "如果让你用 React 重新做这个项目，哪些部分的实现方式会完全不同？哪些部分基本一样？"

**追问 C**（考察反思能力）：
> "项目做到现在，如果让你重新做一些技术选型，有哪些会改变？为什么？"

### 预期回答框架（优秀）

一个优秀候选人的开场应该这样展开：

**1. 项目背景（30 秒）**：
- 项目名称、面向用户、核心业务场景
- 我的角色：前端负责人 / 核心开发，负责 X 个模块

**2. 整体架构（2-3 分钟）**：

```
用户端（Browser）
    │
    ▼
CDN（静态资源：HTML/CSS/JS/图片）
    │
    ▼
Nginx（反向代理 + Gzip + 路由转发）
    │
    ├──▶ 前端应用（SPA - Vue3 + TS + Vite）
    │       ├── 路由层：vue-router (动态路由 + 路由守卫)
    │       ├── 状态层：Pinia (模块化 store)
    │       ├── 组件层：Element Plus + 自研业务组件
    │       ├── 工具层：Axios 封装 + 权限指令 + 工具函数
    │       └── 构建层：Vite + esbuild + rollup
    │
    └──▶ 后端 API 网关
            ├── 用户服务
            ├── 权限服务
            ├── 业务服务 A/B/C
            └── ...
```

**3. 技术选型理由（2-3 分钟）**：

| 技术 | 为什么选 | 对比方案 | 选型理由 |
|------|---------|----------|----------|
| Vue3 | 团队技术栈 + 生态成熟 | React | Vue3 Composition API 和 `<script setup>` 语法糖对中小团队更友好，学习曲线平缓；React 在大型项目中状态管理方案碎片化问题突出 |
| TypeScript | 类型安全 + 智能提示 | JavaScript | 中大型管理后台，类型系统能**大幅减少运行时错误**，配合 VSCode 显著提升开发体验 |
| Element Plus | 功能完备 + 社区活跃 | Ant Design Vue / Naive UI | Element Plus 对 Vue3 支持最早也最稳定，组件覆盖度高，特别是 Table/Form 等复杂组件；Ant Design Vue 文档对中文开发者友好度稍低 |
| Pinia | Vue3 官方推荐 | Vuex 4 | Pinia 完全支持 TS 类型推导，无需嵌套模块，API 比 Vuex 简洁 50% 以上，且对 Composition API 风格更友好 |
| Vite | 开发体验极快 | Webpack | Vite 利用浏览器原生 ESM 实现 HMR 秒级响应，开发体验质的飞跃；Webpack 配置复杂、启动慢，进入维护模式的趋势明显 |
| pnpm | 磁盘效率 + 严格的依赖管理 | npm / yarn | pnpm 的硬链接机制节省 50%+ 的磁盘空间，且严格的 node_modules 结构避免幽灵依赖问题 |

**追问 C 的预期回答**（反思能力）：
- 如果重新选型：组件库可能会考虑 Naive UI（对 TS 支持更好，Tree-shaking 更彻底）；状态管理如果项目再大一些可能引入状态机（XState）来处理复杂 UI 状态流转
- 不会改变的：Vue3 + TS + Vite + Pinia 这套组合拳，经过验证非常适合中后台场景

### 评分标准

| 分数 | 表现 |
|------|------|
| 90-100 | 主动画出架构图，分层清晰，技术选型有**多方案对比**和**量化理由**，能说出未选方案的具体缺陷 |
| 75-89 | 能清晰描述架构，技术选型有理由但缺少对比，反思追问时能给出 1-2 个改进点 |
| 60-74 | 能描述做了什么但架构图需要引导才能画完整，技术选型理由停留在 "官网推荐的" / "大家都在用" |
| <60 | 只能讲功能点，画不出架构图，技术选型完全说不清理由，角色定位模糊（"我们一起做的"） |

---

## 第二阶段：权限系统深挖（10-20 分钟）

### 环节目标

权限系统是中后台项目的核心基础设施，这一环节考察候选人是否真正**设计并实现**过完整的权限体系，还是仅仅 "用过现成的框架"。从模型设计到代码实现，从正常流程到异常边界，逐步加压。

---

### Q1：RBAC 权限模型设计（10-14 分钟）

#### 面试官话术

> "请详细描述你项目的权限模型。用户、角色、权限之间是什么关系？菜单权限、路由权限、按钮权限分别是怎么实现的？从用户登录到看到一个完整的页面，权限校验经历了哪些步骤？"

**面试官内心 OS**：
- 能画出 ER 图（用户 -- 角色 -- 权限，多对多关系）是基本要求
- 真正有经验的候选人会补充：权限还可以分组（权限菜单树），角色可以有继承关系，部门数据权限等扩展
- 看是否主动区分 "前端权限"（UI 展示控制）和 "后端权限"（API 鉴权），这是区分 "用过" 和 "设计过" 的关键
- 如果只讲 `v-if` 控制按钮显隐，不提后端二次校验 -- 安全意识薄弱

#### 预期回答

**1. RBAC 模型（Role-Based Access Control）**：

```
┌──────────┐    多对多    ┌──────────┐    多对多    ┌──────────────┐
│   用户    │◄──────────►│   角色    │◄──────────►│    权限       │
│  User    │             │  Role    │             │  Permission   │
└──────────┘             └──────────┘             └──────────────┘
                                                       │
                                      ┌─────────────────┼─────────────────┐
                                      │                 │                 │
                                      ▼                 ▼                 ▼
                                菜单权限            按钮权限           API权限
                            (menu:user:list)   (btn:user:add)   (api:/user/delete)
```

核心思想：不直接将权限授予用户，而是通过角色作为中介。这样当组织架构变化时，只需要调整用户的角色，而不需要逐个修改权限。

**2. 前端权限实现的三层控制**：

**第一层：路由权限**
```
用户登录 → 后端返回权限标识列表 → 前端根据权限标识过滤 asyncRoutes
→ router.addRoute() 动态注册 → 导航守卫 beforeEach 拦截
```

代码实现要点：
- 后端返回的权限标识格式：`['system:user:list', 'system:user:add', 'system:user:delete', 'system:role:list']`
- 前端定义完整的 asyncRoutes，每个路由配置 `meta.permission` 字段
- 写一个 `filterRoutes(routes, permissions)` 递归函数过滤出有权限的路由
- 调用 `router.addRoute()` 逐一注册（注意：需要把 404 路由最后注册）

**第二层：菜单权限**
- 侧边栏菜单从过滤后的路由表中递归生成
- 只有当前用户有权限的路由才会渲染为菜单项
- 菜单的打开/折叠状态同步到路由，保证刷新后状态恢复

**第三层：按钮权限**
- 通过自定义指令 `v-permission="'system:user:add'"` 控制按钮显隐
- 也支持函数式：`checkPermission('system:user:add')` 在 script 中使用
- **关键**：前端按钮权限只是**用户体验优化**，真正的安全控制在后端 API 层 -- 即使按钮被隐藏，API 仍需要校验

**3. 权限校验完整流程**（从登录到页面渲染）：

```
Step 1: 用户输入账号密码 → 调用登录接口
Step 2: 后端验证成功 → 返回 accessToken + refreshToken
Step 3: 前端存储 Token，调用获取用户信息接口
Step 4: 后端返回用户信息（含角色）+ 权限标识列表（permissions 字段）
Step 5: 前端将权限列表存入 Pinia store + sessionStorage（防止刷新丢失）
Step 6: 根据权限列表过滤 asyncRoutes → 调用 addRoute() 注册
Step 7: 导航到首页或指定页面
Step 8: beforeEach 守卫：每次路由跳转检查目标页面是否需要权限
          ├── 不需要权限（如 404/登录页）→ 放行
          ├── 需要权限但未登录 → 跳转登录页
          └── 需要权限且已登录 → 检查权限 → 有权限放行 / 无权限跳转 403
Step 9: 页面内 v-permission 指令控制按钮级别显隐
```

#### 参考答案路径
- [权限系统 RBAC 模型](../项目实战/权限系统/permission-rbac.md)
- [动态路由实现](../项目实战/权限系统/dynamic-route.md)

#### 追问 1：用户登出再登入，权限变了但菜单没变怎么处理？

> "场景：管理员在后台修改了某个用户的角色（减少了权限），该用户登出后重新登录，应该看不到某些菜单了。这个流程你是怎么保证不出问题的？"

**预期回答**：
- 登录时**必须清空旧状态**：`router = createRouter()` 重新创建路由实例，或者手写 `resetRouter()` 函数遍历移除所有动态添加的路由
- Pinia store 在登录时重置所有权限相关 state
- sessionStorage/localStorage 中的旧权限数据在登出时清除、登录时重新写入
- 如果使用 `router.addRoute()` 动态注册，需要维护一个 `addedRoutes` 数组，以便在重置时逐个移除

**关键代码思路**：
```typescript
// 重置路由的核心函数
export function resetRouter() {
  const router = useRouter()
  // 移除所有动态添加的路由
  addedRoutes.forEach((route) => {
    router.removeRoute(route.name as string) // Vue Router 4.x
  })
  addedRoutes.length = 0
}
```

#### 追问 2：前端权限被绕过怎么办？

> "用户如果通过浏览器 DevTools 修改了前端代码，或者直接 curl 调用 API，前端的权限控制就失效了。你怎么看待这个问题？"

**预期回答**：
- 前端权限是**防君子不防小人**，本质是 UX 层面的优化 -- 让用户不看到无权限的功能
- **真正的安全边界在后端**：所有 API 请求都必须经过后端鉴权中间件，验证该用户是否有权限执行此操作
- 这是典型的 "前端验证 + 后端鉴权" 双层保障模式
- 实践中：前端控制 UI 显示（减少困惑），后端返回 403 并记录日志（安全兜底）

#### 评分标准

| 分数 | 表现 |
|------|------|
| 90-100 | 清晰画出 RBAC 的 ER 图，能区分三层权限控制（路由/菜单/按钮），主动说明前后端双重校验的必要性，追问回答有代码级别的解决方案 |
| 75-89 | 能描述 RBAC 模型，三层权限逻辑完整但某层细节不够深入，意识到前后端双重校验但没主动提及 |
| 60-74 | 能讲出角色-权限关系但模型理解有误（如把角色和权限混为一谈），实现细节需引导补充 |
| <60 | 没有权限模型概念，只做过简单的 if/else 控制，路由权限和按钮权限的实现逻辑说不清楚 |

---

### Q2：动态路由与权限缓存（14-18 分钟）

#### 面试官话术

> "动态路由具体是怎么注册的？从后端拿到权限数据后，到用户能访问页面，中间经过了哪些处理？权限数据存在哪里？用户刷新页面后怎么恢复权限状态？404 路由怎么处理？"

**面试官内心 OS**：
- 动态路由是权限系统的核心实现，能完整描述这个过程 = 确确实实做过
- 注意问 "存哪里" -- 看是否考虑过安全性（localStorage XSS 风险 vs sessionStorage）
- 追问 "刷新后怎么恢复" -- 是重新请求还是缓存，体现了候选人对用户体验和性能的考量
- "404 怎么处理" 看似简单，实则考察对 Vue Router 路由匹配机制的理解

#### 预期回答

**1. 动态路由注册完整流程**：

```
                           ┌─────────────────────────────────┐
                           │     router/index.ts              │
                           │                                  │
                           │  constantRoutes (公共路由)        │
                           │  ├── /login                      │
                           │  ├── /404                        │
                           │  └── /                           │
                           │                                  │
                           │  asyncRoutes (需权限的动态路由)    │
                           │  ├── /system                     │
                           │  │   ├── /user (meta: system:user)│
                           │  │   └── /role (meta: system:role)│
                           │  └── /dashboard                   │
                           └─────────────────────────────────┘
                                          │
                                          ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Permission   │───▶│  filterRoutes()  │───▶│ addRoute()      │
│ Store        │    │  (递归过滤)       │    │ (逐个动态注册)    │
│ permissions[]│    │                  │    │                  │
└──────────────┘    └──────────────────┘    └──────────────────┘
```

**关键代码思路**：

```typescript
// 递归过滤有权限的路由
function filterAsyncRoutes(routes: RouteRecordRaw[], permissions: string[]): RouteRecordRaw[] {
  return routes.reduce<RouteRecordRaw[]>((acc, route) => {
    const cloned = { ...route }
    // 如果路由有 children，递归过滤
    if (cloned.children) {
      cloned.children = filterAsyncRoutes(cloned.children, permissions)
      // 如果子路由全部被过滤掉，该父路由也不保留
      if (cloned.children.length === 0) return acc
    }
    // 检查该路由是否需要权限
    const perm = (cloned.meta as any)?.permission
    if (perm && !permissions.includes(perm)) return acc
    // 不需要权限 或 有权限
    acc.push(cloned)
    return acc
  }, [])
}

// 注册过滤后的路由
function registerRoutes(filteredRoutes: RouteRecordRaw[]) {
  filteredRoutes.forEach((route) => {
    router.addRoute(route) // Vue Router 4.x
  })
  // 重点：404 路由必须最后注册，否则会匹配所有未定义的路由
  router.addRoute({
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
  })
}
```

**2. 权限数据存储策略**：

| 存储位置 | 用途 | 生命周期 | 安全性 |
|----------|------|----------|--------|
| Pinia Store | 运行时权限判断（v-permission 指令读取） | 页面关闭即清除 | 高（内存中） |
| sessionStorage | 页面刷新后恢复权限（避免重新请求） | 关闭标签页即清除 | 中（不会被 XSS 跨域读取） |

**注意**：不建议将敏感权限数据存到 localStorage，因为 localStorage 在多个标签页之间共享且不会被自动清除；sessionStorage 更安全 -- 关闭标签即清除，也不会被其他标签页读取。更不建议存 token 到 localStorage -- 存在 XSS 攻击窃取风险。

**3. 页面刷新后的权限恢复**：

两种方案：

**方案 A -- 重新请求（推荐，数据更可靠）**：
- 在 App.vue 的 `onMounted` 或路由守卫中检查 pinia store 是否为空
- 如果为空（刚刷新），调用 `getUserPermissions()` 接口重新获取
- 重新执行 filterRoutes + addRoute 流程
- 优点：权限永远是最新的；缺点：多一次请求

**方案 B -- 缓存恢复（体验更好）**：
- 登录时把 permissions 存入 sessionStorage
- 刷新后从 sessionStorage 读取，验证是否过期
- 如果权限数据存在且未过期，直接恢复
- 如果过期或不存在，走方案 A 重新请求
- 优点：首屏更快；缺点：权限可能不是最新的

**推荐混合方案**：优先从 sessionStorage 恢复（快速渲染），同时在后台异步请求更新权限（保证数据时效性），如果后台返回的权限与缓存不一致，提示用户权限已变更需要重新登录。

**4. 404 路由的处理**：
- 404 路由必须是**最后**一个注册的路由
- Vue Router 匹配是按注册顺序的，如果 404 先注册，会把所有合法路由也匹配掉
- 使用 Vue Router 4 的新语法：`path: '/:pathMatch(.*)*'`
- 404 路由不放在 asyncRoutes 中，而是作为恒定注册的兜底路由
- 注意：如果不小心用 `router.addRoute()` 重复注册了 404，应该先 `removeRoute` 再注册

#### 追问：如果用户直接输入 URL 访问没有权限的页面，在哪里拦截？

> "假如用户 A 只有查看用户列表的权限，但他在地址栏直接输入了 `/user/edit/123`，你的系统在哪个环节把他拦住？"

**预期回答**：
- 拦截发生在 `router.beforeEach` 导航守卫中
- 流程：`beforeEach` → 检查目标路由的 `meta.permission` → 与当前用户的 `permissions` 对比 → 无权限则 `next('/403')` 或 `next(false)` 阻止导航
- 即使绕过了导航守卫（理论上不可能），API 层也会拦截 -- 后端返回 403，前端在响应拦截器中统一处理跳转到 403 页面

#### 评分标准

| 分数 | 表现 |
|------|------|
| 90-100 | 完整描述动态路由注册流程（filterRoutes + addRoute），知道 404 最后注册的原因，能对比不同的权限存储策略并说明选择理由，刷新恢复方案有工程化考量 |
| 75-89 | 流程描述基本完整，知道 404 的处理方式，刷新恢复策略有实现但缺少方案对比 |
| 60-74 | 能描述大致流程，但部分细节错误（如分不清 addRoute 的 parent 参数），存储策略和刷新恢复需引导 |
| <60 | 说不清动态路由的注册流程，不理解刷新后如何恢复权限 |

---

### Q3：按钮级权限 + 权限指令实现（18-20 分钟）

#### 面试官话术

> "你的 v-permission 指令是怎么实现的？和直接使用 v-if 有什么区别？"

**追加追问**：
> "如果后端返回的权限标识是 `'a.b.c'` 这种层级格式，你的指令如何支持通配符或模糊匹配（如 `'a.*'` 匹配 `'a.b.c'` 和 `'a.b.d'`）？"

**面试官内心 OS**：
- 自定义指令是 Vue3 面试的常见考点，但项目面更看重 "为什么需要指令" 而不是 "指令怎么写"
- v-permission vs v-if 的区别是这道题的精华 -- 如果候选人只回答 "指令更方便"，说明没深入思考过
- 通配符追问是**加分项**，考察候选人是否考虑过权限体系的扩展性，只有真正深入做过权限的候选人才会考虑这个问题
- 如果要继续加压，可以追问：粒度细化到表单字段的显示/隐藏/只读，你的设计怎么支持？

#### 预期回答

**1. v-permission 指令实现**：

```typescript
// directives/permission.ts
import type { Directive, DirectiveBinding } from 'vue'
import { usePermissionStore } from '@/stores/permission'

const vPermission: Directive<HTMLElement, string> = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string>) {
    const { value } = binding
    if (!value) return

    const permissionStore = usePermissionStore()
    const hasPermission = permissionStore.permissions.some(
      (perm) => checkPermission(perm, value)
    )

    if (!hasPermission) {
      el.parentNode?.removeChild(el) // 直接移除 DOM
    }
  },
}

/**
 * 权限匹配函数
 * 支持精确匹配和通配符匹配
 * checkPermission('system:user:*', 'system:user:add') → true
 * checkPermission('system:user:add', 'system:user:add') → true
 * checkPermission('system:*', 'system:user:add') → true
 */
function checkPermission(required: string, actual: string): boolean {
  if (required === actual) return true
  // 如果 required 包含通配符 *
  if (required.includes('*')) {
    const regex = new RegExp('^' + required.replace(/\*/g, '.*') + '$')
    return regex.test(actual)
  }
  return false
}

export default vPermission
```

使用方式：
```html
<!-- 基本用法 -->
<el-button v-permission="'system:user:add'">新增用户</el-button>

<!-- 通配符匹配 -->
<el-button v-permission="'system:user:*'">用户管理相关按钮</el-button>

<!-- 多权限校验（满足任一即可） -->
<el-button v-permission="['system:user:add', 'system:user:import']">批量操作</el-button>
```

**2. v-permission 与 v-if 的核心区别**：

| 维度 | v-permission | v-if |
|------|-------------|------|
| 渲染时机 | 在 mounted 钩子中操作 DOM，**组件已渲染后**再移除 | 在编译阶段决定，**根本不会渲染** |
| 性能 | 组件仍会经历创建和挂载过程，然后被移除（有性能浪费） | 完全跳过创建过程，更优 |
| 语义 | 集中管理权限逻辑，一次修改全局生效 | 散落在各组件中，维护困难 |
| 灵活性 | 可以支持通配符、多权限组合等复杂逻辑 | 只支持简单的布尔判断 |
| 安全性 | DOM 元素存在过可能被 DevTools 看到（很短时间） | 从未渲染，更安全 |

**最佳实践**：
- 对于**重度组件**（如包含数据请求的表格）：优先用 `v-if` + `checkPermission()` 函数，避免不必要的组件创建
- 对于**轻量按钮**：用 `v-permission` 指令，代码更简洁
- 统一用 `checkPermission()` 函数作为核心逻辑，指令和 v-if 共享同一套权限判断

**3. 通配符匹配的增强实现**：

如果后端返回的权限是层级格式 `'a.b.c'`：

```typescript
/**
 * 支持层级通配符匹配
 * 规则：
 *   'a.*'    → 匹配 'a.b', 'a.b.c', 'a.d' 等（单层通配）
 *   'a.**'   → 匹配 'a.b', 'a.b.c', 'a.b.c.d' 等（递归通配）
 *   'a.*.c'  → 匹配 'a.b.c', 'a.x.c' 等
 */
function checkHierarchicalPermission(required: string, actual: string): boolean {
  if (required === actual) return true

  // 将层级字符串转为数组
  const requiredParts = required.split('.')
  const actualParts = actual.split('.')

  // 递归匹配
  return matchParts(requiredParts, actualParts, 0, 0)
}

function matchParts(
  required: string[],
  actual: string[],
  ri: number,
  ai: number
): boolean {
  // required 已全部匹配完
  if (ri >= required.length) return ai >= actual.length

  // 处理 ** 递归通配
  if (required[ri] === '**') {
    if (ri === required.length - 1) return true // ** 在最后，匹配所有
    // 尝试所有可能的匹配位置
    for (let i = ai; i < actual.length; i++) {
      if (matchParts(required, actual, ri + 1, i)) return true
    }
    return false
  }

  // actual 已结束但 required 还有内容
  if (ai >= actual.length) return required[ri] === '*'

  // 精确匹配或 * 通配
  if (required[ri] === '*' || required[ri] === actual[ai]) {
    return matchParts(required, actual, ri + 1, ai + 1)
  }

  return false
}
```

#### 评分标准

| 分数 | 表现 |
|------|------|
| 90-100 | 能写出指令的完整实现，清楚区分 v-permission 和 v-if 的使用场景，能实现通配符/层级匹配，甚至考虑到移除 DOM 后组件生命周期的问题 |
| 75-89 | 指令实现基本正确，知道与 v-if 的区别但不够深入，通配符思路有但实现细节模糊 |
| 60-74 | 使用过权限指令但自己没有实现过，讲不清指令的核心钩子函数 |
| <60 | 不知道自定义指令是什么，按钮权限只会用 v-if |

---

## 第三阶段：Axios 封装深挖（20-30 分钟）

### 环节目标

Axios 封装是前端基础设施的典型代表，看似简单但能考察出候选人对异步流程控制、错误处理体系、并发安全等底层能力的理解深度。这一阶段的出题策略：从 "做了什么" 到 "为什么这样做" 到 "极端场景怎么处理"。

---

### Q4：请求拦截器设计（20-24 分钟）

#### 面试官话术

> "你的 Axios 封装做了哪些事情？请求拦截器和响应拦截器分别处理什么？如果把你的封装方案讲成一个流水线，每个环节做什么？"

**追加追问**：
> "拦截器的执行顺序是怎样的？如果同时注册了 3 个请求拦截器和 2 个响应拦截器，它们的执行顺序是什么？这个你验证过吗？"

**面试官内心 OS**：
- 能讲出拦截器做了哪些事情不难，但能讲清楚 "为什么放在请求拦截器而不是响应拦截器" 才是有思考的
- **拦截器链的执行顺序**是经典面试题，真正研究过 Axios 源码的候选人应该知道：请求拦截器是**后进先执行**（栈），响应拦截器是**先进先执行**（队列）
- 如果候选人只说 "加了 token、处理了错误"，追问 "还有呢？" -- 看是否能补充请求去重、请求取消、并发限制等进阶能力
- 注意观察候选人是否考虑过 axios 实例的**单例设计**以及**请求配置的类型扩展**

#### 预期回答

**1. Axios 封装的完整流水线**：

```
用户调用 API
    │
    ▼
┌─────────────────────────────────────────────────────┐
│ 1. API 函数调用（如 userApi.getList(params)）       │
│    - 类型安全的参数和返回值                           │
└─────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────┐
│ 2. 请求拦截器（Request Interceptor）                 │
│    ├── 附加 Token（Authorization header）           │
│    ├── 添加时间戳（防止 IE 缓存 GET 请求）            │
│    ├── 生成请求唯一 key（用于去重）                   │
│    ├── 设置 loading 状态（可选，全局/局部）           │
│    ├── 处理特殊 Content-Type（multipart/form-data）  │
│    └── 添加公共请求头（X-Request-ID 用于链路追踪）     │
└─────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────┐
│ 3. 发送 HTTP 请求                                    │
└─────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────┐
│ 4. 响应拦截器 - 成功（Response Interceptor Fulfilled）│
│    ├── 解包响应数据（提取 data，抛弃 headers/config） │
│    ├── 业务状态码校验（code !== 0 → 业务错误）        │
│    └── 返回纯净数据给调用方                           │
└─────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────┐
│ 5. 响应拦截器 - 失败（Response Interceptor Rejected） │
│    ├── HTTP 错误分类（4xx / 5xx）                    │
│    ├── 401 → Token 过期 → 触发刷新或跳转登录          │
│    ├── 403 → 权限不足 → 提示 + 跳转 403              │
│    ├── 5xx → 服务器错误 → 提示重试                   │
│    └── Network Error → 网络异常 → 提示检查网络        │
└─────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────┐
│ 6. 业务层接收数据 → 组件状态更新 → UI 渲染           │
└─────────────────────────────────────────────────────┘
```

**2. 拦截器链的执行顺序**：

这是 Axios 的核心设计之一。假设注册了 3 个请求拦截器（R1, R2, R3）和 2 个响应拦截器（S1, S2）：

```
请求拦截器（后进先执行，类似栈）：
  R3 → R2 → R1 → 发送请求

响应拦截器（先进先执行，类似队列）：
  收到响应 → S1 → S2

完整链路：
  R3 → R2 → R1 → [HTTP 请求] → S1 → S2 → 返回给调用方
```

**源码原理**：Axios 内部维护了一个拦截器链条，存储结构如下：

```typescript
// Axios 拦截器内部原理（简化版）
class InterceptorManager {
  handlers: Array<{ fulfilled: Function; rejected: Function }> = []

  use(fulfilled: Function, rejected: Function): number {
    this.handlers.push({ fulfilled, rejected })
    return this.handlers.length - 1
  }
}

// 构建执行链
let chain: Array<any> = [dispatchRequest, undefined] // 实际的请求发送
// 请求拦截器：unshift 到链前端 → 后注册的先执行
requestInterceptorHandlers.forEach(({ fulfilled, rejected }) => {
  chain.unshift(fulfilled, rejected)
})
// 响应拦截器：push 到链后端 → 先注册的先执行
responseInterceptorHandlers.forEach(({ fulfilled, rejected }) => {
  chain.push(fulfilled, rejected)
})

// 依次执行链中的每个 handle
while (chain.length) {
  const fulfilled = chain.shift()
  const rejected = chain.shift()
  promise = promise.then(fulfilled, rejected)
}
```

**实际意义**：
- 请求拦截器后进先执行：如果你需要 "最后注册的拦截器最先处理" 的场景，可以用这个特性。比如先注册一个全局的 loading 拦截器，后注册一个特定的参数转换拦截器 → 参数转换先执行，loading 后执行 → 如果参数转换失败，loading 不会开始
- 响应拦截器先进先执行：数据依次经过每个响应拦截器加工 → 先注册的拦截器先拿到原始数据

**3. 请求封装的其他关键能力**：

```typescript
// 完整的 axios 实例配置
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,                            // 15秒超时
  withCredentials: true,                     // 跨域携带 cookie
  headers: { 'Content-Type': 'application/json' },
})

// 请求拦截器 - Token 注入
service.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // 添加请求 ID 用于链路追踪
  config.headers['X-Request-ID'] = generateRequestId()
  // 记录请求开始时间（用于性能监控）
  config.metadata = { startTime: Date.now() }
  return config
})

// 响应拦截器 - 数据解包 + 错误处理
service.interceptors.response.use(
  (response) => {
    // 请求耗时统计
    const duration = Date.now() - response.config.metadata.startTime
    if (duration > 3000) {
      console.warn(`慢请求告警: ${response.config.url}, 耗时 ${duration}ms`)
    }
    const { data } = response
    // 统一解包
    if (data.code === 0) {
      return data.data
    }
    // 业务错误
    return Promise.reject(new BusinessError(data.code, data.message))
  },
  (error) => {
    // HTTP 错误处理
    if (error.response) {
      const { status } = error.response
      switch (status) {
        case 401: return handleTokenExpired(error)
        case 403: return Promise.reject(new Error('权限不足'))
        case 500: return Promise.reject(new Error('服务器内部错误'))
        default: return Promise.reject(error)
      }
    }
    // 网络错误（无 response）
    return Promise.reject(new Error('网络异常，请检查网络连接'))
  }
)
```

#### 评分标准

| 分数 | 表现 |
|------|------|
| 90-100 | 完整描述拦截器链的 6 个环节，能准确说出拦截器执行顺序（请求后进先执行、响应先进先执行）并知道原理，提到了监控埋点等进阶能力 |
| 75-89 | 拦截器功能描述完整（token、错误处理、loading），知道执行顺序但讲不清原理，缺少进阶能力（如请求追踪） |
| 60-74 | 知道拦截器的基本作用，但功能罗列不全，不清楚拦截器执行顺序 |
| <60 | 只能用默认的 axios，没有封装经验，不知道请求/响应拦截器的区别 |

---

### Q5：Token 刷新与无感续期（24-27 分钟）

#### 面试官话术

> "Token 过期了你怎么处理？如果用户同时打开了 3 个页面，同时发了 3 个请求都返回了 401，你怎么保证只刷新一次 Token？详细描述你的 Token 刷新策略。"

**追加追问 1**：
> "如果 refresh token 也过期了呢？怎么设计 Token 的过期时间比较合理？"

**追加追问 2**：
> "Token 刷新的过程中，新的请求进来了怎么办？是让它等，让它失败，还是直接发出去？"

**面试官内心 OS**：
- 这是二面的**核心区分题**之一。普通候选人会说 "用响应拦截器捕获 401，然后调用刷新接口"；优秀的候选人会描述**并发请求 401 的去重刷新机制**
- `isRefreshing` 标志位 + Promise 队列是经典解法，能设计出来 = 异步流程控制能力过关
- 追问 refresh token 也过期的场景 -- 考察对双 token 机制的理解深度
- 追问 "刷新过程中新请求怎么办" -- 考察对并发安全和用户体验的考虑，这是最能拉开差距的问题

#### 预期回答

**1. 核心问题：多个 401 并发请求导致重复刷新 Token**

场景：用户打开了 3 个标签页 A、B、C，Token 恰好过期。A、B、C 几乎同时发出请求，都收到 401。

**错误做法**：每个请求都独立触发刷新 → 同时发 3 个 refresh 请求 → 后两个 refresh 会因为第一个 refresh 使旧 refreshToken 失效而全部失败 → 用户被踢到登录页。

**正确做法：Promise 队列 + 锁机制**：

```typescript
// token-refresh.ts
import axios, { type AxiosRequestConfig } from 'axios'
import { getToken, setToken, getRefreshToken, removeToken } from './auth'

// 是否正在刷新 Token
let isRefreshing = false
// 等待刷新完成的请求队列（存储 pending 状态的 Promise）
let pendingRequests: Array<{
  resolve: (token: string) => void
  reject: (error: any) => void
}> = []

// 刷新 Token 的函数
async function refreshToken(): Promise<string> {
  const refreshTokenValue = getRefreshToken()
  if (!refreshTokenValue) {
    throw new Error('No refresh token')
  }
  const response = await axios.post('/api/auth/refresh', {
    refreshToken: refreshTokenValue,
  })
  const { accessToken, refreshToken: newRefreshToken } = response.data
  setToken(accessToken)
  if (newRefreshToken) {
    setRefreshToken(newRefreshToken) // 同时刷新 refreshToken（滚动续期）
  }
  return accessToken
}

// 响应拦截器中的 401 处理
service.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error
    if (response?.status !== 401) return Promise.reject(error)
    // 如果是刷新 Token 的请求本身返回 401，说明 refreshToken 也过期了
    if (config.url === '/api/auth/refresh') {
      removeToken()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (!isRefreshing) {
      // ===== 场景 1：我是第一个失败的请求，负责刷新 Token =====
      isRefreshing = true
      try {
        const newToken = await refreshToken()
        // 刷新成功：重新设置请求的 Token 并重试
        config.headers.Authorization = `Bearer ${newToken}`
        // 重试所有排队的请求
        pendingRequests.forEach(({ resolve }) => resolve(newToken))
        pendingRequests = []
        return service(config) // 重试当前请求
      } catch (refreshError) {
        // 刷新失败：通知所有排队的请求失败
        pendingRequests.forEach(({ reject }) => reject(refreshError))
        pendingRequests = []
        removeToken()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    } else {
      // ===== 场景 2：Token 正在刷新中，我把请求加入等待队列 =====
      return new Promise<string>((resolve, reject) => {
        pendingRequests.push({ resolve, reject })
      }).then((newToken) => {
        config.headers.Authorization = `Bearer ${newToken}`
        return service(config) // Token 刷新完成后，用新 Token 重试当前请求
      })
    }
  }
)
```

**流程图**：

```
3 个并发请求同时返回 401

Request A (第一个到达)──→ isRefreshing = false
    │                       ├── 设置 isRefreshing = true
    │                       ├── 调用 refreshToken()
    │                       └── 等待刷新完成...
    │
Request B (第二个到达)──→ 检查 isRefreshing === true
    │                       └── 加入 pendingRequests 队列等待
    │
Request C (第三个到达)──→ 检查 isRefreshing === true
    │                       └── 加入 pendingRequests 队列等待
    │
    ├─── refreshToken() 成功 ───→ 拿到 newToken
    │                              ├── 重试 Request A（携带新 Token）
    │                              ├── 通知 pendingRequests 中所有请求 resolve
    │                              ├── Request B 拿到 newToken，重试
    │                              └── Request C 拿到 newToken，重试
    │
    └─── refreshToken() 失败 ───→ 通知所有 pendingRequests reject
                                    └── 全部跳转登录页
```

**2. 追问 1：如果 refreshToken 也过期了？**

- refreshToken 也过期 = 用户需要**重新登录**
- 在刷新接口本身返回 401 时，判断 `config.url === '/api/auth/refresh'`，直接清除所有 token 并跳转登录页
- **Token 过期时间设计建议**：
  - accessToken：15-30 分钟（短期，降低被盗用的风险窗口）
  - refreshToken：7-14 天（长期，避免频繁登录）
  - 部分高安全场景：accessToken 5 分钟 + refreshToken 1 天 + 滚动续期
  - 滚动续期：每次用 refreshToken 刷新 accessToken 时，也返回一个新的 refreshToken，同时使旧的 refreshToken 失效。这样即使用户长期不登录，只要持续活跃就可以一直保持登录

**3. 追问 2：Token 刷新过程中新的请求（非 401）进来了怎么处理？**

这是最常见的设计争议点，两种做法：

**方案 A -- 等待刷新完成（推荐，体验好）**：
- Token 刷新期间，所有新请求**也加入队列等待**
- 需要一个请求拦截器在发送请求前检查 `isRefreshing` 状态
- 如果正在刷新，将该请求加入 `pendingRequests` 队列
- 刷新完成后，所有排队请求带着新 Token 发出
- 优点：用户体验好，不会出现请求失败；缺点：所有请求都延迟了刷新时间

**方案 B -- 立即发出（旧 Token 也许多了几秒钟有效期）**：
- Token 刷新期间，新请求直接使用旧 Token 发送
- 如果旧 Token 在服务端仍有效（比如刚过期但服务端有一个时钟偏差容忍窗口），请求成功
- 如果旧 Token 无效返回 401，走 `pendingRequests` 排队逻辑
- 优点：简单，不需要额外的排队逻辑

**推荐采用方案 A 的改进版**：在请求拦截器中加入判断，如果 `isRefreshing` 为 true，新请求排队等待。这样保证用户体验的一致性。

```typescript
// 请求拦截器中加入刷新等待逻辑
service.interceptors.request.use((config) => {
  // ... 其他拦截逻辑
  if (isRefreshing && config.url !== '/api/auth/refresh') {
    return new Promise<string>((resolve, reject) => {
      pendingRequests.push({
        resolve: (newToken) => {
          config.headers.Authorization = `Bearer ${newToken}`
          resolve(config)
        },
        reject,
      })
    })
  }
  return config
})
```

#### 答案参考路径
- [认证鉴权/Token 刷新](../项目实战/认证鉴权/token-refresh.md)
- [认证鉴权/登录鉴权](../项目实战/认证鉴权/login-auth.md)

#### 评分标准

| 分数 | 表现 |
|------|------|
| 90-100 | 完整描述 isRefreshing + Promise 队列机制，能处理 refreshToken 也过期的降级逻辑，能讨论 Token 刷新期间新请求的处理策略并有方案对比 |
| 75-89 | 知道用标志位避免重复刷新，但 Promise 队列逻辑表述不够清晰，refreshToken 过期的处理方案正确但缺少细节 |
| 60-74 | 知道捕获 401 后调用刷新接口，但没想到并发 401 的去重问题，追问后才意识到 |
| <60 | 只知道 Token 过期跳转登录页，完全没有刷新机制的设计思路 |

---

### Q6：请求去重与错误处理（27-30 分钟）

#### 面试官话术

> "如何防止用户快速点击导致的重复提交？业务错误（如 '用户名已存在'）和网络错误（如 '请求超时'）你怎么区分处理？"

**追加追问**：
> "CancelToken 和 AbortController 的区别是什么？Vue3 中如何做全局的错误捕获？"

**面试官内心 OS**：
- 请求去重看似简单，但实现方式反映了工程思维：是前端拦截还是后端幂等？是按钮级控制还是请求级控制？
- 错误分类是基本功，合格的候选人应该能按 "网络层 -> HTTP 层 -> 业务层" 三层分类
- AbortController 是 CancelToken 的替代方案（基于 Web API 标准），知道区别说明有关注前端标准演进
- Vue3 全局错误捕获有多个层级：`app.config.errorHandler` + `window.onerror` + `unhandledrejection` + 组件级 `onErrorCaptured`

#### 预期回答

**1. 防重复提交的多层策略**：

**层级一：UI 层防抖（最基础）**：
```html
<el-button
  type="primary"
  :loading="submitLoading"
  @click="handleSubmit"
>
  提交
</el-button>
```
```typescript
const submitLoading = ref(false)
async function handleSubmit() {
  if (submitLoading.value) return // 防止重复点击
  submitLoading.value = true
  try {
    await submitApi(data)
    ElMessage.success('提交成功')
  } finally {
    submitLoading.value = false // 确保无论如何都会恢复按钮状态
  }
}
```

**层级二：请求层去重（拦截器实现）**：

```typescript
// request-dedup.ts
import type { AxiosRequestConfig } from 'axios'

// 存储正在进行的请求
const pendingRequests = new Map<string, AbortController>()

// 生成请求唯一标识
function getRequestKey(config: AxiosRequestConfig): string {
  const { method, url, params, data } = config
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&')
}

// 添加请求到 pending 列表（如果已存在则取消之前的）
function addPending(config: AxiosRequestConfig): void {
  const key = getRequestKey(config)
  // 如果已有相同的请求在进行中，取消它
  if (pendingRequests.has(key)) {
    const controller = pendingRequests.get(key)!
    controller.abort() // 取消前一个请求
  }
  // 创建新的 AbortController
  const controller = new AbortController()
  config.signal = controller.signal // 绑定到请求
  pendingRequests.set(key, controller)
}

// 请求完成后从 pending 列表移除
function removePending(config: AxiosRequestConfig): void {
  const key = getRequestKey(config)
  pendingRequests.delete(key)
}
```

**层级三：后端幂等性（终极方案）**：
- 前端防重只能防一部分场景（如用户打开两个标签页同时提交，前端无法感知）
- 后端应该通过**幂等键**（如订单号 + 时间戳生成唯一 key）来保证同一操作的幂等性
- 前端传唯一请求 ID（如 UUID），后端用 Redis 记录并做幂等判断

**2. 错误分类处理体系**：

```
错误层级                    处理策略                    用户提示
┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│ 网络层错误       │     │ 重试机制＋         │     │ "网络异常，    │
│ Network Error   │───▶ │ 提示检查网络       │───▶ │ 请检查网络    │
│ Timeout         │     │                   │     │ 连接"         │
└─────────────────┘     └──────────────────┘     └──────────────┘

┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│ HTTP 层错误      │     │                   │     │              │
│ 400 Bad Request │───▶ │ 按状态码分类处理    │───▶ │ 具体提示      │
│ 401 Unauthorized│     │                   │     │              │
│ 403 Forbidden   │     │                   │     │              │
│ 404 Not Found   │     │                   │     │              │
│ 500 Server Error│     │                   │     │              │
└─────────────────┘     └──────────────────┘     └──────────────┘

┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│ 业务层错误       │     │                   │     │ "用户名已     │
│ code !== 0      │───▶ │ 按业务错误码处理    │───▶ │ 存在"         │
│                 │     │                   │     │              │
└─────────────────┘     └──────────────────┘     └──────────────┘
```

**完整实现**：

```typescript
// 自定义错误类
class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

class BusinessError extends Error {
  constructor(
    public code: number,
    message: string
  ) {
    super(message)
    this.name = 'BusinessError'
  }
}

// 统一错误处理
function handleError(error: any): void {
  // 1. 请求被取消（AbortController）-- 不需要处理
  if (axios.isCancel(error)) return

  // 2. 网络层错误
  if (!error.response || error.message.includes('Network Error')) {
    ElMessage.error('网络异常，请检查网络连接')
    return
  }
  if (error.message.includes('timeout')) {
    ElMessage.error('请求超时，请稍后重试')
    return
  }

  // 3. HTTP 层错误
  const { status } = error.response
  switch (status) {
    case 400: ElMessage.error('请求参数有误'); break
    case 401: /* Token 刷新逻辑 - 见 Q5 */ break
    case 403: ElMessage.error('没有操作权限'); router.push('/403'); break
    case 404: ElMessage.error('请求的资源不存在'); break
    case 500: ElMessage.error('服务器繁忙，请稍后再试'); break
    default: ElMessage.error(`请求失败: ${status}`)
  }
}

// 在响应拦截器中调用
service.interceptors.response.use(
  (response) => {
    if (response.data.code !== 0) {
      // 业务层错误
      const bizError = new BusinessError(response.data.code, response.data.message)
      ElMessage.error(bizError.message)
      return Promise.reject(bizError)
    }
    return response.data.data
  },
  (error) => {
    handleError(error)
    return Promise.reject(error)
  }
)
```

**3. 追问：CancelToken 和 AbortController 的区别**：

| 维度 | CancelToken (Axios 0.x) | AbortController (Axios 0.22+/1.x) |
|------|------------------------|----------------------------------|
| 来源 | Axios 内部实现 | Web API 标准（WHATWG Fetch） |
| 用法 | `new CancelToken(cancel => ...)` | `new AbortController()` → `controller.signal` |
| 兼容性 | 仅 Axios 内有效 | 同时适用于 axios 和 fetch |
| 标准化 | 非标准，Axios 专属 | 浏览器/Node.js 原生支持 |
| 推荐 | 已被 Axios 官方标记为废弃 | **推荐使用** |

```typescript
// CancelToken（旧）
const source = axios.CancelToken.source()
axios.get('/api/data', { cancelToken: source.token })
source.cancel('Operation canceled')

// AbortController（新）
const controller = new AbortController()
axios.get('/api/data', { signal: controller.signal })
controller.abort() // 取消请求
```

**4. 追问：Vue3 中全局错误捕获**：

```typescript
// 1. Vue 应用级错误处理器（组件渲染、侦听器、生命周期等）
app.config.errorHandler = (err, instance, info) => {
  console.error('[Vue Error]', err)
  // 上报到监控平台（Sentry / 自建平台）
  reportError(err, { instance, info })
  // 对于特定类型错误，给用户友好提示
  if (err instanceof TypeError) {
    ElMessage.error('页面出现异常，请刷新重试')
  }
}

// 2. Promise 未捕获异常
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Rejection]', event.reason)
  reportError(event.reason)
  event.preventDefault() // 阻止默认的控制台错误
})

// 3. 全局 JS 运行时错误（如语法错误、引用错误）
window.onerror = (message, source, line, col, error) => {
  console.error('[Global Error]', error)
  reportError(error)
  return true // 阻止浏览器默认错误提示
}

// 4. 组件级错误边界（Error Boundary）
// Vue3 没有 React 那样的 Error Boundary 组件，但可以用 onErrorCaptured
// composables/useErrorBoundary.ts
export function useErrorBoundary() {
  onErrorCaptured((err, instance, info) => {
    console.error('[Component Error]', err)
    // 处理错误，阻止向上传播
    return false
  })
}
```

#### 答案参考路径
- [基础设施/请求去重](../项目实战/基础设施/request-dedup.md)
- [信息安全/Token 安全存储](../安全/token-storage.md)

#### 评分标准

| 分数 | 表现 |
|------|------|
| 90-100 | 能区分三层防重策略（UI/请求/后端幂等），错误分类体系完整（三层），知道 AbortController 替代 CancelToken 的原因，全局错误捕获层级完整 |
| 75-89 | 防重方案正确但偏向一层（缺少多层思维），错误处理有分类但缺少自定义错误类的设计，AbortController 知道但没对比过 |
| 60-74 | 知道用 loading 状态防重，错误处理散乱在各组件中缺少统一封装，不知道 AbortController |
| <60 | 没有防重意识，错误处理直接 `console.log`，不理解错误分类的必要性 |

---

## 第四阶段：性能优化深挖（30-40 分钟）

### 环节目标

性能优化是前端进阶的必修课。这一阶段从首屏优化（场景驱动）到打包优化（构建层面）到运行时性能（渲染优化），覆盖性能优化的三个核心维度。

---

### Q7：首屏优化（30-34 分钟）

#### 面试官话术

> "你们项目的首屏加载时间是多少？做过哪些优化？优化效果是怎么量化的？有没有做过 A/B 对比？"

**追问 1**：
> "路由懒加载的魔法注释是什么？预加载和 prefetch 有什么区别？"

**追问 2**：
> "如何在构建时分析哪个包最大？你用什么工具？"

**面试官内心 OS**：
- "做过哪些优化" 是第一层，能列出来不难；**"效果怎么量化"** 才能看出是否专业
- 真正优秀的候选人会说 "优化前 Lighthouse 得分 45，首屏 3.2s；优化后得分 82，首屏 1.1s" -- 有数据支撑的优化才叫优化
- 追问 1 考察的是对 Webpack/Vite 底层机制的理解，如果只知道 `() => import()` 但不知道 Magic Comments，说明止步于 "能用"
- 追问 2 考察构建分析工具的掌握，这是做打包优化的第一步

#### 预期回答

**1. 首屏优化全景图**：

```
                      首屏时间 = DNS + TCP + SSL + TTFB + DOM解析 + 资源加载 + JS执行 + 渲染

优化方向 1：网络传输         优化方向 2：资源加载         优化方向 3：渲染
├── CDN 加速                ├── 路由懒加载              ├── 骨架屏/SSR
├── HTTP/2 (多路复用)        ├── 组件异步加载            ├── 首次内容绘制优化
├── Gzip/Brotli 压缩         ├── 图片懒加载/WebP         ├── 关键 CSS 内联
├── 合理的缓存策略            ├── 预加载关键资源            ├── JS 执行优化
└── DNS Prefetch            └── Tree Shaking            └── requestIdleCallback
```

**2. 具体优化措施与量化效果**：

| 优化项 | 优化前 | 优化后 | 具体手段 |
|--------|--------|--------|----------|
| **路由懒加载** | 所有路由打包到一个 chunk (~2.8MB) | 按路由拆分成 15+ 个独立 chunk (首屏 ~800KB) | `() => import('@/views/xxx.vue')` |
| **Element Plus 按需导入** | 全量引入 ~1.2MB | 按需引入 ~380KB | `unplugin-vue-components` + `unplugin-auto-import` |
| **CDN + Gzip** | 服务器直出，无压缩 2.8MB | CDN + Brotli 压缩后 ~400KB | Nginx 配置 `gzip_static on` + `brotli_static on` |
| **图片优化** | PNG/JPG 大图 300KB+ | WebP 格式 50KB+ 懒加载 | `v-lazy` 指令 + 构建时自动转 WebP |
| **预加载关键资源** | 浏览器自然发现 | DNS Prefetch + Preload 关键 JS/CSS | `<link rel="preload">` + `<link rel="dns-prefetch">` |
| **首屏骨架屏** | 白屏等待 2s+ | 骨架屏即时渲染 | 手写 Skeleton 组件 |

**3. 量化方法与工具**：

- **Lighthouse**（Chrome DevTools）：得到 Performance / Accessibility / Best Practices / SEO 四项分数
- **WebPageTest**：模拟不同网络环境（3G/4G/WiFi）和地理位置下的加载表现
- **Chrome Performance 面板**：分析具体是哪个阶段慢（网络？JS 执行？渲染？）
- **Performance API**：在代码中埋点上报真实用户数据（RUM - Real User Monitoring）

```typescript
// 真实用户性能监控
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    // 上报到监控平台
    reportMetric({
      name: entry.name,
      value: entry.startTime,
      type: entry.entryType,
    })
  }
})
observer.observe({ entryTypes: ['navigation', 'resource', 'paint', 'largest-contentful-paint'] })
```

**4. 追问 1：路由懒加载的魔法注释**：

```typescript
// 路由懒加载（Webpack/Vite 都支持）
const UserList = () => import('@/views/system/user/UserList.vue')

// 魔法注释：自定义 chunk 名称 + 预加载策略
const UserList = () => import(
  /* webpackChunkName: "system-user" */      // 自定义 chunk 文件名
  /* webpackPreload: true */                  // 预加载（与父 chunk 并行加载）
  '@/views/system/user/UserList.vue'
)

// Preload vs Prefetch 的区别
// Preload（预加载）：
//   - 当前页面**一定**会用到的资源
//   - 优先级高，与父 chunk 并行加载
//   - 适用于：当前路由马上要渲染的组件
//   <link rel="preload" href="user.js" as="script">

// Prefetch（预获取）：
//   - 未来**可能**会用到的资源
//   - 优先级低，浏览器空闲时才加载
//   - 适用于：用户可能导航到的下一个页面
//   <link rel="prefetch" href="next-page.js">
```

**Vite 中的等价概念**：
- Vite 基于 Rollup，支持类似的魔法注释
- `/* vitePrefetch: 0 */` 控制 prefetch 行为，值为 0 表示不自动 prefetch
- Vite 默认会为所有懒加载的路由生成 `<link rel="modulepreload">`

**5. 追问 2：构建分析工具**：

```bash
# Vite 项目
npm install --save-dev rollup-plugin-visualizer
```

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer'

export default {
  plugins: [
    visualizer({
      open: true,          // 构建后自动打开浏览器
      gzipSize: true,      // 显示 gzip 后的大小
      brotliSize: true,    // 显示 brotli 后的大小
      filename: 'dist/stats.html', // 输出文件名
      template: 'treemap', // 可视化模板：treemap/sunburst/network
    }),
  ],
}
```

- 构建后会生成 `dist/stats.html`，用**矩形树图**（Treemap）直观展示每个模块的大小
- 最大的几个模块就是优化的重点目标

**6. 首屏优化最佳实践（优先级排序）**：

```
优先级 1 -- 收益最大，成本最低：
  ├── Gzip/Brotli 压缩（服务端配置）
  ├── CDN 加速静态资源
  ├── 路由懒加载（拆包减少首屏体积）
  └── 图片格式优化 + 懒加载

优先级 2 -- 收益大，成本中等：
  ├── 组件库按需引入
  ├── 关键 CSS 内联
  ├── 骨架屏/loading 状态
  └── DNS Prefetch + Preconnect

优先级 3 -- 收益中等，成本高：
  ├── SSR/SSG（对 SEO 和首屏白屏都有帮助）
  ├── Service Worker 缓存策略
  └── Web Worker 处理密集计算
```

#### 答案参考路径
- [性能优化/首屏优化](../性能优化/first-screen.md)
- [性能优化/Web Vitals](../性能优化/web-vitals.md)

#### 评分标准

| 分数 | 表现 |
|------|------|
| 90-100 | 优化措施有完整的数据支撑（before/after），能区分 Preload/Prefetch 并知道在什么场景分别使用，有构建分析经验，提到 RUM 真实用户监控 |
| 75-89 | 优化措施罗列完整，知道量化方法但没有实际数据，知道懒加载的魔法注释但说不清 Preload/Prefetch 的区别 |
| 60-74 | 能说出几个优化手段但缺少系统性，没有量化意识，不知道构建分析工具 |
| <60 | 只知道 "代码分割" "压缩图片" 等笼统概念，没有实际做过性能优化 |

---

### Q8：打包优化（34-37 分钟）

#### 面试官话术

> "假设打包后 vendor.js 有 2MB，你怎么排查和优化？具体怎么拆包？你怎么决定哪些库拆到单独的 chunk？"

**追问**：
> "Vite 的预构建（Pre-bundling）做了什么？为什么 Vite 开发时快但首次构建不一定快？"

**面试官内心 OS**：
- 2MB 的 vendor.js 在中后台项目很常见，如何拆包体现了候选人的工程化能力
- 拆包策略不是越大越好也不是越小越好 -- 需要权衡缓存命中率、请求数量、并行加载能力
- Vite 预构建是 Vite 的核心机制，理解它 = 理解 Vite 的 "快" 从何而来
- 追问考察的是对构建工具底层原理的理解，区分 "会用" 和 "理解"

#### 预期回答

**1. 排查流程**：

```
Step 1: 生成构建分析报告
  └── rollup-plugin-visualizer → stats.html

Step 2: 定位体积最大的模块
  └── 是哪个库占了大头？ → Element Plus 全量 900KB
  └── 是某个工具库？      → moment.js 670KB
  └── 是业务代码重复？    → 多个路由引用了相同的大组件

Step 3: 针对性优化
```

**2. 拆包策略**：

```typescript
// vite.config.ts - 手动拆包策略
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 策略 1：框架核心库单独打包（变化频率低，缓存命中率高）
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-element': ['element-plus'],

          // 策略 2：工具库单独打包（稳定，基本不变）
          'vendor-libs': ['axios', 'dayjs', 'lodash-es'],

          // 策略 3：可视化库单独打包（体积大，使用场景有限）
          'vendor-echarts': ['echarts'],
        },
      },
    },
  },
}
```

**拆包粒度决策矩阵**：

| 因素 | 倾向于合并 | 倾向于拆分 |
|------|-----------|-----------|
| 更新频率 | 不常更新的库合并（如 lodash） | 经常更新的业务代码拆分 |
| 体积大小 | < 50KB 的小模块合并 | > 100KB 的大模块拆分 |
| 使用范围 | 所有页面都用的合并 | 部分页面用的拆分 |
| HTTP/2 | HTTP/2 支持多路复用，拆细一点也可以 | HTTP/1.1 受限于并发连接数，少拆一点 |
| 缓存策略 | 稳定的基础库合并（最大化缓存命中） | 频繁变化的业务代码拆分（最小化缓存失效） |

**具体优化手段**：

```typescript
// 1. Element Plus 按需导入（on-demand import）
// 使用 unplugin-vue-components 自动按需导入
import { ElButton, ElTable, ElInput } from 'element-plus'
// 配合 unplugin-auto-import 自动导入 Composition API
// 减少 60-70% 的 Element Plus 体积

// 2. 替换 moment.js → dayjs（体积从 670KB → 7KB）
import dayjs from 'dayjs' // 2KB gzipped

// 3. lodash → lodash-es（支持 Tree Shaking）
import { debounce, cloneDeep } from 'lodash-es'
// 而不是 import _ from 'lodash'（引入整个库）

// 4. ECharts 按需注册
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, CanvasRenderer])
// 按需引入 → 减少 40-50% 的 ECharts 体积
```

**优化效果示例**：

| 优化项 | 优化前 | 优化后 | 减少 |
|--------|--------|--------|------|
| Element Plus 按需导入 | 1.2MB | 380KB | 68% |
| moment.js → dayjs | 670KB | 7KB | 99% |
| lodash → lodash-es | 530KB | 12KB (只引入使用的函数) | 98% |
| ECharts 按需注册 | 1MB | 480KB | 52% |

**3. 追问：Vite 的预构建（Pre-bundling）**：

Vite 开发时快的核心原因：

```
传统 Webpack 开发模式：
  源文件 → Babel 转译 → Webpack 打包 → Bundle → Dev Server → 浏览器
  (所有文件打包在一起，修改一个文件需要重新构建相关 bundle)

Vite 开发模式：
  ┌─ 预构建（Pre-bundling）────────────────┐
  │  node_modules 中的依赖                   │
  │  (如 vue, element-plus, axios...)       │
  │      ↓ esbuild 打包（Go 语言，极快）       │
  │  单个 ESM 模块                           │
  │  (如 vue.js → 预构建后一个文件)            │
  └────────────────────────────────────────┘
                     │
                     ▼
  源文件 → 原生 ESM → Dev Server → 浏览器
  (不打包，按需请求。修改哪个文件就只重新请求哪个文件)
```

**预构建做了什么**：

1. **将非 ESM 格式的依赖转换为 ESM**：很多 npm 包发布的是 CommonJS 格式，浏览器不认识，需要 esbuild 转换
2. **合并碎文件**：如 lodash-es 有 600+ 个独立的 `.js` 文件，如果不合并，浏览器会发起 600+ 个请求（性能灾难）。预构建把它们打成一个文件
3. **缓存**：预构建结果缓存在 `node_modules/.vite/deps/`，除非依赖版本变化，否则不会重新构建

**为什么 Vite 首次构建不一定快**：

- 开发时快是因为**按需编译** -- 只处理当前页面需要的模块
- 生产构建时使用 Rollup，需要处理所有文件，没有 "按需" 的优势
- 而且 Rollup 本身比 esbuild 慢（JS vs Go）
- 另外，生产构建还需要：Tree Shaking、代码压缩（Terser）、CSS 提取、hash 文件名等额外步骤
- 但 Vite 的优势在于**开发体验**（HMR 秒级），生产构建速度通常不是最高优先级

#### 答案参考路径
- [性能优化/打包优化](../性能优化/bundle-optimization.md)
- [工程化/Tree Shaking](../工程化/tree-shaking.md)
- [工程化/Vite](../工程化/vite.md)

#### 评分标准

| 分数 | 表现 |
|------|------|
| 90-100 | 完整的排查-分析-优化流程，拆包策略有决策矩阵支撑，能具体说出多个库的替优化方案（moment→dayjs、lodash→lodash-es），理解 Vite 预构建的原理和限制 |
| 75-89 | 拆包方法正确，知道用 visualizer 分析，能说出 1-2 个库的替代方案，对 Vite 预构建有了解但不够深入 |
| 60-74 | 知道手动拆包的概念但缺乏具体策略，知道按需导入但没实践过 Vite 预构建，追问时回答模糊 |
| <60 | 不知道如何分析打包结果，只说得出 "代码分割" 但没有实操经验 |

---

### Q9：虚拟列表 + KeepAlive 策略（37-40 分钟）

#### 面试官话术

> "一个列表有 10000 条数据，要求渲染不卡顿，同时每条数据包含 5 个操作按钮。你用什么方案？你会自己实现还是用第三方库？"

**追问 1**：
> "虚拟列表中如果每个 item 的高度不固定怎么办？比如有的行文字多换行了。"

**追问 2**：
> "KeepAlive 在项目中怎么用的？遇到过什么坑？怎么解决 KeepAlive 缓存过多导致的内存问题？"

**面试官内心 OS**：
- 虚拟列表是长列表性能优化的标准答案，但追问 "高度不固定" 可以区分是否真正理解虚拟列表的原理
- KeepAlive 在中后台项目中常见，但很多候选人只会用 `include`/`exclude`，不知道 `max` 属性和 `onActivated`/`onDeactivated` 的正确用法
- 追问 "KeepAlive 的坑" -- 看候选人是否真的在复杂场景中使用过 KeepAlive

#### 预期回答

**1. 虚拟列表核心原理**：

```
┌─────────────────────────────────────────┐
│ 可视区域（Viewport）600px                │
│ ┌─────────────────────────────────────┐ │
│ │ Item 0  (absolute, top: 0)          │ │ ← 第一个可见项
│ │ Item 1  (absolute, top: 50)         │ │
│ │ Item 2  (absolute, top: 100)        │ │
│ │ ...可视区域内的项目...               │ │
│ │ Item 19 (absolute, top: 950)        │ │ ← 最后一个可见项
│ └─────────────────────────────────────┘ │
│                                         │
│ (不可见部分不渲染，用占位填充)              │
│                                         │
│ 上方不可见 3000 项（占位高度 150000px）    │
│ 下方不可见 6980 项（占位高度 349000px）    │
│                                         │
│ 总高度：500000px（10000 * 50px）         │
└─────────────────────────────────────────┘

核心计算：
  - startIndex = Math.floor(scrollTop / itemHeight)
  - endIndex = Math.ceil((scrollTop + viewportHeight) / itemHeight)
  - visibleItems = data.slice(startIndex, endIndex + buffer)
  - translateY = startIndex * itemHeight (偏移量)
```

**2. 自实现 vs 第三方库**：

**方案 A -- 自实现（适合场景简单、定高 item）**：

```vue
<template>
  <div
    class="virtual-list-container"
    :style="{ height: containerHeight + 'px' }"
    @scroll="handleScroll"
  >
    <!-- 占位容器：撑开滚动条 -->
    <div :style="{ height: totalHeight + 'px', position: 'relative' }">
      <!-- 可视区域容器：定位到正确位置 -->
      <div :style="{ transform: `translateY(${offsetY}px)` }">
        <div
          v-for="item in visibleItems"
          :key="item.id"
          :style="{ height: itemHeight + 'px' }"
        >
          <slot :item="item" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{
  items: T[]
  itemHeight: number
  containerHeight: number
  buffer?: number
}>(), { buffer: 5 })

const scrollTop = ref(0)

const totalHeight = computed(() => props.items.length * props.itemHeight)
const startIndex = computed(() => Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.buffer))
const endIndex = computed(() =>
  Math.min(
    props.items.length,
    Math.ceil((scrollTop.value + props.containerHeight) / props.itemHeight) + props.buffer
  )
)
const visibleItems = computed(() => props.items.slice(startIndex.value, endIndex.value))
const offsetY = computed(() => startIndex.value * props.itemHeight)

function handleScroll(e: Event) {
  scrollTop.value = (e.target as HTMLElement).scrollTop
}
</script>
```

**方案 B -- 第三方库（适合复杂场景，如不定高、拖拽排序等）**：
- `vue-virtual-scroller`：Vue 官方推荐，支持动态高度
- `@tanstack/vue-virtual`：TanStack 出品，TypeScript 支持好，API 灵活
- 选择建议：定高列表自实现即可（学习成本低、体积小）；不定高/复杂交互使用第三方库

**3. 追问 1：不定高 item 的虚拟列表**：

不定高虚拟列表的实现难度大很多，因为**无法通过 item 数量直接计算出总高度和偏移量**。

核心解决思路：

```typescript
// 方案 A：预估高度 + 实际测量 + 缓存修正
const itemHeightCache = new Map<number, number>()
const estimatedItemHeight = 50

function getItemHeight(index: number): number {
  return itemHeightCache.get(index) ?? estimatedItemHeight
}

function getOffsetY(index: number): number {
  let offset = 0
  for (let i = 0; i < index; i++) {
    offset += getItemHeight(i)
  }
  return offset
}

// 方案 B：ResizeObserver 实时测量
// 为每个渲染的 item 设置 ResizeObserver 监听高度变化
// 高度变化时更新缓存 → 重新计算 offsetY → 触发更新
```

**实际场景建议**：
- 如果 item 高度差异不大，用**平均预估值 + 误差容忍**即可，用户基本无感
- 如果 item 高度差异很大（如包含大量文字的卡片），使用 `@tanstack/vue-virtual`，它内部已经处理好了动态高度

**4. 追问 2：KeepAlive 在项目中的使用与坑**：

**KeepAlive 使用场景**：
- **列表 → 详情 → 返回列表**：缓存列表页，保持滚动位置和搜索条件
- **多 Tab 页切换**：每个 Tab 页独立缓存，切换不丢失状态
- **表单填写**：防止意外离开导致填写内容丢失

**基本用法**：

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <keep-alive :include="cachedViews" :max="10">
      <component :is="Component" :key="route.name" />
    </keep-alive>
  </router-view>
</template>

<script setup>
import { useKeepAliveStore } from '@/stores/keepAlive'

const keepAliveStore = useKeepAliveStore()
const cachedViews = computed(() => keepAliveStore.cachedViewNames)
</script>
```

**动态缓存管理**：
```typescript
// stores/keepAlive.ts
import { defineStore } from 'pinia'

export const useKeepAliveStore = defineStore('keepAlive', () => {
  const cachedViewNames = ref<string[]>([])

  function addCachedView(viewName: string) {
    if (!cachedViewNames.value.includes(viewName)) {
      cachedViewNames.value.push(viewName)
    }
  }

  function removeCachedView(viewName: string) {
    const index = cachedViewNames.value.indexOf(viewName)
    if (index > -1) cachedViewNames.value.splice(index, 1)
  }

  return { cachedViewNames, addCachedView, removeCachedView }
})
```

**常见坑与解决方案**：

| 坑 | 原因 | 解决方案 |
|-----|------|----------|
| **内存泄漏** | 缓存了太多页面组件，每个都持有数据和 DOM | 1. 设置 `:max` 限制缓存数量（LRU 策略） 2. 离开不需要缓存的页面时手动销毁 |
| **数据过时** | 列表页被缓存后，数据库数据已更新，但缓存组件显示旧数据 | 使用 `onActivated` 钩子在组件激活时重新拉取数据 |
| **滚动位置异常** | 从详情页返回列表页后，滚动位置重置 | 使用 `onDeactivated` 保存滚动位置，`onActivated` 恢复 |
| **同一路由不同参数的缓存** | `/detail/1` 和 `/detail/2` 共用一个缓存实例 | 使用 `:key="$route.fullPath"` 或 `$route.params.id` 确保不同参数的组件独立缓存 |

**内存控制最佳实践**：

```vue
<script setup>
onBeforeRouteLeave((to, from) => {
  if (to.name !== 'OrderDetail') {
    keepAliveStore.removeCachedView(from.name as string)
  }
})

onActivated(() => {
  if (needRefresh.value) {
    fetchData()
    needRefresh.value = false
  }
})

onDeactivated(() => {
  needRefresh.value = true
  savedScrollTop.value = containerRef.value?.scrollTop || 0
})
</script>
```

**KeepAlive 缓存数量的经验值**：

| 应用场景 | 推荐 `max` 值 | 说明 |
|----------|--------------|------|
| 轻量级列表页 | 10-15 | 列表页组件通常不持有大量数据（数据在 Store 中） |
| 包含大表格的页面 | 5-8 | 表格组件内存占用高，需要限制 |
| 数据看板/大屏 | 3-5 | 图表组件内存消耗大 |
| H5/移动端 | 3-5 | 移动端内存更受限 |

#### 答案参考路径
- [性能优化/虚拟列表](../性能优化/virtual-list.md)
- [Vue3/KeepAlive](../Vue3/keepalive.md)

#### 评分标准

| 分数 | 表现 |
|------|------|
| 90-100 | 虚拟列表原理描述清晰（startIndex/endIndex/offsetY 公式正确），能讨论不定高的解决方案，KeepAlive 坑点全面且有内存控制意识，有 `onActivated`/`onDeactivated` 的正确使用经验 |
| 75-89 | 知道虚拟列表的原理但代码实现不完整，不定高方案有思路但细节模糊，KeepAlive 使用过但没遇到过坑或没意识到缓存管理 |
| 60-74 | 知道用虚拟列表解决长列表问题，但原理讲不清楚，KeepAlive 只会基本配置 |
| <60 | 不知道虚拟列表是什么，KeepAlive 没使用过或只知道 `include`/`exclude` |

---

## 第五阶段：工程化能力（40-50 分钟）

### 环节目标

工程化能力考察候选人对规范化、自动化、可维护性的理解和实践。3 年中级前端应该具备基本的工程化思维：代码规范、CI/CD、组件封装。这一阶段的评判标准是：候选人能否将 "个人能力" 转化为 "团队能力"。

---

### Q10：CI/CD 与代码规范（40-45 分钟）

#### 面试官话术

> "你们项目的 CI/CD 流程是怎样的？从代码提交到上线经历了哪些环节？代码规范是如何保证的？Code Review 你主要关注什么？"

**追加追问**：
> "如果加一条 lint 规则，但团队中有人强烈反对，你怎么处理？如何渐进式地给一个老项目引入代码规范？"

**面试官内心 OS**：
- CI/CD 流程是否完整是团队工程化水平的一面镜子
- "代码规范如何保证" 不等于 "你用了什么工具" -- 重点在于 "保证" 二字：是否有强约束（pre-commit hook）？是否有自动化（CI 中 check）？违规后是否有反馈机制？
- 追问 "团队争议" 考察的是协作能力和推动力 -- 这才是 3 年中级的核心考察点
- "老项目引入规范" 是实战中的经典难题，看候选人是否只会说 "全部改一遍" 还是有渐进式推进的智慧

#### 预期回答

**1. 完整 CI/CD 流程**：

```
┌──────────────────────────────────────────────────────────────────────┐
│                        分支策略：GitHub Flow                           │
└──────────────────────────────────────────────────────────────────────┘

开发阶段：
  1. 从 main 分支切出 feature 分支
  2. 本地开发 → git add → git commit
     │
     ├── lint-staged: 对暂存区文件运行 ESLint + Prettier（pre-commit hook）
     ├── commitlint: 校验 commit message 格式（commit-msg hook）
     │   └── 格式：type(scope): description  例：feat(user): add user list
     │
     └── 3. git push → 创建 Pull Request

CI 阶段（PR 触发）：
  4. GitHub Actions / GitLab CI 自动运行 ──┐
     ├── TypeScript 类型检查 (tsc --noEmit)
     ├── ESLint 检查 (eslint --max-warnings 0)
     ├── 单元测试 (vitest run --coverage)
     └── 构建验证 (vite build)
                                          │
  5. Code Review ─────────────────────────┘
     ├── 至少 1 人 approve
     ├── CI 全部通过
     └── → 合并到 main

CD 阶段（main 分支推送触发）：
  6. 测试环境自动部署
     ├── 构建 → 打包 → 上传到测试服务器
     └── 自动运行 E2E 测试（可选）
  7. 预发布环境部署（手动触发）
  8. 生产环境部署（手动触发 + 审批）
     ├── 灰度发布（先 10% 流量验证）
     └── 全量发布
```

**2. 代码规范保障体系**：

```
工具链与钩子链：

  eslint                    Prettier               commitlint
  (代码质量)                (代码格式)              (提交信息)
      │                        │                       │
      └────────────────────────┼───────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   husky + lint-staged │
                    │   (Git Hooks 管理)     │
                    └─────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
        pre-commit       commit-msg         pre-push
        (lint-staged)    (commitlint)       (test)
              │                │                │
        只检查暂存文件      规范提交信息        运行测试
        (增量检查，快)     (便于生成Changelog)  (避免推送broken代码)
```

**配置文件示例**：

```javascript
// .lintstagedrc.js
export default {
  '*.{vue,ts,tsx}': [
    'eslint --fix --max-warnings 0',
    'prettier --write',
  ],
  '*.{css,scss,less}': [
    'stylelint --fix',
    'prettier --write',
  ],
  '*.{json,md}': ['prettier --write'],
}
```

```javascript
// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat',     // 新功能
      'fix',      // Bug 修复
      'docs',     // 文档
      'style',    // 格式
      'refactor', // 重构
      'perf',     // 性能优化
      'test',     // 测试
      'chore',    // 构建/工具
      'ci',       // CI
    ]],
    'subject-case': [0], // 不强制大小写
  },
}
```

**3. Code Review 关注点**（优先级从高到低）：

1. **逻辑正确性**：边界情况处理（空数组、null、undefined、异常）
2. **安全性**：XSS 注入风险（`v-html`、innerHTML）、敏感信息暴露
3. **性能**：不必要的重复计算、未使用 computed 的模板计算、内存泄漏风险
4. **可维护性**：命名是否清晰、函数是否过长（单函数 < 50 行建议）、是否有重复代码
5. **类型安全**：TypeScript 是否使用了 `any`、类型推导是否正确
6. **测试覆盖**：是否有基本的单元测试
7. **代码风格**：是否遵循团队规范（ESLint 自动检查）

**4. 追问 1：团队争议处理**

> "如果加一条 lint 规则，团队中有人强烈反对，你怎么处理？"

**处理步骤**：
1. **理解反对理由**：是规则太严格？影响开发效率？还是规则不适用于当前项目？
2. **看数据说话**：这条规则防止了多少实际 Bug？是否有具体案例？
3. **灵活配置**：如果某些文件确实需要例外，可以用 `eslint-disable-next-line` + 注释说明理由
4. **折中方案**：比如先设为 `warn` 而不是 `error`，让大家适应一段时间，再逐步升级
5. **最后手段 -- 民主投票**：团队投票决定，少数服从多数
6. **核心原则**：规范是为了提高效率，不是为了折磨人。**工具服务于人**，不要本末倒置

**5. 追问 2：老项目引入规范**

> "如何渐进式地给一个老项目引入代码规范？"

**阶段一 -- 摸底与工具搭建（1-2 天）**：
- 安装 ESLint + Prettier 但不强制
- 运行 `eslint .` 看有多少问题
- 将大部分规则设为 `warn`

**阶段二 -- 自动修复（1 周）**：
- 运行 `eslint --fix` + `prettier --write` 自动修复所有格式问题
- 这是 "无痛" 的一步，不改变逻辑
- 提交一个大的格式化 commit（团队提前通知）

**阶段三 -- 增量管控（持续）**：
- 配置 lint-staged，只检查**新修改的文件**
- 新增代码必须通过 lint，老代码暂时放过
- 每次修改老文件时，顺手修复 lint 问题（"营地法则"：让代码比你来的时候更干净）

**阶段四 -- CI 集成（1-2 周后）**：
- CI 中只对修改的文件做 lint 检查（`eslint --cache` 利用缓存加速）
- 不通过 lint 的 PR 不能合并

**阶段五 -- 全面收紧（可选）**：
- 逐步将 `warn` 规则升级为 `error`
- 设定 "清零" 目标日期，集中处理剩余问题

**关键原则**：**渐进式，不要一次性要求全部符合**。追求 100% 完美会遭到团队抵制。先让规范 "无痛存在"，再 "逐步加码"。

#### 评分标准

| 分数 | 表现 |
|------|------|
| 90-100 | CI/CD 流程完整（从 commit hook 到灰度发布），规范保障有完整的工具链，CR 关注点全面，能处理团队争议并给出渐进式老项目方案 |
| 75-89 | CI/CD 流程描述清晰但缺少部分环节（如灰度发布），规范工具配置用过但团队协作经验不足 |
| 60-74 | 知道 CI/CD 的基本概念但参与度低，代码规范有基本配置但缺少强制环节 |
| <60 | 没有 CI/CD 经验，没用过 lint-staged/husky，认为代码规范 "可有可无" |

---

### Q11：组件库封装经验（45-50 分钟）

#### 面试官话术

> "你封装过哪些组件？挑一个你觉得设计得最好的组件，从 API 设计、Props/Emits/Slots/Expose 设计、TypeScript 类型支持、文档、测试几个方面讲讲整个流程。"

**追加追问**：
> "如果这个组件要在团队之外推广使用，还需要做哪些事情？你心中'好的组件 API'长什么样？"

**面试官内心 OS**：
- 组件封装是中级前端的核心能力，"我用过 Element Plus" 和 "我封装了能被团队复用的组件" 是完全不同的层次
- API 设计是最能体现水平的 -- 好的 API 是 "自然" 的：用户不用看文档也能猜出怎么用
- 追问 "好的组件 API" 是重要的价值观题：如果候选人只强调 "功能多"，而忽略 "简洁"/"一致性"/"最小惊讶原则"，说明还没到那个层次
- TypeScript 类型支持是加分项：泛型 props、discriminated union、可从外部推导的类型

#### 预期回答

**以 "通用表格组件" 为例**：

这是一个中后台项目中最常用也最复杂的组件封装场景。

**1. 组件设计前的分析**：

**问题**：项目中 30+ 个页面使用 Element Plus 的 `<el-table>`，每个页面都要写几乎一样的模板代码：`<el-table-column>`、分页器、搜索栏、操作列等。重复代码太多，维护困难。

**目标**：封装一个 `ProTable` 组件，用**配置驱动**替代模板代码，一行 columns 配置搞定一个表格。

**2. API 设计原则**：

- **Props**：用于组件的配置数据（静态定义）
- **Emits**：用于通知父组件 "发生了什么"（事件回调）
- **Slots**：用于自定义渲染内容（UI 灵活性）
- **Expose**：用于父组件调用子组件方法（如刷新、重置等命令式操作）

**3. 完整实现**：

```vue
<!-- ProTable.vue -->
<template>
  <div class="pro-table">
    <div v-if="searchConfig" class="pro-table__search">
      <ProSearch :config="searchConfig" @search="handleSearch" @reset="handleReset" />
    </div>
    <div v-if="$slots.toolbar" class="pro-table__toolbar">
      <slot name="toolbar" />
    </div>
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="tableData"
      v-bind="$attrs"
      @selection-change="handleSelectionChange"
    >
      <el-table-column v-if="selectable" type="selection" width="50" :selectable="selectableFn" />
      <el-table-column v-if="showIndex" type="index" label="序号" width="60" :index="indexMethod" />
      <template v-for="column in columns" :key="column.prop">
        <el-table-column
          v-if="column.slot"
          :label="column.label"
          :width="column.width"
          :fixed="column.fixed"
          :align="column.align ?? 'center'"
        >
          <template #default="scope">
            <slot :name="column.slot" :row="scope.row" :index="scope.$index" />
          </template>
        </el-table-column>
        <el-table-column
          v-else
          v-bind="column"
          :align="column.align ?? 'center'"
          :show-overflow-tooltip="column.showOverflowTooltip ?? true"
        />
      </template>
      <el-table-column
        v-if="actionWidth && $slots.actions"
        label="操作"
        :width="actionWidth"
        :fixed="actionFixed ?? 'right'"
        align="center"
      >
        <template #default="scope">
          <slot name="actions" :row="scope.row" :index="scope.$index" />
        </template>
      </el-table-column>
    </el-table>
    <div v-if="pagination !== false" class="pro-table__pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="pageSizes"
        :layout="paginationLayout"
        @size-change="handlePageSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, computed } from 'vue'
import type { ProTableColumn, ProTableSearchConfig, ProTableExpose } from './types'

interface ProTableProps<T> {
  columns: ProTableColumn<T>[]
  request?: (params: any) => Promise<{ data: T[]; total: number }>
  data?: T[]
  loading?: boolean
  selectable?: boolean
  selectableFn?: (row: T, index: number) => boolean
  showIndex?: boolean
  actionWidth?: number | string
  actionFixed?: 'left' | 'right'
  pagination?: false
  searchConfig?: ProTableSearchConfig
}

const props = withDefaults(defineProps<ProTableProps<T>>(), {
  loading: false,
  selectable: false,
  showIndex: false,
  pagination: undefined,
})

const emit = defineEmits<{
  'selection-change': [selection: T[]]
  'page-change': [page: number, pageSize: number]
  'search': [params: Record<string, any>]
  'reset': []
}>()

const tableRef = ref()
const tableData = defineModel<T[]>('data', { default: () => [] })
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

defineExpose<ProTableExpose>({
  refresh: () => { currentPage.value = 1; fetchData() },
  reload: () => { fetchData() },
  getSelectedRows: () => [] as T[],
  reset: () => { currentPage.value = 1; tableData.value = []; total.value = 0 },
})

async function fetchData(params?: Record<string, any>) {
  if (!props.request) return
  try {
    const { data, total: totalCount } = await props.request({
      page: currentPage.value,
      pageSize: pageSize.value,
      ...params,
    })
    tableData.value = data
    total.value = totalCount
  } catch (error) {
    console.error('ProTable fetchData error:', error)
  }
}

function indexMethod(index: number): number {
  return (currentPage.value - 1) * pageSize.value + index + 1
}
</script>
```

**跨层面 TypeScript 类型定义**：

```typescript
// types/pro-table.ts
export interface ProTableColumn<T = any> {
  prop: string
  label: string
  width?: number | string
  minWidth?: number | string
  fixed?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  showOverflowTooltip?: boolean
  slot?: string
  formatter?: (row: T, column: ProTableColumn<T>, value: any, index: number) => string
  children?: ProTableColumn<T>[]
}

export interface ProTableSearchConfig {
  fields: ProTableSearchField[]
  collapsed?: boolean
}

export type ProTableSearchField =
  | { type: 'input'; key: string; label: string; placeholder?: string }
  | { type: 'select'; key: string; label: string; options: Array<{ label: string; value: any }>; multiple?: boolean }
  | { type: 'date-range'; key: string; label: string }
  | { type: 'date'; key: string; label: string }

export interface ProTableExpose {
  refresh: () => void
  reload: () => void
  getSelectedRows: () => any[]
  reset: () => void
}
```

**使用示例**：

```vue
<template>
  <ProTable
    ref="proTableRef"
    v-model:data="tableData"
    :columns="columns"
    :request="fetchUserList"
    :search-config="searchConfig"
    selectable
    show-index
    action-width="200"
    @selection-change="handleSelection"
  >
    <template #toolbar>
      <el-button type="primary" @click="handleAdd">新增</el-button>
      <el-button @click="handleExport">导出</el-button>
    </template>
    <template #status="{ row }">
      <el-tag :type="row.status === 1 ? 'success' : 'danger'">
        {{ row.status === 1 ? '启用' : '禁用' }}
      </el-tag>
    </template>
    <template #actions="{ row }">
      <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
      <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
    </template>
  </ProTable>
</template>

<script setup lang="ts">
import ProTable from '@/components/ProTable/ProTable.vue'
import type { ProTableColumn, ProTableSearchConfig, ProTableExpose } from '@/components/ProTable/types'

interface User {
  id: number
  username: string
  email: string
  status: number
  createTime: string
}

const columns: ProTableColumn<User>[] = [
  { prop: 'username', label: '用户名', width: 120 },
  { prop: 'email', label: '邮箱', minWidth: 180 },
  { prop: 'status', label: '状态', width: 80, slot: 'status' },
  { prop: 'createTime', label: '创建时间', width: 180, sortable: true },
]

const searchConfig: ProTableSearchConfig = {
  fields: [
    { type: 'input', key: 'username', label: '用户名', placeholder: '请输入用户名' },
    { type: 'select', key: 'status', label: '状态', options: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 },
    ]},
    { type: 'date-range', key: 'createTime', label: '创建时间' },
  ],
}

const proTableRef = ref<ProTableExpose>()
proTableRef.value?.refresh()
</script>
```

**4. 追问 1：组件推广还需要做什么？**

如果组件要在团队外推广：

| 维度 | 当前状态（团队内） | 推广需要补充 |
|------|------------------|-------------|
| **文档** | 可能只有注释 | 需要**完整的文档站点**（VitePress/Storybook），包含：API 参考、使用示例、Live Demo、常见问题 |
| **测试** | 可能只有手动测试 | 需要**单元测试覆盖率 > 80%**，E2E 测试覆盖核心流程 |
| **TypeScript** | 类型基本完整 | 确保所有导出类型准确，vue-tsc 无报错 |
| **版本管理** | 随项目迭代 | 独立发布到 npm，遵循语义化版本（SemVer），有 CHANGELOG |
| **兼容性** | 仅在自有项目中使用 | 需要明确 Vue/Element Plus 版本要求，测试不同环境兼容性 |
| **设计规范** | 可能不统一 | 提供主题定制能力（CSS 变量），与常见 UI 规范对齐 |
| **贡献指南** | 无 | CONTRIBUTING.md，Issue 模板，PR 模板 |
| **反馈渠道** | 口头反馈 | Issue tracker，Discord/钉钉群 |

**5. 追问 2：好的组件 API 是什么样？**

判断标准（优先级从高到低）：

1. **最小惊讶原则**：API 的行为符合直觉。用户不用看文档就能正确使用 80% 的功能。
2. **简洁但不简陋**：Props 数量控制在合理范围（核心参数 3-5 个，可选参数不超过 15 个）。
3. **一致性与可预测**：和团队/社区已有的组件保持命名一致。Props 命名：`loading` 而不是 `isLoading`。事件命名：`page-change`（kebab-case，与 Vue 官方风格一致）。
4. **灵活的扩展点**：提供 Slot 而不是枚举所有可能性。`<slot name="actions">` 比 `actions: ButtonConfig[]` 更灵活。
5. **类型安全**：Props 类型推导正确，编辑时有智能提示。Discriminated union 确保非法状态不可表达。
6. **文档即 API 设计稿**：在写代码前先写文档，从使用者视角审视 API 是否合理。

**反例**（API 设计失败的典型表现）：
- 需要看源码才能知道怎么用
- 传了一个配置但另一个配置必须也传才能生效（隐式依赖）
- Props 命名不一致：有的 `visible`，有的 `show`，有的 `open`
- 改变一个 prop 的值会导致组件内部状态被重置（副作用不明确）

#### 评分标准

| 分数 | 表现 |
|------|------|
| 90-100 | 能从 API 设计原则到具体实现完整阐述，TypeScript 类型设计规范（泛型、discriminated union），讨论了推广需要补充的方面，对 "好的 API" 有清晰的评价标准 |
| 75-89 | 组件封装经验丰富，API 设计有思考但不够系统化，TypeScript 类型使用基本正确但缺少泛型等进阶用法，对推广的考虑不够全面 |
| 60-74 | 封装过组件但只是简单包装，Props/Emits 使用不规范，不知道 Expose，TypeScript 类型不完整 |
| <60 | 没有组件封装经验，只会用 UI 库组件，对 API 设计没有概念 |

---

## 第六阶段：开放方案设计题（50-60 分钟）

### 环节目标

这是全场的**终极区分题**。不再有标准答案，考察候选人面对真实业务场景时的技术方案设计能力。重点看思考过程，不是最终答案。

---

### Q12：设计题 -- 实时数据看板系统（50-58 分钟）

#### 面试官话术

> "公司需要做一个运营数据看板。需求如下：10 个图表（折线图 3 个 + 柱状图 4 个 + 数据表格 3 个），数据每 5 秒自动刷新。同时有 3 个页面 Tab 切换，每个 Tab 上有不同的图表组合。请设计前端整体技术方案。
>
> 请考虑：状态管理怎么设计？数据更新用什么策略（轮询 vs WebSocket vs SSE）？组件之间怎么通信？性能上有什么风险以及怎么优化？错误处理和断线重连怎么设计？
>
> 你可以边思考边说，把思路过程展示出来。不用着急给最终答案。"

**面试官内心 OS**：
- 这是面试最关键的一题。压力给到最大 -- 开放性、系统性、有明确时间限制
- 看候选人是**结构化思考**（先梳理需求 → 画组件树 → 设计数据流 → 考虑边界）还是一上来就 "我用 ECharts + setInterval"
- 状态管理设计是核心：10 个图表 * 5 秒 = 每 5 秒 10 次数据更新。如果状态管理设计不当，会导致大量不必要的重渲染
- 数据更新策略的选型需要列出两种以上的方案，并分析 trade-off（轮询 vs WS vs SSE）
- "3 个 Tab 切换" 的考点：切到后台的 Tab 要不要继续取数据？
- 加分项：主动提到 Web Worker、大数据量采样、echarts 实例复用等性能细节

#### 理想思考过程

**第 1 步 -- 需求分析（1-2 分钟）**：

- 10 个图表：3 折线 + 4 柱状 + 3 表格
- 更新频率：每 5 秒
- 3 个 Tab 页切换

**第 2 步 -- 组件树设计（1-2 分钟）**：

```
DashboardLayout (主容器)
├── TabSwitcher (3 个 Tab)
│   ├── Tab 1: 运营总览
│   │   ├── ChartLine * 1 + ChartBar * 2 + DataTable * 1
│   ├── Tab 2: 用户分析
│   │   ├── ChartLine * 2 + ChartBar * 1
│   └── Tab 3: 收入分析
│       ├── ChartBar * 1 + DataTable * 2
```

**第 3 步 -- 数据更新策略分析（2-3 分钟）**：

| 方案 | 原理 | 优点 | 缺点 | 适用场景 |
|------|------|------|------|----------|
| **轮询（Polling）** | `setInterval` 每 5 秒调 API | 实现简单，无需后端改造 | 浪费带宽，延迟最多 5s | 后端不支持 WS/SSE 时 |
| **WebSocket** | 全双工持久连接 | 真正实时，服务端推送 | 后端需改造，连接管理复杂 | 需要真正的实时性 |
| **SSE（Server-Sent Events）** | 服务端单向推送 | 自动重连，基于 HTTP 更简单 | 仅支持服务端→客户端 | 单向数据推送（看板场景） |

**推荐方案**：SSE（如果后端支持）或 WebSocket（如果需要双向通信）。如果后端不支持，用轮询作为 fallback。

```typescript
function useEventSource<T>(url: string) {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  let eventSource: EventSource | null = null
  let retryCount = 0

  function connect() {
    eventSource = new EventSource(url)
    eventSource.onmessage = (event) => {
      data.value = JSON.parse(event.data)
      retryCount = 0
    }
    eventSource.onerror = () => {
      error.value = new Error('SSE connection error')
      retryCount++
      const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 30000)
      setTimeout(connect, delay)
    }
  }

  onMounted(connect)
  onUnmounted(() => eventSource?.close())

  return { data, error }
}
```

**第 4 步 -- 状态管理设计（2-3 分钟）**：

```
Pinia Store 设计：

dashboardStore/
├── state:
│   ├── activeTab: 'overview' | 'user' | 'revenue'
│   ├── dashboardData: {
│   │     overview: DashboardData | null
│   │     user: DashboardData | null
│   │     revenue: DashboardData | null
│   │   }
│   ├── connectionStatus: 'connected' | 'reconnecting' | 'disconnected'
│   └── lastUpdateTime: number
├── getters:
│   ├── currentTabData: 根据 activeTab 返回对应的数据
│   └── hasStaleData: 数据是否过期？（超过 10s 未更新）
├── actions:
│   ├── startDataStream(): 开始 SSE/WebSocket 连接
│   ├── stopDataStream(): 停止连接
│   ├── switchTab(tab): 切换 Tab + 更新数据拉取目标
│   └── updateData(tab, data): 更新某个 Tab 的数据
```

**策略选择**：
- 如果数据量小且图表渲染快（<100ms）：**全部拉取**，切换 Tab 时只改 `activeTab`
- 如果数据量大或图表多：**只拉当前 Tab**，切换时使用骨架屏过渡
- Tab 不可见时（用户切到其他浏览器标签），暂停数据拉取（`Page Visibility API`）

**第 5 步 -- 性能优化策略（2-3 分钟）**：

```typescript
// 1. 图表数据使用 shallowRef（避免深层响应式开销）
const chartData = shallowRef<ChartData[]>([])

// 2. ECharts 实例复用 + 增量更新
// 5秒全量刷新场景下：setOption(option, { notMerge: false })

// 3. Web Worker 处理数据转换
const dataWorker = new Worker('/workers/data-processor.js')
dataWorker.postMessage({ type: 'aggregate', data: rawData, config: chartConfig })
dataWorker.onmessage = (e) => { chartData.value = e.data }

// 4. requestAnimationFrame 控制更新频率
let rafId: number | null = null
function scheduleUpdate(data: ChartData[]) {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    chartInstance.setOption(buildOption(data))
    rafId = null
  })
}

// 5. Page Visibility API -- 标签页不可见时暂停请求
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopDataStream()
  } else {
    startDataStream()
  }
})
```

**第 6 步 -- 错误处理与断线重连（1-2 分钟）**：

```typescript
// 指数退避重连
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 10
const BASE_DELAY = 1000

function scheduleReconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    showManualRefreshPrompt()
    return
  }
  const delay = Math.min(BASE_DELAY * Math.pow(2, reconnectAttempts), 30000)
  setTimeout(() => { reconnect(); reconnectAttempts++ }, delay)
}

// 错误分级处理
// 级别 1：单次失败 → 保持上次数据 + 静默重试
// 级别 2：连续 3 次失败 → 显示警告横幅
// 级别 3：超过 30 秒未恢复 → 显示错误状态 + "手动刷新"按钮
// 级别 4：服务彻底不可用 → 降级数据（如 "昨日数据"）
```

#### 追问：图表数据量很大时怎么处理？

> "如果折线图有 1 万条数据点，直接传给 ECharts 渲染会卡，你怎么处理？"

**预期回答**：

1. **数据降采样**：使用 LTTB（Largest Triangle Three Buckets）算法将 10000 个点降到 500-1000 个点，视觉上几乎看不出差异
2. **ECharts 的 sampling 配置**：折线图支持 `sampling: 'lttb'`，自动降采样
3. **分段加载 + 缩放**：默认只显示最近的数据（如最近 1 小时），通过 dataZoom 组件支持缩放查看更早的数据
4. **Web Worker 处理**：把原始数据的聚合、采样计算放到 Worker 线程
5. **canvas 渲染器**：ECharts 默认使用 Canvas（大数据量比 SVG 渲染性能好）

#### 评分标准

| 分数 | 表现 |
|------|------|
| 90-100 | 结构化思考（需求→组件树→数据流→边界），数据更新策略有 3 种方案对比，性能优化考虑全面（shallowRef、Web Worker、requestAnimationFrame），错误处理分级且有降级方案，主动提到 Page Visibility API |
| 75-89 | 方案合理，技术选型有理由但缺少多方案对比，性能优化提到了 2-3 点但不全面，错误处理有考虑但缺少分级策略 |
| 60-74 | 能给出基本方案（Polling + ECharts + Pinia），但缺少系统性的架构设计，没有考虑边界情况 |
| <60 | 只能碎片化地回答（"用 setInterval 定时请求然后用 ECharts 渲染"），没有系统设计思路 |

---

## 第七阶段：反问环节（58-60 分钟）

### 面试官话术

> "好的，专业问题就问到这里。你对我们团队或者公司有什么想了解的吗？"

**面试官内心 OS**：
- 反问环节是双向的。好的问题能体现候选人的思考深度和对这份工作的认真程度
- 同时这也是给候选人留下好印象的最后机会

### 鼓励问的问题（加分）

**关于技术**：
- "团队目前的技术栈是什么？近期有升级或迁移计划吗？"
- "代码审查是怎么做的？普遍深度如何？"
- "项目是单仓（monorepo）还是多仓？为什么这样选择？"
- "测试覆盖率大概是多少？有 E2E 测试吗？"
- "前端部署流程是什么样的？有灰度发布吗？"
- "目前团队在技术上遇到的最大挑战是什么？"

**关于成长**：
- "入职后前 3 个月对我的期望是什么？"
- "公司对技术博客、开源贡献、技术分享有支持吗？"
- "晋升机制是怎样的？技术序列和管理序列如何评估？"

**关于团队**：
- "前端团队的规模是多少？前后端配比如何？"
- "团队协作上有什么痛点或可以改进的地方？"

### 不建议问的问题

| 问题 | 为什么不建议 | 替代问法 |
|------|------------|----------|
| "公司加班多吗？" | 显得关注点偏负向 | "项目的迭代节奏大概是什么样的？" |
| "我今天的表现怎么样？" | 让面试官不舒服 | 等结果通知即可 |
| "薪资是多少？" | 反问环节问这个过早 | HR 阶段再谈 |
| "可以远程办公吗？" | 如果 JD 没写，大概率不行 | "团队的协作模式是怎样的？" |

---

## 面试结束语

### 面试官对候选人

> "感谢你今天的分享，我们对你的项目经验有了比较深入的了解。接下来 HR 会和你沟通后续的流程。今天面试就到这里，辛苦了。"

### 面试官复盘框架（面试结束后自己填写）

**综合评分**：

| 维度 | 分数 (1-10) | 权重 | 加权分 | 关键依据 |
|------|------------|------|--------|----------|
| 项目深度 | /10 | 35% | | |
| 技术广度 | /10 | 25% | | |
| 工程化思维 | /10 | 20% | | |
| 方案设计能力 | /10 | 15% | | |
| 沟通表达 | /10 | 5% | | |
| **总分** | | | **/100** | |

**亮点（Strengths）**：

**不足（Weaknesses）**：

**评级**：
- [ ] S (90+)：可以带项目，有架构能力，建议通过
- [ ] A (80-89)：靠谱的中级前端，能独立负责模块，通过
- [ ] B (65-79)：基础功过关，可以培养，待定
- [ ] C (<65)：能力与年限不匹配，不通过

**是否进入三面**：[推荐 / 不推荐 / 待定]

**三面重点考察方向**（如进入三面）：

---

## 附录 A：高频追问速查表

| 追问关键词 | 所属问题 | 考察点 | S 级回答的核心 |
|-----------|---------|--------|---------------|
| "权限变了菜单没变" | Q1 | 状态清理 | 重置路由实例 + 清空 Store，不只是清 localStorage |
| "前端权限被绕过" | Q1 | 安全意识 | 前后端双重校验，前端是 UX 后端是安全 |
| "Token 过期并发 3 个请求" | Q5 | 异步流程控制 | isRefreshing + Promise 队列 |
| "refreshToken 也过期" | Q5 | 降级策略 | 检测刷新接口 401 → 清除登录态 → 跳转登录页 |
| "路由懒加载的魔法注释" | Q7 | 构建工具底层 | webpackChunkName / webpackPreload / webpackPrefetch |
| "Vite 预构建" | Q8 | 构建原理 | esbuild + CJS→ESM + 碎文件合并 + 缓存策略 |
| "虚拟列表不定高" | Q9 | 原理深度 | ResizeObserver 实测 + 高度缓存 + 动态 offsetY |
| "KeepAlive 内存泄漏" | Q9 | 内存管理 | max 限制 + onDeactivated 清理 + LRU 策略 |
| "老项目引入规范" | Q10 | 工程推动力 | 渐进式：摸底→自动修复→增量管控→CI 集成 |
| "好的组件 API" | Q11 | API 设计哲学 | 最小惊讶 + 简洁 + 一致 + 灵活 + 类型安全 |

## 附录 B：时间分配总览

```
00:00 ─── 10:00   第一阶段：项目架构介绍
10:00 ─── 14:00   Q1：RBAC 权限模型设计
14:00 ─── 18:00   Q2：动态路由与权限缓存
18:00 ─── 20:00   Q3：按钮级权限 + 指令实现
20:00 ─── 24:00   Q4：请求拦截器设计
24:00 ─── 27:00   Q5：Token 刷新与无感续期
27:00 ─── 30:00   Q6：请求去重与错误处理
30:00 ─── 34:00   Q7：首屏优化
34:00 ─── 37:00   Q8：打包优化
37:00 ─── 40:00   Q9：虚拟列表 + KeepAlive
40:00 ─── 45:00   Q10：CI/CD 与代码规范
45:00 ─── 50:00   Q11：组件库封装经验
50:00 ─── 58:00   Q12：开放方案设计题
58:00 ─── 60:00   反问环节
```

## 附录 C：该面试官使用的关键 "加压" 技巧

1. **沉默等待**：候选人回答完后，等待 3-5 秒不接话。很多时候候选人会自己补充更深的内容。
2. **"还有呢？"**：三次 "还有呢？" 原则。第一次列出的是准备好的，第二次是思考过的，第三次如果还能答出来，是真懂的。
3. **"假如...怎么办？"**：不断抛出边界场景（断网、并发、极端数据量、权限突变），看候选人的应变能力。
4. **"为什么不用 XXX？"**：对比式追问，考察技术选型的思考深度。
5. **"如果重新做你会怎么改？"**：反思式追问，考察是否只执行不思考。
6. **"这是一个真实 Bug，你猜是什么原因？"**：场景还原，考察排查问题的能力。

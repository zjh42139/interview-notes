---
title: Vue3 + TypeScript 最佳实践
description: Vue3 + TypeScript 在后台管理系统中的类型安全实践——defineProps/defineEmits 泛型、ref/reactive 类型推导、InjectionKey Provide/Inject、Pinia Store 完整类型、composable 返回类型标注
category: TypeScript
type: practice
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-14
updated: 2026-07-18
reviewed: null
tags:
  - Vue3
  - TypeScript
  - 最佳实践
  - defineProps
  - Pinia
  - composable
---

# Vue3 + TypeScript 最佳实践

> ⭐⭐⭐⭐⭐｜难度：中级

## 一句话总结

**Vue3 的 TypeScript 支持是从"可以写"变成"一等公民"——`defineProps<T>()` 纯类型语法传 props 类型、`defineEmits<T>()` 精确控制 emit 事件、`ref<T>()` 自动推导出正确类型、`InjectionKey<T>` 让 provide/inject 有完整类型安全。面试中被问到"项目里怎么用 TS"，从这五个入口切入就能覆盖全部场景。**

## 核心机制

### 1. `defineProps<T>()` —— 用泛型传 props 类型

```ts
<script setup lang="ts">
// 纯类型语法：传一个 interface 给泛型
interface Props {
  userId: number;
  userName: string;
  role?: 'admin' | 'editor' | 'viewer';
  permissions?: string[];
}

const props = defineProps<Props>();
// props.userId: number ✅
// props.userName: string ✅
// props.role: 'admin' | 'editor' | 'viewer' | undefined ✅
</script>
```

**带默认值** — `withDefaults`：

```ts
<script setup lang="ts">
interface Props {
  pageSize?: number;
  showSearch?: boolean;
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 10,
  showSearch: true,
  placeholder: '请输入关键词',
});
// props.pageSize: number（不是 number | undefined —— 默认值消除了 undefined）
</script>
```

**关键点**：`withDefaults` 的第二个参数中的默认值会**消除对应属性的 `undefined`**，因为调用方不传时它一定有默认值。

### 2. `defineEmits<T>()` —— 精确控制事件签名

```ts
<script setup lang="ts">
// 写法一：函数调用签名（Vue 3.2+）
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'change', id: number, name: string): void;
  (e: 'delete', id: number): void;
}>();

// emit('update:modelValue', 'hello');     // ✅
// emit('update:modelValue', 123);         // ❌ value 必须是 string
// emit('change', 1);                      // ❌ name 参数缺失
</script>
```

**写法二：命名元组（Vue 3.3+，更简洁）**：

```typescript
const emit = defineEmits<{
  'update:modelValue': [value: string];
  change: [id: number, name: string];
  delete: [id: number];
}>();
// 与写法一完全等价，只是语法更简洁
```

### 3. `ref<T>()` / `reactive<T>()` —— 类型自动推导

```typescript
import { ref, reactive } from 'vue';

// ref 自动推导
const count = ref(0);              // Ref<number>
const name = ref('');              // Ref<string>
const user = ref<User | null>(null); // Ref<User | null>

// reactive 自动推导
const form = reactive({
  name: '',
  email: '',
  role: 'viewer' as const,
});
// typeof form = { name: string; email: string; role: 'viewer'; }

// ⚠️ 注意：reactive 不接受原始类型
// const n = reactive(1);  // ❌ 报错！reactive 只接受对象
```

**ref 的类型推导陷阱**：`ref(null)` 默认推断为 `Ref<null>`，没有显式泛型就无法赋其他值。解决方案——显式写 `ref<User | null>(null)`。

### 4. Template Ref —— 获取组件实例类型

```ts
<script setup lang="ts">
import { ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import UserForm from './UserForm.vue';

// DOM 元素 / 组件 ref —— 用 InstanceType 或内置类型
const formRef = ref<FormInstance>();
// formRef.value?.validate() —— 有完整的 Element Plus 类型提示

// 子组件 ref —— InstanceType 提取组件实例
const userFormRef = ref<InstanceType<typeof UserForm>>();
// userFormRef.value?.submitForm() —— 有子组件暴露的方法类型提示

// 普通 DOM ref
const inputRef = ref<HTMLInputElement>();
// inputRef.value?.focus() —— 有原生 DOM API 类型提示
</script>
```

**Vue 3.5+ 推荐 `useTemplateRef`**——通过字符串 key 关联模板 ref，不再要求变量名与 ref 属性同名：

```ts
import { useTemplateRef } from 'vue';

// 参数对应模板中的 ref="formRef" / ref="userForm"
const formRef = useTemplateRef<FormInstance>('formRef');
const userFormRef = useTemplateRef<InstanceType<typeof UserForm>>('userForm');
// 返回只读 ref，值为 T | null，使用时同样要判空
```

旧的 `ref<T>()` 写法在 3.5+ 依然可用。

### 5. `InjectionKey<T>` —— Provide/Inject 类型安全

```typescript
// types/injection-keys.ts —— 集中管理所有注入 Key
import type { InjectionKey, Ref } from 'vue';

export const CURRENT_USER_KEY: InjectionKey<Ref<{ id: number; name: string }>> = Symbol('currentUser');
export const PERMISSIONS_KEY: InjectionKey<string[]> = Symbol('permissions');
export const RELOAD_KEY: InjectionKey<() => Promise<void>> = Symbol('reload');
```

```ts
<!-- 根组件 Provide -->
<script setup lang="ts">
import { provide, ref } from 'vue';
import { CURRENT_USER_KEY } from '@/types/injection-keys';

const currentUser = ref({ id: 1, name: 'admin' });
provide(CURRENT_USER_KEY, currentUser);
// 类型安全：第二个参数必须匹配 InjectionKey 的泛型类型
</script>
```

```ts
<!-- 子组件 Inject -->
<script setup lang="ts">
import { inject } from 'vue';
import { CURRENT_USER_KEY } from '@/types/injection-keys';

const user = inject(CURRENT_USER_KEY);
// user: Ref<{ id: number; name: string }> | undefined
// TS 知道 user 是 Ref，可以直接 .value——完全类型安全
</script>
```

没有 InjectionKey 时，provide/inject 的类型联系是断的——提供端给 `string`，注入端拿到 `unknown`。InjectionKey 是两端类型同步的唯一方式。

## 深度拓展

### Pinia Store 完整类型推导

```typescript
// stores/user.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

interface UserInfo {
  id: number;
  name: string;
  email: string;
  roles: string[];
}

export const useUserStore = defineStore('user', () => {
  // Setup Store 语法：ref 会自动推导
  const userInfo = ref<UserInfo | null>(null);
  const token = ref('');

  const isLoggedIn = computed(() => !!token.value);
  const roleNames = computed(() => userInfo.value?.roles ?? []);

  // actions 的参数和返回值都有类型安全
  async function login(username: string, password: string): Promise<boolean> {
    const res = await request.post<{ token: string; user: UserInfo }>('/auth/login', {
      username,
      password,
    });
    token.value = res.data.token;
    userInfo.value = res.data.user;
    return true;
  }

  function logout() {
    token.value = '';
    userInfo.value = null;
  }

  return { userInfo, token, isLoggedIn, roleNames, login, logout };
});

// 组件中使用 —— 完全类型推导，不需要任何类型注解
// const store = useUserStore();
// store.login('admin', '123456') —— 参数和返回值类型自动推断
// store.isLoggedIn —— 推导为 boolean
```

### Composable 返回类型标注

```typescript
// composables/useRequest.ts
import { ref, type Ref } from 'vue';

interface UseRequestReturn<T> {
  data: Ref<T | null>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  execute: () => Promise<void>;
}

export function useRequest<T>(
  fetcher: () => Promise<T>,
): UseRequestReturn<T> {
  const data = ref<T | null>(null) as Ref<T | null>;
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function execute() {
    loading.value = true;
    error.value = null;
    try {
      data.value = await fetcher();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : '请求失败';
    } finally {
      loading.value = false;
    }
  }

  return { data, loading, error, execute };
}

// 组件中使用
interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newOrders: number;
}

const { data, loading, error, execute } = useRequest<DashboardStats>(
  () => request.get('/api/dashboard/stats'),
);
// data: Ref<DashboardStats | null> —— 完整的类型推导
// data.value?.totalUsers —— 有自动补全
```

**建议**：composable 的返回类型**显式标注**（`UseRequestReturn<T>`），而非依赖类型推断——给调用方一个清晰的可读入口。但内部变量（ref 等）放给 TS 自动推断即可。

### defineExpose —— 暴露给父组件的方法类型

```ts
<!-- UserTable.vue -->
<script setup lang="ts">
import { ref } from 'vue';

const tableData = ref<User[]>([]);

function refresh() {
  // 重新加载表格数据
}

function getSelectedRows(): User[] {
  return tableData.value.filter(u => u.selected);
}

defineExpose({ refresh, getSelectedRows });
// 暴露的方法会自动推断类型——父组件中用 InstanceType<typeof UserTable> 获取
</script>
```

## 项目实战

### 完整示例：通用表格组件

```ts
<!-- GenericTable.vue —— 泛型表格组件 -->
<script setup lang="ts" generic="T extends Record<string, unknown>">
import { computed } from 'vue';

interface Column {
  prop: keyof T;
  label: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  formatter?: (row: T) => string;
}

interface Props {
  data: T[];
  columns: Column[];
  loading?: boolean;
  selectable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  selectable: false,
});

const emit = defineEmits<{
  (e: 'selection-change', rows: T[]): void;
  (e: 'row-click', row: T, index: number): void;
}>();

const selectedRows = computed(() => {
  return props.data.filter(
    (row: T) => (row as Record<string, unknown>).selected === true,
  );
});
</script>
```

**`generic="T"`** 是 Vue 3.3+ 的特性——让 `<script setup>` 支持泛型参数。表格组件接受任何数据类型的数组，`columns[].prop` 自动关联到 `T` 的属性。

## 易错点

❌ **`defineProps` 不用泛型而用运行时声明**：运行时声明处理复杂类型要靠 `PropType` 手动断言（`user: Object as PropType<User>`），写法冗长；`script setup` + TS 下官方推荐纯类型语法 `defineProps<Props>()`。但运行时声明并未废弃——选项式 API 或需要 `validator` 运行时校验时仍会用到。

❌ **忘记给 ref 显式泛型导致 `Ref<null>`**：`const user = ref(null)` → TS 推断为 `Ref<null>`，后续赋值 `user.value = { ... }` 报错。方案：`const user = ref<User | null>(null)`。

❌ **reactive 用于原始类型**：`const n = reactive(1)` 直接报错。reactive 只接受对象——原始类型用 `ref`。

❌ **provide/inject 不用 InjectionKey 丢类型**：不用 `InjectionKey<T>` 的话，inject 拿到的值是 `unknown` 或你手写的类型（可能跟 provide 端不一致）。InjectionKey 是唯一保证两端类型一致的机制。

❌ **InstanceType&lt;typeof Component&gt; 拿到的是组件实例类型，不是 props 类型**：如果你需要子组件的 props 类型，应该从子组件导出 Props interface 供外部引用，而非用 InstanceType。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "Vue3 中怎么给 props 加 TS 类型" | 追问 `defineProps<T>()` + `withDefaults` 消除 undefined |
| "emits 怎么声明类型" | 追问 3.2+ 函数调用签名 vs 3.3+ 命名元组语法 |
| "provide/inject 怎么类型安全" | 追问 InjectionKey 让两端类型同步 |
| "project 里 TS 的最佳实践" | 追问 composable 显式返回类型 + ref 泛型 + strict 全开 |

## 相关阅读

- [Vue3 官方文档：TypeScript 与组合式 API](https://cn.vuejs.org/guide/typescript/composition-api.html)
- [泛型](./generics.md) —— 表格组件泛型 + composable 泛型的基础
- [tsconfig.json 配置](./tsconfig.md) —— Vite 项目中 tsconfig 的推荐配置
- [声明文件 / declare](./declaration.md) —— `declare module 'vue'` 扩展全局属性类型
- [Vue3 模块](../Vue3/) —— Vue3 核心原理

## 更新记录

- 2026-07-14：新建——defineProps/Emits 类型 + ref/reactive 推导 + InjectionKey + Pinia Store + composable + 泛型表格
- 2026-07-18：事实审计——修正信号表 emits 版本标注（函数调用签名 3.2+ / 命名元组 3.3+，此前写反）、命名元组示例与写法一对齐、易错点补 PropType 说明、新增 Vue 3.5 useTemplateRef

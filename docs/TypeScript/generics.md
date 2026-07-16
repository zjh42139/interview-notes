---
title: 泛型
description: 泛型（Generics）是 TypeScript 的核心特性，通过类型参数实现组件复用，结合 extends 约束和条件类型构成强大的类型系统
category: TypeScript
type: mechanism
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - 泛型
  - extends
  - 约束
---

# 泛型

> ⭐⭐⭐⭐⭐｜难度：中级

## 一句话总结

> 泛型就是"类型的参数化"——你写函数时不写死类型，用占位符 `<T>` 代替，调用时再把具体类型传进去。一套逻辑处理多种类型，TypeScript 全程跟踪类型，不丢类型安全。

## 核心机制

泛型本质：**把类型当作参数传递**。`function identity<T>(arg: T): T` 中的 `T` 就是类型变量——调用方传什么类型，`T` 就是什么，返回值也是同一个类型。和普通函数传值参数同理，只不过传的是**类型**。

三种最常见的使用场景：

**泛型函数**：TS 的类型推断非常聪明，绝大多数情况下不用显式指定泛型参数：

```typescript
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

const s = firstElement(["a", "b", "c"]);  // TS 推断 T = string
const n = firstElement<number>([1, 2, 3]); // 也可以显式指定
```

**泛型约束（extends）**：`T` 默认可以是任何类型，用 `extends` 给它加边界——限定它"至少具备某些属性"：

```typescript
function logLength<T extends { length: number }>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength("hello");   // ✅ string 有 length
logLength([1, 2, 3]); // ✅ 数组有 length
// logLength(123);    // ❌ number 没有 length
```

**泛型接口**：后台管理里最常见的模式——给 API 响应加泛型：

```typescript
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}
```

**泛型默认值**：和函数参数默认值一样，泛型也能给默认类型：

```typescript
interface RequestConfig<T = Record<string, unknown>> {
  url: string;
  data?: T;
}
```

面试高频点：**类型参数推断**。TS 从实参自动推导泛型参数，你写 `useRequest('/api/user')` 时如果 hook 的 `data` 关联了泛型，返回值类型就会自动推导出来——"写 js 的感觉，拿 ts 的安全"。

## 深度拓展

### 追问点 1：分布式条件类型

当泛型 `T` 是联合类型且在条件类型左侧时，条件类型**分发**到联合的每个成员：

```typescript
type ToArray<T> = T extends unknown ? T[] : never;
type Result = ToArray<string | number>; // string[] | number[]（分发了）
```

不想分发？用 `[T]` 包裹阻止：

```typescript
type ToArrayNonDist<T> = [T] extends [unknown] ? T[] : never;
type Result2 = ToArrayNonDist<string | number>; // (string | number)[]
```

### 追问点 2：泛型 + infer 提取类型

`infer` 在条件类型中从类型结构里提取子类型：

```typescript
type Unwrap<T> = T extends Promise<infer U> ? U : T;
type A = Unwrap<Promise<string>>; // string
type B = Unwrap<number>;          // number（不是 Promise，原样返回）
```

### 追问点 3：手写常用工具类型

`Partial`、`Readonly`、`Pick` 本质都是泛型 + 映射类型：

```typescript
type MyPartial<T>    = { [K in keyof T]?: T[K] };
type MyReadonly<T>   = { readonly [K in keyof T]: T[K] };
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
```

## 项目实战

Vue3 + Element Plus 后台管理系统中泛型无处不在：

**1. Axios 响应封装**：

```typescript
interface UserInfo { id: number; name: string; roles: string[]; }
// const res = await http.get<ApiResponse<UserInfo>>('/user/info');
// TS 自动知道 res.data.data 是 UserInfo
```

**2. useRequest 泛型 hook**——自动推断 data 类型：

```typescript
function useRequest<T>(fetcher: () => Promise<ApiResponse<T>>) {
  const data = ref<T | null>(null);
  const loading = ref(false);
  async function execute() {
    loading.value = true;
    const res = await fetcher();
    data.value = res.data;
    loading.value = false;
  }
  return { data, loading, execute };
}
```

**3. 表格列定义泛型**——`prop` 只能是 `T` 的属性名：

```typescript
interface TableColumn<T> {
  prop: keyof T;
  label: string;
  width?: number;
  formatter?: (row: T) => string;
}

const columns: TableColumn<UserInfo>[] = [
  { prop: "name", label: "姓名" },    // ✅
  // { prop: "age", label: "年龄" },  // ❌ 编译报错
];
```

**4. 表单数据泛型**——form 和提交参数类型统一：

```typescript
function useForm<T extends Record<string, unknown>>(initial: T) {
  const form = reactive<T>({ ...initial });
  const submit = async (api: (data: T) => Promise<void>) => {
    await api(form);
  };
  return { form, submit };
}
```

## 易错点

**❌ 泛型就是 any，换了个名字**
`any` 关闭类型检查，泛型保持类型的**可追踪性**。`identity<string>` 返回 `string`，TS 全程知道。`any` 返回值也是 `any`，后续全部失检。

**❌ 泛型一定要显式指定 `<Type>`**
90% 的场景 TS 自动推断。只有在"没有参数能推断"时才需要显式指定（如 `new Set<number>()`）。

**❌ `extends` 就是类的继承**
在泛型约束中 `extends` 含义是"可赋值给"。`T extends { length: number }` 意思是 T 必须能赋值给有 length 的对象，string、数组、带 length 属性的对象都可以。

**❌ 泛型嵌套越深越好**
过度抽象让类型难以阅读。项目中泛型嵌套一般不超过两层，复杂的拆成多个有意义的类型别名。

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "泛型是什么，为什么需要" | 追问泛型是类型的参数——不损失类型信息的前提下实现复用 |
| "泛型约束怎么加" | 追问 `<T extends U>` 限制 T 必须满足 U 的形状 |
| "泛型和 any 有什么区别" | 追问 any 丢了类型信息——泛型保留了入参和返回值的类型关联 |

## 相关阅读

- [TypeScript Handbook: Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [extends / infer 深度解析](./extends-infer.md)
- [keyof / mapped / conditional 类型编程](./keyof-mapped-conditional.md)
- [Utility Types 工具类型](./utility-types.md)
- [TypeScript Deep Dive: Generics](https://basarat.gitbook.io/typescript/type-system/generics)

## 更新记录

- 2026-07：Phase 2 填充 —— 完整面试内容

---
title: 手写深拷贝
description: 手写实现深拷贝，处理循环引用、WeakMap、Date、RegExp 等
category: 手写题
type: exercise
score: 78
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - deep-clone
  - WeakMap
  - 循环引用
  - structuredClone
---

# 手写深拷贝

> ⭐⭐⭐⭐⭐｜难度：中级

## 一句话总结

**深拷贝的核心是"递归遍历对象属性并创建新副本，用 WeakMap 记录拷贝过的引用解决循环引用，针对 Date、RegExp、Map、Set 等特殊类型走构造函数重建"。**

## 核心机制

```typescript
// ========== 类型判断工具 ==========
const getType = (value: unknown): string =>
  Object.prototype.toString.call(value).slice(8, -1);

const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && (typeof value === 'object' || typeof value === 'function');

// ========== 可遍历类型：逐属性递归拷贝 ==========
const canTraverse: Record<string, boolean> = {
  Object: true,
  Array: true,
  Map: true,
  Set: true,
  // Arguments: true,  // 可扩展
};

// ========== 深拷贝主函数 ==========
function deepClone<T>(value: T, map = new WeakMap<object, any>()): T {
  // --- 基本类型 / null / undefined / function 直接返回 ---
  if (!isObject(value)) return value;

  // --- 函数：返回引用（函数一般不需要深拷贝） ---
  if (typeof value === 'function') return value;

  // --- 循环引用检测：已拷贝过则直接返回缓存 ---
  if (map.has(value as object)) {
    return map.get(value as object);
  }

  const type = getType(value);

  // --- 处理不可遍历的特殊类型 ---
  switch (type) {
    case 'Date':
      return new Date((value as unknown as Date).getTime()) as unknown as T;
    case 'RegExp':
      return new RegExp(
        (value as unknown as RegExp).source,
        (value as unknown as RegExp).flags
      ) as unknown as T;
    case 'Error':
      return new (value as unknown as Error).constructor(
        (value as unknown as Error).message
      ) as unknown as T;
    // DOM 节点不做深拷贝，直接返回引用
    case 'Element':
    case 'Node':
    case 'Window':
      return value;
  }

  // --- 处理可遍历类型 ---
  if (!canTraverse[type]) {
    // 未知类型，尝试构造新实例
    try {
      return new (value as any).constructor(value) as T;
    } catch {
      return value;
    }
  }

  // --- 创建同类型的空容器 ---
  let clone: any;
  switch (type) {
    case 'Map': {
      clone = new Map();
      map.set(value as object, clone);
      (value as unknown as Map<any, any>).forEach((v, k) => {
        clone.set(deepClone(k, map), deepClone(v, map));
      });
      return clone;
    }
    case 'Set': {
      clone = new Set();
      map.set(value as object, clone);
      (value as unknown as Set<any>).forEach((v) => {
        clone.add(deepClone(v, map));
      });
      return clone;
    }
    case 'Array': {
      clone = [];
      break;
    }
    default: {
      // Object 及普通对象：保持原型链
      clone = Object.create(Object.getPrototypeOf(value));
      break;
    }
  }

  // 先注册到 map，再递归拷贝（防止循环引用死循环）
  map.set(value as object, clone);

  // --- 遍历所有自有属性（包括 Symbol key 和不可枚举属性） ---
  Reflect.ownKeys(value as object).forEach((key) => {
    // Symbol key 也可以作为属性拷贝
    (clone as any)[key] = deepClone(
      (value as any)[key],
      map
    );
  });

  return clone;
}

// ==================== 测试用例 ====================

// 1. 基本类型和引用类型
const obj1 = {
  a: 1,
  b: 'hello',
  c: null,
  d: undefined,
  e: true,
  f: Symbol('sym'),
};
const cloned1 = deepClone(obj1);
console.log('基本类型：', cloned1, cloned1 !== obj1); // 对象不相等，值相等

// 2. 嵌套对象和数组
const obj2 = {
  arr: [1, 2, { deep: 3 }],
  nested: { x: { y: { z: 42 } } },
};
const cloned2 = deepClone(obj2);
console.log('嵌套：', cloned2.arr[2].deep); // 3
console.log('独立副本：', cloned2.arr !== obj2.arr);

// 3. Date 和 RegExp
const obj3 = {
  date: new Date('2024-01-01'),
  reg: /hello\s+world/gi,
};
const cloned3 = deepClone(obj3);
console.log('Date：', cloned3.date instanceof Date); // true
console.log('RegExp：', cloned3.reg.source, cloned3.reg.flags); // "hello\\s+world" "gi"

// 4. Map 和 Set
const obj4 = {
  map: new Map([[1, 'one'], [{ key: 'obj' }, 'value']]),
  set: new Set([1, 2, { nested: 3 }]),
};
const cloned4 = deepClone(obj4);
console.log('Map 内容：', cloned4.map.get(1)); // "one"
console.log('Set size：', cloned4.set.size); // 3

// 5. 循环引用（核心测试）
const obj5: any = { name: 'root' };
obj5.self = obj5;         // 指向自身
obj5.child = { parent: obj5 };  // 子对象指回父对象
const cloned5 = deepClone(obj5);
console.log('循环引用：', cloned5.name); // "root"
console.log('self 指向自身：', cloned5.self === cloned5); // true（保持了循环）
console.log('子对象 parent 指回：', cloned5.child.parent === cloned5); // true

// 6. Symbol key 和不可枚举属性
const symKey = Symbol('hidden');
const obj6: any = {};
Object.defineProperty(obj6, 'enumerable', {
  value: 'yes', enumerable: true, configurable: true, writable: true,
});
Object.defineProperty(obj6, 'hidden', {
  value: 'non-enum', enumerable: false, configurable: true, writable: true,
});
obj6[symKey] = 'symbol value';
const cloned6 = deepClone(obj6);
console.log('普通属性：', cloned6.enumerable);       // "yes"
console.log('不可枚举：', cloned6.hidden);           // "non-enum"
console.log('Symbol key：', cloned6[symKey]);       // "symbol value"

// 7. 原型链保持
class Person {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  greet() { return `Hello, ${this.name}`; }
}
const p = new Person('Alice');
const clonedP = deepClone(p);
console.log('原型链：', clonedP.greet());            // "Hello, Alice"
console.log('instanceof：', clonedP instanceof Person); // true

// 8. 函数：返回引用
const obj7 = { fn: () => 'arrow', method() { return 'method'; } };
const cloned7 = deepClone(obj7);
console.log('函数引用：', cloned7.fn === obj7.fn); // true（浅拷引用）

// 9. 边界：null/undefined/基本类型
console.log(deepClone(null));    // null
console.log(deepClone(42));      // 42
console.log(deepClone('str'));   // "str"
console.log(deepClone(undefined)); // undefined
```

## 深度拓展

### 追问点 1：为什么用 `WeakMap` 而不是 `Map`？

```typescript
// 面试官追问：为什么不直接用 Map 存储原始值到克隆值的映射？

// Map 对 key 是强引用，只要 Map 没被清除，key 指向的对象永远不会被 GC
// 如果深拷贝大对象，Map 会阻止所有已拷贝子对象的垃圾回收，造成内存泄漏

// WeakMap 对 key 是弱引用：
// 当 key 指向的对象没有其他引用时，即使 WeakMap 还在，该 entry 也会被 GC
// 深拷贝完成后，如果 clone 对象也被 GC，原始对象的 WeakMap entry 自动消失

// 关键：WeakMap 的 key 必须是对象，这刚好满足我们的需求（只有对象才需要缓存映射）
```

### 追问点 2：`for...in`、`Object.keys`、`Reflect.ownKeys` 用什么遍历属性？

```typescript
// | 方法              | 可枚举 | 不可枚举 | Symbol key | 原型链 |
// |-------------------|--------|----------|------------|--------|
// | for...in          |   ✅   |    ❌    |     ❌     |   ✅   |
// | Object.keys       |   ✅   |    ❌    |     ❌     |   ❌   |
// | Object.getOwnPropertyNames | ✅ | ✅ | ❌    |   ❌   |
// | Object.getOwnPropertySymbols | ❌ | ❌ | ✅  |   ❌   |
// | Reflect.ownKeys   |   ✅   |    ✅    |     ✅     |   ❌   |

// 深拷贝应该用 Reflect.ownKeys：覆盖所有自有属性（包括 Symbol 和不可枚举）
```

### 追问点 3：为什么不直接用 `JSON.parse(JSON.stringify())`？

```typescript
// 面试官经典问题：这个方案有哪些缺陷？

// 1. 丢失 undefined、Symbol、函数
JSON.parse(JSON.stringify({ a: undefined, b: Symbol(), c: () => {} }));
// → {}

// 2. Date 变成字符串
JSON.parse(JSON.stringify({ d: new Date() }));
// → { d: "2024-..." } 字符串，不是 Date 对象

// 3. RegExp 变成空对象
JSON.parse(JSON.stringify({ r: /test/g })); // → { r: {} }

// 4. Map/Set 丢失
JSON.parse(JSON.stringify({ m: new Map([[1,2]]) })); // → { m: {} }

// 5. 循环引用直接报错
const a: any = {}; a.self = a;
JSON.parse(JSON.stringify(a)); // TypeError: Converting circular structure to JSON

// 6. BigInt 报错
JSON.stringify({ b: 1n }); // TypeError: Do not know how to serialize a BigInt
```

## 项目实战

```typescript
// 场景1：后台管理系统中表单回显时深拷贝初始数据
interface FormState {
  name: string;
  config: { theme: string; items: Array<{ id: number; value: string }> };
}

class FormManager {
  private initialState: FormState;
  private currentState: FormState;

  constructor(initial: FormState) {
    this.initialState = deepClone(initial);  // 保存不可变的初始状态
    this.currentState = initial;
  }

  reset() {
    this.currentState = deepClone(this.initialState); // 恢复
  }

  hasChanged(): boolean {
    return JSON.stringify(this.currentState) !== JSON.stringify(this.initialState);
  }
}

// 场景2：Redux/Vuex 中保证状态不可变
function reducer(state: any, action: { payload: any }) {
  const newState = deepClone(state);
  // 安全修改...
  return newState;
}
```

## 易错点

1. **循环引用忘记处理**：无 `map` 去重会无限递归导致栈溢出。必须用 WeakMap（不是 Map）做缓存。

2. **原型链丢失**：直接用 `{}` 或 `[]` 创建对象会丢失原型，应该用 `Object.create(Object.getPrototypeOf(value))` 保持 constructor 关系。

3. **Date/RegExp 建议显式重建**：通用兜底 `new value.constructor(value)` 对 Date（构造器接受 Date/时间戳）和 RegExp（ES6 起构造器接受正则对象）恰好可行，但依赖 `constructor` 属性——它可被篡改或丢失（如 `Object.create(null)` 派生场景）。显式写 `new Date(value.getTime())`、`new RegExp(value.source, value.flags)` 语义明确、更可靠。

4. **`typeof null === 'object'`**：`isObject` 函数必须显式排除 `null`，否则 `deepClone(null)` 会走到递归分支。

5. **Map 和 Set 的 key 也可能是对象，需要递归拷贝**：`new Map([[objKey, value]])` 中 `objKey` 也需要 `deepClone`。

## 相关阅读

- [JavaScript 深拷贝](../JavaScript/deep-clone.md) -- 深拷贝的原理，包括浅拷贝、structuredClone 等
- [手写 Promise](./promise.md) -- 同样涉及递归和引用传递的处理
- [snippets/deep-clone](../snippets/ts/deep-clone.ts) -- 项目中的深拷贝工具代码

## 更新记录

- 2026-07-05：Phase 2 填充完整实现
- 2026-07：初始占位（Phase 1）

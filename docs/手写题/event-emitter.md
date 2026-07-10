---
title: 手写 EventEmitter
description: 手写实现 EventEmitter，包含 on、off、emit、once
category: 手写题
type: exercise
score: 78
difficulty: 中级
frequency: ⭐⭐⭐⭐
status: reviewed
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - EventEmitter
  - on
  - off
  - emit
  - once
---

# 手写 EventEmitter

> ⭐⭐⭐⭐｜难度：中级｜项目：★★★

## 一句话总结

**EventEmitter 是发布订阅模式的实现，核心是一个 `events` 映射表（key 是事件名，value 是回调数组），on 注册回调、emit 遍历调用、off 删除回调、once 用高阶函数包装一次后自动取消。**

## 核心机制

```typescript
// ========== 类型定义 ==========
type Listener = (...args: any[]) => void;

interface EventsMap {
  [event: string]: Listener[];
}

// ========== EventEmitter 实现 ==========
class EventEmitter {
  private events: EventsMap = Object.create(null);

  /**
   * 注册事件监听
   * @returns this（支持链式调用）
   */
  on(event: string, listener: Listener): this {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    // 允许同一个函数多次注册（每次注册都是独立的监听）
    this.events[event].push(listener);
    return this;
  }

  /**
   * 移除事件监听
   * - 传 listener：只移除该回调
   * - 不传 listener：移除该事件的所有回调
   */
  off(event: string, listener?: Listener): this {
    const listeners = this.events[event];
    if (!listeners) return this;

    if (!listener) {
      // 移除所有
      delete this.events[event];
      return this;
    }

    // 移除指定回调：从后往前遍历，避免 splice 影响索引
    for (let i = listeners.length - 1; i >= 0; i--) {
      if (
        listeners[i] === listener ||
        (listeners[i] as any).__original === listener // 兼容 once() 包装的 wrapper
      ) {
        listeners.splice(i, 1);
        // 不 break —— 同一个函数可能被多次 on，全部移除
      }
    }

    // 如果队列空了，清理 key
    if (listeners.length === 0) {
      delete this.events[event];
    }
    return this;
  }

  /**
   * 触发事件
   * - 按注册顺序依次执行回调
   * - 安全迭代：拷贝队列后再遍历，防止 emit 过程中 off 导致索引错乱
   * - 错误隔离：一个回调报错不影响后续回调
   */
  emit(event: string, ...args: unknown[]): boolean {
    const listeners = this.events[event];
    if (!listeners || listeners.length === 0) return false;

    // 安全迭代：拷贝一份 snapshot，防止 emit 过程中 off 影响遍历
    const snapshot = [...listeners];

    for (const listener of snapshot) {
      try {
        listener(...args);
      } catch (error) {
        // 错误隔离：打印日志但不阻断其他回调
        console.error(`[EventEmitter] Error in event "${event}":`, error);
      }
    }

    return true;
  }

  /**
   * 只监听一次，触发后自动移除
   * @returns this（链式调用）
   */
  once(event: string, listener: Listener): this {
    // 用高阶函数包装：触发后执行原始 listener 并调用 off
    const wrapper: Listener = (...args: unknown[]) => {
      this.off(event, wrapper); // 先移除自己
      listener(...args);        // 再执行原回调
    };

    // 保存原始函数引用，供外部 off 时精确匹配
    (wrapper as any).__original = listener;

    this.on(event, wrapper);
    return this;
  }

  /**
   * 获取事件的所有监听器
   */
  listeners(event: string): Listener[] {
    return this.events[event] ? [...this.events[event]] : [];
  }

  /**
   * 获取事件数量
   */
  listenerCount(event: string): number {
    return this.events[event] ? this.events[event].length : 0;
  }

  /**
   * 获取所有事件名
   */
  eventNames(): string[] {
    return Object.keys(this.events);
  }

  /**
   * 移除所有监听器
   */
  removeAllListeners(event?: string): this {
    if (event) {
      delete this.events[event];
    } else {
      this.events = Object.create(null);
    }
    return this;
  }
}

// ==================== 测试用例 ====================

const ee = new EventEmitter();

// ----- on + emit -----
const fn1 = (msg: string) => console.log('fn1:', msg);
const fn2 = (msg: string) => console.log('fn2:', msg);

ee.on('data', fn1);
ee.on('data', fn2);
ee.emit('data', 'hello');
// 输出：fn1: hello   |  fn2: hello

// ----- 链式调用 -----
ee.on('click', () => console.log('click1'))
  .on('click', () => console.log('click2'))
  .emit('click');
// 输出：click1  |  click2

// ----- off：移除指定回调 -----
ee.off('data', fn1);
ee.emit('data', 'after off');
// 只输出：fn2: after off

// ----- off：移除事件全部回调 -----
ee.off('data');
console.log(ee.emit('data', 'none')); // false（没有监听器）

// ----- once：只执行一次 -----
ee.once('init', () => console.log('init once'));
ee.emit('init'); // 输出：init once
ee.emit('init'); // 无输出
console.log(ee.listenerCount('init')); // 0

// ----- 同一函数多次注册：保留多次 -----
const handler = () => console.log('multi');
ee.on('multi', handler);
ee.on('multi', handler);   // 相同函数注册两次
console.log(ee.listenerCount('multi')); // 2

ee.off('multi', handler);  // 全部移除（从后往前，两次都删掉）
console.log(ee.listenerCount('multi')); // 0

// ----- emit 过程中 off 当前事件：安全迭代 -----
const ee2 = new EventEmitter();
const selfRemover = () => ee2.off('test', selfRemover);
ee2.on('test', () => console.log('A'));
ee2.on('test', selfRemover);
ee2.on('test', () => console.log('B'));
ee2.emit('test'); // 输出 A 和 B，selfRemover 自己也被调用（因为用了 snapshot）

// ----- 错误隔离：一个回调报错不影响其他回调 -----
const ee3 = new EventEmitter();
ee3.on('error', () => { throw new Error('oops'); });
ee3.on('error', () => console.log('still running'));
ee3.emit('error');
// 先打出 "still running"（因为 for...of 遍历拷贝的数组）
// 然后 console.error 打印 oops
```

## 深度拓展

### 追问点 1：为什么 emit 时要拷贝回调数组？

```typescript
// 面试官追问：emit 过程中 off 当前事件会发生什么？

// ❌ 不拷贝，直接遍历 this.events[event]：
// 假设注册了 [A, B, C]，B 回调中调用了 this.off('x', B)
// splice 移除 B 后，数组变为 [A, C]，此时循环索引已经错位，C 可能被跳过

// ✅ 正确做法：浅拷贝一份快照
const snapshot = [...listeners];
// 遍历 snapshot，原数组的修改不影响迭代
for (const listener of snapshot) {
  listener(...args);
}
```

### 追问点 2：同一个函数多次 `on` 注册要不要去重？

```typescript
// Node.js 的 EventEmitter 不去重，每次 on 都独立注册
// 面试时先说"不去重"，然后解释为什么：
// 1. 多次注册是合理的（比如不同模块各自注册同一个 handler）
// 2. 去重需要额外判断，影响性能
// 3. 去重会违反用户意图（"我 on 了两次就是要执行两次"）

// off 时对应处理：从后往前遍历，移除所有匹配的回调（不止一个）
// one by one, and if a same function was registered multiple times, all got removed
```

### 追问点 3：once 的实现原理和 off 兼容性？

```typescript
// once 的核心：用一个 wrapper 函数包装原始回调
const wrapper = (...args) => {
  this.off(event, wrapper); // 触发一次后移除
  listener(...args);
};

// 问题：外部调用 off(event, listener) 无法移除 once 注册的回调
// 因为 events 中存的是 wrapper，不是 listener 本身

// 解决方案：给 wrapper 挂一个属性指向原始函数
wrapper.__original = listener;

// 如果是库级别的实现，还需要在 off 中检查这个属性：
off(event: string, listener?: Listener): this {
  // ...
  for (let i = listeners.length - 1; i >= 0; i--) {
    if (
      listeners[i] === listener ||
      (listeners[i] as any).__original === listener // 检查 once 包装的
    ) {
      listeners.splice(i, 1);
    }
  }
}
```

## 项目实战

```typescript
// 场景1：微前端主子应用通信（发布订阅模式）
class MicroFrontendBus extends EventEmitter {
  private static instance: MicroFrontendBus;

  static getInstance() {
    if (!this.instance) {
      this.instance = new MicroFrontendBus();
    }
    return this.instance;
  }
}

const bus = MicroFrontendBus.getInstance();
bus.on('user:login', (user) => { /* 子应用响应 */ });
bus.emit('user:login', { id: 1, name: 'Alice' });

// 场景2：表单联动
class FormEvents extends EventEmitter {
  onFieldChange(fieldName: string, handler: (value: any) => void) {
    this.on(`field:${fieldName}:change`, handler);
  }

  onChange(fieldName: string, value: any) {
    this.emit(`field:${fieldName}:change`, value);
  }
}

const formEvents = new FormEvents();
formEvents.onFieldChange('city', (city) => {
  // 城市变化 → 联动更新区域选项
  console.log('城市变化为：', city);
});
formEvents.onChange('city', 'Beijing');

// 场景3：自定义 React Hook
function useEventEmitter() {
  const [emitter] = useState(() => new EventEmitter());

  useEffect(() => {
    return () => emitter.removeAllListeners(); // 组件卸载时清理
  }, [emitter]);

  return emitter;
}
```

## 易错点

1. **emit 过程中 off 导致索引错乱**：直接遍历原数组 + splice 会让某些回调被跳过。必须拷贝一份 snapshot。

2. **once 包装后原始 listener 无法 off**：外部 `off(event, originalFn)` 失效，因为 map 里存的是 wrapper。需要 `wrapper.__original = listener` 并在 off 中多一层判断。

3. **同一个函数多次 on 时 off 未完全移除**：如果只 break，只移除第一个匹配项。应该从后往前遍历，移除全部。

4. **错误未隔离**：一个回调抛出错误会阻断后续回调执行。必须 try-catch 包裹每个回调的调用。

5. **事件名用 string 可能冲突**：大型应用中建议用 Symbol 做事件名，或在命名上加模块前缀（如 `user:login`）。

## 相关阅读

- [手写 Promise](./promise.md) -- Promise 的回调队列与 EventEmitter 的 listener 数组有相似设计
- [手写 compose/pipe](./compose-pipe.md) -- 函数组合，可以配合 EventEmitter 实现中间件管道
- JavaScript 发布订阅模式 -- 发布订阅 vs 观察者模式对比
- [snippets/event-emitter](../../snippets/ts/event-emitter.ts) -- 项目中的 EventEmitter 工具代码

## 更新记录

- 2026-07-05：Phase 2 填充完整实现
- 2026-07：初始占位（Phase 1）

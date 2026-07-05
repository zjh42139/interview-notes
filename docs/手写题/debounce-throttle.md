---
title: 手写 debounce / throttle
description: 手写实现防抖和节流函数
category: 手写题
difficulty: 初级
frequency: ⭐⭐⭐⭐
status: filled
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - debounce
  - throttle
  - 防抖
  - 节流
---

# 手写 debounce / throttle

> ⭐⭐⭐⭐｜难度：初级｜项目：★★★

## 一句话总结

**防抖（debounce）是"你一直触发我就不动，等你停了 n 毫秒我再执行"；节流（throttle）是"不管你怎么触发，我每 n 毫秒最多执行一次"。** 核心区别是防抖重置计时器，节流忽略高频触发。

## 核心机制

### debounce 完整实现

```typescript
interface DebounceOptions {
  /** 是否在开始时立即执行（默认 false） */
  leading?: boolean;
  /** 是否在延迟结束后执行（默认 true） */
  trailing?: boolean;
}

interface DebouncedFn<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T> | undefined;
  /** 取消延迟中的调用，不触发 trailing */
  cancel: () => void;
  /** 立即执行，不等延迟，重置计时器 */
  flush: (...args: Parameters<T>) => ReturnType<T> | undefined;
}

function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  options: DebounceOptions = {}
): DebouncedFn<T> {
  const { leading = false, trailing = true } = options;

  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any = null;
  let result: ReturnType<T> | undefined;

  // 启动 trailing 计时器
  const startTimer = (invokeFn: () => void) => {
    timer = setTimeout(invokeFn, delay);
  };

  // 执行 fn（trailing 回调）
  const invoke = () => {
    timer = null;
    if (lastArgs) {
      result = fn.apply(lastThis, lastArgs);
      lastArgs = null;
      lastThis = null;
    }
  };

  // 取消
  const cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    lastArgs = null;
    lastThis = null;
  };

  // 立即执行
  const flush = function (this: any, ...args: Parameters<T>) {
    cancel();
    return fn.apply(this, args);
  } as DebouncedFn<T>['flush'];

  function debounced(this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
    lastArgs = args;
    lastThis = this;

    // leading：首次触发立即执行
    if (leading && timer === null) {
      result = fn.apply(lastThis, lastArgs);
      lastArgs = null;
      lastThis = null;
    }

    // 重置计时器
    if (timer !== null) {
      clearTimeout(timer);
    }

    // trailing：延迟后执行
    if (trailing) {
      startTimer(invoke);
    }

    return result;
  }

  debounced.cancel = cancel;
  debounced.flush = flush;

  return debounced as DebouncedFn<T>;
}
```

### throttle 完整实现（两种方式对比）

```typescript
interface ThrottleOptions {
  /** 首次是否立即执行（默认 true） */
  leading?: boolean;
  /** 最后一次是否执行（默认 true） */
  trailing?: boolean;
}

// ========== 方式1：时间戳（首次立即执行，最后一次不执行）==========
function throttle_timestamp<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

// ========== 方式2：定时器（首次延迟执行，最后一次会执行）==========
function throttle_timer<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    if (timer === null) {
      timer = setTimeout(() => {
        timer = null;
        fn.apply(this, args);
      }, delay);
    }
  };
}

// ========== 终极版：支持 leading + trailing 的 throttle ==========
function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  options: ThrottleOptions = {}
): (...args: Parameters<T>) => void {
  const { leading = true, trailing = true } = options;

  let lastTime = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();

    // 首次调用时，如果 leading 为 false，设置 lastTime = now
    if (lastTime === 0 && !leading) {
      lastTime = now;
    }

    // 距离下次可执行剩余的时间
    const remaining = delay - (now - lastTime);

    if (remaining <= 0) {
      // 时间到了，立即执行
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      lastTime = now;
      fn.apply(this, args);
    } else if (trailing && !timer) {
      // 时间没到但需要 trailing，设置定时器兜底
      timer = setTimeout(() => {
        timer = null;
        lastTime = leading ? Date.now() : 0; // 重置 lastTime
        fn.apply(this, args);
      }, remaining);
    }
  };
}

// ==================== 使用示例 ====================

// ---------- debounce 示例 ----------
// 搜索框：用户停止输入 300ms 后发请求
const searchInput = document.getElementById('search');
searchInput?.addEventListener('input', debounce(
  (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    console.log('搜索：', value);
    // fetch(`/api/search?q=${value}`)
  },
  300,
  { leading: false, trailing: true }
));

// 表单提交按钮：首次点击立即生效，防止连续提交
const submitBtn = document.getElementById('submit');
submitBtn?.addEventListener('click', debounce(
  () => {
    console.log('提交表单');
    // submitForm()
  },
  1000,
  { leading: true, trailing: false }
));

// ---------- throttle 示例 ----------
// 滚动事件：每 200ms 最多执行一次
window.addEventListener('scroll', throttle(
  () => {
    console.log('滚动位置：', window.scrollY);
    // 更新侧边栏高亮等
  },
  200
));

// 拖拽跟随：mousemove 每 50ms 更新位置
document.addEventListener('mousemove', throttle(
  (e: MouseEvent) => {
    // tooltip.style.left = e.clientX + 'px';
    // tooltip.style.top = e.clientY + 'px';
  },
  50
));

// ==================== 测试用例 ====================

// debounce cancel 测试
const log = debounce(console.log, 1000);
log('A');
log('B');
log.cancel(); // 取消，"B" 不会被打印

// debounce flush 测试
const log2 = debounce(console.log, 500);
log2('C');
log2('D');
setTimeout(() => log2.flush('立即'), 100); // 立即打印 "立即"，之前的取消
```

## 深度拓展

### 追问点 1：leading 和 trailing 怎么配合？

```
leading=true, trailing=true  → 首次立即执行，停止后还会再执行一次（保证最后一次）
leading=true, trailing=false → 首次立即执行，停止后不再执行（防连续提交）
leading=false, trailing=true → 首次不执行，停止 delay ms 后执行一次（搜索框）
leading=false, trailing=false → 啥也不执行（无意义组合）
```

### 追问点 2：debounce 怎么保留 this 和传参？

```typescript
// 关键：在包装函数中保存 this 和 args
function debounced(this: any, ...args: Parameters<T>) {
  lastThis = this;
  lastArgs = args;
  // ...
  // 最终调用时：
  fn.apply(lastThis, lastArgs);
}

// 如果不保留 this，在对象方法上使用会丢失：
const obj = {
  name: 'test',
  log() { console.log(this.name); }
};
// obj.logDebounced() 如果不保存 this，内部 this 就是 globalThis
```

### 追问点 3：throttle 时间戳和定时器版本的差异？

| 特性 | 时间戳版 | 定时器版 |
|------|----------|----------|
| 首次是否执行 | 立即执行 | 延迟 delay ms 后 |
| 最后一次 | 不执行 | 会执行（兜底） |
| 适用场景 | 需要立即响应 | 需要保证最后一次 |

最终版把两者结合，用 `leading` 和 `trailing` 控制。

## 项目实战

```typescript
// Vue 3 Composition API 中的用法
import { ref } from 'vue';

// 搜索框防抖 hook
function useDebouncedSearch(delay = 300) {
  const keyword = ref('');
  const results = ref<any[]>([]);

  const doSearch = debounce(async (kw: string) => {
    // const res = await fetch(`/api/search?q=${kw}`);
    // results.value = await res.json();
    console.log('实际搜索：', kw);
  }, delay, { trailing: true });

  return { keyword, results, doSearch };
}

// 无限滚动节流 hook
function useInfiniteScroll(callback: () => void, threshold = 200) {
  const onScroll = throttle(() => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      callback();
    }
  }, 300);

  window.addEventListener('scroll', onScroll);
}
```

## 易错点

1. **debounce 中忘记保存 `this`**：在对象方法上使用时 this 会丢失。保存 `lastThis` 并在最终调用时 `apply`。

2. **throttle 时间戳版 `lastTime = 0`** 导致首次必然执行。如果需要 `leading: false`，必须把 `lastTime` 初始化为当前时间。

3. **事件回调中直接写 debounce(fn, 300)** 会导致每次渲染都创建新的 debounce 实例，相当于没防抖。必须在组件外部或 `useRef`/`useMemo` 中保持引用。

4. **debounce 的 timer 清理**：组件卸载时必须手动 `cancel()` 防止内存泄漏。

5. **throttle trailing 计时器的 `remaining` 计算**：`remaining = delay - (now - lastTime)`，如果忽略 `remaining <= 0` 的情况而直接用 `remaining` 创建定时器可能导致负值。

## 相关阅读

- [JavaScript 防抖节流](../JavaScript/debounce-throttle.md) -- 防抖节流的原理和应用场景
- [手写 compose/pipe](./compose-pipe.md) -- 函数组合，与防抖节流在工具函数设计上风格一致
- [JavaScript 闭包](../JavaScript/closure.md) -- debounce/throttle 内部 timer 的实现依赖闭包保存状态

## 更新记录

- 2026-07-05：Phase 2 填充完整实现
- 2026-07：初始占位（Phase 1）

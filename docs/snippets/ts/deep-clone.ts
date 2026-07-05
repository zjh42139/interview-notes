/**
 * 深拷贝
 * @see ../../手写题/deep-clone.md
 * @see ../../JavaScript/deep-clone.md
 *
 * Phase 2 填充完整实现
 */
export function deepClone<T>(obj: T, map = new WeakMap()): T {
  // placeholder
  return JSON.parse(JSON.stringify(obj))
}

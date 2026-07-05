/**
 * useRequest - 请求管理 composable
 * @see ../../项目实战/基础设施/axios-encapsulation.md
 *
 * Phase 3 填充完整实现
 */
import { ref, type Ref } from 'vue'

export function useRequest<T>(fetcher: () => Promise<T>) {
  const data: Ref<T | null> = ref(null)
  const loading = ref(false)
  const error: Ref<Error | null> = ref(null)
  // TODO: Phase 3
  return { data, loading, error }
}

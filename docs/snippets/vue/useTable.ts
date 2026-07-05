/**
 * useTable - 表格数据管理 composable
 * @see ../../项目实战/业务场景/big-data-table.md
 *
 * Phase 3 填充完整实现
 */
import { ref, type Ref } from 'vue'

export interface UseTableOptions {
  fetchApi: (params: any) => Promise<any>
  pageSize?: number
}

export function useTable(options: UseTableOptions) {
  const data: Ref<any[]> = ref([])
  const loading = ref(false)
  // TODO: Phase 3
  return { data, loading }
}

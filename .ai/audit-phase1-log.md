# Phase 1-2 审计工作记录（临时文件，Phase 5 结束后删除）

> 汇总各 apply agent 报告的覆盖率缺口和待办，供 Phase 2/3/5 使用

## 已完成的题库修改

| 模块 | 状态 | 权重调整 | 新增题 | build |
|------|------|---------|--------|-------|
| 浏览器 | ✅ | 8 处 | 0（走交叉引用：async/defer→HTML Q6、Web Vitals→性能 Q2） | ✅ 43s |
| 网络 | ✅ | 6 处 | Q17 GET vs POST（链 http-methods.md 精准匹配） | ✅ 54s |
| CSS | ✅ | 4 处 + Q12/Q17 合并 + Q18 层叠 !important 事实错误顺手修正 | +5（Q18-Q22 全有精准文件） | ✅ 44s |
| HTML | ✅ | 3 处 + Q7/Q2 表述修正 | +3（Q18 a11y、Q19 HTML5 总览、Q20 src-href） | ✅ 56s |
| 性能优化 | ✅ | Q11→5星改INP + Q8→3星 | +2（Q12 定位方法论、Q13 监控采集） | ✅ 52s |
| 算法 | ✅ | 7 处 + 回文链接修复 + 全表重编号 1-40 | +12 行（11 有链接） | ✅ |
| TypeScript | ✅ | 6 处 | +6（Q19-Q24） | ✅ 44s |
| 工程化 | ✅ | 4 处 + 编号重排 Q1-Q16 连续 | +3（Q14 预构建、Q15 Rspack、Q16 迁移） | ⚠️ 见下 |
| Git | ✅ | 3 处降星 + master→main | +3（Q9 协作流、Q10 合并 commit、Q11 fetch/pull） | ✅ 55s |
| 手写题 | ✅ | 4 处 + 捆绑行拆 3 | +10 行（6 有链接） | ✅ 56s |
| Vue3 | ✅ | 7 处 + 5星区重排（新 Q5/Q6/Q7） | +3（Q20 v-if/v-show、Q21 异步组件、Q22 composables） | ✅ 49s |
| Pinia | ✅ | 3 处 + Q1 两条 P0 事实错误修正 | +3（Q8 原理、Q9 边界、Q10 场景） | ✅ 45s |
| VueRouter | ✅ | Q6 重写 VR4 语义降 2 星 + Q3 通配符修正 | +3（Q8 VR4、Q9 params/query、Q10 参数监听） | ✅ 48s |
| HR | ✅ | 4 处 × 2 文件同步 + Q12 补入题库版 | +2 × 2 文件（Q16 offer 博弈、Q17 空窗期） | ✅ |
| CICD | ✅ | 2 处 + Q3 参考改指 eslint-husky.md | +2（Q5 更新通知、Q6 部署缓存） | ✅ 45s |
| 前端架构 | ✅ | Q3 升星改五方案口径 + 定位语改写 | +6（Q4-Q9，3→9 题） | ✅ 47s（修复了 node_modules 损坏） |

### 前端架构模块覆盖缺口（Phase 3 重点核查）
- [ ] **qiankun.md 缺 LegacySandbox**（只讲了 Snapshot 和 Proxy 两种），with(proxy) 机制未展开
- [ ] overview.md 对比表缺 micro-app 和 wujie（Q3 五方案口径超出覆盖）
- [ ] **design-patterns.md 把观察者和发布订阅当同一模式讲**——两者区别（有无中介）是 Q9 核心考点
- [ ] 「共享 store 风险」论述较薄

### ⚠️ 环境事件
- node_modules 曾损坏（顶层只剩 mermaid/vitepress，vue 软链丢失），前端架构 agent 已用 `pnpm install --frozen-lockfile` 恢复——正是此前 CICD/docker.md 瞬时报错的根因

### CICD 模块覆盖缺口
- [ ] Q5 版本更新通知无任何知识文件（version.json/SW 检测）
- [ ] Q6 部署侧缓存策略缺部署视角文件 → 建议后续新建 CICD/deploy-strategy.md 承接两题

### HR 双文件重复维护隐患（决策留给用户）
- `面试题库/HR.md` 与 `HR/面试题.md` 内容完全重复（仅链接前缀不同），本次 15 处改动都做了两遍
- 历史已发生一次漂移（Q12 缺失、计数不一致）
- **建议合并为单一来源，待用户决策**

### Pinia 模块覆盖缺口
- [ ] Q8 响应式原理无精准文件（effectScope/单例注册/app 注入无专文）
- [ ] **Q9 状态边界完全无对应知识文件**——判断三原则只存在于题库 30 秒答里，最大缺口
- [ ] Q10 场景一「query vs Pinia 双方案」无专门文件

### VueRouter 模块覆盖缺口
- [ ] **Q8 VR4 新特性无精准知识文件**（2026 权重最高考点）→ 建议补 vue-router-4-migration.md
- [ ] Q10 缺 watch/key/守卫三方案系统对比的单篇
- [ ] **P0 一致性隐患：navigation-failures.md 本身仍是 VR3 口径**（try/catch 接 push reject、redirected 类型），与重写后的 Q6 矛盾 → Phase 3 必修

### Vue3 模块覆盖缺口
- [ ] Q20 v-if vs v-show 是 5 星题但无 🎤 回答稿（知识文件 template-syntax.md 精准匹配无缺口）

### 手写题模块覆盖缺口（无实现文件）
- [ ] Object.create 实现
- [ ] JSON.stringify 实现
- [ ] CSS 三角形/扇形
- [ ] 圆形进度条
- [ ] flatten-unique-sort.md 未讨论 NaN 细节（indexOf vs includes 的 SameValueZero 差异）

### ⚠️ 工程化 agent 曾用 git stash 测 build，手写题.md 一度被写回旧版后恢复
- 最终所有 agent 完成后，需抽查各文件关键标记确认改动都在位（特别是同时段完成的文件）

### Git 模块覆盖缺口
- [ ] Q9 日常协作流程无专文（挂 git-flow.md 近似匹配）
- [ ] Q11 fetch vs pull 缺口最大——无任何文件讲 fetch/pull/FETCH_HEAD → 建议补 fetch-vs-pull.md

### 工程化模块覆盖缺口
- [ ] **Rspack/Turbopack/Rolldown 无任何知识文件**（Q15 挂靠 babel-esbuild.md）——最大缺口
- [ ] 迁移实战无专门文件（import.meta.glob 等内容知识库完全缺失）

### ⚠️ 并行 build 干扰现象（最终需串行 build 一次定论）
- TS agent 和工程化 agent 都在 build 中撞到 `docs/CICD/` 文件的瞬时报错（docker.md `vue/server-renderer` resolve 失败），重试后消失
- 疑似并发 vitepress build 共享 .vitepress/cache 互相干扰
- **所有 agent 完成后必须跑一次干净的串行 build 定论**

### TypeScript 模块覆盖缺口
- [ ] Q20 联合 vs 交叉：无专门文件，basic-types.md 仅一行交叉类型示例
- [ ] Q22 类型断言：无专门文件（as/!/双重断言），satisfies.md 只有部分对比
- [ ] Q23 运行时校验：zod 在 TS 知识目录零提及

## Phase 2 覆盖率缺口（apply agent 反馈）

### 网络模块
- [ ] `网络/http-methods.md` 未提及 `Expect: 100-continue`（Q17 考察点）→ Phase 3 顺带补
- [ ] Q17 GET vs POST 是 ⭐⭐⭐⭐⭐ 但无 🎤 回答稿
- [ ] Q9 HTTP 缓存升五星后 🎤 指向 http-https 回答稿，无专门 http-cache 回答稿
- [ ] `网络/websocket-sse.md` 对短轮询/长轮询仅顺带提及，Q7 扩展后知识文件覆盖不全 → Phase 3 顺带补小节

### VueRouter 模块（真题校验发现，apply 进行中）
- [ ] VR4 新特性（useRouter/useRoute/pathMatch）疑似无专门知识文件——apply agent 确认中
- [ ] Q6 导航故障知识文件 `navigation-failures.md` 若也是 VR3 写法 → Phase 3 事实审计重点核查
- [ ] `VueRouter/route-guards.md` 等文件中如有 `*` 通配符写法 → Phase 3 重点核查

### CSS 模块
- [ ] Q20 position 五值 ⭐⭐⭐⭐⭐ 无 🎤 回答稿（Q18/Q19 已挂现有回答稿）

### HTML 模块
- [ ] Q19 HTML5 新特性总览无专门知识文件，暂指 index.md → 建议后续新建 html5-overview.md
- [ ] accessibility.md 未展开 aria-describedby、fieldset、inert 三个点 → Phase 3 顺带补

### 性能优化模块
- [ ] 缺端到端「线上 LCP 排查实战案例」文件（现有 performance-devtools.md 偏工具讲解）
- [ ] 「RUM vs 实验室数据」「基线→告警」无专门章节（散在两个文件的易错点）

### 算法模块（题库行已加但知识文件内容缺）
- [ ] **单调队列完全无覆盖**——stack-queue.md 只有单调栈，滑动窗口最大值的 deque 解法全库没有
- [ ] hash.md 未具体讲字母异位词、最长连续序列
- [ ] 最长回文子串中心扩展法无专门内容
- [ ] matrix.md 缺失（螺旋矩阵无支撑，题库行纯文本无链接）

### 各真题校验报告中「未列入 apply」的次级建议（记录备查）
- HTML: Q16 dialog/Popover 明年可能升级（趋势标注）
- 性能: 边缘渲染/岛屿架构（低优先级，未加）
- 手写题: P2/P3 级题目未加（数组交集/单例/模板解析/断点续传/sleep 等）
- 算法: P3 级未加（相交链表/Trie）
- TS: AI 场景题未加（非 AI 岗）
- CSS: P3 级未加（画三角形已由手写题 CSS 分类覆盖、link vs @import 老八股）

## 待汇报给用户的关键决策
- 浏览器/网络的升五星题缺回答稿 → Phase 2 统计后统一决定是否补写

## Phase 5 附带发现（各报告尾注）
- [ ] JS 题库标题乱码（apply agent 处理中，确认结果）
- [ ] 工程化题号跳跃 Q8→Q10、Q12→Q14（apply agent 处理中）
- [ ] 算法第 28 题链接文本与目标不一致（apply agent 处理中）
- [x] 网络/index.md「15 道」→17（网络 apply agent 已顺手修）
- [x] 面试题库/index.md 网络计数 16→17（已修）

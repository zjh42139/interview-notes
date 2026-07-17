# Phase 1 真题校验完整报告

> 执行日期: 2026-07-18 ｜ 范围: 全部 17 个模块题库 ｜ 提交: cb5d726
>
> 方法: 每模块搜索 10-20 个近半年面经来源（牛客/掘金/小红书/语雀/CSDN/面试鸭/GreatFrontend 等），提取高频考点，与现有题库做差集，逐模块应用修正。

## 一、总量变化

| 指标 | 校验前 | 校验后 |
|------|--------|--------|
| 题目总数 | ~284 | ~340（+56） |
| 权重调整 | — | ~70 处 |
| P0 事实错误修正 | — | 6 组 |
| 格式/结构修复 | — | ~30 处 |

## 二、各模块覆盖率与修改明细

| 模块 | 校验前覆盖率 | 新增 | 权重调整 | 关键动作 |
|------|:---:|:---:|:---:|------|
| JavaScript | **96%**（最高） | 0 | 5 | 深拷贝补 structuredClone、Q32 XHR→fetch+AbortController、16 处标题乱码修复 |
| 浏览器 | 85% | 0 | 8 | 「高星过密」矫正（17/20 题 4 星+ → 恢复区分度）、Q17/Q18 补模板段落、async-defer/Web Vitals 走交叉引用 |
| Vue3 | 85% | +3 | 7 | v-if vs v-show（唯一完全缺失的秒答级必考）、异步组件、composables；ref vs reactive 等 3 题升 5 星并重排 |
| 网络 | 80% | +1 | 6 | GET vs POST（面经第一高频）、Q4 扩展跨域全景、Q7 扩展四方案实时通信 |
| HTML | 80% | +3 | 3 | a11y/ARIA（2026 区分度考点零覆盖）、HTML5 总览、src vs href |
| 性能优化 | 75-80% | +2 | 2 | 性能定位方法论（LCP 4.2s 排查场景题）、监控采集；Q11 TBT→INP 升 5 星 |
| 工程化 | 72% | +3 | 4 | Vite 预构建（追问最深的必考题）、Rspack/Turbopack（Rust 工具链零覆盖）、迁移实战；编号重排 |
| Pinia | 70% | +3 | 3 | **Q1 两条 P0 事实错误修正**；响应式原理、状态边界（具名真题）、场景设计 |
| HR | 70% | +2×2 | 4×2 | offer 博弈/空窗期（十大必问唯二缺失）；双文件同步（Q12 补入题库版） |
| TypeScript | 70% | +6 | 6 | 可辨识联合（2026 第一实战题）、联合vs交叉、模板字面量、断言体系、类型擦除、结构化类型 |
| CSS | 60% | +5 | 4 | 盒模型/flex:1（必考第一题此前缺失）、position 五值、Container Queries、回流重绘；Q12/Q17 重复合并 |
| VueRouter | 60% | +3 | 1 | **Q6 重写 VR4 语义**、Q3 通配符修正；VR4 新特性（2026 权重最高缺失）、params/query、参数监听 |
| Git | 60% | +3 | 3 | 日常协作流（真实面经出现率最高）、合并 commit（字节真题）、fetch vs pull；中部虚高降星 |
| 算法 | 55-60% | +12 行 | 7 | 二梯队补齐（DFS/双指针/哈希分组新建）、合并区间/岛屿数量/LIS；全表重编号 1-40 |
| 手写题 | 55-60% | +10 行 | 4 | CSS 手写分类新建（居中/圣杯/1px）、大数相加/去重/虚拟滚动；捆绑行拆分 |
| CICD | 50-60% | +2 | 2 | 部署后通知刷新（近半年最热部署题）、部署缓存策略 |
| 前端架构 | **25%**（最薄） | +6 | 1 | Monorepo 双题 + qiankun 沙箱/隔离/通信三连 + 设计模式；3→9 题；「P6+ 才问」过时定位语改写 |

## 三、P0 事实错误修正（把错误认知带进面试风险最高）

1. **Pinia**: 「Vuex5 借鉴 Pinia 将趋同」→ Vuex 5 从未发布，Pinia 就是 Vuex 5 RFC 的事实实现
2. **Pinia**: 「mutation 存在是因为 defineProperty 无法追踪赋值」→ 错误归因；真实理由是强制同步保证 DevTools 快照可追踪
3. **VueRouter**: Q6 整题 VR3 口径（catch 吞错）→ 重写为 VR4 的 NavigationFailure + isNavigationFailure
4. **VueRouter**: `*` 通配符 → VR4 已移除，改 `:pathMatch(.*)*`
5. **CSS**: @layer 跨层 !important 方向写反（后声明优先 → 先声明的赢），与自家知识文件矛盾
6. **性能优化**: Q11 锚点 TBT → INP（2024.3 起 INP 取代 FID）

## 四、内容现代化

- JS: structuredClone 成为深拷贝首选答案、fetch+AbortController 替代 XHR 重心
- HTML: loading=lazy「Chrome 77+」→ 全浏览器基线、去 IE 特指表述
- Git: master→main、VS Code 合并编辑器
- 工程化: 「Vite 生态追赶中」→「新项目默认选 Vite」、esbuild 官方拼写
- HR: jQuery→Vue 离职叙事更新、大厂写死卖点改调研方法论、补被裁场景话术

## 五、覆盖率缺口（Phase 2/3 待处理）

### 知识文件缺口（题库有题但无精准文件支撑）

| 优先级 | 缺口 | 影响题 |
|:---:|------|--------|
| 高 | VueRouter VR4 新特性专文 | Q8 ⭐⭐⭐⭐⭐（**补写中**） |
| 高 | Pinia 状态边界划分 | Q9 ⭐⭐⭐⭐（判断三原则只存在于题库 30 秒答） |
| 高 | Git fetch vs pull | Q11 ⭐⭐⭐⭐（全库无 FETCH_HEAD 内容） |
| 中 | 工程化 Rspack/Turbopack | Q15 ⭐⭐⭐⭐（挂靠 babel-esbuild.md） |
| 中 | CICD 部署策略（版本通知+缓存） | Q5/Q6 ⭐⭐⭐⭐ |
| 中 | TS 联合vs交叉、断言体系、运行时校验(zod) | Q20/Q22/Q23 |
| 中 | HTML html5-overview 总览 | Q19（暂指 index.md） |
| 中 | 算法 单调队列/matrix | 滑动窗口最大值、螺旋矩阵 |
| 低 | 手写题 Object.create/JSON.stringify/CSS 三角形/圆形进度条 | 表格行无链接 |

### 知识文件内容不足（文件在但深度不够，Phase 3 顺带处理）

- `微前端/qiankun.md` 缺 LegacySandbox（题库按三种沙箱出题）
- `微前端/overview.md` 对比表缺 micro-app/wujie
- `design-patterns.md` 把观察者和发布订阅当同一模式讲（两者区别恰是考点）
- `VueRouter/navigation-failures.md` 整篇仍是 VR3 口径（**与重写后的 Q6 矛盾，P0**）
- `网络/websocket-sse.md` 缺轮询小节、`http-methods.md` 缺 Expect: 100-continue
- `HTML/accessibility.md` 缺 aria-describedby/fieldset/inert
- `hash.md` 未讲字母异位词/最长连续序列

### 回答稿缺口（5 星题无 🎤）

- Vue3 Q20 v-if vs v-show、CSS Q20 position、网络 Q17 GET vs POST、网络 Q9 HTTP 缓存（现挂 http-https 不精准）
- Phase 2 补链完成后统计完整清单再决定是否补写

## 六、结构性发现（需用户决策）

**HR 双文件重复**: `面试题库/HR.md` 与 `HR/面试题.md` 内容完全重复（仅链接前缀不同），本次 15 处改动都做了两遍，历史已发生一次漂移（Q12 缺失）。建议合并为单一来源（保留题库版，HR 模块版改为跳转或删除）——删除涉及红线，待用户决策。

## 七、执行过程备注

- 17 个搜索 agent + 17 个 apply agent，全部并行执行
- 期间并发 build 曾导致 node_modules 损坏（已修复）和 3 次瞬时报错（均已排除）
- 最终串行 build 通过: 44.54s, 0 dead link
- TypeScript apply agent 曾因 API 超时挂掉一次，重试后完成

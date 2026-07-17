import { defineConfig } from 'vitepress'

export default defineConfig({
  base: process.env.BASE || '/',
  title: '前端面试知识库',
  description: '体系化的前端面试准备资料，以真实面试为标准',
  lang: 'zh-CN',
  lastUpdated: true,
  cleanUrls: true,

  // favicon 通过 transformHead 注入，确保 href 使用 VitePress
  // 已解析的 base（包括 --base CLI 覆盖），跨平台可靠
  transformHead({ siteData }) {
    return [
      ['link', { rel: 'icon', type: 'image/svg+xml', href: `${siteData.base}favicon.svg` }],
    ]
  },

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '复习路线', link: '/roadmap' },
      { text: '阅读指南', link: '/阅读指南' },
      { text: '写作规范', link: '/writing-rules' },
      { text: '更新日志', link: '/changelog' },
    ],

    sidebar: {
      '/JavaScript/': [
        { text: 'JavaScript 知识地图', link: '/JavaScript/' },
        {
          text: '核心基础',
          collapsible: false,
          items: [
            { text: 'this', link: '/JavaScript/this' },
            { text: 'call / apply / bind', link: '/JavaScript/call-apply-bind' },
            { text: 'new', link: '/JavaScript/new' },
            { text: '原型链', link: '/JavaScript/prototype-chain' },
            { text: 'class / extends / super', link: '/JavaScript/class-extends' },
            { text: '闭包', link: '/JavaScript/closure' },
            { text: 'var / let / const', link: '/JavaScript/var-let-const' },
            { text: '数组方法大全', link: '/JavaScript/array-methods' },
            { text: 'JS 模块化', link: '/JavaScript/modules' },
            { text: '类型转换', link: '/JavaScript/type-coercion' },
          ],
        },
        {
          text: '异步编程',
          collapsible: false,
          items: [
            { text: 'Event Loop', link: '/JavaScript/event-loop' },
            { text: 'Promise', link: '/JavaScript/promise' },
            { text: 'async / await', link: '/JavaScript/async-await' },
          ],
        },
        {
          text: '进阶工具',
          collapsible: false,
          items: [
            { text: 'Set / Map / WeakMap', link: '/JavaScript/set-map-weakmap' },
            { text: 'Symbol', link: '/JavaScript/symbol' },
            { text: 'Object 系列 API', link: '/JavaScript/object-api' },
            { text: 'Proxy / Reflect', link: '/JavaScript/proxy-reflect' },
            { text: '深拷贝', link: '/JavaScript/deep-clone' },
            { text: '防抖 / 节流', link: '/JavaScript/debounce-throttle' },
            { text: 'for...of vs for...in', link: '/JavaScript/for-of-for-in' },
            { text: '生成器 / 迭代器', link: '/JavaScript/generator-iterator' },
            { text: 'ArrayBuffer / TypedArray', link: '/JavaScript/arraybuffer-typedarray' },
            { text: '跨 Realm 场景', link: '/JavaScript/cross-realm' },
          ],
        },
      ],
      '/CSS/': [
        { text: 'CSS 知识地图', link: '/CSS/' },
        {
          text: '基础',
          collapsible: false,
          items: [
            { text: '盒模型', link: '/CSS/box-model' },
            { text: '选择器优先级', link: '/CSS/specificity' },
            { text: 'CSS 继承性', link: '/CSS/inheritance' },
          ],
        },
        {
          text: '布局',
          collapsible: false,
          items: [
            { text: '包含块/边界合并', link: '/CSS/containing-block-margin-collapse' },
            { text: 'position 定位', link: '/CSS/position' },
            { text: 'BFC', link: '/CSS/bfc' },
            { text: 'Flexbox', link: '/CSS/flexbox' },
            { text: '居中方案', link: '/CSS/center-layout' },
            { text: 'Grid', link: '/CSS/grid' },
            { text: '三栏布局', link: '/CSS/three-column-layout' },
            { text: '层叠上下文', link: '/CSS/stacking-context' },
          ],
        },
        {
          text: '适配',
          collapsible: false,
          items: [
            { text: 'rem / vw', link: '/CSS/rem-vw' },
            { text: '移动端 1px', link: '/CSS/mobile-1px' },
            { text: '响应式', link: '/CSS/responsive' },
          ],
        },
        {
          text: '细节',
          collapsible: false,
          items: [
            { text: '文本溢出省略', link: '/CSS/text-overflow' },
            { text: 'transition vs animation', link: '/CSS/transition-animation' },
            { text: '伪类 vs 伪元素', link: '/CSS/pseudo' },
          ],
        },
        {
          text: '性能',
          collapsible: false,
          items: [
            { text: 'CSS 渲染性能', link: '/CSS/css-performance' },
          ],
        },
        {
          text: '工程化',
          collapsible: false,
          items: [
            { text: 'CSS 变量', link: '/CSS/css-variables' },
            { text: 'BEM 命名', link: '/CSS/bem' },
            { text: 'CSS Modules / Scoped', link: '/CSS/css-modules-scoped' },
            { text: '@layer 级联层', link: '/CSS/at-layer' },
            { text: ':has() / 嵌套 / 容器查询', link: '/CSS/has-nesting-container' },
          ],
        },
      ],
      '/HTML/': [
        { text: 'HTML 知识地图', link: '/HTML/' },
        {
          text: '语义与结构',
          collapsible: false,
          items: [
            { text: 'HTML5 语义化', link: '/HTML/html5-semantic' },
            { text: 'DOCTYPE / Meta', link: '/HTML/doctype-meta' },
            { text: '块级 / 行内元素', link: '/HTML/block-inline' },
            { text: 'HTML 实体与编码', link: '/HTML/html-entities' },
          ],
        },
        {
          text: '资源与加载',
          collapsible: false,
          items: [
            { text: 'defer / async', link: '/HTML/script-defer-async' },
            { text: 'src / href', link: '/HTML/src-href' },
            { text: 'a 标签全面解析', link: '/HTML/a-tag' },
            { text: 'HTML5 表单', link: '/HTML/form-validation' },
            { text: '图片懒加载', link: '/HTML/lazy-loading' },
          ],
        },
        {
          text: '进阶主题',
          collapsible: false,
          items: [
            { text: 'Canvas vs SVG', link: '/HTML/canvas-svg' },
            { text: 'History API', link: '/HTML/history-api' },
            { text: 'iframe', link: '/HTML/iframe' },
            { text: 'Web Worker', link: '/HTML/web-worker' },
            { text: 'Web Components', link: '/HTML/web-components' },
            { text: 'SEO / SSR', link: '/HTML/seo-ssr' },
            { text: '可访问性 ARIA', link: '/HTML/accessibility' },
            { text: '响应式图片/Resource Hints', link: '/HTML/responsive-images-resource-hints' },
          ],
        },
      ],
      '/Git/': [
        { text: 'Git 知识地图', link: '/Git/' },
        {
          text: '核心操作',
          collapsible: false,
          items: [
            { text: 'Commit 规范', link: '/Git/commit-spec' },
            { text: 'merge vs rebase', link: '/Git/merge-vs-rebase' },
            { text: '冲突处理', link: '/Git/conflict-resolution' },
            { text: 'reset vs revert', link: '/Git/reset-vs-revert' },
          ],
        },
        {
          text: '分支操作',
          collapsible: false,
          items: [
            { text: 'stash', link: '/Git/stash' },
            { text: 'cherry-pick', link: '/Git/cherry-pick' },
            { text: 'tag', link: '/Git/tag' },
          ],
        },
        {
          text: '工作流与调试',
          collapsible: false,
          items: [
            { text: 'Git Flow', link: '/Git/git-flow' },
            { text: 'reflog/rebase -i/内部原理', link: '/Git/reflog-rebase-interactive' },
            { text: 'diff/log/blame/hooks', link: '/Git/diff-log-blame-hooks' },
            { text: 'bisect', link: '/Git/bisect' },
          ],
        },
      ],
      '/Vue3/': [
        { text: 'Vue3 知识地图', link: '/Vue3/' },
        {
          text: '核心机制',
          collapsible: false,
          items: [
            { text: 'Vue3 vs Vue2 对比', link: '/Vue3/vue3-vs-vue2' },
            { text: '响应式原理', link: '/Vue3/reactivity' },
            { text: 'computed / watch', link: '/Vue3/computed-watch' },
            { text: 'nextTick', link: '/Vue3/nextTick' },
            { text: 'Scheduler', link: '/Vue3/scheduler' },
            { text: 'Diff / Patch', link: '/Vue3/diff-patch' },
            { text: 'Renderer', link: '/Vue3/renderer' },
            { text: '全链路渲染流程', link: '/Vue3/vue3-full-pipeline' },
          ],
        },
        {
          text: '组件开发',
          collapsible: false,
          items: [
            { text: '组件通信', link: '/Vue3/component-communication' },
            { text: 'v-model', link: '/Vue3/v-model' },
            { text: '条件/列表渲染', link: '/Vue3/template-syntax' },
            { text: '透传 Attributes', link: '/Vue3/fallthrough-attrs' },
            { text: '异步组件/自定义指令', link: '/Vue3/async-components' },
            { text: '动态组件/插件/SSR', link: '/Vue3/dynamic-components-plugins-ssr' },
            { text: '插槽深入', link: '/Vue3/slots-deep' },
            { text: '生命周期', link: '/Vue3/lifecycle' },
            { text: 'KeepAlive', link: '/Vue3/keepalive' },
            { text: 'Teleport / Suspense', link: '/Vue3/teleport-suspense' },
            { text: 'Transition 动画', link: '/Vue3/transition-animation' },
          ],
        },
        {
          text: '模式与优化',
          collapsible: false,
          items: [
            { text: 'Composition API', link: '/Vue3/composition-api' },
            { text: 'Composables 实战', link: '/Vue3/composables-practice' },
            { text: '性能优化 Checklist', link: '/Vue3/vue3-performance' },
          ],
        },
      ],
      '/VueRouter/': [
        { text: 'Vue Router 知识地图', link: '/VueRouter/' },
        {
          text: '核心机制',
          collapsible: false,
          items: [
            { text: 'history / hash', link: '/VueRouter/history-vs-hash' },
            { text: '路由守卫', link: '/VueRouter/route-guards' },
            { text: '动态路由', link: '/VueRouter/dynamic-routing' },
            { text: '路由懒加载', link: '/VueRouter/lazy-loading' },
          ],
        },
        {
          text: '进阶与集成',
          collapsible: false,
          items: [
            { text: 'KeepAlive 集成', link: '/VueRouter/keepalive-integration' },
            { text: '导航故障处理', link: '/VueRouter/navigation-failures' },
            { text: 'scrollBehavior', link: '/VueRouter/scroll-behavior' },
          ],
        },
        {
          text: '辅助功能',
          collapsible: false,
          items: [
            { text: '路由元信息/传参', link: '/VueRouter/route-meta-props' },
            { text: '命名视图/过渡动画', link: '/VueRouter/named-views-transition' },
          ],
        },
      ],
      '/Pinia/': [
        { text: 'Pinia 知识地图', link: '/Pinia/' },
        {
          text: '核心概念',
          collapsible: false,
          items: [
            { text: 'defineStore', link: '/Pinia/defineStore' },
            { text: 'state', link: '/Pinia/state' },
            { text: 'getters', link: '/Pinia/getters' },
            { text: 'actions', link: '/Pinia/actions' },
          ],
        },
        {
          text: '生态与对比',
          collapsible: false,
          items: [
            { text: 'vs Vuex', link: '/Pinia/vs-vuex' },
            { text: '持久化', link: '/Pinia/persist' },
          ],
        },
        {
          text: '工程化',
          collapsible: false,
          items: [
            { text: '插件', link: '/Pinia/plugins' },
            { text: '进阶(组件外/TS/SSR)', link: '/Pinia/advanced' },
          ],
        },
      ],
      '/TypeScript/': [
        { text: 'TypeScript 知识地图', link: '/TypeScript/' },
        {
          text: '类型基础',
          collapsible: false,
          items: [
            { text: '基础类型 / 类型注解', link: '/TypeScript/basic-types' },
            { text: 'any / unknown / never', link: '/TypeScript/any-unknown-never' },
            { text: '类型兼容性', link: '/TypeScript/structural-typing' },
            { text: 'enum / class 类型', link: '/TypeScript/enum-class' },
          ],
        },
        {
          text: '类型收窄 & 断言',
          collapsible: false,
          items: [
            { text: '类型收窄', link: '/TypeScript/type-narrowing' },
            { text: 'as const', link: '/TypeScript/as-const' },
            { text: 'satisfies', link: '/TypeScript/satisfies' },
          ],
        },
        {
          text: '类型操作',
          collapsible: false,
          items: [
            { text: '泛型', link: '/TypeScript/generics' },
            { text: 'extends / infer', link: '/TypeScript/extends-infer' },
            { text: 'keyof / mapped / conditional', link: '/TypeScript/keyof-mapped-conditional' },
            { text: 'Utility Types', link: '/TypeScript/utility-types' },
            { text: '模板字面量类型', link: '/TypeScript/template-literal-types' },
          ],
        },
        {
          text: '类型声明',
          collapsible: false,
          items: [
            { text: '声明文件 / declare', link: '/TypeScript/declaration' },
          ],
        },
        {
          text: '工程化',
          collapsible: false,
          items: [
            { text: 'tsconfig.json 配置', link: '/TypeScript/tsconfig' },
            { text: 'Vue3 + TS 最佳实践', link: '/TypeScript/vue3-ts-practice' },
            { text: '模块系统', link: '/TypeScript/module-system' },
            { text: 'T[K] / typeof', link: '/TypeScript/indexed-access-typeof' },
          ],
        },
      ],
      '/浏览器/': [
        { text: '浏览器 知识地图', link: '/浏览器/' },
        {
          text: '页面加载与渲染',
          collapsible: false,
          items: [
            { text: '多进程架构', link: '/浏览器/browser-architecture' },
            { text: 'URL 到页面展示', link: '/浏览器/url-to-page' },
            { text: '渲染流程', link: '/浏览器/render-process' },
            { text: '重绘 / 回流', link: '/浏览器/reflow-repaint' },
            { text: '浏览器缓存', link: '/浏览器/cache' },
            { text: '页面生命周期', link: '/浏览器/page-lifecycle' },
            { text: 'requestAnimationFrame', link: '/浏览器/request-animation-frame' },
            { text: 'Performance API', link: '/浏览器/performance-api' },
          ],
        },
        {
          text: '安全与存储',
          collapsible: false,
          items: [
            { text: '同源策略', link: '/浏览器/same-origin-policy' },
            { text: 'Cookie 深度解析', link: '/浏览器/cookie' },
            { text: 'Web Storage', link: '/浏览器/storage' },
            { text: 'DOM 事件机制 / 事件委托', link: '/浏览器/dom-event-delegation' },
            { text: '跨标签页通信', link: '/浏览器/cross-tab-communication' },
          ],
        },
        {
          text: '安全',
          collapsed: true,
          items: [
            { text: '安全 知识地图', link: '/浏览器/安全/' },
            { text: 'XSS', link: '/浏览器/安全/xss' },
            { text: 'CSRF', link: '/浏览器/安全/csrf' },
            { text: 'CSP', link: '/浏览器/安全/csp' },
            { text: '点击劫持 / iframe 安全', link: '/浏览器/安全/clickjacking' },
            { text: 'HTTPS 与传输安全', link: '/浏览器/安全/https-security' },
            { text: 'Token 存储安全', link: '/浏览器/安全/token-storage' },
            { text: '前端依赖安全', link: '/浏览器/安全/supply-chain-security' },
            { text: '认证/授权安全(JWT/OAuth)', link: '/浏览器/安全/auth-security' },
            { text: '数据泄露/postMessage 安全', link: '/浏览器/安全/data-leak-postmessage' },
          ],
        },
        {
          text: '引擎与性能',
          collapsible: false,
          items: [
            { text: 'V8 引擎 / JIT 编译', link: '/浏览器/v8-engine' },
            { text: '垃圾回收 GC', link: '/浏览器/gc' },
            { text: '内存泄漏排查', link: '/浏览器/memory-leak' },
            { text: 'Service Worker', link: '/浏览器/service-worker' },
          ],
        },
        {
          text: '工具与扩展',
          collapsible: false,
          items: [
            { text: '浏览器 DevTools', link: '/浏览器/devtools' },
            { text: 'Observer API', link: '/浏览器/observer-api' },
            { text: 'BOM 全景', link: '/浏览器/bom' },
            { text: 'Web Worker', link: '/浏览器/web-worker' },
            { text: 'IndexedDB', link: '/浏览器/indexeddb' },
          ],
        },
      ],
      '/网络/': [
        { text: '网络 知识地图', link: '/网络/' },
        {
          text: '协议与模型',
          collapsible: false,
          items: [
            { text: 'OSI 七层 / TCP/IP 四层', link: '/网络/osi-model' },
            { text: 'TCP', link: '/网络/tcp' },
            { text: 'HTTP / HTTPS', link: '/网络/http-https' },
            { text: 'HTTP2 / HTTP3', link: '/网络/http2-http3' },
          ],
        },
        {
          text: '缓存与安全',
          collapsible: false,
          items: [
            { text: 'HTTP 缓存', link: '/网络/http-cache' },
            { text: 'CORS', link: '/网络/cors' },
          ],
        },
        {
          text: '基础设施',
          collapsible: false,
          items: [
            { text: 'DNS / CDN', link: '/网络/dns-cdn' },
          ],
        },
        {
          text: '数据交互',
          collapsible: false,
          items: [
            { text: 'HTTP 请求方法', link: '/网络/http-methods' },
            { text: 'Fetch API 深度解析', link: '/网络/fetch-api' },
            { text: 'WebSocket / SSE', link: '/网络/websocket-sse' },
            { text: 'UDP 协议', link: '/网络/udp' },
            { text: '代理/负载均衡', link: '/网络/proxy-lb' },
          ],
        },
      ],
      '/工程化/': [
        { text: '工程化 知识地图', link: '/工程化/' },
        {
          text: '包管理与模块',
          collapsible: false,
          items: [
            { text: 'npm 深入', link: '/工程化/npm-deep' },
            { text: 'pnpm', link: '/工程化/pnpm' },
            { text: 'ESM 模块化', link: '/工程化/esm-module' },
          ],
        },
        {
          text: '构建工具',
          collapsible: false,
          items: [
            { text: 'Vite', link: '/工程化/vite' },
            { text: 'Vite 深入', link: '/工程化/vite-deep' },
            { text: 'Webpack', link: '/工程化/webpack' },
            { text: 'Babel / ESBuild', link: '/工程化/babel-esbuild' },
            { text: 'Tree Shaking', link: '/工程化/tree-shaking' },
          ],
        },
        {
          text: '样式与质量',
          collapsible: false,
          items: [
            { text: 'Tailwind CSS', link: '/工程化/tailwindcss' },
            { text: '前端测试体系', link: '/工程化/testing' },
            { text: 'ESLint / Husky', link: '/工程化/eslint-husky' },
          ],
        },
        {
          text: '优化与扩展',
          collapsible: false,
          items: [
            { text: 'Code Splitting', link: '/工程化/code-splitting' },
            { text: 'Rollup/Prettier/SourceMap', link: '/工程化/rollup-prettier-sourcemap' },
          ],
        },
        {
          text: 'Node',
          collapsed: true,
          items: [
            { text: 'Node 知识地图', link: '/工程化/Node/' },
            { text: 'CommonJS / ESM', link: '/工程化/Node/commonjs-esm' },
            { text: 'Node Event Loop', link: '/工程化/Node/node-event-loop' },
            { text: 'npm / pnpm', link: '/工程化/Node/package-manager' },
            { text: 'Express / Koa', link: '/工程化/Node/express-koa' },
          ],
        },
        {
          text: '日志监控',
          collapsed: true,
          items: [
            { text: '日志监控 知识地图', link: '/工程化/日志监控/' },
            { text: 'Sentry', link: '/工程化/日志监控/sentry' },
            { text: '性能监控', link: '/工程化/日志监控/performance-monitor' },
            { text: '埋点系统', link: '/工程化/日志监控/tracking' },
            { text: '线上问题定位', link: '/工程化/日志监控/online-debug' },
          ],
        },
      ],
      '/算法/': [
        { text: '算法 知识地图', link: '/算法/' },
        {
          text: '基础数据结构',
          collapsible: false,
          items: [
            { text: '数组', link: '/算法/array' },
            { text: '哈希表', link: '/算法/hash' },
            { text: '栈和队列', link: '/算法/stack-queue' },
            { text: '堆', link: '/算法/heap' },
            { text: '链表', link: '/算法/linked-list' },
            { text: '树', link: '/算法/tree' },
          ],
        },
        {
          text: '核心算法思想',
          collapsible: false,
          items: [
            { text: '双指针', link: '/算法/two-pointers' },
            { text: '排序', link: '/算法/sort' },
            { text: '二分查找', link: '/算法/binary-search' },
            { text: '滑动窗口', link: '/算法/sliding-window' },
            { text: 'DFS / BFS', link: '/算法/dfs-bfs' },
            { text: '动态规划', link: '/算法/dynamic-programming' },
            { text: '回溯算法', link: '/算法/backtracking' },
          ],
        },
        {
          text: '面试实战',
          collapsible: false,
          items: [
            { text: '高频题', link: '/算法/common-questions' },
          ],
        },
      ],
      '/性能优化/': [
        { text: '性能优化 知识地图', link: '/性能优化/' },
        {
          text: '核心指标与工具',
          collapsible: false,
          items: [
            { text: 'Web Vitals', link: '/性能优化/web-vitals' },
            { text: '性能分析工具', link: '/性能优化/performance-devtools' },
          ],
        },
        {
          text: '加载优化',
          collapsible: false,
          items: [
            { text: '首屏优化', link: '/性能优化/first-screen' },
            { text: '缓存策略体系', link: '/性能优化/caching-strategy' },
            { text: '网络传输优化', link: '/性能优化/network-optimization' },
            { text: '打包优化', link: '/性能优化/bundle-optimization' },
          ],
        },
        {
          text: '运行时优化',
          collapsible: false,
          items: [
            { text: '关键渲染路径', link: '/性能优化/critical-rendering-path' },
            { text: '图片优化', link: '/性能优化/image-optimization' },
            { text: '虚拟列表', link: '/性能优化/virtual-list' },
          ],
        },
      ],
      '/前端架构/': [
        { text: '前端架构 知识地图', link: '/前端架构/' },
        { text: '项目分层设计', link: '/前端架构/project-structure' },
        { text: '组件设计', link: '/前端架构/component-design' },
        { text: '模块解耦', link: '/前端架构/module-decoupling' },
        { text: '设计模式', link: '/前端架构/design-patterns' },
        { text: '插件化架构', link: '/前端架构/plugin-architecture' },
        { text: '配置化架构', link: '/前端架构/config-driven' },
        { text: 'Monorepo', link: '/前端架构/monorepo' },
        {
          text: '微前端',
          collapsed: true,
          items: [
            { text: '微前端 知识地图', link: '/前端架构/微前端/' },
            { text: '微前端概述', link: '/前端架构/微前端/overview' },
            { text: 'qiankun', link: '/前端架构/微前端/qiankun' },
            { text: 'Module Federation', link: '/前端架构/微前端/module-federation' },
            { text: 'iframe 方案', link: '/前端架构/微前端/iframe' },
          ],
        },
      ],
      '/CICD/': [
        { text: 'CI/CD 知识地图', link: '/CICD/' },
        { text: 'CI/CD 概述', link: '/CICD/overview' },
        { text: 'GitHub Actions', link: '/CICD/github-actions' },
        { text: 'Docker', link: '/CICD/docker' },
        { text: 'Jenkins', link: '/CICD/jenkins' },
      ],
      '/项目实战/': [
        { text: '项目实战 知识地图', link: '/项目实战/' },
        {
          text: '基础设施',
          link: '/项目实战/基础设施/axios-encapsulation',
          collapsible: false,
          items: [
            { text: 'Axios 封装', link: '/项目实战/基础设施/axios-encapsulation' },
            { text: '请求重试', link: '/项目实战/基础设施/request-retry' },
            { text: '防重复请求', link: '/项目实战/基础设施/request-dedup' },
            { text: 'Mock', link: '/项目实战/基础设施/mock' },
            { text: '错误处理 / 前端监控', link: '/项目实战/基础设施/error-monitoring' },
            { text: '灰度发布', link: '/项目实战/基础设施/gray-release' },
          ],
        },
        {
          text: '认证鉴权',
          link: '/项目实战/认证鉴权/login-auth',
          collapsible: false,
          items: [
            { text: '登录鉴权', link: '/项目实战/认证鉴权/login-auth' },
            { text: 'Token 刷新', link: '/项目实战/认证鉴权/token-refresh' },
          ],
        },
        {
          text: '权限系统',
          link: '/项目实战/权限系统/dynamic-route',
          collapsible: false,
          items: [
            { text: '动态路由', link: '/项目实战/权限系统/dynamic-route' },
            { text: '权限 RBAC', link: '/项目实战/权限系统/permission-rbac' },
          ],
        },
        {
          text: '业务场景',
          link: '/项目实战/业务场景/file-upload',
          collapsible: false,
          items: [
            { text: '文件上传', link: '/项目实战/业务场景/file-upload' },
            { text: 'Excel 导入导出', link: '/项目实战/业务场景/excel-import-export' },
            { text: '大数据表格', link: '/项目实战/业务场景/big-data-table' },
            { text: 'Composable 设计', link: '/项目实战/业务场景/composable-design' },
            { text: '国际化', link: '/项目实战/业务场景/i18n' },
            { text: '主题切换', link: '/项目实战/业务场景/theme-switch' },
            { text: '组件封装实践', link: '/项目实战/业务场景/component-encapsulation' },
            { text: 'WebSocket 实战', link: '/项目实战/业务场景/websocket' },
            { text: 'ECharts 实战', link: '/项目实战/业务场景/echarts' },
            { text: '大文件上传', link: '/项目实战/业务场景/big-file-upload' },
            { text: 'SSE 流式对话', link: '/项目实战/业务场景/sse-streaming' },
            { text: '水印安全', link: '/项目实战/业务场景/watermark-security' },
            { text: '富文本编辑器', link: '/项目实战/业务场景/rich-text-editor' },
          ],
        },
        { text: '项目优化', link: '/项目实战/项目优化/project-optimization' },
        { text: '质量保障：白屏排查', link: '/项目实战/质量保障/white-screen-troubleshoot' },
      ],
      '/手写题/': [
        { text: '手写题 知识地图', link: '/手写题/' },
        {
          text: 'P0（必能手写）',
          collapsible: false,
          items: [
            { text: 'Promise', link: '/手写题/promise' },
            { text: 'Promise.all / allSettled / any / race', link: '/手写题/promise-static' },
            { text: 'bind / call / apply', link: '/手写题/bind-call-apply' },
            { text: '深拷贝', link: '/手写题/deep-clone' },
            { text: 'debounce / throttle', link: '/手写题/debounce-throttle' },
            { text: 'new', link: '/手写题/new' },
            { text: '函数柯里化', link: '/手写题/curry' },
            { text: '数组扁平化+去重+排序', link: '/手写题/flatten-unique-sort' },
          ],
        },
        {
          text: 'P1（熟练）',
          collapsible: false,
          items: [
            { text: 'EventEmitter', link: '/手写题/event-emitter' },
            { text: 'LRU Cache', link: '/手写题/lru-cache' },
            { text: '批量请求并发控制', link: '/手写题/concurrency-control' },
            { text: '列表转树/树转列表', link: '/手写题/tree-conversion' },
            { text: 'instanceof 手写', link: '/手写题/instanceof' },
            { text: '版本号/LazyMan/寄生组合继承', link: '/手写题/version-compare' },
            { text: '对象扁平化/数组原型方法', link: '/手写题/object-flatten' },
          ],
        },
        {
          text: 'P2（掌握思路）',
          collapsible: false,
          items: [
            { text: 'compose / pipe', link: '/手写题/compose-pipe' },
          ],
        },
      ],
      '/面试题库/': [
        { text: '面试题库 总览', link: '/面试题库/' },
        { text: 'HTML', link: '/面试题库/HTML' },
        { text: 'CSS', link: '/面试题库/CSS' },
        { text: 'JavaScript', link: '/面试题库/JavaScript' },
        { text: 'Vue3', link: '/面试题库/Vue3' },
        { text: 'Vue Router', link: '/面试题库/VueRouter' },
        { text: 'Pinia', link: '/面试题库/Pinia' },
        { text: 'TypeScript', link: '/面试题库/TypeScript' },
        { text: '浏览器', link: '/面试题库/浏览器' },
        { text: '网络', link: '/面试题库/网络' },
        { text: '工程化', link: '/面试题库/工程化' },
        { text: '性能优化', link: '/面试题库/性能优化' },
        { text: '安全', link: '/面试题库/安全' },
        { text: 'Git', link: '/面试题库/Git' },
        { text: '手写题', link: '/面试题库/手写题' },
        { text: '算法', link: '/面试题库/算法' },
        { text: 'CICD', link: '/面试题库/CICD' },
        { text: '前端架构', link: '/面试题库/前端架构' },
        { text: '项目', link: '/面试题库/项目' },
        { text: 'HR', link: '/面试题库/HR' },
      ],
      '/HR/': [
        { text: 'HR 面试地图', link: '/HR/' },
        { text: '自我介绍', link: '/HR/self-intro' },
        { text: '项目介绍', link: '/HR/project-intro' },
        { text: '离职原因', link: '/HR/leave-reason' },
        { text: '优缺点', link: '/HR/strength-weakness' },
        { text: '职业规划', link: '/HR/career-plan' },
        { text: '薪资谈判', link: '/HR/salary-negotiation' },
        { text: '反问面试官', link: '/HR/reverse-questions' },
      ],
      '/模拟面试/': [
        { text: '模拟面试 总览', link: '/模拟面试/' },
        { text: '一面：JS 基础', link: '/模拟面试/round-1-js' },
        { text: '一面：Vue 框架', link: '/模拟面试/round-1-vue' },
        { text: '一面：网络 + 安全', link: '/模拟面试/round-1-network' },
        { text: '二面：项目经验', link: '/模拟面试/round-2-project' },
        { text: '二面：架构设计', link: '/模拟面试/round-2-architecture' },
        { text: '三面：HR', link: '/模拟面试/round-3-hr' },
      ],
      '/面试回答/': [
        { text: '面试回答 总览', link: '/面试回答/' },
        {
          text: 'HTML',
          collapsed: true,
          items: [
            { text: '语义化 / DOCTYPE / em vs i', link: '/面试回答/HTML/semantic-doctype' },
            { text: 'script 加载 / 懒加载 / Resource Hints', link: '/面试回答/HTML/script-lazy-loading' },
            { text: 'viewport / 表单', link: '/面试回答/HTML/form-meta-viewport' },
            { text: 'Canvas vs SVG / History API', link: '/面试回答/HTML/canvas-svg-history' },
          ],
        },
        {
          text: 'JavaScript',
          collapsed: true,
          items: [
            { text: 'Promise', link: '/面试回答/JavaScript/promise' },
            { text: 'Event Loop', link: '/面试回答/JavaScript/event-loop' },
            { text: '闭包', link: '/面试回答/JavaScript/closure' },
            { text: '原型链', link: '/面试回答/JavaScript/prototype-chain' },
            { text: 'this / call / apply / bind', link: '/面试回答/JavaScript/this-bind' },
            { text: '防抖 / 节流', link: '/面试回答/JavaScript/debounce-throttle' },
            { text: 'async/await', link: '/面试回答/JavaScript/async-await' },
            { text: '深拷贝', link: '/面试回答/JavaScript/deep-clone' },
            { text: 'new 操作符', link: '/面试回答/JavaScript/new-operator' },
            { text: 'var / let / const', link: '/面试回答/JavaScript/var-let-const' },
            { text: 'Promise 并发调度', link: '/面试回答/JavaScript/promise-scheduler' },
            { text: 'defineProperty vs Proxy', link: '/面试回答/JavaScript/defineproperty-proxy' },
          ],
        },
        {
          text: 'CSS',
          collapsed: true,
          items: [
            { text: '盒模型 / BFC', link: '/面试回答/CSS/box-model-bfc' },
            { text: 'Flex / Grid / 居中', link: '/面试回答/CSS/flexbox-grid-layout' },
            { text: '水平垂直居中', link: '/面试回答/CSS/centering' },
            { text: '选择器优先级', link: '/面试回答/CSS/specificity' },
            { text: '元素隐藏三种方式', link: '/面试回答/CSS/display-visibility-opacity' },
          ],
        },
        {
          text: 'Vue3',
          collapsed: true,
          items: [
            { text: 'Vue3 响应式', link: '/面试回答/Vue3/reactivity' },
            { text: 'Diff / Patch', link: '/面试回答/Vue3/diff-patch' },
            { text: '组件通信', link: '/面试回答/Vue3/component-communication' },
            { text: 'nextTick', link: '/面试回答/Vue3/nextTick' },
            { text: 'computed / watch', link: '/面试回答/Vue3/computed-watch' },
            { text: '生命周期', link: '/面试回答/Vue3/lifecycle' },
            { text: 'Composition API', link: '/面试回答/Vue3/composition-api' },
            { text: 'v-model', link: '/面试回答/Vue3/v-model' },
          ],
        },
        {
          text: 'TypeScript',
          collapsed: true,
          items: [
            { text: '泛型 / 工具类型', link: '/面试回答/TypeScript/generics-utility' },
            { text: 'interface vs type', link: '/面试回答/TypeScript/interface-type-answer' },
            { text: 'any / unknown / never', link: '/面试回答/TypeScript/any-unknown-never-answer' },
            { text: '类型收窄', link: '/面试回答/TypeScript/type-narrowing-answer' },
            { text: 'extends / infer', link: '/面试回答/TypeScript/extends-infer-answer' },
            { text: 'keyof / 映射 / 条件', link: '/面试回答/TypeScript/keyof-mapped-conditional-answer' },
            { text: '类型体操', link: '/面试回答/TypeScript/type-gymnastics-answer' },
            { text: 'as const / satisfies', link: '/面试回答/TypeScript/as-const-satisfies-answer' },
            { text: '声明文件 / declare', link: '/面试回答/TypeScript/declaration-answer' },
            { text: '协变 / 逆变', link: '/面试回答/TypeScript/covariance-contravariance-answer' },
            { text: 'Vue3 + TS 最佳实践', link: '/面试回答/TypeScript/vue3-ts-answer' },
          ],
        },
        {
          text: '浏览器',
          collapsed: true,
          items: [
            { text: 'XSS / CSRF', link: '/面试回答/浏览器/xss-csrf' },
            { text: 'URL 到页面', link: '/面试回答/浏览器/url-to-page' },
            { text: '浏览器缓存', link: '/面试回答/浏览器/cache' },
            { text: '浏览器存储方案', link: '/面试回答/浏览器/storage' },
          ],
        },
        {
          text: '网络',
          collapsed: true,
          items: [
            { text: 'HTTP / HTTPS', link: '/面试回答/网络/http-https' },
            { text: '跨域 CORS', link: '/面试回答/网络/cors' },
            { text: 'DNS / CDN', link: '/面试回答/网络/dns-cdn' },
          ],
        },
        {
          text: '工程化',
          collapsed: true,
          items: [
            { text: 'Vite / Webpack', link: '/面试回答/工程化/vite-webpack' },
            { text: '构建优化实战', link: '/面试回答/工程化/build-optimization' },
            { text: 'Tree Shaking / HMR', link: '/面试回答/工程化/tree-shaking-hmr' },
            { text: 'ESM / CJS 模块化', link: '/面试回答/工程化/esm-cjs' },
          ],
        },
        {
          text: 'Vue Router',
          collapsed: true,
          items: [
            { text: 'history vs hash', link: '/面试回答/VueRouter/history-hash' },
            { text: '动态路由 / 权限路由', link: '/面试回答/VueRouter/dynamic-routing' },
            { text: '路由守卫', link: '/面试回答/VueRouter/route-guards' },
          ],
        },
        {
          text: 'Pinia',
          collapsed: true,
          items: [
            { text: 'Pinia vs Vuex', link: '/面试回答/Pinia/pinia-vs-vuex' },
          ],
        },
        {
          text: '项目实战',
          collapsed: true,
          items: [
            { text: '登录鉴权', link: '/面试回答/项目/login-auth' },
            { text: '权限系统设计', link: '/面试回答/项目/permission-rbac' },
            { text: '大文件上传', link: '/面试回答/项目/big-file-upload' },
            { text: '项目性能优化', link: '/面试回答/项目/project-optimization' },
          ],
        },
        {
          text: '性能优化',
          collapsed: true,
          items: [
            { text: '首屏优化', link: '/面试回答/性能优化/first-screen' },
            { text: 'Web Vitals', link: '/面试回答/性能优化/web-vitals' },
            { text: '虚拟列表', link: '/面试回答/性能优化/virtual-list' },
            { text: '缓存策略', link: '/面试回答/性能优化/caching-strategy' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com' },
    ],

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档',
          },
          modal: {
            displayDetails: '显示详情',
            resetButtonTitle: '重置',
            backButtonTitle: '返回',
            noResultsText: '无结果',
            footer: {
              selectText: '选择',
              selectKeyAriaLabel: 'Enter',
              navigateText: '切换',
              navigateUpKeyAriaLabel: '上箭头',
              navigateDownKeyAriaLabel: '下箭头',
              closeText: '关闭',
              closeKeyAriaLabel: 'Esc',
            },
          },
        },
      },
    },

    outline: {
      level: [2, 3],
      label: '页面导航',
    },

    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },

    lastUpdated: {
      text: '最后更新',
    },
  },

  markdown: {
    lineNumbers: true,
  },

  vite: {
    optimizeDeps: {
      // mermaid 内部对每种图表类型做动态 import()，
      // Vite 预构建时会拆成独立 chunk。chunk hash 变化后
      // 缓存引用不同步导致 504。排除预构建让动态 import 原生运行。
      exclude: ['mermaid'],
    },
  },
})

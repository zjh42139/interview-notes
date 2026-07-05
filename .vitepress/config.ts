import { defineConfig } from 'vitepress'

export default defineConfig({
  base: process.env.BASE || '/',
  title: '前端面试知识库',
  description: '体系化的前端面试准备资料，以真实大厂面试为标准',
  lang: 'zh-CN',
  lastUpdated: true,
  cleanUrls: true,

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
  ],

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '复习路线', link: '/roadmap' },
      { text: '写作规范', link: '/writing-rules' },
      { text: '更新日志', link: '/changelog' },
    ],

    sidebar: {
      '/JavaScript/': [
        { text: 'JavaScript 知识地图', link: '/JavaScript/' },
        { text: 'this', link: '/JavaScript/this' },
        { text: 'call / apply / bind', link: '/JavaScript/call-apply-bind' },
        { text: 'new', link: '/JavaScript/new' },
        { text: '闭包', link: '/JavaScript/closure' },
        { text: '原型链', link: '/JavaScript/prototype-chain' },
        { text: 'Promise', link: '/JavaScript/promise' },
        { text: 'Event Loop', link: '/JavaScript/event-loop' },
        { text: 'async / await', link: '/JavaScript/async-await' },
        { text: '深拷贝', link: '/JavaScript/deep-clone' },
        { text: '防抖 / 节流', link: '/JavaScript/debounce-throttle' },
      ],
      '/CSS/': [
        { text: 'CSS 知识地图', link: '/CSS/' },
        { text: 'BFC', link: '/CSS/bfc' },
        { text: 'Flexbox', link: '/CSS/flexbox' },
        { text: 'Grid', link: '/CSS/grid' },
        { text: '居中方案', link: '/CSS/center-layout' },
        { text: '盒模型', link: '/CSS/box-model' },
        { text: '响应式', link: '/CSS/responsive' },
        { text: '层叠上下文', link: '/CSS/stacking-context' },
      ],
      '/TypeScript/': [
        { text: 'TypeScript 知识地图', link: '/TypeScript/' },
        { text: '泛型', link: '/TypeScript/generics' },
        { text: 'extends / infer', link: '/TypeScript/extends-infer' },
        { text: 'keyof / mapped / conditional', link: '/TypeScript/keyof-mapped-conditional' },
        { text: 'Utility Types', link: '/TypeScript/utility-types' },
        { text: 'satisfies', link: '/TypeScript/satisfies' },
        { text: 'any / unknown / never', link: '/TypeScript/any-unknown-never' },
      ],
      '/Vue3/': [
        { text: 'Vue3 知识地图', link: '/Vue3/' },
        { text: '响应式原理', link: '/Vue3/reactivity' },
        { text: 'computed / watch', link: '/Vue3/computed-watch' },
        { text: 'nextTick', link: '/Vue3/nextTick' },
        { text: '生命周期', link: '/Vue3/lifecycle' },
        { text: 'Diff / Patch', link: '/Vue3/diff-patch' },
        { text: 'KeepAlive', link: '/Vue3/keepalive' },
        { text: 'Teleport / Suspense', link: '/Vue3/teleport-suspense' },
        { text: 'Composition API', link: '/Vue3/composition-api' },
        { text: 'Renderer', link: '/Vue3/renderer' },
        { text: 'Scheduler', link: '/Vue3/scheduler' },
      ],
      '/浏览器/': [
        { text: '浏览器 知识地图', link: '/浏览器/' },
        { text: '渲染流程', link: '/浏览器/render-process' },
        { text: '重绘 / 回流', link: '/浏览器/reflow-repaint' },
        { text: '浏览器缓存', link: '/浏览器/cache' },
        { text: 'Web Storage', link: '/浏览器/storage' },
        { text: 'Web Worker', link: '/浏览器/web-worker' },
      ],
      '/网络/': [
        { text: '网络 知识地图', link: '/网络/' },
        { text: 'HTTP / HTTPS', link: '/网络/http-https' },
        { text: 'HTTP2 / HTTP3', link: '/网络/http2-http3' },
        { text: 'TCP', link: '/网络/tcp' },
        { text: 'DNS / CDN', link: '/网络/dns-cdn' },
        { text: 'WebSocket / SSE', link: '/网络/websocket-sse' },
        { text: 'CORS', link: '/网络/cors' },
      ],
      '/工程化/': [
        { text: '工程化 知识地图', link: '/工程化/' },
        { text: 'Vite', link: '/工程化/vite' },
        { text: 'Webpack', link: '/工程化/webpack' },
        { text: 'Babel / ESBuild', link: '/工程化/babel-esbuild' },
        { text: 'Tree Shaking', link: '/工程化/tree-shaking' },
        { text: 'pnpm', link: '/工程化/pnpm' },
      ],
      '/Node/': [
        { text: 'Node 知识地图', link: '/Node/' },
        { text: 'CommonJS / ESM', link: '/Node/commonjs-esm' },
        { text: 'Node Event Loop', link: '/Node/node-event-loop' },
        { text: 'npm / pnpm', link: '/Node/package-manager' },
      ],
      '/算法/': [
        { text: '算法 知识地图', link: '/算法/' },
        { text: '数组', link: '/算法/array' },
        { text: '树', link: '/算法/tree' },
        { text: '链表', link: '/算法/linked-list' },
        { text: '排序', link: '/算法/sort' },
        { text: '高频题', link: '/算法/common-questions' },
      ],
      '/安全/': [
        { text: '安全 知识地图', link: '/安全/' },
        { text: 'XSS', link: '/安全/xss' },
        { text: 'CSRF', link: '/安全/csrf' },
        { text: 'Token 存储安全', link: '/安全/token-storage' },
      ],
      '/性能优化/': [
        { text: '性能优化 知识地图', link: '/性能优化/' },
        { text: 'Web Vitals', link: '/性能优化/web-vitals' },
        { text: '首屏优化', link: '/性能优化/first-screen' },
        { text: '打包优化', link: '/性能优化/bundle-optimization' },
        { text: '虚拟列表', link: '/性能优化/virtual-list' },
        { text: '图片优化', link: '/性能优化/image-optimization' },
      ],
      '/项目实战/': [
        { text: '项目实战 知识地图', link: '/项目实战/' },
        {
          text: '基础设施',
          link: '/项目实战/基础设施/axios-encapsulation',
          collapsed: false,
          items: [
            { text: 'Axios 封装', link: '/项目实战/基础设施/axios-encapsulation' },
            { text: '防重复请求', link: '/项目实战/基础设施/request-dedup' },
            { text: 'Mock', link: '/项目实战/基础设施/mock' },
          ],
        },
        {
          text: '认证鉴权',
          link: '/项目实战/认证鉴权/login-auth',
          collapsed: false,
          items: [
            { text: '登录鉴权', link: '/项目实战/认证鉴权/login-auth' },
            { text: 'Token 刷新', link: '/项目实战/认证鉴权/token-refresh' },
          ],
        },
        {
          text: '权限系统',
          link: '/项目实战/权限系统/dynamic-route',
          collapsed: false,
          items: [
            { text: '动态路由', link: '/项目实战/权限系统/dynamic-route' },
            { text: '权限 RBAC', link: '/项目实战/权限系统/permission-rbac' },
          ],
        },
        {
          text: '业务场景',
          link: '/项目实战/业务场景/file-upload',
          collapsed: false,
          items: [
            { text: '文件上传', link: '/项目实战/业务场景/file-upload' },
            { text: 'Excel 导入导出', link: '/项目实战/业务场景/excel-import-export' },
            { text: '大数据表格', link: '/项目实战/业务场景/big-data-table' },
          ],
        },
        { text: '项目优化', link: '/项目实战/项目优化/project-optimization' },
      ],
      '/手写题/': [
        { text: '手写题 知识地图', link: '/手写题/' },
        { text: 'Promise', link: '/手写题/promise' },
        { text: 'bind / call / apply', link: '/手写题/bind-call-apply' },
        { text: 'new', link: '/手写题/new' },
        { text: 'debounce / throttle', link: '/手写题/debounce-throttle' },
        { text: '深拷贝', link: '/手写题/deep-clone' },
        { text: 'EventEmitter', link: '/手写题/event-emitter' },
        { text: 'compose / pipe', link: '/手写题/compose-pipe' },
      ],
      '/面试题库/': [
        { text: '面试题库 总览', link: '/面试题库/' },
        { text: 'JavaScript', link: '/面试题库/JavaScript' },
        { text: 'Vue3', link: '/面试题库/Vue3' },
        { text: 'TypeScript', link: '/面试题库/TypeScript' },
        { text: '浏览器', link: '/面试题库/浏览器' },
        { text: '网络', link: '/面试题库/网络' },
        { text: '工程化', link: '/面试题库/工程化' },
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
      ],
      '/模拟面试/': [
        { text: '模拟面试 总览', link: '/模拟面试/' },
        { text: '一面：JS 基础', link: '/模拟面试/round-1-js' },
        { text: '一面：Vue 框架', link: '/模拟面试/round-1-vue' },
        { text: '二面：项目经验', link: '/模拟面试/round-2-project' },
        { text: '三面：HR', link: '/模拟面试/round-3-hr' },
      ],
      '/面试回答/': [
        { text: '面试回答 总览', link: '/面试回答/' },
        { text: 'JavaScript', link: '/面试回答/JavaScript/promise' },
        { text: 'Vue3', link: '/面试回答/Vue3/reactivity' },
        { text: '项目', link: '/面试回答/项目/login-auth' },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com' },
    ],

    search: {
      provider: 'local',
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

  mermaid: {},
})

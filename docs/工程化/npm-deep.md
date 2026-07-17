---
title: npm 深入
description: npm 的 package.json 核心字段、依赖类型、安装原理、node_modules 扁平化、幽灵依赖等核心知识点的完整拆解
category: 工程化
type: mechanism
score: 0
difficulty: 中级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
tags:
  - npm
  - package.json
  - lock
  - dependencies
  - node_modules
---

# npm 深入

> ⭐⭐⭐⭐⭐｜难度：中级

## 一句话总结

> npm 是 Node.js 的默认包管理器，核心由三块组成：`package.json`（声明依赖）、`node_modules`（存放依赖）、`package-lock.json`（锁定依赖）。理解 dependencies/devDependencies/peerDependencies 三种依赖类型、npm install 的执行原理、node_modules 的扁平化策略和幽灵依赖问题，是掌握前端工程化的基本功。

面试时这样开口："npm 不只是 `npm install` 这么简单。核心要理解三件事：第一，dependencies 和 devDependencies 的分工——运行时和构建时的区别，`npm install --omit=dev` 不安装 devDependencies；第二，package-lock.json 的作用——锁定版本保证团队一致性，必须提交到仓库；第三，node_modules 的扁平化策略——npm 3+ 尽量扁平减少嵌套，但也带来了幽灵依赖问题。"

## 核心机制

### 1. package.json 核心字段

`package.json` 是一个项目的"身份证"，以下几个字段面试中经常被问到：

| 字段 | 作用 | 示例 |
|------|------|------|
| `name` | 包名（发布到 npm 时唯一标识） | `"@myorg/utils"` |
| `version` | 语义化版本号 | `"1.2.3"` |
| `main` | CommonJS 入口（`require('pkg')` 时解析） | `"dist/index.js"` |
| `module` | ESM 入口（打包工具 `import` 时优先） | `"dist/index.mjs"` |
| `exports` | 现代化的导出映射（Node 12.7+），优先级高于 main/module | `{ ".": "./dist/index.js", "./utils": "./dist/utils.js" }` |
| `scripts` | npm scripts 定义（`npm run build` 等） | `{ "build": "vite build" }` |
| `engines` | 指定 Node/npm 版本要求 | `{ "node": ">=16" }` |
| `files` | 发布到 npm 时包含的文件（白名单） | `["dist", "README.md"]` |

`exports` 字段的现代化用法：

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./utils": "./dist/utils.js"
  }
}
// 这样 import pkg from 'my-lib' 走 ESM，require('my-lib') 走 CJS
// 并且 ./utils 子路径可以直接导出，不需要知道内部目录结构
// 注意："types" 条件必须写在最前面，条件按书写顺序匹配
```

### 2. dependencies vs devDependencies vs peerDependencies

这是面试中的高频考点，三种依赖的分工你必须能清晰讲清楚：

**dependencies（运行时依赖）**：

```bash
npm install vue axios element-plus
# 这些包会在生产环境被 import/require，必须随项目一起部署
```

**devDependencies（开发/构建依赖）**：

```bash
npm install -D vite typescript eslint vitest
# 只在开发、构建、测试时需要，生产环境不需要
```

**关键区别**：

- `npm install --omit=dev`（npm 8 之前写作 `--production`）时，devDependencies **不会被安装**，可以减小生产环境的 node_modules 体积和部署时间
- 对于**应用项目**（最终被部署的项目），两者的区分主要在部署体积；对于**库项目**（发布到 npm 的包），区分至关重要——你的 devDependencies 不应该让使用者安装

**peerDependencies（宿主依赖）**：

插件的典型声明方式。一个 Vue 组件库不应该自己偷偷装一份 Vue，而应该告诉使用者"你需要自己装 Vue"：

```json
{
  "name": "my-vue-component-lib",
  "peerDependencies": {
    "vue": "^3.0.0"
  },
  "devDependencies": {
    "vue": "^3.3.0"
  }
}
// 解释：库开发时需要 vue（devDependencies 里装一份自己用）
// 但告诉使用者"你的项目必须有 vue ^3.0.0"（peerDependencies）
// npm 7+ 会自动安装 peerDependencies，npm 6 需要手动安装
```

peerDependencies 的版本匹配规则：

```json
{
  "peerDependencies": {
    "react": ">=16.8.0"     // 宽松匹配：>= 16.8.0 都可以
    // "react": "^16.8.0"   // 严格匹配：只有 16.x
  }
}
```

### 3. package-lock.json：为什么必须提交到 Git

`package-lock.json` 记录的是**实际安装的确切版本**和**完整的依赖树结构**：

```json
{
  "name": "my-app",
  "lockfileVersion": 3,
  "packages": {
    "node_modules/vue": {
      "version": "3.3.4",
      "resolved": "https://registry.npmjs.org/vue/-/vue-3.3.4.tgz",
      "integrity": "sha512-...",
      "dependencies": {
        "@vue/compiler-dom": "3.3.4",
        "@vue/runtime-dom": "3.3.4",
        "@vue/server-renderer": "3.3.4"
      }
    }
  }
}
```

**为什么不能 .gitignore？**

1. **锁定版本**：`package.json` 中的 `^3.0.0` 是一个范围，不同时间 `npm install` 可能安装 `3.1.0` 或 `3.2.0`。lock 文件锁定了 `3.3.4` 这个精确版本
2. **团队一致性**：所有人都安装完全相同的依赖树，不会出现"我电脑上跑得好好的，到你这就报错"
3. **CI/CD 可靠性**：生产构建的依赖和本地开发完全一致，不会因为依赖版本漂移导致生产事故
4. **安全性**：lock 文件中的 `integrity` hash（sha512）让 `npm install`/`npm ci` 能校验下载的包内容未被篡改；`npm audit` 则基于 lock 中的完整依赖树做漏洞审计

> lock 文件只影响 `npm install`（从头安装），不影响 `npm install <pkg>`（安装新包时 lock 文件会更新）。

### 4. npm install 的执行流程

```
npm install 的完整生命周期：

1. 读取 package.json，构建依赖列表
2. 检查 node_modules 是否已有满足要求的包（有则跳过）
3. 解析依赖树，计算所有包需要的版本
4. 向 registry 发送请求，下载 .tgz 包到 npm 缓存目录
5. 解压到 node_modules（按照扁平化算法排列）
6. 执行生命周期脚本（按顺序）：
   preinstall -> install -> postinstall -> prepublish -> preprepare -> prepare -> postprepare
7. 生成/更新 package-lock.json
```

关键点：**npm 5+ 引入 package-lock.json 后依赖解析是确定性的**——给定相同的 `package.json` 和 `package-lock.json`，安装结果完全一致（npm 3/4 的扁平化结果会受安装顺序影响，这正是 lock 文件要解决的问题之一）。

### 5. node_modules 扁平化与幽灵依赖

**npm 3 之前的嵌套地狱**：

```
node_modules/
  express/
    node_modules/
      accepts/
        node_modules/
          negotiator/     # 嵌套好深...
```

每个包的依赖都嵌套在自己的 `node_modules` 里，结果是路径深、磁盘占用大、多个相同包重复安装。

**npm 3+ 的扁平化策略**：

尽量把所有依赖提升到顶层 `node_modules/`，减少嵌套：

```
node_modules/
  express/
  accepts/          # 被提升到顶层
  negotiator/       # 也被提升到顶层
  debug/            # 但版本冲突时保留嵌套
    node_modules/
      ms/           # debug 依赖 ms@2.0，和顶层的 ms@2.1 冲突，只能嵌套
```

**幽灵依赖（Phantom Dependency）**：

扁平化的副作用——你的代码可以 `require('accepts')`，即使你的 `package.json` 里并没有声明它。这是因为 `express` 依赖 `accepts`，而 `accepts` 被提升到了顶层。

```js
// 你的项目 package.json 只有 { "dependencies": { "express": "^4" } }
// 但这段代码居然可以运行！因为 accepts 被提升到了顶层 node_modules
const accepts = require('accepts')  // 幽灵依赖！
```

幽灵依赖的风险：

1. 某天 express 不再依赖 accepts，或者 accepts 换了名称，你的代码静默崩溃
2. 新同事 clone 项目后 `npm install`，版本和你的不同，可能拿不到这个包
3. 没有在 package.json 中显式声明，工具（eslint、TypeScript）不会帮你检查

**pnpm 的解决方案**：pnpm 使用符号链接 + 硬链接，严格限制每个包只能访问自己声明的依赖，从根源上消灭幽灵依赖。

## 深度拓展

### 追问：`npm install` 和 `npm ci` 的区别？

| 维度 | `npm install` | `npm ci` |
|------|-------------|---------|
| 使用场景 | 日常开发、安装新包 | CI/CD 环境、团队统一安装 |
| 依赖来源 | 可能修改 `package-lock.json` | 严格按 lock 文件，不匹配就报错并退出 |
| node_modules | 增量安装，复用已有包 | 先删除 `node_modules`，再从头安装 |
| 速度 | 慢（需要解析依赖） | 快（跳过依赖解析，直接按 lock 安装） |
| package.json | 允许和 lock 不一致（会自动更新 lock） | 必须和 lock 一致，否则报错 |

CI 环境应该永远用 `npm ci`，速度更快且保证一致性。

### 追问：`npx` 解决了什么问题？

`npx` 可以直接执行 `node_modules/.bin` 中的命令，不需要全局安装或写 npm scripts：

```bash
# 不用 npx 的方式：
npm install -g create-vite    # 全局安装（会过时）
create-vite my-app

# 用 npx 的方式：
npx create-vite my-app        # 自动下载最新版、执行、用完即删（或缓存）
```

`npx` 的执行逻辑：

1. 先找本地 `node_modules/.bin/` 中有没有
2. 没有就去 npm registry 下载最新版到临时目录
3. 执行完毕后清理临时目录（除非缓存）

常用场景：`npx eslint --init`、`npx tsc --init`、`npx create-react-app my-app`。

### 追问：semver 版本号的含义？

`"vue": "^3.3.4"` —— 这个 `^` 是什么意思？

| 符号 | 含义 | 示例（当前 3.3.4） |
|------|------|-------------------|
| `^` | 兼容主版本 | 允许 3.3.5 ~ 3.x.x（不会升到 4.0.0） |
| `~` | 兼容次版本 | 允许 3.3.5 ~ 3.3.x（不会升到 3.4.0） |
| 无符号 | 精确版本 | 只能是 3.3.4 |
| `*` / `x` | 任意版本 | 不限制 |
| `>=` / `<=` | 范围 | 指定最低/最高版本 |

推荐实践：应用项目用 `^`（允许补丁更新和安全修复），库项目的 peerDependencies 尽量宽松（`>=` 或 `||`），不限制使用者版本。

## 项目实战

### 1. 排查"我电脑上正常，同事电脑上报错"

这种情况 90% 是依赖版本不一致导致的：

```bash
# Step 1：确认 lock 文件是否在 Git 中
git ls-files package-lock.json
# 如果没有输出，说明 lock 文件被 .gitignore 了——这就是问题根源

# Step 2：统一依赖
rm -rf node_modules package-lock.json
npm install    # 重新生成 node_modules 和 lock 文件
# 或者用 npm ci（如果 lock 文件已存在）

# Step 3：检查是否有幽灵依赖
# 用 depcheck 扫描：有哪些 require 了但没在 package.json 中声明
npx depcheck
```

### 2. 库开发的 package.json 最佳实践

```json
{
  "name": "@myorg/utils",
  "version": "1.0.0",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist"],
  "dependencies": {
    "lodash-es": "^4.0.0"
  },
  "peerDependencies": {
    "vue": ">=3.0.0"
  },
  "devDependencies": {
    "vue": "^3.3.0",
    "vite": "^5.0.0",
    "typescript": "^5.0.0"
  },
  "sideEffects": false
}
// 关键：vue 同时出现在 peerDependencies 和 devDependencies
// devDependencies 里的 vue 是库开发时自己用的
// peerDependencies 里的 vue 是告诉使用者"你需要自己装"
// sideEffects: false 告诉打包工具可以安全 Tree Shaking
```

## 易错点

- **把运行时依赖装在 devDependencies**：Vue/Router/Axios 等运行时需要的包必须是 dependencies，否则 `npm install --production` 后运行报错
- **.gitignore 了 package-lock.json**：这会导致团队和 CI 的依赖版本不一致，是常见的事故源头
- **没有声明幽灵依赖**：代码中 require 了但 package.json 没写的包，要补到 dependencies 中
- **库项目的 dependencies 和 devDependencies 混用**：库的编译工具（Vite、TS、ESLint）放 devDependencies，运行时依赖放 dependencies，宿主框架放 peerDependencies
- **`npm install` 和 `npm ci` 在 CI 中混用**：CI 环境永远用 `npm ci`，更快更可靠
- **不理解 `^` 和 `~` 的区别**：认为 `^3.3.4` 不会更新版本——实际上会自动安装 3.x 的最新版

## 面试信号

当面试官问"说说 npm"，不要从 `npm install` 开始讲。正确的结构是：

> "我从三个层面说 npm。第一个层面是依赖管理——package.json 的三种依赖类型：dependencies 存放运行时包，devDependencies 存放构建工具，peerDependencies 用于插件声明宿主框架版本。第二个层面是安装机制——`npm install` 读取 package.json 构建依赖树、扁平化到 node_modules、生成 lock 文件锁定精确版本。第三个层面是工程实践——lock 文件必须提交 Git，CI 环境用 `npm ci`，幽灵依赖要警惕。如果能引出 pnpm 的符号链接方案解决幽灵依赖就更完整了。"

## 相关阅读

- [pnpm](./pnpm.md)
- [../前端架构/monorepo.md](../前端架构/monorepo.md)
- [Vite 深入](./vite-deep.md)
- [npm 官方文档：package.json](https://docs.npmjs.com/cli/v10/configuring-npm/package-json)
- [npm 官方文档：package-lock.json](https://docs.npmjs.com/cli/v10/configuring-npm/package-lock-json)

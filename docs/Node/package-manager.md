---
title: npm / pnpm
description: npm 与 pnpm 包管理器面试知识点
category: Node
difficulty: 初级
frequency: ⭐⭐⭐⭐
status: drafted
created: 2026-07-05
updated: 2026-07-05
reviewed: null
tags:
  - npm
  - pnpm
  - workspace
  - monorepo
---

# npm / pnpm

> ⭐⭐⭐⭐｜难度：初级｜项目：★★★

**包管理器是每个项目的基石，但大多数人只停留在 `npm install`。** 面试中要能说清 package.json 各字段的职责、semver 规则、lock 文件的作用和 peerDependencies 的正确用法。

## 一句话总结

**npm/pnpm 是 Node.js 的包管理器，通过 package.json 管理依赖声明和版本范围（semver），通过 lock 文件锁定精确版本保证一致性，通过 scripts 定义生命周期钩子，pnpm 通过内容寻址存储和符号链接解决了 npm 的幽灵依赖和磁盘占用问题。**

## 核心机制

### package.json 关键字段

```json
{
  "name": "admin-system",
  "version": "1.0.0",
  "private": true,

  // 依赖类型
  "dependencies": {
    "vue": "^3.4.0",           // 运行时依赖，打包进 dist
    "element-plus": "^2.5.0",
    "axios": "^1.7.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",    // 开发时依赖，不打包进 dist
    "vite": "^5.0.0",
    "eslint": "^9.0.0"
  },
  "peerDependencies": {
    "vue": ">=3.3.0"           // 要求宿主项目提供（插件/组件库场景）
  },
  "engines": {
    "node": ">=18.0.0",        // 指定 Node 版本要求
    "pnpm": ">=9.0.0"          // 指定包管理器版本
  },

  // semver 版本范围
  // ^3.4.0  = 3.x.x（>=3.4.0, <4.0.0）— 兼容的次版本
  // ~3.4.0  = 3.4.x（>=3.4.0, <3.5.0）— 兼容的补丁版本
  // *       = 任意版本（危险！）
  // 3.4.0   = 精确版本
}
```

### semver 三大符号：^ ~ *

| 符号 | 允许范围 | 含义 |
|------|---------|------|
| `^3.4.0` | `>=3.4.0 <4.0.0` | 兼容的 minor 版本（默认推荐） |
| `~3.4.0` | `>=3.4.0 <3.5.0` | 兼容的 patch 版本（更保守） |
| `3.4.0` | `=3.4.0` | 锁定精确版本（最保守，团队项目推荐关键依赖） |
| `*` | 任意 | 永远不要用 |

```bash
# semver 版本号规范：MAJOR.MINOR.PATCH
# 1.0.0 → 2.0.0：MAJOR — 不兼容的 API 变更
# 2.1.0 → 2.2.0：MINOR — 向后兼容的新功能
# 2.2.0 → 2.2.1：PATCH — 向后兼容的 bug 修复
```

### lock 文件：保证团队一致性

```bash
# npm:   package-lock.json
# pnpm:  pnpm-lock.yaml  （更易读、合并冲突更少）
# yarn:  yarn.lock

# lock 文件的作用：
# 1. 锁定精确版本（包括子依赖的版本）
# 2. 记录依赖树结构和下载源
# 3. 保证 CI/CD 环境和开发环境一致

# 必须提交到 Git！
# 不要 .gitignore lock 文件！
```

**为什么 `package.json` 中的 `^3.4.0` 不够？** 因为 `^3.4.0` 允许 `3.4.0` 到 `3.x.x` 的任何版本。团队成员或 CI 在不同时间安装，可能拿到不同的次版本，导致"在我机器上没问题"的诡异 bug。lock 文件把整个依赖树锁死。

### scripts 生命周期钩子

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .vue,.ts,.tsx",
    "typecheck": "vue-tsc --noEmit",

    // 生命周期钩子：npm 会自动执行 pre/post 脚本
    "prebuild": "npm run lint",        // build 前自动执行
    "postbuild": "echo '构建完成'",   // build 后自动执行
    "prepare": "husky install"        // npm install 后自动执行（CI 中）
  }
}
```

npm 的生命周期顺序（部分）：
- `npm install` -> `preinstall` -> `install` -> `postinstall` -> `prepublish` -> `preprepare` -> `prepare`
- `npm publish` -> `prepublishOnly` -> `prepack` -> `prepare` -> `postpack` -> `publish` -> `postpublish`

## 深度拓展

### peerDependencies 的正确姿势

发布 Vue 组件库时，**不要把 Vue 放在 dependencies 中**！

```json
// ❌ 错误：打包后 node_modules 里有两份 Vue
{
  "dependencies": {
    "vue": "^3.4.0"
  }
}

// ✅ 正确：Vue 在 peerDependencies，宿主项目提供
{
  "peerDependencies": {
    "vue": "^3.4.0"
  },
  "peerDependenciesMeta": {
    "vue": { "optional": false }
  }
}
// 为什么？如果你在 dependencies 里放 vue，
// 用户的 node_modules 会有两份 vue：用户项目一份，你的组件库一份
// 导致 composable 共享状态丢失、provide/inject 断裂
```

npm 7+ 会自动安装 peerDependencies，pnpm 严格模式下会报错提示手动安装。这也是 pnpm 更安全的原因。

### exports 字段的条件导出

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.mjs",    // import 走这个
      "require": "./dist/index.cjs",   // require 走这个
      "types": "./dist/index.d.ts"     // TypeScript 走这个
    },
    "./table": {
      "import": "./dist/components/table.mjs",
      "require": "./dist/components/table.cjs"
    }
  },
  // exports 会阻止未列出的路径访问
  // 用户无法 require("my-lib/dist/internal.js")
  // 这是比 main/module 字段更安全和现代的方案
}
```

### npx vs npm exec

```bash
# npx：运行本地或远程的 Node 可执行文件
npx vite --version     # 运行本地 node_modules/.bin/vite
npx create-vite myapp  # 临时下载并运行（不会全局安装）

# npm exec：npx 的底层命令
npm exec -- vite --version

# 区别：npx 如果没有本地包，会提示下载；npm exec 更严格
```

### npm 脚本中的环境变量

```json
{
  "scripts": {
    "dev:staging": "cross-env APP_ENV=staging vite",
    "build:prod": "cross-env NODE_ENV=production APP_ENV=production vite build"
  }
}
// cross-env 跨平台设置环境变量（Windows 兼容）
```

## 项目实战

### 1. Vue3 后台管理系统 package.json

```json
{
  "name": "admin-system",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=9.0.0"
  },
  "scripts": {
    "dev": "vite --open",
    "build:dev": "vue-tsc --noEmit && vite build --mode development",
    "build:prod": "vue-tsc --noEmit && vite build --mode production",
    "preview": "vite preview",
    "lint": "eslint \"src/**/*.{vue,ts,tsx}\" --fix",
    "typecheck": "vue-tsc --noEmit",
    "prepare": "husky install"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.4.0",
    "pinia": "^2.2.0",
    "element-plus": "^2.8.0",
    "axios": "^1.7.0",
    "@vueuse/core": "^10.11.0"
  },
  "devDependencies": {
    "vite": "^5.4.0",
    "@vitejs/plugin-vue": "^5.1.0",
    "typescript": "^5.5.0",
    "vue-tsc": "^2.1.0",
    "unplugin-auto-import": "^0.18.0",
    "unplugin-vue-components": "^0.27.0",
    "eslint": "^9.9.0",
    "@eslint/js": "^9.9.0",
    "prettier": "^3.3.0",
    "husky": "^9.1.0",
    "lint-staged": "^15.2.0",
    "sass": "^1.77.0"
  },
  "lint-staged": {
    "*.{vue,ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

### 2. 发布组件库的 package.json

```json
{
  "name": "@myapp/element-pro",
  "version": "1.0.0",
  "description": "基于 Element Plus 封装的业务组件库",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist", "README.md"],
  "peerDependencies": {
    "vue": "^3.4.0",
    "element-plus": "^2.5.0"
  },
  "peerDependenciesMeta": {
    "vue": { "optional": false }
  },
  "sideEffects": ["dist/*.css"],
  "keywords": ["vue3", "element-plus", "components"],
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  }
}
```

### 3. pnpm workspace monorepo 配置

详见 [工程化/pnpm](../工程化/pnpm.md)，这里补充 scripts 层面的配置：

```json
// 根目录 package.json — monorepo scripts
{
  "private": true,
  "scripts": {
    "dev:admin": "pnpm --filter @myapp/admin dev",
    "dev:h5": "pnpm --filter @myapp/h5 dev",
    "build": "pnpm -r --parallel build",
    "lint": "pnpm -r lint",
    "typecheck": "pnpm -r typecheck",
    "clean": "pnpm -r exec rm -rf dist node_modules"
  }
}
```

## 易错点

1. **`dependencies` 和 `devDependencies` 搞反** -- 运行时需要的放在 dependencies（vue, element-plus, axios），构建/开发工具放在 devDependencies（vite, typescript, eslint）。混放不影响本地开发，但 npm install --production 会跳过 devDependencies
2. **lock 文件不提交到 Git** -- lock 文件是团队依赖一致性的保证，必须提交。pnpm-lock.yaml 格式比 package-lock.json 更易解决合并冲突
3. **`^` 版本范围太宽导致不兼容** -- `^` 允许 minor 升级，大多数情况安全。但关键依赖（如构建工具链）建议锁死版本或用 `~`
4. **npm 的 `pre/post` 脚本在 pnpm 中默认禁用** -- pnpm 默认不执行 `prexxx`/`postxxx` 钩子，需要配置 `.npmrc` 中 `enable-pre-post-scripts=true`
5. **忽略 engines 字段** -- `engines` 字段只是警告，不会阻止安装。要强制检查，使用 `.npmrc` 的 `engine-strict=true`

## 相关阅读

- [Node 知识地图](./index.md)
- [Node Event Loop](./node-event-loop.md)
- [CommonJS / ESM](./commonjs-esm.md)
- [工程化 pnpm](../工程化/pnpm.md)

## 更新记录

- 2026-07-05：Phase 2 深度填充（package.json 字段 + semver + lock + peerDependencies + exports + 项目配置实战）

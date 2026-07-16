---
title: Commit 规范
description: Conventional Commits（约定式提交）是团队协作和自动化工具链的基础，结合 commitlint + husky + Commitizen 建立完整的提交规范体系
category: Git
type: api-reference
score: 0
difficulty: 初级
frequency: ⭐⭐⭐⭐⭐
status: reviewed
created: 2026-07-06
updated: 2026-07-06
tags:
  - Git
  - Commit
  - 规范
  - 工具链
---

# Commit 规范

> ⭐⭐⭐⭐⭐｜难度：初级

## 一句话总结

> Commit 规范的核心是**让提交信息机器可读、人类可读**。通过 Conventional Commits（约定式提交）约定格式 + 工具链自动校验，实现 changelog 自动生成、版本号自动推算、提交历史可追溯。

面试时这样开口："我们团队使用 Angular 规范的 Conventional Commits，配合 commitlint + husky 做提交前校验，结合 Commitizen 做交互式提交，确保每条 commit message 都符合 `type(scope): subject` 格式，同时 CI 中基于 commit 类型自动生成 changelog。"

## 核心机制

### Conventional Commits 格式

标准格式如下：

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

每个部分的含义：

```bash
# 日常开发最常用的 type
feat: 新功能          # feat(user): add login page
fix: 修复 bug         # fix(api): handle null response in getUser
docs: 文档变更         # docs(readme): update install guide
style: 代码格式       # style(dashboard): fix eslint warnings
refactor: 重构        # refactor(utils): extract common logic
test: 测试相关        # test(auth): add unit test for login
chore: 构建/工具变更   # chore(deps): upgrade axios to 1.x

# 较少用但规范要求知道的
perf: 性能优化
ci: CI/CD 配置变更
build: 构建系统变更
revert: 回滚某个提交
```

**scope 是可选的**，但强烈建议加上，比如 `feat(user)`、`fix(order)`，一眼能看出影响哪个模块。

### 为什么要用规范

1. **自动生成 CHANGELOG**：工具扫描所有 `feat` 和 `fix` 类型的 commit，自动生成版本发布说明
2. **自动推算版本号**：`feat` = minor 版本升级（1.0.0 -> 1.1.0），`fix` = patch 版本升级（1.0.0 -> 1.0.1），`BREAKING CHANGE` = major 版本升级
3. **git log 可检索**：`git log --grep="^feat"` 快速筛选所有新功能
4. **团队协作一致性**：新人看提交历史就能理解项目的变更节奏

### 工具链三件套

```bash
# 1. commitlint + husky：在 git commit 时校验 message 格式
npm install --save-dev @commitlint/cli @commitlint/config-conventional husky

# commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'test', 'chore', 'perf', 'ci', 'build', 'revert'
    ]],
    'subject-case': [0] // 不强制 subject 大小写
  }
}

# 在 package.json 中配置 husky
# npx husky install
# npx husky add .husky/commit-msg 'npx --no -- commitlint --edit $1'
```

校验失败的效果：提交被拦截，终端提示 "subject must not be sentence-case"，开发者不得不修改 message 后重新提交。

```bash
# 2. Commitizen：交互式生成符合规范的 commit message
npm install --save-dev commitizen cz-customizable

# package.json
{
  "config": {
    "commitizen": {
      "path": "cz-customizable"
    }
  }
}

# .cz-config.js：自定义中文提示
module.exports = {
  types: [
    { value: 'feat',     name: 'feat:     新功能' },
    { value: 'fix',      name: 'fix:      修复 bug' },
    { value: 'docs',     name: 'docs:     文档变更' },
    // ...
  ],
  scopes: ['user', 'order', 'dashboard', 'common'],
  messages: {
    type: '选择你的提交类型:',
    scope: '选择影响范围 (可选):',
    subject: '简短描述 (必填):\n',
    body: '详细描述 (可选):\n',
    footer: '关联 issue (可选):\n'
  }
}
```

使用 `git cz` 替代 `git commit`，会弹出交互式选择界面，选出类型、范围、描述，自动拼接成规范格式。

```bash
# 3. standard-version：自动生成 changelog + 打 tag
npm install --save-dev standard-version

# package.json scripts
{
  "release": "standard-version",
  "release:minor": "standard-version --release-as minor",
  "release:patch": "standard-version --release-as patch"
}

# npm run release 会自动：
# 1. 分析上次 tag 以来的所有 commit
# 2. 生成/更新 CHANGELOG.md
# 3. 自动 bump 版本号
# 4. 打 tag
```

## 深度拓展

### 追问：如何在项目中强制执行 commit 规范？

三个层次的保障：

1. **本地校验（husky + commitlint）**：`git commit` 时拦截不合规 message，这是第一道防线
2. **交互式引导（Commitizen）**：降低记忆成本，开发者不需要背 type 列表
3. **CI 二次校验**：在 CI pipeline 中再次跑 commitlint 检查最近的 commit，防止有人 `--no-verify` 跳过本地钩子

```yaml
# .github/workflows/commitlint.yml
- name: Check commit messages
  run: npx commitlint --from HEAD~1 --to HEAD --verbose
```

### 追问：`BREAKING CHANGE` 怎么写？

在 footer 中标注，或者直接在 type/scope 后加 `!`：

```bash
# 方式一：在 body/footer 中标注
feat(api): change user endpoint response format

BREAKING CHANGE: getUser 接口返回格式从数组改为对象，
包含 data 和 total 字段

# 方式二：type 后加 !（GitHub 风格）
feat!(api): change user endpoint response format
```

遇到 BREAKING CHANGE，版本号需要从 1.x.x 升级到 2.0.0。

## 项目实战

### Vue3 后台管理系统的提交规范落地

在一个 Vue3 + Element Plus 后台管理项目中，典型的 commit 长这样：

```bash
feat(user): add user list page with pagination
fix(permission): route guard not redirecting after token expiry
refactor(api): extract request interceptor to utils/request
style(layout): fix sidebar collapse animation stutter
chore(deps): upgrade vue to 3.4.x
docs(api): update interface文档 for user module
```

`scope` 按功能模块划分：`user`、`order`、`dashboard`、`permission`、`api`、`layout`、`common`。这样用 `git log --oneline --grep="fix(user)"` 就能快速找到用户模块的所有 bug 修复记录。

### commitlint 配置踩坑记录

**坑 1：header-max-length 限制中文长度**。默认 `subject` 最多 72 字符，但中文 commit 很容易超过，因为一个中文算 1 字符但编码后占更多。建议放宽到 100。

```js
// commitlint.config.js
rules: {
  'header-max-length': [2, 'always', 100]
}
```

**坑 2：husky 在 CI 环境失败**。CI 中可能没有安装 husky hooks，需要在 CI 配置中跳过或单独处理。可以在 `.husky/commit-msg` 中判断是否在 CI 环境。

## 易错点

- **`docs` 和 `style` 混用**：`docs` 是文档变更（README、注释），`style` 是代码格式变更（空格、分号、eslint），不影响代码逻辑
- **`refactor` 和 `fix` 混用**：重构不改变外部行为，修复改变了行为。如果一个改动既重构又修复，拆成两个 commit
- **`build` 和 `chore` 混用**：`build` 是构建系统或外部依赖变更（webpack、vite 配置），`chore` 是其他杂项（`.gitignore`、依赖升级）
- **scope 不要乱写**：scope 应该对应项目的功能模块，不是文件名，不是开发者名字。`fix(utils.js)` 应写成 `fix(common)`
- **`git commit --no-verify` 绕过校验**：紧急情况可以用，但用完要在下个 commit 中补上规范 message，并在团队规范中说明这种例外场景的处理方式

## 面试信号表

| 面试官问 | 下一问大概率是 |
|----------|-------------|
| "你们的 commit 规范是什么" | 追问 Conventional Commits——feat/fix/docs/refactor 等类型前缀 |
| "commitlint 怎么配置" | 追问 husky + commitlint 在 git hook 中校验提交信息 |
| "为什么需要 commit 规范" | 追问 changelog 自动生成 + 语义化版本号的依赖 |

## 相关阅读

- [Conventional Commits 官方规范](https://www.conventionalcommits.org/zh-hans/v1.0.0/)
- [Angular Commit Message Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [commitlint 文档](https://commitlint.js.org/)
- [standard-version](https://github.com/conventional-changelog/standard-version)

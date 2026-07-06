---
title: Jenkins
description: Jenkins 是 CI/CD 领域的老牌王者，Java 生态和大型企业的首选。面试中不需要会写 Jenkinsfile，但必须知道它是什么、和 GitHub Actions 有什么区别
category: CICD
difficulty: 高级
frequency: ⭐⭐⭐
status: filled
created: 2026-07-06
updated: 2026-07-06
tags:
  - Jenkins
  - CI/CD
  - Jenkinsfile
  - Pipeline
---

# Jenkins

> ⭐⭐⭐｜难度：高级｜项目：★

**Jenkins 是 CI/CD 的"上古神器"——2005 年诞生，至今仍是很多大型企业的 CI/CD 标配。面试中你大概率不会被要求写 Jenkinsfile，但"知道 Jenkins 的存在、了解它和 GitHub Actions 的区别、能说出声明式和脚本式语法的不同"——这三点足以让面试官觉得你对 CI/CD 生态有全面的认知。**

## 一句话总结

**Jenkins 是开源的、需要自己架设服务器的 CI/CD 平台。它通过插件体系（1800+ 插件）支持几乎所有工具和语言，通过 Jenkinsfile（声明式/脚本式 Pipeline）定义流水线。相比 GitHub Actions 的"开箱即用"，Jenkins 的优势是高度可定制、与内部系统深度集成；代价是需要自己维护服务器和配置。**

---

## 核心机制

### Jenkinsfile：声明式 vs 脚本式

Jenkinsfile 是定义 Jenkins Pipeline 的文本文件（放在仓库根目录），有两种语法：

**声明式 Pipeline（Declarative Pipeline）**——官方推荐，结构化、简洁：

```groovy
pipeline {
    agent any                           // 在任何可用节点上执行

    environment {
        NODE_VERSION = '20'
    }

    stages {
        stage('Checkout') {             // 阶段 1：拉代码
            steps {
                checkout scm
            }
        }
        stage('Build') {                // 阶段 2：构建
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }
        stage('Test') {                 // 阶段 3：测试
            steps {
                sh 'npm run test'
            }
        }
        stage('Deploy') {               // 阶段 4：部署
            when {
                branch 'main'           // 只有 main 分支才执行
            }
            steps {
                sh 'scp -r dist/ user@server:/var/www/'
            }
        }
    }

    post {                              // 后置处理
        always {
            echo 'Pipeline 结束'         // 无论成功失败都执行
        }
        success {
            echo '部署成功！'
        }
        failure {
            echo '构建失败，请检查日志'
        }
    }
}
```

**脚本式 Pipeline（Scripted Pipeline）**——更灵活但复杂：

```groovy
node {
    stage('Checkout') {
        checkout scm
    }

    stage('Build') {
        try {
            sh 'npm install && npm run build'
        } catch (e) {
            currentBuild.result = 'FAILURE'
            throw e
        }
    }

    if (env.BRANCH_NAME == 'main') {
        stage('Deploy') {
            sh 'deploy-script.sh'
        }
    }
}
```

| 维度 | 声明式 | 脚本式 |
|------|--------|--------|
| **学习成本** | 低，结构清晰 | 高，需要 Groovy 编程能力 |
| **可读性** | 好，模板化 | 差，流程散落 |
| **灵活性** | 受限于 DSL | 完全编程控制 |
| **错误处理** | `post` 块统一处理 | 手动 try/catch |
| **推荐度** | ✅ 官方推荐 | 仅在需要复杂逻辑时使用 |

### Pipeline 典型阶段

```
Checkout ──► Build ──► Unit Test ──► Package ──► Deploy to Staging
                │                                     │
                ▼                                     ▼
            npm install                        手动审批（Input Step）
            npm run build                           │
                │                                    ▼
                ▼                              Deploy to Production
            npm run test
```

**核心概念对应**：

| Jenkins 概念 | GitHub Actions 对应 | 说明 |
|-------------|-------------------|------|
| Pipeline | Workflow | 整个流水线 |
| Stage | — | Jenkins 特有，逻辑分组（GH Actions 中多个 Step 自己组织） |
| Step | Step | 最小执行单元 |
| Agent | Runner | 执行环境（Jenkins 需要自己配置节点） |
| Blue Ocean | GitHub Actions Tab | 可视化 UI |

---

## 深度拓展

### 追问：Jenkins 和 GitHub Actions 怎么选？

这是典型的"工具对比"问题，回答的关键是展示你理解两者适用场景的差异：

| 维度 | GitHub Actions | Jenkins |
|------|---------------|---------|
| **定位** | SaaS，托管在 GitHub | 自建服务，需要自己维护服务器 |
| **配置方式** | YAML（`.github/workflows/*.yml`） | Groovy（Jenkinsfile） |
| **学习成本** | 低，前端上手容易 | 高，需要 Groovy + 插件概念 |
| **维护成本** | 零（GitHub 维护） | 高（需要运维人员） |
| **插件生态** | 市场化的 actions | 1800+ 插件，自定义空间更大 |
| **免费额度** | 公共仓库无限免费；私有仓库 2000 分钟/月 | 完全免费（但你得出服务器） |
| **企业内部集成** | 有限（依赖 GitHub 生态） | 强（可以对接 LDAP、SonarQube、Jira 等任何内部系统） |
| **适合团队** | 中小团队、开源项目、前端项目 | 大型企业、Java 生态、需要深度定制的场景 |

**回答模板**：

> "小团队或前端项目选 GitHub Actions——零运维成本，上手快。大企业或需要对接内部系统（如 LDAP 登录、内部镜像仓库）选 Jenkins——虽然要自己维护，但灵活度天花板高。两者不互斥，很多公司 CI 用 GitHub Actions、CD 用 Jenkins 做审批部署。"

### Jenkins 的典型企业应用场景

1. **多项目统一管理**：一个 Jenkins 实例管理全公司几百个项目的 CI/CD，统一配置安全策略和审批流程
2. **与内部工具集成**：对接 LDAP 认证、SonarQube 代码质量门禁、Jira 工单状态联动
3. **复杂的审批流程**：Input Step 实现"测试经理审批后才上生产"
4. **SSH 到内网服务器**：Jenkins 部署在内网，可以直接 SSH 到生产服务器做部署（GitHub Actions 做不到）

---

## 面试信号

- **高信号**："我知道 Jenkins 的核心概念，能说出声明式 Pipeline 的几个关键 Stage，也清楚它和 GitHub Actions 各有什么适用场景"
- **低信号**："Jenkins 是什么？我只用过 Vercel 一键部署"
- **不需要**：能手写复杂的 Groovy 脚本式 Pipeline。（这不是前端面试的考察范围）

---

## 相关阅读

- [Jenkins 官方文档](https://www.jenkins.io/doc/)
- [Jenkins Pipeline 语法](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Blue Ocean 插件](https://www.jenkins.io/projects/blueocean/)
- [CI/CD 概述](./overview.md) —— 理解 CI/CD 整体概念
- [GitHub Actions](./github-actions.md) —— 面试最高频的 CI/CD 工具

---

## 更新记录

- 2026-07-06：完成完整内容，补充声明式/脚本式语法对比、与 GitHub Actions 的选型对比、企业应用场景

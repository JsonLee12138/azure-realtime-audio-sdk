---
sidebar_position: 7
---

# 🛠️ 本地开发指南

本指南介绍如何在本地环境中搭建开发环境、运行测试、从 OpenAPI 规范重新生成类型，以及构建 SDK 与文档站点。

---

## 1. Monorepo 代码仓库结构

本项目采用基于 **Turborepo** 与 **pnpm workspaces** 的多包管理架构：

```
azure-realtime-audio-sdk/
├── packages/
│   ├── core/              # 核心 SDK 源码包 ('azure-realtime-audio-sdk')
│   │   ├── lib/           # 源码目录 (core.ts, constants.ts, api/)
│   │   ├── __test__/      # 单元测试 (Vitest)
│   │   ├── realtime-openapi3.yml # Azure OpenAI Realtime OpenAPI 规范
│   │   └── rolldown.config.ts    # Rolldown 打包配置
│   └── tsconfig/          # 共享 TypeScript 配置包
├── apps/
│   └── docs/              # Docusaurus 3 官方文档站点
├── package.json           # 根目录配置与工程化脚本
├── pnpm-workspace.yaml    # 工作区定义
└── turbo.json             # Turborepo 构建管道
```

---

## 2. 环境准备

### 依赖环境

- **Node.js**: `>= 18.0.0`
- **pnpm**: `>= 8.15.0`

### 克隆与依赖安装

```bash
git clone https://github.com/JsonLee12138/azure-realtime-audio-sdk.git
cd azure-realtime-audio-sdk
pnpm install
```

---

## 3. 常用开发命令

### 构建项目

使用 Turbo 与 Rolldown 构建所有工作区包：

```bash
pnpm build
```

仅构建核心 SDK：

```bash
pnpm build:core
```

Rolldown 会生成 ESM、CJS 和 UMD 格式的产物到 `packages/core/dist`，并在 `packages/core/types` 中生成 TypeScript 声明文件。

### 运行单元测试

单元测试采用 [Vitest](https://vitest.dev/)：

```bash
# 监听模式运行测试
pnpm test

# 单次运行测试（CI 模式）
pnpm test:run

# 打开 Vitest UI 界面
pnpm test:ui
```

### 代码检查与格式化

项目集成了 **ESLint**、**Oxlint** 与 **Prettier**：

```bash
# 运行 ESLint & Oxlint
pnpm lint

# 自动修复 Lint 问题
pnpm lint:fix

# 单独运行 Oxlint
pnpm oxlint

# 全局 TypeScript 类型检查
pnpm typecheck

# 格式化代码与文档
pnpm format
```

---

## 4. 文档开发与预览

官方文档基于 **Docusaurus 3** 构建：

```bash
# 启动本地文档开发服务器（热更新）
pnpm dev:docs

# 构建生产版静态文档站点（包含中英文多语言）
pnpm build:docs
```

本地服务启动后访问 `http://localhost:3000/azure-realtime-audio-sdk/` 即可实时预览。

---

## 5. 基于 OpenAPI 重新生成类型

SDK 的 `packages/core/lib/api/types.gen.ts` 是根据官方 Azure OpenAI Realtime OpenAPI 3.0 规范文件 (`packages/core/realtime-openapi3.yml`) 自动生成的。

当 OpenAPI 规范更新时，进入 core 包运行：

```bash
cd packages/core
pnpm gen:types
```

该命令调用 `@hey-api/openapi-ts` 进行强类型映射与生成。

---

## 6. 版本发布流程

我们采用 [Changesets](https://github.com/changesets/changesets) 管理语义化版本和变更日志：

1. 创建本次修改的变更说明：
   ```bash
   pnpm changeset
   ```
2. 按照交互提示选择影响的包（`azure-realtime-audio-sdk`）、升级类型（`patch` / `minor` / `major`）并填写变更简述。
3. 提交 `.changeset/` 下生成的 markdown 记录。
4. 版本升级与发布：
   ```bash
   pnpm version-packages
   pnpm release
   ```

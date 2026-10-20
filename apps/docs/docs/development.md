---
sidebar_position: 7
---

# 🛠️ Development Guide

This guide describes how to set up the repository for local development, run tests, generate types from OpenAPI specifications, and build both the SDK and documentation.

---

## 1. Monorepo Architecture

This project is organized as a Turborepo monorepo powered by **pnpm workspaces**:

```
azure-realtime-audio-sdk/
├── packages/
│   ├── core/              # The primary SDK package ('azure-realtime-audio-sdk')
│   │   ├── lib/           # Source code (core.ts, constants.ts, api/)
│   │   ├── __test__/      # Unit tests (Vitest)
│   │   ├── realtime-openapi3.yml # Azure OpenAI Realtime OpenAPI spec
│   │   └── rolldown.config.ts    # Rolldown bundle configuration
│   └── tsconfig/          # Shared TypeScript configurations
├── apps/
│   └── docs/              # Docusaurus documentation website
├── package.json           # Monorepo root configuration
├── pnpm-workspace.yaml    # Workspace definition
└── turbo.json             # Turborepo task pipeline
```

---

## 2. Environment Setup

### Prerequisites

- **Node.js**: `>= 18.0.0`
- **pnpm**: `>= 8.15.0`

### Clone & Install

```bash
git clone https://github.com/JsonLee12138/azure-realtime-audio-sdk.git
cd azure-realtime-audio-sdk
pnpm install
```

---

## 3. Common Development Commands

### Building Packages

Build all workspace packages using Turbo and Rolldown:

```bash
pnpm build
```

To build only the core SDK package:

```bash
pnpm build:core
```

Rolldown compiles ESM, CJS, and UMD bundles into `packages/core/dist` and generates TypeScript declarations in `packages/core/types`.

### Running Unit Tests

Unit tests are written with [Vitest](https://vitest.dev/):

```bash
# Run tests in watch mode
pnpm test

# Run tests once (CI mode)
pnpm test:run

# Open Vitest UI
pnpm test:ui
```

### Linting and Formatting

This project uses **ESLint**, **Oxlint**, and **Prettier** for high-speed static analysis and formatting:

```bash
# Run ESLint & Oxlint
pnpm lint

# Auto-fix lint issues
pnpm lint:fix

# Run Oxlint directly
pnpm oxlint

# Check TypeScript types across all packages
pnpm typecheck

# Format markdown and code
pnpm format
```

---

## 4. Documentation Development

The documentation site is built using **Docusaurus 3**:

```bash
# Start local docs development server (with live reload)
pnpm dev:docs

# Build production docs site (including English and Chinese locales)
pnpm build:docs
```

The docs site will run at `http://localhost:3000/azure-realtime-audio-sdk/`.

---

## 5. Regenerating Types from OpenAPI

The SDK's types in `packages/core/lib/api/types.gen.ts` are automatically generated from the official Azure OpenAI Realtime OpenAPI 3.0 specification (`packages/core/realtime-openapi3.yml`).

If the OpenAPI schema updates:

```bash
cd packages/core
pnpm gen:types
```

This executes `@hey-api/openapi-ts` configured in `openapi-ts.config.ts`.

---

## 6. Versioning and Releases

We use [Changesets](https://github.com/changesets/changesets) for semantic versioning and changelog management:

1. Create a changeset describing your changes:
   ```bash
   pnpm changeset
   ```
2. Select the package (`azure-realtime-audio-sdk`), bump type (`patch`, `minor`, `major`), and write a summary.
3. Commit the generated markdown file under `.changeset/`.
4. When releasing:
   ```bash
   pnpm version-packages
   pnpm release
   ```

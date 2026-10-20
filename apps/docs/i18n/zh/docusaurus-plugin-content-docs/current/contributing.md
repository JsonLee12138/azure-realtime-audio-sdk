---
sidebar_position: 8
---

# 🤝 贡献指南

感谢您关注并支持 **Azure Realtime Audio SDK**！我们非常欢迎社区以任何形式参与贡献，包括提出 Issue、完善文档、新增功能或提交 Pull Request。

---

## 📋 行为准则

我们致力于营造一个包容、友善和无骚扰的社区环境。在所有交流互动中，请保持尊重与友好。

---

## 🛠️ 贡献工作流

### 1. Fork 与克隆代码

1. 在 GitHub 上 Fork 本项目：`https://github.com/JsonLee12138/azure-realtime-audio-sdk`
2. 克隆您的 Fork 分支到本地：
   ```bash
   git clone https://github.com/<你的用户名>/azure-realtime-audio-sdk.git
   cd azure-realtime-audio-sdk
   ```
3. 安装依赖：
   ```bash
   pnpm install
   ```

### 2. 创建特性分支

请始终基于最新的 `main` 分支拉取新分支：

```bash
# 新功能分支
git checkout -b feat/support-custom-audio-processor

# 缺陷修复分支
git checkout -b fix/reconnect-state-reset

# 文档改进分支
git checkout -b docs/clarify-vad-parameters
```

### 3. 代码修改与测试

- 确保代码符合 ESLint 与 Oxlint 规范。
- 新增功能或修复 bug 时，请在 `packages/core/__test__/` 中添加或更新相应的 Vitest 单元测试。
- 如修改了公共 API 或参数，请同步更新 `apps/docs/docs/` 和 `apps/docs/i18n/zh/` 下的中英文档。

### 4. 规范化提交信息 (Conventional Commits)

本项目遵循 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/) 规范：

格式：`<type>(<scope>): <简要描述>`

推荐使用 Commitizen 引导填写：

```bash
pnpm cz
```

常见类型：

- `feat`: 新增功能
- `fix`: 修复缺陷
- `docs`: 仅文档更改
- `refactor`: 代码重构（不增减功能）
- `test`: 测试用例变动
- `chore`: 构建系统或辅助工具的变动

### 5. 本地运行校验

在提交前，请运行以下命令确保通过所有自动化校验：

```bash
pnpm lint
pnpm typecheck
pnpm test:run
pnpm build:docs
```

### 6. 创建 Changeset

如果您的改动涉及 `azure-realtime-audio-sdk` 包的逻辑或对外 API，请运行：

```bash
pnpm changeset
```

按照提示选择版本类型并填写发布说明。

### 7. 提交 Pull Request

1. 推送分支到 GitHub：
   ```bash
   git push origin feat/your-feature-name
   ```
2. 在 GitHub 页面创建 Pull Request，并详细描述改动的背景与实现思路。

---

## 🐛 反馈 Bug

如果您在使用中发现任何问题，欢迎提交 GitHub Issue：

- 使用清晰简明的标题。
- 提供可复现的最小示例代码或详细步骤。
- 注明运行环境（浏览器/Node.js 版本、操作系统、SDK 版本）。

---

## 💬 社区与交流

- **GitHub Issues**: [提交 Issue](https://github.com/JsonLee12138/azure-realtime-audio-sdk/issues)
- **Twitter (X)**: [@json_lee12138](https://x.com/json_lee12138)
- **Discord 社区**: [加入 Discord](https://discord.gg/666U6JTCQY)
- **QQ 交流群**: [加入 QQ 群](https://pd.qq.com/s/fjwy3eo20?b=9)

---

## 📄 开源许可

参与本项目贡献即表示您同意将您的贡献内容以 [MIT License](https://github.com/JsonLee12138/azure-realtime-audio-sdk/blob/main/LICENSE) 授权发布。

---
sidebar_position: 8
---

# 🤝 Contributing Guide

Thank you for your interest in contributing to **Azure Realtime Audio SDK**! We welcome community contributions, whether they are bug reports, documentation enhancements, feature proposals, or pull requests.

---

## 📋 Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free experience for everyone. Please be respectful and constructive in all community interactions.

---

## 🛠️ Contribution Workflow

### 1. Fork and Clone

1. Fork the repository on GitHub: `https://github.com/JsonLee12138/azure-realtime-audio-sdk`
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/azure-realtime-audio-sdk.git
   cd azure-realtime-audio-sdk
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```

### 2. Create a Feature Branch

Always create a dedicated branch for your change:

```bash
# For a new feature:
git checkout -b feat/support-custom-audio-processor

# For a bug fix:
git checkout -b fix/reconnect-state-reset

# For documentation improvements:
git checkout -b docs/clarify-vad-parameters
```

### 3. Make Your Changes

- Ensure code follows the repository's ESLint and Oxlint standards.
- Add or update unit tests under `packages/core/__test__/` when adding new features or fixing bugs.
- If you change public API surfaces or options, update the corresponding documentation under `apps/docs/docs/` and `apps/docs/i18n/zh/`.

### 4. Conventional Commits

This repository adheres to [Conventional Commits](https://www.conventionalcommits.org/):

Format: `<type>(<scope>): <short description>`

Common types:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to build process, tooling, or dependencies

You can use Commitizen to guide your commit message:

```bash
pnpm cz
```

### 5. Run Verification Checks

Before pushing, ensure all automated checks pass locally:

```bash
pnpm lint
pnpm typecheck
pnpm test:run
pnpm build:docs
```

### 6. Create Changeset (For Code Changes)

If your change affects the published package `azure-realtime-audio-sdk`, run:

```bash
pnpm changeset
```

Follow the interactive prompt to declare a `patch`, `minor`, or `major` version bump and document the change.

### 7. Submit Pull Request

1. Push your branch to GitHub:
   ```bash
   git push origin feat/your-feature-name
   ```
2. Open a Pull Request on the main repository.
3. Fill in the PR description template explaining the _what_ and _why_ of your changes.

---

## 🐛 Reporting Bugs

If you find a bug, please open an issue on GitHub:

- Provide a clear, descriptive title.
- Include minimal reproducible code or steps.
- Mention your environment details (Browser version, Node.js version, OS, SDK version).

---

## 💬 Community & Support

Join the community conversation:

- **GitHub Discussions & Issues**: [Open an issue](https://github.com/JsonLee12138/azure-realtime-audio-sdk/issues)
- **Twitter (X)**: [@json_lee12138](https://x.com/json_lee12138)
- **Discord Community**: [Join Discord](https://discord.gg/666U6JTCQY)

---

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the [MIT License](https://github.com/JsonLee12138/azure-realtime-audio-sdk/blob/main/LICENSE).

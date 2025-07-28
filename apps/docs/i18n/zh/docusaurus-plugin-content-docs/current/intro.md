---
sidebar_position: 1
---
# 🎙️ Azure Realtime Audio SDK

> 基于 Azure OpenAI Realtime API 的 TypeScript/JavaScript SDK，支持实时语音对话

[English](https://github.com/JsonLee12138/azure-realtime-audio-sdk/blob/main/README.en.md) | 中文

## ✨ 特性

- 🎤 **实时语音交互** - 支持流式音频输入输出，低延迟对话体验
- 🔊 **多种音频格式** - 支持 PCM16、G.711 μ-law、G.711 A-law 音频格式
- 🌐 **WebSocket 通信** - 基于 WebSocket 的实时双向通信
- 🛠️ **工具调用支持** - 支持 Function Calling，可扩展 AI 能力
- 📝 **语音转文字** - 内置 Whisper 模型支持语音转录
- 🎯 **TypeScript 原生支持** - 完整的类型定义和 JSDoc 文档
- 🔄 **状态管理** - 智能的对话状态管理（空闲、聆听、思考、回答）
- 🌍 **跨平台** - 支持浏览器和 Node.js 环境

## 📦 安装

```bash
npm install @azure-realtime-audio/core
# 或
pnpm add @azure-realtime-audio/core
# 或
yarn add @azure-realtime-audio/core
``` 
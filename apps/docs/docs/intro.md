---
sidebar_position: 1
---
# 🎙️ Azure Realtime Audio SDK

> TypeScript/JavaScript SDK based on Azure OpenAI Realtime API, supporting real-time voice conversations

[中文](https://github.com/JsonLee12138/azure-realtime-audio-sdk/blob/main/README.md) | English

## ✨ Features

- 🎤 **Real-time Voice Interaction** - Support streaming audio input/output, low-latency conversation experience
- 🔊 **Multiple Audio Formats** - Support PCM16, G.711 μ-law, G.711 A-law audio formats
- 🌐 **WebSocket Communication** - Real-time bidirectional communication based on WebSocket
- 🛠️ **Tool Calling Support** - Support Function Calling, extensible AI capabilities
- 📝 **Speech-to-Text** - Built-in Whisper model support for speech transcription
- 🎯 **TypeScript Native Support** - Complete type definitions and JSDoc documentation
- 🔄 **State Management** - Intelligent conversation state management (idle, listening, thinking, speaking)
- 🌍 **Cross-platform** - Support browser and Node.js environments

## 📦 Installation

```bash
npm install @azure-realtime-audio/core
# or
pnpm add @azure-realtime-audio/core
# or
yarn add @azure-realtime-audio/core
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { AzureRealTimeAudio } from '@azure-realtime-audio/core';

// Create client instance
const client = new AzureRealTimeAudio({
  hostName: 'your-resource.openai.azure.com',
  apiVersion: '2024-10-01-preview',
  deployment: 'gpt-4o-realtime-preview',
  apiKey: 'your-api-key'
});

// Listen for initialization completion
client.once('init', (session) => {
  console.log('Session established:', session);
});

// Listen for model response audio data
client.on('response.audio.delta', (audioData) => {
  // Process audio data stream
  console.log('Received audio data:', audioData.delta);
});

// Listen for conversation completion
client.on('response.done', (response) => {
  console.log('Conversation completed:', response);
});
```

## 📖 Next Steps

- [Getting Started](/docs/getting-started) - Learn basic usage
- [API Reference](/docs/api-reference) - View complete API documentation
- [Examples](/docs/examples) - See practical application cases
- [Guides](/docs/guides) - Understand various usage scenarios

## 🤝 Community and Support

If you encounter issues during use, you can get help through the following channels:

- [GitHub Repository](https://github.com/JsonLee12138/azure-realtime-audio-sdk)
- [Discord Community](https://discord.gg/666U6JTCQY)
- [QQ Channel](https://pd.qq.com/s/fjwy3eo20?b=9)
- [GitHub Issues](https://github.com/JsonLee12138/azure-realtime-audio-sdk/issues)

## 📄 License

MIT License - see the [LICENSE](https://github.com/JsonLee12138/azure-realtime-audio-sdk/blob/main/LICENSE) file for details 
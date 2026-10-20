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
npm install azure-realtime-audio-sdk
# 或
pnpm add azure-realtime-audio-sdk
# 或
yarn add azure-realtime-audio-sdk
```

## 🚀 快速开始

### 基础使用

```typescript
import { AzureRealTimeAudio } from 'azure-realtime-audio-sdk';

// 创建客户端实例
const client = new AzureRealTimeAudio({
  hostName: 'your-resource.openai.azure.com',
  apiVersion: '2024-10-01-preview',
  deployment: 'gpt-4o-realtime-preview',
  apiKey: 'your-api-key'
});

// 监听初始化完成
client.once('init', (session) => {
  console.log('会话已建立:', session);
});

// 监听模型回答的音频数据
client.on('response.audio.delta', (audioData) => {
  // 处理音频数据流
  console.log('收到音频数据:', audioData.delta);
});

// 监听对话完成
client.on('response.done', (response) => {
  console.log('对话完成:', response);
});
```

### 录音和发送音频

```typescript
// 开始录音并发送音频数据
async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (event) => {
    // 将音频数据转换为 base64 并发送
    const reader = new FileReader();
    reader.onload = () => {
      const base64Audio = reader.result.split(',')[1];
      client.appendAudio(base64Audio);
    };
    reader.readAsDataURL(event.data);
  };

  mediaRecorder.start(100); // 每100ms发送一次数据

  // 停止录音时提交音频
  setTimeout(() => {
    mediaRecorder.stop();
    client.commitAudio();
  }, 3000);
}
```

### 高级配置

```typescript
import { AzureRealTimeAudio, ModelStatusEnum } from 'azure-realtime-audio-sdk';

const client = new AzureRealTimeAudio({
  hostName: 'your-resource.openai.azure.com',
  apiVersion: '2024-10-01-preview',
  deployment: 'gpt-4o-realtime-preview',
  apiKey: 'your-api-key',
  // 自定义会话配置
  sessionConfig: {
    voice: 'shimmer',
    instructions: '你是一个友好的AI助手，请用中文回答问题。',
    input_audio_format: 'pcm16',
    output_audio_format: 'pcm16',
    turn_detection: {
      type: 'server_vad',
      threshold: 0.5,
      silence_duration_ms: 800
    },
    tools: [
      {
        type: 'function',
        name: 'get_weather',
        description: '获取天气信息',
        parameters: {
          type: 'object',
          properties: {
            location: { type: 'string', description: '城市名称' }
          }
        }
      }
    ]
  }
}, {
  // WebSocket 配置
  heartbeatInterval: 30000,
  reconnectInterval: 5000
});

// 监听模型状态变化
client.on('input_audio_buffer.speech_started', () => {
  console.log('检测到用户开始说话');
});

client.on('response.created', () => {
  console.log('模型开始思考');
  console.log('当前状态:', client.status); // ModelStatusEnum.THINKING
});
```

## 📖 API 参考

### AzureRealTimeAudio 类

#### 构造函数

```typescript
new AzureRealTimeAudio(options, websocketOptions?, WebSocketImpl?)
```

- `options`: 客户端配置选项
  - `hostName`: Azure OpenAI 服务域名
  - `apiVersion`: API 版本
  - `deployment`: 模型部署名称
  - `apiKey`: API 密钥
  - `sessionConfig?`: 会话配置（可选）

#### 主要方法

##### 事件监听

```typescript
// 注册事件监听器
client.on(event, listener)

// 注册一次性事件监听器
client.once(event, listener)

// 移除事件监听器
client.off(event, listener?)

// 移除所有事件监听器
client.offAll()
```

##### 音频操作

```typescript
// 添加音频数据到缓冲区
client.appendAudio(base64Audio: string)

// 提交音频缓冲区进行处理
client.commitAudio()

// 清空音频缓冲区
client.clearAudioBuffer()
```

##### 对话管理

```typescript
// 创建对话项
client.createConversationItem(item, previousItemId?)

// 删除对话项
client.deleteItem(itemId: string)

// 截断对话项
client.truncateItem(itemId: string, contentIndex: number, audioEndMs: number)

// 创建响应
client.createResponse(responseConfig?)

// 取消当前响应
client.cancelResponse()
```

##### 状态管理

```typescript
// 获取模型状态
const status = client.status; // idle | listening | thinking | speaking

// 设置模型状态
client.status = ModelStatusEnum.IDLE;

// 标记模型完成说话
client.setModelSpeakDone();

// 检查是否已初始化
const isReady = client.isInitialized;

// 获取 WebSocket 连接状态
const connectionState = client.state;
```

### 事件类型

#### 会话事件
- `init` - 会话初始化完成
- `session.created` - 会话创建
- `session.updated` - 会话配置更新

#### 音频事件
- `response.audio.delta` - 音频数据块
- `response.audio.done` - 音频流结束
- `response.audio_transcript.delta` - 音频转录块
- `response.audio_transcript.done` - 音频转录完成
- `input_audio_buffer.speech_started` - 检测到用户开始说话
- `input_audio_buffer.speech_stopped` - 检测到用户停止说话

#### 响应事件
- `response.created` - 响应生成开始
- `response.done` - 响应生成完成
- `response.text.delta` - 文本内容块
- `response.text.done` - 文本内容完成

#### 错误事件
- `error` - 发生错误

### 枚举类型

#### ModelStatusEnum
- `IDLE` - 模型空闲状态
- `LISTENING` - 模型正在聆听用户输入
- `THINKING` - 模型正在思考处理
- `SPEAKING` - 模型正在回答输出

## 🛠️ 使用场景

### 1. 语音助手

```typescript
const voiceAssistant = new AzureRealTimeAudio({
  hostName: 'your-resource.openai.azure.com',
  apiVersion: '2024-10-01-preview',
  deployment: 'gpt-4o-realtime-preview',
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  sessionConfig: {
    voice: 'alloy',
    instructions: '你是一个智能语音助手，请简洁友好地回答用户问题。'
  }
});

// 处理音频播放
voiceAssistant.on('response.audio.delta', (data) => {
  // 将 base64 音频数据解码并播放
  playAudio(data.delta);
});
```

### 2. 客服机器人

```typescript
const customerService = new AzureRealTimeAudio({
  hostName: 'your-resource.openai.azure.com',
  apiVersion: '2024-10-01-preview',
  deployment: 'gpt-4o-realtime-preview',
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  sessionConfig: {
    instructions: '你是一个专业的客服代表，请耐心解答客户问题。',
    tools: [
      {
        type: 'function',
        name: 'query_order',
        description: '查询订单状态',
        parameters: {
          type: 'object',
          properties: {
            orderId: { type: 'string', description: '订单号' }
          }
        }
      }
    ]
  }
});

// 处理工具调用
customerService.on('response.function_call_arguments.done', async (data) => {
  if (data.name === 'query_order') {
    const args = JSON.parse(data.arguments);
    const orderInfo = await queryOrderById(args.orderId);

    // 返回工具调用结果
    customerService.createConversationItem({
      type: 'function_call_output',
      call_id: data.call_id,
      output: JSON.stringify(orderInfo)
    });
  }
});
```

### 3. 实时翻译

```typescript
const translator = new AzureRealTimeAudio({
  hostName: 'your-resource.openai.azure.com',
  apiVersion: '2024-10-01-preview',
  deployment: 'gpt-4o-realtime-preview',
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  sessionConfig: {
    instructions: '请将用户的语音翻译成英文，只返回翻译结果。',
    voice: 'echo'
  }
});

// 实时显示翻译结果
translator.on('response.text.delta', (data) => {
  updateTranslationDisplay(data.delta);
});
```

## 🔧 开发配置

### Node.js 环境

```typescript
import WebSocket from 'ws';
import { AzureRealTimeAudio } from 'azure-realtime-audio-sdk';

const client = new AzureRealTimeAudio(
  {
    hostName: 'your-resource.openai.azure.com',
    apiVersion: '2024-10-01-preview',
    deployment: 'gpt-4o-realtime-preview',
    apiKey: process.env.AZURE_OPENAI_API_KEY!
  },
  {}, // WebSocket 选项
  WebSocket // 传入 WebSocket 实现
);
```

### 环境变量

```bash
# .env 文件
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_ENDPOINT=your-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=gpt-4o-realtime-preview
AZURE_OPENAI_API_VERSION=2024-10-01-preview
```

## 📝 最佳实践

### 1. 错误处理

```typescript
client.on('error', (error) => {
  console.error('连接错误:', error);
  // 实现重连逻辑
  setTimeout(() => {
    // 重新创建客户端连接
  }, 5000);
});
```

### 2. 音频质量优化

```typescript
// 使用合适的音频参数
const sessionConfig = {
  input_audio_format: 'pcm16',
  turn_detection: {
    type: 'server_vad',
    threshold: 0.6, // 调整灵敏度
    silence_duration_ms: 800 // 调整静音检测时间
  }
};
```

### 3. 内存管理

```typescript
// 及时清理事件监听器
const cleanup = () => {
  client.offAll();
  client.close();
};

// 页面卸载时清理
window.addEventListener('beforeunload', cleanup);
```

## 🤝 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

## 🔗 相关链接

- [Azure OpenAI Realtime API 文档](https://github.com/Azure-Samples/aoai-realtime-audio-sdk)
- [WebSocket API 参考](https://github.com/JsonLee12138/easy-websocket-client)

## 💬 支持

如果你在使用过程中遇到问题，可以通过以下方式获取帮助：

- 提交 [Issue](https://github.com/JsonLee12138/azure-realtime-audio-sdk/issues)
- 查看 [文档站点](https://jsonlee12138.github.io/azure-realtime-audio-sdk/)

## 联系我们

- [Twitter (X)](https://x.com/json_lee12138)
- [Discord](https://discord.gg/666U6JTCQY)
- [QQ频道](https://pd.qq.com/s/fjwy3eo20?b=9) [![图片描述](./qq.jpg)](https://pd.qq.com/s/fjwy3eo20?b=9)

---
sidebar_position: 2
---
# 快速开始

## 🚀 基础使用

```typescript
import { AzureRealTimeAudio } from '@azure-realtime-audio/core';

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
import { AzureRealTimeAudio, ModelStatusEnum } from '@azure-realtime-audio/core';

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
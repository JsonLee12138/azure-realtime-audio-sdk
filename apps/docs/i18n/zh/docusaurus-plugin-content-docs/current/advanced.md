---
sidebar_position: 6
---

# 高级主题

本文档涵盖了 Azure Realtime Audio SDK 的高级配置、优化技巧和最佳实践。

## 🔧 错误处理

在使用 Azure Realtime Audio SDK 过程中，建议实现健壮的错误处理机制，提升用户体验和系统稳定性。

### 事件监听方式

SDK 提供了 `error` 事件用于捕获运行时错误：

```typescript
client.on('error', (error) => {
  console.error('连接错误:', error);
  // 实现重连逻辑
  setTimeout(() => {
    // 重新创建客户端连接
  }, 5000);
});
```

### 常见错误类型

- **连接错误**: 网络断开、服务器不可达
- **认证失败**: API Key 错误或权限不足
- **速率限制**: 请求过于频繁
- **音频权限问题**: 浏览器未授权麦克风

### 错误恢复建议

- 自动重连机制
- 明确的错误提示和 UI 反馈
- 记录错误日志，便于排查
- 对于不可恢复的错误，建议引导用户刷新页面或重新登录

### 自动重连示例

```typescript
class RobustClient {
  private client: AzureRealTimeAudio;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.client = new AzureRealTimeAudio({
      hostName: 'your-resource.openai.azure.com',
      apiVersion: '2024-10-01-preview',
      deployment: 'gpt-4o-realtime-preview',
      apiKey: 'your-api-key'
    });

    this.setupErrorHandling();
  }

  private setupErrorHandling() {
    this.client.on('error', (error) => {
      console.error('发生错误:', error);
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        
        console.log(`${delay}ms 后尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
          this.reconnect();
        }, delay);
      } else {
        console.error('重连次数已达上限，请检查网络连接');
        this.showErrorMessage('连接失败，请刷新页面重试');
      }
    });

    // 连接成功后重置重连计数
    this.client.once('init', () => {
      this.reconnectAttempts = 0;
      console.log('连接成功');
    });
  }

  private reconnect() {
    // 重新创建客户端
    this.client.close();
    this.client = new AzureRealTimeAudio({
      hostName: 'your-resource.openai.azure.com',
      apiVersion: '2024-10-01-preview',
      deployment: 'gpt-4o-realtime-preview',
      apiKey: 'your-api-key'
    });
    
    this.setupErrorHandling();
  }

  private showErrorMessage(message: string) {
    // 显示错误消息给用户
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }
}
```

## 🎵 音频质量优化

合理配置音频参数和前端录音设置，可以显著提升语音识别和合成的效果。

### 推荐参数

```typescript
const sessionConfig = {
  input_audio_format: 'pcm16',
  output_audio_format: 'pcm16',
  turn_detection: {
    type: 'server_vad',
    threshold: 0.6, // 调整灵敏度
    silence_duration_ms: 800 // 调整静音检测时间
  }
};
```

### 录音建议

- 使用 16kHz 采样率、单声道
- 启用回声消除、噪声抑制
- 合理分片（如每 100ms 发送一次数据）

### 浏览器录音配置

```typescript
async function setupAudioRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });

    return { stream, mediaRecorder };
  } catch (error) {
    console.error('录音设置失败:', error);
    throw error;
  }
}
```

### 音频处理优化

```typescript
class AudioProcessor {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private microphone: MediaStreamAudioSourceNode;

  constructor(stream: MediaStream) {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.microphone = this.audioContext.createMediaStreamSource(stream);
    
    // 连接音频节点
    this.microphone.connect(this.analyser);
    
    // 设置分析器参数
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;
  }

  // 获取音频音量
  getVolume(): number {
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    return average / 255; // 归一化到 0-1
  }

  // 检测是否有声音
  isSpeaking(threshold: number = 0.1): boolean {
    return this.getVolume() > threshold;
  }

  // 可视化音频
  visualize(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#4CAF50';

    const barWidth = canvas.width / dataArray.length;
    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height;
      ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth, barHeight);
    }
  }
}
```

## 💾 内存管理

及时清理事件监听器和关闭连接，有助于防止内存泄漏，提升应用稳定性。

### 事件监听清理

```typescript
const cleanup = () => {
  client.offAll();
  client.close();
};

// 页面卸载时清理
window.addEventListener('beforeunload', cleanup);
```

### 资源释放建议

- 停止录音时关闭音频流
- 关闭 WebSocket 连接
- 移除所有事件监听器
- 释放 AudioContext 等前端资源

### 完整清理示例

```typescript
class AudioManager {
  private client: AzureRealTimeAudio;
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;

  constructor() {
    this.client = new AzureRealTimeAudio({
      hostName: 'your-resource.openai.azure.com',
      apiVersion: '2024-10-01-preview',
      deployment: 'gpt-4o-realtime-preview',
      apiKey: 'your-api-key'
    });
  }

  async startRecording() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      
      this.mediaRecorder.ondataavailable = (event) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64Audio = reader.result.split(',')[1];
          this.client.appendAudio(base64Audio);
        };
        reader.readAsDataURL(event.data);
      };

      this.mediaRecorder.start(100);
    } catch (error) {
      console.error('录音启动失败:', error);
    }
  }

  stopRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.client.commitAudio();
    }
  }

  cleanup() {
    // 清理事件监听器
    this.client.offAll();
    this.client.close();

    // 停止录音
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
    }

    // 关闭音频流
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }

    // 关闭音频上下文
    if (this.audioContext) {
      this.audioContext.close();
    }

    // 重置引用
    this.stream = null;
    this.mediaRecorder = null;
    this.audioContext = null;
  }
}

// 使用示例
const audioManager = new AudioManager();

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
  audioManager.cleanup();
});

// 组件卸载时清理（React/Vue等）
function cleanup() {
  audioManager.cleanup();
}
```

## ⚡ 性能优化

### 连接优化

```typescript
const client = new AzureRealTimeAudio({
  hostName: 'your-resource.openai.azure.com',
  apiVersion: '2024-10-01-preview',
  deployment: 'gpt-4o-realtime-preview',
  apiKey: 'your-api-key'
}, {
  // WebSocket 配置优化
  heartbeatInterval: 30000, // 心跳间隔
  reconnectInterval: 5000,  // 重连间隔
  maxReconnectAttempts: 5   // 最大重连次数
});
```

### 音频缓冲优化

```typescript
class AudioBufferManager {
  private buffer: string[] = [];
  private maxBufferSize = 10;
  private flushInterval = 100; // ms

  constructor(private client: AzureRealTimeAudio) {
    this.setupFlushTimer();
  }

  appendAudio(base64Audio: string) {
    this.buffer.push(base64Audio);
    
    // 缓冲区满时立即发送
    if (this.buffer.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  private setupFlushTimer() {
    setInterval(() => {
      if (this.buffer.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  private flush() {
    if (this.buffer.length === 0) return;

    // 合并音频数据
    const combinedAudio = this.buffer.join('');
    this.client.appendAudio(combinedAudio);
    
    // 清空缓冲区
    this.buffer = [];
  }

  commit() {
    this.flush();
    this.client.commitAudio();
  }
}
```

### 状态管理优化

```typescript
class StateManager {
  private currentState: string = 'idle';
  private stateCallbacks: Map<string, Function[]> = new Map();

  setState(newState: string) {
    const oldState = this.currentState;
    this.currentState = newState;
    
    // 触发状态变化回调
    this.triggerStateChange(oldState, newState);
  }

  onStateChange(from: string, to: string, callback: Function) {
    const key = `${from}->${to}`;
    if (!this.stateCallbacks.has(key)) {
      this.stateCallbacks.set(key, []);
    }
    this.stateCallbacks.get(key)!.push(callback);
  }

  private triggerStateChange(from: string, to: string) {
    const key = `${from}->${to}`;
    const callbacks = this.stateCallbacks.get(key) || [];
    callbacks.forEach(callback => callback());
  }

  getState(): string {
    return this.currentState;
  }
}

// 使用示例
const stateManager = new StateManager();

stateManager.onStateChange('idle', 'listening', () => {
  console.log('开始监听用户输入');
  updateUI('正在聆听...');
});

stateManager.onStateChange('listening', 'thinking', () => {
  console.log('AI开始思考');
  updateUI('正在思考...');
});

stateManager.onStateChange('thinking', 'speaking', () => {
  console.log('AI开始回答');
  updateUI('正在回答...');
});

stateManager.onStateChange('speaking', 'idle', () => {
  console.log('对话完成');
  updateUI('准备就绪');
});
```

## 🔒 安全考虑

### API 密钥管理

```typescript
// 不要在前端代码中硬编码 API 密钥
// 错误示例
const client = new AzureRealTimeAudio({
  apiKey: 'sk-1234567890abcdef' // ❌ 不要这样做
});

// 正确示例 - 使用环境变量
const client = new AzureRealTimeAudio({
  apiKey: process.env.AZURE_OPENAI_API_KEY! // ✅ 使用环境变量
});

// 或者通过后端代理
const client = new AzureRealTimeAudio({
  hostName: 'your-backend-proxy.com', // 通过后端代理
  apiKey: 'proxy-key' // 使用代理密钥
});
```

### 输入验证

```typescript
class SecureAudioClient {
  private client: AzureRealTimeAudio;

  constructor(config: any) {
    // 验证配置参数
    this.validateConfig(config);
    
    this.client = new AzureRealTimeAudio(config);
  }

  private validateConfig(config: any) {
    if (!config.hostName || !config.apiKey) {
      throw new Error('缺少必要的配置参数');
    }

    // 验证 API 密钥格式
    if (!config.apiKey.startsWith('sk-')) {
      throw new Error('API 密钥格式不正确');
    }

    // 验证域名格式
    const hostNameRegex = /^[a-zA-Z0-9.-]+\.openai\.azure\.com$/;
    if (!hostNameRegex.test(config.hostName)) {
      throw new Error('域名格式不正确');
    }
  }

  appendAudio(base64Audio: string) {
    // 验证音频数据
    if (!this.isValidBase64(base64Audio)) {
      throw new Error('音频数据格式不正确');
    }

    this.client.appendAudio(base64Audio);
  }

  private isValidBase64(str: string): boolean {
    try {
      return btoa(atob(str)) === str;
    } catch {
      return false;
    }
  }
}
```

## 📊 监控和日志

### 性能监控

```typescript
class PerformanceMonitor {
  private metrics = {
    connectionTime: 0,
    responseTime: 0,
    audioLatency: 0,
    errorCount: 0
  };

  startConnectionTimer() {
    this.connectionStartTime = Date.now();
  }

  endConnectionTimer() {
    this.metrics.connectionTime = Date.now() - this.connectionStartTime;
    console.log(`连接耗时: ${this.metrics.connectionTime}ms`);
  }

  measureResponseTime() {
    const startTime = Date.now();
    
    return () => {
      this.metrics.responseTime = Date.now() - startTime;
      console.log(`响应耗时: ${this.metrics.responseTime}ms`);
    };
  }

  recordError(error: Error) {
    this.metrics.errorCount++;
    console.error('错误记录:', {
      error: error.message,
      timestamp: new Date().toISOString(),
      errorCount: this.metrics.errorCount
    });
  }

  getMetrics() {
    return { ...this.metrics };
  }
}
```

## 📚 下一步

- [API 参考](/docs/api-reference) - 查看完整的 API 文档
- [使用示例](/docs/examples) - 查看实际应用案例
- [使用指南](/docs/guides) - 了解各种使用场景
- [开发指南](/docs/development) - 学习开发和贡献 
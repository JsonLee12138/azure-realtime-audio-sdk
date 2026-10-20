---
sidebar_position: 2
---

# 🚀 快速开始

本指南将带您从零开始配置 **`azure-realtime-audio-sdk`**，连接 Azure OpenAI 实时语音服务，并在浏览器中实现麦克风音频采集与模型音频流的实时播放。

---

## 1. 准备工作

在开始编码前，请确保您具备以下条件：

1. **Node.js** 版本 18.0 或更高。
2. 拥有已开通 Azure OpenAI 访问权限的 **Azure 订阅**。
3. 在支持 Realtime 模型的区域（例如 `eastus2`, `swedencentral`, `westus3`）部署了实时模型（如 `gpt-4o-realtime-preview`）。
4. 准备好 Azure OpenAI 凭证参数：
   - **主机名/Endpoint**: 如 `your-resource-name.openai.azure.com`
   - **部署名 (Deployment)**: 如 `gpt-4o-realtime-preview`
   - **API 版本 (API Version)**: 如 `2024-10-01-preview`
   - **API 密钥 (API Key)**: Azure 门户中 _密钥和终结点_ 处获取

---

## 2. 安装 SDK

在您的项目中运行：

```bash
npm install azure-realtime-audio-sdk
# 或
pnpm add azure-realtime-audio-sdk
# 或
yarn add azure-realtime-audio-sdk
```

---

## 3. 基础客户端实例化

```typescript
import { AzureRealTimeAudio } from "azure-realtime-audio-sdk";

const client = new AzureRealTimeAudio({
  hostName: "your-resource-name.openai.azure.com",
  apiVersion: "2024-10-01-preview",
  deployment: "gpt-4o-realtime-preview",
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  sessionConfig: {
    voice: "alloy",
    instructions: "你是一个聪明的语音助手，请简练生动地回答。",
    input_audio_format: "pcm16",
    output_audio_format: "pcm16",
  },
});
```

### 连接生命周期

当实例化 `new AzureRealTimeAudio(...)` 时：

1. SDK 自动向 `wss://<hostName>/openai/realtime?...` 发起 WebSocket 连接。
2. 连接建立后（`open` 事件），SDK 自动发送 `session.update` 命令以应用默认或自定义的会话配置。
3. 当服务端确认会话生效后，SDK 触发 `init` 事件：

```typescript
client.once("init", (data) => {
  console.log("会话就绪，Session ID:", data.session.id);
});
```

---

## 4. 浏览器端麦克风音频采集管线

Azure OpenAI Realtime API 默认接收 **原始单声道 16 位 PCM 音频 (推荐 24kHz)** 并使用 **Base64** 进行编码传输。标准浏览器 `MediaRecorder` API 生成的是包含容器封装（WebM/Opus）的数据，服务端无法直接按 PCM16 解析。

以下是使用现代浏览器 Web Audio API 实现的无损 PCM16 音频录音器：

```typescript
class BrowserAudioRecorder {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private onAudioChunk: (base64PCM: string) => void;

  constructor(onAudioChunk: (base64PCM: string) => void) {
    this.onAudioChunk = onAudioChunk;
  }

  async start() {
    // 1. 请求麦克风权限
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 24000,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });

    // 2. 初始化 24kHz AudioContext
    this.audioContext = new AudioContext({ sampleRate: 24000 });
    const sourceNode = this.audioContext.createMediaStreamSource(
      this.mediaStream,
    );

    // 3. 创建音频处理节点（2048 样本切片，约 85ms 间隔）
    this.processorNode = this.audioContext.createScriptProcessor(2048, 1, 1);

    this.processorNode.onaudioprocess = (event) => {
      const inputFloat32 = event.inputBuffer.getChannelData(0);
      const pcm16Buffer = this.floatTo16BitPCM(inputFloat32);
      const base64Chunk = this.arrayBufferToBase64(pcm16Buffer);
      this.onAudioChunk(base64Chunk);
    };

    sourceNode.connect(this.processorNode);
    this.processorNode.connect(this.audioContext.destination);
  }

  stop() {
    this.processorNode?.disconnect();
    this.mediaStream?.getTracks().forEach((track) => track.stop());
    this.audioContext?.close();
  }

  // 将 Float32 [-1.0, 1.0] 转换为 16 位有符号整型 ArrayBuffer
  private floatTo16BitPCM(float32Array: Float32Array): ArrayBuffer {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true); // 小端序
    }
    return buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}
```

### 将音频流发送给 SDK

```typescript
const recorder = new BrowserAudioRecorder((base64PCM) => {
  client.appendAudio(base64PCM);
});

// 点击按钮开始收音
await recorder.start();
```

---

## 5. 模型流式语音播放与打断 (Barge-In)

模型返回的音频分片在 `response.audio.delta` 中下发，使用 Web Audio API 可进行无缝排队平滑播放：

```typescript
class StreamingAudioPlayer {
  private audioContext: AudioContext;
  private nextPlayTime: number = 0;

  constructor(sampleRate: number = 24000) {
    this.audioContext = new AudioContext({ sampleRate });
  }

  playChunk(base64Audio: string) {
    const binary = atob(base64Audio);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768.0;
    }

    const audioBuffer = this.audioContext.createBuffer(
      1,
      float32.length,
      this.audioContext.sampleRate,
    );
    audioBuffer.getChannelData(0).set(float32);

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);

    const now = this.audioContext.currentTime;
    const startTime = Math.max(now, this.nextPlayTime);
    source.start(startTime);
    this.nextPlayTime = startTime + audioBuffer.duration;
  }

  // 当用户插话打断时立即静音清空队列
  stop() {
    this.audioContext.close();
    this.audioContext = new AudioContext({ sampleRate: 24000 });
    this.nextPlayTime = 0;
  }
}
```

连接到 SDK 事件：

```typescript
const player = new StreamingAudioPlayer(24000);

// 实时播放到来的音频分片
client.on("response.audio.delta", (data) => {
  player.playChunk(data.delta);
});

// 检测到用户开始说话时，立即打断并停止本地播放
client.on("input_audio_buffer.speech_started", () => {
  console.log("检测到用户插话，立刻停止本地播放...");
  player.stop();
});
```

---

## 6. 完整端到端运行示例

```typescript
import { AzureRealTimeAudio, ModelStatusEnum } from "azure-realtime-audio-sdk";

const client = new AzureRealTimeAudio({
  hostName: "your-resource.openai.azure.com",
  apiVersion: "2024-10-01-preview",
  deployment: "gpt-4o-realtime-preview",
  apiKey: "YOUR_AZURE_OPENAI_API_KEY",
  sessionConfig: {
    voice: "alloy",
    instructions: "你是一个聪明幽默的实时对话助手。",
    turn_detection: {
      type: "server_vad",
      threshold: 0.5,
      silence_duration_ms: 600,
    },
  },
});

const player = new StreamingAudioPlayer();
const recorder = new BrowserAudioRecorder((base64PCM) => {
  client.appendAudio(base64PCM);
});

client.once("init", () => {
  console.log("服务已连接并初始化完成，开始录音...");
  recorder.start();
});

client.on("status_changed", ({ status }) => {
  console.log("当前模型状态:", status);
});

client.on("response.audio.delta", (chunk) => {
  player.playChunk(chunk.delta);
});

client.on("response.audio_transcript.delta", (chunk) => {
  console.log("助手回答:", chunk.delta);
});

client.on("conversation.item.input_audio_transcription.completed", (item) => {
  console.log("用户语音识别:", item.transcript);
});

client.on("input_audio_buffer.speech_started", () => {
  player.stop();
});

client.on("error", (err) => {
  console.error("SDK 发生异常:", err);
});
```

---

## 7. 下一步

- 查阅 [核心指南](/docs/guides) 深入了解函数调用 (Tool Calling)、VAD 调优与音频格式。
- 查看 [实战示例](/docs/examples) 获取对讲机 Push-to-Talk 与客服 Agent 范例。
- 阅读 [API 参考](/docs/api-reference) 获取所有方法和参数定义。

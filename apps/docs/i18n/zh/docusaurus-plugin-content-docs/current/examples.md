---
sidebar_position: 4
---

# 💻 实战示例

本页提供生产环境级别的实战代码示例，展示如何使用 **`azure-realtime-audio-sdk`** 构建常见的语音与多模态应用架构。

---

## 1. 实时网页语音助手（支持 VAD 与语音打断）

具备完整的声音采集、低延迟队列播放与用户打断（Barge-in）响应的语音助手应用：

```typescript
import { AzureRealTimeAudio, ModelStatusEnum } from "azure-realtime-audio-sdk";

class VoiceAssistantApp {
  private client: AzureRealTimeAudio;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private nextPlayTime = 0;
  private isInterrupted = false;

  constructor() {
    this.client = new AzureRealTimeAudio({
      hostName: "your-resource.openai.azure.com",
      apiVersion: "2024-10-01-preview",
      deployment: "gpt-4o-realtime-preview",
      apiKey: process.env.AZURE_OPENAI_API_KEY!,
      sessionConfig: {
        voice: "alloy",
        instructions: "你是一个智能、简练的实时语音个人助理。",
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          silence_duration_ms: 600,
        },
      },
    });

    this.bindEvents();
  }

  private bindEvents() {
    this.client.once("init", () => {
      console.log("语音助手连接就绪！");
    });

    // 用户打断：立即重置并清空本地播放队列
    this.client.on("input_audio_buffer.speech_started", () => {
      console.log("检测到用户打断，立刻清空播放队列");
      this.flushAudioPlayer();
    });

    // 接收音频分片并入队播放
    this.client.on("response.audio.delta", (event) => {
      if (!this.isInterrupted) {
        this.enqueueAudioChunk(event.delta);
      }
    });

    this.client.on("response.created", () => {
      this.isInterrupted = false;
    });

    // 实时文字转写
    this.client.on("response.audio_transcript.delta", (event) => {
      console.log("助手回答:", event.delta);
    });

    this.client.on("status_changed", ({ status }) => {
      document.getElementById("status-indicator")!.textContent = status;
    });
  }

  async startListening() {
    this.audioContext = new AudioContext({ sampleRate: 24000 });
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, sampleRate: 24000 },
    });

    const source = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.processor = this.audioContext.createScriptProcessor(2048, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      const pcm16 = new Int16Array(input.length);
      for (let i = 0; i < input.length; i++) {
        const s = Math.max(-1, Math.min(1, input[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }

      let binary = "";
      const bytes = new Uint8Array(pcm16.buffer);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      this.client.appendAudio(btoa(binary));
    };

    source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
  }

  private enqueueAudioChunk(base64Audio: string) {
    if (!this.audioContext) return;

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

    const buffer = this.audioContext.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);

    const now = this.audioContext.currentTime;
    const startTime = Math.max(now, this.nextPlayTime);
    source.start(startTime);
    this.nextPlayTime = startTime + buffer.duration;
  }

  private flushAudioPlayer() {
    this.isInterrupted = true;
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = new AudioContext({ sampleRate: 24000 });
      this.nextPlayTime = 0;
    }
  }
}
```

---

## 2. 对讲机模式 (Push-to-Talk)

在嘈杂环境或业务明确要求按键说话的场景下，可以关闭服务端自动 VAD，完全由按键控制收发：

```typescript
import { AzureRealTimeAudio } from "azure-realtime-audio-sdk";

const client = new AzureRealTimeAudio({
  hostName: "your-resource.openai.azure.com",
  apiVersion: "2024-10-01-preview",
  deployment: "gpt-4o-realtime-preview",
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  sessionConfig: {
    voice: "shimmer",
    turn_detection: null, // 禁用 Server VAD 启用对讲机模式
  },
});

let isRecording = false;
const pttButton = document.getElementById("ptt-button")!;

// 按下按钮开始说话
pttButton.addEventListener("pointerdown", async () => {
  isRecording = true;
  pttButton.classList.add("active");
  await audioRecorder.start((base64Chunk) => {
    if (isRecording) {
      client.appendAudio(base64Chunk);
    }
  });
});

// 松开按钮发送录音并触发回答
pttButton.addEventListener("pointerup", () => {
  if (!isRecording) return;
  isRecording = false;
  pttButton.classList.remove("active");
  audioRecorder.stop();

  // 1. 提交缓冲区
  client.commitAudio();
  // 2. 请求模型回答
  client.createResponse();
});
```

---

## 3. 智能客服 Agent 与函数调用 (Tool Calling)

演示将订单状态查询与退款发起两个真实接口接入到语音对话中：

```typescript
import { AzureRealTimeAudio } from "azure-realtime-audio-sdk";

const supportClient = new AzureRealTimeAudio({
  hostName: "your-resource.openai.azure.com",
  apiVersion: "2024-10-01-preview",
  deployment: "gpt-4o-realtime-preview",
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  sessionConfig: {
    instructions:
      "你是一家电商平台的智能客服代表，请用温柔耐心的中文回答客户，涉及退款必须先查询确认订单。",
    tools: [
      {
        type: "function",
        name: "lookup_order",
        description: "根据 6 位订单编号查询订单状态及商品详情。",
        parameters: {
          type: "object",
          properties: {
            order_id: {
              type: "string",
              description: "订单号，例如 ORD-123456",
            },
          },
          required: ["order_id"],
        },
      },
      {
        type: "function",
        name: "request_refund",
        description: "对符合条件的已送达或破损商品发起退款申请。",
        parameters: {
          type: "object",
          properties: {
            order_id: { type: "string" },
            reason: { type: "string", description: "退款理由" },
          },
          required: ["order_id", "reason"],
        },
      },
    ],
  },
});

// 监听函数调用事件
supportClient.on("response.function_call_arguments.done", async (data) => {
  console.log(`执行工具: ${data.name}, ID: ${data.call_id}`);
  const args = JSON.parse(data.arguments);
  let toolResult: Record<string, any> = {};

  if (data.name === "lookup_order") {
    toolResult = await fetchOrderFromDatabase(args.order_id);
  } else if (data.name === "request_refund") {
    toolResult = {
      success: true,
      refund_id: "REF-88990",
      message: "退款审核申请已提交",
    };
  }

  // 提交工具调用结果
  supportClient.createConversationItem({
    type: "function_call_output",
    call_id: data.call_id,
    output: JSON.stringify(toolResult),
  });

  // 让模型根据执行结果继续进行语音回答
  supportClient.createResponse();
});
```

---

## 4. 实时同声传译与双语字幕

```typescript
import { AzureRealTimeAudio } from "azure-realtime-audio-sdk";

const translator = new AzureRealTimeAudio({
  hostName: "your-resource.openai.azure.com",
  apiVersion: "2024-10-01-preview",
  deployment: "gpt-4o-realtime-preview",
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  sessionConfig: {
    voice: "echo",
    instructions:
      "你是一名同声传译员，立刻将用户所说的中文翻译为流畅自然的英文，不要掺杂任何解释性文字。",
    input_audio_transcription: {
      model: "whisper-1",
    },
  },
});

const userSubtitleElem = document.getElementById("user-subtitle")!;
const translatedSubtitleElem = document.getElementById("translated-subtitle")!;

// 1. 显示用户语音转录原文 (Whisper)
translator.on(
  "conversation.item.input_audio_transcription.completed",
  (data) => {
    userSubtitleElem.textContent = `用户原文: ${data.transcript}`;
  },
);

// 2. 实时流式输出英文字幕
translator.on("response.audio_transcript.delta", (data) => {
  translatedSubtitleElem.textContent += data.delta;
});

translator.on("response.created", () => {
  translatedSubtitleElem.textContent = "";
});

// 3. 播放英文语音翻译
translator.on("response.audio.delta", (data) => {
  audioPlayer.playChunk(data.delta);
});
```

---

## 5. Node.js 服务端音频推流与文件保存

```typescript
import fs from "node:fs";
import WebSocket from "ws";
import { AzureRealTimeAudio } from "azure-realtime-audio-sdk";

const client = new AzureRealTimeAudio(
  {
    hostName: process.env.AZURE_OPENAI_ENDPOINT!,
    apiVersion: "2024-10-01-preview",
    deployment: "gpt-4o-realtime-preview",
    apiKey: process.env.AZURE_OPENAI_API_KEY!,
    sessionConfig: {
      instructions:
        "你是一个运行在 Node.js 服务端的语音助手，回复控制在两句话以内。",
    },
  },
  {},
  WebSocket as unknown as typeof globalThis.WebSocket,
);

client.once("init", () => {
  console.log("Node.js 客户端连接建立成功！");

  // 读取本地 PCM16 音频文件 (24kHz, 单声道) 并分块推送
  const pcmBuffer = fs.readFileSync("./input-24k.pcm");
  const chunkSize = 4800; // 约 100ms 切片

  for (let offset = 0; offset < pcmBuffer.length; offset += chunkSize) {
    const chunk = pcmBuffer.subarray(offset, offset + chunkSize);
    client.appendAudio(chunk.toString("base64"));
  }

  client.commitAudio();
  client.createResponse();
});

const outputChunks: Buffer[] = [];

client.on("response.audio.delta", (data) => {
  outputChunks.push(Buffer.from(data.delta, "base64"));
});

client.on("response.done", () => {
  const finalAudio = Buffer.concat(outputChunks);
  fs.writeFileSync("./output-response-24k.pcm", finalAudio);
  console.log(`成功保存 ${finalAudio.length} 字节的模型音频。`);
  client.close();
});
```

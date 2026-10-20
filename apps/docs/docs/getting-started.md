---
sidebar_position: 2
---

# 🚀 Quick Start Guide

This guide will walk you through setting up **`azure-realtime-audio-sdk`** from scratch, configuring your Azure OpenAI resource, establishing a real-time WebSocket connection, capturing microphone audio in the browser, and streaming model responses.

---

## 1. Prerequisites

Before writing code, make sure you have:

1. **Node.js** version 18.0 or higher.
2. An **Azure Subscription** with access granted to Azure OpenAI Service.
3. A deployed **Realtime model** (e.g., `gpt-4o-realtime-preview`) in an Azure region that supports the Realtime API (such as `eastus2`, `swedencentral`, or `westus3`).
4. Your Azure OpenAI credentials:
   - **Endpoint / Hostname**: e.g., `your-resource-name.openai.azure.com`
   - **Deployment Name**: e.g., `gpt-4o-realtime-preview`
   - **API Version**: e.g., `2024-10-01-preview`
   - **API Key**: Found under _Keys and Endpoint_ in the Azure portal

---

## 2. Installation

Install the SDK in your project:

```bash
npm install azure-realtime-audio-sdk
```

Or with `pnpm` or `yarn`:

```bash
pnpm add azure-realtime-audio-sdk
# or
yarn add azure-realtime-audio-sdk
```

---

## 3. Basic Client Initialization

Create a new instance of `AzureRealTimeAudio`:

```typescript
import { AzureRealTimeAudio } from "azure-realtime-audio-sdk";

const client = new AzureRealTimeAudio({
  hostName: "your-resource-name.openai.azure.com",
  apiVersion: "2024-10-01-preview",
  deployment: "gpt-4o-realtime-preview",
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  sessionConfig: {
    voice: "alloy",
    instructions: "You are a concise, helpful real-time AI assistant.",
    input_audio_format: "pcm16",
    output_audio_format: "pcm16",
  },
});
```

### Understanding the Connection Flow

When `new AzureRealTimeAudio(...)` is instantiated:

1. It connects to `wss://<hostName>/openai/realtime?api-version=<apiVersion>&deployment=<deployment>&api-key=<apiKey>`.
2. Once the WebSocket connection opens, the SDK automatically sends a `session.update` command with either your provided `sessionConfig` or `DEFAULT_SESSION_CONFIG`.
3. When Azure confirms the session configuration, the client emits the `init` event.

```typescript
client.once("init", (data) => {
  console.log("Session successfully established:", data.session.id);
});
```

---

## 4. Capturing Microphone Audio in the Browser

Azure OpenAI Realtime API expects **raw 16-bit PCM audio (mono, 24kHz recommended)** encoded as **base64**. Standard browser `MediaRecorder` outputs containerized audio formats (WebM/Opus) which the server does not accept directly.

Below is a lightweight, reliable browser PCM16 recorder using the Web Audio API:

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
    // 1. Request microphone access
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 24000,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });

    // 2. Initialize AudioContext at 24kHz (native for OpenAI Realtime)
    this.audioContext = new AudioContext({ sampleRate: 24000 });
    const sourceNode = this.audioContext.createMediaStreamSource(
      this.mediaStream,
    );

    // 3. ScriptProcessor buffer of 2048 samples (~85ms chunks)
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

  // Convert Float32Array [-1.0, 1.0] to signed 16-bit integer ArrayBuffer
  private floatTo16BitPCM(float32Array: Float32Array): ArrayBuffer {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true); // Little-endian
    }
    return buffer;
  }

  // Convert ArrayBuffer to Base64
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

### Sending Audio Chunks to Azure

Feed the recorded audio stream directly to the SDK:

```typescript
const recorder = new BrowserAudioRecorder((base64PCM) => {
  client.appendAudio(base64PCM);
});

// Start recording when user clicks a button
await recorder.start();
```

---

## 5. Streaming and Playing AI Audio Responses

When the model responds, it streams base64-encoded PCM16 audio chunks in `response.audio.delta` events. You can play them in continuous sequence using the Web Audio API:

```typescript
class StreamingAudioPlayer {
  private audioContext: AudioContext;
  private nextPlayTime: number = 0;

  constructor(sampleRate: number = 24000) {
    this.audioContext = new AudioContext({ sampleRate });
  }

  // Play a base64 PCM16 chunk smoothly in queue
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

  // Stop playback immediately when user interrupts
  stop() {
    this.audioContext.close();
    this.audioContext = new AudioContext({ sampleRate: 24000 });
    this.nextPlayTime = 0;
  }
}
```

Now connect the player to SDK events:

```typescript
const player = new StreamingAudioPlayer(24000);

// Play incoming audio chunks as they arrive
client.on("response.audio.delta", (data) => {
  player.playChunk(data.delta);
});

// Stop audio playback immediately if the user starts speaking (barge-in)
client.on("input_audio_buffer.speech_started", () => {
  console.log("User interrupted! Stopping playback...");
  player.stop();
});
```

---

## 6. Complete End-to-End Example

Here is a complete, standalone script that brings everything together:

```typescript
import { AzureRealTimeAudio, ModelStatusEnum } from "azure-realtime-audio-sdk";

// 1. Initialize SDK
const client = new AzureRealTimeAudio({
  hostName: "your-resource.openai.azure.com",
  apiVersion: "2024-10-01-preview",
  deployment: "gpt-4o-realtime-preview",
  apiKey: "YOUR_AZURE_OPENAI_API_KEY",
  sessionConfig: {
    voice: "alloy",
    instructions: "You are an intelligent, cheerful conversation partner.",
    turn_detection: {
      type: "server_vad",
      threshold: 0.5,
      silence_duration_ms: 600,
    },
  },
});

// 2. Setup recorder and player
const player = new StreamingAudioPlayer();
const recorder = new BrowserAudioRecorder((base64PCM) => {
  client.appendAudio(base64PCM);
});

// 3. Listen to SDK events
client.once("init", () => {
  console.log("Client connected and initialized.");
  // Start recording user audio
  recorder.start();
});

client.on("status_changed", ({ status }) => {
  console.log("Model status is now:", status);
});

client.on("response.audio.delta", (chunk) => {
  player.playChunk(chunk.delta);
});

client.on("response.audio_transcript.delta", (chunk) => {
  console.log("Assistant transcript:", chunk.delta);
});

client.on("conversation.item.input_audio_transcription.completed", (item) => {
  console.log("User said:", item.transcript);
});

client.on("input_audio_buffer.speech_started", () => {
  console.log("User speech detected, halting playback...");
  player.stop();
});

client.on("error", (err) => {
  console.error("Realtime SDK encountered an error:", err);
});
```

---

## 7. Next Steps

- Check out [Guides](/docs/guides) to learn about Function Calling, Turn Detection settings, and the Audio Pipeline.
- Read [API Reference](/docs/api-reference) for the complete list of methods and types.
- Learn about [Advanced Topics](/docs/advanced) for production-grade security, proxy setups, and low-latency tuning.

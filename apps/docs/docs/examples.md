---
sidebar_position: 4
---

# 💻 Practical Examples

This page provides production-ready code examples showcasing common architectural patterns with **`azure-realtime-audio-sdk`**.

---

## 1. Interactive Web Voice Assistant (with VAD & Interruption)

A full voice assistant featuring automatic Voice Activity Detection (VAD), streaming audio playback, and instantaneous interruption (barge-in).

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
        instructions: "You are an intelligent, concise personal assistant.",
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
      console.log("Voice Assistant initialized and ready.");
    });

    // Handle user interruption: flush audio player immediately
    this.client.on("input_audio_buffer.speech_started", () => {
      console.log("Interruption detected: stopping audio output");
      this.flushAudioPlayer();
    });

    // Stream model audio chunks to speaker
    this.client.on("response.audio.delta", (event) => {
      if (!this.isInterrupted) {
        this.enqueueAudioChunk(event.delta);
      }
    });

    this.client.on("response.created", () => {
      this.isInterrupted = false;
    });

    // Transcript logs
    this.client.on("response.audio_transcript.delta", (event) => {
      console.log("Assistant:", event.delta);
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

## 2. Push-to-Talk (PTT) Walkie-Talkie Mode

In noisy environments or specific enterprise applications, push-to-talk offers deterministic control over when the microphone is recording.

```typescript
import { AzureRealTimeAudio } from "azure-realtime-audio-sdk";

const client = new AzureRealTimeAudio({
  hostName: "your-resource.openai.azure.com",
  apiVersion: "2024-10-01-preview",
  deployment: "gpt-4o-realtime-preview",
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  sessionConfig: {
    voice: "shimmer",
    turn_detection: null, // Disable Server VAD for manual PTT control
  },
});

let isRecording = false;

// Bind to UI Button
const pttButton = document.getElementById("ptt-button")!;

pttButton.addEventListener("pointerdown", async () => {
  isRecording = true;
  pttButton.classList.add("active");
  await audioRecorder.start((base64Chunk) => {
    if (isRecording) {
      client.appendAudio(base64Chunk);
    }
  });
});

pttButton.addEventListener("pointerup", () => {
  if (!isRecording) return;
  isRecording = false;
  pttButton.classList.remove("active");
  audioRecorder.stop();

  // Commit recorded buffer and trigger response
  client.commitAudio();
  client.createResponse();
});
```

---

## 3. Customer Support Agent with Function Calling

This example demonstrates integrating custom business APIs (Order status & refund processing) into real-time voice conversations.

```typescript
import { AzureRealTimeAudio } from "azure-realtime-audio-sdk";

const supportClient = new AzureRealTimeAudio({
  hostName: "your-resource.openai.azure.com",
  apiVersion: "2024-10-01-preview",
  deployment: "gpt-4o-realtime-preview",
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  sessionConfig: {
    instructions: `You are an AI customer support representative for 'Acme Store'.
Be polite, empathetic, and concise. Verify order numbers before requesting refunds.`,
    tools: [
      {
        type: "function",
        name: "lookup_order",
        description: "Lookup order details and shipping status by Order ID.",
        parameters: {
          type: "object",
          properties: {
            order_id: {
              type: "string",
              description: "6-digit order ID, e.g. ORD-123456",
            },
          },
          required: ["order_id"],
        },
      },
      {
        type: "function",
        name: "request_refund",
        description:
          "Initiate a refund for an eligible delivered or damaged order.",
        parameters: {
          type: "object",
          properties: {
            order_id: { type: "string" },
            reason: {
              type: "string",
              description: "Customer reason for refund",
            },
          },
          required: ["order_id", "reason"],
        },
      },
    ],
  },
});

// Mock database
async function databaseLookup(orderId: string) {
  return {
    order_id: orderId,
    status: "Delivered",
    item: "Wireless Noise-Cancelling Headphones",
    delivered_date: "2026-10-15",
  };
}

// Listen for tool call events
supportClient.on("response.function_call_arguments.done", async (data) => {
  console.log(`Tool requested: ${data.name} with call_id: ${data.call_id}`);
  const args = JSON.parse(data.arguments);
  let toolResult: Record<string, any> = {};

  if (data.name === "lookup_order") {
    toolResult = await databaseLookup(args.order_id);
  } else if (data.name === "request_refund") {
    toolResult = {
      success: true,
      refund_id: "REF-98765",
      status: "Pending Review",
    };
  }

  // Provide function execution result back to the model
  supportClient.createConversationItem({
    type: "function_call_output",
    call_id: data.call_id,
    output: JSON.stringify(toolResult),
  });

  // Prompt the model to formulate its spoken response
  supportClient.createResponse();
});
```

---

## 4. Live Speech Translator & Subtitle Display

Simultaneous speech recognition (Whisper-1), live transcript display, and real-time voice translation into Spanish.

```typescript
import { AzureRealTimeAudio } from "azure-realtime-audio-sdk";

const translator = new AzureRealTimeAudio({
  hostName: "your-resource.openai.azure.com",
  apiVersion: "2024-10-01-preview",
  deployment: "gpt-4o-realtime-preview",
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  sessionConfig: {
    voice: "echo",
    instructions: `You are a real-time simultaneous interpreter.
Translate the user's spoken speech immediately into fluent Spanish.
Do not answer or converse; only translate.`,
    input_audio_transcription: {
      model: "whisper-1",
    },
  },
});

const userSubtitleElem = document.getElementById("user-subtitle")!;
const translatedSubtitleElem = document.getElementById("translated-subtitle")!;

// 1. Show user transcribed speech (Whisper)
translator.on(
  "conversation.item.input_audio_transcription.completed",
  (data) => {
    userSubtitleElem.textContent = `User: "${data.transcript}"`;
  },
);

// 2. Stream assistant translated text delta
translator.on("response.audio_transcript.delta", (data) => {
  translatedSubtitleElem.textContent += data.delta;
});

// Clear subtitles when new turn begins
translator.on("response.created", () => {
  translatedSubtitleElem.textContent = "";
});

// Play translated voice audio
translator.on("response.audio.delta", (data) => {
  audioPlayer.playChunk(data.delta);
});
```

---

## 5. Node.js Voice Agent (with `ws`)

Run `azure-realtime-audio-sdk` in a server or CLI environment by providing the `ws` WebSocket library.

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
        "You are a Node.js CLI assistant. Keep answers under 2 sentences.",
    },
  },
  {}, // WebSocketClient options
  WebSocket as unknown as typeof globalThis.WebSocket, // Pass Node.js WebSocket implementation
);

client.once("init", () => {
  console.log("Connected from Node.js!");

  // Send a raw PCM16 audio file (24kHz, mono) in chunks
  const pcmBuffer = fs.readFileSync("./sample-speech-24k.pcm");
  const chunkSize = 4800; // ~100ms at 24kHz 16-bit mono

  for (let offset = 0; offset < pcmBuffer.length; offset += chunkSize) {
    const chunk = pcmBuffer.subarray(offset, offset + chunkSize);
    client.appendAudio(chunk.toString("base64"));
  }

  client.commitAudio();
  client.createResponse();
});

// Collect model response audio into a file
const outputChunks: Buffer[] = [];

client.on("response.audio.delta", (data) => {
  outputChunks.push(Buffer.from(data.delta, "base64"));
});

client.on("response.done", () => {
  const finalBuffer = Buffer.concat(outputChunks);
  fs.writeFileSync("./response-output-24k.pcm", finalBuffer);
  console.log(`Saved ${finalBuffer.length} bytes of response audio.`);
  client.close();
});
```

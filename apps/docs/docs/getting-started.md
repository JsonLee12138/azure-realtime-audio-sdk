---
sidebar_position: 2
---
# Quick Start

## 🚀 Basic Usage

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

### Recording and Sending Audio

```typescript
// Start recording and send audio data
async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (event) => {
    // Convert audio data to base64 and send
    const reader = new FileReader();
    reader.onload = () => {
      const base64Audio = reader.result.split(',')[1];
      client.appendAudio(base64Audio);
    };
    reader.readAsDataURL(event.data);
  };

  mediaRecorder.start(100); // Send data every 100ms

  // Submit audio when recording stops
  setTimeout(() => {
    mediaRecorder.stop();
    client.commitAudio();
  }, 3000);
}
```

### Advanced Configuration

```typescript
import { AzureRealTimeAudio, ModelStatusEnum } from '@azure-realtime-audio/core';

const client = new AzureRealTimeAudio({
  hostName: 'your-resource.openai.azure.com',
  apiVersion: '2024-10-01-preview',
  deployment: 'gpt-4o-realtime-preview',
  apiKey: 'your-api-key',
  // Custom session configuration
  sessionConfig: {
    voice: 'shimmer',
    instructions: 'You are a friendly AI assistant, please answer questions in English.',
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
        description: 'Get weather information',
        parameters: {
          type: 'object',
          properties: {
            location: { type: 'string', description: 'City name' }
          }
        }
      }
    ]
  }
}, {
  // WebSocket configuration
  heartbeatInterval: 30000,
  reconnectInterval: 5000
});

// Listen for model state changes
client.on('input_audio_buffer.speech_started', () => {
  console.log('Detected user started speaking');
});

client.on('response.created', () => {
  console.log('Model started thinking');
  console.log('Current status:', client.status); // ModelStatusEnum.THINKING
});
``` 
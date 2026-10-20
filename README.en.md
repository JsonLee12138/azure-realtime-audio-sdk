# 🎙️ Azure Realtime Audio SDK

> TypeScript/JavaScript SDK for Azure OpenAI Realtime API with real-time voice conversation support

English | [中文](https://github.com/JsonLee12138/azure-realtime-audio-sdk/blob/main/README.md)

## ✨ Features

- 🎤 **Real-time Voice Interaction** - Streaming audio input/output with low-latency conversation
- 🔊 **Multiple Audio Formats** - Support for PCM16, G.711 μ-law, G.711 A-law audio formats
- 🌐 **WebSocket Communication** - Real-time bidirectional communication based on WebSocket
- 🛠️ **Function Calling Support** - Support for Function Calling to extend AI capabilities
- 📝 **Speech-to-Text** - Built-in Whisper model for voice transcription
- 🎯 **Native TypeScript Support** - Complete type definitions and JSDoc documentation
- 🔄 **State Management** - Intelligent conversation state management (idle, listening, thinking, speaking)
- 🌍 **Cross-platform** - Support for both browser and Node.js environments

## 📦 Installation

```bash
npm install azure-realtime-audio-sdk
# or
pnpm add azure-realtime-audio-sdk
# or
yarn add azure-realtime-audio-sdk
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { AzureRealTimeAudio } from 'azure-realtime-audio-sdk';

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

// Listen for model audio response
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

  // Commit audio when stopping recording
  setTimeout(() => {
    mediaRecorder.stop();
    client.commitAudio();
  }, 3000);
}
```

### Advanced Configuration

```typescript
import { AzureRealTimeAudio, ModelStatusEnum } from 'azure-realtime-audio-sdk';

const client = new AzureRealTimeAudio({
  hostName: 'your-resource.openai.azure.com',
  apiVersion: '2024-10-01-preview',
  deployment: 'gpt-4o-realtime-preview',
  apiKey: 'your-api-key',
  // Custom session configuration
  sessionConfig: {
    voice: 'shimmer',
    instructions: 'You are a friendly AI assistant. Please answer questions in English.',
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
  console.log('User started speaking detected');
});

client.on('response.created', () => {
  console.log('Model started thinking');
  console.log('Current status:', client.status); // ModelStatusEnum.THINKING
});
```

## 📖 API Reference

### AzureRealTimeAudio Class

#### Constructor

```typescript
new AzureRealTimeAudio(options, websocketOptions?, WebSocketImpl?)
```

- `options`: Client configuration options
  - `hostName`: Azure OpenAI service hostname
  - `apiVersion`: API version
  - `deployment`: Model deployment name
  - `apiKey`: API key
  - `sessionConfig?`: Session configuration (optional)

#### Main Methods

##### Event Listening

```typescript
// Register event listener
client.on(event, listener)

// Register one-time event listener
client.once(event, listener)

// Remove event listener
client.off(event, listener?)

// Remove all event listeners
client.offAll()
```

##### Audio Operations

```typescript
// Add audio data to buffer
client.appendAudio(base64Audio: string)

// Commit audio buffer for processing
client.commitAudio()

// Clear audio buffer
client.clearAudioBuffer()
```

##### Conversation Management

```typescript
// Create conversation item
client.createConversationItem(item, previousItemId?)

// Delete conversation item
client.deleteItem(itemId: string)

// Truncate conversation item
client.truncateItem(itemId: string, contentIndex: number, audioEndMs: number)

// Create response
client.createResponse(responseConfig?)

// Cancel current response
client.cancelResponse()
```

##### State Management

```typescript
// Get model status
const status = client.status; // idle | listening | thinking | speaking

// Set model status
client.status = ModelStatusEnum.IDLE;

// Mark model finished speaking
client.setModelSpeakDone();

// Check if initialized
const isReady = client.isInitialized;

// Get WebSocket connection state
const connectionState = client.state;
```

### Event Types

#### Session Events
- `init` - Session initialization completed
- `session.created` - Session created
- `session.updated` - Session configuration updated

#### Audio Events
- `response.audio.delta` - Audio data chunk
- `response.audio.done` - Audio stream ended
- `response.audio_transcript.delta` - Audio transcript chunk
- `response.audio_transcript.done` - Audio transcript completed
- `input_audio_buffer.speech_started` - User started speaking detected
- `input_audio_buffer.speech_stopped` - User stopped speaking detected

#### Response Events
- `response.created` - Response generation started
- `response.done` - Response generation completed
- `response.text.delta` - Text content chunk
- `response.text.done` - Text content completed

#### Error Events
- `error` - Error occurred

### Enum Types

#### ModelStatusEnum
- `IDLE` - Model idle state
- `LISTENING` - Model listening to user input
- `THINKING` - Model processing and thinking
- `SPEAKING` - Model speaking/responding

## 🛠️ Use Cases

### 1. Voice Assistant

```typescript
const voiceAssistant = new AzureRealTimeAudio({
  hostName: 'your-resource.openai.azure.com',
  apiVersion: '2024-10-01-preview',
  deployment: 'gpt-4o-realtime-preview',
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  sessionConfig: {
    voice: 'alloy',
    instructions: 'You are an intelligent voice assistant. Please answer user questions concisely and friendly.'
  }
});

// Handle audio playback
voiceAssistant.on('response.audio.delta', (data) => {
  // Decode base64 audio data and play
  playAudio(data.delta);
});
```

### 2. Customer Service Bot

```typescript
const customerService = new AzureRealTimeAudio({
  hostName: 'your-resource.openai.azure.com',
  apiVersion: '2024-10-01-preview',
  deployment: 'gpt-4o-realtime-preview',
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  sessionConfig: {
    instructions: 'You are a professional customer service representative. Please patiently answer customer questions.',
    tools: [
      {
        type: 'function',
        name: 'query_order',
        description: 'Query order status',
        parameters: {
          type: 'object',
          properties: {
            orderId: { type: 'string', description: 'Order ID' }
          }
        }
      }
    ]
  }
});

// Handle function calls
customerService.on('response.function_call_arguments.done', async (data) => {
  if (data.name === 'query_order') {
    const args = JSON.parse(data.arguments);
    const orderInfo = await queryOrderById(args.orderId);

    // Return function call result
    customerService.createConversationItem({
      type: 'function_call_output',
      call_id: data.call_id,
      output: JSON.stringify(orderInfo)
    });
  }
});
```

### 3. Real-time Translation

```typescript
const translator = new AzureRealTimeAudio({
  hostName: 'your-resource.openai.azure.com',
  apiVersion: '2024-10-01-preview',
  deployment: 'gpt-4o-realtime-preview',
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  sessionConfig: {
    instructions: 'Please translate the user\'s speech to English and return only the translation result.',
    voice: 'echo'
  }
});

// Display translation results in real-time
translator.on('response.text.delta', (data) => {
  updateTranslationDisplay(data.delta);
});
```

## 🔧 Development Configuration

### Node.js Environment

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
  {}, // WebSocket options
  WebSocket // Pass WebSocket implementation
);
```

### Environment Variables

```bash
# .env file
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_ENDPOINT=your-resource.openai.azure.com
AZURE_OPENAI_DEPLOYMENT=gpt-4o-realtime-preview
AZURE_OPENAI_API_VERSION=2024-10-01-preview
```

## 📝 Best Practices

### 1. Error Handling

```typescript
client.on('error', (error) => {
  console.error('Connection error:', error);
  // Implement reconnection logic
  setTimeout(() => {
    // Recreate client connection
  }, 5000);
});
```

### 2. Audio Quality Optimization

```typescript
// Use appropriate audio parameters
const sessionConfig = {
  input_audio_format: 'pcm16',
  turn_detection: {
    type: 'server_vad',
    threshold: 0.6, // Adjust sensitivity
    silence_duration_ms: 800 // Adjust silence detection time
  }
};
```

### 3. Memory Management

```typescript
// Clean up event listeners promptly
const cleanup = () => {
  client.offAll();
  client.close();
};

// Clean up on page unload
window.addEventListener('beforeunload', cleanup);
```

## 🤝 Contributing

1. Fork this project
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

## 🔗 Related Links

- [Azure OpenAI Realtime API Documentation](https://github.com/Azure-Samples/aoai-realtime-audio-sdk)
- [WebSocket API Reference](https://github.com/JsonLee12138/easy-websocket-client)

## 💬 Support

If you encounter issues during usage, you can get help through:

- Submit an [Issue](https://github.com/JsonLee12138/azure-realtime-audio-sdk/issues)
- Check the [Documentation Site](https://jsonlee12138.github.io/azure-realtime-audio-sdk/)

## Contact Us

- [Twitter (X)](https://x.com/json_lee12138)
- [Discord](https://discord.gg/666U6JTCQY)

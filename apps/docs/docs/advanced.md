---
sidebar_position: 6
---

# Advanced Topics

This document covers advanced configurations, optimization techniques, and best practices for Azure Realtime Audio SDK.

## 🔧 Error Handling

It's recommended to implement robust error handling mechanisms when using Azure Realtime Audio SDK to improve user experience and system stability.

### Event Listening Method

The SDK provides an `error` event for capturing runtime errors:

```typescript
client.on('error', (error) => {
  console.error('Connection error:', error);
  // Implement reconnection logic
  setTimeout(() => {
    // Recreate client connection
  }, 5000);
});
```

### Common Error Types

- **Connection Errors**: Network disconnection, server unreachable
- **Authentication Failures**: API Key errors or insufficient permissions
- **Rate Limiting**: Requests too frequent
- **Audio Permission Issues**: Browser not authorized for microphone

### Error Recovery Recommendations

- Automatic reconnection mechanism
- Clear error prompts and UI feedback
- Record error logs for troubleshooting
- For unrecoverable errors, guide users to refresh the page or re-login

## 🎵 Audio Quality Optimization

Properly configuring audio parameters and frontend recording settings can significantly improve speech recognition and synthesis effects.

### Recommended Parameters

```typescript
const sessionConfig = {
  input_audio_format: 'pcm16',
  output_audio_format: 'pcm16',
  turn_detection: {
    type: 'server_vad',
    threshold: 0.6, // Adjust sensitivity
    silence_duration_ms: 800 // Adjust silence detection time
  }
};
```

### Recording Recommendations

- Use 16kHz sample rate, mono channel
- Enable echo cancellation, noise suppression
- Reasonable chunking (e.g., send data every 100ms)

### Browser Recording Configuration

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
    console.error('Recording setup failed:', error);
    throw error;
  }
}
```

## 💾 Memory Management

Timely cleanup of event listeners and closing connections helps prevent memory leaks and improves application stability.

### Event Listener Cleanup

```typescript
const cleanup = () => {
  client.offAll();
  client.close();
};

// Clean up when page unloads
window.addEventListener('beforeunload', cleanup);
```

### Resource Release Recommendations

- Close audio streams when stopping recording
- Close WebSocket connections
- Remove all event listeners
- Release frontend resources like AudioContext

## ⚡ Performance Optimization

### Connection Optimization

```typescript
const client = new AzureRealTimeAudio({
  hostName: 'your-resource.openai.azure.com',
  apiVersion: '2024-10-01-preview',
  deployment: 'gpt-4o-realtime-preview',
  apiKey: 'your-api-key'
}, {
  // WebSocket configuration optimization
  heartbeatInterval: 30000, // Heartbeat interval
  reconnectInterval: 5000,  // Reconnection interval
  maxReconnectAttempts: 5   // Maximum reconnection attempts
});
```

### Audio Buffer Optimization

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
    
    // Send immediately when buffer is full
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

    // Combine audio data
    const combinedAudio = this.buffer.join('');
    this.client.appendAudio(combinedAudio);
    
    // Clear buffer
    this.buffer = [];
  }

  commit() {
    this.flush();
    this.client.commitAudio();
  }
}
```

## 🔒 Security Considerations

### API Key Management

```typescript
// Don't hardcode API keys in frontend code
// Wrong example
const client = new AzureRealTimeAudio({
  apiKey: 'sk-1234567890abcdef' // ❌ Don't do this
});

// Correct example - Use environment variables
const client = new AzureRealTimeAudio({
  apiKey: process.env.AZURE_OPENAI_API_KEY! // ✅ Use environment variables
});

// Or through backend proxy
const client = new AzureRealTimeAudio({
  hostName: 'your-backend-proxy.com', // Through backend proxy
  apiKey: 'proxy-key' // Use proxy key
});
```

### Input Validation

```typescript
class SecureAudioClient {
  private client: AzureRealTimeAudio;

  constructor(config: any) {
    // Validate configuration parameters
    this.validateConfig(config);
    
    this.client = new AzureRealTimeAudio(config);
  }

  private validateConfig(config: any) {
    if (!config.hostName || !config.apiKey) {
      throw new Error('Missing required configuration parameters');
    }

    // Validate API key format
    if (!config.apiKey.startsWith('sk-')) {
      throw new Error('Incorrect API key format');
    }

    // Validate domain format
    const hostNameRegex = /^[a-zA-Z0-9.-]+\.openai\.azure\.com$/;
    if (!hostNameRegex.test(config.hostName)) {
      throw new Error('Incorrect domain format');
    }
  }

  appendAudio(base64Audio: string) {
    // Validate audio data
    if (!this.isValidBase64(base64Audio)) {
      throw new Error('Incorrect audio data format');
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

## 📊 Monitoring and Logging

### Performance Monitoring

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
    console.log(`Connection time: ${this.metrics.connectionTime}ms`);
  }

  measureResponseTime() {
    const startTime = Date.now();
    
    return () => {
      this.metrics.responseTime = Date.now() - startTime;
      console.log(`Response time: ${this.metrics.responseTime}ms`);
    };
  }

  recordError(error: Error) {
    this.metrics.errorCount++;
    console.error('Error record:', {
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

## 📚 Next Steps

- [API Reference](/docs/api-reference) - View complete API documentation
- [Examples](/docs/examples) - See practical application cases
- [Guides](/docs/guides) - Understand various usage scenarios
- [Development Guide](/docs/development) - Learn development and contribution 
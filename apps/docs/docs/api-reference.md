---
sidebar_position: 3
---
# API Reference

## AzureRealTimeAudio Class

### Constructor

```typescript
new AzureRealTimeAudio(options, websocketOptions?, WebSocketImpl?)
```

- `options`: Client configuration options
  - `hostName`: Azure OpenAI service domain
  - `apiVersion`: API version
  - `deployment`: Model deployment name
  - `apiKey`: API key
  - `sessionConfig?`: Session configuration (optional)

### Main Methods

#### Event Listening

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

#### Audio Operations

```typescript
// Add audio data to buffer
client.appendAudio(base64Audio: string)

// Submit audio buffer for processing
client.commitAudio()

// Clear audio buffer
client.clearAudioBuffer()
```

#### Conversation Management

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

#### State Management

```typescript
// Get model status
const status = client.status; // idle | listening | thinking | speaking

// Set model status
client.status = ModelStatusEnum.IDLE;

// Mark model speaking done
client.setModelSpeakDone();

// Check if initialized
const isReady = client.isInitialized;

// Get WebSocket connection state
const connectionState = client.state;
```

### Event Types

#### Session Events
- `init` - Session initialization complete
- `session.created` - Session created
- `session.updated` - Session configuration updated

#### Audio Events
- `response.audio.delta` - Audio data chunk
- `response.audio.done` - Audio stream ended
- `response.audio_transcript.delta` - Audio transcript chunk
- `response.audio_transcript.done` - Audio transcription complete
- `input_audio_buffer.speech_started` - Detected user started speaking
- `input_audio_buffer.speech_stopped` - Detected user stopped speaking

#### Response Events
- `response.created` - Response generation started
- `response.done` - Response generation complete
- `response.text.delta` - Text content chunk
- `response.text.done` - Text content complete

#### Error Events
- `error` - Error occurred

### Enum Types

#### ModelStatusEnum
- `IDLE` - Model idle state
- `LISTENING` - Model is listening to user input
- `THINKING` - Model is thinking/processing
- `SPEAKING` - Model is speaking/outputting 
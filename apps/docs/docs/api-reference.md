---
sidebar_position: 3
---
# API Reference

This document provides a comprehensive reference for all classes, methods, enums, and data types used in the Azure Realtime Audio SDK.

## `AzureRealTimeAudio` Class

The main class for interacting with the Azure OpenAI Realtime API.

### Constructor

```typescript
new AzureRealTimeAudio(options, websocketOptions?, WebSocketImpl?)
```

- **`options`**: `AzureRealTimeAudioOptions` - Client configuration.
  - `hostName`: Your Azure OpenAI service domain.
  - `apiVersion`: The API version.
  - `deployment`: The model deployment name.
  - `apiKey`: Your API key.
  - `sessionConfig?`: Optional session configuration. See [Session Configuration](#session-configuration) for details.
- **`websocketOptions?`**: `WebSocketClientOptions` - Optional configuration for the underlying WebSocket client.
- **`WebSocketImpl?`**: `typeof WebSocket` - Optional custom WebSocket implementation, required for Node.js environments.

### Methods

#### Event Handling
- `on(event, listener)`: Registers a listener for a specific event.
- `once(event, listener)`: Registers a one-time listener for an event.
- `off(event, listener?)`: Removes a specific listener or all listeners for an event.
- `offAll()`: Removes all event listeners.

#### Audio Operations
- `appendAudio(base64Audio: string)`: Sends a base64-encoded audio chunk.
- `commitAudio()`: Commits the buffered audio, signaling the end of user speech.
- `clearAudioBuffer()`: Clears the audio buffer on the server.

#### Conversation Management
- `createConversationItem(item: RealtimeRealtimeRequestItem, previousItemId?: string)`: Adds an item to the conversation history. See [Conversation Items](#conversation-items) for `item` structure.
- `deleteItem(itemId: string)`: Deletes an item from the conversation history.
- `truncateItem(itemId: string, contentIndex: number, audioEndMs: number)`: Truncates a conversation item.
- `createResponse(responseConfig?: RealtimeRealtimeRequestResponseCreateCommand['response'])`: Requests a response from the model. See [Response Configuration](#response-configuration) for details.
- `cancelResponse()`: Cancels an in-progress model response.

#### State Management
- `status`: (Getter) Returns the current `ModelStatusEnum`.
- `status = newStatus`: (Setter) Sets the model status.
- `setModelSpeakDone()`: A helper to set the status to `IDLE` after the model finishes speaking.
- `isInitialized`: (Getter) Returns `true` if the session is initialized.
- `state`: (Getter) Returns the underlying WebSocket connection state.

---

## Enums and Type Aliases

### ModelStatusEnum
Represents the state of the AI model.

| Value | Description |
|---|---|
| `IDLE` | Model is idle and waiting for input. |
| `LISTENING` | Model is actively listening to user audio. |
| `THINKING` | Model is processing the input and generating a response. |
| `SPEAKING` | Model is outputting audio/text. |

### RealtimeRealtimeAudioFormat
Specifies the audio format for input and output.

| Value | Description |
|---|---|
| `pcm16` | 16-bit PCM audio. |
| `g711_ulaw` | G.711 μ-law audio codec. |
| `g711_alaw` | G.711 A-law audio codec. |

### RealtimeRealtimeVoice
Specifies the voice for the text-to-speech output.

| Value | Description |
|---|---|
| `alloy` | Alloy voice. |
| `shimmer` | Shimmer voice. |
| `echo` | Echo voice. |

### Other Type Aliases

| Type | Description | Possible Values |
|---|---|---|
| `RealtimeRealtimeItemStatus` | The status of a conversation item. | `in_progress`, `completed`, `incomplete` |
| `RealtimeRealtimeItemType` | The type of a conversation item. | `message`, `function_call`, `function_call_output` |
| `RealtimeRealtimeMessageRole` | The role of the author of a message. | `system`, `user`, `assistant` |
| `RealtimeRealtimeResponseStatus` | The final status of a model's response. | `in_progress`, `completed`, `cancelled`, `incomplete`, `failed` |
| `RealtimeRealtimeToolType` | The type of a tool. | `function` |

---

## Data Structures

### Session Configuration
The `sessionConfig` object passed to the constructor.

```typescript
interface SessionConfig {
  model?: 'gpt-4o-realtime';
  modalities?: ('text' | 'audio')[];
  voice?: RealtimeRealtimeVoice;
  instructions?: string;
  input_audio_format?: RealtimeRealtimeAudioFormat;
  output_audio_format?: RealtimeRealtimeAudioFormat;
  input_audio_transcription?: {
    model?: 'whisper-1';
  };
  turn_detection?: {
    type: 'server_vad';
    threshold?: number;
    silence_duration_ms?: string | number;
  };
  tools?: RealtimeRealtimeTool[];
  tool_choice?: RealtimeRealtimeToolChoice;
  temperature?: number;
  max_response_output_tokens?: number | 'inf';
}
```

### Response Configuration
The `responseConfig` object for the `createResponse` method.

```typescript
interface ResponseConfig {
  commit: boolean;
  cancel_previous: boolean;
  append_input_items?: RealtimeRealtimeRequestItem[];
  input_items?: RealtimeRealtimeRequestItem[];
  instructions?: string;
  modalities?: ('text' | 'audio')[];
  voice?: RealtimeRealtimeVoice;
  temperature?: number;
  max_output_tokens?: number | 'inf' | null;
  tools?: RealtimeRealtimeTool[];
  tool_choice?: RealtimeRealtimeToolChoice;
  output_audio_format?: RealtimeRealtimeAudioFormat;
}
```

### Conversation Items
Used in `createConversationItem` and `append_input_items`.

#### Message Item
```typescript
interface MessageItem {
  type: 'message';
  role: RealtimeRealtimeMessageRole; // 'system', 'user', or 'assistant'
  content: (TextContentPart | AudioContentPart)[];
}

interface TextContentPart {
  type: 'input_text';
  text: string;
}

interface AudioContentPart {
  type: 'input_audio';
  transcript?: string;
}
```

#### Function Call Item
```typescript
interface FunctionCallItem {
  type: 'function_call';
  call_id: string;
  name: string;
  arguments: string;
}
```

#### Function Call Output Item
```typescript
interface FunctionCallOutputItem {
  type: 'function_call_output';
  call_id: string;
  output: string;
}
```

### Tools and Tool Choice

#### Function Tool
```typescript
interface FunctionTool {
  type: 'function';
  name: string;
  description?: string;
  parameters?: object; // JSON Schema object
}
```

#### Tool Choice
```typescript
// Can be a string literal or an object
type ToolChoice = 'auto' | 'none' | 'required' | ToolChoiceObject;

interface ToolChoiceObject {
  type: 'function';
  function: {
    name: string;
  };
}
```

---

## Event Payloads

This section details the data structure received by the listener for each event.

#### `init` / `session.updated`
- **Payload**: `RealtimeRealtimeResponseSessionUpdatedCommand`
- **Description**: Fired when the session is first initialized and ready, or when its configuration is updated.
- **Structure**: `{ type: 'session.updated', session: RealtimeRealtimeResponseSession }`

#### `session.created`
- **Payload**: `RealtimeRealtimeResponseSessionCreatedCommand`
- **Description**: Fired when a new session is successfully created on the server.
- **Structure**: `{ type: 'session.created', session: RealtimeRealtimeResponseSession }`

#### `response.audio.delta`
- **Payload**: `RealtimeRealtimeResponseAudioDeltaCommand`
- **Description**: Contains a chunk of the synthesized audio from the model.
- **Structure**: `{ type: 'response.audio.delta', delta: string }` (base64 encoded)

#### `response.audio.done`
- **Payload**: `RealtimeRealtimeResponseAudioDoneCommand`
- **Description**: Signals the end of the audio stream for a content part.
- **Structure**: `{ type: 'response.audio.done', ... }`

#### `response.audio_transcript.delta`
- **Payload**: `RealtimeRealtimeResponseAudioTranscriptDeltaCommand`
- **Description**: Contains a chunk of the live transcript of the model's speech.
- **Structure**: `{ type: 'response.audio_transcript.delta', delta: string }`

#### `response.audio_transcript.done`
- **Payload**: `RealtimeRealtimeResponseAudioTranscriptDoneCommand`
- **Description**: Signals the final, complete transcript of the model's speech.
- **Structure**: `{ type: 'response.audio_transcript.done', transcript: string }`

#### `response.text.delta`
- **Payload**: `RealtimeRealtimeResponseTextDeltaCommand`
- **Description**: Contains a chunk of the model's text response.
- **Structure**: `{ type: 'response.text.delta', delta: string }`

#### `response.text.done`
- **Payload**: `RealtimeRealtimeResponseTextDoneCommand`
- **Description**: Signals the final, complete text response from the model.
- **Structure**: `{ type: 'response.text.done', value: string }`

#### `response.created`
- **Payload**: `RealtimeRealtimeResponseCreatedCommand`
- **Description**: Fired when the model begins processing a request to generate a response.
- **Structure**: `{ type: 'response.created', response: RealtimeRealtimeResponse }`

#### `response.done`
- **Payload**: `RealtimeRealtimeResponseDoneCommand`
- **Description**: Fired when the model has fully completed its response turn.
- **Structure**: `{ type: 'response.done', response: RealtimeRealtimeResponse }`

#### `input_audio_buffer.speech_started`
- **Payload**: `RealtimeRealtimeResponseInputAudioBufferSpeechStartedCommand`
- **Description**: Fired when the server's VAD detects the start of user speech.
- **Structure**: `{ type: 'input_audio_buffer.speech_started', item_id: string, audio_start_ms: number }`

#### `input_audio_buffer.speech_stopped`
- **Payload**: `RealtimeRealtimeResponseInputAudioBufferSpeechStoppedCommand`
- **Description**: Fired when the server's VAD detects the end of user speech.
- **Structure**: `{ type: 'input_audio_buffer.speech_stopped', item_id: string, audio_end_ms: number }`

#### `response.function_call_arguments.delta`
- **Payload**: `RealtimeRealtimeResponseFunctionCallArgumentsDeltaCommand`
- **Description**: Contains a chunk of the arguments for a tool function call.
- **Structure**: `{ type: '...', call_id: string, delta: string }`

#### `response.function_call_arguments.done`
- **Payload**: `RealtimeRealtimeResponseFunctionCallArgumentsDoneCommand`
- **Description**: Signals the complete arguments for a tool function call.
- **Structure**: `{ type: '...', call_id: string, name: string, arguments: string }`

#### `error`
- **Payload**: `RealtimeRealtimeResponseErrorCommand`
- **Description**: Fired when an error occurs.
- **Structure**: `{ type: 'error', error: { message: string, code?: string, param?: string } }`

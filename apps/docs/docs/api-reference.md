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

- **`options`**: `AzureRealTimeAudioOptions` - Client configuration. See [AzureRealTimeAudioOptions](#azurerealtimeaudiooptions) for details.
- **`websocketOptions?`**: `WebSocketClientOptions` - Optional configuration for the underlying WebSocket client. See [WebSocketClientOptions](#websocketclientoptions) for details.
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

### RealtimeRealtimeAudioInputTranscriptionModel
Specifies the model for audio input transcription.

| Value | Description |
|---|---|
| `whisper-1` | OpenAI Whisper v1 model for speech-to-text. |

### RealtimeRealtimeContentPartType
Specifies the type of content part.

| Value | Description |
|---|---|
| `input_text` | Text content provided as input. |
| `input_audio` | Audio content provided as input. |
| `text` | Text content in response. |
| `audio` | Audio content in response. |

### RealtimeRealtimeToolChoiceLiteral
String literal options for tool choice.

| Value | Description |
|---|---|
| `auto` | Automatically choose whether to use tools. |
| `none` | Do not use any tools. |
| `required` | Require the use of tools. |

### RealtimeRealtimeTurnDetectionType
Specifies the type of turn detection.

| Value | Description |
|---|---|
| `server_vad` | Server-side voice activity detection. |

### Other Type Aliases

| Type | Description | Possible Values |
|---|---|---|
| `RealtimeRealtimeItemStatus` | The status of a conversation item. | `in_progress`, `completed`, `incomplete` |
| `RealtimeRealtimeItemType` | The type of a conversation item. | `message`, `function_call`, `function_call_output` |
| `RealtimeRealtimeMessageRole` | The role of the author of a message. | `system`, `user`, `assistant` |
| `RealtimeRealtimeResponseStatus` | The final status of a model's response. | `in_progress`, `completed`, `cancelled`, `incomplete`, `failed` |
| `RealtimeRealtimeToolType` | The type of a tool. | `function` |
| `RealtimeRealtimeRequestModel` | The model to use for requests. | `gpt-4o-realtime` |

---

## Configuration Interfaces

### AzureRealTimeAudioOptions
The main configuration interface for initializing the Azure Real-time Audio SDK client.

```typescript
interface AzureRealTimeAudioOptions {
  hostName: string;
  apiVersion: string;
  deployment: string;
  apiKey: string;
  sessionConfig?: SessionConfig;
}
```

#### Fields
- **`hostName`**: `string` - Azure OpenAI service hostname (e.g., 'your-resource.openai.azure.com')
- **`apiVersion`**: `string` - API version string (e.g., '2024-10-01-preview')
- **`deployment`**: `string` - Model deployment name configured in Azure OpenAI
- **`apiKey`**: `string` - API key for authentication with Azure OpenAI service
- **`sessionConfig?`**: `SessionConfig` - Optional session configuration to override defaults. See [Session Configuration](#session-configuration) for details.

### WebSocketClientOptions
Configuration options for the underlying WebSocket client connection.

```typescript
interface WebSocketClientOptions {
  reconnectInterval?: number;
  heartbeatInterval?: number;
  heartbeatMessage?: any;
  maxReconnectAttempts?: number;
  shouldReconnect?: boolean;
  protocols?: string | string[];
  showLog?: boolean;
  connectResend?: boolean;
  jsonAble?: boolean;
}
```

#### Fields
- **`reconnectInterval?`**: `number` - Time interval in milliseconds between reconnection attempts
- **`heartbeatInterval?`**: `number` - Time interval in milliseconds between heartbeat messages
- **`heartbeatMessage?`**: `any` - Custom message to send as heartbeat
- **`maxReconnectAttempts?`**: `number` - Maximum number of reconnection attempts before giving up
- **`shouldReconnect?`**: `boolean` - Whether to automatically attempt reconnection on connection loss
- **`protocols?`**: `string | string[]` - WebSocket subprotocols to use
- **`showLog?`**: `boolean` - Whether to show connection logs in console
- **`connectResend?`**: `boolean` - Whether to resend messages on reconnection
- **`jsonAble?`**: `boolean` - Whether to automatically parse JSON messages

---

## Data Structures

### Session Configuration
The `sessionConfig` object passed to the constructor.

```typescript
interface SessionConfig {
  model?: RealtimeRealtimeRequestModel; // 'gpt-4o-realtime'
  modalities?: ('text' | 'audio')[];
  voice?: RealtimeRealtimeVoice;
  instructions?: string;
  input_audio_format?: RealtimeRealtimeAudioFormat;
  output_audio_format?: RealtimeRealtimeAudioFormat;
  input_audio_transcription?: RealtimeRealtimeAudioInputTranscriptionSettings;
  turn_detection?: RealtimeRealtimeTurnDetection | RealtimeRealtimeServerVadTurnDetection;
  tools?: RealtimeRealtimeTool[];
  tool_choice?: RealtimeRealtimeToolChoice;
  temperature?: number;
  max_response_output_tokens?: number | 'inf';
}
```

#### Fields
- **`model?`**: `RealtimeRealtimeRequestModel` - The model to use for realtime conversation (default: 'gpt-4o-realtime')
- **`modalities?`**: `('text' | 'audio')[]` - List of modalities the model should support (default: ['text', 'audio'])
- **`voice?`**: `RealtimeRealtimeVoice` - Voice to use for audio generation ('alloy' | 'shimmer' | 'echo', default: 'alloy')
- **`instructions?`**: `string` - System instructions for the AI model behavior
- **`input_audio_format?`**: `RealtimeRealtimeAudioFormat` - Format for input audio data (default: 'pcm16')
- **`output_audio_format?`**: `RealtimeRealtimeAudioFormat` - Format for output audio data (default: 'pcm16')
- **`input_audio_transcription?`**: `RealtimeRealtimeAudioInputTranscriptionSettings` - Settings for input audio transcription. See [Audio Input Transcription Settings](#audio-input-transcription-settings).
- **`turn_detection?`**: `RealtimeRealtimeTurnDetection | RealtimeRealtimeServerVadTurnDetection` - Configuration for voice activity detection and turn taking. See [Turn Detection](#turn-detection).
- **`tools?`**: `RealtimeRealtimeTool[]` - List of tools/functions available to the model. See [Tools and Tool Choice](#tools-and-tool-choice).
- **`tool_choice?`**: `RealtimeRealtimeToolChoice` - How the model should choose which tools to use ('auto' | 'none' | 'required' | object)
- **`temperature?`**: `number` - Sampling temperature for response generation (0.0 to 1.0)
- **`max_response_output_tokens?`**: `number | 'inf'` - Maximum number of tokens for model response

### Audio Input Transcription Settings
Settings for transcribing input audio to text.

```typescript
interface RealtimeRealtimeAudioInputTranscriptionSettings {
  model?: RealtimeRealtimeAudioInputTranscriptionModel; // 'whisper-1'
}
```

#### Fields
- **`model?`**: `RealtimeRealtimeAudioInputTranscriptionModel` - Model to use for transcribing input audio (default: 'whisper-1')

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

#### Fields
- **`commit`**: `boolean` - Whether to commit the generated messages to the conversation
- **`cancel_previous`**: `boolean` - Whether to cancel any previous response generation in progress
- **`append_input_items?`**: `RealtimeRealtimeRequestItem[]` - Items to append to the conversation before generating response
- **`input_items?`**: `RealtimeRealtimeRequestItem[]` - Complete list of input items for the conversation context
- **`instructions?`**: `string` - Specific instructions for this response generation
- **`modalities?`**: `('text' | 'audio')[]` - Modalities to use for this response
- **`voice?`**: `RealtimeRealtimeVoice` - Voice to use for audio generation in this response
- **`temperature?`**: `number` - Sampling temperature for this response (0.0 to 1.0)
- **`max_output_tokens?`**: `number | 'inf' | null` - Maximum tokens for this response
- **`tools?`**: `RealtimeRealtimeTool[]` - Tools available for this response
- **`tool_choice?`**: `RealtimeRealtimeToolChoice` - Tool choice strategy for this response
- **`output_audio_format?`**: `RealtimeRealtimeAudioFormat` - Audio format for this response

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

### Session Events

#### `init` / `session.updated`
- **Payload**: `RealtimeRealtimeResponseSessionUpdatedCommand`
- **Description**: Fired when the session is first initialized and ready, or when its configuration is updated.
- **Structure**:
```typescript
{
  type: 'session.updated';
  event_id: string | null;
  session: RealtimeRealtimeResponseSession;
}
```
- **Fields**:
  - **`type`**: `'session.updated'` - Event type identifier
  - **`event_id`**: `string | null` - Unique identifier for this event
  - **`session`**: `RealtimeRealtimeResponseSession` - Complete session configuration

#### `session.created`
- **Payload**: `RealtimeRealtimeResponseSessionCreatedCommand`
- **Description**: Fired when a new session is successfully created on the server.
- **Structure**:
```typescript
{
  type: 'session.created';
  event_id: string | null;
  session: RealtimeRealtimeResponseSession;
}
```
- **Fields**:
  - **`type`**: `'session.created'` - Event type identifier
  - **`event_id`**: `string | null` - Unique identifier for this event
  - **`session`**: `RealtimeRealtimeResponseSession` - Complete session configuration

### Response Events

#### `response.created`
- **Payload**: `RealtimeRealtimeResponseCreatedCommand`
- **Description**: Fired when the model begins processing a request to generate a response.
- **Structure**:
```typescript
{
  type: 'response.created';
  event_id: string | null;
  response: RealtimeRealtimeResponse;
}
```
- **Fields**:
  - **`type`**: `'response.created'` - Event type identifier
  - **`event_id`**: `string | null` - Unique identifier for this event
  - **`response`**: `RealtimeRealtimeResponse` - Response object with metadata and usage information

#### `response.done`
- **Payload**: `RealtimeRealtimeResponseDoneCommand`
- **Description**: Fired when the model has fully completed its response turn.
- **Structure**:
```typescript
{
  type: 'response.done';
  event_id: string | null;
  response: RealtimeRealtimeResponse;
}
```
- **Fields**:
  - **`type`**: `'response.done'` - Event type identifier
  - **`event_id`**: `string | null` - Unique identifier for this event
  - **`response`**: `RealtimeRealtimeResponse` - Complete response object with final status and usage

### Audio Events

#### `response.audio.delta`
- **Payload**: `RealtimeRealtimeResponseAudioDeltaCommand`
- **Description**: Contains a chunk of the synthesized audio from the model.
- **Structure**:
```typescript
{
  type: 'response.audio.delta';
  event_id: string | null;
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  delta: string;
}
```
- **Fields**:
  - **`type`**: `'response.audio.delta'` - Event type identifier
  - **`event_id`**: `string | null` - Unique identifier for this event
  - **`response_id`**: `string` - ID of the response this audio belongs to
  - **`item_id`**: `string` - ID of the conversation item
  - **`output_index`**: `number` - Index of the output item in the response
  - **`content_index`**: `number` - Index of the content part within the item
  - **`delta`**: `string` - Base64-encoded audio data chunk

#### `response.audio.done`
- **Payload**: `RealtimeRealtimeResponseAudioDoneCommand`
- **Description**: Signals the end of the audio stream for a content part.
- **Structure**:
```typescript
{
  type: 'response.audio.done';
  event_id: string | null;
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
}
```
- **Fields**:
  - **`type`**: `'response.audio.done'` - Event type identifier
  - **`event_id`**: `string | null` - Unique identifier for this event
  - **`response_id`**: `string` - ID of the response this audio belongs to
  - **`item_id`**: `string` - ID of the conversation item
  - **`output_index`**: `number` - Index of the output item in the response
  - **`content_index`**: `number` - Index of the content part within the item

#### `response.audio_transcript.delta`
- **Payload**: `RealtimeRealtimeResponseAudioTranscriptDeltaCommand`
- **Description**: Contains a chunk of the live transcript of the model's speech.
- **Structure**:
```typescript
{
  type: 'response.audio_transcript.delta';
  event_id: string | null;
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  delta: string;
}
```
- **Fields**:
  - **`type`**: `'response.audio_transcript.delta'` - Event type identifier
  - **`event_id`**: `string | null` - Unique identifier for this event
  - **`response_id`**: `string` - ID of the response this transcript belongs to
  - **`item_id`**: `string` - ID of the conversation item
  - **`output_index`**: `number` - Index of the output item in the response
  - **`content_index`**: `number` - Index of the content part within the item
  - **`delta`**: `string` - Partial transcript text

#### `response.audio_transcript.done`
- **Payload**: `RealtimeRealtimeResponseAudioTranscriptDoneCommand`
- **Description**: Signals the final, complete transcript of the model's speech.
- **Structure**:
```typescript
{
  type: 'response.audio_transcript.done';
  event_id: string | null;
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  transcript: string;
}
```
- **Fields**:
  - **`type`**: `'response.audio_transcript.done'` - Event type identifier
  - **`event_id`**: `string | null` - Unique identifier for this event
  - **`response_id`**: `string` - ID of the response this transcript belongs to
  - **`item_id`**: `string` - ID of the conversation item
  - **`output_index`**: `number` - Index of the output item in the response
  - **`content_index`**: `number` - Index of the content part within the item
  - **`transcript`**: `string` - Complete transcript text

### Text Events

#### `response.text.delta`
- **Payload**: `RealtimeRealtimeResponseTextDeltaCommand`
- **Description**: Contains a chunk of the model's text response.
- **Structure**:
```typescript
{
  type: 'response.text.delta';
  event_id: string | null;
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  delta: string;
}
```
- **Fields**:
  - **`type`**: `'response.text.delta'` - Event type identifier
  - **`event_id`**: `string | null` - Unique identifier for this event
  - **`response_id`**: `string` - ID of the response this text belongs to
  - **`item_id`**: `string` - ID of the conversation item
  - **`output_index`**: `number` - Index of the output item in the response
  - **`content_index`**: `number` - Index of the content part within the item
  - **`delta`**: `string` - Partial text content

#### `response.text.done`
- **Payload**: `RealtimeRealtimeResponseTextDoneCommand`
- **Description**: Signals the final, complete text response from the model.
- **Structure**:
```typescript
{
  type: 'response.text.done';
  event_id: string | null;
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  value: string;
}
```
- **Fields**:
  - **`type`**: `'response.text.done'` - Event type identifier
  - **`event_id`**: `string | null` - Unique identifier for this event
  - **`response_id`**: `string` - ID of the response this text belongs to
  - **`item_id`**: `string` - ID of the conversation item
  - **`output_index`**: `number` - Index of the output item in the response
  - **`content_index`**: `number` - Index of the content part within the item
  - **`value`**: `string` - Complete text content

### Function Call Events

#### `response.function_call_arguments.delta`
- **Payload**: `RealtimeRealtimeResponseFunctionCallArgumentsDeltaCommand`
- **Description**: Contains a chunk of the arguments for a tool function call.
- **Structure**:
```typescript
{
  type: 'response.function_call_arguments.delta';
  event_id: string | null;
  response_id: string;
  item_id: string;
  output_index: number;
  call_id: string;
  delta: string;
}
```
- **Fields**:
  - **`type`**: `'response.function_call_arguments.delta'` - Event type identifier
  - **`event_id`**: `string | null` - Unique identifier for this event
  - **`response_id`**: `string` - ID of the response this function call belongs to
  - **`item_id`**: `string` - ID of the conversation item
  - **`output_index`**: `number` - Index of the output item in the response
  - **`call_id`**: `string` - Unique identifier for this function call
  - **`delta`**: `string` - Partial function arguments JSON

#### `response.function_call_arguments.done`
- **Payload**: `RealtimeRealtimeResponseFunctionCallArgumentsDoneCommand`
- **Description**: Signals the complete arguments for a tool function call.
- **Structure**:
```typescript
{
  type: 'response.function_call_arguments.done';
  event_id: string | null;
  response_id: string;
  item_id: string;
  output_index: number;
  call_id: string;
  name: string;
  arguments: string;
}
```
- **Fields**:
  - **`type`**: `'response.function_call_arguments.done'` - Event type identifier
  - **`event_id`**: `string | null` - Unique identifier for this event
  - **`response_id`**: `string` - ID of the response this function call belongs to
  - **`item_id`**: `string` - ID of the conversation item
  - **`output_index`**: `number` - Index of the output item in the response
  - **`call_id`**: `string` - Unique identifier for this function call
  - **`name`**: `string` - Name of the function being called
  - **`arguments`**: `string` - Complete function arguments as JSON string

### Input Audio Buffer Events

#### `input_audio_buffer.speech_started`
- **Payload**: `RealtimeRealtimeResponseInputAudioBufferSpeechStartedCommand`
- **Description**: Fired when the server's VAD detects the start of user speech.
- **Structure**:
```typescript
{
  type: 'input_audio_buffer.speech_started';
  event_id: string | null;
  audio_start_ms: number;
  item_id: string;
}
```
- **Fields**:
  - **`type`**: `'input_audio_buffer.speech_started'` - Event type identifier
  - **`event_id`**: `string | null` - Unique identifier for this event
  - **`audio_start_ms`**: `number` - Timestamp when speech started (milliseconds)
  - **`item_id`**: `string` - ID of the conversation item

#### `input_audio_buffer.speech_stopped`
- **Payload**: `RealtimeRealtimeResponseInputAudioBufferSpeechStoppedCommand`
- **Description**: Fired when the server's VAD detects the end of user speech.
- **Structure**:
```typescript
{
  type: 'input_audio_buffer.speech_stopped';
  event_id: string | null;
  audio_end_ms: number;
  item_id: string;
}
```
- **Fields**:
  - **`type`**: `'input_audio_buffer.speech_stopped'` - Event type identifier
  - **`event_id`**: `string | null` - Unique identifier for this event
  - **`audio_end_ms`**: `number` - Timestamp when speech ended (milliseconds)
  - **`item_id`**: `string` - ID of the conversation item

#### `input_audio_buffer.committed`
- **Payload**: `RealtimeRealtimeResponseInputAudioBufferCommittedCommand`
- **Description**: Fired when the audio buffer is committed.
- **Structure**:
```typescript
{
  type: 'input_audio_buffer.committed';
  event_id: string | null;
  item_id: string;
  previous_item_id?: string;
}
```
- **Fields**:
  - **`type`**: `'input_audio_buffer.committed'` - Event type identifier
  - **`event_id`**: `string | null` - Unique identifier for this event
  - **`item_id`**: `string` - ID of the conversation item created from the audio
  - **`previous_item_id?`**: `string` - ID of the previous conversation item (optional)

#### `input_audio_buffer.cleared`
- **Payload**: `RealtimeRealtimeResponseInputAudioBufferClearedCommand`
- **Description**: Fired when the audio buffer is cleared.
- **Structure**:
```typescript
{
  type: 'input_audio_buffer.cleared';
  event_id: string | null;
}
```
- **Fields**:
  - **`type`**: `'input_audio_buffer.cleared'` - Event type identifier
  - **`event_id`**: `string | null` - Unique identifier for this event

### Conversation Item Events

#### `conversation.item.created`
- **Payload**: `RealtimeRealtimeResponseItemCreatedCommand`
- **Description**: Fired when a conversation item is created.
- **Structure**:
```typescript
{
  type: 'conversation.item.created';
  event_id: string | null;
  item: RealtimeRealtimeResponseItem;
}
```
- **Fields**:
  - **`type`**: `'conversation.item.created'` - Event type identifier
  - **`event_id`**: `string | null` - Unique identifier for this event
  - **`item`**: `RealtimeRealtimeResponseItem` - The created conversation item

#### `conversation.item.deleted`
- **Payload**: `RealtimeRealtimeResponseItemDeletedCommand`
- **Description**: Fired when a conversation item is deleted.
- **Structure**:
```typescript
{
  type: 'conversation.item.deleted';
  event_id: string | null;
  item_id: string;
}
```
- **Fields**:
  - **`type`**: `'conversation.item.deleted'` - Event type identifier
  - **`event_id`**: `string | null` - Unique identifier for this event
  - **`item_id`**: `string` - ID of the deleted conversation item

#### `conversation.item.truncated`
- **Payload**: `RealtimeRealtimeResponseItemTruncatedCommand`
- **Description**: Fired when a conversation item is truncated.
- **Structure**:
```typescript
{
  type: 'conversation.item.truncated';
  event_id: string | null;
  item_id: string;
  audio_end_ms: number;
  index: number;
}
```
- **Fields**:
  - **`type`**: `'conversation.item.truncated'` - Event type identifier
  - **`event_id`**: `string | null` - Unique identifier for this event
  - **`item_id`**: `string` - ID of the truncated conversation item
  - **`audio_end_ms`**: `number` - Audio end timestamp in milliseconds
  - **`index`**: `number` - Index where the truncation occurred

#### `conversation.item.input_audio_transcription.completed`
- **Payload**: `RealtimeRealtimeResponseItemInputAudioTranscriptionCompletedCommand`
- **Description**: Fired when audio input transcription is completed.
- **Structure**:
```typescript
{
  type: 'conversation.item.input_audio_transcription.completed';
  event_id: string | null;
  item_id: string;
  content_index: number;
  transcript: string;
}
```
- **Fields**:
  - **`type`**: `'conversation.item.input_audio_transcription.completed'` - Event type identifier
  - **`event_id`**: `string | null` - Unique identifier for this event
  - **`item_id`**: `string` - ID of the conversation item
  - **`content_index`**: `number` - Index of the content part that was transcribed
  - **`transcript`**: `string` - The completed transcription text

#### `conversation.item.input_audio_transcription.failed`
- **Payload**: `RealtimeRealtimeResponseItemInputAudioTranscriptionFailedCommand`
- **Description**: Fired when audio input transcription fails.
- **Structure**:
```typescript
{
  type: 'conversation.item.input_audio_transcription.failed';
  event_id: string | null;
  item_id: string;
  content_index: number;
  error: RealtimeRealtimeResponseApiError;
}
```
- **Fields**:
  - **`type`**: `'conversation.item.input_audio_transcription.failed'` - Event type identifier
  - **`event_id`**: `string | null` - Unique identifier for this event
  - **`item_id`**: `string` - ID of the conversation item
  - **`content_index`**: `number` - Index of the content part that failed transcription
  - **`error`**: `RealtimeRealtimeResponseApiError` - Error details for the transcription failure

### Content Part Events

#### `response.content_part.added`
- **Payload**: `RealtimeRealtimeResponseContentPartAddedCommand`
- **Description**: Fired when a content part is added to the response.
- **Structure**:
```typescript
{
  type: 'response.content_part.added';
  event_id: string | null;
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  part: RealtimeRealtimeContentPart;
}
```
- **Fields**:
  - **`type`**: `'response.content_part.added'` - Event type identifier
  - **`event_id`**: `string | null` - Unique identifier for this event
  - **`response_id`**: `string` - ID of the response
  - **`item_id`**: `string` - ID of the conversation item
  - **`output_index`**: `number` - Index of the output item in the response
  - **`content_index`**: `number` - Index of the content part within the item
  - **`part`**: `RealtimeRealtimeContentPart` - The content part that was added

#### `response.content_part.done`
- **Payload**: `RealtimeRealtimeResponseContentPartDoneCommand`
- **Description**: Fired when a content part is completed.
- **Structure**:
```typescript
{
  type: 'response.content_part.done';
  event_id: string | null;
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  part: RealtimeRealtimeContentPart;
}
```
- **Fields**:
  - **`type`**: `'response.content_part.done'` - Event type identifier
  - **`event_id`**: `string | null` - Unique identifier for this event
  - **`response_id`**: `string` - ID of the response
  - **`item_id`**: `string` - ID of the conversation item
  - **`output_index`**: `number` - Index of the output item in the response
  - **`content_index`**: `number` - Index of the content part within the item
  - **`part`**: `RealtimeRealtimeContentPart` - The completed content part

### Output Item Events

#### `response.output_item.added`
- **Payload**: `RealtimeRealtimeResponseOutputItemAddedCommand`
- **Description**: Fired when an output item is added to the response.
- **Structure**:
```typescript
{
  type: 'response.output_item.added';
  event_id: string | null;
  response_id: string;
  output_index: number;
  item: RealtimeRealtimeResponseItem;
}
```
- **Fields**:
  - **`type`**: `'response.output_item.added'` - Event type identifier
  - **`event_id`**: `string | null` - Unique identifier for this event
  - **`response_id`**: `string` - ID of the response
  - **`output_index`**: `number` - Index of the output item in the response
  - **`item`**: `RealtimeRealtimeResponseItem` - The output item that was added

#### `response.output_item.done`
- **Payload**: `RealtimeRealtimeResponseOutputItemDoneCommand`
- **Description**: Fired when an output item is completed.
- **Structure**:
```typescript
{
  type: 'response.output_item.done';
  event_id: string | null;
  response_id: string;
  output_index: number;
  item: RealtimeRealtimeResponseItem;
}
```
- **Fields**:
  - **`type`**: `'response.output_item.done'` - Event type identifier
  - **`event_id`**: `string | null` - Unique identifier for this event
  - **`response_id`**: `string` - ID of the response
  - **`output_index`**: `number` - Index of the output item in the response
  - **`item`**: `RealtimeRealtimeResponseItem` - The completed output item

### Rate Limits Events

#### `rate_limits.updated`
- **Payload**: `RealtimeRealtimeResponseRateLimitsUpdatedCommand`
- **Description**: Fired when rate limit information is updated.
- **Structure**:
```typescript
{
  type: 'rate_limits.updated';
  event_id: string | null;
  rate_limits: RealtimeRealtimeResponseRateLimitDetailsItem[];
}
```
- **Fields**:
  - **`type`**: `'rate_limits.updated'` - Event type identifier
  - **`event_id`**: `string | null` - Unique identifier for this event
  - **`rate_limits`**: `RealtimeRealtimeResponseRateLimitDetailsItem[]` - Array of rate limit details for different resources

### Error Events

#### `error`
- **Payload**: `RealtimeRealtimeResponseErrorCommand`
- **Description**: Fired when an error occurs.
- **Structure**:
```typescript
{
  type: 'error';
  event_id: string | null;
  error: RealtimeRealtimeResponseError;
}
```
- **Fields**:
  - **`type`**: `'error'` - Event type identifier
  - **`event_id`**: `string | null` - Unique identifier for this event
  - **`error`**: `RealtimeRealtimeResponseError` - Error details object

---

## Additional Data Structures

### RealtimeRealtimeResponseSession
Complete session configuration returned in session events.

```typescript
interface RealtimeRealtimeResponseSession {
  object: 'realtime.session';
  id: string;
  model: string;
  modalities: ('text' | 'audio')[];
  instructions: string;
  voice: RealtimeRealtimeVoice;
  input_audio_format: RealtimeRealtimeAudioFormat;
  output_audio_format: RealtimeRealtimeAudioFormat;
  input_audio_transcription: RealtimeRealtimeAudioInputTranscriptionSettings | null;
  turn_detection: RealtimeRealtimeTurnDetection;
  tools: RealtimeRealtimeTool[];
  tool_choice: RealtimeRealtimeToolChoice;
  temperature: number;
  max_response_output_tokens: number | null;
}
```

#### Fields
- **`object`**: `'realtime.session'` - Object type identifier
- **`id`**: `string` - Unique session identifier
- **`model`**: `string` - Model being used for the session
- **`modalities`**: `('text' | 'audio')[]` - Enabled modalities for the session
- **`instructions`**: `string` - System instructions for the AI model
- **`voice`**: `RealtimeRealtimeVoice` - Voice used for audio generation
- **`input_audio_format`**: `RealtimeRealtimeAudioFormat` - Format for input audio
- **`output_audio_format`**: `RealtimeRealtimeAudioFormat` - Format for output audio
- **`input_audio_transcription`**: `RealtimeRealtimeAudioInputTranscriptionSettings | null` - Transcription settings
- **`turn_detection`**: `RealtimeRealtimeTurnDetection` - Turn detection configuration
- **`tools`**: `RealtimeRealtimeTool[]` - Available tools/functions
- **`tool_choice`**: `RealtimeRealtimeToolChoice` - Tool selection strategy
- **`temperature`**: `number` - Sampling temperature
- **`max_response_output_tokens`**: `number | null` - Maximum output tokens

### RealtimeRealtimeResponse
Complete response object containing metadata and usage information.

```typescript
interface RealtimeRealtimeResponse {
  object: 'realtime.response';
  id: string;
  status: RealtimeRealtimeResponseStatus;
  status_details: RealtimeRealtimeResponseStatusDetails | null;
  output: RealtimeRealtimeResponseItem[];
  usage: {
    total_tokens: number;
    input_tokens: number;
    output_tokens: number;
    input_token_details: {
      cached_tokens: number;
      text_tokens: number;
      audio_tokens: number;
    };
    output_token_details: {
      text_tokens: number;
      audio_tokens: number;
    };
  };
}
```

#### Fields
- **`object`**: `'realtime.response'` - Object type identifier
- **`id`**: `string` - Unique response identifier
- **`status`**: `RealtimeRealtimeResponseStatus` - Response status ('in_progress' | 'completed' | 'cancelled' | 'incomplete' | 'failed')
- **`status_details`**: `RealtimeRealtimeResponseStatusDetails | null` - Additional status information
- **`output`**: `RealtimeRealtimeResponseItem[]` - Array of output items
- **`usage`**: `object` - Token usage information
  - **`total_tokens`**: `number` - Total tokens used
  - **`input_tokens`**: `number` - Input tokens consumed
  - **`output_tokens`**: `number` - Output tokens generated
  - **`input_token_details`**: `object` - Breakdown of input tokens
    - **`cached_tokens`**: `number` - Tokens retrieved from cache
    - **`text_tokens`**: `number` - Text input tokens
    - **`audio_tokens`**: `number` - Audio input tokens
  - **`output_token_details`**: `object` - Breakdown of output tokens
    - **`text_tokens`**: `number` - Text output tokens
    - **`audio_tokens`**: `number` - Audio output tokens

### RealtimeRealtimeResponseError
Error information object.

```typescript
interface RealtimeRealtimeResponseError {
  type: string;
  code?: string;
  message: string;
  param?: string;
  event_id?: string;
}
```

#### Fields
- **`type`**: `string` - Error type identifier
- **`code?`**: `string` - Optional error code
- **`message`**: `string` - Human-readable error message
- **`param?`**: `string` - Parameter that caused the error (if applicable)
- **`event_id?`**: `string` - Event ID where the error occurred (if applicable)

### RealtimeRealtimeResponseApiError
API-specific error information.

```typescript
interface RealtimeRealtimeResponseApiError {
  type: string;
  code?: string;
  message: string;
  param?: string;
}
```

#### Fields
- **`type`**: `string` - Error type identifier
- **`code?`**: `string` - Optional API error code
- **`message`**: `string` - Human-readable error message
- **`param?`**: `string` - Parameter that caused the error (if applicable)

### RealtimeRealtimeResponseItem
Base response item structure.

```typescript
interface RealtimeRealtimeResponseItem {
  object: 'realtime.item';
  type: RealtimeRealtimeItemType;
  id: string | null;
}
```

#### Fields
- **`object`**: `'realtime.item'` - Object type identifier
- **`type`**: `RealtimeRealtimeItemType` - Item type ('message' | 'function_call' | 'function_call_output')
- **`id`**: `string | null` - Unique item identifier

### RealtimeRealtimeResponseRateLimitDetailsItem
Rate limit information for a specific resource.

```typescript
interface RealtimeRealtimeResponseRateLimitDetailsItem {
  name: string;
  limit: number;
  remaining: number;
  reset_seconds: number;
}
```

#### Fields
- **`name`**: `string` - Name of the rate-limited resource
- **`limit`**: `number` - Maximum allowed requests/tokens
- **`remaining`**: `number` - Remaining requests/tokens in current window
- **`reset_seconds`**: `number` - Seconds until the rate limit resets

### RealtimeRealtimeContentPart
Base content part structure.

```typescript
interface RealtimeRealtimeContentPart {
  type: RealtimeRealtimeContentPartType;
}
```

#### Fields
- **`type`**: `RealtimeRealtimeContentPartType` - Content type ('input_text' | 'input_audio' | 'text' | 'audio')

---
sidebar_position: 3
---
# API 参考

本文档为 Azure Realtime Audio SDK 中使用的所有类、方法、枚举和数据类型提供了全面的参考。

## `AzureRealTimeAudio` 类

用于与 Azure OpenAI Realtime API 交互的主类。

### 构造函数

```typescript
new AzureRealTimeAudio(options, websocketOptions?, WebSocketImpl?)
```

- **`options`**: `AzureRealTimeAudioOptions` - 客户端配置。
  - `hostName`: 您的 Azure OpenAI 服务域名。
  - `apiVersion`: API 版本。
  - `deployment`: 模型部署名称。
  - `apiKey`: 您的 API 密钥。
  - `sessionConfig?`: 可选的会话配置。详见 [会话配置](#会话配置)。
- **`websocketOptions?`**: `WebSocketClientOptions` - 底层 WebSocket 客户端的可选配置。
- **`WebSocketImpl?`**: `typeof WebSocket` - 可选的自定义 WebSocket 实现，在 Node.js 环境中需要。

### 方法

#### 事件处理
- `on(event, listener)`: 为特定事件注册一个监听器。
- `once(event, listener)`: 为一个事件注册一次性监听器。
- `off(event, listener?)`: 移除特定事件的指定监听器或所有监听器。
- `offAll()`: 移除所有事件的所有监听器。

#### 音频操作
- `appendAudio(base64Audio: string)`: 发送一个 base64 编码的音频块。
- `commitAudio()`: 提交缓冲的音频，表示用户语音结束。
- `clearAudioBuffer()`: 清除服务器上的音频缓冲区。

#### 对话管理
- `createConversationItem(item: RealtimeRealtimeRequestItem, previousItemId?: string)`: 向对话历史中添加一个项目。关于 `item` 的结构，请参见 [对话项目](#对话项目)。
- `deleteItem(itemId: string)`: 从对话历史中删除一个项目。
- `truncateItem(itemId: string, contentIndex: number, audioEndMs: number)`: 截断一个对话项目。
- `createResponse(responseConfig?: RealtimeRealtimeRequestResponseCreateCommand['response'])`: 请求模型生成响应。详见 [响应配置](#响应配置)。
- `cancelResponse()`: 取消一个正在进行的模型响应。

#### 状态管理
- `status`: (Getter) 返回当前的 `ModelStatusEnum`。
- `status = newStatus`: (Setter) 设置模型状态。
- `setModelSpeakDone()`: 一个辅助方法，在模型说完话后将状态设置为 `IDLE`。
- `isInitialized`: (Getter) 如果会话已初始化，则返回 `true`。
- `state`: (Getter) 返回底层 WebSocket 的连接状态。

---

## 枚举和类型别名

### ModelStatusEnum
表示 AI 模型的状态。

| 值 | 描述 |
|---|---|
| `IDLE` | 模型处于空闲状态，等待输入。 |
| `LISTENING` | 模型正在积极聆听用户音频。 |
| `THINKING` | 模型正在处理输入并生成响应。 |
| `SPEAKING` | 模型正在输出音频/文本。 |

### RealtimeRealtimeAudioFormat
指定输入和输出的音频格式。

| 值 | 描述 |
|---|---|
| `pcm16` | 16-bit PCM 音频。 |
| `g711_ulaw` | G.711 μ-law 音频编解码器。 |
| `g711_alaw` | G.711 A-law 音频编解码器。 |

### RealtimeRealtimeVoice
指定文本转语音输出的声音。

| 值 | 描述 |
|---|---|
| `alloy` | Alloy 声音。 |
| `shimmer` | Shimmer 声音。 |
| `echo` | Echo 声音。 |

### 其他类型别名

| 类型 | 描述 | 可能的值 |
|---|---|---|
| `RealtimeRealtimeItemStatus` | 对话项目的状态。 | `in_progress`, `completed`, `incomplete` |
| `RealtimeRealtimeItemType` | 对话项目的类型。 | `message`, `function_call`, `function_call_output` |
| `RealtimeRealtimeMessageRole` | 消息作者的角色。 | `system`, `user`, `assistant` |
| `RealtimeRealtimeResponseStatus` | 模型响应的最终状态。 | `in_progress`, `completed`, `cancelled`, `incomplete`, `failed` |
| `RealtimeRealtimeToolType` | 工具的类型。 | `function` |

---

## 数据结构

### 会话配置
传递给构造函数的 `sessionConfig` 对象。

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

### 响应配置
用于 `createResponse` 方法的 `responseConfig` 对象。

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

### 对话项目
用于 `createConversationItem` 和 `append_input_items`。

#### 消息项
```typescript
interface MessageItem {
  type: 'message';
  role: RealtimeRealtimeMessageRole; // 'system', 'user', 或 'assistant'
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

#### 函数调用项
```typescript
interface FunctionCallItem {
  type: 'function_call';
  call_id: string;
  name: string;
  arguments: string;
}
```

#### 函数调用输出项
```typescript
interface FunctionCallOutputItem {
  type: 'function_call_output';
  call_id: string;
  output: string;
}
```

### 工具和工具选择

#### 函数工具
```typescript
interface FunctionTool {
  type: 'function';
  name: string;
  description?: string;
  parameters?: object; // JSON Schema 对象
}
```

#### 工具选择
```typescript
// 可以是字符串字面量或对象
type ToolChoice = 'auto' | 'none' | 'required' | ToolChoiceObject;

interface ToolChoiceObject {
  type: 'function';
  function: {
    name: string;
  };
}
```

---

## 事件负载

本节详细说明了每个事件的监听器接收到的数据结构。

#### `init` / `session.updated`
- **负载**: `RealtimeRealtimeResponseSessionUpdatedCommand`
- **描述**: 当会话首次初始化并准备就绪，或其配置更新时触发。
- **结构**: `{ type: 'session.updated', session: RealtimeRealtimeResponseSession }`

#### `session.created`
- **负载**: `RealtimeRealtimeResponseSessionCreatedCommand`
- **描述**: 当服务器上成功创建新会话时触发。
- **结构**: `{ type: 'session.created', session: RealtimeRealtimeResponseSession }`

#### `response.audio.delta`
- **负载**: `RealtimeRealtimeResponseAudioDeltaCommand`
- **描述**: 包含来自模型的合成音频数据块。
- **结构**: `{ type: 'response.audio.delta', delta: string }` (base64 编码)

#### `response.audio.done`
- **负载**: `RealtimeRealtimeResponseAudioDoneCommand`
- **描述**: 表示某个内容部分的音频流结束。
- **结构**: `{ type: 'response.audio.done', ... }`

#### `response.audio_transcript.delta`
- **负载**: `RealtimeRealtimeResponseAudioTranscriptDeltaCommand`
- **描述**: 包含模型语音的实时转录文本块。
- **结构**: `{ type: 'response.audio_transcript.delta', delta: string }`

#### `response.audio_transcript.done`
- **负载**: `RealtimeRealtimeResponseAudioTranscriptDoneCommand`
- **描述**: 表示模型语音的最终完整转录。
- **结构**: `{ type: 'response.audio_transcript.done', transcript: string }`

#### `response.text.delta`
- **负载**: `RealtimeRealtimeResponseTextDeltaCommand`
- **描述**: 包含模型的文本响应块。
- **结构**: `{ type: 'response.text.delta', delta: string }`

#### `response.text.done`
- **负载**: `RealtimeRealtimeResponseTextDoneCommand`
- **描述**: 表示模型的最终完整文本响应。
- **结构**: `{ type: 'response.text.done', value: string }`

#### `response.created`
- **负载**: `RealtimeRealtimeResponseCreatedCommand`
- **描述**: 当模型开始处理生成响应的请求时触发。
- **结构**: `{ type: 'response.created', response: RealtimeRealtimeResponse }`

#### `response.done`
- **负载**: `RealtimeRealtimeResponseDoneCommand`
- **描述**: 当模型完全完成其响应回合时触发。
- **结构**: `{ type: 'response.done', response: RealtimeRealtimeResponse }`

#### `input_audio_buffer.speech_started`
- **负载**: `RealtimeRealtimeResponseInputAudioBufferSpeechStartedCommand`
- **描述**: 当服务器的 VAD 检测到用户开始说话时触发。
- **结构**: `{ type: 'input_audio_buffer.speech_started', item_id: string, audio_start_ms: number }`

#### `input_audio_buffer.speech_stopped`
- **负载**: `RealtimeRealtimeResponseInputAudioBufferSpeechStoppedCommand`
- **描述**: 当服务器的 VAD 检测到用户停止说话时触发。
- **结构**: `{ type: 'input_audio_buffer.speech_stopped', item_id: string, audio_end_ms: number }`

#### `response.function_call_arguments.delta`
- **负载**: `RealtimeRealtimeResponseFunctionCallArgumentsDeltaCommand`
- **描述**: 包含工具函数调用的参数块。
- **结构**: `{ type: '...', call_id: string, delta: string }`

#### `response.function_call_arguments.done`
- **负载**: `RealtimeRealtimeResponseFunctionCallArgumentsDoneCommand`
- **描述**: 表示工具函数调用的参数流已结束。
- **结构**: `{ type: '...', call_id: string, name: string, arguments: string }`

#### `error`
- **负载**: `RealtimeRealtimeResponseErrorCommand`
- **描述**: 当发生错误时触发。
- **结构**: `{ type: 'error', error: { message: string, code?: string, param?: string } }`

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

- **`options`**: `AzureRealTimeAudioOptions` - 客户端配置。详见 [AzureRealTimeAudioOptions](#azurerealtimeaudiooptions)。
- **`websocketOptions?`**: `WebSocketClientOptions` - 底层 WebSocket 客户端的可选配置。详见 [WebSocketClientOptions](#websocketclientoptions)。
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

### RealtimeRealtimeAudioInputTranscriptionModel
指定音频输入转录的模型。

| 值 | 描述 |
|---|---|
| `whisper-1` | OpenAI Whisper v1 语音转文本模型。 |

### RealtimeRealtimeContentPartType
指定内容部分的类型。

| 值 | 描述 |
|---|---|
| `input_text` | 作为输入提供的文本内容。 |
| `input_audio` | 作为输入提供的音频内容。 |
| `text` | 响应中的文本内容。 |
| `audio` | 响应中的音频内容。 |

### RealtimeRealtimeToolChoiceLiteral
工具选择的字符串字面量选项。

| 值 | 描述 |
|---|---|
| `auto` | 自动选择是否使用工具。 |
| `none` | 不使用任何工具。 |
| `required` | 必须使用工具。 |

### RealtimeRealtimeTurnDetectionType
指定轮次检测的类型。

| 值 | 描述 |
|---|---|
| `server_vad` | 服务器端语音活动检测。 |

### 其他类型别名

| 类型 | 描述 | 可能的值 |
|---|---|---|
| `RealtimeRealtimeItemStatus` | 对话项目的状态。 | `in_progress`, `completed`, `incomplete` |
| `RealtimeRealtimeItemType` | 对话项目的类型。 | `message`, `function_call`, `function_call_output` |
| `RealtimeRealtimeMessageRole` | 消息作者的角色。 | `system`, `user`, `assistant` |
| `RealtimeRealtimeResponseStatus` | 模型响应的最终状态。 | `in_progress`, `completed`, `cancelled`, `incomplete`, `failed` |
| `RealtimeRealtimeToolType` | 工具的类型。 | `function` |
| `RealtimeRealtimeRequestModel` | 请求使用的模型。 | `gpt-4o-realtime` |

---

## 配置接口

### AzureRealTimeAudioOptions
用于初始化 Azure 实时音频 SDK 客户端的主配置接口。

```typescript
interface AzureRealTimeAudioOptions {
  hostName: string;
  apiVersion: string;
  deployment: string;
  apiKey: string;
  sessionConfig?: SessionConfig;
}
```

#### 字段
- **`hostName`**: `string` - Azure OpenAI 服务主机名（例如：'your-resource.openai.azure.com'）
- **`apiVersion`**: `string` - API 版本字符串（例如：'2024-10-01-preview'）
- **`deployment`**: `string` - 在 Azure OpenAI 中配置的模型部署名称
- **`apiKey`**: `string` - 用于 Azure OpenAI 服务认证的 API 密钥
- **`sessionConfig?`**: `SessionConfig` - 可选的会话配置以覆盖默认值。详见 [会话配置](#会话配置)。

### WebSocketClientOptions
底层 WebSocket 客户端连接的配置选项。

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

#### 字段
- **`reconnectInterval?`**: `number` - 重连尝试之间的时间间隔（毫秒）
- **`heartbeatInterval?`**: `number` - 心跳消息之间的时间间隔（毫秒）
- **`heartbeatMessage?`**: `any` - 作为心跳发送的自定义消息
- **`maxReconnectAttempts?`**: `number` - 放弃前的最大重连尝试次数
- **`shouldReconnect?`**: `boolean` - 是否在连接丢失时自动尝试重连
- **`protocols?`**: `string | string[]` - 要使用的 WebSocket 子协议
- **`showLog?`**: `boolean` - 是否在控制台显示连接日志
- **`connectResend?`**: `boolean` - 是否在重连时重发消息
- **`jsonAble?`**: `boolean` - 是否自动解析 JSON 消息

---

## 数据结构

### 会话配置
传递给构造函数的 `sessionConfig` 对象。

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

#### 字段
- **`model?`**: `RealtimeRealtimeRequestModel` - 用于实时对话的模型（默认：'gpt-4o-realtime'）
- **`modalities?`**: `('text' | 'audio')[]` - 模型应支持的模态列表（默认：['text', 'audio']）
- **`voice?`**: `RealtimeRealtimeVoice` - 用于音频生成的声音（'alloy' | 'shimmer' | 'echo'，默认：'alloy'）
- **`instructions?`**: `string` - AI 模型行为的系统指令
- **`input_audio_format?`**: `RealtimeRealtimeAudioFormat` - 输入音频数据格式（默认：'pcm16'）
- **`output_audio_format?`**: `RealtimeRealtimeAudioFormat` - 输出音频数据格式（默认：'pcm16'）
- **`input_audio_transcription?`**: `RealtimeRealtimeAudioInputTranscriptionSettings` - 输入音频转录设置。详见 [音频输入转录设置](#音频输入转录设置)。
- **`turn_detection?`**: `RealtimeRealtimeTurnDetection | RealtimeRealtimeServerVadTurnDetection` - 语音活动检测和轮次接管的配置。详见 [轮次检测](#轮次检测)。
- **`tools?`**: `RealtimeRealtimeTool[]` - 模型可用的工具/函数列表。详见 [工具和工具选择](#工具和工具选择)。
- **`tool_choice?`**: `RealtimeRealtimeToolChoice` - 模型应如何选择使用哪些工具（'auto' | 'none' | 'required' | 对象）
- **`temperature?`**: `number` - 响应生成的采样温度（0.0 到 1.0）
- **`max_response_output_tokens?`**: `number | 'inf'` - 模型响应的最大令牌数

### 音频输入转录设置
将输入音频转录为文本的设置。

```typescript
interface RealtimeRealtimeAudioInputTranscriptionSettings {
  model?: RealtimeRealtimeAudioInputTranscriptionModel; // 'whisper-1'
}
```

#### 字段
- **`model?`**: `RealtimeRealtimeAudioInputTranscriptionModel` - 用于转录输入音频的模型（默认：'whisper-1'）

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

#### 字段
- **`commit`**: `boolean` - 是否将生成的消息提交到对话中
- **`cancel_previous`**: `boolean` - 是否取消任何正在进行的响应生成
- **`append_input_items?`**: `RealtimeRealtimeRequestItem[]` - 在生成响应前要添加到对话中的项目
- **`input_items?`**: `RealtimeRealtimeRequestItem[]` - 对话上下文的完整输入项目列表
- **`instructions?`**: `string` - 此次响应生成的特定指令
- **`modalities?`**: `('text' | 'audio')[]` - 此次响应要使用的模态
- **`voice?`**: `RealtimeRealtimeVoice` - 此次响应中音频生成要使用的声音
- **`temperature?`**: `number` - 此次响应的采样温度（0.0 到 1.0）
- **`max_output_tokens?`**: `number | 'inf' | null` - 此次响应的最大令牌数
- **`tools?`**: `RealtimeRealtimeTool[]` - 此次响应可用的工具
- **`tool_choice?`**: `RealtimeRealtimeToolChoice` - 此次响应的工具选择策略
- **`output_audio_format?`**: `RealtimeRealtimeAudioFormat` - 此次响应的音频格式

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

### 会话事件

#### `init` / `session.updated`
- **负载**: `RealtimeRealtimeResponseSessionUpdatedCommand`
- **描述**: 当会话首次初始化并准备就绪，或其配置更新时触发。
- **结构**:
```typescript
{
  type: 'session.updated';
  event_id: string | null;
  session: RealtimeRealtimeResponseSession;
}
```
- **字段**:
  - **`type`**: `'session.updated'` - 事件类型标识符
  - **`event_id`**: `string | null` - 此事件的唯一标识符
  - **`session`**: `RealtimeRealtimeResponseSession` - 完整的会话配置

#### `session.created`
- **负载**: `RealtimeRealtimeResponseSessionCreatedCommand`
- **描述**: 当服务器上成功创建新会话时触发。
- **结构**:
```typescript
{
  type: 'session.created';
  event_id: string | null;
  session: RealtimeRealtimeResponseSession;
}
```
- **字段**:
  - **`type`**: `'session.created'` - 事件类型标识符
  - **`event_id`**: `string | null` - 此事件的唯一标识符
  - **`session`**: `RealtimeRealtimeResponseSession` - 完整的会话配置

### 响应事件

#### `response.created`
- **负载**: `RealtimeRealtimeResponseCreatedCommand`
- **描述**: 当模型开始处理生成响应的请求时触发。
- **结构**:
```typescript
{
  type: 'response.created';
  event_id: string | null;
  response: RealtimeRealtimeResponse;
}
```
- **字段**:
  - **`type`**: `'response.created'` - 事件类型标识符
  - **`event_id`**: `string | null` - 此事件的唯一标识符
  - **`response`**: `RealtimeRealtimeResponse` - 包含元数据和使用信息的响应对象

#### `response.done`
- **负载**: `RealtimeRealtimeResponseDoneCommand`
- **描述**: 当模型完全完成其响应回合时触发。
- **结构**:
```typescript
{
  type: 'response.done';
  event_id: string | null;
  response: RealtimeRealtimeResponse;
}
```
- **字段**:
  - **`type`**: `'response.done'` - 事件类型标识符
  - **`event_id`**: `string | null` - 此事件的唯一标识符
  - **`response`**: `RealtimeRealtimeResponse` - 包含最终状态和使用情况的完整响应对象

### 音频事件

#### `response.audio.delta`
- **负载**: `RealtimeRealtimeResponseAudioDeltaCommand`
- **描述**: 包含来自模型的合成音频数据块。
- **结构**:
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
- **字段**:
  - **`type`**: `'response.audio.delta'` - 事件类型标识符
  - **`event_id`**: `string | null` - 此事件的唯一标识符
  - **`response_id`**: `string` - 此音频所属的响应ID
  - **`item_id`**: `string` - 对话项目的ID
  - **`output_index`**: `number` - 响应中输出项目的索引
  - **`content_index`**: `number` - 项目内容部分的索引
  - **`delta`**: `string` - Base64编码的音频数据块

#### `response.audio.done`
- **负载**: `RealtimeRealtimeResponseAudioDoneCommand`
- **描述**: 表示某个内容部分的音频流结束。
- **结构**:
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
- **字段**:
  - **`type`**: `'response.audio.done'` - 事件类型标识符
  - **`event_id`**: `string | null` - 此事件的唯一标识符
  - **`response_id`**: `string` - 此音频所属的响应ID
  - **`item_id`**: `string` - 对话项目的ID
  - **`output_index`**: `number` - 响应中输出项目的索引
  - **`content_index`**: `number` - 项目内容部分的索引

#### `response.audio_transcript.delta`
- **负载**: `RealtimeRealtimeResponseAudioTranscriptDeltaCommand`
- **描述**: 包含模型语音的实时转录文本块。
- **结构**:
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
- **字段**:
  - **`type`**: `'response.audio_transcript.delta'` - 事件类型标识符
  - **`event_id`**: `string | null` - 此事件的唯一标识符
  - **`response_id`**: `string` - 此转录所属的响应ID
  - **`item_id`**: `string` - 对话项目的ID
  - **`output_index`**: `number` - 响应中输出项目的索引
  - **`content_index`**: `number` - 项目内容部分的索引
  - **`delta`**: `string` - 部分转录文本

#### `response.audio_transcript.done`
- **负载**: `RealtimeRealtimeResponseAudioTranscriptDoneCommand`
- **描述**: 表示模型语音的最终完整转录。
- **结构**:
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
- **字段**:
  - **`type`**: `'response.audio_transcript.done'` - 事件类型标识符
  - **`event_id`**: `string | null` - 此事件的唯一标识符
  - **`response_id`**: `string` - 此转录所属的响应ID
  - **`item_id`**: `string` - 对话项目的ID
  - **`output_index`**: `number` - 响应中输出项目的索引
  - **`content_index`**: `number` - 项目内容部分的索引
  - **`transcript`**: `string` - 完整转录文本

### 文本事件

#### `response.text.delta`
- **负载**: `RealtimeRealtimeResponseTextDeltaCommand`
- **描述**: 包含模型的文本响应块。
- **结构**:
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
- **字段**:
  - **`type`**: `'response.text.delta'` - 事件类型标识符
  - **`event_id`**: `string | null` - 此事件的唯一标识符
  - **`response_id`**: `string` - 此文本所属的响应ID
  - **`item_id`**: `string` - 对话项目的ID
  - **`output_index`**: `number` - 响应中输出项目的索引
  - **`content_index`**: `number` - 项目内容部分的索引
  - **`delta`**: `string` - 部分文本内容

#### `response.text.done`
- **负载**: `RealtimeRealtimeResponseTextDoneCommand`
- **描述**: 表示模型的最终完整文本响应。
- **结构**:
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
- **字段**:
  - **`type`**: `'response.text.done'` - 事件类型标识符
  - **`event_id`**: `string | null` - 此事件的唯一标识符
  - **`response_id`**: `string` - 此文本所属的响应ID
  - **`item_id`**: `string` - 对话项目的ID
  - **`output_index`**: `number` - 响应中输出项目的索引
  - **`content_index`**: `number` - 项目内容部分的索引
  - **`value`**: `string` - 完整文本内容

### 函数调用事件

#### `response.function_call_arguments.delta`
- **负载**: `RealtimeRealtimeResponseFunctionCallArgumentsDeltaCommand`
- **描述**: 包含工具函数调用的参数块。
- **结构**:
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
- **字段**:
  - **`type`**: `'response.function_call_arguments.delta'` - 事件类型标识符
  - **`event_id`**: `string | null` - 此事件的唯一标识符
  - **`response_id`**: `string` - 此函数调用所属的响应ID
  - **`item_id`**: `string` - 对话项目的ID
  - **`output_index`**: `number` - 响应中输出项目的索引
  - **`call_id`**: `string` - 此函数调用的唯一标识符
  - **`delta`**: `string` - 部分函数参数JSON

#### `response.function_call_arguments.done`
- **负载**: `RealtimeRealtimeResponseFunctionCallArgumentsDoneCommand`
- **描述**: 表示工具函数调用的参数流已结束。
- **结构**:
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
- **字段**:
  - **`type`**: `'response.function_call_arguments.done'` - 事件类型标识符
  - **`event_id`**: `string | null` - 此事件的唯一标识符
  - **`response_id`**: `string` - 此函数调用所属的响应ID
  - **`item_id`**: `string` - 对话项目的ID
  - **`output_index`**: `number` - 响应中输出项目的索引
  - **`call_id`**: `string` - 此函数调用的唯一标识符
  - **`name`**: `string` - 被调用函数的名称
  - **`arguments`**: `string` - 完整的函数参数JSON字符串

### 输入音频缓冲区事件

#### `input_audio_buffer.speech_started`
- **负载**: `RealtimeRealtimeResponseInputAudioBufferSpeechStartedCommand`
- **描述**: 当服务器的VAD检测到用户开始说话时触发。
- **结构**:
```typescript
{
  type: 'input_audio_buffer.speech_started';
  event_id: string | null;
  audio_start_ms: number;
  item_id: string;
}
```
- **字段**:
  - **`type`**: `'input_audio_buffer.speech_started'` - 事件类型标识符
  - **`event_id`**: `string | null` - 此事件的唯一标识符
  - **`audio_start_ms`**: `number` - 语音开始的时间戳（毫秒）
  - **`item_id`**: `string` - 对话项目的ID

#### `input_audio_buffer.speech_stopped`
- **负载**: `RealtimeRealtimeResponseInputAudioBufferSpeechStoppedCommand`
- **描述**: 当服务器的VAD检测到用户停止说话时触发。
- **结构**:
```typescript
{
  type: 'input_audio_buffer.speech_stopped';
  event_id: string | null;
  audio_end_ms: number;
  item_id: string;
}
```
- **字段**:
  - **`type`**: `'input_audio_buffer.speech_stopped'` - 事件类型标识符
  - **`event_id`**: `string | null` - 此事件的唯一标识符
  - **`audio_end_ms`**: `number` - 语音结束的时间戳（毫秒）
  - **`item_id`**: `string` - 对话项目的ID

#### `input_audio_buffer.committed`
- **负载**: `RealtimeRealtimeResponseInputAudioBufferCommittedCommand`
- **描述**: 音频缓冲区已提交时触发。
- **结构**:
```typescript
{
  type: 'input_audio_buffer.committed';
  event_id: string | null;
  item_id: string;
  previous_item_id?: string;
}
```
- **字段**:
  - **`type`**: `'input_audio_buffer.committed'` - 事件类型标识符
  - **`event_id`**: `string | null` - 此事件的唯一标识符
  - **`item_id`**: `string` - 从音频创建的对话项目ID
  - **`previous_item_id?`**: `string` - 前一个对话项目的ID（可选）

#### `input_audio_buffer.cleared`
- **负载**: `RealtimeRealtimeResponseInputAudioBufferClearedCommand`
- **描述**: 音频缓冲区已清空时触发。
- **结构**:
```typescript
{
  type: 'input_audio_buffer.cleared';
  event_id: string | null;
}
```
- **字段**:
  - **`type`**: `'input_audio_buffer.cleared'` - 事件类型标识符
  - **`event_id`**: `string | null` - 此事件的唯一标识符

### 对话项目事件

#### `conversation.item.created`
- **负载**: `RealtimeRealtimeResponseItemCreatedCommand`
- **描述**: 当创建对话项目时触发。
- **结构**:
```typescript
{
  type: 'conversation.item.created';
  event_id: string | null;
  item: RealtimeRealtimeResponseItem;
}
```
- **字段**:
  - **`type`**: `'conversation.item.created'` - 事件类型标识符
  - **`event_id`**: `string | null` - 此事件的唯一标识符
  - **`item`**: `RealtimeRealtimeResponseItem` - 创建的对话项目

#### `conversation.item.deleted`
- **负载**: `RealtimeRealtimeResponseItemDeletedCommand`
- **描述**: 当删除对话项目时触发。
- **结构**:
```typescript
{
  type: 'conversation.item.deleted';
  event_id: string | null;
  item_id: string;
}
```
- **字段**:
  - **`type`**: `'conversation.item.deleted'` - 事件类型标识符
  - **`event_id`**: `string | null` - 此事件的唯一标识符
  - **`item_id`**: `string` - 被删除对话项目的ID

#### `conversation.item.truncated`
- **负载**: `RealtimeRealtimeResponseItemTruncatedCommand`
- **描述**: 当对话项目被截断时触发。
- **结构**:
```typescript
{
  type: 'conversation.item.truncated';
  event_id: string | null;
  item_id: string;
  audio_end_ms: number;
  index: number;
}
```
- **字段**:
  - **`type`**: `'conversation.item.truncated'` - 事件类型标识符
  - **`event_id`**: `string | null` - 此事件的唯一标识符
  - **`item_id`**: `string` - 被截断对话项目的ID
  - **`audio_end_ms`**: `number` - 音频结束时间戳（毫秒）
  - **`index`**: `number` - 截断发生的索引位置

#### `conversation.item.input_audio_transcription.completed`
- **负载**: `RealtimeRealtimeResponseItemInputAudioTranscriptionCompletedCommand`
- **描述**: 当音频输入转录完成时触发。
- **结构**:
```typescript
{
  type: 'conversation.item.input_audio_transcription.completed';
  event_id: string | null;
  item_id: string;
  content_index: number;
  transcript: string;
}
```
- **字段**:
  - **`type`**: `'conversation.item.input_audio_transcription.completed'` - 事件类型标识符
  - **`event_id`**: `string | null` - 此事件的唯一标识符
  - **`item_id`**: `string` - 对话项目的ID
  - **`content_index`**: `number` - 被转录内容部分的索引
  - **`transcript`**: `string` - 完成的转录文本

#### `conversation.item.input_audio_transcription.failed`
- **负载**: `RealtimeRealtimeResponseItemInputAudioTranscriptionFailedCommand`
- **描述**: 当音频输入转录失败时触发。
- **结构**:
```typescript
{
  type: 'conversation.item.input_audio_transcription.failed';
  event_id: string | null;
  item_id: string;
  content_index: number;
  error: RealtimeRealtimeResponseApiError;
}
```
- **字段**:
  - **`type`**: `'conversation.item.input_audio_transcription.failed'` - 事件类型标识符
  - **`event_id`**: `string | null` - 此事件的唯一标识符
  - **`item_id`**: `string` - 对话项目的ID
  - **`content_index`**: `number` - 转录失败的内容部分索引
  - **`error`**: `RealtimeRealtimeResponseApiError` - 转录失败的错误详情

### 内容部分事件

#### `response.content_part.added`
- **负载**: `RealtimeRealtimeResponseContentPartAddedCommand`
- **描述**: 当内容部分被添加到响应时触发。
- **结构**:
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
- **字段**:
  - **`type`**: `'response.content_part.added'` - 事件类型标识符
  - **`event_id`**: `string | null` - 此事件的唯一标识符
  - **`response_id`**: `string` - 响应的ID
  - **`item_id`**: `string` - 对话项目的ID
  - **`output_index`**: `number` - 响应中输出项目的索引
  - **`content_index`**: `number` - 项目内容部分的索引
  - **`part`**: `RealtimeRealtimeContentPart` - 被添加的内容部分

#### `response.content_part.done`
- **负载**: `RealtimeRealtimeResponseContentPartDoneCommand`
- **描述**: 当内容部分完成时触发。
- **结构**:
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
- **字段**:
  - **`type`**: `'response.content_part.done'` - 事件类型标识符
  - **`event_id`**: `string | null` - 此事件的唯一标识符
  - **`response_id`**: `string` - 响应的ID
  - **`item_id`**: `string` - 对话项目的ID
  - **`output_index`**: `number` - 响应中输出项目的索引
  - **`content_index`**: `number` - 项目内容部分的索引
  - **`part`**: `RealtimeRealtimeContentPart` - 完成的内容部分

### 输出项目事件

#### `response.output_item.added`
- **负载**: `RealtimeRealtimeResponseOutputItemAddedCommand`
- **描述**: 当输出项目被添加到响应时触发。
- **结构**:
```typescript
{
  type: 'response.output_item.added';
  event_id: string | null;
  response_id: string;
  output_index: number;
  item: RealtimeRealtimeResponseItem;
}
```
- **字段**:
  - **`type`**: `'response.output_item.added'` - 事件类型标识符
  - **`event_id`**: `string | null` - 此事件的唯一标识符
  - **`response_id`**: `string` - 响应的ID
  - **`output_index`**: `number` - 响应中输出项目的索引
  - **`item`**: `RealtimeRealtimeResponseItem` - 被添加的输出项目

#### `response.output_item.done`
- **负载**: `RealtimeRealtimeResponseOutputItemDoneCommand`
- **描述**: 当输出项目完成时触发。
- **结构**:
```typescript
{
  type: 'response.output_item.done';
  event_id: string | null;
  response_id: string;
  output_index: number;
  item: RealtimeRealtimeResponseItem;
}
```
- **字段**:
  - **`type`**: `'response.output_item.done'` - 事件类型标识符
  - **`event_id`**: `string | null` - 此事件的唯一标识符
  - **`response_id`**: `string` - 响应的ID
  - **`output_index`**: `number` - 响应中输出项目的索引
  - **`item`**: `RealtimeRealtimeResponseItem` - 完成的输出项目

### 速率限制事件

#### `rate_limits.updated`
- **负载**: `RealtimeRealtimeResponseRateLimitsUpdatedCommand`
- **描述**: 当速率限制信息更新时触发。
- **结构**:
```typescript
{
  type: 'rate_limits.updated';
  event_id: string | null;
  rate_limits: RealtimeRealtimeResponseRateLimitDetailsItem[];
}
```
- **字段**:
  - **`type`**: `'rate_limits.updated'` - 事件类型标识符
  - **`event_id`**: `string | null` - 此事件的唯一标识符
  - **`rate_limits`**: `RealtimeRealtimeResponseRateLimitDetailsItem[]` - 不同资源的速率限制详情数组

### 错误事件

#### `error`
- **负载**: `RealtimeRealtimeResponseErrorCommand`
- **描述**: 当发生错误时触发。
- **结构**:
```typescript
{
  type: 'error';
  event_id: string | null;
  error: RealtimeRealtimeResponseError;
}
```
- **字段**:
  - **`type`**: `'error'` - 事件类型标识符
  - **`event_id`**: `string | null` - 此事件的唯一标识符
  - **`error`**: `RealtimeRealtimeResponseError` - 错误详情对象

---

## 附加数据结构

### RealtimeRealtimeResponseSession
会话事件中返回的完整会话配置。

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

#### 字段
- **`object`**: `'realtime.session'` - 对象类型标识符
- **`id`**: `string` - 唯一会话标识符
- **`model`**: `string` - 会话使用的模型
- **`modalities`**: `('text' | 'audio')[]` - 会话启用的模态
- **`instructions`**: `string` - AI模型的系统指令
- **`voice`**: `RealtimeRealtimeVoice` - 用于音频生成的声音
- **`input_audio_format`**: `RealtimeRealtimeAudioFormat` - 输入音频格式
- **`output_audio_format`**: `RealtimeRealtimeAudioFormat` - 输出音频格式
- **`input_audio_transcription`**: `RealtimeRealtimeAudioInputTranscriptionSettings | null` - 转录设置
- **`turn_detection`**: `RealtimeRealtimeTurnDetection` - 轮次检测配置
- **`tools`**: `RealtimeRealtimeTool[]` - 可用工具/函数
- **`tool_choice`**: `RealtimeRealtimeToolChoice` - 工具选择策略
- **`temperature`**: `number` - 采样温度
- **`max_response_output_tokens`**: `number | null` - 最大输出令牌数

### RealtimeRealtimeResponse
包含元数据和使用信息的完整响应对象。

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

#### 字段
- **`object`**: `'realtime.response'` - 对象类型标识符
- **`id`**: `string` - 唯一响应标识符
- **`status`**: `RealtimeRealtimeResponseStatus` - 响应状态（'in_progress' | 'completed' | 'cancelled' | 'incomplete' | 'failed'）
- **`status_details`**: `RealtimeRealtimeResponseStatusDetails | null` - 附加状态信息
- **`output`**: `RealtimeRealtimeResponseItem[]` - 输出项数组
- **`usage`**: `object` - 令牌使用信息
  - **`total_tokens`**: `number` - 使用的总令牌数
  - **`input_tokens`**: `number` - 消耗的输入令牌数
  - **`output_tokens`**: `number` - 生成的输出令牌数
  - **`input_token_details`**: `object` - 输入令牌详细分类
    - **`cached_tokens`**: `number` - 从缓存检索的令牌数
    - **`text_tokens`**: `number` - 文本输入令牌数
    - **`audio_tokens`**: `number` - 音频输入令牌数
  - **`output_token_details`**: `object` - 输出令牌详细分类
    - **`text_tokens`**: `number` - 文本输出令牌数
    - **`audio_tokens`**: `number` - 音频输出令牌数

### RealtimeRealtimeResponseError
错误信息对象。

```typescript
interface RealtimeRealtimeResponseError {
  type: string;
  code?: string;
  message: string;
  param?: string;
  event_id?: string;
}
```

#### 字段
- **`type`**: `string` - 错误类型标识符
- **`code?`**: `string` - 可选的错误代码
- **`message`**: `string` - 人类可读的错误消息
- **`param?`**: `string` - 引起错误的参数（如适用）
- **`event_id?`**: `string` - 发生错误的事件ID（如适用）

### RealtimeRealtimeResponseApiError
API特定的错误信息。

```typescript
interface RealtimeRealtimeResponseApiError {
  type: string;
  code?: string;
  message: string;
  param?: string;
}
```

#### 字段
- **`type`**: `string` - 错误类型标识符
- **`code?`**: `string` - 可选的API错误代码
- **`message`**: `string` - 人类可读的错误消息
- **`param?`**: `string` - 引起错误的参数（如适用）

### RealtimeRealtimeResponseItem
基础响应项结构。

```typescript
interface RealtimeRealtimeResponseItem {
  object: 'realtime.item';
  type: RealtimeRealtimeItemType;
  id: string | null;
}
```

#### 字段
- **`object`**: `'realtime.item'` - 对象类型标识符
- **`type`**: `RealtimeRealtimeItemType` - 项目类型（'message' | 'function_call' | 'function_call_output'）
- **`id`**: `string | null` - 唯一项目标识符

### RealtimeRealtimeResponseRateLimitDetailsItem
特定资源的速率限制信息。

```typescript
interface RealtimeRealtimeResponseRateLimitDetailsItem {
  name: string;
  limit: number;
  remaining: number;
  reset_seconds: number;
}
```

#### 字段
- **`name`**: `string` - 受速率限制的资源名称
- **`limit`**: `number` - 允许的最大请求/令牌数
- **`remaining`**: `number` - 当前窗口中剩余的请求/令牌数
- **`reset_seconds`**: `number` - 速率限制重置前的秒数

### RealtimeRealtimeContentPart
基础内容部分结构。

```typescript
interface RealtimeRealtimeContentPart {
  type: RealtimeRealtimeContentPartType;
}
```

#### 字段
- **`type`**: `RealtimeRealtimeContentPartType` - 内容类型（'input_text' | 'input_audio' | 'text' | 'audio'）

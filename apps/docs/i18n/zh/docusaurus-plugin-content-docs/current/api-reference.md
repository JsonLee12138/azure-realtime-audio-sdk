---
sidebar_position: 3
---
# API 参考

## AzureRealTimeAudio 类

### 构造函数

```typescript
new AzureRealTimeAudio(options, websocketOptions?, WebSocketImpl?)
```

- `options`: 客户端配置选项
  - `hostName`: Azure OpenAI 服务域名
  - `apiVersion`: API 版本
  - `deployment`: 模型部署名称
  - `apiKey`: API 密钥
  - `sessionConfig?`: 会话配置（可选）

### 主要方法

#### 事件监听

```typescript
// 注册事件监听器
client.on(event, listener)

// 注册一次性事件监听器
client.once(event, listener)

// 移除事件监听器
client.off(event, listener?)

// 移除所有事件监听器
client.offAll()
```

#### 音频操作

```typescript
// 添加音频数据到缓冲区
client.appendAudio(base64Audio: string)

// 提交音频缓冲区进行处理
client.commitAudio()

// 清空音频缓冲区
client.clearAudioBuffer()
```

#### 对话管理

```typescript
// 创建对话项
client.createConversationItem(item, previousItemId?)

// 删除对话项
client.deleteItem(itemId: string)

// 截断对话项
client.truncateItem(itemId: string, contentIndex: number, audioEndMs: number)

// 创建响应
client.createResponse(responseConfig?)

// 取消当前响应
client.cancelResponse()
```

#### 状态管理

```typescript
// 获取模型状态
const status = client.status; // idle | listening | thinking | speaking

// 设置模型状态
client.status = ModelStatusEnum.IDLE;

// 标记模型完成说话
client.setModelSpeakDone();

// 检查是否已初始化
const isReady = client.isInitialized;

// 获取 WebSocket 连接状态
const connectionState = client.state;
```

### 事件类型

#### 会话事件
- `init` - 会话初始化完成
- `session.created` - 会话创建
- `session.updated` - 会话配置更新

#### 音频事件
- `response.audio.delta` - 音频数据块
- `response.audio.done` - 音频流结束
- `response.audio_transcript.delta` - 音频转录块
- `response.audio_transcript.done` - 音频转录完成
- `input_audio_buffer.speech_started` - 检测到用户开始说话
- `input_audio_buffer.speech_stopped` - 检测到用户停止说话

#### 响应事件
- `response.created` - 响应生成开始
- `response.done` - 响应生成完成
- `response.text.delta` - 文本内容块
- `response.text.done` - 文本内容完成

#### 错误事件
- `error` - 发生错误

### 枚举类型

#### ModelStatusEnum
- `IDLE` - 模型空闲状态
- `LISTENING` - 模型正在聆听用户输入
- `THINKING` - 模型正在思考处理
- `SPEAKING` - 模型正在回答输出 
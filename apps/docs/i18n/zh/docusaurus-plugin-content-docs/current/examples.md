---
sidebar_position: 4
---
# 使用场景

## 1. 语音助手

```typescript
const voiceAssistant = new AzureRealTimeAudio({
  hostName: 'your-resource.openai.azure.com',
  apiVersion: '2024-10-01-preview',
  deployment: 'gpt-4o-realtime-preview',
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  sessionConfig: {
    voice: 'alloy',
    instructions: '你是一个智能语音助手，请简洁友好地回答用户问题。'
  }
});

// 处理音频播放
voiceAssistant.on('response.audio.delta', (data) => {
  // 将 base64 音频数据解码并播放
  playAudio(data.delta);
});
```

## 2. 客服机器人

```typescript
const customerService = new AzureRealTimeAudio({
  hostName: 'your-resource.openai.azure.com',
  apiVersion: '2024-10-01-preview',
  deployment: 'gpt-4o-realtime-preview',
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  sessionConfig: {
    instructions: '你是一个专业的客服代表，请耐心解答客户问题。',
    tools: [
      {
        type: 'function',
        name: 'query_order',
        description: '查询订单状态',
        parameters: {
          type: 'object',
          properties: {
            orderId: { type: 'string', description: '订单号' }
          }
        }
      }
    ]
  }
});

// 处理工具调用
customerService.on('response.function_call_arguments.done', async (data) => {
  if (data.name === 'query_order') {
    const args = JSON.parse(data.arguments);
    const orderInfo = await queryOrderById(args.orderId);

    // 返回工具调用结果
    customerService.createConversationItem({
      type: 'function_call_output',
      call_id: data.call_id,
      output: JSON.stringify(orderInfo)
    });
  }
});
```

## 3. 实时翻译

```typescript
const translator = new AzureRealTimeAudio({
  hostName: 'your-resource.openai.azure.com',
  apiVersion: '2024-10-01-preview',
  deployment: 'gpt-4o-realtime-preview',
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  sessionConfig: {
    instructions: '请将用户的语音翻译成英文，只返回翻译结果。',
    voice: 'echo'
  }
});

// 实时显示翻译结果
translator.on('response.text.delta', (data) => {
  updateTranslationDisplay(data.delta);
});
``` 
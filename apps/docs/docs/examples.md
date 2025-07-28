---
sidebar_position: 4
---
# Use Cases

## 1. Voice Assistant

```typescript
const voiceAssistant = new AzureRealTimeAudio({
  hostName: 'your-resource.openai.azure.com',
  apiVersion: '2024-10-01-preview',
  deployment: 'gpt-4o-realtime-preview',
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  sessionConfig: {
    voice: 'alloy',
    instructions: 'You are an intelligent voice assistant, please answer questions concisely and friendly.'
  }
});

// Handle audio playback
voiceAssistant.on('response.audio.delta', (data) => {
  // Decode and play base64 audio data
  playAudio(data.delta);
});
```

## 2. Customer Service Bot

```typescript
const customerService = new AzureRealTimeAudio({
  hostName: 'your-resource.openai.azure.com',
  apiVersion: '2024-10-01-preview',
  deployment: 'gpt-4o-realtime-preview',
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  sessionConfig: {
    instructions: 'You are a professional customer service representative, please patiently answer customer questions.',
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

// Handle tool calls
customerService.on('response.function_call_arguments.done', async (data) => {
  if (data.name === 'query_order') {
    const args = JSON.parse(data.arguments);
    const orderInfo = await queryOrderById(args.orderId);

    // Return tool call result
    customerService.createConversationItem({
      type: 'function_call_output',
      call_id: data.call_id,
      output: JSON.stringify(orderInfo)
    });
  }
});
```

## 3. Real-time Translation

```typescript
const translator = new AzureRealTimeAudio({
  hostName: 'your-resource.openai.azure.com',
  apiVersion: '2024-10-01-preview',
  deployment: 'gpt-4o-realtime-preview',
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  sessionConfig: {
    instructions: 'Please translate user speech to English, only return the translation.',
    voice: 'echo'
  }
});

// Display translation results in real-time
translator.on('response.text.delta', (data) => {
  updateTranslationDisplay(data.delta);
});
``` 
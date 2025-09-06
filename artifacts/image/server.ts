// artifacts/image/server.ts

import { createDocumentHandler } from '@/lib/artifacts/server';
import { myProvider } from '@/lib/ai/providers';
import { imagePrompt } from '@/lib/ai/prompts';

export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',

  // 새로운 이미지 생성
  onCreateDocument: async ({ title, dataStream }) => {
    const promptText = imagePrompt(title);
    const imageModel = myProvider.imageModel('grok-2-image');

    // ImageModelV2CallOptions에 맞게 doGenerate 호출
    const result = await imageModel.doGenerate({
      prompt: promptText,
      size: '1024x1024',
      n: 1,
      aspectRatio: '1:1',
      seed: undefined,
      providerOptions: {},
    });

    // Base64 스트리밍
    for (const img of result.images) {
      dataStream.write({
        type: 'data-imageDelta',
        data: typeof img === 'string' ? img : Buffer.from(img).toString('base64'),
        transient: true,
      });
    }

    // 마지막 이미지 반환
    return typeof result.images[0] === 'string'
      ? result.images[0]
      : Buffer.from(result.images[0]).toString('base64');
  },

  // 기존 이미지 업데이트
  onUpdateDocument: async ({ document, description, dataStream }) => {
    const promptText = imagePrompt(description);
    const imageModel = myProvider.imageModel('grok-2-image');

    const result = await imageModel.doGenerate({
      prompt: promptText,
      size: '1024x1024',
      n: 1,
      aspectRatio: '1:1',
      seed: undefined,
      providerOptions: {},
    });

    for (const img of result.images) {
      dataStream.write({
        type: 'data-imageDelta',
        data: typeof img === 'string' ? img : Buffer.from(img).toString('base64'),
        transient: true,
      });
    }

    return typeof result.images[0] === 'string'
      ? result.images[0]
      : Buffer.from(result.images[0]).toString('base64');
  },
});

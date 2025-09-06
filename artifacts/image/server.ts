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
      n: 1,               // 한 장 생성
      aspectRatio: '1:1', // 정사각형
      seed: undefined,    // 필요 시 시드 지정
      providerOptions: {}, // Grok 모델 옵션
    });

    // Base64 스트리밍
    for (const img of result.images) {
      dataStream.write({
        type: 'data-imageDelta',
        data: img.base64,
        transient: true,
      });
    }

    // 마지막 이미지 반환
    return result.images[result.images.length - 1].base64;
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
        data: img.base64,
        transient: true,
      });
    }

    return result.images[result.images.length - 1].base64;
  },
});

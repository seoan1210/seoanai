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

    // doGenerate 사용
    const result = await imageModel.doGenerate({
      prompt: promptText,
      size: '1024x1024', // 필요에 따라 변경 가능
    });

    // Base64 스트리밍
    for (const img of result.images) {
      dataStream.write({
        type: 'data-imageDelta',
        data: img.base64,
        transient: true,
      });
    }

    return result.images[result.images.length - 1].base64;
  },

  // 기존 이미지 업데이트
  onUpdateDocument: async ({ document, description, dataStream }) => {
    const promptText = imagePrompt(description);
    const imageModel = myProvider.imageModel('grok-2-image');

    const result = await imageModel.doGenerate({
      prompt: promptText,
      size: '1024x1024',
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

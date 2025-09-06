import { createDocumentHandler } from '@/lib/artifacts/server';
import { myProvider } from '@/lib/ai/providers';
import { imagePrompt } from '@/lib/ai/prompts';
import { z } from 'zod';

export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',

  // 새로운 이미지 생성
  onCreateDocument: async ({ title, dataStream }) => {
    const promptText = imagePrompt(title);

    // ImageModel 전용 호출
    const imageModel = myProvider.imageModel('grok-2-image');

    const result = await imageModel.generate({
      prompt: promptText,
      size: '1024x1024', // 필요에 따라 조정
    });

    // Base64 스트리밍 처리
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

    const result = await imageModel.generate({
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

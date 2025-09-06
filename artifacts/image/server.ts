// artifact/image/server.ts

import { z } from 'zod';
import { streamObject } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';

export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',

  // 새로운 이미지 생성
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.imageModel('grok-2-image'), // Grok 이미지 모델
      prompt: title,
      schema: z.object({
        base64: z.string(),
      }),
    });

    for await (const delta of fullStream) {
      if (delta.type === 'object' && delta.object.base64) {
        dataStream.write({
          type: 'data-imageDelta',
          data: delta.object.base64,
          transient: true,
        });
        draftContent = delta.object.base64;
      }
    }

    return draftContent;
  },

  // 기존 이미지 업데이트
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.imageModel('grok-2-image'),
      prompt: description,
      schema: z.object({
        base64: z.string(),
      }),
    });

    for await (const delta of fullStream) {
      if (delta.type === 'object' && delta.object.base64) {
        dataStream.write({
          type: 'data-imageDelta',
          data: delta.object.base64,
          transient: true,
        });
        draftContent = delta.object.base64;
      }
    }

    return draftContent;
  },
});

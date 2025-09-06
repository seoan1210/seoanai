import { z } from 'zod';
import { streamObject } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { imagePrompt } from '@/lib/ai/prompts';

export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',

  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const promptText = imagePrompt(title); // 프롬프트 생성

    const { fullStream } = streamObject({
      model: myProvider.imageModel('grok-2-image'),
      prompt: promptText,
      schema: z.object({ base64: z.string() }),
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

  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = '';
    const promptText = imagePrompt(description);

    const { fullStream } = streamObject({
      model: myProvider.imageModel('grok-2-image'),
      prompt: promptText,
      schema: z.object({ base64: z.string() }),
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

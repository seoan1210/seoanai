// artifact/image/server.ts

import { z } from 'zod';
import { streamObject } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';

export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',

  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.imageModel('artifact-image-model'),
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

  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.imageModel('artifact-image-model'),
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

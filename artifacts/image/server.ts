import { z } from 'zod';
import { streamObject } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';

export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',

  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.imageModel('grok-2-image'),
      system: `Generate an image for: ${title}`,
      prompt: title,
      schema: z.object({ image: z.string() }),
    });

    for await (const delta of fullStream) {
      if (delta.type === 'object' && delta.object?.image) {
        const image = delta.object.image;
        dataStream.write({
          type: 'data-imageDelta',
          data: image,
          transient: true,
        });
        draftContent = image;
      }
    }

    return draftContent;
  },

  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.imageModel('grok-2-image'),
      system: `Update the image based on: ${description}`,
      prompt: description,
      schema: z.object({ image: z.string() }),
    });

    for await (const delta of fullStream) {
      if (delta.type === 'object' && delta.object?.image) {
        const image = delta.object.image;
        dataStream.write({
          type: 'data-imageDelta',
          data: image,
          transient: true,
        });
        draftContent = image;
      }
    }

    return draftContent;
  },
});

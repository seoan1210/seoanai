import { streamText, streamObject } from 'ai';
import { myProvider } from './myProvider';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { updateDocumentPrompt } from '@/lib/ai/prompts';
import { z } from 'zod'; // 스키마 정의를 위해 Zod 라이브러리 추가

// Grok에게 텍스트 또는 이미지를 생성하도록 요청하는 스키마를 정의
const grokResponseSchema = z.union([
  z.object({
    type: z.literal('text'),
    content: z.string(),
  }),
  z.object({
    type: z.literal('image'),
    content: z.string(), // Base64 인코딩된 이미지 데이터 또는 URL
  }),
]);

export const hybridDocumentHandler = createDocumentHandler<'hybrid'>({
  kind: 'hybrid',

  onCreateDocument: async ({ title, dataStream }) => {
    // 1. Grok 2 - Image 모델을 호출
    // 'artifact-model' 대신 'grok-2-image' 모델을 직접 지정하는 게 더 명확할 수 있어.
    const { partialStream } = streamObject({
      model: myProvider.languageModel('xai/grok-2-image'), // Grok 2 - Image 모델을 사용
      schema: grokResponseSchema,
      prompt: `사용자의 요청을 분석해서 'text' 또는 'image' 중 하나를 JSON으로 반환해.
              요청: ${title}`,
    });

    let draftContent = '';
    
    // 2. Grok의 응답을 스트리밍으로 받아서 분석
    for await (const chunk of partialStream) {
      if (chunk) {
        if (chunk.type === 'text') {
          // 텍스트 응답일 경우
          draftContent += chunk.content;
          dataStream.write({
            type: 'data-textDelta',
            data: chunk.content,
            transient: true,
          });
        } else if (chunk.type === 'image') {
          // 이미지 응답일 경우
          draftContent = chunk.content; // 이미지 데이터는 덮어쓰기
          dataStream.write({
            type: 'data-imageDelta',
            data: chunk.content,
            transient: false,
          });
          // 이미지가 생성되면 텍스트 스트림을 종료
          break; 
        }
      }
    }
    return draftContent;
  },

  onUpdateDocument: async ({ document, description, dataStream }) => {
    // 이 부분은 기존 텍스트 업데이트 로직을 그대로 사용
    // Grok 2 - Image 모델을 사용해 텍스트를 수정하거나,
    // Grok 2 - Vision 모델로 이미지를 분석하는 기능도 추가할 수 있어.
    const { fullStream } = streamText({
      model: myProvider.languageModel('xai/grok-2-image'),
      system: updateDocumentPrompt(document.content, 'text'),
      experimental_transform: smoothStream({ chunking: 'word' }),
      prompt: description,
    });
    
    let draftContent = '';
    for await (const delta of fullStream) {
      if (delta.type === 'text-delta') {
        const { text } = delta;
        draftContent += text;
        dataStream.write({
          type: 'data-textDelta',
          data: text,
          transient: true,
        });
      }
    }
    return draftContent;
  },
});

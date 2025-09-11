import { streamText, tool } from 'ai';
import { myProvider } from './myProvider';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { updateDocumentPrompt } from '@/lib/ai/prompts';
import { z } from 'zod';

// 1. Grok에게 제공할 '이미지 생성 도구'를 정의
const generateImageTool = tool({
  name: 'generateImage',
  description: '이미지를 생성합니다. 이미지를 만들어 달라는 요청이 들어오면 이 함수를 호출해야 합니다.',
  parameters: z.object({
    prompt: z.string().describe('사용자가 이미지로 만들고 싶어 하는 것을 상세히 설명하는 문장'),
  }),
});

export const hybridDocumentHandler = createDocumentHandler<'hybrid'>({
  kind: 'hybrid',

  onCreateDocument: async ({ title, dataStream }) => {
    // 2. Grok 모델을 호출할 때 '도구'와 '메시지'를 전달
    const { fullStream } = streamText({
      model: myProvider.languageModel('xai/grok-2-image'),
      messages: [{ role: 'user', content: title }],
      tools: [generateImageTool],
      // 3. Grok이 도구를 호출하면 실행될 콜백 함수
      onToolCall: async ({ toolName, args }) => {
        if (toolName === 'generateImage') {
          // Grok이 이미지 생성을 요청하면,
          // Grok API가 직접 이미지를 생성하고 그 결과를 반환한다고 가정
          // 실제 동작은 API 문서에 따라 다를 수 있지만, 이렇게 모델이 직접 처리하는 경우가 일반적입니다.
          // 여기서는 Grok이 이미지 데이터를 반환한다고 가정하고, 그 데이터를 스트림으로 바로 보냅니다.
          try {
            // Grok에 이미지를 요청하는 새로운 프롬프트를 보내는 로직이 들어갈 수 있습니다.
            // 하지만 ai-sdk의 tool 기능을 사용하면, onToolCall 안에서
            // 이미지가 바로 생성되어 반환되도록 설정하는 경우가 많습니다.
            const imageUrl = await myProvider.languageModel('xai/grok-2-image').getToolResult(args);

            // 클라이언트로 이미지 데이터를 바로 스트리밍
            dataStream.write({
              type: 'data-imageDelta',
              data: imageUrl,
              transient: false,
            });

            // Grok에게 이미지 URL을 텍스트로 알려줄 수도 있습니다.
            return `이미지 생성이 완료되었습니다: ${imageUrl}`;
          } catch (error) {
            return `이미지 생성에 실패했습니다: ${error.message}`;
          }
        }
      },
    });

    // 4. Grok이 함수를 호출하지 않고 텍스트를 생성할 경우, 텍스트를 스트리밍
    let draftContent = '';
    for await (const delta of fullStream) {
      if (delta.type === 'text-delta') {
        draftContent += delta.text;
        dataStream.write({
          type: 'data-textDelta',
          data: delta.text,
          transient: true,
        });
      }
    }
    return draftContent;
  },

  onUpdateDocument: async ({ document, description, dataStream }) => {
    // 이 부분은 기존 텍스트 업데이트 로직
    const { fullStream } = streamText({
      model: myProvider.languageModel('xai/grok-2-image'),
      system: updateDocumentPrompt(document.content, 'text'),
      prompt: description,
      experimental_transform: smoothStream({ chunking: 'word' }),
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

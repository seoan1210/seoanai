import { streamText } from 'ai';
import { myProvider } from './myProvider';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { generateImage } from './image-generator'; // 이미지 생성 함수 가져오기
import { z } from 'zod'; // Zod로 함수 입력값 유효성 검사

// 1. Grok에게 제공할 '도구(tool)'를 정의
const generateImageTool = {
  // 함수 이름
  name: 'generateImage',
  // 함수 설명 (AI가 이 설명을 보고 적절한 상황에 사용)
  description: '이미지를 생성합니다. 이미지를 만들어 달라는 요청이 들어오면 반드시 이 함수를 호출해야 합니다.',
  // 함수가 필요로 하는 입력값(인자)을 정의
  parameters: z.object({
    prompt: z.string().describe('사용자가 이미지로 만들고 싶어 하는 것을 상세히 설명하는 문장'),
  }),
};

export const hybridDocumentHandler = createDocumentHandler<'hybrid'>({
  kind: 'hybrid',

  onCreateDocument: async ({ title, dataStream }) => {
    // 2. Grok 모델을 호출할 때 'tools' 옵션을 추가
    const { fullStream } = streamText({
      model: myProvider.languageModel('xai/grok-2-image'),
      messages: [{ role: 'user', content: title }],
      // Grok이 사용할 도구를 여기에 전달
      tools: [generateImageTool],
      // 도구 호출이 감지되면 이 함수가 실행
      onToolCall: async ({ toolName, args }) => {
        if (toolName === 'generateImage') {
          // 3. Grok이 generateImage 함수를 호출하면, 우리가 직접 그 함수를 실행
          const imageUrl = await generateImage(args.prompt);

          // 4. 실행 결과를 클라이언트로 스트리밍
          dataStream.write({
            type: 'data-imageDelta',
            data: imageUrl,
            transient: false,
          });

          // Grok에게 이미지 URL을 텍스트로 알려줄 수도 있어.
          return `이미지 생성이 완료되었습니다: ${imageUrl}`;
        }
      },
    });

    // 5. Grok이 함수를 호출하지 않고 텍스트를 생성할 경우, 텍스트를 스트리밍
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

  // onUpdateDocument 로직은 그대로 사용
  onUpdateDocument: async ({ document, description, dataStream }) => {
    // 기존 로직
    // ...
  },
});

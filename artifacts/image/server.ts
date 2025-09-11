import { smoothStream, streamText } from 'ai';
import { myProvider } from './myProvider'; // myProvider 경로를 확인해줘.
import { createDocumentHandler } from '@/lib/artifacts/server';
import { updateDocumentPrompt } from '@/lib/ai/prompts';
import { generateImage } from './image-generator'; // 이미지 생성 함수를 가져옴

// 사용자가 이미지 생성을 요청할 때 사용하는 키워드들을 정의.
const IMAGE_TRIGGER_KEYWORDS = ['그려줘', '이미지 생성', '사진 보여줘'];

export const hybridDocumentHandler = createDocumentHandler<'hybrid'>({
  kind: 'hybrid',

  // 새로운 문서를 만들 때 호출되는 함수
  onCreateDocument: async ({ title, dataStream }) => {
    // 1. 프롬프트에 이미지 생성 키워드가 포함되어 있는지 확인
    const isImageRequest = IMAGE_TRIGGER_KEYWORDS.some(keyword => title.includes(keyword));

    if (isImageRequest) {
      // 2. 이미지 생성 요청일 경우, 별도의 이미지 생성 함수를 호출
      try {
        const imageUrl = await generateImage(title);

        // 프론트엔드로 이미지 데이터를 스트리밍
        dataStream.write({
          type: 'data-imageDelta',
          data: imageUrl,
          transient: false, // 이 데이터는 최종 결과물로 남아야 해
        });

        // 생성된 이미지 URL을 반환
        return imageUrl;
      } catch (error) {
        console.error("이미지 생성 실패:", error);
        // 에러 발생 시 사용자에게 텍스트로 알려줌
        const errorMessage = "죄송해요, 이미지를 생성하는 데 실패했어요. 😭";
        dataStream.write({
          type: 'data-textDelta',
          data: errorMessage,
          transient: false,
        });
        return errorMessage;
      }
    } else {
      // 3. 이미지 요청이 아닐 경우, Grok 모델로 텍스트를 생성
      const { fullStream } = streamText({
        model: myProvider.languageModel('artifact-model'),
        prompt: title,
        experimental_transform: smoothStream({ chunking: 'word' }),
      });

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
    }
  },

  // 기존 문서를 업데이트할 때 호출되는 함수
  onUpdateDocument: async ({ document, description, dataStream }) => {
    // 업데이트 로직은 텍스트에 한정된 것으로 가정
    const { fullStream } = streamText({
      model: myProvider.languageModel('artifact-model'),
      system: updateDocumentPrompt(document.content, 'text'),
      experimental_transform: smoothStream({ chunking: 'word' }),
      prompt: description,
      providerOptions: {
        openai: {
          prediction: {
            type: 'content',
            content: document.content,
          },
        },
      },
    });

    let draftContent = '';
    for await (const delta of fullStream) {
      const { type } = delta;
      if (type === 'text-delta') {
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

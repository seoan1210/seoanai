import type { ArtifactKind } from '@/components/artifact';
import type { Geo } from '@vercel/functions';

export const artifactsPrompt = `
너는 Seoan AI야. 다음 도구를 사용할 수 있어:

Artifact: imageArtifact
- 기능: 텍스트 프롬프트로 이미지를 생성할 수 있어.
- 사용 방법: generateImage(prompt, setArtifact) 함수를 호출
- 스트리밍 데이터는 onStreamPart에서 화면에 표시
- 완료되면 status='done'으로 업데이트
- Undo/Redo/Copy 버튼 사용 가능
`;

export const regularPrompt = `
너는 Seoan, 사용자의 신뢰할 수 있는 AI 절친이야. 존댓말을 기본으로 하되, 요청 시 말투를 자유롭게 바꿀 수 있어. 설명은 간단하고 직관적으로, 필요하면 깊이 있게 해. 확실하지 않은 건 솔직히 불확실하다고 말하고 거짓 정보는 절대 제공하지 않아. 최신 정보가 필요하면 검색을 적극 활용해. 목표는 편안함과 멋짐을 주는 파트너가 되는 것, 언제나 예의와 세련미를 지켜야 해.
`;

export const searchPrompt = `
너는 Seoan, 검색까지 잘하는 AI야. 최신 정보·버전·이벤트·날짜·지역 기반 사실은 반드시 검색해 확인해. 검색 결과는 그대로 나열하지 말고, 사용자 눈높이에 맞춰 간결하게 요약하고 해석해. 신뢰할 수 없는 출처는 표시하고, 불확실하면 추측 대신 솔직히 모른다고 말해. 검색이 실패하면 대안을 제시해. 목표는 신속·정확·신뢰성 있는 정보 전달이야. 그리고 저작권은 지키면서 링크나 결과를 제공해.
`;

export interface RequestHints {
  latitude: Geo['latitude'];
  longitude: Geo['longitude'];
  city: Geo['city'];
  country: Geo['country'];
}

export const getRequestPromptFromHints = (requestHints: RequestHints) => `\
사용자 위치 힌트:
- 위도: ${requestHints.latitude}
- 경도: ${requestHints.longitude}
- 도시: ${requestHints.city}
- 국가: ${requestHints.country}
`;

export const systemPrompt = ({
  selectedChatModel,
  requestHints,
}: {
  selectedChatModel: string;
  requestHints: RequestHints;
}) => {
  const requestPrompt = getRequestPromptFromHints(requestHints);

  if (selectedChatModel === 'chat-model-reasoning') {
    return `${regularPrompt}\n\n${searchPrompt}\n\n${requestPrompt}`;
  } else {
    return `${regularPrompt}\n\n${searchPrompt}\n\n${requestPrompt}\n\n${artifactsPrompt}`;
  }
};

/**
 * 타입별 유연형 프롬프트
 */
const promptsByType: Record<ArtifactKind, (content: string | null) => string> = {
  text: (content) =>
    `Seoan이 문서를 매끄럽게 다듬어줄게. 표현은 자연스럽게, 구조는 탄탄하게 개선해. 수정은 독단적으로 하지 않고 반드시 사용자 피드백 기반으로 해:\n\n${content}`,
  code: (content) =>
    `Seoan이 코드를 개선할게. 안정성과 가독성을 강화하고, 주석 퀄리티를 높여 이해하기 쉽게 만들 거야. 항상 사용자 요청에 맞춰 진행해:\n\n${content}`,
  sheet: (content) =>
    `Seoan이 스프레드시트를 정리할게. 열 구성과 가독성을 높이고 분석 효율성을 강화해. 개선은 사용자 의도를 반영해 진행할게:\n\n${content}`,
  image: (content) =>
    `Seoan이 이미지를 생성/편집할게. 이미지의 목적과 특징을 반영하며, 필요 시 여러 버전을 만들어 비교할 수 있어:\n\n${content || ''}`,
};

// 별도 export: 이전 import 오류 대응
export const codePrompt = promptsByType.code;
export const sheetPrompt = promptsByType.sheet;

export const updateDocumentPrompt = (currentContent: string | null, type: ArtifactKind) => {
  if (promptsByType[type]) return promptsByType[type](currentContent);
  return currentContent || '';
};

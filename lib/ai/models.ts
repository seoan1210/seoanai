export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: '기본 모델',
    description: '다목적 대화에 필요한 모델',
  },
  {
    id: 'chat-model-reasoning',
    name: '추론 모델',
    description: '고급 추론과 수학, 코딩, 문제해결에 적합한 모델',
  },
];

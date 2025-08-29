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
    description: '다목적 대화를 위한 기본 모델',
  },
  {
    id: 'chat-model-reasoning',
    name: '고급 추론 모델',
    description: '고급 추론, 수학 및 코딩 모델',
  },
];

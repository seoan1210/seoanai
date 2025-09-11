export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Seoan 2',
    description: '다목적 대화에 필요한 기본 모델',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Seoan 4 PRO',
    description:
      '추론 수학 및 코딩을 수행할 수 있는 고급 추론 모델',
  },
];

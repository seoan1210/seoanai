import { z } from 'zod';
import type { Session } from 'next-auth';
import { streamObject, tool, type UIMessageStreamWriter } from 'ai';
import { getDocumentById, saveSuggestions } from '@/lib/db/queries';
import type { Suggestion } from '@/lib/db/schema';
import { generateUUID } from '@/lib/utils';
import { myProvider } from '../providers';
import type { ChatMessage } from '@/lib/types';

interface RequestSuggestionsProps {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
}

export const requestSuggestions = ({
  session,
  dataStream,
}: RequestSuggestionsProps) =>
  tool({
    description: '문서에 대한 문장별 개선 제안을 요청합니다.',
    inputSchema: z.object({
      documentId: z.string().describe('수정을 요청할 문서의 ID'),
    }),
    execute: async ({ documentId }) => {
      const document = await getDocumentById({ id: documentId });

      if (!document || !document.content) {
        return {
          error: '문서를 찾을 수 없습니다.',
        };
      }

      const suggestions: Array<
        Omit<Suggestion, 'userId' | 'createdAt' | 'documentCreatedAt'>
      > = [];

      const { elementStream } = streamObject({
        model: myProvider.languageModel('artifact-model'),
        system:
          '너는 글쓰기 도우미야. 주어진 글을 읽고 더 나아질 수 있는 수정 제안을 해줘. 제안은 반드시 **전체 문장 단위**로 작성해야 하며, 수정 이유도 함께 설명해. 최대 5개까지 제안해.',
        prompt: document.content,
        output: 'array',
        schema: z.object({
          originalSentence: z.string().describe('원래 문장'),
          suggestedSentence: z.string().describe('수정된 문장'),
          description: z.string().describe('수정 이유 설명'),
        }),
      });

      for await (const element of elementStream) {
        // @ts-ignore todo: fix type
        const suggestion: Suggestion = {
          originalText: element.originalSentence,
          suggestedText: element.suggestedSentence,
          description: element.description,
          id: generateUUID(),
          documentId: documentId,
          isResolved: false,
        };

        dataStream.write({
          type: 'data-suggestion',
          data: suggestion,
          transient: true,
        });

        suggestions.push(suggestion);
      }

      if (session.user?.id) {
        const userId = session.user.id;

        await saveSuggestions({
          suggestions: suggestions.map((suggestion) => ({
            ...suggestion,
            userId,
            createdAt: new Date(),
            documentCreatedAt: document.createdAt,
          })),
        });
      }

      return {
        id: documentId,
        title: document.title,
        kind: document.kind,
        message: '문서에 제안이 추가되었습니다.',
      };
    },
  });

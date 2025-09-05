import { generateUUID } from '@/lib/utils';
import { tool, type UIMessageStreamWriter } from 'ai';
import { z } from 'zod';
import type { Session } from 'next-auth';
import {
  artifactKinds,
  documentHandlersByArtifactKind,
} from '@/lib/artifacts/server';
import type { ChatMessage } from '@/lib/types';

interface CreateDocumentProps {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
}

export const createDocument = ({ session, dataStream }: CreateDocumentProps) =>
  tool({
    description:
      '글쓰기나 콘텐츠 제작을 위한 문서를 새로 생성합니다. 이 도구는 제목과 종류에 따라 다른 함수를 호출하여 문서 내용을 만들어냅니다.',
    inputSchema: z.object({
      title: z.string().describe('문서 제목'),
      kind: z.enum(artifactKinds).describe('문서 종류'),
    }),
    execute: async ({ title, kind }) => {
      const id = generateUUID();

      dataStream.write({
        type: 'data-kind',
        data: kind,
        transient: true,
      });

      dataStream.write({
        type: 'data-id',
        data: id,
        transient: true,
      });

      dataStream.write({
        type: 'data-title',
        data: title,
        transient: true,
      });

      dataStream.write({
        type: 'data-clear',
        data: null,
        transient: true,
      });

      const documentHandler = documentHandlersByArtifactKind.find(
        (handler) => handler.kind === kind,
      );

      if (!documentHandler) {
        throw new Error(`문서 종류를 처리할 핸들러가 없습니다: ${kind}`);
      }

      await documentHandler.onCreateDocument({
        id,
        title,
        dataStream,
        session,
      });

      dataStream.write({ type: 'data-finish', data: null, transient: true });

      return {
        id,
        title,
        kind,
        content: '문서가 성공적으로 생성되었으며 이제 화면에서 확인할 수 있습니다.',
      };
    },
  });

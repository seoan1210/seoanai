import { createDocument } from '@/lib/artifacts/client';
import type { UIMessageStreamWriter } from 'ai';
import type { Session } from 'next-auth';
import type { ChatMessage } from '@/lib/types';

interface GenerateImageProps {
  prompt: string; // 챗봇 메시지 내용
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
}

export async function generateImageFromChat({
  prompt,
  session,
  dataStream,
}: GenerateImageProps) {
  // 데이터 스트림을 통해 실시간 UI 업데이트
  dataStream.write({
    type: 'data-text',
    data: '이미지 생성 요청을 처리 중입니다...',
    transient: true,
  });

  // 이미지 아티팩트 생성
  const artifact = await createDocument({ session, dataStream }).execute({
    title: prompt,
    kind: 'image', // imageDocumentHandler 호출
  });

  // 최종 완료 메시지
  dataStream.write({
    type: 'data-text',
    data: '이미지 생성이 완료되었습니다!',
    transient: true,
  });

  return artifact; // id, title, kind, content 포함
}

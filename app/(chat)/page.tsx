

import { cookies } from 'next/headers';
import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { auth } from '../(auth)/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/guest');
  }

  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');

  const initialModel = modelIdFromCookie
    ? modelIdFromCookie.value
    : DEFAULT_CHAT_MODEL;

  return (
    <div className="flex flex-col h-screen">
      {/* 채팅 영역 (메시지 + 입력창 포함) */}
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        initialChatModel={initialModel}
        initialVisibilityType="private"
        isReadonly={false}
        session={session}
        autoResume={false}
      />

      <footer className="w-full text-center mt-1 text-gray-500 text-xs">
        <div className="flex justify-center space-x-2">
          <Link href="/privacy-policy" className="hover:underline">
            개인정보 처리방침
          </Link>
          <span>|</span>
          <Link href="/terms-of-service" className="hover:underline">
            이용약관
          </Link>
          <span>|</span>
          <span>&copy; 2024 ~ {new Date().getFullYear()} Seoan AI</span>
        </div>
      </footer>

      <DataStreamHandler />
    </div>
  );
}

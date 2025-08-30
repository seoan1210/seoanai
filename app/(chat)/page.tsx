// app/(chat)/page.tsx
import { cookies } from 'next/headers';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { auth } from '../(auth)/auth';
import { redirect } from 'next/navigation';

// ClientPage import를 삭제했어.
// import ClientPage from './ClientPage'; 

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/guest');
  }
  

  return (
    <div>
      안녕하세요! 👋
    </div>
  );
}

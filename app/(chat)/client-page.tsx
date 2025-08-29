import { useState } from 'react';
import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { DataStreamHandler } from '@/components/data-stream-handler';

const introContent = `
<div style="padding: 20px; line-height: 1.6; color: #E0E0E0;">
  <h1 style="font-size: 2em; font-weight: bold; color: #E0E0E0;">Seoan AI에 오신 것을 환영합니다! 당신의 똑똑한 AI 조수</h1>
  <p>안녕하세요, Seoan AI가 드디어 세상에 나왔어요! 🚀 이곳은 당신의 아이디어를 현실로 만들어 줄 똑똑한 AI 조수입니다. 복잡한 업무부터 사소한 궁금증까지, Seoan AI가 당신의 가장 든든한 파트너가 되어드릴게요! 저희는 단순히 정보를 제공하는 것을 넘어, 당신이 더 효율적이고 창의적으로 일할 수 있도록 돕는 데 집중하고 있어요.</p>

  <h2 style="font-size: 1.5em; font-weight: bold; margin-top: 30px; color: #E0E0E0;">Seoan AI가 도와드릴 수 있는 것들!</h2>
  <p><b>1. 막막한 계획을 세울 때</b><br />
  머릿속에 떠다니는 아이디어를 정리하기 어려울 때가 있죠? Seoan AI에게 프로젝트 계획을 물어보세요. 논리적인 순서에 따라 단계별로 완벽한 계획을 짜 드립니다.</p>

  <p><b>2. 코딩 문제 해결부터 문서 작성까지</b><br />
  개발자라면 누구나 한 번쯤 겪어봤을 '코드 디버깅' 문제도 이제 걱정 없어요. 오류를 뱉어내면 Seoan AI가 바로잡아드립니다. 또한, 중요한 문서나 이메일을 작성할 때도 명확하고 깔끔한 초안을 제공해 시간과 노력을 아낄 수 있어요.</p>

  <p><b>3. 일상 속 소소한 궁금증 해결</b><br />
  오늘의 날씨 정보처럼 일상에서 궁금한 것들을 Seoan AI에게 물어보세요. 빠르고 정확한 답변으로 당신의 하루를 더욱 편리하게 만들어 드립니다.</p>

  <h2 style="font-size: 1.5em; font-weight: bold; margin-top: 30px; color: #E0E0E0;">Seoan AI, 더욱 강력해진 능력!</h2>
  <p>Seoan AI는 멈추지 않고 진화하고 있어요! 사용자 여러분의 다양한 니즈를 충족시키기 위해 더욱 강력한 기능을 탑재했습니다!</p>
  
  <p><b>1. 눈으로 보는 즐거움, 이미지 생성!</b><br />
  머릿속에 떠오르는 환상적인 아이디어를 현실로 만들어 드립니다. 원하는 스타일과 내용을 설명해주시면, Seoan AI가 순식간에 멋진 이미지를 뚝딱 만들어 드릴 거예요!</p>

  <p><b>2. 이미지 속 숨겨진 의미까지, 이미지 분석!</b><br />
  단순히 이미지를 보여주는 것을 넘어, 이미지에 담긴 내용과 맥락을 정확하게 분석해 드립니다. 이미지 속 사물의 종류, 배경 정보, 심지어 감정까지 파악하여 당신의 이해를 도울 거예요!</p>

  <p><b>3. 복잡한 정보도 한눈에, 문서 작성 & 요약!</b><br />
  보고서, 논문, 이메일까지! 어떤 종류의 문서든 쉽고 빠르게 작성할 수 있도록 도와드립니다. 또한, 긴 문서를 이해하기 쉽게 핵심 내용만 쏙쏙 뽑아 요약해 드려 시간 낭비 없이 효율적인 정보 습득이 가능합니다.</p>

  <p><b>4. 답답함은 이제 그만! 더욱 빨라진 성능!</b><br />
  기다림 없이 즉각적인 결과를 확인할 수 있도록 Seoan AI의 처리 속도가 더욱 빨라졌습니다. 당신의 질문에 번개처럼 답변하고, 원하는 작업을 순식간에 처리하여 생산성을 극대화합니다.</p>

  <p>Seoan AI는 언제나 사용자 여러분의 곁에서 최고의 AI 경험을 제공하기 위해 노력할 것입니다. 지금 바로 더욱 강력해진 Seoan AI를 경험해보세요! 당신의 가능성을 활짝 열어줄 거예요!</p>
</div>
`;

export default function ClientPage({ initialChatModel, session, id, modelIdFromCookie }: any) {
  const [showIntroModal, setShowIntroModal] = useState(true);

  return (
    <>
      <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
        {showIntroModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: '#2D2D2D', // 배경색을 어둡게
              color: '#E0E0E0', // 글자색을 밝게
              borderRadius: '10px',
              padding: '20px',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}>
              <div dangerouslySetInnerHTML={{ __html: introContent }} />
              <button
                onClick={() => setShowIntroModal(false)}
                style={{
                  marginTop: '20px',
                  padding: '10px 20px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: 'white',
                  backgroundColor: '#0070f3',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                확인
              </button>
            </div>
          </div>
        )}

        {/* 메인 챗봇 화면 */}
        {modelIdFromCookie ? (
          <Chat
            key={id}
            id={id}
            initialMessages={[]}
            initialChatModel={modelIdFromCookie.value}
            initialVisibilityType="private"
            isReadonly={false}
            session={session}
            autoResume={false}
          />
        ) : (
          <Chat
            key={id}
            id={id}
            initialMessages={[]}
            initialChatModel={initialChatModel}
            initialVisibilityType="private"
            isReadonly={false}
            session={session}
            autoResume={false}
          />
        )}
        <DataStreamHandler />
      </div>
    </>
  );
}

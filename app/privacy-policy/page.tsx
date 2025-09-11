'use client';

import Link from 'next/link';
import { useState } from 'react';

const privacySections = [
  {
    id: '1',
    title: '1. 개인정보의 수집 및 이용 목적',
    content: `Seoan AI는 다음의 목적으로 최소한의 개인정보를 수집 및 이용하며, 목적이 변경될 경우 관련 법령에 따라 사전 동의를 받을 것입니다.\n
- 서비스 제공: 사용자 문의에 대한 답변 생성 등 핵심 서비스 제공.
- 서비스 개선: 서비스 이용 기록 및 통계 분석을 통해 서비스 품질 향상 및 신규 기능 개발.
- 이용자 관리: 회원 식별, 부정 이용 방지 및 처리.`,
  },
  {
    id: '2',
    title: '2. 수집하는 개인정보 항목',
    content: `서비스 이용 과정에서 아래와 같은 개인정보가 자동으로 생성 및 수집될 수 있습니다.\n
- 필수 항목: 채팅 입력 내용(답변 생성 및 서비스 품질 개선을 위해 일시적으로 처리).
- 자동 수집 항목: IP 주소, 브라우저 정보, 접속 로그, 서비스 이용 기록, 쿠키(Cookie) 등.`,
  },
  {
    id: '3',
    title: '3. 개인정보의 보유 및 이용 기간',
    content: `이용자의 채팅 내용은 서비스 목적 달성 후 즉시 파기됩니다. 다만, 관련 법령에 따라 보존 의무가 있는 경우 해당 기간 동안 안전하게 보관합니다.\n
- 접속 로그, 이용 기록: 「통신비밀보호법」에 따라 3개월
- 쿠키(Cookie): 이용자 동의 철회 시 또는 동의 후 최대 1년까지`,
  },
  {
    id: '4',
    title: '4. 개인정보의 제3자 제공',
    content: `Seoan AI는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 다만, 법령에 의거하거나 수사 기관의 적법한 요청이 있는 경우에는 예외로 합니다.`,
  },
  {
    id: '5',
    title: '5. 이용자 및 법정대리인의 권리',
    content: `이용자는 언제든지 자신의 개인정보를 열람·정정·삭제 및 처리 정지를 요구할 수 있으며, 관련 법령에 따라 권리를 행사할 수 있습니다.`,
  },
  {
    id: '6',
    title: '6. 개인정보 처리방침 변경',
    content: `본 개인정보 처리방침은 관련 법령 및 회사 정책에 따라 변경될 수 있으며, 변경 사항은 웹사이트 공지사항을 통해 알려드립니다.`,
  },
];

export default function PrivacyPolicyPage() {
  const [openSections, setOpenSections] = useState<string[]>([]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(`section-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (!openSections.includes(id)) toggleSection(id);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-6 md:p-12 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-lg shadow-lg">
      <header className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
          개인정보 처리방침
        </h1>
        <p className="mt-2 text-md text-gray-600 dark:text-gray-300">
          Seoan AI는 이용자의 개인정보를 소중히 여기며, 「개인정보보호법」 및 관련 법령을 철저히 준수합니다.
        </p>
      </header>

      {/* 목차 버튼 */}
      <nav className="mb-6 flex flex-wrap gap-2">
        {privacySections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => scrollToSection(sec.id)}
            className="px-3 py-1 rounded bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-700 transition"
          >
            {sec.title}
          </button>
        ))}
      </nav>

      <section className="space-y-4">
        {privacySections.map((sec) => (
          <div
            key={sec.id}
            id={`section-${sec.id}`}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm"
          >
            <button
              onClick={() => toggleSection(sec.id)}
              className="w-full text-left px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition font-semibold"
            >
              {sec.title}
            </button>
            {openSections.includes(sec.id) && (
              <div className="px-4 py-3 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 whitespace-pre-line">
                {sec.content}
              </div>
            )}
          </div>
        ))}
      </section>

      <div className="mt-12 text-center">
        <Link
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-md transition duration-300"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

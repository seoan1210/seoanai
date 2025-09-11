'use client';

import Link from 'next/link';
import { useState } from 'react';

const termsSections = [
  {
    id: '1',
    title: '1. 약관의 효력 및 변경',
    content: `본 약관은 서비스에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다. 회사는 필요한 경우 관련 법령을 위반하지 않는 범위 내에서 본 약관을 변경할 수 있으며, 변경된 약관은 기존 약관과 동일한 방법으로 공지합니다.`,
  },
  {
    id: '2',
    title: '2. 서비스 제공',
    content: `회사는 이용자에게 챗봇 기반의 대화형 AI 서비스를 제공하며, 서비스의 종류 및 내용은 회사의 정책에 따라 변경될 수 있습니다.`,
  },
  {
    id: '3',
    title: '3. 저작권',
    content: `서비스를 통해 제공되는 모든 콘텐츠에 대한 저작권은 회사에 있으며, 이용자는 회사의 동의 없이 콘텐츠를 무단으로 복제, 배포, 전시, 판매할 수 없습니다.`,
  },
  {
    id: '4',
    title: '4. 이용자의 의무',
    content: `이용자는 서비스를 이용함에 있어 다음의 행위를 해서는 안 됩니다.
- 서비스의 운영을 방해하거나 다른 이용자의 서비스 이용을 방해하는 행위.
- 회사의 지식재산권을 침해하는 행위.
- 관련 법령에 위반되거나 불법적인 행위.`,
  },
  {
    id: '5',
    title: '5. 책임 제한',
    content: `회사는 천재지변, 파업 등 불가피한 사유로 서비스를 제공할 수 없는 경우 서비스 제공에 대한 책임을 부담하지 않습니다.`,
  },
];

export default function TermsOfServicePage() {
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
      // 펼쳐서 바로 보이도록
      if (!openSections.includes(id)) toggleSection(id);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-6 md:p-12 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-lg shadow-lg">
      <header className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
          이용약관
        </h1>
        <p className="mt-2 text-md text-gray-600 dark:text-gray-300">
          이용약관은 Seoan AI가 제공하는 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
        </p>
      </header>

      {/* 목차 버튼 */}
      <nav className="mb-6 flex flex-wrap gap-2">
        {termsSections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => scrollToSection(sec.id)}
            className="px-3 py-1 rounded bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-700 transition"
          >
            {sec.title}
          </button>
        ))}
      </nav>

      {/* 이용약관 섹션 */}
      <section className="space-y-4">
        {termsSections.map((sec) => (
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

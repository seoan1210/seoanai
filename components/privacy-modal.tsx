'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function PrivacyModal() {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  const setCookie = (name: string, value: string, days: number) => {
    if (typeof document === 'undefined') return;
    const date = new Date();
    date.setDate(date.getDate() + days);
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
  };

  useEffect(() => {
    const agreed = getCookie('seoan-ai-privacy');
    if (!agreed) setOpen(true);
  }, []);

  const handleAgree = () => {
    if (checked) {
      setCookie('seoan-ai-privacy', 'true', 365);
      setOpen(false);
    } else {
      alert('개인정보 처리방침과 가이드에 동의해야 서비스를 이용할 수 있습니다.');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 overflow-y-auto max-h-[90vh]"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Seoan AI 개인정보 처리방침 & 가이드
        </h2>

        {/* 개인정보 처리방침 */}
        <div className="text-gray-800 mb-6 space-y-2">
          <p>
            Seoan AI는 이용자의 개인정보 보호를 최우선으로 생각하며,
            관련 법령을 준수합니다.
          </p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              <strong>수집 항목:</strong> 채팅 입력 내용, 브라우저 정보(쿠키 등)
            </li>
            <li>
              <strong>수집 방법:</strong> 사용자가 채팅 입력 시 자동 수집
            </li>
            <li>
              <strong>이용 목적:</strong> 답변 생성 및 서비스 품질 개선
            </li>
            <li>
              <strong>보관 및 이용 기간:</strong> 대화 내용은 저장되지 않고
              일시적으로만 처리됩니다. 쿠키는 최대 1년간 보관됩니다.
            </li>
            <li>
              <strong>제3자 제공:</strong> 수집한 개인정보는 외부에 제공되지
              않습니다.
            </li>
            <li>
              <strong>이용자 권리:</strong> 개인정보 열람·정정·삭제 및 처리
              정지 요구 가능
            </li>
          </ol>
        </div>

        {/* 사용 가이드 */}
        <div className="text-gray-800 mb-6 space-y-2">
          <h3 className="text-lg font-semibold mb-2">Seoan AI 사용 가이드</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>챗봇에게 궁금한 내용을 입력하면 바로 답변을 받을 수 있습니다.</li>
            <li>긴 문장이나 여러 질문도 한 번에 입력 가능하지만, 한 번에 하나씩 물어보는 것이 정확도가 높습니다.</li>
            <li>개인정보(이름, 전화 번호 등)는 입력하지 않아도 됩니다.</li>
            <li>채팅 기록은 임시저장 됩니다. 로그인하여 영구 저장하세요.</li>
            <li>모바일/PC 모두 사용 가능하며, 화면 크기에 맞춰 자동 조정됩니다.</li>
          </ul>
        </div>

        <label className="flex items-center mb-4 text-gray-900">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mr-2 accent-blue-600"
          />
          개인정보 처리방침과 가이드에 동의합니다.
        </label>

        <button
          onClick={handleAgree}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-semibold"
        >
          동의하고 시작하기
        </button>
      </motion.div>
    </div>
  );
}

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
      alert('개인정보 처리방침에 동의해야 서비스를 이용할 수 있습니다.');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6"
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Seoan AI 개인정보 처리방침
        </h2>
        <div className="text-gray-800 mb-6 max-h-60 overflow-y-auto text-sm space-y-2">
          <p>
            Seoan AI는 이용자의 개인정보 보호를 최우선으로 생각하며,
            관련 법령을 준수합니다. 본 서비스는 다음과 같은 기준으로
            개인정보를 처리합니다.
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

        <label className="flex items-center mb-4 text-gray-900">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mr-2 accent-blue-600"
          />
          개인정보 처리방침에 동의합니다.
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

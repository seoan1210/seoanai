'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function PrivacyModal() {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);

  // 쿠키 읽기
  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  // 쿠키 설정 (만료일: 365일)
  const setCookie = (name: string, value: string, days: number) => {
    if (typeof document === 'undefined') return;
    const date = new Date();
    date.setDate(date.getDate() + days);
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
  };

  useEffect(() => {
    const agreed = getCookie('seoan-ai-privacy');
    if (!agreed) {
      setOpen(true);
    }
  }, []);

  const handleAgree = () => {
    if (checked) {
      setCookie('seoan-ai-privacy', 'true', 365); // 1년 동안 유지
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
        <h2 className="text-xl font-bold mb-4">Seoan AI 개인정보 처리방침</h2>
        <div className="text-gray-700 mb-6 max-h-60 overflow-y-auto text-sm">
          <p className="mb-2">
            Seoan AI는 이용자의 개인정보 보호를 최우선으로 생각합니다.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>수집 항목: 채팅 입력 내용, 브라우저 정보(쿠키 등)</li>
            <li>이용 목적: 답변 생성 및 서비스 품질 개선</li>
            <li>보관 기간: 대화 내용은 저장되지 않으며, 일시적으로만 처리됩니다.</li>
            <li>
              자세한 사항은{' '}
              <a
                href="/privacy"
                className="text-blue-600 underline"
                target="_blank"
              >
                개인정보 처리방침 전문
              </a>
              을 확인하세요.
            </li>
          </ul>
        </div>

        <label className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mr-2"
          />
          개인정보 처리방침에 동의합니다.
        </label>

        <button
          onClick={handleAgree}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl"
        >
          동의하고 시작하기
        </button>
      </motion.div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto p-6 text-gray-800">
      <h1 className="text-2xl font-bold mb-6">개인정보 처리방침</h1>

      <p className="mb-4">
        Seoan AI는 이용자의 개인정보 보호를 최우선으로 생각하며,
        「개인정보 보호법」 등 관련 법령을 준수합니다. 본 방침은
        서비스 이용과 관련하여 수집되는 개인정보의 처리 방식과 보호 조치를
        안내합니다.
      </p>

      <ol className="list-decimal pl-6 mb-4 space-y-2">
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
          정지 요구가 가능합니다.
        </li>
      </ol>

      <p className="text-sm text-gray-600 mt-6">
        본 개인정보 처리방침은 2025년 9월 5일부터 적용됩니다.
      </p>
    </main>
  );
}

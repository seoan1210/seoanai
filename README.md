<a href="https://seoanai.vercel.app/">
  <img alt="Seoan AI" src="app/favicon.ico">
  <h1 align="center">2024 ~ 2025</h1>
</a>


# Seoan AI Chatbot

## 프로젝트 개요

Seoan AI Chatbot은 Next.js와 Grok 기반으로 개발된 한국어 최적화 AI 챗봇 프로젝트입니다. 사용자는 대화형 인터페이스를 통해 글쓰기, 코드 작성, 문서 편집 등 다양한 작업을 지원하며, 업무와 학습을 돕는 지능형 도구로 설계되었습니다.

## 주요 기능

* **대화형 인터페이스**: 자연스럽고 실시간적인 AI 상호작용 제공
* **Artifacts 모드**: 코드, 문서, 스프레드시트를 대화와 함께 확인 및 편집 가능
* **개인정보 이용 동의 팝업**: 첫 접속 시 개인정보 보호를 위한 동의 절차 제공
* **사용자 인증**: NextAuth 기반의 로그인 및 세션 관리 기능
* **토스트 알림**: 작업 성공, 실패 등 즉각적인 피드백 제공

## 기술 스택

* **Frontend**: Next.js (App Router)
* **Authentication**: NextAuth.js
* **UI**: TailwindCSS, shadcn/ui, lucide-react
* **AI 연동**: Grok API

## 설치 및 실행

1. 프로젝트 클론: `git clone https://github.com/seoan1210/seoanai.git`
2. 디렉토리 이동: `cd seoanai`
3. 의존성 설치: `npm install`
4. 개발 서버 실행: `npm run dev`
5. 프로덕션 빌드 및 실행: `npm run build && npm start`

## 환경 변수

`.env.local` 파일에 다음 값을 설정해야 합니다.

* `GROK_API_KEY`: Grok API 키
* `NEXTAUTH_SECRET`: NextAuth 암호화 키
* `NEXTAUTH_URL`: 애플리케이션 기본 URL

## 프로젝트 구조

* `components/`: UI 컴포넌트 (AuthForm, Toast, Popup 등)
* `app/`: Next.js App Router 기반 페이지
* `lib/`: 유틸 함수 및 API 연동 로직
* `public/`: 정적 파일 (이미지, 폰트 등)
* `tests/`: 테스트 코드

## 향후 계획

* 사용자 대화 기록 저장 및 검색 기능 추가
* Grok 최신 버전 연동
* 한국어 환경 최적화 지속

## 라이선스

MIT License



## 배포 방법
1. 프로젝트 다운로드
2. vercel.com 접속
3. 로그인 / 회원가입
4. 프로젝트 만들기 깃허브 임포트 하기
5. AUTH_SECRET 환경변수 만들기 => 베포
6. GROQ, XAI, neon, blob 프로젝트 연결 ( Vercel Marketplace 에서 찾기)
7. 베포
8. 완료

## 로컬환경
pnpm build
pnpm run


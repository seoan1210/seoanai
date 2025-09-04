// 'use client'가 맨 위에 있는 거 보니까, 이 컴포넌트는 클라이언트에서만 돌아간다는 뜻이네!
// 'use client';

// 필요한 것들 끌어오기!
import type { UIMessage } from 'ai';
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
  memo,
} from 'react';
import { toast } from 'sonner'; // 토스트 메시지 띄우는 라이브러리!
import { useLocalStorage, useWindowSize } from 'usehooks-ts'; // 로컬 스토리지랑 창 크기 가져오는 훅!

// 커스텀 아이콘들
import { ArrowUpIcon, PaperclipIcon, StopIcon } from './icons';
// 첨부파일 미리보기 컴포넌트
import { PreviewAttachment } from './preview-attachment';
// 버튼
import { Button } from './ui/button';
// 제안된 액션들
import { SuggestedActions } from './suggested-actions';
// 프롬프트 입력 관련 컴포넌트들
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputSubmit,
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectContent,
} from './elements/prompt-input';
// 셀렉트 박스 아이템
import { SelectItem, SelectValue } from '@/components/ui/select';
import equal from 'fast-deep-equal'; // 객체 깊숙이 비교하는 라이브러리
import type { UseChatHelpers } from '@ai-sdk/react'; // AI 챗 관련 헬퍼 함수들
import { AnimatePresence, motion } from 'framer-motion'; // 애니메이션!
import { ArrowDown } from 'lucide-react'; // 아래 화살표 아이콘
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom'; // 맨 아래로 스크롤하는 커스텀 훅
import type { VisibilityType } from './visibility-selector';
import type { Attachment, ChatMessage } from '@/lib/types';
import { chatModels } from '@/lib/ai/models'; // AI 모델 목록
import { saveChatModelAsCookie } from '@/app/(chat)/actions'; // 쿠키에 모델 저장하는 서버 액션
import { startTransition } from 'react'; // 상태 변화를 부드럽게 만들어주는 React 함수

// 핵심 컴포넌트 시작! 엄청 많은 속성들을 받고 있네.
function PureMultimodalInput({
  chatId, // 채팅 ID
  input, // 입력된 텍스트
  setInput, // 입력 텍스트 변경 함수
  status, // 채팅 상태 (예: 'ready', 'submitted' 등)
  stop, // 채팅 중단 함수
  attachments, // 첨부파일 목록
  setAttachments, // 첨부파일 변경 함수
  messages, // 메시지 목록
  setMessages, // 메시지 변경 함수
  sendMessage, // 메시지 전송 함수
  className, // CSS 클래스 이름
  selectedVisibilityType, // 선택된 공개 범위
  selectedModelId, // 선택된 AI 모델 ID
}) {
  // 텍스트 입력창 참조
  const textareaRef = useRef(null);
  // 창 크기 가져오기
  const { width } = useWindowSize();

  // 컴포넌트가 처음 렌더링될 때 한 번 실행돼!
  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight(); // 텍스트 영역 높이 조절
    }
  }, []);

  // 텍스트 영역 높이 조절 함수
  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '72px';
    }
  };

  // 텍스트 영역 높이 초기화 함수
  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '72px';
    }
  };

  // 로컬 스토리지에 입력값 저장하기
  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    'input',
    '',
  );

  // 컴포넌트가 로드되면 로컬 스토리지에서 입력값 가져와!
  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // DOM 값이 로컬 스토리지 값보다 우선이야.
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
      adjustHeight();
    }
  }, []);

  // 입력값이 바뀔 때마다 로컬 스토리지에 저장해줘!
  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  // 입력 텍스트 변경 핸들러
  const handleInput = (event) => {
    setInput(event.target.value);
  };

  // 파일 입력창 참조
  const fileInputRef = useRef(null);
  // 업로드 대기열 상태
  const [uploadQueue, setUploadQueue] = useState([]);

  // 폼 제출 함수! useCallback으로 감싸서 불필요한 재렌더링을 막았네.
  const submitForm = useCallback(() => {
    // URL 정리!
    window.history.replaceState({}, '', `/chat/${chatId}`);

    // 메시지 전송!
    sendMessage({
      role: 'user',
      parts: [
        // 첨부파일 정보
        ...attachments.map((attachment) => ({
          type: 'file',
          url: attachment.url,
          name: attachment.name,
          mediaType: attachment.contentType,
        })),
        // 텍스트 입력
        {
          type: 'text',
          text: input,
        },
      ],
    });

    // 전송 후 입력 상태 초기화!
    setAttachments([]);
    setLocalStorageInput('');
    resetHeight();
    setInput('');

    // 창이 넓을 땐 다시 입력창에 커서를 두기
    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    input,
    setInput,
    attachments,
    sendMessage,
    setAttachments,
    setLocalStorageInput,
    width,
    chatId,
  ]);

  // 파일 업로드 함수
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;
        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      }
      const { error } = await response.json();
      toast.error(error);
    } catch (error) {
      toast.error('파일 업로드에 실패했어요, 다시 시도해주세요!');
    }
  };

  // 파일 변경 핸들러
  const handleFileChange = useCallback(
    async (event) => {
      const files = Array.from(event.target.files || []);
      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined,
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error('파일 업로드 중 오류 발생!', error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments],
  );

  // 맨 아래로 스크롤하는 훅 사용
  const { isAtBottom, scrollToBottom } = useScrollToBottom();

  // 메시지 전송 후 맨 아래로 스크롤!
  useEffect(() => {
    if (status === 'submitted') {
      scrollToBottom();
    }
  }, [status, scrollToBottom]);

  // 컴포넌트 화면 구성 시작!
  return (
    <div className="flex relative flex-col gap-4 w-full">
      {/* 아래로 스크롤 버튼 애니메이션 */}
      <AnimatePresence>
        {!isAtBottom && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute bottom-28 left-1/2 z-50 -translate-x-1/2"
          >
            <Button
              data-testid="scroll-to-bottom-button"
              className="rounded-full"
              size="icon"
              variant="outline"
              onClick={(event) => {
                event.preventDefault();
                scrollToBottom();
              }}
            >
              <ArrowDown />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 아무 메시지도 없을 때 제안된 액션 보여주기 */}
      {messages.length === 0 &&
        attachments.length === 0 &&
        uploadQueue.length === 0 && (
          <SuggestedActions
            sendMessage={sendMessage}
            chatId={chatId}
            selectedVisibilityType={selectedVisibilityType}
          />
        )}

      {/* 숨겨진 파일 입력창 */}
      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {/* 프롬프트 입력 폼 */}
      <PromptInput
        className="bg-gray-50 rounded-3xl border border-gray-300 shadow-none transition-all duration-200 dark:bg-sidebar dark:border-sidebar-border hover:ring-1 hover:ring-primary/30 focus-within:ring-1 focus-within:ring-primary/50"
        onSubmit={(event) => {
          event.preventDefault();
          if (status !== 'ready') {
            toast.error('모델이 답변을 끝낼 때까지 기다려주세요!');
          } else {
            submitForm();
          }
        }}
      >
        {/* 첨부파일 미리보기 */}
        {(attachments.length > 0 || uploadQueue.length > 0) && (
          <div
            data-testid="attachments-preview"
            className="flex overflow-x-scroll flex-row gap-2 items-end px-3 py-2"
          >
            {attachments.map((attachment) => (
              <PreviewAttachment
                key={attachment.url}
                attachment={attachment}
                onRemove={() => {
                  setAttachments((currentAttachments) =>
                    currentAttachments.filter((a) => a.url !== attachment.url),
                  );
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              />
            ))}

            {uploadQueue.map((filename) => (
              <PreviewAttachment
                key={filename}
                attachment={{
                  url: '',
                  name: filename,
                  contentType: '',
                }}
                isUploading={true}
              />
            ))}
          </div>
        )}

        {/* 텍스트 입력창 */}
        <PromptInputTextarea
          data-testid="multimodal-input"
          ref={textareaRef}
          placeholder="메시지 보내기..."
          value={input}
          onChange={handleInput}
          minHeight={72}
          maxHeight={200}
          disableAutoResize={true}
          className="text-base resize-none py-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-transparent !border-0 !border-none outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
          rows={1}
          autoFocus
        />
        {/* 툴바 (버튼들) */}
        <PromptInputToolbar className="px-4 py-2 !border-t-0 !border-top-0 shadow-none dark:!border-transparent dark:border-0">
          <PromptInputTools className="gap-2">
            {/* 첨부파일 버튼 */}
            <AttachmentsButton fileInputRef={fileInputRef} status={status} />
            {/* 모델 선택 버튼 */}
            <ModelSelectorCompact selectedModelId={selectedModelId} />
          </PromptInputTools>
          {/* 상태에 따라 전송/중지 버튼 보여주기 */}
          {status === 'submitted' ? (
            <StopButton stop={stop} setMessages={setMessages} />
          ) : (
            <PromptInputSubmit
              status={status}
              disabled={!input.trim() || uploadQueue.length > 0}
              className="p-3 text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300 dark:bg-sidebar-accent dark:hover:bg-sidebar-accent/80 dark:text-gray-300"
            >
              <ArrowUpIcon size={20} />
            </PromptInputSubmit>
          )}
        </PromptInputToolbar>
      </PromptInput>
    </div>
  );
}

// 성능 최적화를 위한 메모화!
export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    // 이전 속성과 다음 속성을 비교해서 같으면 다시 렌더링하지 않아!
    if (prevProps.input !== nextProps.input) return false;
    if (prevProps.status !== nextProps.status) return false;
    // 첨부파일은 깊이 비교해야 함
    if (!equal(prevProps.attachments, nextProps.attachments)) return false;
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType)
      return false;
    if (prevProps.selectedModelId !== nextProps.selectedModelId) return false;

    return true;
  },
);

---

### **하위 컴포넌트들**

```jsx
// 첨부파일 버튼
function PureAttachmentsButton({
  fileInputRef,
  status,
}) {
  return (
    <Button
      data-testid="attachments-button"
      className="rounded-md rounded-bl-lg p-[7px] h-fit dark:border-zinc-700 hover:dark:bg-zinc-900 hover:bg-zinc-200"
      onClick={(event) => {
        event.preventDefault();
        fileInputRef.current?.click(); // 클릭하면 숨겨진 파일 입력창을 누르게 함
      }}
      disabled={status !== 'ready'}
      variant="ghost"
    >
      <PaperclipIcon size={14} />
    </Button>
  );
}

const AttachmentsButton = memo(PureAttachmentsButton); // 메모화!

// 모델 선택 컴포넌트
function PureModelSelectorCompact({
  selectedModelId,
}) {
  // 낙관적 업데이트를 위한 상태
  const [optimisticModelId, setOptimisticModelId] = useState(selectedModelId);

  const selectedModel = chatModels.find(
    (model) => model.id === optimisticModelId,
  );

  return (
    <PromptInputModelSelect
      value={selectedModel?.name}
      onValueChange={(modelName) => {
        const model = chatModels.find((m) => m.name === modelName);
        if (model) {
          setOptimisticModelId(model.id);
          startTransition(() => {
            saveChatModelAsCookie(model.id); // 쿠키에 모델 ID 저장!
          });
        }
      }}
    >
      <PromptInputModelSelectTrigger
        type="button"
        className="text-xs focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:ring-0 data-[state=closed]:ring-0"
      >
        {selectedModel?.name || '모델 선택'}
      </PromptInputModelSelectTrigger>
      <PromptInputModelSelectContent>
        {chatModels.map((model) => (
          <SelectItem key={model.id} value={model.name}>
            <div className="flex flex-col gap-1 items-start py-1">
              <div className="font-medium">{model.name}</div>
              <div className="text-xs text-muted-foreground">
                {model.description}
              </div>
            </div>
          </SelectItem>
        ))}
      </PromptInputModelSelectContent>
    </PromptInputModelSelect>
  );
}

const ModelSelectorCompact = memo(PureModelSelectorCompact); // 메모화!

// 중지 버튼
function PureStopButton({
  stop,
  setMessages,
}) {
  return (
    <Button
      data-testid="stop-button"
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        stop(); // 채팅 중단
        setMessages((messages) => messages);
      }}
    >
      <StopIcon size={14} />
    </Button>
  );
}

const StopButton = memo(PureStopButton); // 메모화!

// 전송 버튼
function PureSendButton({
  submitForm,
  input,
  uploadQueue,
}) {
  return (
    <Button
      data-testid="send-button"
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        submitForm();
      }}
      disabled={input.length === 0 || uploadQueue.length > 0} // 입력값이 없거나 업로드 중일 땐 비활성화
    >
      <ArrowUpIcon size={14} />
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  // 이것도 성능 최적화를 위해 메모화!
  if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length)
    return false;
  if (prevProps.input !== nextProps.input) return false;
  return true;
});

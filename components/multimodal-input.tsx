'use client';

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
  startTransition,
} from 'react';
import { toast } from 'sonner';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';

import { ArrowUpIcon, PaperclipIcon, StopIcon } from './icons';
import { PreviewAttachment } from './preview-attachment';
import { Button } from './ui/button';
import { SuggestedActions } from './suggested-actions';
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
import { SelectItem } from '@/components/ui/select';
import equal from 'fast-deep-equal';
import type { UseChatHelpers } from '@ai-sdk/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';
import type { VisibilityType } from './visibility-selector';
import type { Attachment, ChatMessage } from '@/lib/types';
import { chatModels } from '@/lib/ai/models';
import { saveChatModelAsCookie } from '@/app/(chat)/actions';

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  sendMessage,
  className,
  selectedVisibilityType,
  selectedModelId,
}: {
  chatId: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  status: UseChatHelpers<ChatMessage>['status'];
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers<ChatMessage>['setMessages'];
  sendMessage: UseChatHelpers<ChatMessage>['sendMessage'];
  className?: string;
  selectedVisibilityType: VisibilityType;
  selectedModelId: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();
  const [localStorageInput, setLocalStorageInput] = useLocalStorage('input', '');
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);
  const { isAtBottom, scrollToBottom } = useScrollToBottom();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (textareaRef.current) adjustHeight(); }, []);
  useEffect(() => { setLocalStorageInput(input); }, [input, setLocalStorageInput]);
  useEffect(() => {
    if (status === 'submitted') scrollToBottom();
  }, [status, scrollToBottom]);

  const adjustHeight = () => {
    if (textareaRef.current) textareaRef.current.style.height = '72px';
  };
  const resetHeight = () => {
    if (textareaRef.current) textareaRef.current.style.height = '72px';
  };
  const handleInput = (event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value);

  const submitForm = useCallback(() => {
    window.history.replaceState({}, '', `/chat/${chatId}`);

    sendMessage({
      role: 'user',
      parts: [
        ...attachments.map((attachment) => ({
          type: 'file' as const,
          url: attachment.url,
          name: attachment.name,
          mediaType: attachment.contentType,
        })),
        { type: 'text', text: input },
      ],
    });

    setAttachments([]);
    setLocalStorageInput('');
    resetHeight();
    setInput('');
    if (width && width > 768) textareaRef.current?.focus();
  }, [input, setInput, attachments, sendMessage, setAttachments, setLocalStorageInput, width, chatId]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files/upload', { method: 'POST', body: formData });
      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;
        return { url, name: pathname, contentType };
      }
      const { error } = await response.json();
      toast.error(error);
    } catch (error) {
      toast.error('파일 업로드 실패, 다시 시도해주세요!');
    }
  };

  const handleFileChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadQueue(files.map((file) => file.name));

    try {
      const uploadedAttachments = await Promise.all(files.map((file) => uploadFile(file)));
      setAttachments((currentAttachments) => [
        ...currentAttachments,
        ...uploadedAttachments.filter(Boolean),
      ]);
    } catch (error) {
      console.error('파일 업로드 오류!', error);
    } finally {
      setUploadQueue([]);
    }
  }, [setAttachments]);

  return (
    <div className="flex relative flex-col gap-4 w-full">
      <AnimatePresence>
        {!isAtBottom && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute bottom-28 left-1/2 z-50 -translate-x-1/2">
            <Button data-testid="scroll-to-bottom-button" className="rounded-full" size="icon" variant="outline"
              onClick={(event) => { event.preventDefault(); scrollToBottom(); }}>
              <ArrowDown />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {messages.length === 0 && attachments.length === 0 && uploadQueue.length === 0 && (
        <SuggestedActions sendMessage={sendMessage} chatId={chatId} selectedVisibilityType={selectedVisibilityType} />
      )}

      <input type="file" className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none" ref={fileInputRef} multiple
        onChange={handleFileChange} tabIndex={-1} />

      <PromptInput
        className="bg-gray-50 rounded-3xl border border-gray-300 shadow-none transition-all duration-200 dark:bg-sidebar dark:border-sidebar-border hover:ring-1 hover:ring-primary/30 focus-within:ring-1 focus-within:ring-primary/50"
        onSubmit={(event) => {
          event.preventDefault();
          if (status !== 'ready') toast.error('모델이 응답을 완료할 때까지 기다려주세요!');
          else submitForm();
        }}
      >
        {(attachments.length > 0 || uploadQueue.length > 0) && (
          <div data-testid="attachments-preview" className="flex overflow-x-scroll flex-row gap-2 items-end px-3 py-2">
            {attachments.map((attachment) => (
              <PreviewAttachment key={attachment.url} attachment={attachment} onRemove={() => {
                setAttachments((cur) => cur.filter((a) => a.url !== attachment.url));
                if (fileInputRef.current) fileInputRef.current.value = '';
              }} />
            ))}
            {uploadQueue.map((filename) => (
              <PreviewAttachment key={filename} attachment={{ url: '', name: filename, contentType: '' }} isUploading={true} />
            ))}
          </div>
        )}

        <PromptInputTextarea ref={textareaRef} placeholder="메시지를 입력하세요..." value={input} onChange={handleInput}
          minHeight={72} maxHeight={200} disableAutoResize={true}
          className="text-base resize-none py-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-transparent !border-0 !border-none outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
          rows={1} autoFocus
        />

        <PromptInputToolbar className="px-4 py-2 !border-t-0 !border-top-0 shadow-none dark:!border-transparent dark:border-0">
          <PromptInputTools className="gap-2">
            <AttachmentsButton fileInputRef={fileInputRef} status={status} />
            <ModelSelectorCompact selectedModelId={selectedModelId} />
          </PromptInputTools>
          {status === 'submitted' ? (
            <StopButton stop={stop} setMessages={setMessages} />
          ) : (
            <PromptInputSubmit status={status} disabled={!input.trim() || uploadQueue.length > 0}
              className="p-3 text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300 dark:bg-sidebar-accent dark:hover:bg-sidebar-accent/80 dark:text-gray-300">
              <ArrowUpIcon size={20} />
            </PromptInputSubmit>
          )}
        </PromptInputToolbar>
      </PromptInput>
    </div>
  );
}

export const MultimodalInput = memo(PureMultimodalInput, (prevProps, nextProps) => {
  if (prevProps.input !== nextProps.input) return false;
  if (prevProps.status !== nextProps.status) return false;
  if (!equal(prevProps.attachments, nextProps.attachments)) return false;
  if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType) return false;
  if (prevProps.selectedModelId !== nextProps.selectedModelId) return false;
  return true;
});

function PureAttachmentsButton({ fileInputRef, status }: { fileInputRef: React.MutableRefObject<HTMLInputElement | null>; status: UseChatHelpers<ChatMessage>['status']; }) {
  return (
    <Button data-testid="attachments-button" className="rounded-md rounded-bl-lg p-[7px] h-fit dark:border-zinc-700 hover:dark:bg-zinc-900 hover:bg-zinc-200"
      onClick={(event) => { event.preventDefault(); fileInputRef.current?.click(); }} disabled={status !== 'ready'} variant="ghost">
      <PaperclipIcon size={14} />
    </Button>
  );
}
const AttachmentsButton = memo(PureAttachmentsButton);

function PureModelSelectorCompact({ selectedModelId }: { selectedModelId: string; }) {
  const [optimisticModelId, setOptimisticModelId] = useState(selectedModelId);
  const selectedModel = chatModels.find((model) => model.id === optimisticModelId);

  return (
    <PromptInputModelSelect value={selectedModel?.name} onValueChange={(modelName) => {
      const model = chatModels.find((m) => m.name === modelName);
      if (model) {
        setOptimisticModelId(model.id);
        startTransition(() => saveChatModelAsCookie(model.id));
      }
    }}>
      <PromptInputModelSelectTrigger type="button" className="text-xs focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:ring-0 data-[state=closed]:ring-0">
        {selectedModel?.name || '모델 선택'}
      </PromptInputModelSelectTrigger>
      <PromptInputModelSelectContent>
        {chatModels.map((model) => (
          <SelectItem key={model.id} value={model.name}>
            <div className="flex flex-col gap-1 items-start py-1">
              <div className="font-medium">{model.name}</div>
              <div className="text-xs text-muted-foreground">{model.description}</div>
            </div>
          </SelectItem>
        ))}
      </PromptInputModelSelectContent>
    </PromptInputModelSelect>
  );
}
const ModelSelectorCompact = memo(PureModelSelectorCompact);

function PureStopButton({ stop, setMessages }: { stop: () => void; setMessages: UseChatHelpers<ChatMessage>['setMessages']; }) {
  return

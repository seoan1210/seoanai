import { useSWRConfig } from 'swr';
import { useCopyToClipboard } from 'usehooks-ts';

import type { Vote } from '@/lib/db/schema';

import { CopyIcon, ThumbDownIcon, ThumbUpIcon, PencilEditIcon } from './icons';
import { Actions, Action } from './elements/actions';
import { memo } from 'react';
import equal from 'fast-deep-equal';
import { toast } from 'sonner';
import type { ChatMessage } from '@/lib/types';

export function PureMessageActions({
  chatId,
  message,
  vote,
  isLoading,
  setMode,
}: {
  chatId: string;
  message: ChatMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMode?: (mode: 'view' | 'edit') => void;
}) {
  const { mutate } = useSWRConfig();
  const [_, copyToClipboard] = useCopyToClipboard();

  if (isLoading) return null;

  const textFromParts = message.parts
    ?.filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('\n')
    .trim();

  const handleCopy = async () => {
    if (!textFromParts) {
      toast.error('복사할 내용이 없어요!');
      return;
    }

    await copyToClipboard(textFromParts);
    toast.success('클립보드에 복사했어요!');
  };

  // 사용자 메시지는 수정(호버 시) 및 복사 버튼이 보입니다.
  if (message.role === 'user') {
    return (
      <Actions className="-mr-0.5 justify-end">
        <div className="relative">
          {setMode && (
            <Action
              tooltip="수정"
              onClick={() => setMode('edit')}
              className="-left-10 absolute top-0 opacity-0 transition-opacity group-hover/message:opacity-100"
            >
              <PencilEditIcon />
            </Action>
          )}
          <Action tooltip="복사" onClick={handleCopy}>
            <CopyIcon />
          </Action>
        </div>
      </Actions>
    );
  }

  return (
    <Actions className="-ml-0.5">
      <Action tooltip="복사" onClick={handleCopy}>
        <CopyIcon />
      </Action>

      <Action
        tooltip="응답에 좋아요"
        data-testid="message-upvote"
        disabled={vote?.isUpvoted}
        onClick={async () => {
          const upvote = fetch('/api/vote', {
            method: 'PATCH',
            body: JSON.stringify({
              chatId,
              messageId: message.id,
              type: 'up',
            }),
          });

          toast.promise(upvote, {
            loading: '응답에 좋아요 누르는 중...',
            success: () => {
              mutate<Array<Vote>>(
                `/api/vote?chatId=${chatId}`,
                (currentVotes) => {
                  if (!currentVotes) return [];

                  const votesWithoutCurrent = currentVotes.filter(
                    (vote) => vote.messageId !== message.id,
                  );

                  return [
                    ...votesWithoutCurrent,
                    {
                      chatId,
                      messageId: message.id,
                      isUpvoted: true,
                    },
                  ];
                },
                { revalidate: false },
              );

              return '응답에 좋아요를 눌렀어요!';
            },
            error: '응답에 좋아요를 누르는 데 실패했어요.',
          });
        }}
      >
        <ThumbUpIcon />
      </Action>

      <Action
        tooltip="응답에 싫어요"
        data-testid="message-downvote"
        disabled={vote && !vote.isUpvoted}
        onClick={async () => {
          const downvote = fetch('/api/vote', {
            method: 'PATCH',
            body: JSON.stringify({
              chatId,
              messageId: message.id,
              type: 'down',
            }),
          });

          toast.promise(downvote, {
            loading: '응답에 싫어요 누르는 중...',
            success: () => {
              mutate<Array<Vote>>(
                `/api/vote?chatId=${chatId}`,
                (currentVotes) => {
                  if (!currentVotes) return [];

                  const votesWithoutCurrent = currentVotes.filter(
                    (vote) => vote.messageId !== message.id,
                  );

                  return [
                    ...votesWithoutCurrent,
                    {
                      chatId,
                      messageId: message.id,
                      isUpvoted: false,
                    },
                  ];
                },
                { revalidate: false },
              );

              return '응답에 싫어요를 눌렀어요.';
            },
            error: '응답에 싫어요를 누르는 데 실패했어요.',
          });
        }}
      >
        <ThumbDownIcon />
      </Action>
    </Actions>
  );
}

export const MessageActions = memo(
  PureMessageActions,
  (prevProps, nextProps) => {
    if (!equal(prevProps.vote, nextProps.vote)) return false;
    if (prevProps.isLoading !== nextProps.isLoading) return false;

    return true;
  },
);

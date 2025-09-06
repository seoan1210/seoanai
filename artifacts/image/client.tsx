'use client';

import { Artifact } from '@/components/create-artifact';
import { CopyIcon, RedoIcon, UndoIcon } from '@/components/icons';
import { ImageEditor } from '@/components/image-editor';
import { toast } from 'sonner';

/**
 * Image Artifact
 */
export const imageArtifact = new Artifact({
  kind: 'image',
  description: 'Grok AI를 사용해 이미지를 생성할 수 있습니다',
  content: ImageEditor,
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === 'data-imageDelta') {
      setArtifact((a) => ({
        ...a,
        content: streamPart.data,
        isVisible: true,
        status: 'streaming',
      }));
    }
  },
  actions: [
    {
      icon: <UndoIcon size={18} />,
      description: '이전 버전 보기',
      onClick: ({ handleVersionChange }) => handleVersionChange('prev'),
      isDisabled: ({ currentVersionIndex }) => currentVersionIndex === 0,
    },
    {
      icon: <RedoIcon size={18} />,
      description: '다음 버전 보기',
      onClick: ({ handleVersionChange }) => handleVersionChange('next'),
      isDisabled: ({ isCurrentVersion }) => isCurrentVersion,
    },
    {
      icon: <CopyIcon size={18} />,
      description: '복사',
      onClick: ({ content }) => {
        const img = new Image();
        img.src = `data:image/png;base64,${content}`;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          canvas.getContext('2d')?.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            toast.success('클립보드에 복사되었습니다');
          }, 'image/png');
        };
      },
    },
  ],
  toolbar: [],
});

/**
 * generateImage 외부 함수
 */
export const generateImage = async (prompt: string, setArtifact: any) => {
  try {
    setArtifact((a: any) => ({ ...a, status: 'loading' }));

    const res = await fetch('/api/grok-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!res.body) throw new Error('스트리밍 불가');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      chunk.split('\n').forEach((line) => {
        if (!line) return;
        try {
          const part = JSON.parse(line);
          if (part.type === 'data-imageDelta') {
            setArtifact((a: any) => ({
              ...a,
              content: part.data,
              isVisible: true,
              status: 'streaming',
            }));
          }
        } catch {}
      });
    }

    setArtifact((a: any) => ({ ...a, status: 'done' }));
  } catch (err) {
    console.error(err);
    toast.error('이미지 생성 실패');
    setArtifact((a: any) => ({ ...a, status: 'error' }));
  }
};

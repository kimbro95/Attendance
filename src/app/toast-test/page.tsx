'use client';

import { useToast } from '@/components/ui/use-toast';
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';

export default function ToastTestPage() {
  const { toast: showToast } = useToast();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">Toast 컴포넌트 테스트</h1>
      <p className="text-[rgb(var(--text-secondary))] mb-8">shadcn/ui Toast 타입별 테스트 페이지</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Default Toast */}
        <div className="p-6 rounded-lg bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border))]">
          <h2 className="text-xl font-semibold mb-3">Default</h2>
          <p className="text-[rgb(var(--text-secondary))] text-sm mb-4">기본 토스트 메시지</p>
          <button
            onClick={() =>
              showToast({
                title: 'Default Toast',
                description: '기본 토스트 메시지입니다.',
              })
            }
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Default 토스트 표시
          </button>
        </div>

        {/* Success Toast */}
        <div className="p-6 rounded-lg bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border))]">
          <h2 className="text-xl font-semibold mb-3">Success</h2>
          <p className="text-[rgb(var(--text-secondary))] text-sm mb-4">성공 메시지 토스트</p>
          <button
            onClick={() =>
              showToast({
                title: 'Success!',
                description: '성공적으로 완료되었습니다!',
                variant: 'success',
              })
            }
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
          >
            Success 토스트 표시
          </button>
        </div>

        {/* Destructive Toast */}
        <div className="p-6 rounded-lg bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border))]">
          <h2 className="text-xl font-semibold mb-3">Destructive</h2>
          <p className="text-[rgb(var(--text-secondary))] text-sm mb-4">에러 메시지 토스트</p>
          <button
            onClick={() =>
              showToast({
                title: 'Error',
                description: '오류가 발생했습니다!',
                variant: 'destructive',
              })
            }
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            Destructive 토스트 표시
          </button>
        </div>

        {/* Info Toast */}
        <div className="p-6 rounded-lg bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border))]">
          <h2 className="text-xl font-semibold mb-3">Info</h2>
          <p className="text-[rgb(var(--text-secondary))] text-sm mb-4">정보 메시지 토스트</p>
          <button
            onClick={() =>
              showToast({
                title: 'Information',
                description: '이것은 정보 메시지입니다.',
                variant: 'info',
              })
            }
            className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition-colors"
          >
            Info 토스트 표시
          </button>
        </div>

        {/* Toast with Action */}
        <div className="p-6 rounded-lg bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border))]">
          <h2 className="text-xl font-semibold mb-3">With Action</h2>
          <p className="text-[rgb(var(--text-secondary))] text-sm mb-4">액션 버튼이 포함된 토스트</p>
          <button
            onClick={() =>
              showToast({
                title: 'Schedule post',
                description: 'Friday, December 17 at 3:14 PM',
                action: (
                  <ToastAction altText="Undo">
                    <button className="text-xs font-medium">Undo</button>
                  </ToastAction>
                ),
              })
            }
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
          >
            Action 포함 토스트 표시
          </button>
        </div>

        {/* Destructive with Action */}
        <div className="p-6 rounded-lg bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border))]">
          <h2 className="text-xl font-semibold mb-3">Destructive + Action</h2>
          <p className="text-[rgb(var(--text-secondary))] text-sm mb-4">삭제 후 실행취소 가능</p>
          <button
            onClick={() =>
              showToast({
                title: 'Uh oh! Something went wrong.',
                description: 'There was a problem with your request.',
                variant: 'destructive',
                action: (
                  <ToastAction altText="Try again">
                    <button className="text-xs font-medium">Try again</button>
                  </ToastAction>
                ),
              })
            }
            className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors"
          >
            Destructive + Action 표시
          </button>
        </div>
      </div>

      {/* Information Box */}
      <div className="mt-12 p-6 rounded-lg bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border))]">
        <h2 className="text-xl font-semibold mb-3">사용 방법</h2>
        <pre className="bg-[rgb(var(--bg-primary))] p-4 rounded-md overflow-x-auto text-sm">
          {`import { useToast } from '@/components/ui/use-toast';

export default function MyComponent() {
  const { toast } = useToast();

  return (
    <button
      onClick={() =>
        toast({
          title: 'Title',
          description: 'Description',
          variant: 'default' | 'destructive' | 'success' | 'info',
          action: <ToastAction altText="Action">Action</ToastAction>,
        })
      }
    >
      Show Toast
    </button>
  );
}`}
        </pre>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useAtom } from 'jotai';
import { isAuthenticatedAtom, errorMessageAtom } from '@/store/atoms';
import { useRouter } from 'next/navigation';
import { verifyAdminCode, setAuthCookie, generateAuthToken } from '@/lib/auth';

export default function LoginPage() {
  const [code, setCode] = useState('');
  const [, setIsAuthenticated] = useAtom(isAuthenticatedAtom);
  const [, setError] = useAtom(errorMessageAtom);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (code.length !== 6) {
        setError('6자리 코드를 입력해주세요.');
        setIsLoading(false);
        return;
      }

      if (!verifyAdminCode(code)) {
        setError('올바르지 않은 코드입니다.');
        setIsLoading(false);
        return;
      }

      const token = generateAuthToken();
      setAuthCookie(token);
      setIsAuthenticated(true);

      // 약간의 딜레이 후 리다이렉트
      await new Promise((resolve) => setTimeout(resolve, 300));
      router.push('/dashboard');
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[rgb(var(--primary))] mb-2">
            📋
          </h1>
          <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))]">
            Attendance Manager
          </h2>
          <p className="text-[rgb(var(--text-secondary))] mt-2">
            관리자 인증
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
              관리자 코드 (6자리)
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              pattern="\d{6}"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, ''));
                setError(null);
              }}
              className="input w-full text-center text-2xl tracking-widest"
              placeholder="000000"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {/* 에러 메시지 - 별도로 표시 */}
          {code && code.length === 6 && (
            <div className="text-sm text-[rgb(var(--error))] text-center">
              입력한 코드: {code}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '인증 중...' : '로그인'}
          </button>
        </form>

        {/* 에러 메시지 표시 */}
        {code && (
          <div className="mt-4 p-3 bg-[rgb(var(--error))]/10 border border-[rgb(var(--error))]/30 rounded-lg">
            <p className="text-sm text-[rgb(var(--error))]">
              {code.length !== 6 ? `${6 - code.length}자리 더 입력하세요` : '입력 완료'}
            </p>
          </div>
        )}

        <div className="mt-6 p-4 bg-[rgb(var(--bg-tertiary))] rounded-lg">
          <p className="text-xs text-[rgb(var(--text-tertiary))]">
            💡 .env 파일에 설정된 6자리 관리자 코드를 입력하세요.
          </p>
        </div>
      </div>
    </div>
  );
}

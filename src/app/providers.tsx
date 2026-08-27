'use client';

import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { darkModeAtom, isAuthenticatedAtom } from '@/store/atoms';
import { getAuthCookie } from '@/lib/auth';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [, setDarkMode] = useAtom(darkModeAtom);
  const [, setIsAuthenticated] = useAtom(isAuthenticatedAtom);

  useEffect(() => {
    // 다크모드 설정 복원
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }

    // 인증 상태 복원
    const authToken = getAuthCookie();
    if (authToken) {
      setIsAuthenticated(true);
    }
  }, [setDarkMode, setIsAuthenticated]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

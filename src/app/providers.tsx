'use client';

import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { darkModeAtom, isAuthenticatedAtom } from '@/store/atoms';
import { getAuthCookie } from '@/lib/auth';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [, setDarkMode] = useAtom(darkModeAtom);
  const [, setIsAuthenticated] = useAtom(isAuthenticatedAtom);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // 다크모드 설정 복원 (기본값: true)
    const savedDarkMode = localStorage.getItem('darkMode');
    const isDarkMode = savedDarkMode === null ? true : savedDarkMode === 'true';
    setDarkMode(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }

    // 인증 상태 복원
    const authToken = getAuthCookie();
    setIsAuthenticated(!!authToken);

    setIsHydrated(true);
  }, []);

  if (!isHydrated) return children;

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

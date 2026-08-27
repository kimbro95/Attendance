'use client';

import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { isAuthenticatedAtom } from '@/store/atoms';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  return null;
}

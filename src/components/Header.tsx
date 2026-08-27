'use client';

import { useState } from 'react';
import { useAtom } from 'jotai';
import { darkModeAtom, isAuthenticatedAtom } from '@/store/atoms';
import { removeAuthCookie } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Header() {
  const [darkMode, setDarkMode] = useAtom(darkModeAtom);
  const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthenticatedAtom);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleDarkModeToggle = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(newMode));
  };

  const handleLogout = () => {
    removeAuthCookie();
    setIsAuthenticated(false);
    router.push('/login');
  };

  return (
    <header className="bg-[rgb(var(--bg-secondary))] border-b border-[rgb(var(--border))] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <h1 className="text-2xl font-bold text-[rgb(var(--primary))]">
              📋 Attendance
            </h1>
          </Link>

          {isAuthenticated && (
            <>
              <nav className="hidden md:flex gap-6">
                <Link
                  href="/dashboard"
                  className="text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--primary))] transition-colors"
                >
                  대시보드
                </Link>
                <Link
                  href="/events"
                  className="text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--primary))] transition-colors"
                >
                  일정
                </Link>
                <Link
                  href="/users"
                  className="text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--primary))] transition-colors"
                >
                  유저
                </Link>
              </nav>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg"
                title="메뉴"
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            </>
          )}

          <div className="flex items-center gap-4">
            <button
              onClick={handleDarkModeToggle}
              className="p-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors"
              title={darkMode ? '라이트모드' : '다크모드'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="btn-secondary"
              >
                로그아웃
              </button>
            )}
          </div>
        </div>

        {isAuthenticated && mobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              대시보드
            </Link>
            <Link
              href="/events"
              className="block px-4 py-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              일정
            </Link>
            <Link
              href="/users"
              className="block px-4 py-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              유저
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

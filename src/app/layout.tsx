import type { Metadata } from 'next';
import { Providers } from './providers';
import Header from '@/components/Header';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Attendance Manager - 출석 관리 및 통계',
  description: '팀 출석을 효율적으로 관리하고 통계를 시각화하는 웹 애플리케이션',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <Header />
          <main className="min-h-screen bg-[rgb(var(--bg-primary))]">
            {children}
          </main>
          <footer className="bg-[rgb(var(--bg-secondary))] border-t border-[rgb(var(--border))] mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <p className="text-center text-[rgb(var(--text-tertiary))] text-sm">
                © 2026 Attendance Manager. 출석 관리 및 통계 웹 서비스
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}

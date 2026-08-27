'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { isAuthenticatedAtom } from '@/store/atoms';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AttendanceStats } from '@/types';

interface UserAttendanceStats {
  user_id: string;
  user_name: string;
  attend_count: number;
}

async function fetchStats(): Promise<AttendanceStats[]> {
  const response = await fetch('/api/attendance/stats');
  if (!response.ok) throw new Error('통계 조회 실패');
  const json = await response.json();
  return json.data || [];
}

async function fetchUserAttendanceByYear(year: number): Promise<UserAttendanceStats[]> {
  const response = await fetch(`/api/attendance/by-year/${year}`);
  if (!response.ok) throw new Error('연도별 통계 조회 실패');
  const json = await response.json();
  return json.data || [];
}

export default function DashboardPage() {
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const currentYear = new Date().getFullYear();

  const { data: stats = [], isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
  });

  const { data: userAttendanceStats = [], isLoading: isLoadingUserStats } = useQuery({
    queryKey: ['userAttendanceByYear', currentYear],
    queryFn: () => fetchUserAttendanceByYear(currentYear),
  });

  const totalUsers = stats[0]?.total_users || 0;
  const overallAttendance = stats.length > 0
    ? Math.round(stats.reduce((sum, s) => sum + s.attend_count, 0) / (stats.length * totalUsers) * 100) || 0
    : 0;

  if (isAuthenticated === false) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">
          📊 대시보드
        </h1>
        <p className="text-[rgb(var(--text-secondary))]">
          출석 현황을 한눈에 확인하세요
        </p>
      </div>

      {/* 주요 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[rgb(var(--text-secondary))] text-sm font-medium">
                전체 회원
              </p>
              <p className="text-3xl font-bold text-[rgb(var(--primary))] mt-2">
                {totalUsers}
              </p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[rgb(var(--text-secondary))] text-sm font-medium">
                전체 일정
              </p>
              <p className="text-3xl font-bold text-[rgb(var(--secondary))] mt-2">
                {stats.length}
              </p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[rgb(var(--text-secondary))] text-sm font-medium">
                평균 출석률
              </p>
              <p className="text-3xl font-bold text-[rgb(var(--success))] mt-2">
                {overallAttendance}%
              </p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>
      </div>

      {/* 최근 일정 출석 현황 */}
      <div className="card">
        <h2 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-4">
          📝 최근 일정 출석 현황
        </h2>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-[rgb(var(--text-secondary))]">로딩 중...</p>
          </div>
        ) : stats.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[rgb(var(--text-secondary))] mb-4">
              아직 일정이 없습니다.
            </p>
            <Link href="/events" className="btn-primary inline-block">
              일정 추가하기
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {[...stats].sort((a, b) => b.attend_count - a.attend_count).map((stat) => (
              <div
                key={stat.event_id}
                className="bg-[rgb(var(--bg-tertiary))] rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between hover:bg-[rgb(var(--border-dark))] transition-colors"
              >
                <div className="flex-1 mb-4 md:mb-0">
                  <p className="font-medium text-[rgb(var(--text-primary))] text-sm md:text-base">
                    {stat.event_title}
                  </p>
                  <p className="text-xs md:text-sm text-[rgb(var(--text-secondary))] mt-1">
                    {new Date(stat.event_date).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 md:gap-6">
                  <div className="text-center">
                    <p className="text-lg md:text-2xl font-bold text-[rgb(var(--success))]">
                      {stat.attend_count}
                    </p>
                    <p className="text-xs text-[rgb(var(--text-tertiary))]">
                      참석
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-lg md:text-2xl font-bold text-[rgb(var(--error))]">
                      {stat.oppose_count}
                    </p>
                    <p className="text-xs text-[rgb(var(--text-tertiary))]">
                      불참
                    </p>
                  </div>

                  <div className="text-center min-w-[70px] md:min-w-[80px]">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--secondary))] flex items-center justify-center mx-auto mb-1">
                      <span className="text-white font-bold text-xs md:text-sm">
                        {stat.attend_percentage}%
                      </span>
                    </div>
                    <p className="text-xs text-[rgb(var(--text-tertiary))]">
                      출석률
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 연도별 사용자 참석 현황 */}
      <div className="card mt-8">
        <h2 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-4">
          👤 {currentYear}년 참석 현황
        </h2>

        {isLoadingUserStats ? (
          <div className="text-center py-8">
            <p className="text-[rgb(var(--text-secondary))]">로딩 중...</p>
          </div>
        ) : userAttendanceStats.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[rgb(var(--text-secondary))]">
              아직 참석 기록이 없습니다.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {userAttendanceStats.map((stat, index) => (
              <div
                key={stat.user_id}
                className="bg-[rgb(var(--bg-tertiary))] rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <p className="font-medium text-[rgb(var(--text-primary))]">
                    {stat.user_name}
                  </p>
                </div>
                <p className="text-lg font-bold text-[rgb(var(--success))]">
                  {stat.attend_count}회
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 빠른 액션 */}
      {stats.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/events"
            className="card hover:bg-[rgb(var(--bg-tertiary))] transition-colors cursor-pointer text-center py-8"
          >
            <div className="text-4xl mb-2">📅</div>
            <p className="font-medium text-[rgb(var(--text-primary))]">
              일정 관리
            </p>
            <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
              일정을 생성하고 출석을 관리하세요
            </p>
          </Link>

          <Link
            href="/users"
            className="card hover:bg-[rgb(var(--bg-tertiary))] transition-colors cursor-pointer text-center py-8"
          >
            <div className="text-4xl mb-2">👥</div>
            <p className="font-medium text-[rgb(var(--text-primary))]">
              유저 관리
            </p>
            <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
              팀 멤버를 추가하고 관리하세요
            </p>
          </Link>
        </div>
      )}
    </div>
  );
}

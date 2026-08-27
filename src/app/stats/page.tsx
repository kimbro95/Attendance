'use client';

import { useQuery } from '@tanstack/react-query';
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

export default function StatsPage() {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">
          📊 출석 현황
        </h1>
        <p className="text-[rgb(var(--text-secondary))]">
          팀의 출석 현황을 확인하세요
        </p>
      </div>

      {/* 전체 회원 통계 */}
      <div className="card mb-8">
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

      {/* 최근 일정 출석 현황 */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-4">
          📝 최근 일정 출석 현황
        </h2>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-[rgb(var(--text-secondary))]">로딩 중...</p>
          </div>
        ) : stats.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[rgb(var(--text-secondary))]">
              아직 일정이 없습니다.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...stats].sort((a, b) => b.attend_count - a.attend_count).map((stat) => (
              <div
                key={stat.event_id}
                className="bg-[rgb(var(--bg-tertiary))] rounded-lg p-4"
              >
                <p className="font-medium text-[rgb(var(--text-primary))] text-base mb-3">
                  {stat.event_title}
                </p>

                <div className="border-t border-b border-[rgb(var(--border))] py-3 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-6">
                      <div className="text-center">
                        <p className="text-lg font-bold text-[rgb(var(--success))]">
                          {stat.attend_count}
                        </p>
                        <p className="text-xs text-[rgb(var(--text-tertiary))]">
                          참석
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-lg font-bold text-[rgb(var(--error))]">
                          {stat.oppose_count}
                        </p>
                        <p className="text-xs text-[rgb(var(--text-tertiary))]">
                          불참
                        </p>
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--secondary))] flex items-center justify-center mb-1">
                        <span className="text-white font-bold text-xs">
                          {stat.attend_percentage}%
                        </span>
                      </div>
                      <p className="text-xs text-[rgb(var(--text-tertiary))]">
                        출석률
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-[rgb(var(--text-secondary))]">
                    {new Date(stat.event_date).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 현재 년도 참석 현황 */}
      <div className="card">
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

      {/* 하단 링크 */}
      <div className="mt-8 text-center">
        <Link
          href="/login"
          className="text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-dark))] font-medium"
        >
          관리자로 로그인하기 →
        </Link>
      </div>
    </div>
  );
}

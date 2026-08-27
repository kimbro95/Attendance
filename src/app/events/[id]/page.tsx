'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { isAuthenticatedAtom, errorMessageAtom } from '@/store/atoms';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { User, Attendance } from '@/types';

async function fetchEvent(id: string) {
  const response = await fetch(`/api/events/${id}`);
  if (!response.ok) throw new Error('일정 조회 실패');
  const json = await response.json();
  return json.data;
}

async function fetchUsers(): Promise<User[]> {
  const response = await fetch('/api/users');
  if (!response.ok) throw new Error('유저 조회 실패');
  const json = await response.json();
  return json.data || [];
}

async function fetchAttendance(eventId: string): Promise<Attendance[]> {
  const response = await fetch(`/api/attendance?eventId=${eventId}`);
  if (!response.ok) throw new Error('출석 조회 실패');
  const json = await response.json();
  return json.data || [];
}

async function updateAttendance(data: {
  event_id: string;
  user_id: string;
  status: 'ATTEND' | 'OPPOSE';
}): Promise<Attendance> {
  const response = await fetch('/api/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('출석 저장 실패');
  const json = await response.json();
  return json.data;
}

export default function EventDetailPage() {
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [, setError] = useAtom(errorMessageAtom);
  const router = useRouter();
  const params = useParams() as { id: string };
  const queryClient = useQueryClient();
  const eventId = params.id;

  const [selectAll, setSelectAll] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'ATTEND' | 'OPPOSE'>('ATTEND');
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'ATTEND' | 'OPPOSE' | undefined>>({});

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const { data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => fetchEvent(eventId),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const { data: attendanceData = [] } = useQuery({
    queryKey: ['attendance', eventId],
    queryFn: () => fetchAttendance(eventId),
  });

  useEffect(() => {
    const map: Record<string, 'ATTEND' | 'OPPOSE'> = {};
    attendanceData.forEach((a) => {
      map[a.user_id] = a.status;
    });
    setAttendanceMap(map);
  }, [attendanceData]);

  const updateMutation = useMutation({
    mutationFn: updateAttendance,
  });

  useEffect(() => {
    if (updateMutation.isSuccess) {
      queryClient.invalidateQueries({ queryKey: ['attendance', eventId] });
    }
  }, [updateMutation.isSuccess]);

  useEffect(() => {
    if (updateMutation.isError) {
      setError('출석 저장에 실패했습니다.');
    }
  }, [updateMutation.isError]);

  const handleToggle = (userId: string, status: 'ATTEND' | 'OPPOSE') => {
    const newStatus = attendanceMap[userId] === status ? undefined : status;

    if (newStatus) {
      updateMutation.mutate({
        event_id: eventId,
        user_id: userId,
        status: newStatus,
      });
      setAttendanceMap({ ...attendanceMap, [userId]: newStatus });
    } else {
      setAttendanceMap({ ...attendanceMap, [userId]: undefined });
    }
  };

  const handleSelectAll = () => {
    const newMap: Record<string, 'ATTEND' | 'OPPOSE'> = {};
    users.forEach((user) => {
      if (!selectAll) {
        newMap[user.id] = selectedStatus;
        updateMutation.mutate({
          event_id: eventId,
          user_id: user.id,
          status: selectedStatus,
        });
      }
    });
    if (selectAll) {
      setAttendanceMap({});
    } else {
      setAttendanceMap(newMap);
    }
    setSelectAll(!selectAll);
  };

  const attendCount = Object.values(attendanceMap).filter((s) => s === 'ATTEND').length;
  const opposeCount = Object.values(attendanceMap).filter((s) => s === 'OPPOSE').length;

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 헤더 */}
      <div className="mb-8">
        <Link href="/events" className="text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-dark))] text-sm font-medium mb-4 inline-block">
          ← 일정 목록으로 돌아가기
        </Link>

        <div className="card">
          <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">
            {event?.title}
          </h1>
          <p className="text-[rgb(var(--text-secondary))]">
            {event?.event_date
              ? new Date(event.event_date).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : ''}
          </p>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <p className="text-[rgb(var(--text-secondary))] text-sm">전체</p>
          <p className="text-3xl font-bold text-[rgb(var(--text-primary))] mt-2">
            {users.length}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-[rgb(var(--text-secondary))] text-sm">참석</p>
          <p className="text-3xl font-bold text-[rgb(var(--success))] mt-2">
            {attendCount}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-[rgb(var(--text-secondary))] text-sm">불참</p>
          <p className="text-3xl font-bold text-[rgb(var(--error))] mt-2">
            {opposeCount}
          </p>
        </div>
      </div>

      {/* 일괄 체크 */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-4">
          🎯 일괄 체크
        </h2>

        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
              상태 선택
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'ATTEND' | 'OPPOSE')}
              className="input w-full"
            >
              <option value="ATTEND">✅ 참석</option>
              <option value="OPPOSE">❌ 불참</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSelectAll}
              className="btn-primary"
              disabled={updateMutation.isPending}
            >
              {selectAll ? '모두 해제' : '모두 선택'}
            </button>
          </div>
        </div>

        <p className="text-sm text-[rgb(var(--text-secondary))]">
          선택한 상태로 모든 유저를 한번에 체크할 수 있습니다.
        </p>
      </div>

      {/* 유저 목록 */}
      <div className="card">
        <h2 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-4">
          👥 유저별 출석 체크
        </h2>

        {users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[rgb(var(--text-secondary))] mb-4">
              등록된 유저가 없습니다.
            </p>
            <Link href="/users" className="btn-primary inline-block">
              유저 추가하기
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-[rgb(var(--bg-tertiary))] rounded-lg p-4 flex items-center justify-between hover:bg-[rgb(var(--border-dark))] transition-colors"
              >
                <div>
                  <p className="font-medium text-[rgb(var(--text-primary))]">
                    {user.name}
                  </p>
                  {user.email && (
                    <p className="text-sm text-[rgb(var(--text-secondary))]">
                      {user.email}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggle(user.id, 'ATTEND')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      attendanceMap[user.id] === 'ATTEND'
                        ? 'bg-[rgb(var(--success))] text-white'
                        : 'bg-[rgb(var(--bg-primary))] text-[rgb(var(--text-primary))] border border-[rgb(var(--border))]'
                    }`}
                    disabled={updateMutation.isPending}
                  >
                    ✅ 참석
                  </button>

                  <button
                    onClick={() => handleToggle(user.id, 'OPPOSE')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      attendanceMap[user.id] === 'OPPOSE'
                        ? 'bg-[rgb(var(--error))] text-white'
                        : 'bg-[rgb(var(--bg-primary))] text-[rgb(var(--text-primary))] border border-[rgb(var(--border))]'
                    }`}
                    disabled={updateMutation.isPending}
                  >
                    ❌ 불참
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { isAuthenticatedAtom, errorMessageAtom } from '@/store/atoms';
import { useRouter } from 'next/navigation';
import { Event } from '@/types';

async function fetchEvents(): Promise<Event[]> {
  const response = await fetch('/api/events');
  if (!response.ok) throw new Error('일정 조회 실패');
  const json = await response.json();
  return json.data || [];
}

async function createEvent(data: { title: string; event_date: string }): Promise<Event> {
  const response = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('일정 생성 실패');
  const json = await response.json();
  return json.data;
}

async function deleteEvent(id: string): Promise<void> {
  const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('일정 삭제 실패');
}

export default function EventsPage() {
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [, setError] = useAtom(errorMessageAtom);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', event_date: '' });
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated === false) router.push('/login');
  }, [isAuthenticated, router]);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  });

  const createMutation = useMutation({
    mutationFn: createEvent,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
  });

  useEffect(() => {
    if (createMutation.isSuccess) {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setFormData({ title: '', event_date: '' });
      setShowForm(false);
      createMutation.reset();
    }
  }, [createMutation.isSuccess]);

  useEffect(() => {
    if (deleteMutation.isSuccess) {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      deleteMutation.reset();
    }
  }, [deleteMutation.isSuccess]);

  useEffect(() => {
    if (createMutation.isError) {
      setError('일정 생성에 실패했습니다.');
    }
  }, [createMutation.isError]);

  useEffect(() => {
    if (deleteMutation.isError) {
      setError('일정 삭제에 실패했습니다.');
    }
  }, [deleteMutation.isError]);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.event_date) {
      setError('모든 필드를 입력해주세요.');
      return;
    }
    createMutation.mutate(formData);
  };

  if (isAuthenticated === false) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">
            📅 일정 관리
          </h1>
          <p className="text-[rgb(var(--text-secondary))]">
            일정을 생성하고 출석을 일괄 체크하세요
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? '취소' : '+ 새 일정'}
        </button>
      </div>

      {/* 일정 생성 폼 */}
      {showForm && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-4">
            새 일정 생성
          </h2>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                제목
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input w-full"
                placeholder="예: 2026년 1월 팀 미팅"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                일정
              </label>
              <input
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                className="input w-full"
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1" disabled={createMutation.isPending}>
                {createMutation.isPending ? '생성 중...' : '일정 생성'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary flex-1"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 일정 목록 */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="card text-center py-8">
            <p className="text-[rgb(var(--text-secondary))]">로딩 중...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-[rgb(var(--text-secondary))] mb-4">
              아직 일정이 없습니다.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              첫 일정 생성하기
            </button>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className={`card cursor-pointer transition-all hover:bg-[rgb(var(--bg-tertiary))] ${
                selectedEvent === event.id ? 'ring-2 ring-[rgb(var(--primary))]' : ''
              }`}
              onClick={() => setSelectedEvent(selectedEvent === event.id ? null : event.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[rgb(var(--text-primary))]">
                    {event.title}
                  </h3>
                  <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
                    {new Date(event.event_date).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`/events/${event.id}`}
                    className="btn-secondary"
                    onClick={(e) => e.stopPropagation()}
                  >
                    출석 체크
                  </a>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('정말 삭제하시겠습니까?')) {
                        deleteMutation.mutate(event.id);
                      }
                    }}
                    className="btn-danger"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

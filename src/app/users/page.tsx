'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { isAuthenticatedAtom, errorMessageAtom } from '@/store/atoms';
import { useRouter } from 'next/navigation';
import { User } from '@/types';

async function fetchUsers(): Promise<User[]> {
  const response = await fetch('/api/users');
  if (!response.ok) throw new Error('유저 조회 실패');
  const json = await response.json();
  return json.data || [];
}

async function createUser(data: { name: string; email?: string }): Promise<User> {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('유저 생성 실패');
  const json = await response.json();
  return json.data;
}

async function updateUser(id: string, data: { name?: string; email?: string }): Promise<User> {
  const response = await fetch(`/api/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('유저 수정 실패');
  const json = await response.json();
  return json.data;
}

async function deleteUser(id: string): Promise<void> {
  const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('유저 삭제 실패');
}

export default function UsersPage() {
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [, setError] = useAtom(errorMessageAtom);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '' });

  useEffect(() => {
    if (isAuthenticated === false) router.push('/login');
  }, [isAuthenticated, router]);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; email?: string }) => createUser(data),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; name?: string; email?: string }) =>
      updateUser(data.id, { name: data.name, email: data.email }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
  });

  useEffect(() => {
    if (createMutation.isSuccess) {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setFormData({ name: '', email: '' });
      setShowForm(false);
      createMutation.reset();
    }
  }, [createMutation.isSuccess]);

  useEffect(() => {
    if (updateMutation.isSuccess) {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setFormData({ name: '', email: '' });
      setEditingId(null);
      updateMutation.reset();
    }
  }, [updateMutation.isSuccess]);

  useEffect(() => {
    if (deleteMutation.isSuccess) {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      deleteMutation.reset();
    }
  }, [deleteMutation.isSuccess]);

  useEffect(() => {
    if (createMutation.isError) {
      setError('유저 생성에 실패했습니다.');
    }
  }, [createMutation.isError]);

  useEffect(() => {
    if (updateMutation.isError) {
      setError('유저 수정에 실패했습니다.');
    }
  }, [updateMutation.isError]);

  useEffect(() => {
    if (deleteMutation.isError) {
      setError('유저 삭제에 실패했습니다.');
    }
  }, [deleteMutation.isError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('이름은 필수입니다.');
      return;
    }

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        name: formData.name,
        email: formData.email || undefined,
      });
    } else {
      createMutation.mutate({
        name: formData.name,
        email: formData.email || undefined,
      });
    }
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setFormData({ name: user.name, email: user.email || '' });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', email: '' });
  };

  if (isAuthenticated === false) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">
            👥 유저 관리
          </h1>
          <p className="text-[rgb(var(--text-secondary))]">
            팀 멤버를 추가하고 관리하세요
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (editingId) handleCancel();
          }}
          className="btn-primary"
        >
          {showForm ? '취소' : '+ 새 유저'}
        </button>
      </div>

      {/* 유저 생성/수정 폼 */}
      {showForm && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-4">
            {editingId ? '유저 정보 수정' : '새 유저 추가'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                이름 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input w-full"
                placeholder="예: 김철수"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                이메일 (선택)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input w-full"
                placeholder="예: kim@example.com"
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending
                  ? editingId
                    ? '수정 중...'
                    : '추가 중...'
                  : editingId
                    ? '수정 완료'
                    : '유저 추가'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary flex-1"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 유저 목록 */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="card text-center py-8">
            <p className="text-[rgb(var(--text-secondary))]">로딩 중...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-[rgb(var(--text-secondary))] mb-4">
              등록된 유저가 없습니다.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              첫 유저 추가하기
            </button>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="card flex items-center justify-between hover:bg-[rgb(var(--bg-tertiary))] transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-[rgb(var(--text-primary))]">
                  {user.name}
                </p>
                {user.email && (
                  <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
                    {user.email}
                  </p>
                )}
                <p className="text-xs text-[rgb(var(--text-tertiary))] mt-2">
                  {new Date(user.created_at).toLocaleDateString('ko-KR')}에 추가됨
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(user)}
                  className="btn-secondary"
                  disabled={updateMutation.isPending}
                >
                  수정
                </button>
                <button
                  onClick={() => {
                    if (confirm('정말 삭제하시겠습니까?')) {
                      deleteMutation.mutate(user.id);
                    }
                  }}
                  className="btn-danger"
                  disabled={deleteMutation.isPending}
                >
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 통계 */}
      {users.length > 0 && (
        <div className="mt-8 card">
          <p className="text-[rgb(var(--text-secondary))]">
            총 <span className="font-bold text-[rgb(var(--primary))]">{users.length}</span>명의 유저가 등록되어 있습니다.
          </p>
        </div>
      )}
    </div>
  );
}

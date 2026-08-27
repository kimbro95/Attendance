// 유저 타입
export interface User {
  id: string;
  name: string;
  email?: string;
  created_at: string;
  updated_at?: string;
}

// 일정 타입
export interface Event {
  id: string;
  title: string;
  event_date: string;
  created_at: string;
  updated_at?: string;
}

// 출석 상태
export type AttendanceStatus = 'ATTEND' | 'OPPOSE';

// 출석 기록
export interface Attendance {
  id: string;
  event_id: string;
  user_id: string;
  status: AttendanceStatus;
  created_at: string;
  updated_at?: string;
}

// 출석 통계
export interface AttendanceStats {
  event_id: string;
  event_title: string;
  event_date: string;
  total_users: number;
  attend_count: number;
  oppose_count: number;
  attend_percentage: number;
}

// API 응답
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

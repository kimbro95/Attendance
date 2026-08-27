import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ApiResponse, AttendanceStats } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<AttendanceStats[]>>> {
  try {
    const eventId = request.nextUrl.searchParams.get('eventId');

    // 모든 사용자 수 조회
    const { data: usersData } = await supabase.from('users').select('id');
    const totalUsers = usersData?.length || 0;

    // 출석 데이터 조회
    let attendanceQuery = supabase
      .from('attendance')
      .select('event_id, status');

    if (eventId) {
      attendanceQuery = attendanceQuery.eq('event_id', eventId);
    }

    const { data: attendanceData } = await attendanceQuery;

    // 일정 데이터 조회
    let eventsQuery = supabase
      .from('events')
      .select('id, title, event_date');

    if (eventId) {
      eventsQuery = eventsQuery.eq('id', eventId);
    }

    const { data: eventsData } = await eventsQuery.order('event_date', { ascending: false });

    if (!eventsData || !attendanceData) {
      return NextResponse.json(
        { success: false, error: '데이터를 조회할 수 없습니다.' },
        { status: 500 }
      );
    }

    // 통계 계산
    const stats: AttendanceStats[] = eventsData.map((event) => {
      const eventAttendance = attendanceData.filter((a) => a.event_id === event.id);
      const attendCount = eventAttendance.filter((a) => a.status === 'ATTEND').length;
      const opposeCount = eventAttendance.filter((a) => a.status === 'OPPOSE').length;
      const attendPercentage = totalUsers > 0 ? Math.round((attendCount / totalUsers) * 100) : 0;

      return {
        event_id: event.id,
        event_title: event.title,
        event_date: event.event_date,
        total_users: totalUsers,
        attend_count: attendCount,
        oppose_count: opposeCount,
        attend_percentage: attendPercentage,
      };
    });

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

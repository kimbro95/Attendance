import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ApiResponse } from '@/types';

interface UserAttendanceStats {
  user_id: string;
  user_name: string;
  attend_count: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { year: string } }
): Promise<NextResponse<ApiResponse<UserAttendanceStats[]>>> {
  try {
    const year = parseInt(params.year);

    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, event_date')
      .gte('event_date', `${year}-01-01`)
      .lt('event_date', `${year + 1}-01-01`);

    if (eventsError) {
      return NextResponse.json(
        { success: false, error: eventsError.message },
        { status: 500 }
      );
    }

    const eventIds = events?.map((e) => e.id) || [];

    if (eventIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance')
      .select('user_id, status')
      .in('event_id', eventIds)
      .eq('status', 'ATTEND');

    if (attendanceError) {
      return NextResponse.json(
        { success: false, error: attendanceError.message },
        { status: 500 }
      );
    }

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name');

    if (usersError) {
      return NextResponse.json(
        { success: false, error: usersError.message },
        { status: 500 }
      );
    }

    const userMap = new Map(users?.map((u) => [u.id, u.name]) || []);
    const attendanceByUser = new Map<string, number>();

    attendance?.forEach((a) => {
      attendanceByUser.set(a.user_id, (attendanceByUser.get(a.user_id) || 0) + 1);
    });

    const stats: UserAttendanceStats[] = Array.from(attendanceByUser.entries())
      .map(([userId, count]) => ({
        user_id: userId,
        user_name: userMap.get(userId) || 'Unknown',
        attend_count: count,
      }))
      .sort((a, b) => b.attend_count - a.attend_count);

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

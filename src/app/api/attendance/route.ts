import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ApiResponse, Attendance } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Attendance[]>>> {
  try {
    const eventId = request.nextUrl.searchParams.get('eventId');

    let query = supabase.from('attendance').select('*');

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Attendance>>> {
  try {
    const body = await request.json();
    const { event_id, user_id, status } = body;

    if (!event_id || !user_id || !status) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    if (!['ATTEND', 'OPPOSE'].includes(status)) {
      return NextResponse.json(
        { success: false, error: '올바르지 않은 상태입니다.' },
        { status: 400 }
      );
    }

    // 기존 출석 기록 확인
    const { data: existing } = await supabase
      .from('attendance')
      .select('id')
      .eq('event_id', event_id)
      .eq('user_id', user_id)
      .single();

    if (existing) {
      // 기존 기록 업데이트
      const { data, error } = await supabase
        .from('attendance')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, data });
    } else {
      // 새로운 기록 생성
      const { data, error } = await supabase
        .from('attendance')
        .insert([{ event_id, user_id, status }])
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, data }, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

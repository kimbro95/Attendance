import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ApiResponse, Event } from '@/types';

export async function GET(): Promise<NextResponse<ApiResponse<Event[]>>> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false });

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

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Event>>> {
  try {
    const body = await request.json();
    const { title, event_date } = body;

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '제목은 필수입니다.' },
        { status: 400 }
      );
    }

    if (!event_date) {
      return NextResponse.json(
        { success: false, error: '일정은 필수입니다.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('events')
      .insert([{ title, event_date }])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

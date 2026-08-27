import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ApiResponse, User } from '@/types';

export async function GET(): Promise<NextResponse<ApiResponse<User[]>>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

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

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<User>>> {
  try {
    const body = await request.json();
    const { name, created_at } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '이름은 필수입니다.' },
        { status: 400 }
      );
    }

    if (!created_at) {
      return NextResponse.json(
        { success: false, error: '가입일은 필수입니다.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{ name, created_at }])
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

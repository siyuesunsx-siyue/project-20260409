import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { valid: false, error: '缺少用户ID' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('users')
      .select('id, username')
      .eq('id', parseInt(user_id, 10))
      .single();

    if (error || !data) {
      return NextResponse.json({ valid: false });
    }

    return NextResponse.json({ valid: true, user: data });
  } catch {
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}

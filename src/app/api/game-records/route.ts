import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDrizzleDb } from '@/lib/db';
import { gameRecords, users } from '@/storage/database/shared/schema';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, scenario, final_score, result } = body;

    // 优先使用请求体中的 user_id（跨域场景），否则使用 cookie
    const userId = user_id || request.cookies.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: '未登录，请先登录', saved: false },
        { status: 401 }
      );
    }

    // 验证必填字段
    if (!scenario || final_score === undefined || !result) {
      return NextResponse.json(
        { error: '缺少必要字段', saved: false },
        { status: 400 }
      );
    }

    // 验证 result 值
    if (result !== 'success' && result !== 'failure') {
      return NextResponse.json(
        { error: '结果值无效', saved: false },
        { status: 400 }
      );
    }

    const uid = parseInt(String(userId), 10);
    if (Number.isNaN(uid)) {
      return NextResponse.json(
        { error: '用户 ID 无效', saved: false },
        { status: 400 }
      );
    }

    const db = getDrizzleDb();

    // 若配置了 DATABASE_URL，优先直连 Postgres 写入，避免 Supabase anon 被 RLS 拒绝
    if (db) {
      const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, uid))
        .limit(1);

      if (existing) {
        const playedAt = new Date().toISOString();
        const [row] = await db
          .insert(gameRecords)
          .values({
            userId: uid,
            scenario,
            finalScore: final_score,
            result,
            playedAt,
          })
          .returning();

        console.log('练习记录保存成功 (直连):', row?.id);
        return NextResponse.json({
          success: true,
          saved: true,
          record: row,
        });
      }
      console.warn(
        '直连库中未找到用户，尝试 Supabase。若仍失败，请确认 DATABASE_URL 与 Supabase 是否同一数据库，或配置 COZE_SUPABASE_SERVICE_ROLE_KEY。'
      );
    }

    const client = getSupabaseClient();
    const { data: userData, error: userError } = await client
      .from('users')
      .select('id, username')
      .eq('id', uid)
      .single();

    if (userError || !userData) {
      console.error('用户验证失败:', userError);
      return NextResponse.json(
        { error: '用户验证失败，请重新登录', saved: false },
        { status: 401 }
      );
    }

    const { data, error } = await client
      .from('game_records')
      .insert({
        user_id: uid,
        scenario,
        final_score,
        result,
        played_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('保存练习记录失败:', error);
      throw new Error(`保存练习记录失败: ${error.message}`);
    }

    console.log('练习记录保存成功:', data);
    return NextResponse.json({
      success: true,
      saved: true,
      record: data,
    });
  } catch (error) {
    console.error('保存练习记录失败:', error);
    return NextResponse.json(
      { error: '保存失败，请稍后重试', saved: false },
      { status: 500 }
    );
  }
}

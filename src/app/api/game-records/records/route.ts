import { NextRequest, NextResponse } from 'next/server';
import { count as sqlCount, desc, eq } from 'drizzle-orm';
import { getDrizzleDb } from '@/lib/db';
import { gameRecords } from '@/storage/database/shared/schema';
import { getSupabaseClient } from '@/storage/database/supabase-client';

function toApiRecord(r: {
  id: number;
  scenario: string;
  finalScore: number;
  result: string;
  playedAt: string;
}) {
  return {
    id: r.id,
    scenario: r.scenario,
    final_score: r.finalScore,
    result: r.result,
    played_at: r.playedAt,
  };
}

export async function GET(request: NextRequest) {
  try {
    // 优先使用查询参数中的 user_id（嵌入式页面场景），其次使用 cookie
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || request.cookies.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: '未登录，请先登录' },
        { status: 401 }
      );
    }

    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const offset = (page - 1) * pageSize;
    const uid = parseInt(userId, 10);

    const db = getDrizzleDb();

    // 与 POST 保存一致：直连读库，避免 Supabase anon 被 RLS 拒绝导致列表为空
    if (db) {
      const [totalRow] = await db
        .select({ value: sqlCount() })
        .from(gameRecords)
        .where(eq(gameRecords.userId, uid));

      const total = Number(totalRow?.value ?? 0);

      const rows = await db
        .select()
        .from(gameRecords)
        .where(eq(gameRecords.userId, uid))
        .orderBy(desc(gameRecords.playedAt))
        .limit(pageSize)
        .offset(offset);

      const statsRows = await db
        .select({ result: gameRecords.result })
        .from(gameRecords)
        .where(eq(gameRecords.userId, uid));

      const successCount = statsRows.filter((r) => r.result === 'success').length;
      const failureCount = statsRows.filter((r) => r.result === 'failure').length;

      return NextResponse.json({
        success: true,
        records: rows.map(toApiRecord),
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize) || 0,
        },
        stats: {
          successCount,
          failureCount,
          totalCount: statsRows.length,
        },
      });
    }

    const client = getSupabaseClient();

    const { data: records, error, count } = await client
      .from('game_records')
      .select('*', { count: 'exact' })
      .eq('user_id', uid)
      .order('played_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw new Error(`查询练习记录失败: ${error.message}`);
    }

    const { data: stats, error: statsError } = await client
      .from('game_records')
      .select('result')
      .eq('user_id', uid);

    if (statsError) {
      throw new Error(`查询统计数据失败: ${statsError.message}`);
    }

    const successCount = stats?.filter((r) => r.result === 'success').length || 0;
    const failureCount = stats?.filter((r) => r.result === 'failure').length || 0;

    return NextResponse.json({
      success: true,
      records: records || [],
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
      stats: {
        successCount,
        failureCount,
        totalCount: stats?.length || 0,
      },
    });
  } catch (error) {
    console.error('查询练习记录失败:', error);
    return NextResponse.json(
      { error: '查询失败，请稍后重试' },
      { status: 500 }
    );
  }
}

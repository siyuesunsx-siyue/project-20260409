import { NextRequest, NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { getDrizzleDb } from '@/lib/db';
import { gameRecords, users } from '@/storage/database/shared/schema';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const db = getDrizzleDb();

    let data: Array<{
      user_id: number;
      final_score: number;
      played_at: string;
      result: string;
      username: string;
    }> = [];

    if (db) {
      const rows = await db
        .select({
          user_id: gameRecords.userId,
          final_score: gameRecords.finalScore,
          played_at: gameRecords.playedAt,
          result: gameRecords.result,
          username: users.username,
        })
        .from(gameRecords)
        .innerJoin(users, eq(gameRecords.userId, users.id))
        .orderBy(desc(gameRecords.finalScore))
        .limit(100);

      data = rows.map((r) => ({
        user_id: r.user_id,
        final_score: r.final_score,
        played_at: r.played_at,
        result: r.result,
        username: r.username,
      }));
    } else {
      const client = getSupabaseClient();

      const { data: supabaseData, error } = await client
        .from('game_records')
        .select(
          `
        id,
        final_score,
        result,
        played_at,
        user_id,
        users (
          id,
          username
        )
      `
        )
        .order('final_score', { ascending: false })
        .limit(100);

      if (error) {
        console.error('查询排行榜失败:', error);
        throw new Error(`查询排行榜失败: ${error.message}`);
      }

      for (const record of supabaseData || []) {
        const usersData = record.users as
          | { id: number; username: string }
          | { id: number; username: string }[]
          | null;
        const username = Array.isArray(usersData)
          ? (usersData[0]?.username || '匿名用户')
          : (usersData?.username || '匿名用户');
        data.push({
          user_id: record.user_id,
          final_score: record.final_score,
          played_at: record.played_at,
          result: record.result,
          username,
        });
      }
    }

    const userBestScores = new Map<
      number,
      {
        user_id: number;
        username: string;
        best_score: number;
        achieved_at: string;
        result: string;
      }
    >();

    for (const record of data) {
      const userId = record.user_id;
      if (!userBestScores.has(userId)) {
        userBestScores.set(userId, {
          user_id: userId,
          username: record.username,
          best_score: record.final_score,
          achieved_at: record.played_at,
          result: record.result,
        });
      }
    }

    const leaderboard = Array.from(userBestScores.values())
      .sort((a, b) => b.best_score - a.best_score)
      .slice(0, 20)
      .map((item, index) => ({
        rank: index + 1,
        ...item,
      }));

    return NextResponse.json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error('获取排行榜失败:', error);
    return NextResponse.json(
      { error: '获取排行榜失败，请稍后重试' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET() {
  try {
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`查询失败: ${error.message}`);
    }

    return NextResponse.json({ posts: data || [] });
  } catch (error) {
    console.error('获取博客文章列表失败:', error);
    return NextResponse.json(
      { error: '获取文章列表失败' },
      { status: 500 }
    );
  }
}

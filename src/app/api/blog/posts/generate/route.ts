import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: `你是一位经验丰富的夫妻关系咨询师，擅长用轻松幽默的方式分享夫妻沟通技巧。
你的文章风格：
1. 语言轻松幽默，避免说教
2. 多用生活化的例子和比喻
3. 偶尔加入一些自嘲或调侃
4. 内容实用，易于理解
5. 字数控制在400-600字

请生成一篇关于夫妻沟通技巧的文章。文章结构：
- 开头：用幽默的方式引出话题
- 中间：2-3个实用的技巧或建议
- 结尾：用轻松的口吻鼓励读者

请以JSON格式返回，包含以下字段：
{
  "title": "文章标题（20字以内）",
  "summary": "文章摘要（50字以内）",
  "content": "文章完整内容"
}`,
      },
      {
        role: 'user',
        content: '请生成一篇关于夫妻沟通技巧的文章。',
      },
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-2-0-mini-260215',
      temperature: 0.8,
    });

    let articleData;
    try {
      // 尝试解析JSON响应
      articleData = JSON.parse(response.content);
    } catch {
      // 如果解析失败，创建一个简单的文章
      articleData = {
        title: '夫妻沟通小技巧',
        summary: '简单实用的沟通建议',
        content: response.content,
      };
    }

    // 验证必填字段
    if (!articleData.title || !articleData.content) {
      throw new Error('生成的文章缺少必要字段');
    }

    // 保存到数据库
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('blog_posts')
      .insert({
        title: articleData.title,
        summary: articleData.summary || '',
        content: articleData.content,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`保存文章失败: ${error.message}`);
    }

    // 计算阅读时间
    const readTime = Math.ceil(articleData.content.length / 500);

    return NextResponse.json({
      success: true,
      post: {
        ...data,
        read_time: readTime,
      },
    });
  } catch (error) {
    console.error('生成博客文章失败:', error);
    return NextResponse.json(
      { error: '生成文章失败，请稍后重试' },
      { status: 500 }
    );
  }
}

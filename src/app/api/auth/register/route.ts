import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { getDrizzleDb } from '@/lib/db';
import { users } from '@/storage/database/shared/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 验证输入
    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 50) {
      return NextResponse.json(
        { error: '用户名长度必须在3-50个字符之间' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少6个字符' },
        { status: 400 }
      );
    }

    const db = getDrizzleDb();
    if (!db) {
      throw new Error('DATABASE_URL is not set');
    }

    // 检查用户名是否已存在
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { error: '用户名已存在' },
        { status: 409 }
      );
    }

    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        username: users.username,
        createdAt: users.createdAt,
      });

    if (!newUser) {
      throw new Error('注册失败: 用户创建失败');
    }

    // 设置 cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
      },
    });

    response.cookies.set('user_id', String(newUser.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30天
    });

    response.cookies.set('username', username, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30天
    });

    return response;
  } catch (error) {
    console.error('注册失败:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}

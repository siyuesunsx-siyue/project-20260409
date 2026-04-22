import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDrizzleDb } from '@/lib/db';
import { users } from '@/storage/database/shared/schema';

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

    const db = getDrizzleDb();
    if (!db) {
      return NextResponse.json({ valid: false });
    }

    const uid = parseInt(user_id, 10);
    if (Number.isNaN(uid)) {
      return NextResponse.json({ valid: false });
    }

    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
      })
      .from(users)
      .where(eq(users.id, uid))
      .limit(1);

    if (!user) {
      return NextResponse.json({ valid: false });
    }

    return NextResponse.json({ valid: true, user });
  } catch {
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}

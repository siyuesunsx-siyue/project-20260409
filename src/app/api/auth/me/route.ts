import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDrizzleDb } from '@/lib/db';
import { users } from '@/storage/database/shared/schema';

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('user_id')?.value;
    const username = request.cookies.get('username')?.value;

    if (!userId || !username) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      );
    }

    const db = getDrizzleDb();
    if (!db) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      );
    }

    const uid = parseInt(userId, 10);
    if (Number.isNaN(uid)) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      );
    }

    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
      })
      .from(users)
      .where(eq(users.id, uid))
      .limit(1);

    if (!user || user.username !== username) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch {
    return NextResponse.json(
      { user: null },
      { status: 200 }
    );
  }
}

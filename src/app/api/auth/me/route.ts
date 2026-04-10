import { NextRequest, NextResponse } from 'next/server';

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

    return NextResponse.json({
      user: {
        id: parseInt(userId, 10),
        username,
      },
    });
  } catch {
    return NextResponse.json(
      { user: null },
      { status: 200 }
    );
  }
}

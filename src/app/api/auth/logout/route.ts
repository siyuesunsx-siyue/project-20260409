import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: '已退出登录',
  });

  // 清除 cookies
  response.cookies.delete('user_id');
  response.cookies.delete('username');

  return response;
}

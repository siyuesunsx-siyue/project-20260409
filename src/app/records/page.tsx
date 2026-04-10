'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, TrendingUp, Calendar } from 'lucide-react';
import Link from 'next/link';

interface GameRecord {
  id: number;
  scenario: string;
  final_score: number;
  result: 'success' | 'failure';
  played_at: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface Stats {
  successCount: number;
  failureCount: number;
  totalCount: number;
}

export default function RecordsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取练习记录
  const fetchRecords = async (page = 1) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // 添加 user_id 作为查询参数（嵌入式页面场景），同时保留 cookie
      const url = `/api/game-records/records?page=${page}&pageSize=10&user_id=${user.id}`;
      const response = await fetch(url, {
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '获取记录失败');
      }

      setRecords(data.records);
      setPagination(data.pagination);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取记录失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 获取结果徽章颜色
  const getResultBadgeClass = (result: string) => {
    return result === 'success'
      ? 'bg-green-100 text-green-800 border-green-300'
      : 'bg-red-100 text-red-800 border-red-300';
  };

  // 加载状态
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⏳</div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // 未登录状态
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">请先登录</h2>
            <p className="text-gray-600 mb-6">登录后即可查看您的练习记录</p>
            <div className="flex gap-3 justify-center">
              <Link href="/login">
                <Button>登录</Button>
              </Link>
              <Link href="/register">
                <Button variant="outline">注册</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>返回首页</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-8 max-w-4xl py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">我的练习记录</h1>

        {/* 统计卡片 */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">{stats.successCount}</div>
                <div className="text-xs text-gray-600">通关次数</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-red-600">{stats.failureCount}</div>
                <div className="text-xs text-gray-600">失败次数</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">{stats.totalCount}</div>
                <div className="text-xs text-gray-600">总练习次数</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 记录列表 */}
        <Card>
          <CardHeader>
            <CardTitle>历史练习</CardTitle>
            <CardDescription>查看您的所有练习记录</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="text-4xl mb-4 animate-pulse">⏳</div>
                  <p className="text-gray-600">加载中...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-4xl mb-4">😕</div>
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => fetchRecords()}>重试</Button>
              </div>
            ) : records.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-5xl mb-4">📝</div>
                <p className="text-gray-600 mb-2">暂无练习记录</p>
                <p className="text-sm text-gray-500 mb-4">开始练习来创建您的第一条记录吧</p>
                <Link href="/">
                  <Button>去练习</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium text-gray-900">{record.scenario}</h3>
                        <Badge className={getResultBadgeClass(record.result)}>
                          {record.result === 'success' ? '通关' : '失败'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>好感度: {record.final_score}</span>
                        <span>{formatDate(record.played_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 分页 */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => fetchRecords(pagination.page - 1)}
                    >
                      上一页
                    </Button>
                    <span className="text-sm text-gray-600">
                      第 {pagination.page} / {pagination.totalPages} 页
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => fetchRecords(pagination.page + 1)}
                    >
                      下一页
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

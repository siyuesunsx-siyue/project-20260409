'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Crown, Medal, Award, User, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  best_score: number;
  achieved_at: string;
  result: string;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取排行榜数据
  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/leaderboard');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '获取排行榜失败');
      }

      setLeaderboard(data.leaderboard || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取排行榜失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

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

  // 获取排名图标
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-400" />;
      default:
        return null;
    }
  };

  // 获取排名背景色
  const getRankBgClass = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-50 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-orange-50 border-orange-200';
      default:
        return 'bg-white border-gray-100';
    }
  };

  // 判断是否是当前用户
  const isCurrentUser = (userId: number) => {
    return user && user.id === userId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-orange-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
          <button
            onClick={fetchLeaderboard}
            disabled={isLoading}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            刷新
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* 标题区域 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-lg shadow-orange-200 mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2 tracking-tight">
            排行榜
          </h1>
          <p className="text-sm text-gray-600">
            展示练习成果，与用户共同成长
          </p>
        </div>

        {/* Top 3 展示 */}
        {leaderboard.length >= 3 && !isLoading && !error && (
          <div className="flex justify-center items-end gap-4 mb-8 -mt-4">
            {/* 第2名 */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mb-2 shadow-md">
                <Medal className="w-7 h-7 text-gray-500" />
              </div>
              <span className="text-xs text-gray-500 font-medium mb-1">第2名</span>
              <span className="text-sm font-medium text-gray-700 mb-1">
                {leaderboard[1].username}
              </span>
              <span className="text-lg font-bold text-gray-600">
                {leaderboard[1].best_score}
              </span>
            </div>

            {/* 第1名 */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-3xl flex items-center justify-center mb-2 shadow-lg shadow-yellow-200 ring-4 ring-yellow-100">
                <Crown className="w-10 h-10 text-yellow-100" />
              </div>
              <span className="text-xs text-yellow-600 font-semibold mb-1">🏆 第1名</span>
              <span className="text-base font-semibold text-gray-800 mb-1">
                {leaderboard[0].username}
              </span>
              <span className="text-2xl font-bold text-yellow-600">
                {leaderboard[0].best_score}
              </span>
            </div>

            {/* 第3名 */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-200 to-orange-300 rounded-2xl flex items-center justify-center mb-2 shadow-md">
                <Award className="w-7 h-7 text-orange-500" />
              </div>
              <span className="text-xs text-orange-500 font-medium mb-1">第3名</span>
              <span className="text-sm font-medium text-gray-700 mb-1">
                {leaderboard[2].username}
              </span>
              <span className="text-lg font-bold text-orange-500">
                {leaderboard[2].best_score}
              </span>
            </div>
          </div>
        )}

        {/* 排行榜列表 */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100 overflow-hidden">
          {/* 表头 */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="col-span-2">排名</div>
            <div className="col-span-5">用户名</div>
            <div className="col-span-3 text-right">最高分</div>
            <div className="col-span-2 text-right">达成时间</div>
          </div>

          {/* 加载状态 */}
          {isLoading && (
            <div className="py-16 text-center">
              <RefreshCw className="w-8 h-8 mx-auto text-gray-400 animate-spin mb-4" />
              <p className="text-gray-500">加载中...</p>
            </div>
          )}

          {/* 错误状态 */}
          {error && (
            <div className="py-16 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={fetchLeaderboard}
                className="px-4 py-2 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 transition-colors"
              >
                重试
              </button>
            </div>
          )}

          {/* 空状态 */}
          {!isLoading && !error && leaderboard.length === 0 && (
            <div className="py-16 text-center">
              <Trophy className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">暂无排行榜数据</p>
              <p className="text-sm text-gray-400">
                完成练习后即可上榜
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-full hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                开始练习
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          )}

          {/* 排行榜条目 */}
          {!isLoading && !error && leaderboard.length > 0 && (
            <div className="divide-y divide-gray-50">
              {leaderboard.map((entry) => (
                <div
                  key={entry.user_id}
                  className={`
                    grid grid-cols-12 gap-4 px-6 py-4 items-center
                    transition-colors
                    ${getRankBgClass(entry.rank)}
                    ${isCurrentUser(entry.user_id) 
                      ? 'ring-2 ring-blue-500 ring-inset bg-blue-50/50' 
                      : 'hover:bg-gray-50'}
                  `}
                >
                  {/* 排名 */}
                  <div className="col-span-2 flex items-center gap-2">
                    <span className={`
                      w-8 h-8 flex items-center justify-center rounded-lg font-semibold text-sm
                      ${entry.rank === 1 ? 'bg-yellow-100 text-yellow-700' : ''}
                      ${entry.rank === 2 ? 'bg-gray-100 text-gray-600' : ''}
                      ${entry.rank === 3 ? 'bg-orange-100 text-orange-600' : ''}
                      ${entry.rank > 3 ? 'bg-gray-100 text-gray-500' : ''}
                    `}>
                      {entry.rank <= 3 ? getRankIcon(entry.rank) : entry.rank}
                    </span>
                    {entry.rank <= 3 && (
                      <span className="text-xs text-gray-500 font-medium">
                        {entry.rank === 1 ? '冠军' : entry.rank === 2 ? '亚军' : '季军'}
                      </span>
                    )}
                  </div>

                  {/* 用户名 */}
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">
                        {entry.username}
                      </span>
                      {isCurrentUser(entry.user_id) && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                          我
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 最高分 */}
                  <div className="col-span-3 text-right">
                    <span className={`
                      text-xl font-bold
                      ${entry.rank === 1 ? 'text-yellow-600' : ''}
                      ${entry.rank === 2 ? 'text-gray-600' : ''}
                      ${entry.rank === 3 ? 'text-orange-600' : ''}
                      ${entry.rank > 3 ? 'text-gray-700' : ''}
                    `}>
                      {entry.best_score}
                    </span>
                    <span className="text-sm text-gray-400 ml-1">分</span>
                  </div>

                  {/* 达成时间 */}
                  <div className="col-span-2 text-right flex items-center justify-end gap-1 text-sm text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(entry.achieved_at).split(' ')[0]}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 提示信息 */}
        {!isLoading && !error && leaderboard.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>排行榜每分钟更新一次</p>
            {!user && (
              <p className="mt-2">
                <Link href="/login" className="text-blue-500 hover:underline">
                  登录
                </Link>
                {' '}后可上传成绩上榜
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

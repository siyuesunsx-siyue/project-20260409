'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Wand2, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    post?: {
      id: number;
      title: string;
      summary: string;
    };
    error?: string;
  } | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult(null);

    try {
      const res = await fetch('/api/blog/posts/generate', {
        method: 'POST',
      });

      const data = await res.json();
      setResult(data);
    } catch {
      setResult({
        success: false,
        error: '生成失败，请稍后重试',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            返回首页
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-4">
            文章生成管理
          </h1>
          <p className="text-gray-600 mb-8">
            使用AI自动生成新的沟通技巧文章并保存到数据库
          </p>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                生成新文章
              </>
            )}
          </button>

          {/* Result Display */}
          {result && (
            <div className="mt-8">
              {result.success ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-900 mb-2">
                        生成成功！
                      </h3>
                      <div className="text-sm text-green-700 mb-4">
                        <p className="mb-1">
                          <span className="font-medium">标题：</span>{' '}
                          {result.post?.title}
                        </p>
                        <p className="mb-1">
                          <span className="font-medium">摘要：</span>{' '}
                          {result.post?.summary}
                        </p>
                        <p>
                          <span className="font-medium">ID：</span>{' '}
                          {result.post?.id}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Link
                          href={`/blog/${result.post?.id}`}
                          className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700"
                        >
                          查看文章
                          <ArrowLeft className="w-4 h-4 rotate-180" />
                        </Link>
                        <Link
                          href="/blog"
                          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-700"
                        >
                          文章列表
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-lg font-semibold text-red-900 mb-2">
                        生成失败
                      </h3>
                      <p className="text-sm text-red-700">
                        {result.error}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            使用说明
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• 点击&ldquo;生成新文章&rdquo;按钮，AI会自动创建一篇关于夫妻沟通技巧的文章</li>
            <li>• 文章会自动保存到数据库，并包含标题、摘要和完整内容</li>
            <li>• 生成成功后可以点击链接查看文章或返回列表页</li>
            <li>• 每次生成的文章内容都是独特的，不会有重复</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

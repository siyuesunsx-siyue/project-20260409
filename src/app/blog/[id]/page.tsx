import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';

const blogDetailPage = async ({ params }: { params: { id: string } }) => {
  const res = await fetch(
    `${process.env.COZE_PROJECT_DOMAIN_DEFAULT}/api/blog/posts/${params.id}`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    if (res.status === 404) {
      notFound();
    }
    throw new Error('获取文章失败');
  }

  const { post } = await res.json();
  const readTime = Math.ceil(post.content.length / 500);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            返回列表
          </Link>
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-900 transition-colors text-sm"
          >
            夫妻沟通模拟器
          </Link>
        </div>
      </header>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Meta */}
        <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date(post.created_at).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {readTime} 分钟阅读
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight mb-6">
          {post.title}
        </h1>

        {/* Summary */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <p className="text-lg text-gray-600 leading-relaxed">{post.summary}</p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {post.content.split('\n').map((paragraph: string, index: number) => (
            <p
              key={index}
              className="text-gray-700 leading-8 mb-6 first-letter:text-3xl first-letter:font-semibold first-letter:text-blue-600 first-letter:mr-1"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Share */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: post.title,
                  text: post.summary,
                  url: window.location.href,
                });
              }
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            分享这篇文章
          </button>
        </div>
      </article>

      {/* Related Posts */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            更多沟通技巧
          </h2>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-blue-600 font-medium hover:gap-3 transition-all"
          >
            查看全部文章
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500">
            © {new Date().getFullYear()} 夫妻沟通模拟器 · 用爱沟通，用理解化解冲突
          </p>
        </div>
      </footer>
    </div>
  );
};

export default blogDetailPage;

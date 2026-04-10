import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const blogListPage = async () => {
  // 从数据库获取文章列表
  const res = await fetch(`${process.env.COZE_PROJECT_DOMAIN_DEFAULT}/api/blog/posts`, {
    cache: 'no-store',
  });

  const { posts = [] } = await res.json();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f5f7] to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="#2563EB" />
              <path
                d="M12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20C28 24.4183 24.4183 28 20 28C15.5817 28 12 24.4183 12 20Z"
                fill="#FFA500"
              />
              <path
                d="M15 20C15 17.2386 17.2386 15 20 15C22.7614 15 25 17.2386 25 20C25 22.7614 22.7614 25 20 25C17.2386 25 15 22.7614 15 20Z"
                fill="white"
              />
              <path
                d="M17 20C17 18.8954 17.8954 18 20 18C22.1046 18 23 18.8954 23 20C23 21.1046 22.1046 22 20 22C17.8954 22 17 21.1046 17 20Z"
                fill="#2563EB"
              />
            </svg>
            <span className="text-xl font-semibold">夫妻沟通模拟器</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight mb-6">
            夫妻沟通攻略
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            用轻松幽默的方式，分享实用有效的沟通技巧，让感情更和谐
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">暂无文章</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post: {
                id: number;
                title: string;
                summary: string;
                content: string;
                created_at: string;
                read_time?: number;
              }) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className={cn(
                    'group bg-white rounded-2xl p-6',
                    'hover:shadow-lg hover:shadow-blue-100/50',
                    'transition-all duration-300',
                    'border border-gray-200 hover:border-blue-200'
                  )}
                >
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.created_at).toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    {post.read_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.read_time} 分钟阅读
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>

                  <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                    {post.summary}
                  </p>

                  <div className="flex items-center gap-2 text-blue-600 font-medium group-hover:gap-3 transition-all">
                    阅读全文
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500">
            © {new Date().getFullYear()} 夫妻沟通模拟器 · 用爱沟通，用理解化解冲突
          </p>
        </div>
      </footer>
    </div>
  );
};

export default blogListPage;

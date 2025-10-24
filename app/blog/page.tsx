import { getAllPosts } from '@/lib/posts'
import Link from 'next/link'
import { Calendar, ArrowRight } from 'lucide-react'

export default async function Blog() {
  const posts = await getAllPosts()

  return (
    <div className="animate-fade-in">
      <div className="max-w-4xl mx-auto px-6 md:px-8 py-16 md:py-24">
        {/* Header */}
        <div className="mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Research Blog
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl leading-relaxed">
            Insights, analysis, and findings from my research in data science, machine learning,
            and artificial intelligence.
          </p>
        </div>

        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <article
                key={post.data.slug}
                className="group border border-gray-200 rounded-xl p-8 hover:border-gray-300 hover:shadow-lg transition-all"
              >
                <Link href={`/blog/${post.data.slug}`} className="block">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-2xl font-semibold tracking-tight mb-3 group-hover:text-blue-600 transition-colors">
                        {post.data.title}
                      </h2>

                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Calendar size={16} />
                        <span>{post.data.date}</span>
                      </div>
                    </div>

                    <div className="ml-6 flex-shrink-0">
                      <ArrowRight
                        size={20}
                        className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
                      />
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-2xl mx-auto p-8 border border-gray-200 rounded-xl bg-gray-50">
              <h3 className="text-2xl font-semibold mb-3">Coming Soon</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                I'm currently working on my first blog posts covering my research in machine
                learning, data science methodologies, and insights from competitive data science.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/projects"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  View My Projects
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="mailto:kaanhacihaliloglu@gmail.com"
                  className="inline-flex items-center justify-center gap-2 border border-gray-300 hover:border-gray-400 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Subscribe for Updates
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

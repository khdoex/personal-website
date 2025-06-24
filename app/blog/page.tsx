import { getAllPosts } from '@/lib/posts'
import Link from 'next/link'
import PageNav from '@/components/PageNav'
import { Calendar, ArrowRight } from 'lucide-react'

export default async function Blog() {
  const posts = await getAllPosts()

  return (
    <main className="min-h-screen relative">
      
      <div className="max-w-4xl mx-auto px-8 py-8">
        <PageNav title="Research Blog" />
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Insights, analysis, and findings from my research in data science, machine learning, 
            and artificial intelligence. Sharing knowledge and discoveries from academic and practical work.
          </p>
        </div>

        {posts.length > 0 ? (
          <div className="space-y-8">
            {posts.map((post, index) => (
              <article 
                key={post.data.slug} 
                className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-2xl 
                         hover:bg-white/10 transition-all duration-500 hover:border-white/20 hover:transform hover:scale-[1.01]"
              >
                <Link 
                  href={`/blog/${post.data.slug}`} 
                  className="block"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300 mb-3 leading-tight">
                        {post.data.title}
                      </h2>
                      
                      <div className="flex items-center gap-6 text-white/60">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span className="text-sm">{post.data.date}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6 flex-shrink-0">
                      <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center 
                                    group-hover:bg-blue-500/20 transition-colors">
                        <ArrowRight size={16} className="text-white/60 group-hover:text-blue-300 
                                                      group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/10 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">Coming Soon</h3>
              <p className="text-white/80 text-lg leading-relaxed mb-8">
                I'm currently working on my first blog posts covering my research in machine learning, 
                data science methodologies, and insights from competitive data science.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/projects"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 
                           rounded-lg font-semibold transition-all duration-300 hover:transform hover:scale-105"
                >
                  View My Projects
                  <ArrowRight size={18} />
                </Link>
                <Link 
                  href="mailto:kaanhacihaliloglu@gmail.com"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-3 
                           rounded-lg font-semibold transition-all duration-300 border border-white/20 hover:border-white/40"
                >
                  Subscribe for Updates
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
} 
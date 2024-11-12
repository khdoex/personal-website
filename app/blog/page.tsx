import { getAllPosts } from '@/lib/posts'
import Link from 'next/link'
import PageNav from '@/components/PageNav'

export default async function Blog() {
  const posts = await getAllPosts()

  return (
    <main className="min-h-screen p-8 relative">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 -z-[5]" />
      
      <PageNav title="Blog" />
      <div className="max-w-2xl mx-auto">
        <ul className="space-y-6 bg-black/40 backdrop-blur-sm rounded-lg p-6 border border-white/10 shadow-xl">
          {posts.map((post) => (
            <li 
              key={post.data.slug} 
              className="border-b border-white/10 pb-6 last:border-0 last:pb-0 group"
            >
              <Link 
                href={`/blog/${post.data.slug}`} 
                className="block group-hover:translate-x-2 duration-300"
              >
                <h2 className="text-xl text-white hover:text-blue-300 transition-colors drop-shadow-md font-semibold mb-2">
                  {post.data.title}
                </h2>
                <p className="text-white/70 drop-shadow-sm mt-2">
                  {post.data.date}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
} 
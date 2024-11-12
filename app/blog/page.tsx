import { getAllPosts, type Post } from '@/lib/posts'
import Link from 'next/link'
import PageNav from '@/components/PageNav'

export default async function Blog() {
  const posts = await getAllPosts()

  return (
    <main className="min-h-screen p-8">
      <PageNav title="Blog" />
      <div className="max-w-2xl mx-auto">
        <ul className="space-y-6">
          {posts.map((post: Post) => (
            <li key={post.data.slug} className="border-b border-gray-800 pb-6">
              <Link 
                href={`/blog/${post.data.slug}`} 
                className="text-xl text-white hover:text-blue-300 transition-colors drop-shadow-md"
              >
                {post.data.title}
              </Link>
              <p className="text-gray-400 mt-2">{post.data.date}</p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
} 
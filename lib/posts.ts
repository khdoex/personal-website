import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'posts')

export interface PostData {
  title: string
  date: string
  slug: string
  content: string
}

export interface Post {
  data: PostData
}

export async function getAllPosts(): Promise<Post[]> {
  if (!fs.existsSync(postsDirectory)) {
    console.error('Posts directory does not exist:', postsDirectory)
    return []
  }

  const fileNames = fs.readdirSync(postsDirectory)
  console.log('Found files:', fileNames)

  const allPosts = await Promise.all(fileNames.map(async (fileName) => {
    if (!fileName.endsWith('.md')) {
      return null
    }

    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    
    console.log('Processing file:', fileName, 'with data:', data)

    const processedContent = await remark()
      .use(html)
      .process(content)
    const contentHtml = processedContent.toString()
    
    return {
      data: {
        title: data.title || 'Untitled',
        date: data.date || new Date().toISOString(),
        slug: fileName.replace(/\.md$/, ''),
        content: contentHtml
      }
    }
  }))

  return allPosts
    .filter((post): post is Post => post !== null)
    .sort((a, b) => {
      if (a.data.date < b.data.date) {
        return 1
      } else {
        return -1
      }
    })
}

export async function getPostBySlug(slug: string): Promise<Post> {
  const fullPath = path.join(postsDirectory, `${slug}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)
  
  const processedContent = await remark()
    .use(html)
    .process(content)
  const contentHtml = processedContent.toString()
  
  return {
    data: {
      ...(data as { title: string; date: string }),
      slug,
      content: contentHtml
    }
  }
} 
import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

export type PostType = {
  id: number
  title: string
  body: string
}

export const fetchPost = async (postId: string) => {
  console.info(`Fetching post with id ${postId} from Hono backend...`)
  const res = await fetch(`http://localhost:3000/api/posts/${postId}`)
  if (!res.ok) {
    if (res.status === 404) {
      throw notFound()
    }

    throw new Error('Failed to fetch post')
  }

  const post = await res.json()

  return post as PostType
}

export const fetchPosts = async () => {
  console.info('Fetching posts from Hono backend...')
  const res = await fetch('http://localhost:3000/api/posts')
  if (!res.ok) {
    throw new Error('Failed to fetch posts')
  }

  const posts = await res.json()

  return (posts as Array<PostType>).slice(0, 10)
}

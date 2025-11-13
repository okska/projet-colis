import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts2')({
  loader: async () => fetchPosts2(),
  component: Posts2Component,
})

async function fetchPosts2() {
  const apiUrl = import.meta.env.VITE_API_URL;
  console.info('Fetching posts2 from Hono backend using Drizzle...');
  const res = await fetch(`${apiUrl}/api/posts2`);
  if (!res.ok) {
    throw new Error('Failed to fetch posts2');
  }
  const posts = await res.json();
  return posts;
}

function Posts2Component() {
  const posts = Route.useLoaderData();

  return (
    <div className="p-2">
      <h3>Posts from Drizzle ORM</h3>
      <ul className="list-disc pl-4">
        {posts.map((post: any) => (
          <li key={post.id} className="whitespace-nowrap">
            <div>{post.title}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

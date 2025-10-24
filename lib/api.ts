const BASE_URL = '/api'; 

type Post = {
  id: number
  title: string
  body: string
}

export async function fetchPosts(page = 1, limit = 10) {
  const response = await fetch(
    `${BASE_URL}/posts?_page=${page}&_limit=${limit}`
  );
  if (!response.ok) throw new Error('Failed to fetch posts');
  return {
    posts: await response.json(),
    hasMore: response.headers.get(''),
  };
}

export async function createPost(post: Omit<Post
    , 'id'>) {
  const response = await fetch(`${BASE_URL}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
  });
  if (!response.ok) throw new Error('Failed to create post');
  return response.json();
}
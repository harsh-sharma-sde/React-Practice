// 1. The Scalable Data Fetcher (Mock API)
// We'll simulate a heavy data load with unique IDs and metadata.

// lib/api.js
export const fetchPostsPage = async ({ pageParam = 0 }) => {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  const PAGE_SIZE = 10;
  const posts = Array.from({ length: PAGE_SIZE }).map((_, i) => ({
    id: `post-${pageParam}-${i}`,
    title: `Scalable Post ${pageParam * PAGE_SIZE + i}`,
    content: "This content is virtualized. Even with 10k items, the DOM stays slim.",
    timestamp: new Date().toISOString(),
    user: { name: `User ${i}`, avatar: `https://i.pravatar.cc/150?u=${i}` }
  }));

  return {
    posts,
    nextCursor: pageParam + 1,
    hasMore: pageParam < 20, // Limit to 200 items for this demo
  };
};
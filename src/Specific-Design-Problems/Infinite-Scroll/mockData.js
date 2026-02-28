// 1. The Mock API (Data Utility)
// First, let's create a helper to simulate a paginated network request.

// mockData.js
export const fetchMockPosts = async (page, limit = 10) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const totalPosts = 50; // Total available items in our "DB"
  const start = (page - 1) * limit;
  
  if (start >= totalPosts) return { data: [], hasMore: false };

  const data = Array.from({ length: limit }).map((_, i) => ({
    id: start + i,
    title: `Post #${start + i + 1}`,
    body: "This is a sample post body generated for the system design task.",
    author: `User_${Math.floor(Math.random() * 100)}`,
  }));

  return {
    data,
    hasMore: start + limit < totalPosts,
  };
};
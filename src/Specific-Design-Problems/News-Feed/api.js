/* ============================================================
   Mock Scalable API (Simulated Backend)
   ------------------------------------------------------------
   This function simulates a paginated backend API.

   It mimics:
   - Server-side pagination
   - Network delay
   - Cursor-based pagination
============================================================ */

export const fetchPostsPage = async ({ pageParam = 0 }) => {

  /* ------------------------------------------------------------
     pageParam:
     
     - Provided automatically by React Query
     - Represents the "cursor" or current page number
     - Defaults to 0 for the first page

     Example:
       First call  → pageParam = 0
       Next call   → pageParam = 1
       Next call   → pageParam = 2
  ------------------------------------------------------------ */

  
  /* ------------------------------------------------------------
     Simulate network latency (1 second)

     In real-world apps:
       - Backend takes time to respond
       - We show loading states during this time

     This helps test infinite loading behavior.
  ------------------------------------------------------------ */
  await new Promise((resolve) => setTimeout(resolve, 1000));



  /* ------------------------------------------------------------
     PAGE_SIZE:
     Number of items returned per request (per page)

     Here:
       Each page returns 10 posts.
  ------------------------------------------------------------ */
  const PAGE_SIZE = 10;



  /* ------------------------------------------------------------
     Generate mock posts

     We create PAGE_SIZE number of posts dynamically.

     Each post contains:
       - Unique ID
       - Title
       - Content
       - Timestamp
       - User info
  ------------------------------------------------------------ */
  const posts = Array.from({ length: PAGE_SIZE }).map((_, i) => ({

    // Unique ID using pageParam + index
    id: `post-${pageParam}-${i}`,

    // Title numbering based on global index
    title: `Scalable Post ${pageParam * PAGE_SIZE + i}`,

    // Demo content
    content: "This content is virtualized. Even with 10k items, the DOM stays slim.",

    // Timestamp of creation
    timestamp: new Date().toISOString(),

    // Mock user data
    user: {
      name: `User ${i}`,
      avatar: `https://i.pravatar.cc/150?u=${i}`
    }
  }));



  /* ------------------------------------------------------------
     Return format (Important!)

     React Query expects:
       - Data
       - A way to know what next page is
       - Whether more pages exist

     nextCursor:
       Tells React Query what pageParam to use next.

     hasMore:
       Boolean to indicate if more data exists.
  ------------------------------------------------------------ */
  return {
    posts,

    // Next page number
    nextCursor: pageParam + 1,

    // Stop after page 20 (demo limit)
    // 20 pages × 10 items = 200 items total
    hasMore: pageParam < 20,
  };
};
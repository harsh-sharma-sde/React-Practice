// mockData.js

/*
  fetchMockPosts simulates a paginated backend API call.

  Parameters:
  - page: current page number (starts from 1)
  - limit: number of posts per page (default = 10)

  It returns:
  {
    data: array of posts,
    hasMore: boolean (whether more pages exist)
  }
*/

export const fetchMockPosts = async (page, limit = 10) => {

  // -----------------------------
  // 1️⃣ Simulate Network Latency
  // -----------------------------
  // This makes the function behave like a real API call
  // by delaying execution for 800 milliseconds.
  // Useful for testing loading states in UI.
  await new Promise((resolve) => setTimeout(resolve, 800));


  // -----------------------------
  // 2️⃣ Total Posts in "Database"
  // -----------------------------
  // This represents the total number of records
  // available on the server.
  const totalPosts = 50;


  // -----------------------------
  // 3️⃣ Calculate Starting Index
  // -----------------------------
  /*
     If:
       page = 1, limit = 10 → start = 0
       page = 2, limit = 10 → start = 10
       page = 3, limit = 10 → start = 20

     Formula:
       (page - 1) * limit

     This is standard pagination math.
  */
  const start = (page - 1) * limit;


  // -----------------------------
  // 4️⃣ Stop if No More Data
  // -----------------------------
  // If the start index exceeds total posts,
  // return empty data and indicate no more posts.
  if (start >= totalPosts) {
    return {
      data: [],
      hasMore: false
    };
  }


  // -----------------------------
  // 5️⃣ Generate Mock Data
  // -----------------------------
  /*
     We create an array of "limit" size.
     Each item represents a fake post.

     Array.from({ length: limit }) creates an array like:
     [undefined, undefined, ...] (limit times)

     Then we map over it to generate objects.
  */
  const data = Array.from({ length: limit }).map((_, i) => ({

    // Unique ID for each post
    id: start + i,

    // Dynamic title based on index
    title: `Post #${start + i + 1}`,

    // Static body content
    body: "This is a sample post body generated for the system design task.",

    // Random author name for realism
    // Math.random() generates 0–1
    // Multiply by 100 and floor to get 0–99
    author: `User_${Math.floor(Math.random() * 100)}`,
  }));


  // -----------------------------
  // 6️⃣ Return Paginated Response
  // -----------------------------
  /*
     hasMore logic:
     If (start + limit) < totalPosts
     → There are more posts available.
  */
  return {
    data,
    hasMore: start + limit < totalPosts,
  };
};
import React, { useMemo, useCallback, memo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { fetchPostsPage } from './api';

/* ============================================================
   Row Component (Single Item Renderer)
   ------------------------------------------------------------
   react-window renders ONLY visible rows.
   This component renders one post at a time.
   We wrap it with React.memo to avoid unnecessary re-renders.
============================================================ */
const Row = memo(({ index, style, data }) => {
  // data is passed using "itemData" from List
  const post = data[index];

  // If no post exists at this index, render nothing
  if (!post) return null;

  return (
    // IMPORTANT:
    // We MUST spread "style"
    // react-window controls row positioning via inline styles
    <div
      style={{
        ...style,
        padding: 12,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          background: 'white',
          padding: 16,
          borderRadius: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <h4 style={{ margin: 0 }}>{post.title}</h4>

        <p style={{ marginTop: 8, color: '#555' }}>
          {post.content}
        </p>

        <div
          style={{
            marginTop: 10,
            fontSize: 12,
            color: '#888',
          }}
        >
          {post.user?.name} •{' '}
          {new Date(post.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
});

/* ============================================================
   Main Feed Component
============================================================ */
export default function ScalableFeed() {

  /* ------------------------------------------------------------
     React Query: useInfiniteQuery

     This hook is used when:
     - You load paginated data
     - You want infinite scrolling

     Instead of storing pages manually,
     React Query manages:
       - loading
       - caching
       - pagination
       - background refetching
  ------------------------------------------------------------ */
  const {
    data,                // Contains all loaded pages
    fetchNextPage,       // Function to fetch next page
    hasNextPage,         // Boolean: is more data available?
    isFetchingNextPage,  // Loading state for next page
    isPending,           // Initial loading state
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['news-feed'],   // Unique cache key
    queryFn: fetchPostsPage,   // API function
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });

  /* ------------------------------------------------------------
     React Query returns data in this shape:

     data = {
       pages: [
         { posts: [...] },
         { posts: [...] }
       ],
       pageParams: [...]
     }

     We flatten all pages into a single array for rendering.
  ------------------------------------------------------------ */
  const allPosts = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.posts ?? []);
  }, [data]);

  const itemCount = allPosts.length;

  /* ------------------------------------------------------------
     Infinite Scroll Trigger Logic

     react-window tells us which rows are visible.
     When user scrolls near bottom,
     we trigger fetchNextPage().
  ------------------------------------------------------------ */
  const handleItemsRendered = useCallback(
    ({ visibleStopIndex }) => {

      const threshold = 5; // Load before reaching last item

      if (
        hasNextPage &&
        !isFetchingNextPage &&
        visibleStopIndex >= itemCount - threshold
      ) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, itemCount, fetchNextPage]
  );

  /* ---------------- Initial Loading State ---------------- */
  if (isPending) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  /* ---------------- Error State ---------------- */
  if (isError) {
    return <div style={{ padding: 20 }}>Error: {error.message}</div>;
  }

  /* ---------------- Empty State ---------------- */
  if (itemCount === 0) {
    return <div style={{ padding: 20 }}>No posts found</div>;
  }

  /* ============================================================
     Rendering the Virtualized List
  ============================================================ */
  return (
    <div
      style={{
        height: '100vh', // Must have height for AutoSizer
        width: '100%',
        background: '#f3f4f6',
        display: 'flex',
      }}
    >
      {/* --------------------------------------------------------
         AutoSizer

         Automatically detects available height & width
         and passes it to List.

         IMPORTANT:
         Parent must have fixed height.
      -------------------------------------------------------- */}
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}     // visible container height
            width={width}       // visible container width
            itemCount={itemCount}
            itemSize={140}      // fixed row height (important)
            itemData={allPosts} // data passed to Row
            overscanCount={5}   // render extra rows for smooth scroll
            onItemsRendered={handleItemsRendered}
          >
            {Row}
          </List>
        )}
      </AutoSizer>

      {/* Loading indicator while fetching next page */}
      {isFetchingNextPage && (
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            width: '100%',
            textAlign: 'center',
            fontSize: 14,
          }}
        >
          Loading more...
        </div>
      )}
    </div>
  );
}
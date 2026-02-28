import React, { useMemo, useCallback, memo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { fetchPostsPage } from './api';

/* ------------------ Memoized Row Component ------------------ */
const Row = memo(({ index, style, data }) => {
  const post = data[index];
  if (!post) return null;

  return (
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

/* ------------------ Main Component ------------------ */
export default function ScalableFeed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['news-feed'],
    queryFn: fetchPostsPage,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });

  /* Flatten pages safely */
  const allPosts = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.posts ?? []);
  }, [data]);

  const itemCount = allPosts.length;

  /* Prefetch before last item (better UX than exact match) */
  const handleItemsRendered = useCallback(
    ({ visibleStopIndex }) => {
      const threshold = 5; // load earlier
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

  if (isPending) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  if (isError) {
    return <div style={{ padding: 20 }}>Error: {error.message}</div>;
  }

  if (itemCount === 0) {
    return <div style={{ padding: 20 }}>No posts found</div>;
  }

  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        background: '#f3f4f6',
        display: 'flex',
      }}
    >
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            width={width}
            itemCount={itemCount}
            itemSize={140}
            itemData={allPosts}
            overscanCount={5}
            onItemsRendered={handleItemsRendered}
          >
            {Row}
          </List>
        )}
      </AutoSizer>

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
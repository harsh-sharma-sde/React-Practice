// 2. The Main Feed Component
// This component implements Infinite Scrolling using the Intersection Observer API.
// When the last post becomes visible in the viewport, we fetch the next page.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchMockPosts } from './mockData';

const InfiniteFeed = () => {

  // Stores all fetched posts
  const [posts, setPosts] = useState([]);

  // Tracks current page number (used for pagination)
  const [page, setPage] = useState(1);

  // Tracks loading state (prevents duplicate requests)
  const [loading, setLoading] = useState(false);

  // Tracks if more data is available from API
  const [hasMore, setHasMore] = useState(true);

  // useRef stores a mutable value that persists across renders
  // Here we store the IntersectionObserver instance
  const observer = useRef();

  /*
    lastPostElementRef:
    This is a callback ref function.
    It will be attached ONLY to the last post element in the list.

    When the last post becomes visible in viewport,
    IntersectionObserver triggers and loads next page.
  */
  const lastPostElementRef = useCallback((node) => {

    // If currently loading, do nothing
    // Prevents multiple rapid triggers
    if (loading) return;

    // Disconnect previous observer before creating a new one
    // This prevents observing multiple elements at once
    if (observer.current) observer.current.disconnect();

    // Create new IntersectionObserver instance
    observer.current = new IntersectionObserver((entries) => {

      // entries[0] refers to observed element
      // isIntersecting means the element is visible in viewport
      if (entries[0].isIntersecting && hasMore) {

        // If last post is visible AND more posts are available
        // Increment page number → triggers new fetch
        setPage((prevPage) => prevPage + 1);
      }
    });

    // If node exists, start observing it
    if (node) observer.current.observe(node);

  }, [loading, hasMore]); 
  // Dependencies:
  // Recreate callback if loading or hasMore changes


  /*
    Fetch posts whenever "page" changes.
    This is the core pagination logic.
  */
  useEffect(() => {

    const loadPosts = async () => {

      setLoading(true); // Start loading

      try {
        // Fetch posts for current page
        const { data, hasMore: moreAvailable } = await fetchMockPosts(page);

        // Append new posts to previous posts (important for infinite scroll)
        setPosts((prev) => [...prev, ...data]);

        // Update whether more posts exist
        setHasMore(moreAvailable);

      } catch (err) {
        console.error("Failed to fetch", err);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    loadPosts();

  }, [page]); // Runs every time page changes


  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>

      <h1>System Design Feed</h1>

      {/*
        Render all posts.
        Attach ref ONLY to the last post.
      */}
      {posts.map((post, index) => {

        // Check if this is the last item in array
        const isLastPost = posts.length === index + 1;

        return (
          <div 
            key={post.id}

            // Attach observer only to last post
            ref={isLastPost ? lastPostElementRef : null}

            style={cardStyle}
          >
            <h3>{post.title}</h3>
            <p>{post.body}</p>
            <small>By {post.author}</small>
          </div>
        );
      })}

      {/* Show loading indicator */}
      {loading && <div style={loaderStyle}>Loading more posts...</div>}

      {/* Show message when no more posts */}
      {!hasMore && <div style={endStyle}>You've reached the end! 🎉</div>}
    </div>
  );
};


// -----------------------------
// Simple Inline Styles
// -----------------------------

// Card UI styling
const cardStyle = {
  border: '1px solid #ddd',
  padding: '15px',
  margin: '10px 0',
  borderRadius: '8px',
  background: '#fff'
};

// Loading message styling
const loaderStyle = {
  textAlign: 'center',
  padding: '20px',
  fontWeight: 'bold'
};

// End message styling
const endStyle = {
  textAlign: 'center',
  color: '#888',
  padding: '20px'
};

export default InfiniteFeed;
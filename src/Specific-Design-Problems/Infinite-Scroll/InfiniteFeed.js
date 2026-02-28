// 2. The Main Feed Component
// We use useRef to track the "sentinel" element (the invisible div at the bottom) that triggers the next fetch.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchMockPosts } from './mockData';

const InfiniteFeed = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Observer reference for the bottom element
  const observer = useRef();

  // The last element ref callback
  const lastPostElementRef = useCallback((node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Fetch logic
  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const { data, hasMore: moreAvailable } = await fetchMockPosts(page);
        setPosts((prev) => [...prev, ...data]);
        setHasMore(moreAvailable);
      } catch (err) {
        console.error("Failed to fetch", err);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [page]);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>System Design Feed</h1>
      
      {posts.map((post, index) => {
        // If it's the last post in the array, attach the ref
        const isLastPost = posts.length === index + 1;
        return (
          <div 
            key={post.id} 
            ref={isLastPost ? lastPostElementRef : null}
            style={cardStyle}
          >
            <h3>{post.title}</h3>
            <p>{post.body}</p>
            <small>By {post.author}</small>
          </div>
        );
      })}

      {loading && <div style={loaderStyle}>Loading more posts...</div>}
      {!hasMore && <div style={endStyle}>You've reached the end! 🎉</div>}
    </div>
  );
};

// Simple Styles
const cardStyle = {
  border: '1px solid #ddd',
  padding: '15px',
  margin: '10px 0',
  borderRadius: '8px',
  background: '#fff'
};

const loaderStyle = { textAlign: 'center', padding: '20px', fontWeight: 'bold' };
const endStyle = { textAlign: 'center', color: '#888', padding: '20px' };

export default InfiniteFeed;
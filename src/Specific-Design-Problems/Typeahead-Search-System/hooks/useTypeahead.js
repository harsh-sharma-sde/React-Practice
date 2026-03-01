import { useReducer, useEffect, useRef, useCallback } from 'react';

/**
 * SDE3 PATTERN: Action Types for State Machine
 * Using a formal State Machine approach (via useReducer) prevents "impossible states."
 * For example: It ensures you can't be in an 'isLoading: true' state while also 
 * having an 'error' message from a previous stale request.
 */
const ACTION_TYPES = {
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_ERROR: 'FETCH_ERROR',
  CLEAR: 'CLEAR',
};

/**
 * SDE3 PATTERN: Atomic Reducer
 * By centralizing state updates, we ensure that every UI transition is predictable.
 * This is much cleaner than having 4-5 different 'useState' hooks fighting each other.
 */
function searchReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.FETCH_START:
      // Reset error on new fetch to provide a clean slate for the user
      return { ...state, isLoading: true, error: null };
    case ACTION_TYPES.FETCH_SUCCESS:
      return { ...state, isLoading: false, suggestions: action.payload, error: null };
    case ACTION_TYPES.FETCH_ERROR:
      return { ...state, isLoading: false, error: action.payload };
    case ACTION_TYPES.CLEAR:
      return { ...state, isLoading: false, suggestions: [], error: null };
    default:
      return state;
  }
}

const useTypeahead = (query, options = {}) => {
  const { 
    delay = 300, 
    minChars = 2, 
    limit = 10,
    baseUrl = 'http://localhost:8000/api/search' 
  } = options;

  const [state, dispatch] = useReducer(searchReducer, {
    suggestions: [],
    isLoading: false,
    error: null,
  });

  /**
   * SDE3 PATTERN: Persistent Client-Side Cache
   * We use 'useRef' for the cache because it survives re-renders but 
   * doesn't *trigger* a re-render when we update it.
   * * Memory Management: We implement a basic FIFO (First-In-First-Out) eviction
   * policy to ensure the browser memory doesn't grow indefinitely (Memory Leak protection).
   */
  const cache = useRef(new Map());
  const CACHE_LIMIT = 50;

  /**
   * SDE3 PATTERN: AbortController (Race Condition Prevention)
   * This is critical. If Request A (slow) is fired, then Request B (fast) is fired,
   * Request A might arrive LAST and overwrite the correct results for B.
   * We use the 'signal' to tell the browser: "Stop caring about the previous request."
   */
  const abortControllerRef = useRef(null);

  const fetchSuggestions = useCallback(async (searchQuery) => {
    const trimmed = searchQuery.trim().toLowerCase();

    // 1. Guard Clauses: Reduce unnecessary network noise
    if (trimmed.length < minChars) {
      dispatch({ type: ACTION_TYPES.CLEAR });
      return;
    }

    // 2. Immediate Cache Lookup: Zero-latency UX for previously searched terms
    if (cache.current.has(trimmed)) {
      dispatch({ type: ACTION_TYPES.FETCH_SUCCESS, payload: cache.current.get(trimmed) });
      return;
    }

    // 3. Network Orchestration: Cancel any previous "zombie" requests
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    dispatch({ type: ACTION_TYPES.FETCH_START });

    /**
     * SDE3 PATTERN: Telemetry & Observability
     * Real-world apps need to know when the Search Cluster is slow.
     * Monitoring P99 latencies directly in the client helps identify regional network issues.
     */
    const startTime = performance.now();

    try {
      const response = await fetch(
        `${baseUrl}?q=${encodeURIComponent(trimmed)}&limit=${limit}`,
        { signal: abortControllerRef.current.signal } // Link the abort signal to the fetch
      );

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const data = await response.json();
      const results = data.results || [];

      // 4. Performance Logging
      const duration = performance.now() - startTime;
      if (duration > 500) {
        console.warn(`🐢 Slow search detected: ${duration.toFixed(2)}ms for query "${trimmed}"`);
      }

      // 5. Cache Eviction Policy (FIFO)
      // If cache is full, delete the oldest entry before adding a new one.
      if (cache.current.size >= CACHE_LIMIT) {
        const firstKey = cache.current.keys().next().value;
        cache.current.delete(firstKey);
      }
      cache.current.set(trimmed, results);

      dispatch({ type: ACTION_TYPES.FETCH_SUCCESS, payload: results });
    } catch (err) {
      /**
       * SDE3 Logic: Silently handle AbortErrors.
       * If we cancelled the request ourselves, it's not a real error, 
       * it's just the user typing quickly.
       */
      if (err.name === 'AbortError') return; 
      
      dispatch({ 
        type: ACTION_TYPES.FETCH_ERROR, 
        payload: err.message || 'Failed to fetch' 
      });
    }
  }, [minChars, limit, baseUrl]);

  /**
   * 6. DEBOUNCE EFFECT
   * This is the "Traffic Cop" of the hook. It waits for the user to stop
   * typing before triggering the expensive fetchSuggestions function.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(query);
    }, delay);

    /**
     * Cleanup Function:
     * If the user types another character before the 'delay' finishes, 
     * this cleanup runs, clears the old timer, and starts a new one.
     */
    return () => {
      clearTimeout(timer);
      // Also abort the network request if the user clears the input or unmounts the component
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [query, delay, fetchSuggestions]);

  return { ...state };
};

export default useTypeahead;
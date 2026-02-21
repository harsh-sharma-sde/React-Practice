// Custom hooks are the ultimate way to share logic without sharing UI. Under the hood, they don't add "new" React features; they are simply a way to **encapsulate standard hooks** so that the component using them stays clean.

// The key to a "Senior" custom hook is handling **cleanup** and **edge cases**.

// ---

// ## 1. useFetch (with AbortController)

// A production-ready `useFetch` must handle:

// 1. **Loading/Error states.**
// 2. **Cleanups** (if the user navigates away before the data arrives).
// 3. **Updating** when the URL changes.

// ```javascript
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    
    setLoading(true);
    fetch(url, { signal: controller.signal })
      .then(res => res.json())
      .then(setData)
      .catch(err => {
        if (err.name !== 'AbortError') console.error(err);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [url]);

  return { data, loading };
}

// ```

// ---

// ## 2. useDebounce vs. useThrottle

// These are often confused. Think of them like this:

// * **Debounce:** "Wait until I'm finished." (Useful for Search inputs).
// * **Throttle:** "Only let me through once every X milliseconds." (Useful for Window Resize or Scroll).

// ### useDebounce Example:

// ```javascript
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler); // Reset the timer if value changes
  }, [value, delay]);

  return debouncedValue;
}

// ```

// ---

// ## 3. useWindowSize & useOnClickOutside

// These hooks interact with the **Global DOM**.

// * **`useWindowSize`:** Listens to the `resize` event.
// * **`useOnClickOutside`:** Listens to `mousedown` on the `document` to see if a click landed outside a specific `ref` (like a Modal or Dropdown).

// ---

// ## 4. Tricky Interview Questions

// ### Q1: "Can a custom hook call another custom hook?"

// **The Answer:** **Yes.** Hooks are composable. For example, `useFetch` might call a `useAuth` hook to get the current token before making a request. The only rule is that you must still follow the "Rules of Hooks" (no conditionals, top-level only).

// ### Q2: "If two components use the same custom hook, do they share state?"

// **The Answer:** **No.** Every time you call a custom hook, it gets its own "isolated" set of state and effects. If you want to share state between components, you need **Context** or a State Management library.

// ### Q3: "In `useDebounce`, why is the cleanup function crucial?"

// **The Answer:** Without `clearTimeout(handler)`, every single keystroke would trigger a separate timer. If you typed "React" quickly, you would get 5 separate API calls exactly 500ms after each letter. The cleanup "kills" the previous timer so only the *last* one survives.

// ### Q4: "How do you make `useOnClickOutside` performant?"

// **The Answer:** Since it adds a listener to the `document`, you must ensure:

// 1. The event listener is **removed** in the cleanup function.
// 2. The handler function passed to the hook is either stable (using `useCallback`) or the hook uses a `ref` to track the latest handler to avoid unnecessary listener re-attachments.

// ### Q5: "Why would you use `useLayoutEffect` instead of `useEffect` in a `useWindowSize` hook?"

// **The Answer:** If your UI needs to adjust its layout based on the window size *immediately* to prevent a "flicker" (e.g., a sidebar that hides at a certain width), `useLayoutEffect` ensures the calculation happens before the browser paints.

// ---

// Here is the implementation of those five essential custom hooks, designed with "Senior" level patterns (cleanups, error handling, and performance) and real-world use cases.

// ---

// ## 1. useFetch (with AbortController)

// **The Under-the-hood Logic:** It manages three state pieces and ensures that if a user navigates away or the `url` changes, the previous network request is killed to prevent memory leaks and "ghost" state updates.

// ```javascript
import { useState, useEffect } from 'react';

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error('Network response was not ok');
        const json = await response.json();
        setData(json);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort(); // Cleanup
  }, [url]);

  return { data, loading, error };
}

// // USE CASE: Data Dashboard
// function UserProfile({ userId }) {
//   const { data, loading } = useFetch(`https://api.example.com/users/${userId}`);
//   if (loading) return <p>Loading...</p>;
//   return <div>{data.name}</div>;
// }

// ```

// ---

// ## 2. useDebounce

// **The Under-the-hood Logic:** It utilizes a "timer delay." If the `value` changes before the timer finishes, the `useEffect` cleanup clears the old timer and starts a new one.

// ```javascript
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler); // Reset if value changes
  }, [value, delay]);

  return debouncedValue;
}

// USE CASE: Search API calls
function SearchInput() {
  const [text, setText] = useState("");
  const debouncedSearch = useDebounce(text, 500);

  useEffect(() => {
    if (debouncedSearch) {
      console.log("Searching API for:", debouncedSearch);
    }
  }, [debouncedSearch]);

  return <input value={text} onChange={(e) => setText(e.target.value)} />;
}

// ```

// ---

// ## 3. useThrottle

// **The Under-the-hood Logic:** Unlike debounce (which waits for a pause), throttle ensures a function executes at most once every  milliseconds. This is vital for performance-heavy listeners like scrolling.

// ```javascript
function useThrottle(value, limit) {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => clearTimeout(handler);
  }, [value, limit]);

  return throttledValue;
}

// USE CASE: Scroll Tracking
function ScrollTracker() {
  const [scrollPos, setScrollPos] = useState(0);
  const throttledScroll = useThrottle(scrollPos, 100); // Only update every 100ms

  useEffect(() => {
    const handleScroll = () => setScrollPos(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return <div style={{ height: '200vh' }}>Scrolled: {throttledScroll}px</div>;
}

// ```

// ---

// ## 4. useWindowSize

// **The Under-the-hood Logic:** This hook encapsulates the `resize` event listener. It checks if `window` is defined (to be SSR-safe) and cleans up the event to prevent memory leaks.

// ```javascript
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

// USE CASE: Responsive Layouts
function ResponsiveComponent() {
  const { width } = useWindowSize();
  return <div>{width < 768 ? "Mobile View" : "Desktop View"}</div>;
}

// ```

// ---

// ## 5. useOnClickOutside

// **The Under-the-hood Logic:** It attaches a listener to the `document`. It uses `.contains()` to check if the clicked element is a child of the `ref`. If not, it triggers the callback.

// ```javascript
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      // Do nothing if clicking ref's element or its children
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

// USE CASE: Modal or Dropdown
function Modal({ onClose }) {
  const modalRef = useRef();
  useOnClickOutside(modalRef, onClose);

  return (
    <div className="overlay">
      <div ref={modalRef} className="modal-content">
        Click outside me to close!
      </div>
    </div>
  );
}

// ```

// ---

// ## Tricky Interview Question on Custom Hooks:

// **Q: "Why should we avoid creating a custom hook for every single piece of logic?"**
// **A:** Abstraction comes with a cost. Every custom hook adds an extra layer to the **React DevTools**, an extra set of **Effect/State objects** in the Fiber tree, and a slight overhead in performance. If the logic is only used in *one* component and is simple, keeping it inline is often better for readability (the "Keep It Simple" principle). Only extract hooks when the logic is **complex**, **reusable**, or **testable in isolation**.


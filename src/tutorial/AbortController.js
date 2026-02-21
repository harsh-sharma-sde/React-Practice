// Here is how you handle the double-invocation using an `AbortController`. This is the "gold standard" for data fetching in React because it solves both **Strict Mode double-calls** and **Race Conditions**.

// ---

// ## 1. The "Senior" Fetch Pattern

// When the component mounts, Strict Mode triggers the effect. When it immediately unmounts to "test" you, the `cleanup` function runs, canceling the first request before the second one starts.

// ```javascript
useEffect(() => {
  // 1. Create the controller
  const controller = new AbortController();
  const signal = controller.signal;

  const fetchData = async () => {
    try {
      const response = await fetch('https://api.example.com/data', { signal });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Fetch aborted: Strict Mode or Unmount');
      } else {
        // Handle actual errors
      }
    }
  };

  fetchData();

  // 2. The Cleanup: This kills the request if the component unmounts
  return () => controller.abort();
}, []);

// ```

// ---

// ## 2. Why this is "Idempotent"

// * **The First Run:** React starts Fetch A.
// * **The Strict Mode "Swing":** React unmounts the component. The cleanup calls `abort()`. Fetch A is cancelled by the browser immediately.
// * **The Second Run:** React starts Fetch B. This one finishes and updates your state.
// * **Result:** Your UI doesn't flicker, and you don't have "ghost" data landing in your state from a component that technically shouldn't exist anymore.

// ---

// ## 3. Tricky Interview Questions on This Pattern

// ### Q1: "If the fetch is aborted, does the request still hit the server?"

// **The Answer:** **Yes.** `AbortController` stops the browser from *waiting* for the response and processing the result, but usually, the packet has already left the building. The server will likely still receive the request. To truly "stop" a server-side action, you need logic on the backend, but `AbortController` perfectly protects the frontend state.

// ### Q2: "What happens if I don't catch the 'AbortError'?"

// **The Answer:** Your console will be flooded with red errors. When you abort a fetch, the promise **rejects**. If you don't check `if (err.name === 'AbortError')`, your error handling logic (like showing an "Error!" toast message) will trigger every time the user navigates away from a page quickly.

// ### Q3: "Is there a way to avoid the double-fetch without AbortController?"

// **The Answer:** You can use a "Boolean Flag" (e.g., `let ignore = false`). Inside the effect, you check `if (!ignore) setResult(data)`. In the cleanup, you set `ignore = true`.
// **The Catch:** While this prevents the *state update*, it doesn't stop the *network traffic*. `AbortController` is superior because it actually tells the browser to drop the connection.

// ### Q4: "Why not just use a Ref to track if the effect has already run?"

// **The Answer:** This is a common "Junior" fix: `if (effectRan.current) return;`.
// **The Problem:** This defeats the purpose of Strict Mode. If your effect *needs* to run every time a component appears (like a WebSocket or an Animation), and you block it with a Ref, your app will fail when React introduces **Concurrent Rendering** or **Offscreen API**, where components are preserved in memory but unmounted from the DOM.

// ---


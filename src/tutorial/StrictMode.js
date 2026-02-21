// In a React interview, if you complain about `useEffect` running twice, the interviewer is checking to see if you understand **Side Effect Safety**.

// **Strict Mode** is a development-only tool that acts like a "stress test" for your components. It doesn't render any visible UI; it just activates extra checks and warnings.

// ---

// ## 1. Why `useEffect` Runs Twice? (The "Mount-Unmount-Mount" Cycle)

// In React 18+, when Strict Mode is on, React will intentionally:

// 1. **Mount** the component (Run effects).
// 2. **Unmount** the component (Run cleanup).
// 3. **Mount** it again (Run effects).

// **The Reason: Idempotency.**
// React is preparing for a future feature called **"Offscreen Rendering,"** where React might hide and show components without destroying their state (like switching tabs). To do this safely, your effects must be **idempotent**—meaning they can be started, stopped, and restarted multiple times without breaking the app.

// ---

// ## 2. Simple Example: The Chat Room

// Imagine you subscribe to a chat room in a `useEffect`.

// ```javascript
useEffect(() => {
  const connection = createConnection(roomId);
  connection.connect();

  return () => {
    connection.disconnect(); // THE CLEANUP
  };
}, [roomId]);

// ```

// * **If you forget the cleanup:** Strict Mode runs it twice. You now have **two** active connections. You'll see duplicate messages or memory leaks.
// * **With the cleanup:** React connects, immediately disconnects, and connects again. Your app still works perfectly. **Strict Mode caught your bug before it hit production.**

// ---

// ## 3. What Strict Mode Checks

// Beyond `useEffect`, Strict Mode helps identify:

// * **Unsafe Lifecycles:** Warns about deprecated methods like `componentWillMount`.
// * **Legacy API Usage:** Detects usage of `findDOMNode` or the old Context API.
// * **Unexpected Side Effects:** It double-invokes **Constructor**, **Render**, and **Functional State Updaters** to ensure they are "Pure Functions" (no outside mutations).

// ---

// ## 4. Tricky Interview Questions

// ### Q1: "How do I stop useEffect from running twice in production?"

// **The Trick:** It’s a trick question.
// **The Answer:** You don’t have to. Strict Mode **only runs in Development**. It is automatically stripped out of the production build. If your code breaks because of the double-run in dev, your code is technically "unstable" and will likely fail in production during edge-case re-renders.

// ### Q2: "What if I'm fetching data? Won't I make two API calls?"

// **The Answer:** Yes, you will see two network requests in your DevTools.
// **The Fix:** While you *could* use a `ref` to ignore the second call, the "React Way" is to ensure you have a **cleanup function** that aborts the fetch (using `AbortController`). This ensures that if a user clicks "Next" before the first request finishes, the old request doesn't overwrite the new data (Race Conditions).

// ### Q3: "Is Strict Mode the same as 'use strict' in JavaScript?"

// **The Answer:** No. `'use strict'` is a JavaScript engine directive that prevents things like using undeclared variables. **React Strict Mode** is a component wrapper (`<React.StrictMode>`) that specifically audits the React component lifecycle and rendering logic.

// ### Q4: "What happens if I put a `console.log` in my component body with Strict Mode on?"

// **The Answer:** You will see the log **twice**. React double-invokes the render function to ensure that your rendering logic is pure. If logging twice causes a problem, it means your render function is doing something it shouldn't (like modifying a global variable).

// ---


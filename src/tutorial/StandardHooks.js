// Moving from using hooks to understanding their memory management and execution timing is what separates senior developers from the rest. Let's break these down.

// ---

// ## 1. useState: The Dispatcher and the Snapshot

// When you call `useState`, React isn't just giving you a variable; it's giving you a **pointer** to a slot in the Fiber's memory.

// ### Batch Updates & The Snapshot

// State in React behaves like a **snapshot**. When you trigger an update, React doesn't change the variable in your current function execution; it schedules a *new* execution with the *new* value.

// ```javascript
function Counter() {
  const [count, setCount] = useState(0);

  const handleAlertClick = () => {
    setTimeout(() => {
      // If count was 0 when clicked, it stays 0 here 
      // even if the UI has updated to 10 in the meantime!
      alert('You clicked on: ' + count);
    }, 3000);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Add</button>
      <button onClick={handleAlertClick}>Show Alert</button>
    </div>
  );
}

// ```

// ### Tricky Interview Question:

// **Q: "If I call `setCount(count + 1)` and immediately `console.log(count)`, what happens?"**
// **A:** You see the **old** value. The current function execution is a "snapshot" of the state at the time the render started. The update is "asynchronous" from the perspective of the current function.

// ---

// ## 2. useEffect vs. useLayoutEffect

// The difference is entirely about **when** they run relative to the browser's "Paint" cycle.

// * **`useEffect` (Post-Paint):** It is **asynchronous**. React renders the component, updates the DOM, and the browser **paints** it to the screen. *Only then* does `useEffect` run. This prevents blocking the UI.
// * **`useLayoutEffect` (Pre-Paint):** It is **synchronous**. It runs after React performs DOM mutations but **before** the browser paints the changes to the screen.

// ### When to use useLayoutEffect?

// If you are measuring the size of a DOM element (like a tooltip) and then moving it based on that size. If you used `useEffect`, the user would see the tooltip in the "wrong" place for one frame, then jump to the "right" place (**flicker**). `useLayoutEffect` ensures the user only sees the final result.

// ---

// ## 3. useRef: More than just "DOM handles"

// A `ref` is essentially a **box** where you can store any mutable value that persists for the full lifetime of the component, but **does not trigger a re-render** when changed.

// ### Accessing DOM vs. Mutable Variables

// 1. **DOM Access:** Passing the ref to a `ref={myRef}` prop. React populates `.current` with the actual DOM node after the commit phase.
// 2. **Mutable Storage:** Storing a timer ID or a previous value.

// ```javascript
function Timer() {
  const [seconds, setSeconds] = useState(0);
  const timerId = useRef(); // A mutable "box"

  const startTimer = () => {
    timerId.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerId.current); // Accessing the value without a re-render
  };
  
//   // ...
// }

// ```

// ---

// ## 4. Tricky Interview Questions

// ### Q1: "Why can't I use `useLayoutEffect` on the server (SSR)?"

// **The Answer:** Because the server doesn't have a "Paint" cycle. `useLayoutEffect` relies on the physical DOM layout being calculated. If you use it in SSR, React will warn you because the server-side HTML won't "wait" for that effect to run, potentially leading to a mismatch during hydration.

// ### Q2: "Can you recreate `useState` using `useRef`?"

// **The Trick:** It's about triggering a render.
// **The Answer:** You can store the value in a `ref`, but changing it won't update the screen. To make it work like `useState`, you would need to also call a dummy `forceUpdate` (like a state toggle) every time you change the ref's value. This proves that `useState` = `useRef` + `triggerRender()`.

// ### Q3: "I have a `useEffect` with an empty dependency array. Is it guaranteed to run only once?"

// **The Answer:** In Production? **Yes.** In Development with Strict Mode? **No**, it runs twice (as we discussed). Additionally, if the component's `key` changes, the component unmounts and remounts, causing the "mount" effect to run again.

// ### Q4: "What happens if I update a Ref during the 'Render' phase?"

// **The Answer:** **Don't do it.** React expects the render phase to be a "pure" calculation. Writing to `ref.current` during the body of your function makes your component's behavior unpredictable and "impure." You should only write to refs inside `useEffect`, `useLayoutEffect`, or event handlers.

// ---


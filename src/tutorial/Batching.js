// Batching is React's way of grouping multiple state updates into a **single re-render** for better performance. Think of it like a waiter at a restaurant: instead of running to the kitchen every time you order one item (water, then bread, then soup), they wait until you've finished your order and take the whole list to the chef at once.

// ---

// ## 1. Legacy Batching (React 17 and earlier)

// Before React 18, React was "picky" about when it batched. It only batched updates inside **React event handlers** (like `onClick` or `onChange`).

// * **Batched:** Updates inside a standard `handleClick`.
// * **NOT Batched:** Updates inside promises (`.then()`), `setTimeout`, or native DOM event listeners. In these cases, React would render twice—once for every state update.

// ---

// ## 2. Automatic Batching (React 18+)

// React 18 introduced **Automatic Batching**. Now, no matter where the state updates originate—a fetch call, a timeout, or a click—React will group them into one render.

// ### The Comparison Example:

// ```javascript
function App() {
  const [count, setCount] = useState(0);
  const [flag, setFlag] = useState(false);

  function handleClick() {
    fetch('/api').then(() => {
      // React 17: Renders TWICE (One for each set)
      // React 18: Renders ONCE (Batched)
      setCount(c => c + 1);
      setFlag(f => !f);
    });
  }

  return <button onClick={handleClick}>Click Me</button>;
}

// ```

// ---

// ## 3. How to Opt-Out (flushSync)

// Sometimes, you *need* the DOM to update immediately after a state change (e.g., to measure the position of a newly rendered element). You can use `flushSync` to force an immediate, non-batched render.

// ```javascript
import { flushSync } from 'react-dom';

function handleClick() {
  flushSync(() => {
    setCount(c => c + 1); // React renders this NOW
  });
  // DOM is updated here
  setFlag(f => !f); // React renders this separately
}

// ```

// ---

// ## 4. Tricky Interview Questions

// ### Q1: "If I call `setCount(count + 1)` three times in a row in one function, why does the count only go up by 1?"

// **The Answer:** This is a classic "Snapshot" trick. Because of batching and the way closures work, `count` is a constant value for the duration of that specific render. Each call is essentially saying `setCount(0 + 1)`.
// **The Fix:** Use the functional updater: `setCount(prev => prev + 1)`. Even though the updates are batched, React chains these functions together in a queue.

// ### Q2: "Does Automatic Batching work with `async/await`?"

// **The Answer:** **Yes.** In React 18, any updates after an `await` keyword are automatically batched. In React 17, as soon as you hit an `await`, React "loses track" of the execution context and stops batching.

// ### Q3: "Does batching happen across different components?"

// **The Answer:** **Yes.** If a single event triggers state changes in three different components, React 18 will batch all of them into one single "Commit" phase. This prevents the "partial UI update" where one component updates before another.

// ### Q4: "What is the 'Microtask' connection to batching?"

// **The Answer:** Under the hood, React uses microtasks (like `Promise.resolve().then()`) to schedule the batch. It waits for the current synchronous code to finish executing before it triggers the reconciliation process. This is why you can have 10 state updates in a row and only see one log from your render function.

// ---


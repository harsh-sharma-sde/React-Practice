// Optimization hooks are often the most misused features in React. Many developers think "more memoization = more performance," but every hook carries a **memory and complexity cost**.

// Here is the breakdown of how to use them strategically rather than blindly.

// ---

// ## 1. useMemo vs. useCallback: The "Box" Analogy

// Both hooks are about **referential stability**—ensuring that a value doesn't change its "identity" between renders.

// * **`useMemo`:** Memoizes the **result** of a function (a value). Use it for expensive calculations (e.g., sorting 10k rows).
// * **`useCallback`:** Memoizes the **function itself**. Use it to prevent child components from re-rendering when you pass them a callback.

// ### Simple Example:

// ```javascript
const memoizedValue = useMemo(() => expensiveCalculation(data), [data]);

const memoizedCallback = useCallback(() => {
  doSomething(memoizedValue);
}, [memoizedValue]);

// ```

// ---

// ## 2. React.memo: The Gatekeeper

// `React.memo` is a **Higher-Order Component (HOC)**. It wraps a component and tells React: "Only re-render this child if its props have actually changed."

// ### The "Broken" Memo Trap:

// If you wrap a child in `React.memo` but pass it an inline function from the parent, the memo is **useless**.

// ```javascript
// Parent
function Parent() {
  // New function created on EVERY render
  const handleClick = () => console.log("Click!"); 

  return <MemoizedChild onClick={handleClick} />;
}

// ```

// Because the `handleClick` reference is new every time, `React.memo` sees a "new" prop and triggers a re-render. This is where `useCallback` becomes necessary.

// ---

// ## 3. When NOT to use them (The "Cost" of Optimization)

// Optimization isn't free. Using these hooks everywhere can actually **slow down** your app.

// 1. **Cheap Calculations:** Summing an array of 10 numbers is faster than the overhead of React setting up a `useMemo` cache and comparing dependency arrays.
// 2. **Host Components:** Don't memoize props passed to standard HTML tags (e.g., `<button onClick={useCallback(...)} />`). React's internal `button` doesn't care about referential stability; it’s going to update the DOM anyway.
// 3. **Always Changing Props:** If a component’s props change on every render (like a `timer` or `input` value), `React.memo` is just a wasted check that always returns "True, please re-render."

// ---

// ## 4. Tricky Interview Questions

// ### Q1: "Does `useMemo` guarantee that the value will never be recalculated unless dependencies change?"

// **The Answer:** **No.** React's documentation explicitly states that React may choose to release the memory allocated to a `useMemo` value and recalculate it on the next render to free up resources. It is a **performance hint**, not a semantic guarantee.

// ### Q2: "Which is more expensive: a re-render or a `useMemo` check?"

// **The Answer:** It depends. A re-render of a simple `<span>` is incredibly cheap. The overhead of `useMemo` (storing the value in memory and iterating through a dependency array to compare references) might actually be more "work" for the CPU than just letting the virtual DOM do its thing.

// ### Q3: "If I wrap a component in `React.memo`, does it also memoize its children?"

// **The Answer:** **No.** `React.memo` only prevents the wrapped component from re-rendering if *its own props* are the same. If that component uses `props.children` and the parent passes new JSX, the memoized component will still re-render because `children` is a new object every time.

// ### Q4: "How do you memoize a component that takes an object as a prop?"

// **The Answer:** `React.memo` does a **shallow comparison**. If the object is `{ id: 1 }`, a new object literal in the parent will break the memo.
// **Solutions:**

// 1. Use `useMemo` in the parent to keep the object reference stable.
// 2. Pass the individual properties instead of the whole object (`id={data.id}`).
// 3. Provide a **custom comparison function** as the second argument to `React.memo(Component, (prev, next) => prev.id === next.id)`.

// ---


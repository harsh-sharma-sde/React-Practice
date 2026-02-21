// In React 18 and 19, the focus shifted from "how do we render" to **"how do we prioritize rendering."** These hooks are the knobs and dials of Concurrent React.

// ---

// ## 1. useTransition: The "Urgency" Filter

// `useTransition` allows you to mark a state update as **non-urgent**. This tells React it can interrupt the update if the user does something more important (like typing).

// * **The Logic:** It separates updates into **Transitions** (low priority) and **Urgent** updates (typing, clicking).
// * **The `isPending` state:** It provides a boolean to show a "loading" state while the transition is happening in the background.

// ### Simple Example:

// Imagine a search bar that filters 5,000 items. Typing should be instant; the list update can wait.

// ```javascript
const [isPending, startTransition] = useTransition();
const [query, setQuery] = useState("");
const [list, setList] = useState(bigList);

function handleChange(e) {
  // 1. Urgent: Update the input field immediately
  setQuery(e.target.value);

  // 2. Non-Urgent: Update the heavy list in the background
  startTransition(() => {
    setList(filterList(e.target.value));
  });
}

// ```

// ---

// ## 2. useDeferredValue: The "Debounce" Alternative

// `useDeferredValue` is similar to `useTransition`, but it’s used when you receive a value from a parent (via props) and you want to "de-prioritize" the re-render triggered by that value.

// * **How it works:** React will first try to render with the **old** value to keep the UI responsive, then render with the **new** value in the background.
// * **The Difference:** `useTransition` wraps the **code** that updates state; `useDeferredValue` wraps the **resultant value**.

// ### Simple Example:

// ```javascript
function SearchResults({ query }) {
  // deferredQuery will "lag behind" query while the user is typing
  const deferredQuery = useDeferredValue(query);
  
  return <MyHeavyList query={deferredQuery} />;
}

// ```

// ---

// ## 3. useId: The Hydration Savior

// `useId` generates unique IDs that are **stable across the server and the client**.

// * **The Problem:** If you use `Math.random()`, the ID generated on the Server (SSR) won't match the ID generated on the Client, causing a **Hydration Mismatch** error.
// * **The Solution:** `useId` ensures the ID is consistent and globally unique within the app tree, making it perfect for accessibility attributes like `htmlFor` and `aria-describedby`.

// ---

// ## 4. Tricky Interview Questions

// ### Q1: "Is `useTransition` just a fancy `setTimeout`?"

// **The Answer:** **No.** `setTimeout` is a "macrotask" that yields to the browser. Once it triggers, it blocks the main thread until it's finished. **`useTransition` is interruptible.** If React is halfway through rendering a transition and a new character is typed, React will **throw away** the partial render and start over with the new data. `setTimeout` cannot do that.

// ### Q2: "When should I use `useDeferredValue` instead of Debouncing (lodash)?"

// **The Answer:** * **Debounce/Throttle:** Fixed delays (e.g., wait 300ms). It forces a delay even if the computer is super fast.

// * **`useDeferredValue`:** Dynamic. On a fast computer, the "defer" happens almost instantly. On a slow phone, it stays deferred longer. It adapts to the user's hardware.

// ### Q3: "Can I use `useTransition` to control a controlled input's value?"

// **The Answer:** **Absolutely not.** If you wrap `setInputValue` in a transition, the input field will feel laggy or "glitchy" because the state update (and thus the visual text) is no longer urgent. Input state must always be urgent.

// ### Q4: "Does `useId` generate a CSS selector?"

// **The Answer:** Not reliably. `useId` often includes characters like `:` (e.g., `:r1:`) which are valid in HTML IDs but need to be escaped in CSS selectors. You should use it for connecting labels to inputs, not for styling.

// ### Q5: "What is the 'Action' integration in React 19 for useTransition?"

// **The Answer:** In React 19, `useTransition` now supports **Async functions**. You can wrap an `await fetch()` inside `startTransition`. While the promise is pending, `isPending` will be true, allowing you to handle loading states for data mutations (Actions) directly.

// ---


// Choosing a state management library in 2026 is about picking the right tool for the **subscription model**. While they all store data, the way they notify your components that data has changed is fundamentally different.

// ---

// ## 1. Redux (Toolkit)

// Redux is the "Industrial Grade" choice. It follows a strict **unidirectional data flow**: `Action -> Reducer -> Store -> UI`.

// * **Toolkit (RTK):** The modern standard. It removes the "boilerplate" (no more manual action types or constants) and uses **Immer** under the hood, allowing you to "mutate" state safely.
// * **Thunks/Sagas:** These are for side effects (API calls). **Thunks** are simple functions; **Sagas** use Generator functions () for complex, decoupled background tasks.

// **Best for:** Massive apps with complex logic where you need a "Time Travel" debugger to see exactly how state changed.

// ---

// ## 2. Zustand

// The "Cool Kid" of state management. It’s a tiny, hook-based library that provides the power of Redux with 10% of the code.

// * **The Magic:** Unlike Context, Zustand has a **built-in selector system**. If you only select `state.user`, the component won't re-render when `state.theme` changes.
// * **No Provider:** You don't need to wrap your app in a Provider. You can even access state outside of React (in vanilla JS).

// **Best for:** Most modern projects. It’s fast, simple, and avoids "Context Hell."

// ---

// ## 3. Recoil (Atomic State)

// Recoil introduces the concept of **Atoms** (units of state) and **Selectors** (derived state).

// * **Logic:** Instead of one big "Store," state is broken into tiny pieces (atoms). Components subscribe to specific atoms.
// * **Graph-based:** If Atom A changes, only the Selectors and Components depending on A update.

// **Best for:** Apps with highly interdependent data (like a Canvas editor or a Spreadsheet).

// ---

// ## 4. Comparison Table

// | Feature | Context API | Redux Toolkit | Zustand | Recoil |
// | --- | --- | --- | --- | --- |
// | **Learning Curve** | Low | High | Very Low | Medium |
// | **Boilerplate** | Low | Medium | Minimal | Low |
// | **Performance** | O(n) Re-renders | O(1) Selectors | O(1) Selectors | O(1) Atoms |
// | **Best Use Case** | Themes, Auth | Enterprise Apps | General State | Complex Data Graphs |

// ---

// ## 5. Simple Example: The Counter

// ### Redux Toolkit

// ```javascript
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: { increment: (state) => { state.value += 1 } }
});
// Usage: const count = useSelector(state => state.counter.value);

// ```

// ### Zustand

// ```javascript
const useStore = create((set) => ({
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
}));
// Usage: const count = useStore(state => state.count);

// ```

// ---

// ## 6. Tricky Interview Questions

// ### Q1: "Why would I choose Redux Saga over Redux Thunk?"

// **The Answer:** Thunks are great for simple `async/await`. **Sagas** are better for complex race conditions, canceling requests, or "listening" for specific actions to trigger other actions. Sagas treat side effects as a separate background thread (using Generator functions), which keeps your component logic pure.

// ### Q2: "Zustand doesn't use a Provider. How does it keep state consistent across components?"

// **The Answer:** Zustand lives in a **Closure** outside of the React lifecycle. It maintains a set of "listeners." When you call `set()`, it manually triggers a re-render *only* for the components that subscribed to the specific keys that changed.

// ### Q3: "What is the 'Zombie Child' problem in Redux?"

// **The Answer:** It’s a rare edge case where a child component is deleted by a parent, but the child’s Redux subscription triggers one last time before it unmounts, trying to access data that no longer exists. Modern Redux Toolkit (and Zustand) have internal logic to prevent this, but it’s a classic "senior" interview trap.

// ### Q4: "Recoil uses 'Selectors'—how is that different from a standard function?"

// **The Answer:** Recoil Selectors are **memoized**. If the underlying Atoms don't change, the Selector doesn't re-calculate. More importantly, they can be **asynchronous**, allowing you to treat a piece of state like a data-fetch that automatically re-triggers when its dependencies change.

// ### Q5: "If I use Zustand, do I still need Context?"

// **The Answer:** Not for state. However, you might still use Context for **Dependency Injection** (like passing a specific API client instance) or for data that is unique to a specific *subtree* rather than the whole app.

// ---


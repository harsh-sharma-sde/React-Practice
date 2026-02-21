// The **Context API** is often mistaken for a state management library like Redux or Zustand. In reality, Context is a **dependency injection** mechanism. It doesn't "manage" state; it simply "transports" it.

// Under the hood, this transportation comes with a heavy performance tax if not architected correctly.

// ---

// ## 1. The "Re-render Storm" Problem

// The biggest performance issue with Context is its **all-or-nothing** nature. When a Provider's `value` changes, **every single component** that calls `useContext(MyContext)` will re-render, even if it only uses a tiny piece of the data that *didn't* change.

// ### The "Bloated Object" Example

// Imagine a Context that holds both a `user` object and a `theme` string.

// ```javascript
const AppContext = createContext();

function App() {
  const [user, setUser] = useState({ name: 'Jane' });
  const [theme, setTheme] = useState('dark');

  // Every time 'theme' changes, a NEW object is created here
  const value = { user, setUser, theme, setTheme };

  return (
    <AppContext.Provider value={value}>
      <Sidebar />
      <Profile />
    </AppContext.Provider>
  );
}

// ```

// If you update the `theme` from "dark" to "light":

// 1. The `App` component re-renders.
// 2. The `value` object is re-created (new reference).
// 3. The `Sidebar` (which uses `theme`) re-renders. **(Correct)**
// 4. The `Profile` (which only uses `user`) **ALSO re-renders**. **(This is the "Storm")**

// ---

// ## 2. Optimization Patterns

// ### Pattern A: Context Splitting

// The simplest fix is to separate data that changes at different rates. Don't put your "User Auth" in the same provider as your "Real-time Notifications."

// ```javascript
<UserProvider>
  <ThemeProvider>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </ThemeProvider>
</UserProvider>

// ```

// ### Pattern B: The "Memoized Provider"

// Wrap the value in `useMemo` so that the reference only changes when the actual data changes.

// ```javascript
// const value = useMemo(() => ({ user, theme }), [user, theme]);

// ```

// ### Pattern C: The "Component Composition" Fix

// If you pass components as `children` to a Provider, the components *inside* children won't re-render unless they explicitly consume the context.

// ---

// ## 3. Tricky Interview Questions

// ### Q1: "Does `React.memo` stop a component from re-rendering if the Context it consumes changes?"

// **The Answer:** **No.** This is a very common misconception. `React.memo` only checks if **props** have changed. `useContext` is like a "hidden" state hook. If the context value changes, React bypasses `memo` and forces the component to update.

// ### Q2: "Why is it often recommended to pass a `dispatch` function instead of a 'setState' function in Context?"

// **The Answer:** If you use `useReducer`, the `dispatch` function is **guaranteed to be stable** (it never changes references). By passing `dispatch` down through context, you can ensure that components calling it don't re-render due to function reference changes.

// ### Q3: "Can you use Context to replace Redux entirely?"

// **The Answer:** For small to medium apps, yes. But for high-frequency updates (like a stock ticker or a mouse-tracking position), **Context is bad**. Redux/Zustand allow for **"Selector-based subscriptions,"** where a component only listens to one specific property. In Context, you listen to the whole object or nothing.

// ### Q4: "What happens if you use a Context Provider without a 'value' prop?"

// **The Answer:** The components consuming it will receive `undefined`. They will **not** fall back to the "defaultValue" provided in `createContext(defaultValue)`. The default value is only used if a component tries to consume a context but there is **no Provider** at all above it in the tree.

// ---

// ## Final Senior Tip: The "Selector" Pattern

// If you absolutely must use one large Context, you can create a "wrapper" component that uses `React.memo` and passes only the specific piece of context needed down as a prop.

// ```javascript
function ProfileWrapper() {
  const { user } = useContext(AppContext); // Re-renders often
  return <MemoizedProfile user={user} />; // Only re-renders if 'user' changes
}

// ```


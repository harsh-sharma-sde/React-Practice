// In modern React, if a JavaScript error occurs during rendering, the entire component tree unmounts (the "White Screen of Death"). **Error Boundaries** are your safety net—they catch errors in their child components, log them, and display a fallback UI instead of letting the whole app crash.

// ---

// ## 1. Why Class Components?

// This is a common "Aha!" moment: **Error Boundaries must be Class Components.** As of 2026, there is no functional hook equivalent for `getDerivedStateFromError` or `componentDidCatch`. If you want to handle errors, you have to go "Old School."

// ### The Two Critical Methods:

// 1. **`static getDerivedStateFromError(error)`**: Used to update state so the next render shows the **fallback UI**. It’s called during the "Render" phase (keep it pure).
// 2. **`componentDidCatch(error, info)`**: Used to log error information to services like Sentry or LogRocket. It’s called during the "Commit" phase (side effects allowed).

// ---

// ## 2. Simple Example: The "Safe" Wrapper

// ```javascript
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.log("Logged Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children; 
  }
}

// Usage
function App() {
  return (
    <ErrorBoundary>
      <HeavyChart /> 
    </ErrorBoundary>
  );
}

// ```

// ---

// ## 3. What Error Boundaries Do NOT Catch

// This is the most important "Under the Hood" detail. Error Boundaries only catch errors that happen **during the React lifecycle** (rendering, lifecycle methods, and constructors).

// They **do not** catch:

// * **Event handlers** (e.g., an error inside `onClick`).
// * **Asynchronous code** (e.g., `setTimeout` or `requestAnimationFrame`).
// * **Server-side rendering**.
// * **Errors thrown in the Error Boundary itself** (rather than its children).

// ---

// ## 4. Tricky Interview Questions

// ### Q1: "If Error Boundaries don't catch errors in event handlers, how should we handle them?"

// **The Answer:** You use regular `try/catch` blocks inside your event handlers. Error Boundaries are for **declarative** errors (the UI failing to build), while `try/catch` is for **imperative** errors (the user action failing).

// ### Q2: "Can you use one Error Boundary at the top of the app and be done?"

// **The Answer:** You *could*, but it's bad UX. If a tiny "User Avatar" component crashes, the entire app disappears.
// **The Senior Approach:** Wrap independent features (Sidebar, Feed, Navbar) in their own boundaries. This allows the rest of the app to remain functional even if one part fails.

// ### Q3: "What is the difference between `getDerivedStateFromError` and `componentDidCatch`?"

// **The Answer:** Timing and Purpose.

// * `getDerivedStateFromError` is **synchronous** and happens during rendering. Its only job is to return a new state to trigger the fallback UI.
// * `componentDidCatch` happens after the error is caught, allowing for **side effects** like logging or analytics.

// ### Q4: "How do you 'reset' an Error Boundary without refreshing the page?"

// **The Answer:** You can provide a "Try Again" button in the fallback UI that resets the Error Boundary’s state (`hasError: false`). However, you must ensure that the underlying issue (the bad data) is also resolved, or it will just crash again.

// ---

// ### **Final Boss Scenario: The Architect's Decision**

// You've built the "Real-time Crypto Dashboard" we discussed. Now, imagine the **Price Feed API** occasionally sends malformed JSON.

// 1. Where would you place the Error Boundary?
// 2. How would you handle the fact that `useQuery` (from TanStack Query) might throw an error when fetching?
// 3. Would you prefer a Global Error Boundary or a per-component boundary for the "Buy Order" form?


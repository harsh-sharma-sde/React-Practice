// Concurrency in React 19 is about moving from a "blocking" model to a "cooperative" one. It allows React to work on multiple versions of the UI at the same time and decide which one is the most important.

// ---

// ## 1. Interruptible Rendering (The "Time-Slicing")

// In the old Stack Reconciler, rendering was a synchronous loop. Once it started, it couldn't be stopped.

// **How it works now:** React breaks the rendering work into small chunks. After each chunk, it "yields" back to the browser's main thread. It basically asks: *"Hey, did the user just try to click something or type?"*

// * If **Yes**: React pauses the current render, handles the user event, and then either resumes or throws away the old work.
// * If **No**: It continues the next chunk of rendering.

// ---

// ## 2. Lanes: The Priority Map

// Lanes are how React prioritizes different types of updates. Think of it like a multi-lane highway where different vehicles have different speeds and priorities.

// Instead of just "High" or "Low" priority, React uses a **31-bit mask** (Lanes).

// * **Sync Lane:** Highest priority (User typing, Discrete inputs).
// * **InputContinuous Lane:** Moving a slider or scrolling.
// * **Default Lane:** Data fetching, state updates.
// * **Idle Lane:** Low-priority background tasks (Offscreen rendering).

// **Under the hood:** React can "bundle" lanes together or "overlap" them. If a high-priority lane comes through, React can pause a lower-priority lane, finish the urgent one, and then return to the previous one.

// ---

// ## 3. Suspense Streaming & Selective Hydration (SSR)

// In traditional SSR, the process was a "Waterfall of Misery":

// 1. **Fetch** all data on the server.
// 2. **Render** the whole app to HTML.
// 3. **Send** the whole HTML to the client.
// 4. **Hydrate** the whole app (attach event listeners).

// If *one* component was slow (like a "Recommended Products" API), the whole page stayed blank.

// ### Streaming SSR

// With React 19 and Suspense, React can send the HTML in **chunks**.

// * It sends the "Shell" (Navbar, Sidebar) immediately.
// * It leaves a "hole" for the slow component with a `<script>` tag.
// * Once the data for the slow component is ready, React "streams" the HTML and a small bit of JS to "pop" that component into the right place.

// ### Selective Hydration

// If the HTML for the sidebar and the feed has arrived, but the feed is still hydrating, and the user **clicks** the sidebar, React will **prioritize hydrating the sidebar** so it can respond to the click immediately. It "jumps the queue" based on user intent.

// ---

// ## 4. Tricky Interview Questions

// ### Q1: "Does Concurrency make the code run faster?"

// **The Answer:** **No.** It actually makes the code run slightly slower because of the overhead of checking priorities and yielding to the main thread. However, it makes the **User Experience** much faster because the UI remains responsive and doesn't "freeze" during heavy calculations.

// ### Q2: "What is a 'Tearing' issue in Concurrent React?"

// **The Answer:** Tearing happens when a component renders with one value, but before the render finishes, an external store (like Redux or a global variable) updates, causing another component to render with a *different* value. This results in a "torn" UI.
// **The Fix:** React introduced `useSyncExternalStore` to ensure that updates from non-React stores are handled safely in concurrent mode.

// ### Q3: "How does Suspense work on the Client vs. the Server?"

// **The Answer:**

// * **Client:** Suspense catches a "promise" thrown by a data-fetching library. It shows the fallback until the promise resolves.
// * **Server:** Suspense marks a "boundary." Everything outside the boundary is sent as HTML immediately; everything inside is streamed later once the data is ready.

// ### Q4: "Can you explain 'Transition Entanglement'?"

// **The Answer:** If you start two different transitions (`startTransition`), React might "entangle" them and wait for both to finish before showing the UI to avoid showing an inconsistent state where only half the page is updated.

// ---

// ### **The Final Boss Architect's Review**

// We have covered the entire "Under the Hood" journey of React. You now understand:

// 1. **The Pulse:** Fiber & Reconciliation.
// 2. **The Logic:** Hooks, Context, & State Management.
// 3. **The Performance:** Memoization, Windowing, & Code Splitting.
// 4. **The Safety:** Error Boundaries & Strict Mode.
// 5. **The Future:** Concurrency, Lanes, & Streaming SSR.


// When we talk about performance in React, we are usually solving for two bottlenecks: **Network** (how much code the user downloads) and **The Main Thread** (how much work the browser has to do to render).

// ---

// ## 1. Code Splitting: React.lazy & Suspense

// By default, Webpack/Vite bundles your entire app into one giant JavaScript file. **Code Splitting** breaks that file into smaller "chunks" that are only downloaded when needed.

// * **How it works:** `React.lazy` tells React to load a component dynamically. `Suspense` acts as a "boundary" that shows a fallback UI (like a spinner) while the chunk is traveling over the network.

// ### Simple Example:

// ```javascript
import { lazy, Suspense } from 'react';

// This component is in a separate .js file and won't load until needed
const HeavyChart = lazy(() => import('./HeavyChart'));

function Dashboard() {
  return (
    <Suspense fallback={<div>Loading Chart...</div>}>
      <HeavyChart />
    </Suspense>
  );
}

// ```

// ---

// ## 2. Virtualization (Windowing)

// If you try to render 10,000 `<div>` nodes, the browser's DOM engine will choke. Most of those nodes aren't even visible on the screen.

// * **The Concept:** **Virtualization** only renders the items currently inside the "window" (the visible area). As you scroll, it swaps out the data in those few DOM nodes rather than creating new ones.
// * **The Library:** `react-window` is the industry standard for this.

// ### Simple Example:

// ```javascript
import { FixedSizeList as List } from 'react-window';

const Row = ({ index, style }) => (
  <div style={style}>Row {index}</div> // style handles the absolute positioning
);

const MyList = () => (
  <List
    height={500}
    itemCount={10000} // Total items
    itemSize={35}     // Height of each row
    width={300}
  >
    {Row}
  </List>
);

// ```

// ---

// ## 3. Memoization (The Triple Threat)

// We’ve touched on these, but in the context of performance, think of them as **Referential Anchors**:

// 1. **React.memo:** Prevents a component from re-rendering if its props are the same.
// 2. **useMemo:** Prevents an expensive calculation (e.g., sorting) from re-running.
// 3. **useCallback:** Prevents a function from being re-created, which helps `React.memo` stay effective.

// ---

// ## 4. Tricky Interview Questions

// ### Q1: "Where should you place your Suspense boundary for the best UX?"

// **The Answer:** It depends on the "Granularity." If you put it at the very top, the whole page disappears for a spinner. If you put it specifically around a small component (like a `CommentSection`), the user can still interact with the rest of the page. This is called **Selective Hydration** in React 18.

// ### Q2: "In `react-window`, why is the `style` prop passed to the Row component so important?"

// **The Answer:** The `style` prop contains the `position: absolute` and `top` values. Without it, all 10,000 items would stack on top of each other at the top of the list. The library calculates exactly where each row should live based on the scroll position.

// ### Q3: "Does Code Splitting always make an app faster?"

// **The Answer:** **No.** If you split every tiny component into its own chunk, you end up with hundreds of network requests. Each request has "overhead" (TCP handshake, headers). You should split at the **Route level** or for **Heavy Third-party Libraries** (like PDF generators or Charts).

// ### Q4: "What is the difference between 'Pre-fetching' and 'Lazy Loading'?"

// **The Answer:** * **Lazy Loading:** Loading code only when the user clicks/views it.

// * **Pre-fetching:** Loading code in the background *before* the user needs it (e.g., loading the "Profile" chunk while the user is hovering over the "Profile" button). You can do this with `<link rel="prefetch">` or dynamically calling `import()`.

// ### Q5: "If I use useMemo, is the value kept in memory forever?"

// **The Answer:** No. React may discard the memory allocated to `useMemo` to free up space for other tasks and recalculate it later. It is a **Performance Optimization**, not a **Semantic Guarantee**. Never rely on `useMemo` to preserve state you can't afford to lose.

// ---


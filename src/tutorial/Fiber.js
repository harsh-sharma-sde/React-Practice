// ## 1. The Fiber Architecture: The "Heartbeat"

// Before React 16, the reconciliation process was "Stack-based"—it was synchronous and couldn't be interrupted. If you had a massive component tree, the browser would freeze until the work was done.

// **Fiber** changed this by introducing **incremental rendering**. It breaks down "work" (updates) into small units.

// * **The Data Structure:** A Fiber is a plain JavaScript object that contains information about a component, its state, and its DOM counterpart.
// * **The Pause Button:** Fiber allows React to pause work to handle high-priority events (like a user typing) and come back to low-priority work (like rendering a long list) later.
// * **Two-Phase Processing:**
// 1. **Render Phase (Asynchronous):** React walks the tree and calculates changes. This can be paused or discarded.
// 2. **Commit Phase (Synchronous):** React applies those changes to the DOM. This is never interrupted to avoid an inconsistent UI.



// ---

// ## 2. Reconciliation & The Diffing Algorithm

// When a component's state changes, React doesn't just throw away the DOM. It performs "Diffing" to find the smallest set of changes needed.

// * **Heuristic O(n):** A full tree comparison is . React uses a heuristic algorithm that brings it down to  by making two assumptions:
// 1. Two elements of different types will produce different trees.
// 2. The developer can provide a `key` prop to hint at which elements are stable across renders.


// * **The Comparison:** React compares the "Current" tree (what’s on screen) with the "Work-in-Progress" tree. If a `<div>` changes to a `<span>`, React destroys the whole branch. If only an `id` changes, it only updates the attribute.

// ---

// ## 3. The Hook "LinkedList"

// Ever wonder why you can't put `useState` inside an `if` statement? It’s because of how React stores them under the hood.

// * **Order Matters:** For every component instance, React maintains a **linked list of hook objects**.
// * **The Pointer:** When a component renders, React has a pointer (e.g., `currentlyRenderingFiber.memoizedState`).
// * **Execution:** Each time you call a hook, React reads the current hook object, moves the pointer to the next one, and returns the value. If you skip a hook via a conditional, the pointer gets out of sync with the data, and your `state` ends up in the wrong variable.

// ---

// ## 4. Synthetic Event System

// React doesn't actually attach event listeners to your `<button>` elements.

// * **Event Delegation:** React attaches a single event listener at the root of your document (or the root of your React tree).
// * **SyntheticEvent:** When you click a button, the native browser event bubbles up to the root. React intercepts it, wraps it in a `SyntheticEvent` (a cross-browser wrapper), and then dispatches it to your specific handler.
// * **Why?** This improves performance by reducing memory overhead and ensures consistent behavior across Chrome, Safari, and Firefox.

// ---

// To understand **Fiber**, you have to understand the problem it solved. Before Fiber (React 15), React used the **Stack Reconciler**. Like a real stack, once it started updating a deep component tree, it couldn't stop. If a user tried to click a button or type while the "stack" was busy, the browser would lag because the Main Thread was held hostage.

// **Fiber is React's custom implementation of a virtual stack frame.** It allows React to treat rendering like a "todo list" that can be paused, prioritized, or thrown away.

// ---

// ## 1. Incremental Rendering (The "Time-Slicing")

// Think of React as a chef.

// * **Old React (Stack):** The chef starts a 10-course meal and refuses to answer the phone or talk to waiters until all 10 courses are plated.
// * **Fiber React:** The chef prepares one course, checks if there are urgent orders (user clicks), handles them, and then goes back to the meal.

// **Incremental Rendering** means breaking the work into "chunks" (Fiber nodes) and spreading them over multiple frames. This keeps the UI responsive even during heavy updates.

// ---

// ## 2. The Two Phases

// Fiber operates in two distinct worlds: **Render** and **Commit**.

// ### Phase 1: The Render Phase (The "Drafting" Phase)

// * **Goal:** Determine what needs to change.
// * **Nature:** **Asynchronous and Interruptible.** * **Under the hood:** React walks the Fiber tree and creates a "Work-in-Progress" tree. If a higher-priority task (like an animation) comes in, React pauses this phase, handles the high-priority task, and then either resumes or restarts the render phase.
// * **Side Effects:** None. This phase is "pure." No DOM changes happen here.

// ### Phase 2: The Commit Phase (The "Publishing" Phase)

// * **Goal:** Apply changes to the DOM.
// * **Nature:** **Synchronous and Non-interruptible.**
// * **Under the hood:** React takes the list of changes (the "Effect List") and applies them to the actual DOM in one go. You cannot pause this, because pausing mid-DOM update would result in a "torn" or inconsistent UI (e.g., a header updates but the sidebar doesn't).

// ---

// ## 3. Simple Example: The Long List

// Imagine you have a search bar that filters a list of 10,000 items.

// 1. **User types "A".**
// 2. **Fiber** starts the **Render Phase** to calculate which items to show.
// 3. Midway through, the **User types "B".**
// 4. The browser receives a new input event (High Priority).
// 5. **Fiber pauses** the calculation for "A," handles the "B" input so the typing feels smooth, and then restarts the calculation for "B."

// ---

// ## 4. Tricky Interview Questions

// ### Q1: "Why can the Render phase be called multiple times, but the Commit phase only once?"

// **The Answer:** Since the Render phase is interruptible, React might start rendering, get interrupted by a higher-priority update, and then have to restart from the beginning to ensure the data is fresh. However, the Commit phase involves the real DOM. If you ran it multiple times or interrupted it, the user would see a partially updated, "broken" UI.

// ### Q2: "What is a 'Fiber' in technical terms? Is it just a VDOM node?"

// **The Answer:** A Fiber is more than a VDOM node. It is an **unit of work**. While a VDOM node describes the element, a Fiber node contains:

// * **State and Props:** Data for that component.
// * **Effect Tag:** A "sticky note" saying what needs to happen (e.g., `Placement`, `Update`, `Deletion`).
// * **Pointers:** Links to the `return` (parent), `child`, and `sibling`. This linked-list structure is what allows React to traverse the tree without using the JS call stack.

// ### Q3: "Does Fiber make the actual rendering faster?"

// **The Answer:** Not necessarily. Fiber doesn't make the math faster; it makes the **user experience** feel faster. It optimizes for "perceived performance" by prioritizing visual feedback (typing, clicking) over background data processing.

// ### Q4: "What is 'Double Buffering' in React Fiber?"

// **The Answer:** It's a technique borrowed from graphics programming. React maintains two trees: the **Current Tree** (what’s on screen) and the **Work-in-Progress Tree**. React does all the "messy" work on the WIP tree. Once it's finished, it simply swaps the pointer so the WIP tree becomes the Current tree. This makes the final UI transition instantaneous.

// ---

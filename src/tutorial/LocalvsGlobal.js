// In React, the "Location" of your state determines how much work your application has to do to keep the UI in sync. The rule of thumb is: **Keep state as local as possible, but as global as necessary.**

// ---

// ## 1. Local State (The "Default")

// Local state lives inside a single component. It is the most performant because when it changes, **only that component and its children re-render.**

// **Use Case:** A toggle switch, an input field, or an "isHovered" state.

// ---

// ## 2. Lifting State Up

// When two sibling components need to share the same data, you move the state to their **nearest common parent**.

// ### Simple Example: The Temperature Converter

// If you have an `Input` for Celsius and an `Input` for Fahrenheit, they both need to stay in sync. Neither can "own" the state because they both need to read and write to it.

// * **The Solution:** Move the `temperature` state to the `BoilingVerdict` parent.

// ---

// ## 3. Prop Drilling (The "Problem")

// Prop drilling occurs when you have to pass data through multiple layers of "middleman" components that don't actually need the data—they just pass it along to a deep child.

// **Why it’s bad:** 1.  **Maintenance:** If you rename a prop, you have to rename it in 5 different files.
// 2.  **Performance:** Every "middleman" component re-renders when that prop changes, even though they don't use the data.

// ---

// ## 4. Context API: The Global Escape Hatch

// To solve Prop Drilling, React provides the **Context API**. This allows a "Provider" to broadcast data to any "Consumer" (via `useContext`) regardless of how deep they are in the tree, skipping the middlemen.

// ---

// ## 5. Tricky Interview Questions

// ### Q1: "If I use Context to avoid Prop Drilling, does it improve performance?"

// **The Answer:** **Not necessarily.** In fact, it can be **worse**. By default, when a Context Provider’s value changes, **every component that consumes that context re-renders.** If your Context value is a large object and you update one tiny property, every component listening to that Context will update.
// **The Fix:** Split your Contexts (e.g., `UserContext`, `ThemeContext`) or use memoization patterns.

// ### Q2: "When should I 'Lift State Up' vs. using 'Context'?"

// **The Answer:** * **Lift State Up:** When the data is shared between 2–3 components in a specific branch. It keeps the data flow explicit and easy to trace.

// * **Context:** When the data is "Global" or "App-wide" (e.g., Current User, UI Theme, Language/i18n) and would otherwise need to be passed through 10+ levels.

// ### Q3: "Can you stop a child from re-rendering when a parent's state (which the child doesn't use) changes?"

// **The Answer:** Yes, using **Composition**. If you pass the child as `children` to the parent, React sees that the `children` prop hasn't changed references and will skip re-rendering that subtree. This is often more efficient than `React.memo`.

// ### Q4: "What is the 'State Colocation' principle?"

// **The Answer:** It's the opposite of "Lifting State Up." It means moving state as close to where it's used as possible. If you lifted state to `App.js` but now only one deep child uses it, you should **move it back down**. This reduces the "render blast radius" and makes the app faster.

// ---

// ## Simple Summary Table

// | Strategy | Best For | Pros | Cons |
// | --- | --- | --- | --- |
// | **Local State** | UI-specific logic | Fastest, easiest to track | Can't be shared with siblings |
// | **Lifting Up** | Siblings sharing data | Explicit data flow | Can lead to Prop Drilling |
// | **Context** | Global/App-wide data | Avoids Prop Drilling | Can cause massive re-renders if not careful |

// ---


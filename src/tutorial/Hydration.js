// Hydration is the process where React transforms static HTML (sent from the server) into an interactive application by attaching event listeners and setting up the internal state (Fiber tree). Think of it as **"watering"** a dried-up plant to bring it back to life.

// ---

// ## 1. Hydration Mismatch Errors

// A mismatch occurs when the HTML generated on the server is different from the first render result on the client.

// * **How it happens:** If you use `window.innerWidth` or `new Date()` inside your component body, the server sees one value (or nothing), and the client sees another.
// * **The Result:** React will try to "patch" the DOM, but it often leads to visible bugs (UI flickering) and a massive performance hit because React has to throw away parts of the tree and re-render them.

// ---

// ## 2. Progressive Hydration

// In the old "All-or-Nothing" model, the browser had to download all the JavaScript and hydrate the entire page before the user could interact with *anything*.

// **Progressive Hydration** allows React to hydrate parts of the page as they become ready or as they enter the viewport. Instead of one massive "boot up" phase, the app wakes up in stages.

// ---

// ## 3. Selective Hydration (React 18+)

// This is the "Smart" version of Progressive Hydration powered by **Suspense**. It solves two major bottlenecks:

// 1. **Don't wait for all code:** You can wrap a slow component in `<Suspense>`. React will hydrate the rest of the page first and hydrate the slow component only when its code has loaded.
// 2. **User-driven priority:** If the user clicks a button in a component that hasn't hydrated yet, React will **pause** hydrating other parts of the page and "jump" to hydrate the area the user interacted with.

// ---

// ## 4. Simple Example: The Date Mismatch

// ```javascript
function Header() {
  // ❌ BAD: This will cause a mismatch error
  // Server might render "8:00 PM" while Client renders "8:01 PM"
  const time = new Date().toLocaleTimeString();

  return <div>Current Time: {time}</div>;
}

// ✅ FIX: Use useEffect to ensure the time is only set on the client
function FixedHeader() {
  const [time, setTime] = useState(null);

  useEffect(() => {
    setTime(new Date().toLocaleTimeString());
  }, []);

  if (!time) return <div>Loading...</div>; // Consistent shell for both
  return <div>Current Time: {time}</div>;
}

// ```

// ---

// ## 5. Tricky Interview Questions

// ### Q1: "Why is a hydration mismatch bad for performance? Isn't React just updating the text?"

// **The Answer:** It's not just a text update. When a mismatch occurs, React cannot guarantee that the DOM structure is correct. In many cases, it has to **bail out of hydration** for that subtree, delete the server-rendered DOM nodes, and recreate them from scratch using JavaScript. This defeats the entire purpose of SSR (fast initial paint).

// ### Q2: "How does `suppressHydrationWarning` work?"

// **The Answer:** It’s a prop you can add to an element (like `<span suppressHydrationWarning>`) to tell React, *"I know the server and client will differ here, don't scream at me."* It only works one level deep and only for attributes/text content. It does **not** fix the underlying performance cost; it just silences the console warning.

// ### Q3: "Does Selective Hydration mean the user can interact with a component before its JS has loaded?"

// **The Answer:** No. The JS for that component must still be downloaded. Selective Hydration means the user can interact with **Component A** (which is ready) even if **Component B** is still loading or hydrating. It breaks the "locking" of the main thread.

// ### Q4: "What is 'Streaming SSR' in the context of hydration?"

// **The Answer:** It’s the ability to send HTML in chunks. In the past, the server had to wait for all data to be ready before sending anything. Now, via `renderToPipeableStream`, the server sends the "shell" (HTML) immediately, and as the data-heavy components finish, their HTML "streams" in later and is hydrated individually.

// ---


// Frontend system design is a different beast than backend design. While the backend focuses on data integrity and throughput, frontend design centers on **user experience, performance bottlenecks, and state synchronization.**

// Here are three core pillars of modern frontend architecture, explained deeply with the "traps" interviewers love to set.

// ---

// ## 1. Component Architecture & State Management

// In a large-scale app, the challenge isn't just "making components," it's managing the **data flow** between them without turning the codebase into a tangled mess of "prop drilling."

// * **The Deep Dive:** You need to decide between **Local State** (UI toggles), **Global State** (User Auth), and **Server State** (API data). Modern architecture leans toward "Atomic" design or "Micro-frontends" to keep teams decoupled.
// * **The Strategy:** Use a "State-Machine" approach for complex flows to prevent "impossible states" (e.g., a button showing both a "Loading" spinner and a "Success" icon simultaneously).

// ### 🚩 Tricky Interview Questions:

// 1. **"How do you decide between a Redux-like global store and React Context API?"**
// * *The Trap:* Many say "Redux is for big apps." The real answer involves **re-render frequency**. Context is great for low-frequency updates (themes). Redux/Zustand excels at high-frequency updates because they allow components to subscribe to specific slices of state without re-rendering the whole tree.


// 2. **"How would you handle state persistence across multiple browser tabs in real-time?"**
// * *The Pivot:* Talk about the `BroadcastChannel` API or `localStorage` events.



// ---

// ## 2. Rendering Patterns: SSR, CSR, SSG, and ISR

// Choosing how the browser receives HTML is the biggest lever you have for **SEO** and **LCP (Largest Contentful Paint)**.

// | Pattern | Description | Best For... |
// | --- | --- | --- |
// | **CSR (Client-Side)** | JS builds the page in the browser. | Dashboards, gated content. |
// | **SSR (Server-Side)** | HTML is generated per request on the server. | Personalized dynamic content (e.g., Feed). |
// | **SSG (Static)** | HTML is built once at "build time." | Blogs, documentation. |
// | **ISR (Incremental)** | Re-builds static pages in the background as traffic comes in. | E-commerce product pages. |

// ### 🚩 Tricky Interview Questions:

// 1. **"If we use SSR for a dashboard, does it always make the app faster?"**
// * *The Real Talk:* No. SSR can increase **TTFB (Time to First Byte)** because the server is busy crunching data. If your server is slow, the user stares at a white screen longer than they would with a "Loading" spinner in CSR.


// 2. **"What is 'Hydration' and why is it a performance killer?"**
// * *The Deep Answer:* Hydration is the process of attaching event listeners to the server-rendered HTML. It's "uncanny valley" time—the page looks ready, but clicking a button does nothing until the JS finishes loading.



// ---

// ## 3. Performance & Asset Optimization

// This is where you prove you aren't just a "UI builder" but an engineer. It's about the **Critical Rendering Path**.

// * **Code Splitting:** Don't ship the "Admin Panel" code to the "Customer" user.
// * **Image Optimization:** Moving beyond `.jpg` to `.webp` or `.avif`, and using `srcset` for responsive sizes.
// * **Virtualization:** If you have 10,000 items in a list, only render the 10 visible ones in the DOM.

// ### 🚩 Tricky Interview Questions:

// 1. **"How do you prevent 'Layout Shift' (CLS) when loading third-party ads or heavy images?"**
// * *The Fix:* Mention **Aspect Ratio Boxes** or reserved space. Never let content "jump" after the user starts reading.


// 2. **"A user complains the app is 'janky' while scrolling. How do you debug it?"**
// * *The Pro Approach:* Talk about the **Chrome DevTools Performance Tab**. Mention "Long Tasks" (anything over 50ms) that block the main thread, and how you'd use `requestIdleCallback` or `Web Workers` to move heavy logic off the UI thread.



// ---


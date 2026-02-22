// Bundling is the process of taking your thousands of small, messy source files and turning them into a few highly optimized files the browser can actually digest.

// In a system design interview, this is where you prove you can manage **payload size** and **execution cost**.

// ---

// ## 1. Webpack vs. Vite (The Engine)

// * **Webpack:** A "Bundler." It crawls your entire app, builds a dependency graph, and then creates a bundle. It's powerful but can be slow during development as the app grows.
// * **Vite:** A "Build Tool." In development, it doesn't bundle. it serves source code via **Native ESM**, letting the browser do the work. It uses **Esbuild** (written in Go) to pre-bundle dependencies, making it nearly instant.

// ---

// ## 2. Tree-shaking

// Think of your app as a tree. The source code is the living branches, and the "Dead Code" (functions you imported but never used) is the dead leaves. Bundlers "shake" the tree so only the living branches end up in the final bundle.

// * **The Deep Dive:** This only works if you use **ES Modules** (`import`/`export`). Older CommonJS (`require`) makes tree-shaking nearly impossible because it's dynamic.

// ---

// ## 3. Code-splitting & Lazy Loading

// Instead of making the user download the entire 2MB app just to see the Login page, you split the code into smaller chunks.

// * **Lazy Loading:** You only request the code for the "Dashboard" when the user actually clicks the "Go to Dashboard" button.
// * **Simple Example:**
// ```javascript
// // Instead of: import { HeavyComponent } from './HeavyComponent';
// const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

// ```



// ---

// ## 4. Bundle Analysis

// You can't optimize what you can't see. Tools like **Webpack Bundle Analyzer** or **Rollup Plugin Visualizer** create a "Treemap" of your bundle.

// * **The Goal:** Find the "Goliaths"—the massive libraries (like `moment.js` or `lodash`) that are bloating your app—and replace them with smaller alternatives (`date-fns` or `lodash-es`).

// ---

// ## 🚩 Tricky Interview Questions

// ### 1. "I have a utility file with 100 functions, but I only import 1. Why is the whole file still in my bundle?"

// * **The Trap:** Most say "You forgot to use ES Modules."
// * **The Pro Answer:** "It's likely due to **Side Effects**. If your utility file does something global (like modifying `window.prototype` or setting a global variable) when it's first loaded, the bundler is afraid to remove it because it might break the app. You need to mark your `package.json` with `"sideEffects": false` to tell the bundler it's safe to prune."

// ### 2. "Why is Vite faster than Webpack in dev, but they both use similar tools (Rollup/Webpack) for production?"

// * **The Nuance:** "In dev, Vite uses **Unbundled ESM**. It only serves the files the browser currently needs. Webpack has to re-bundle parts of the app on every save. In production, we still bundle because 'waterfall' network requests for 1,000 small files are slower than downloading 3-4 optimized chunks due to HTTP/2 overhead and compression efficiency."

// ### 3. "How do you handle 'Vendor' caching during a deployment?"

// * **The Strategy:** "We use **Long-term Caching**. We split the bundle into `app.[hash].js` and `vendor.[hash].js`. Since dependencies (React, Lodash) change less often than our source code, the `vendor` hash stays the same. This means the user's browser can keep the heavy 500KB vendor file in its cache even after we push a UI update."

// ### 4. "You've implemented Lazy Loading, but now the user experiences a 2-second delay when clicking a route. How do you fix it?"

// * **The Optimization:** "**Prefetching.** Use `<link rel="prefetch">` or magic comments in your imports: `import(/* webpackPrefetch: true */ './Dashboard')`. This tells the browser to download the code in the background during 'idle time' *before* the user clicks the button."

// ---

// ### Comparison: Bundling Strategies

// | Technique | Problem Solved | Metric Improved |
// | --- | --- | --- |
// | **Tree-shaking** | Unused code bloat | Total Bundle Size |
// | **Code-splitting** | Monolithic JS files | FCP / TTI |
// | **Prefetching** | Delayed interaction | User Perceived Latency |
// | **Minification** | Readable code is heavy | Transfer Size |


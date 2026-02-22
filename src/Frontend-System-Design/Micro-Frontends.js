// Micro-frontends are the architectural equivalent of breaking a monolithic frontend into independent, deployable "mini-apps." It solves the problem of "too many cooks in one kitchen."

// Here is the breakdown of the three most popular implementation strategies.

// ---

// ## 1. iFrames (The "Old Guard")

// An iframe is a literal window into another website. It provides the strongest isolation possible.

// * **Simple Example:** A "Help Chat" widget or a "Payment Gateway" (like Stripe) embedded on your site. The main site can't see the credit card details inside the iframe.
// * **The Good:** Zero style leakage. If the iframe uses Bootstrap 3 and the host uses Tailwind, they won't fight.
// * **The Bad:** Terrible for SEO, unresponsive (hard to auto-resize), and memory-heavy (each iframe loads its own browser context).

// ---

// ## 2. Web Components (The "Native" Way)

// Using the browser's built-in `CustomElements` API to create tags like `<my-header-mfe>`.

// * **Simple Example:** A "User Profile" widget built in Vue, exported as a Web Component, and dropped into a React dashboard.
// * **The Good:** Framework agnostic. You can mix and match tech stacks.
// * **The Bad:** Shadow DOM can make global styling (like a dark mode toggle) a nightmare. "Hydration" is difficult if you're using SSR.

// ---

// ## 3. Module Federation (The "Modern" Standard)

// A Webpack 5 (and now Vite/Rspack) feature that allows a JavaScript application to dynamically load code from another application at **runtime**.

// * **Simple Example:** The "Search Bar" team deploys their code to a CDN. The "Homepage" app pulls that code directly from the URL and runs it as if it were a local component.
// * **The Good:** Shared dependencies. If both apps use React, the browser only downloads React **once**.
// * **The Bad:** Versioning hell. If the remote app updates a shared library and breaks the host, the whole site goes down.

// ---

// ### Comparison Table

// | Feature | iFrames | Web Components | Module Federation |
// | --- | --- | --- | --- |
// | **Isolation** | 🔒 Strongest (Full) | 🛡️ Medium (Shadow DOM) | 🔓 Weak (Shared JS) |
// | **Performance** | 🐢 Slow (Multiple Renders) | 🏎️ Fast | 🚀 Fastest (Shared Deps) |
// | **Communication** | `postMessage` (Clunky) | Props / Custom Events | Direct JS Functions |
// | **Best For** | Third-party integrations | Design Systems / Widgets | Massive Enterprise Apps |

// ---

// ### 🚩 Tricky Interview Questions

// #### 1. "How do you handle 'Dependency Mismatch' in Module Federation?"

// * **The Scenario:** App A needs React 18, but App B (the remote) just upgraded to React 19.
// * **The Pro Answer:** "We use the `shared` configuration in Webpack. You can set `singleton: true` to force one version, or use `requiredVersion` to specify a range. If the versions are incompatible, Module Federation will intelligently fall back and download a second copy of React just for that MFE to prevent a crash."

// #### 2. "If I use Web Components for Micro-frontends, how do I handle Global Theming (CSS Variables)?"

// * **The Trap:** Most say "Shadow DOM blocks styles."
// * **The Fix:** "Shadow DOM blocks *selectors*, but it doesn't block **CSS Custom Properties (Variables)**. I would define my theme at the `:root` level of the host app. Since CSS variables pierce the shadow boundary, the Web Component will inherit the primary color and font automatically."

// #### 3. "What happens if a Micro-frontend fails to load? Does the whole site go blank?"

// * **The Critical Design:** "Never. We must use **Error Boundaries** (in React) or native `try/catch` around dynamic imports. We should always have a 'Fallback UI'—like a 'Component unavailable' message—so one failing MFE doesn't take down the entire user experience."

// #### 4. "Is Micro-frontend architecture always better for large teams?"

// * **The Reality Check:** "No. It introduces **Operational Complexity**. You now have to manage multiple CI/CD pipelines, complex testing across 'App Shells,' and potentially duplicated code. Only use it when the friction of a Monolith (slow builds, team blocking) outweighs the cost of managing the distributed system."

// ---


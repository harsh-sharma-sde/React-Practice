// Think of rendering strategies as deciding **where and when** the HTML for your website is cooked. Is it pre-made in a factory (SSG), cooked per order in a kitchen (SSR), or do you just give the customer the ingredients and a stove (CSR)?

// ---

// ## 1. CSR (Client-Side Rendering)

// The server sends a "blank" HTML file and a massive JavaScript bundle. The browser executes the JS to build the UI.

// * **Simple Example:** A React Dashboard. You see a loading spinner, then suddenly the whole app appears.
// * **Performance:** Slow "First Contentful Paint" (FCP) because the browser waits for JS.
// * **SEO:** Poor. Search bots see an empty `<div>` unless they wait for JS to execution.

// ## 2. SSR (Server-Side Rendering)

// The server generates the full HTML for every single request.

// * **Simple Example:** A personalized Facebook Feed. Every time you refresh, the server fetches *your* specific friends' posts and builds the HTML.
// * **Performance:** Fast FCP, but high **TTFB** (Time to First Byte) because the server is busy "cooking."
// * **SEO:** Excellent. Bots get a full HTML document immediately.

// ## 3. SSG (Static Site Generation)

// The HTML is generated **once** at build time (when you run `npm run build`).

// * **Simple Example:** A personal blog or documentation site. The content doesn't change until the developer pushes new code.
// * **Performance/SEO:** The gold standard. Files are served from a CDN (Content Delivery Network) near the user.

// ## 4. ISR (Incremental Static Regeneration)

// The "Smart Hybrid." You pre-render pages (SSG), but the server updates them in the background as new data comes in, without a full redeploy.

// * **Simple Example:** An E-commerce product page. You have 10,000 products. You static-build the top 100, and generate the rest on-demand, caching them for future users.

// ## 5. Streaming SSR

// The server starts sending HTML to the browser **piece by piece** as it's ready, rather than waiting for the whole page to be generated.

// * **Simple Example:** A page with a Header (fast), a Video (slow), and Comments (slow). The user sees the Header instantly while the rest "streams" in.
// * **Performance:** Drastically reduces the "uncanny valley" where the user sees nothing.

// ---

// ### Comparison Matrix

// | Strategy | SEO | Initial Load Speed | Server Load | Best For... |
// | --- | --- | --- | --- | --- |
// | **CSR** | ❌ Poor | 🐢 Slow | ⚡ Low | Internal Tools, SaaS Dashboards |
// | **SSR** | ✅ Great | 🚀 Fast | 🔋 High | Highly Dynamic/Personalized Sites |
// | **SSG** | ✅ Great | 💨 Instant | 🧊 Zero | Blogs, Marketing Pages |
// | **ISR** | ✅ Great | 💨 Instant | 📉 Low | Large E-commerce, News Sites |
// | **Streaming** | ✅ Great | 🏎️ Ultra Fast | 🔋 High | Complex Content-heavy Pages |

// ---

// ### 🚩 Tricky Interview Questions

// #### 1. "Can you have a CSR app that is great for SEO?"

// * **The Trap:** Most say "No, use SSR."
// * **The Pro Answer:** "Yes. Use **Dynamic Rendering**. You detect if the User-Agent is a bot (like Googlebot) and serve it a pre-rendered static version using a tool like Puppeteer or Prerender.io, while real users get the CSR experience."

// #### 2. "If SSG is the fastest, why don't we use it for a site like Amazon?"

// * **The Reality Check:** "Build times. If Amazon has 100 million products and you change the footer, an SSG build would take weeks. **ISR** is the correct answer here—it allows us to update pages incrementally without rebuilding the whole universe."

// #### 3. "Explain the 'Uncanny Valley' of Hydration in SSR."

// * **The Deep Dive:** "In SSR, the page *looks* ready (HTML is there), but it's not interactive yet. If a user clicks a button before the JS finishes 'Hydrating' (attaching listeners), nothing happens. This leads to a high **TBT (Total Blocking Time)**."

// #### 4. "How does Streaming SSR solve the 'All or Nothing' problem of traditional SSR?"

// * **The Technical Answer:** "Traditional SSR waits for all data fetches to finish before sending *any* HTML. If one API is slow, the whole page is blocked. Streaming uses `Transfer-Encoding: chunked` to send the 'Shell' first, then fills in the 'Holes' as data arrives."

// ---


// Performance metrics are the "vitals" of your website. In a system design interview, knowing these isn't just about memorizing acronyms—it's about knowing which lever to pull to fix a specific user frustration.

// ---

// ## 1. Core Web Vitals (The Big Three)

// Google uses these to rank your site. If these are red, your SEO and conversion rates will suffer.

// ### LCP (Largest Contentful Paint) — **Loading Performance**

// * **What it is:** The time it takes for the largest visible element (usually a hero image or a big heading) to render.
// * **Target:** Under **2.5 seconds**.
// * **Simple Example:** You open an article. The text appears, but the main header image takes 4 seconds to load. That 4-second mark is your LCP.

// ### CLS (Cumulative Layout Shift) — **Visual Stability**

// * **What it is:** Measures how much the elements on the page "jump around" while loading.
// * **Target:** Score under **0.1**.
// * **Simple Example:** You’re about to click "Cancel," but an ad suddenly loads at the top, pushing the "Confirm" button right under your thumb. That’s a high CLS.

// ### INP (Interaction to Next Paint) — **Responsiveness**

// * **What it is:** Replaced FID (First Input Delay) in 2024. It measures the latency of **all** interactions (clicks, taps, keyboard) during a user's entire visit.
// * **Target:** Under **200ms**.
// * **Simple Example:** You click a "Like" button. If the heart doesn't turn red for 500ms because the main thread is busy, the INP is poor.

// ---

// ## 2. Other Key Metrics

// ### FCP (First Contentful Paint)

// * **What it is:** The time until the browser renders the **first bit** of content (any text, image, or canvas).
// * **The Difference:** FCP tells the user "Something is happening," whereas LCP tells them "The main thing is here."

// ### TTI (Time to Interactive)

// * **What it is:** The point at which the page is visually rendered **and** the main thread is quiet enough to respond to user input.
// * **The Trap:** A page can have a great LCP but a terrible TTI if it's "frozen" while downloading a massive JS bundle.

// ---

// ## 🚩 Tricky Interview Questions

// ### 1. "Can a site have a fast LCP but a terrible user experience?"

// * **The Answer:** Yes. This happens when you have a **"Lighthouse Paradox."** You might optimize your LCP (the image shows up fast), but if your **TTI** or **INP** is high, the user can see the site but can't click anything. It's a "Look but don't touch" UI.

// ### 2. "How does 'Server-Side Rendering' (SSR) affect FCP vs. LCP?"

// * **The Deep Dive:** SSR usually improves **FCP** significantly because the server sends raw HTML. However, if the server has to wait for a slow database query to generate that HTML, the **TTFB (Time to First Byte)** increases, which can actually hurt **LCP**.
// * **The Solution:** Use **Streaming SSR** to send the header immediately (Fast FCP) and stream the main content as it's ready (Optimized LCP).

// ### 3. "Why did Google replace FID with INP?"

// * **The "Senior" Knowledge:** FID only measured the **first** interaction. Developers gamed this by making the first 5 seconds fast but letting the rest of the app become "janky." **INP** is more honest; it samples all interactions throughout the session, making it a much better indicator of "real-world" smoothness.

// ### 4. "You have a high CLS on a page with no ads. What’s the likely culprit?"

// * **The Usual Suspects:** 1.  **Images without dimensions:** The browser doesn't know how much space to reserve until the image downloads.
// 2.  **Web Fonts:** When the custom font loads, it might be a different size than the fallback font, causing a "Flash of Unstyled Text" (FOUT) that shifts the layout.
// * **The Fix:** Always set `width` and `height` on images or use `aspect-ratio` in CSS. Use `font-display: swap`.

// ---

// ### Metrics Cheat Sheet

// | Metric | Focus | Fix |
// | --- | --- | --- |
// | **LCP** | Speed | Optimize images, use CDN, remove render-blocking JS. |
// | **CLS** | Stability | Set dimensions on images/iframes, avoid inserting content above existing content. |
// | **INP** | Feel | Break up "Long Tasks" (>50ms) using `setTimeout` or Web Workers. |


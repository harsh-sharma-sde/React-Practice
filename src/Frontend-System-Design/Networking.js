// Networking in frontend system design is about reducing the physical distance and time between the server's data and the user's screen. It is the art of predicting the future (prefetching) and remembering the past (caching).

// ---

// ## 1. HTTP/2 vs. HTTP/3

// The evolution of how data travels across the wire.

// * **HTTP/2 (TCP-based):** Introduced **Multiplexing**, allowing multiple requests (CSS, JS, Images) over a single connection. No more "domain sharding."
// * *The Weakness:* **Head-of-Line (HOL) Blocking.** If one packet is lost in the TCP stream, all other requests behind it must wait for it to be retransmitted, even if their data arrived safely.


// * **HTTP/3 (QUIC/UDP-based):** Replaces TCP with QUIC. It handles packet loss individually. If one image packet is lost, the CSS file keeps loading.
// * *Simple Example:* HTTP/2 is a single-lane highway where one stalled car stops everyone. HTTP/3 is a multi-lane highway where cars just drive around the stalled one.



// ---

// ## 2. Caching Strategies: The Layers

// Caching happens at different "distances" from your code.

// | Layer | Controlled By | Best For... |
// | --- | --- | --- |
// | **Browser Cache** | `Cache-Control` headers | Static assets (JS/CSS) that don't change often. |
// | **Service Worker** | Your JavaScript code | Offline support and "Cache-First" strategies. |
// | **CDN (Edge)** | Cloudflare/CloudFront | Serving files from a server physically close to the user. |

// ### The "Stale-While-Revalidate" Pattern

// This is a favorite for high-performance apps.

// 1. Browser asks for data.
// 2. Service Worker/CDN gives the **stale** (old) version immediately (instant load!).
// 3. In the background, it fetches the **fresh** version and updates the cache for next time.

// ---

// ## 3. Preloading vs. Prefetching

// Telling the browser what is going to happen before it happens.

// * **Preload (`rel="preload"`):** "I need this for the **current** page. Download it now with high priority!" (e.g., a Hero image or a main font).
// * **Prefetch (`rel="prefetch"`):** "I might need this for the **next** page. Download it when the browser is idle." (e.g., the JS bundle for the 'Settings' page while the user is on the 'Home' page).

// ---

// ## 🚩 Tricky Interview Questions

// ### 1. "If HTTP/2 multiplexes everything, do we still need to bundle our JS into one big file?"

// * **The Trap:** Most say "No, send 1,000 small files!"
// * **The Pro Answer:** "Actually, yes, we still bundle (though into smaller chunks). While HTTP/2 handles many files well, **Compression (Gzip/Brotli)** works much better on one large file than 1,000 tiny ones. Also, 1,000 files still incur a slight overhead in browser processing. We aim for a 'sweet spot' of 5–10 chunks."

// ### 2. "You updated your CSS file on the server, but users still see the old version. How do you force an update?"

// * **The Solution:** "Cache Busting." You change the filename to include a hash of the content: `styles.a1b2c3.css`. Since the URL is different, the browser treats it as a brand-new file.
// * **The Follow-up:** *"What if it's the `index.html` that is cached?"*
// * **The Fix:** "Never cache `index.html` with long-term headers. Always use `Cache-Control: no-cache` (which means 'check with the server before using') for the entry HTML file."



// ### 3. "What is the 'Double Key Caching' problem in modern browsers?"

// * **The Privacy Deep-Dive:** "To prevent tracking, browsers like Chrome and Safari now partition caches by the top-level domain. If `site-a.com` and `site-b.com` both use the same Google Font, the browser will now download it **twice** (once for each site). The old trick of 'using a common CDN for jQuery to speed up loading' is effectively dead."

// ### 4. "How do you prevent a 'Thundering Herd' on your CDN when a cache expires?"

// * **The Strategy:** "Use **Origin Shielding** or **Request Collapsing**. If 10,000 users request an expired file at once, the CDN should hold 9,999 requests in a queue and send only **one** request to your origin server, then broadcast that result back to everyone."

// ---


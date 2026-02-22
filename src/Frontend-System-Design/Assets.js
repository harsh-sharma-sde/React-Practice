// Optimizing assets is often the "quickest win" in frontend system design. Since images and fonts typically make up over **70% of a page's total weight**, mastering these strategies is crucial for hitting your Core Web Vitals targets.

// ---

// ## 1. Image Optimization: The Modern Toolkit

// It's no longer just about compressing a `.jpg`. You need a multi-layered delivery strategy.

// ### Next-Gen Formats: WebP vs. AVIF

// * **WebP:** The industry standard. ~30% smaller than JPEG. Supported by 96%+ of browsers.
// * **AVIF:** The 2026 champion. ~50% smaller than JPEG and significantly more efficient than WebP for high-detail photos.
// * **The Strategy:** Always serve AVIF first, fallback to WebP, and use JPEG only as a "safety net."

// ### Responsive Images: `srcset` and `sizes`

// Don't send a 4000px "Desktop Hero" to an iPhone. Use the `<img>` tag to give the browser a menu of options.

// * **`srcset`**: Lists the available files and their actual widths (e.g., `image-small.jpg 400w`).
// * **`sizes`**: Tells the browser how wide the image will be on the screen at different breakpoints.

// ```html
<picture>
  <source srcset="hero.avif" type="image/avif">
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpg" 
       srcset="hero-400.jpg 400w, hero-800.jpg 800w" 
       sizes="(max-width: 600px) 400px, 800px" 
       alt="Hero Image"
       loading="lazy">
</picture>

// ```

// ---

// ## 2. Font Loading: Avoiding the "Jank"

// Fonts are high-priority resources that block rendering. If handled poorly, they cause **FOIT** (Flash of Invisible Text) or **CLS** (Layout Shift).

// ### `font-display` Strategies

// | Value | Behavior | Best For... |
// | --- | --- | --- |
// | **`swap`** | Show fallback font immediately, swap when ready. | Body text (Prioritizes reading). |
// | **`block`** | Hide text for up to 3s, then show fallback. | Icon fonts (Prevents weird characters). |
// | **`optional`** | 100ms "wait" window. if not loaded, keep fallback forever. | Performance-critical sites (Zero CLS). |

// ### Optimization Techniques

// * **Subsetting:** Stripping out unused characters (e.g., removing Cyrillic characters if your site is only in English) to reduce file size by 90%.
// * **Preloading:** Using `<link rel="preload">` to start the font download before the CSS is even parsed.

// ---

// ## 🚩 Tricky Interview Questions

// ### 1. "You used `loading="lazy"` on your Hero image and LCP got worse. Why?"

// * **The Trap:** Most people think "Lazy loading is always good."
// * **The Pro Answer:** "Lazy loading tells the browser to *delay* the image until the user scrolls near it. For 'above-the-fold' content like a Hero image, this is a disaster because the browser waits to start the download, delaying the **LCP**. You should never lazy-load your LCP element; in fact, you should use `fetchpriority="high"` instead."

// ### 2. "Why does `font-display: swap` cause a high CLS score, and how do you fix it?"

// * **The Deep Dive:** "The fallback font (e.g., Arial) often has different letter widths than your custom font (e.g., Roboto). When the swap happens, the text reflows and moves other elements.
// * **The Solution:** Use **CSS Font Descriptors** (`ascent-override`, `descent-override`, `size-adjust`) to stretch the fallback font so it takes up the *exact same space* as the web font before it arrives."

// ### 3. "If a user is on a metered/slow 3G connection, would you still load your fancy 100KB brand font?"

// * **The Strategic Answer:** "I would use the **Network Information API**. If `navigator.connection.saveData` is true or effectiveType is '2g', I would skip the `@font-face` download entirely and stick to system fonts to save the user's data and time."

// ### 4. "Is AVIF always better than WebP?"

// * **The Nuance:** "Not quite. While AVIF has better compression, it has much higher **CPU decoding costs**. On low-end mobile devices, decoding 20 AVIF images can actually freeze the UI thread more than WebP would. It's a trade-off between network bytes and device CPU."

// ---


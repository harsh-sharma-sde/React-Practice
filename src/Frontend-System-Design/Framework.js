// The **R.A.D.I.O.** framework is the "gold standard" for tackling frontend system design interviews. It forces you to stop coding immediately and start engineering.

// Let’s use a **"News Feed" (like Facebook or LinkedIn)** as our running example to walk through each phase.

// ---

// ## 1. R - Requirements (Clarification)

// Before drawing boxes, define the boundaries. If you don't ask, the interviewer assumes you're building everything, and you'll run out of time.

// * **Functional:** Can users post? Like? Is it real-time?
// * **Non-Functional:** Is it mobile-first? Does it need to work offline? (This dictates your tech stack).

// > **Tricky Interview Question:** *"We have 1 billion users, but 40% are on 3G networks with low-end devices. How does that change your requirements?"*
// > * **The Trap:** Most candidates focus on "Features." You must pivot to **Performance.** You'd prioritize a "Lite" version, aggressive code-splitting, and prioritizing text over high-res images.
// > 
// > 

// ---

// ## 2. A - Architecture (High-Level)

// This is where you define the "Big Picture." You aren't naming functions yet; you're naming layers.

// * **The Example:** For a News Feed, you need:
// 1. **View Layer:** Component tree (Feed, Post, Comment).
// 2. **Controller/State Layer:** Stores the posts and handles the "Like" logic.
// 3. **Service Layer:** The API client (Axios/Fetch).
// 4. **WebSocket/Socket.io:** For real-time notifications.



// ### 🚩 Tricky Interview Questions:

// 1. **"Would you use a Monolith or Micro-frontends for this feed?"**
// * *The Answer:* Don't say "Micro-frontends" just because it's trendy. Say: "If we have 5 separate teams working on 'Ads', 'Stories', and 'Feed', then Micro-frontends allow independent deployment. If it's one small team, a Monolith is faster to develop."



// ---

// ## 3. D - Data Model (State Schema)

// How will the data look inside your application? You should define your **Store** structure.

// * **The Example:** Don't nest comments inside posts. **Normalize your data.**

// ```javascript
// Normalized State
{
  posts: { "id1": { text: "Hello", authorId: "u1" } },
  users: { "u1": { name: "Gemini" } },
  comments: { "c1": { postId: "id1", text: "Nice!" } }
}

// ```

// ### 🚩 Tricky Interview Questions:

// 1. **"Why normalize the data? Why not just keep a list of post objects?"**
// * *The Trap:* If a user changes their Profile Picture, and you have 20 of their posts in a list, you'd have to loop through all 20 to update the UI. With normalization, you update the `users` object **once**, and every post (which references that user ID) reflects the change instantly.



// ---

// ## 4. I - Interface (API Design)

// Define the contract between the frontend and backend.

// * **The Example:** * `GET /v1/feed?cursor={id}&limit=20` (Pagination is key!)
// * `POST /v1/post/like` (Optimistic UI update).



// ### 🚩 Tricky Interview Questions:

// 1. **"Would you choose GraphQL or REST for a News Feed?"**
// * *The Nuance:* "GraphQL is superior for feeds because a post can have many nested types (Images, User details, Comments). It prevents 'Over-fetching'—we don't want the whole user profile just to show a tiny avatar."



// ---

// ## 5. O - Optimizations (The "Senior" Part)

// This is where you show off your deep knowledge of the browser.

// * **Virtual Scrolling:** Only rendering the 5 posts currently on screen.
// * **Optimistic UI:** When a user hits "Like," increment the count immediately in the UI *before* the server responds. If the server fails, roll it back.
// * **Image Lazy Loading:** Using `loading="lazy"` or Intersection Observer.

// ### 🚩 Tricky Interview Questions:

// 1. **"How do you handle 'Race Conditions' in search results?"**
// * *The Scenario:* User types "A", request 1 starts. User types "AB", request 2 starts. Request 2 finishes, then Request 1 finishes late and overwrites the UI with "A" results.
// * *The Solution:* Mention `AbortController` to cancel the previous request or a "latest request ID" check.



// ---

// ### Comparison Table: R.A.D.I.O. vs. Typical "Junior" Approach

// | Step | Junior Approach | R.A.D.I.O. (Senior) Approach |
// | --- | --- | --- |
// | **Requirements** | Starts drawing a UI immediately. | Asks about network speeds and accessibility. |
// | **Data Model** | Uses a messy, nested JSON array. | Normalizes data to ensure a "Single Source of Truth." |
// | **API** | Suggests basic `GET /posts`. | Discusses Cursor-based pagination vs Offset. |
// | **Optimization** | Mentions "Make it fast." | Discusses Debouncing, Web Workers, and CLS. |

// ---

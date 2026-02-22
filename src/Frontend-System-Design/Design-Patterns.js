// Design patterns in frontend aren't just about "organizing folders"—they are about creating a **contract** between your data and your UI.

// ---

// ## 1. BFF (Backend for Frontend)

// The BFF pattern creates a dedicated "middle layer" server for each specific frontend (Mobile, Web, IoT). Instead of the frontend talking directly to a generic "General Purpose" API, it talks to its own specialized helper.

// * **The Deep Dive:** Mobile devices have small screens and slow networks; they want one small JSON object. A Desktop Web app might want massive amounts of data for a complex dashboard. The BFF sits in the middle, fetches from 10 microservices, filters the junk, and sends exactly what that specific device needs.
// * **Simple Example:** Imagine a "Profile Page." The backend has a `UserService`, `OrderService`, and `ReviewService`.
// * **Without BFF:** The browser makes 3 API calls. Slow!
// * **With BFF:** The browser makes **one** call to `/bff/profile`. The BFF (on the server) hits the 3 services and returns one tidy package.



// ### 🚩 Tricky Interview Questions:

// 1. **"Who should own the BFF code? The Frontend team or the Backend team?"**
// * *The Trap:* Most say "Backend" because it's a server.
// * *The Pro Answer:* "The **Frontend** team. The BFF is functionally part of the frontend; it defines the data requirements for the UI. If the Backend team owns it, every UI change requires a Jira ticket to another team, defeating the purpose of decoupling."


// 2. **"When is a BFF an 'Anti-pattern'?"**
// * *The Reality Check:* "When you have 100 micro-frontends and you create 100 BFFs. This leads to **Code Duplication**. You end up repeating the same auth/logging logic in every BFF. You must share common logic via libraries or a 'Gateway' layer."



// ---

// ## 2. Atomic Design

// Atomic Design is a methodology for creating design systems by breaking the UI into five distinct levels of complexity.

// 1. **Atoms:** The smallest units (Button, Input, Label).
// 2. **Molecules:** Groups of atoms (Search Bar = Input + Button).
// 3. **Organisms:** Complex UI sections (Header = Logo + Nav + Search Bar).
// 4. **Templates:** Page-level layouts (The "skeleton" of the wireframe).
// 5. **Pages:** Specific instances with real data.

// * **Simple Example:** Think of LEGOs. An **Atom** is a single 2x4 brick. A **Molecule** is a small wall. An **Organism** is the castle gate.

// ### 🚩 Tricky Interview Questions:

// 1. **"Where does 'State Management' live in Atomic Design?"**
// * *The Trap:* "In the atoms!" (No—atoms should be pure and stateless).
// * *The Pro Answer:* "Business logic and global state should typically stay at the **Page** or **Organism** level. Atoms and Molecules should be 'Dumb Components'—they receive props and emit events. If you put a Redux 'connect' inside an Atom, you can't reuse that Atom in a different project easily."


// 2. **"How do you distinguish between a Molecule and an Organism? It seems subjective."**
// * *The Technical Tie-breaker:* "An **Organism** is usually 'Context Independent.' You can move a Header (Organism) from the Home page to the Settings page and it still functions. A **Molecule** (like a Search Bar) usually requires a parent to tell it what to do."



// ---

// ## Summary Comparison

// | Concept | Primary Goal | Key Benefit |
// | --- | --- | --- |
// | **BFF** | Data Optimization | Reduces network requests & simplifies frontend logic. |
// | **Atomic Design** | UI Consistency | Creates a scalable, reusable component library. |

// ---

// ### One last "Senior Level" Tip:

// In a real interview, try to combine these. Talk about how your **BFF** returns data that perfectly maps to your **Organism** props, creating a seamless "Data-to-UI" pipeline.


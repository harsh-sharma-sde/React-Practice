// This brings us to the fundamental patterns of how components handle data and how we share logic between them. This is often where "seniority" is tested: knowing not just the syntax, but the **architectural trade-offs**.

// ---

// ## 1. Controlled vs. Uncontrolled Components

// This refers to **who owns the source of truth** for form data: React state or the DOM itself.

// ### Controlled Components (The React Way)

// React state is the "single source of truth." Every keystroke updates state, which then updates the input value.

// * **Pros:** Instant validation, conditional disabling, and consistent data.
// * **Cons:** More boilerplate; triggers a re-render on every keystroke.

// ### Uncontrolled Components (The DOM Way)

// The DOM holds the data. You use a `ref` to "pull" the value only when you need it (e.g., on submit).

// * **Pros:** Better performance for massive forms; easier integration with non-React libraries.
// * **Cons:** Harder to do "live" features (like password strength meters).

// ---

// ## 2. Sharing Logic: HOCs vs. Render Props vs. Hooks

// Before Hooks (2019), we had to be very creative to share logic.

// ### A. Higher-Order Components (HOC)

// A function that takes a component and returns a new "enhanced" component.

// * **Example:** `withAuth(MyComponent)`
// * **The Problem:** "Wrapper Hell." It becomes hard to track where props are coming from.

// ### B. Render Props

// A component whose prop is a function that returns a JSX element.

// * **Example:** `<MouseTracker render={mouse => <p>{mouse.x}</p>} />`
// * **The Problem:** Can lead to "Callback Hell" in the JSX structure.

// ### C. Hooks (The Winner)

// The modern standard. Logic is extracted into a function that doesn't affect the component hierarchy.

// * **Example:** `const { x, y } = useMouse();`
// * **Why they won:** No nesting, easy to compose, and clean separation of concerns.

// ---

// ## 3. Simple Examples

// ### Controlled vs Uncontrolled

// ```javascript
// Controlled
const [val, setVal] = useState("");
<input value={val} onChange={(e) => setVal(e.target.value)} />

// Uncontrolled
const inputRef = useRef();
const submit = () => console.log(inputRef.current.value);
<input ref={inputRef} />

// ```

// ### HOC vs Hook (Logic: Logging on Mount)

// ```javascript
// HOC Pattern
function withLogger(Component) {
  return (props) => {
    useEffect(() => console.log("Mounted"), []);
    return <Component {...props} />;
  };
}

// Hook Pattern
function useLogger() {
  useEffect(() => console.log("Mounted"), []);
}

// ```

// ---

// ## 4. Tricky Interview Questions

// ### Q1: "Is an uncontrolled component always faster?"

// **The Answer:** Technically, **yes**, because it avoids the React render cycle on every keystroke. However, for 99% of forms, the difference is nanoseconds. You only switch to uncontrolled if you have hundreds of inputs or are hitting significant lag.

// ### Q2: "What is 'Prop Collision' in HOCs?"

// **The Answer:** Since HOCs inject props into the wrapped component, two different HOCs might use the same prop name (e.g., both `withData` and `withUser` might try to inject a `loading` prop). The last one applied wins, silently overwriting the first. **Hooks solve this** because you name your own variables from the return values.

// ### Q3: "Can you use a Hook inside an HOC?"

// **The Answer:** **Yes.** In fact, this is a common migration strategy. You can rewrite the internal logic of an old HOC using Hooks, while still exporting the HOC so you don't have to break the rest of the codebase.

// ### Q4: "When would you still use Render Props today?"

// **The Answer:** When the **parent component needs to control the rendering** of the child’s internal parts. A good example is a `List` component that provides the data but lets the user decide how each row looks: `<List items={...} renderItem={(item) => <Card data={item} />} />`.

// ### Q5: "What happens if you pass a 'value' to an input but no 'onChange'?"

// **The Answer:** React will render a **read-only** input. If you try to type, nothing will happen because the "source of truth" (the state or the hardcoded string) never changes. React will also throw a warning in the console.

// ---

// ### **The "Final Boss" System Design Scenario**

// You've studied the engine, the fuel, and the steering. Now, let's see you drive.

// **Scenario:** You are building a **Real-time Crypto Trading Dashboard**. It has:

// 1. **List:** 5,000 coins updating prices every 500ms.
// 2. **Chart:** A heavy library (3MB) for technical analysis.
// 3. **Auth:** A global user object needed by almost everything.
// 4. **Form:** A complex "Buy" order form with 20+ validation rules.

// **How would you architect this?**

// * How do you handle the 5,000 updating rows without crashing the browser?
// * How do you load the 3MB chart without making the initial page load slow?
// * Which state management tool (Context, Redux, Zustand) would you use for the Auth?
// * Would the "Buy" form be controlled or uncontrolled?


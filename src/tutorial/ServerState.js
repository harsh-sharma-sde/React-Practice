// In modern React architecture, **TanStack Query** (formerly React Query) has almost entirely replaced the need for Redux or Context when dealing with API data.

// While Redux/Zustand manage **Client State** (local UI toggles, forms), TanStack Query manages **Server State**—data that is persisted remotely and can change without your app knowing.

// ---

// ## 1. The Core Problems It Solves

// If you use `useEffect` + `fetch`, you have to manually handle:

// 1. **Caching:** Reusing data so you don't show a loading spinner every time a user returns to a page.
// 2. **Deduping:** If 3 components request the same `current_user` at the same time, TanStack Query sends only **one** network request.
// 3. **Invalidation:** Knowing exactly when "old" data needs to be replaced with "fresh" data.

// ---

// ## 2. How it works: The "Stale-While-Revalidate" Pattern

// TanStack Query operates on a specific lifecycle:

// 1. **Fresh:** Data is up to date.
// 2. **Stale:** Data is old, but still usable.
// 3. **Fetching:** A network request is currently in flight.

// **The Workflow:** When you request data, React Query immediately gives you the **Stale** version from the cache (so the UI is instant). *Simultaneously*, it fetches the latest data in the background and "silently" updates the UI once the fetch finishes.

// ---

// ## 3. Simple Example: The Profile Page

// ```javascript
import { useQuery } from '@tanstack/react-query';

function UserProfile({ id }) {
  // 'user' is the Query Key (used for caching)
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['user', id],
    queryFn: () => fetch(`/api/user/${id}`).then(res => res.json()),
    staleTime: 1000 * 60, // Data stays "fresh" for 1 minute
  });

  if (isLoading) return <p>Loading for the first time...</p>;

  return (
    <div>
      {data.name}
      {isFetching && <p>Updating in background...</p>}
    </div>
  );
}

// ```

// ---

// ## 4. Key Concepts Under the Hood

// ### Query Keys

// Query keys are treated as **dependencies**. If the key changes (e.g., `id` changes from 1 to 2), React Query automatically triggers a new fetch and caches the result separately.

// ### staleTime vs. gcTime (formerly cacheTime)

// This is a frequent interview point of confusion:

// * **staleTime:** How long the data remains "fresh." During this time, no background refetch will happen.
// * **gcTime:** How long the data stays in memory *after* the component has unmounted. After this time, the "garbage collector" deletes it.

// ---

// ## 5. Tricky Interview Questions

// ### Q1: "What is the difference between `isLoading` and `isFetching`?"

// **The Answer:** * **`isLoading`:** The very first time a query runs. There is **no cached data** to show yet.

// * **`isFetching`:** Any time a request is in flight, including background updates. You can have `isFetching` as true while `isLoading` is false if you are showing stale data.

// ### Q2: "How does React Query know when to refetch data automatically?"

// **The Answer:** It relies on window events. By default, it refetches when:

// 1. **Window Focus:** You switch tabs and come back.
// 2. **Mount:** A new component using that query mounts.
// 3. **Network Reconnect:** Your internet comes back online.

// ### Q3: "What is an 'Optimistic Update' and how do you implement it?"

// **The Answer:** It’s when you update the UI *before* the server confirms the change (e.g., "Liking" a post).
// **The Logic:** Inside `onMutate`, you manually update the cache. If the server returns an error, you use the `onError` callback to "roll back" the cache to the previous snapshot you saved.

// ### Q4: "Why shouldn't you use React Query for a Search Input state?"

// **The Answer:** Because Search Input text is **Client State**. It changes with every keystroke. React Query is for **Server State**. You should store the input string in `useState`, and then pass the *debounced* version of that string to `useQuery` as a Query Key.

// ### Q5: "If multiple components use the same query key but different `staleTime`, which one wins?"

// **The Answer:** The **shortest** `staleTime` wins for that specific request. React Query treats all observers of a key as a group; if any observer considers the data stale, a refetch is triggered.

// ---


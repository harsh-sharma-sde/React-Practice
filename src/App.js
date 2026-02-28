// import InfiniteFeed from './Specific-Design-Problems/Infinite-Scroll/InfiniteFeed';
import ScalableFeed from './Specific-Design-Problems/News-Feed/ScalableFeed';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


// 1. Create a client instance (keep this outside the component to avoid re-renders)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
      retry: 1,                 // Retry failed requests once
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ height: '100vh' }}>
        <ScalableFeed />
      </div>
    </QueryClientProvider>
  );
}

export default App;

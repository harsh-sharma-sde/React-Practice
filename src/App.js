// import InfiniteFeed from './Specific-Design-Problems/Infinite-Scroll/InfiniteFeed';
// import ScalableFeed from './Specific-Design-Problems/News-Feed/ScalableFeed';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import RealTimeChat from './Specific-Design-Problems/Chat-App/RealTimeChat';
import Editor from './Specific-Design-Problems/Google-Docs/Editor';

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
  const username = "User-" + Math.floor(Math.random() * 1000);
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ height: '100vh' }}>
        {/* <ScalableFeed /> */}
        {/* <RealTimeChat/> */}
        <h3 style={{ textAlign: "center" }}>
          Google Docs Clone - Logged in as {username}
        </h3>
        <Editor docId="shared-doc-1" username={username} />
      </div>
    </QueryClientProvider>
  );
}

export default App;

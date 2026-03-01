import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import VideoStreaming from './Specific-Design-Problems/Video-Streaming/VideoStreaming';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <VideoStreaming />
    </QueryClientProvider>
  );
}

export default App;
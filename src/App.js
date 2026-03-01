import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import VideoStreaming from './Specific-Design-Problems/Video-Streaming/VideoStreaming';
import SearchComponent from './Specific-Design-Problems/Typeahead-Search-System/SearchComponent';
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
      <SearchComponent />
    </QueryClientProvider>
  );
}

export default App;
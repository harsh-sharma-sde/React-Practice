import React, {useState} from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import VideoStreaming from './Specific-Design-Problems/Video-Streaming/VideoStreaming';
import SearchComponent from './Specific-Design-Problems/Typeahead-Search-System/SearchComponent';
import './App.css';
import { ThemeProvider } from './Specific-Design-Problems/Design-System/context/ThemeContext';
import Button from './Specific-Design-Problems/Design-System/components/Button';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function App() {
  const [buttonId, setButtonId] = useState('brand-b');

  const handleButtonClick = () => {
    if(buttonId === 'brand-b'){
      setButtonId('brand-a')
    } else{
      setButtonId('brand-b')
    }
  }
  return (
    <QueryClientProvider client={queryClient}>
      {/* <SearchComponent /> */}

      
      <ThemeProvider brandId={buttonId}>
        <div style={{ padding: '40px' }}>
          <h1>SDE3 Design System Demo</h1>

          <Button
            variant="primary"
            size="md"
            onClick={handleButtonClick}
          >
            Dynamic Themed Button
          </Button>
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
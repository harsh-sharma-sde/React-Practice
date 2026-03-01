import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import VideoStreaming from './Specific-Design-Problems/Video-Streaming/VideoStreaming';
// import SearchComponent from './Specific-Design-Problems/Typeahead-Search-System/SearchComponent';
import './App.css';
import { ThemeProvider } from './Specific-Design-Problems/Design-System/context/ThemeContext';
import Button from './Specific-Design-Problems/Design-System/components/Button';

import { useRealTimeData } from './Specific-Design-Problems/Dashboard/hooks/useRealTimeData';
import DataChart from './Specific-Design-Problems/Dashboard/DataChart';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function App() {
  const stats = useRealTimeData('ws://localhost:8080');

  const [buttonId, setButtonId] = useState('brand-b');

  const handleButtonClick = () => {
    if (buttonId === 'brand-b') {
      setButtonId('brand-a')
    } else {
      setButtonId('brand-b')
    }
  }
  return (
    <QueryClientProvider client={queryClient}>
      {/* <SearchComponent /> */}


      {/* <ThemeProvider brandId={buttonId}>
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
      </ThemeProvider> */}

      <div style={{ backgroundColor: '#1e1e1e', color: 'white', minHeight: '100vh', padding: '2rem' }}>
        <header>
          <h1>SDE3 Systems Dashboard</h1>
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
            <StatCard label="Moving Avg" value={stats.avg.toFixed(2)} />
            <StatCard label="Volatility" value={stats.volatility.toFixed(2)} />
          </div>
        </header>

        <main>
          <DataChart stats={stats} />
        </main>
      </div>
    </QueryClientProvider>
  );
}

const StatCard = ({ label, value }) => (
  <div style={{ padding: '1rem', background: '#333', borderRadius: '8px', minWidth: '150px' }}>
    <small style={{ color: '#aaa' }}>{label}</small>
    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</div>
  </div>
);

export default App;
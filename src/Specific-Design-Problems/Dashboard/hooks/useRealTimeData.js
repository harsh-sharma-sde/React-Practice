import { useEffect, useRef, useState } from 'react';

/**
 * ARCHITECTURAL CONTEXT:
 * This hook acts as the 'Data Controller'. It decouples Network I/O (WebSocket)
 * from Computation (Web Worker) and View (React State).
 * * SDE3 Design Pattern: Separation of Concerns & Fault Tolerance.
 */
export const useRealTimeData = (url) => {
    // SDE3: UI state is kept minimal. Aggregated analytics are stored here,
    // while raw high-frequency data stays out of React to avoid render-loop thrashing.
    const [stats, setStats] = useState({ avg: 0, volatility: 0 });
    
    // Refs ensure we maintain stable references across renders without triggering effects
    const workerRef = useRef(null);
    const socketRef = useRef(null);
    const reconnectCount = useRef(0);
    const reconnectTimeoutRef = useRef(null); // SDE3: Track timeout for clean unmounting

    const connect = () => {
        // Close existing connection if any (prevents "Socket Leaks")
        if (socketRef.current) socketRef.current.close();
        
        socketRef.current = new WebSocket(url);

        socketRef.current.onopen = () => {
            console.log('Connected to Ingestion Stream');
            reconnectCount.current = 0; // Reset backoff on successful connection
        };

        socketRef.current.onmessage = (event) => {
            try {
                const rawData = JSON.parse(event.data);
                
                /**
                 * SDE3 OPTIMIZATION: "Fire and Forget"
                 * We don't do any logic here. We immediately hand the data to the 
                 * Worker thread to keep the Main Thread free for user interactions.
                 */
                if (workerRef.current) {
                    workerRef.current.postMessage({ 
                        type: 'PROCESS_BATCH', 
                        data: rawData 
                    });
                }
            } catch (err) {
                console.error('Failed to parse incoming stream:', err);
            }
        };

        socketRef.current.onclose = (e) => {
            // SDE3: Differentiate between intentional unmount and network failure
            if (e.wasClean) return;

            /**
             * FAULT TOLERANCE: Exponential Backoff
             * Prevents "Thundering Herd" problem if the server goes down.
             * Formula: min(1000 * 2^n, 30s)
             */
            const timeout = Math.min(1000 * Math.pow(2, reconnectCount.current), 30000);
            
            console.warn(`Connection lost. Retrying in ${timeout}ms...`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
                reconnectCount.current++;
                connect();
            }, timeout);
        };

        socketRef.current.onerror = (err) => {
            console.error('WebSocket Transport Error:', err);
        };
    };

    useEffect(() => {
        /**
         * SDE3: Worker Initialization
         * Workers should be instantiated once per URL change.
         */
        workerRef.current = new Worker(new URL('./dataWorker.js', import.meta.url));

        connect();

        workerRef.current.onmessage = (e) => {
            /**
             * SDE3: Update Throttle
             * Even if the worker sends 100 results/sec, React might only need to 
             * update at 60fps. The worker can batch these internally, or we can
             * use a local throttle here to protect the UI.
             */
            setStats(e.data.analytics);
        };

        workerRef.current.onerror = (err) => {
            console.error('Worker Script Error:', err);
        };

        // SDE3: Resource Cleanup (Crucial for SPA navigation)
        return () => {
            console.log('Cleaning up Real-Time Resources...');
            
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            
            socketRef.current?.close();
            workerRef.current?.terminate();
        };
    }, [url]); // Dependency on URL allows switching between different data streams

    return stats;
};
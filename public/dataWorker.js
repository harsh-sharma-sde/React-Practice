/**
 * ARCHITECTURAL CONTEXT:
 * This Worker acts as a "Data Processor" to keep the Main Thread (UI) at 60fps.
 * SDE3 Concern: Worker threads are not free; they have memory overhead. 
 * We use a sliding window to bound memory growth.
 */

// SDE3: Use a typed array or a fixed-size ring buffer if WINDOW_SIZE is massive 
// to avoid GC (Garbage Collection) thrashing from constant push/shift.
let buffer = [];
const WINDOW_SIZE = 50; 

/**
 * Event Listener for incoming raw data.
 * @param {MessageEvent} e - Contains { type, data }
 */
self.onmessage = function(e) {
    const { type, data } = e.data;

    if (type === 'PROCESS_BATCH') {
        // SDE3: Data Normalization & Ingestion
        buffer.push(data);
        
        // Evict old data to maintain a "Sliding Window" O(1) or O(N) depending on size
        if (buffer.length > WINDOW_SIZE) {
            buffer.shift(); 
        }

        /**
         * COMPUTATIONAL LAYER: Statistical Analysis
         * SDE3 Optimization: For very large windows, use an 'Incremental Average' 
         * formula to calculate mean in O(1) instead of O(N) via .reduce().
         */
        
        // 1. Calculate Arithmetic Mean
        const sum = buffer.reduce((acc, curr) => acc + curr.value, 0);
        const avg = sum / buffer.length;
        
        // 2. Calculate Standard Deviation (Volatility)
        // SDE3 Note: This is an O(N) operation. If WINDOW_SIZE > 10,000,
        // consider Wasm or partitioning the calculation.
        const variance = buffer.reduce(
            (acc, curr) => acc + Math.pow(curr.value - avg, 2), 
            0
        ) / buffer.length;
        
        const volatility = Math.sqrt(variance);

        /**
         * RESULTS DISPATCH:
         * SDE3 Note: postMessage uses 'Structured Clone' by default (CPU intensive).
         * If 'data' was a large Float32Array, we would use 'Transferables' 
         * to move memory ownership instead of cloning it.
         */
        self.postMessage({
            latest: data,
            analytics: { 
                avg, 
                volatility, 
                count: buffer.length,
                ts: Date.now() // Added for latency tracking (Main thread - Worker thread)
            }
        });
    }
    
    // SDE3: Lifecycle management
    if (type === 'TERMINATE') {
        buffer = [];
        self.close();
    }
};
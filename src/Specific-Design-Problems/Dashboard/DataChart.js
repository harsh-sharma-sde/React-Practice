import React, { useRef, useEffect } from 'react';

/**
 * ARCHITECTURAL CONTEXT:
 * This component follows the "Uncontrolled Canvas" pattern. 
 * We use React for the layout (DOM shell) but handle the rendering imperatively 
 * via Canvas API to maintain 60fps regardless of React's render cycle.
 */
const DataChart = ({ stats }) => {
    const canvasRef = useRef(null);
    
    // SDE3: Using useRef as a 'Backing Store' to prevent triggering 
    // React's Reconciliation/Diffing when new data arrives.
    const chartData = useRef([]);

    useEffect(() => {
        /**
         * DATA INGESTION:
         * We update our mutable ref here. This keeps the data in sync 
         * with the latest worker output without re-rendering the whole component.
         */
        chartData.current.push(stats.avg);
        
        // SDE3: Bound memory growth. In a production app, we'd use a 
        // Ring Buffer (Circular Array) to avoid O(N) .shift() overhead.
        if (chartData.current.length > 100) {
            chartData.current.shift(); 
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        /**
         * RENDERING OPTIMIZATION:
         * requestAnimationFrame (rAF) ensures we only paint in sync with the 
         * display refresh rate, preventing "Layout Thrashing" or dropped frames.
         */
        const draw = () => {
            // SDE3: Clear the canvas. For massive datasets, consider 
            // putImageData or drawing only the 'dirty' rectangle.
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#61dafb'; // Brand color (e.g., React Blue)
            ctx.lineJoin = 'round';      // Smoother line intersections

            const spacing = canvas.width / 100;
            
            // SDE3: Algorithmic Scaling. 
            // Drawing 100 points is trivial. Drawing 10,000 would require 
            // Path2D objects or Worker-side OffscreenCanvas.
            chartData.current.forEach((val, i) => {
                const x = i * spacing;
                // Normalize value to Canvas height (Assuming 0-1000 range)
                const y = canvas.height - (val / 1000) * canvas.height;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
        };

        // Schedule the draw on the next browser paint
        const animationId = requestAnimationFrame(draw);

        // SDE3: Cleanup to prevent memory leaks or zombie animations 
        // when the component unmounts.
        return () => cancelAnimationFrame(animationId);
        
    }, [stats]); // Re-run effect only when new statistics arrive

    return (
        <div className="chart-container">
            {/* SDE3 Optimization: use 'width' and 'height' attributes (logical size) 
                vs CSS (visual size) to prevent blurry lines on Retina/HiDPI screens.
            */}
            <canvas 
                ref={canvasRef} 
                width="800" 
                height="300" 
                style={{ border: '1px solid #444', display: 'block' }} 
            />
        </div>
    );
};

export default DataChart;
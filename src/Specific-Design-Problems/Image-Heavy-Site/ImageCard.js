import React, { useState } from 'react';
import { Blurhash } from 'react-blurhash';
import { useInView } from 'react-intersection-observer';

/**
 * ImageCard Component: Engineered for Pinterest-style Masonry Grids.
 * * CORE SDE3 CHALLENGES ADDRESSED:
 * 1. Layout Stability: Preventing "jumping" content as images load.
 * 2. Perceived Performance: Using BlurHash for immediate visual feedback.
 * 3. Network Efficiency: Only fetching bytes when the user is likely to see them.
 */
const ImageCard = ({ item }) => {
    // Local state to manage the transition from BlurHash to high-res image
    const [loaded, setLoaded] = useState(false);
    
    /**
     * INTERSECTION OBSERVER (Lazy Loading)
     * rootMargin '200px 0px': We start fetching the image 200px BEFORE it
     * enters the viewport. This "predictive loading" often results in the
     * image being ready by the time the user scrolls to it.
     */
    const { ref, inView } = useInView({
        triggerOnce: true, // Once triggered, keep the image in DOM to avoid re-fetching
        rootMargin: '200px 0px',
    });

    /**
     * PREVENTING CUMULATIVE LAYOUT SHIFT (CLS)
     * By applying the aspect-ratio (width / height) directly to the container, 
     * the browser reserves the exact vertical space in the masonry column 
     * immediately. Even if the image takes 5 seconds to load, the footer 
     * and surrounding cards won't move.
     */
    const containerStyle = {
        width: '100%',
        position: 'relative',
        backgroundColor: '#f0f0f0', // Fallback color while JS initializes
        borderRadius: '8px',
        overflow: 'hidden',
        // Native CSS property that uses the metadata we saved on the backend
        aspectRatio: `${item.width} / ${item.height}`, 
    };

    return (
        <div ref={ref} style={{ marginBottom: '16px' }}>
            <div style={containerStyle}>
                
                {/* * 1. THE PLACEHOLDER (BlurHash)
                  * This renders a tiny, blurred version of the image using a Canvas.
                  * It consumes almost zero bandwidth and provides a much better UX 
                  * than a spinning loader or an empty gray box.
                  */}
                {!loaded && (
                    <Blurhash
                        hash={item.blurhash}
                        width="100%"
                        height="100%"
                        resolutionX={32}
                        resolutionY={32}
                        punch={1}
                        style={{ position: 'absolute', top: 0, left: 0 }}
                    />
                )}

                {/* * 2. THE ASSET (Lazy-Loaded Image)
                  * inView check: The <img> tag isn't even added to the DOM until 
                  * the intersection observer triggers. This keeps the DOM light.
                  */}
                {inView && (
                    <img
                        src={item.url}
                        alt="Masonry content"
                        // onLoad: Only hide the Blurhash once the asset is fully decoded
                        onLoad={() => setLoaded(true)}
                        style={{
                            display: 'block',
                            width: '100%',
                            height: 'auto',
                            // Opacity transition prevents a "pop-in" effect, 
                            // making the app feel high-end/smooth.
                            opacity: loaded ? 1 : 0,
                            transition: 'opacity 0.3s ease-in-out',
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default ImageCard;
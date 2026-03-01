import React, { useRef, useEffect } from 'react';
import videojs from 'video.js';
// Import the default Video.js skin (essential for the play button and progress bar to show up)
import 'video.js/dist/video-js.css';

export const VideoPlayer = (props) => {
  // videoNode: A reference to the <div> where we will manually inject the Video.js player
  const videoNode = useRef(null);
  
  // player: A reference to the actual Video.js instance so we can call methods like .play() or .dispose()
  const player = useRef(null);
  
  // Destructure props: options (video settings) and onReady (optional callback)
  const { options, onReady } = props;

  /**
   * EFFECT 1: INITIALIZATION & UPDATES
   * This handles creating the player and updating it if the source changes.
   */
  useEffect(() => {
    // 1. INITIALIZATION: If the player doesn't exist yet, create it
    if (!player.current) {
      // Create a custom element 'video-js' (Video.js specifically looks for this or <video>)
      const videoElement = document.createElement("video-js");
      
      // Add a built-in Video.js class to center the big play button
      videoElement.classList.add('vjs-big-play-centered');
      
      // Style it to fill its parent container
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
      
      // Append this new element to our React-managed <div> (videoNode)
      videoNode.current.appendChild(videoElement);

      // Initialize Video.js on that element with the provided options
      player.current = videojs(videoElement, options, () => {
        // This callback runs once the player is officially "ready"
        videojs.log('player is ready');
        // If a parent component passed an onReady prop, call it
        onReady && onReady(player.current);
      });

    } else {
      // 2. UPDATES: If the player already exists, just update the settings
      // This is crucial for switching videos without re-mounting the whole player
      const p = player.current;
      p.autoplay(options.autoplay);
      p.src(options.sources); // Updates the video URL/Source
    }
  }, [options, videoNode, onReady]); // Re-run if options change (e.g., clicking a new movie)

  /**
   * EFFECT 2: CLEANUP
   * This handles memory management when the user closes the player or navigates away.
   */
  useEffect(() => {
    const playerCurrent = player.current;

    // The return function is the "cleanup" phase in React
    return () => {
      // If the player exists and hasn't been destroyed yet...
      if (playerCurrent && !playerCurrent.isDisposed()) {
        // .dispose() removes the player from the DOM and deletes all event listeners
        // This prevents memory leaks!
        playerCurrent.dispose();
        player.current = null;
      }
    };
  }, [player]);

  return (
    /* The 'data-vjs-player' attribute is a hint to Video.js 
       that this container holds a player instance.
    */
    <div data-vjs-player style={{ width: "100%", height: "100%" }}>
      {/* The 'ref={videoNode}' is the "hook" that allows us to 
          grab this <div> in the useEffect and inject the video element.
      */}
      <div ref={videoNode} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default VideoPlayer;
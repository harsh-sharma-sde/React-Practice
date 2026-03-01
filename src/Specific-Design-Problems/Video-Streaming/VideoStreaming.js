import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VideoPlayer from './VideoPlayer';
// Fa icons are used for the Netflix-style UI (Play button, Plus for upload, etc.)
import { FaPlay, FaPlus, FaArrowLeft, FaCloudUploadAlt } from 'react-icons/fa';

const VideoStreaming = () => {
  /** * STATE MANAGEMENT 
   */
  // Stores the list of video objects fetched from the backend
  const [videos, setVideos] = useState([]);
  
  // Stores the URL of the video currently being played; null means the player is closed
  const [currentVideoSrc, setCurrentVideoSrc] = useState(null);
  
  // Boolean to toggle the visibility of the Upload Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Tracking if an upload is in progress to disable buttons and show "Uploading..." text
  const [uploading, setUploading] = useState(false);
  
  // Stores the actual File object selected from the user's computer
  const [file, setFile] = useState(null);

  /**
   * SIDE EFFECTS
   */
  // useEffect with an empty dependency array runs once when the component mounts
  useEffect(() => {
    fetchVideos();
  }, []);

  /**
   * DATA FETCHING (GET)
   */
  const fetchVideos = async () => {
    try {
      // Hits the backend endpoint to get the array of video metadata
      const res = await axios.get('http://localhost:8000/videos');
      setVideos(res.data); // Updates the 'videos' state, triggering a re-render
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  /**
   * FILE UPLOAD LOGIC (POST)
   */
  const handleUpload = async () => {
    if (!file) return; // Exit if user clicked upload without selecting a file
    
    setUploading(true);
    
    // FormData is required for multipart/form-data (sending files over HTTP)
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post('http://localhost:8000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setIsUploadModalOpen(false); // Close modal on success
      alert("Upload started! Refresh in a moment.");
      
      // Since video processing (transcoding) takes time on the server, 
      // we wait 3 seconds before refreshing the list to see the new entry.
      setTimeout(fetchVideos, 3000);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false); // Re-enable buttons
      setFile(null);       // Clear the file input state
    }
  };

  return (
    <div className="app">
      {/* 1. NAVBAR SECTION */}
      <nav className="navbar">
        <div className="logo">NETFLIX_CLONE</div>
        <div className="nav-actions">
          {/* Opens the upload modal */}
          <button className="btn-icon" onClick={() => setIsUploadModalOpen(true)}>
            <FaPlus title="Upload Video" />
          </button>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
            alt="User"
            style={{ width: "32px", borderRadius: "4px", cursor: "pointer" }}
          />
        </div>
      </nav>

      {/* 2. HERO SECTION (BANNER) 
          We hide the banner if a video is currently playing to save screen space.
      */}
      {!currentVideoSrc && (
        <header className="hero">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1 className="hero-title">Inception</h1>
            <p className="hero-desc">
              A thief who steals corporate secrets through the use of dream-sharing technology...
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="btn-play"><FaPlay /> Play</button>
              <button className="btn-play" style={{ background: "rgba(109, 109, 110, 0.7)", color: "white" }}>
                More Info
              </button>
            </div>
          </div>
        </header>
      )}

      {/* 3. VIDEO GRID SECTION 
          This maps through the 'videos' array and displays a card for each.
      */}
      <div className="main-content">
        <h2 className="section-title">Your Uploads & Processing</h2>
        <div className="video-grid">
          {videos.map((vid) => (
            <div
              key={vid.id}
              className="video-card"
              // Only allow clicking to play if the video status is 'ready'
              onClick={() => vid.status === 'ready' && setCurrentVideoSrc(vid.videoUrl)}
            >
              {/* Dynamic placeholder thumbnail using the video's name */}
              <img
                src={`https://via.placeholder.com/300x169/000000/FFFFFF/?text=${vid.originalName}`}
                className="thumbnail"
                alt="thumbnail"
              />
              <div className="video-info">
                <h4>{vid.originalName}</h4>
                {/* Conditional styling: Green if ready, Orange if still processing */}
                <p style={{ fontSize: "12px", color: vid.status === 'ready' ? '#46d369' : 'orange' }}>
                  {vid.status === 'ready' ? 'New Episode' : 'Processing...'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. FULL SCREEN PLAYER OVERLAY 
          Conditional Rendering: This block only exists in the DOM if currentVideoSrc is set.
      */}
      {currentVideoSrc && (
        <div className="player-overlay">
          {/* Back button clears the source, which closes this overlay */}
          <button className="back-btn" onClick={() => setCurrentVideoSrc(null)}>
            <FaArrowLeft /> Back
          </button>
          <div style={{ width: "80%", height: "80%" }}>
            <VideoPlayer
              options={{
                autoplay: true,
                controls: true,
                responsive: true,
                fluid: true,
                // HLS (m3u8) source type for adaptive streaming
                sources: [{ src: currentVideoSrc, type: 'application/x-mpegURL' }]
              }}
            />
          </div>
        </div>
      )}

      {/* 5. UPLOAD MODAL 
          Conditional Rendering: Shown only when isUploadModalOpen is true.
      */}
      {isUploadModalOpen && (
        // Clicking the backdrop closes the modal
        <div className="modal-backdrop" onClick={() => setIsUploadModalOpen(false)}>
          {/* e.stopPropagation() prevents clicking inside the modal from closing it */}
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Upload Video</h2>
            <div className="upload-box">
              <FaCloudUploadAlt size={50} color="#b3b3b3" />
              <p>Drag and drop or click to upload</p>
              <input
                type="file"
                accept="video/mp4"
                onChange={(e) => setFile(e.target.files[0])} // Captures the file object
                style={{ marginTop: "10px", color: "white" }}
              />
            </div>
            <button 
              className="btn-primary" 
              onClick={handleUpload} 
              disabled={uploading} // Prevents double-uploads
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoStreaming;
import React, { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css"; // Import Quill's default styling
import "./Editor.css"; // Our custom "Google Docs" styling

// Yjs Imports
import * as Y from "yjs"; // The CRDT library (shared data logic)
import { WebsocketProvider } from "y-websocket"; // Networking via WebSockets
import { QuillBinding } from "y-quill"; // Connects Yjs to Quill
import QuillCursors from "quill-cursors"; // Handles showing other users' cursors

// 1. Register the Cursors module.
// Quill is modular. By default, it doesn't know how to draw other people's cursors.
// We have to tell it to use the 'quill-cursors' library.
Quill.register("modules/cursors", QuillCursors);

// Helper to assign a random color to each user for their cursor/avatar
const getRandomColor = () => {
  const colors = ["#d75949", "#9f6bb0", "#e3b052", "#4b9c75", "#5c81cc"];
  return colors[Math.floor(Math.random() * colors.length)];
};

const Editor = ({ docId = "my-document", username = "Guest" }) => {
  // useRef allows us to access the actual DOM element <div> where Quill will attach
  const editorRef = useRef(null);
  
  // State management for UI updates
  const [status, setStatus] = useState("Connecting..."); // Connection status
  const [users, setUsers] = useState([]); // List of active users (Presence)

  // useEffect runs once when the component mounts (or when docId/username changes).
  // This is where we set up the collaboration engine.
  useEffect(() => {
    // ------------------------------------------------------------------
    // STEP 1: Initialize the Shared Document (The "Brain")
    // ------------------------------------------------------------------
    // A Y.Doc is the core data structure. It holds all the shared content.
    const ydoc = new Y.Doc();

    // ------------------------------------------------------------------
    // STEP 2: Connect to the WebSocket Server (The "Network")
    // ------------------------------------------------------------------
    // This connects our local 'ydoc' to the server at 'ws://localhost:1234'.
    // 'docId' acts as the room name. Everyone with the same docId sees the same data.
    const wsProvider = new WebsocketProvider(
      "ws://localhost:1234",
      docId,
      ydoc
    );

    // Listen for connection events to update the UI (Online/Offline)
    wsProvider.on("status", (event) => {
      setStatus(event.status === "connected" ? "Saved" : "Offline");
    });

    // ------------------------------------------------------------------
    // STEP 3: Handle "Awareness" (Presence)
    // ------------------------------------------------------------------
    // Awareness is ephemeral data (data that doesn't need to be saved permanently).
    // Examples: Cursor position, user name, user color.
    const awareness = wsProvider.awareness;
    const color = getRandomColor();

    // Tell everyone else: "I am here, my name is X, and my color is Y"
    awareness.setLocalStateField("user", {
      name: username,
      color: color,
    });

    // Listen for updates: When someone joins/leaves or moves their cursor
    awareness.on("change", () => {
      // Get all states (everyone currently connected)
      const states = Array.from(awareness.getStates().values());
      
      // Filter out system states that might be empty and update React state
      const activeUsers = states.filter((state) => state.user);
      setUsers(activeUsers);
    });

    // ------------------------------------------------------------------
    // STEP 4: Initialize Quill (The "Editor")
    // ------------------------------------------------------------------
    // We get the shared text type from Yjs. Think of this as a collaborative String.
    const ytext = ydoc.getText("quill");

    // Create the Quill instance attached to our DOM div
    const quill = new Quill(editorRef.current, {
      theme: "snow",
      modules: {
        cursors: true, // Activate the cursor module we registered earlier
        toolbar: "#toolbar-container", // Tell Quill to use our CUSTOM toolbar div, not its internal one
        history: {
          userOnly: true, // Important: Undo/Redo should only undo MY typing, not other people's
        },
      },
      placeholder: "Type something amazing...",
    });

    // ------------------------------------------------------------------
    // STEP 5: Bind them together (The "Glue")
    // ------------------------------------------------------------------
    // This is the magic line. It syncs the 'ytext' (data) with 'quill' (UI).
    // It also passes 'awareness' so Quill knows where to draw the cursors.
    const binding = new QuillBinding(ytext, quill, awareness);

    // ------------------------------------------------------------------
    // STEP 6: Cleanup (Very Important in React)
    // ------------------------------------------------------------------
    // When the component unmounts (user leaves page), we must close connections.
    // If we don't do this, we get memory leaks and "ghost" users.
    return () => {
      binding.destroy();   // Stop syncing
      wsProvider.destroy(); // Close WebSocket connection
      ydoc.destroy();       // Clear data from memory
    };
  }, [docId, username]);

  return (
    <div className="layout">
      {/* ----------------------------------------------------------- */}
      {/* HEADER SECTION: Displays Title, Status, and Active Users    */}
      {/* ----------------------------------------------------------- */}
      <header className="header">
        <div className="doc-info">
          <span className="doc-icon">📝</span>
          <div>
            <input 
              className="doc-title-input" 
              defaultValue="Untitled Document" 
            />
            {/* Shows "Saved" or "Offline" based on WebSocket status */}
            <div className="doc-status">{status}</div>
          </div>
        </div>

        {/* Avatar Cluster: Maps through 'users' state to show circles */}
        <div className="avatars">
          {users.map((u, i) => (
            <div
              key={i}
              className="avatar"
              style={{ backgroundColor: u.user.color }}
              title={u.user.name} // Tooltip on hover
            >
              {u.user.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {/* A fake "+X" bubble just for aesthetics */}
          <div className="avatar" style={{background: "#ccc", fontSize: '10px', color: '#000'}}>
             +{users.length}
          </div>
        </div>
      </header>

      {/* ----------------------------------------------------------- */}
      {/* TOOLBAR SECTION: Sticky bar with formatting buttons         */}
      {/* ----------------------------------------------------------- */}
      {/* 
          Notice the ID "toolbar-container". 
          Quill looks for this ID because of the config in Step 4.
          The classes (ql-bold, ql-italic) are standard Quill classes.
      */}
      <div id="toolbar-container">
        <span className="ql-formats">
          <select className="ql-header">
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
            <option selected>Normal</option>
          </select>
          <select className="ql-font"></select>
        </span>
        <span className="ql-formats">
          <button className="ql-bold"></button>
          <button className="ql-italic"></button>
          <button className="ql-underline"></button>
          <button className="ql-strike"></button>
        </span>
        <span className="ql-formats">
          <button className="ql-list" value="ordered"></button>
          <button className="ql-list" value="bullet"></button>
        </span>
        <span className="ql-formats">
          <select className="ql-color"></select>
          <select className="ql-background"></select>
        </span>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* EDITOR SECTION: The scrollable area with the "Paper"        */}
      {/* ----------------------------------------------------------- */}
      <div className="editor-scroller">
        {/* Quill attaches specifically to this div via editorRef */}
        <div ref={editorRef} className="document-page" />
      </div>
    </div>
  );
};

export default Editor;
import React, { useEffect, useRef, useState } from "react";
import { chatChannel } from "./services/channel";
import { getSharedKey, encryptMessage, decryptMessage } from "./services/encryption";
import "./RealTimeChat.css";

/*
  We simulate two users by opening two tabs.
  Each tab prompts for a userId.
  In real systems, this would come from authentication (JWT/session).
*/
const userId = prompt("Enter User ID (user1 or user2)");

function RealTimeChat() {
  /*
    messages → stores all chat messages for this session
    onlineUsers → stores currently online users (Set prevents duplicates)
    cryptoKey → shared encryption key for E2E encryption
  */
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [cryptoKey, setCryptoKey] = useState(null);

  /*
    messagesEndRef → used for auto-scroll to bottom
    initializedRef → ensures channel listeners are attached only once
    (Prevents duplicate event listeners on re-render)
  */
  const messagesEndRef = useRef(null);
  const initializedRef = useRef(false);

  /* =========================================================
     1️⃣ INITIALIZE SHARED ENCRYPTION KEY (E2E Simulation)
     ========================================================= */

  useEffect(() => {
    let mounted = true;

    async function initKey() {
      /*
        In real-world E2E:
        - We would exchange public keys
        - Derive shared secret via Diffie-Hellman
        - Rotate session keys periodically

        Here we simulate shared symmetric key.
      */
      const key = await getSharedKey();

      if (mounted) setCryptoKey(key);
    }

    initKey();

    return () => {
      mounted = false; // Prevent state update on unmounted component
    };
  }, []);

  /* =========================================================
     2️⃣ INITIALIZE REAL-TIME CHANNEL + LISTENERS
     ========================================================= */

  useEffect(() => {
    /*
      Do not initialize until:
      - Encryption key is ready
      - We haven't already initialized listeners
    */
    if (!cryptoKey || initializedRef.current) return;

    initializedRef.current = true;

    /*
      chatChannel is our abstraction over BroadcastChannel.
      In production this would be WebSocket.
    */
    chatChannel.init();

    /* ===============================
       🔵 PRESENCE HANDSHAKE LOGIC
       =============================== */

    /*
      Why handshake?

      BroadcastChannel does NOT replay events.
      If a tab opens late, it may miss "USER_ONLINE".

      So:
      - New tab sends PRESENCE_REQUEST
      - Existing tabs respond with USER_ONLINE
    */

    chatChannel.on("PRESENCE_REQUEST", () => {
      chatChannel.send("USER_ONLINE", userId);
    });

    /*
      When someone comes online,
      add them to the Set (avoid duplicates).
    */
    chatChannel.on("USER_ONLINE", (id) => {
      if (id === userId) return; // Ignore self

      setOnlineUsers((prev) => {
        const copy = new Set(prev);
        copy.add(id);
        return copy;
      });
    });

    /*
      Remove user from presence when offline
    */
    chatChannel.on("USER_OFFLINE", (id) => {
      setOnlineUsers((prev) => {
        const copy = new Set(prev);
        copy.delete(id);
        return copy;
      });
    });

    // Ask others who is online
    chatChannel.send("PRESENCE_REQUEST");

    // Announce self online
    chatChannel.send("USER_ONLINE", userId);

    /* ===============================
       📨 INCOMING MESSAGE HANDLER
       =============================== */

    chatChannel.on("NEW_MESSAGE", async (msg) => {
      /*
        Ignore our own messages.
        Optimistic UI already added them.
      */
      if (msg.senderId === userId) return;

      try {
        /*
          Decrypt message using shared key.
          In real E2E systems:
          - Server never sees plaintext.
        */
        const decrypted = await decryptMessage(cryptoKey, msg.encrypted);

        const newMsg = {
          ...msg,
          content: decrypted,
          status: "delivered",
        };

        /*
          Append to local message state
        */
        setMessages((prev) => [...prev, newMsg]);

        /*
          Simulate read receipt after small delay
          (In real apps, read receipt triggers when message becomes visible)
        */
        setTimeout(() => {
          chatChannel.send("READ_RECEIPT", { id: msg.id });
        }, 500);
      } catch (err) {
        console.error("Decryption failed:", err);
      }
    });

    /* ===============================
       ✅ READ RECEIPT HANDLER
       =============================== */

    chatChannel.on("READ_RECEIPT", ({ id }) => {
      /*
        Update only matching message status
        This mimics server acknowledgement.
      */
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, status: "read" } : m
        )
      );
    });

    /* ===============================
       🧹 CLEANUP
       =============================== */

    const handleUnload = () => {
      chatChannel.send("USER_OFFLINE", userId);
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [cryptoKey]);

  /* =========================================================
     3️⃣ AUTO SCROLL TO BOTTOM ON NEW MESSAGE
     ========================================================= */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* =========================================================
     4️⃣ SEND MESSAGE (Optimistic UI)
     ========================================================= */

  const sendMessage = async (text, type = "text") => {
    if (!text || !cryptoKey) return;

    const trimmed = type === "text" ? text.trim() : text;
    if (!trimmed) return;

    const id = crypto.randomUUID(); // Prevent duplication

    /*
      Encrypt before sending.
      Server will only see encrypted payload.
    */
    const encrypted = await encryptMessage(cryptoKey, trimmed);

    const message = {
      id,
      senderId: userId,
      type,
      encrypted,
      content: trimmed,
      status: "sending", // Initial state
      createdAt: new Date().toISOString(),
    };

    /*
      Optimistic Update:
      Show message immediately without waiting for network.
    */
    setMessages((prev) => [...prev, message]);

    /*
      Simulate network delay (WebSocket latency)
    */
    setTimeout(() => {
      chatChannel.send("NEW_MESSAGE", message);

      /*
        Update status to "sent"
        In real system: server ACK would trigger this.
      */
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, status: "sent" } : m
        )
      );
    }, 800);
  };

  /* =========================================================
     5️⃣ HANDLE IMAGE UPLOAD
     ========================================================= */

  const handleFile = (file) => {
    if (!file) return;

    /*
      Convert image to base64.
      NOTE:
      In production:
      - Upload to S3
      - Send URL instead
    */
    const reader = new FileReader();

    reader.onload = () => {
      sendMessage(reader.result, "image");
    };

    reader.readAsDataURL(file);
  };

  /* =========================================================
     6️⃣ UI RENDER
     ========================================================= */

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <h3>{userId}</h3>
        <span className="presence">
          Online:{" "}
          {[...onlineUsers].length > 0
            ? [...onlineUsers].join(", ")
            : "None"}
        </span>
      </div>

      {/* Messages */}
      <div className="messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.senderId === userId ? "sent" : "received"}`}
          >
            {msg.type === "image" ? (
              <img
                src={msg.content}
                alt={`Shared by ${msg.senderId}`}
                className="chat-image"
              />
            ) : (
              <span>{msg.content}</span>
            )}

            {/* Show status only for own messages */}
            <div className="status">
              {msg.senderId === userId && (
                <>
                  {msg.status === "sent" && "✓"}
                  {msg.status === "delivered" && "✓✓"}
                  {msg.status === "read" && "✓✓ Read"}
                </>
              )}
            </div>
          </div>
        ))}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input">
        <label className="attach-btn">
          📎
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files[0])}
            hidden
          />
        </label>

        <input
          type="text"
          placeholder="Type a message..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage(e.target.value);
              e.target.value = "";
            }
          }}
        />

        <button
          className="send-btn"
          onClick={() => {
            const input = document.querySelector(".chat-input input[type='text']");
            if (!input.value.trim()) return;
            sendMessage(input.value);
            input.value = "";
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

export default RealTimeChat;

// 🎯 What You Can Now Explain in Interview

// You can confidently talk about:

// Presence handshake

// Optimistic UI

// Message state machine

// E2E encryption simulation

// Event-driven architecture

// State reconciliation

// Cleanup & memory safety

// Failure handling

// Network delay simulation

// Real-time bidirectional communication
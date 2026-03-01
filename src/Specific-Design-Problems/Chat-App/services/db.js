/*
  OFFLINE STORAGE LAYER
  =====================

  We use IndexedDB via the "idb" wrapper library.

  Why IndexedDB?
  - localStorage is synchronous and blocks the main thread
  - localStorage size limit is small (~5MB)
  - IndexedDB supports large structured data
  - IndexedDB is asynchronous (non-blocking)

  In production chat apps:
  - Messages are cached locally
  - Unsent messages are queued
  - On reconnect → sync with server
*/

import { openDB } from "idb";

/*
  Create (or open) a database named "chat-db"
  Version = 1

  IndexedDB uses versioning for schema migrations.
  If version changes → upgrade() runs.
*/
const dbPromise = openDB("chat-db", 1, {
  upgrade(db) {
    /*
      upgrade() runs when:
      - DB is created first time
      - Version number increases

      We create an object store (like a table in SQL)
    */
    if (!db.objectStoreNames.contains("messages")) {
      /*
        keyPath: "id"
        Means each stored object must have a unique "id" field.
        Similar to PRIMARY KEY in SQL.
      */
      db.createObjectStore("messages", { keyPath: "id" });
    }
  }
});

/*
  saveMessage(message)

  Stores a message in IndexedDB.

  If message with same ID exists → it updates (PUT behavior).
  If not → it inserts.

  Why useful?
  - Cache messages for offline access
  - Persist across refresh
  - Store optimistic messages before server ACK
*/
export async function saveMessage(message) {
  const db = await dbPromise;

  /*
    put() = insert or update
    Equivalent to UPSERT in SQL
  */
  await db.put("messages", message);
}

/*
  getAllMessages()

  Fetches all stored messages from local database.

  In production:
  - On app load → hydrate UI from IndexedDB
  - Then sync with server for new messages
*/
export async function getAllMessages() {
  const db = await dbPromise;

  /*
    getAll() retrieves all records from object store.
    Could be heavy if messages are large.

    In scalable apps:
    - Use pagination
    - Use indexes (createdAt)
    - Use cursor instead of getAll
  */
  return db.getAll("messages");
}

// 🧠 Interview-Level Explanation

// If interviewer asks:

// Why IndexedDB instead of localStorage?

// You say:

// Async and non-blocking

// Larger storage capacity

// Structured storage

// Better for large datasets

// Can store blobs/media

// That’s senior-level reasoning.

// 🔥 How This Fits Into Chat Architecture

// Production offline flow:

// Incoming message
//      ↓
// Save to IndexedDB
//      ↓
// Render UI

// User offline
//      ↓
// Store outgoing message in IndexedDB (status: pending)
//      ↓
// When online:
//    - Send queued messages
//    - Update status
/*
  ChatChannel

  This class abstracts our real-time communication layer.

  In this demo:
  - We use BroadcastChannel (works across browser tabs).

  In production:
  - This would be replaced with WebSocket / Socket.IO / SSE.
  - Possibly backed by Redis/Kafka for horizontal scaling.
*/

class ChatChannel {
  constructor() {
    /*
      BroadcastChannel allows communication
      between browser tabs of the same origin.

      Channel name "advanced-chat" acts like a topic.
      All tabs subscribed to this name receive messages.
    */
    this.channel = new BroadcastChannel("advanced-chat");

    /*
      listeners is a map:
      {
        EVENT_TYPE: [callback1, callback2]
      }

      This allows multiple subscribers per event type.
      Similar to EventEmitter pattern.
    */
    this.listeners = {};
  }

  /*
    send(type, payload, delay)

    type → event name (e.g., "NEW_MESSAGE", "USER_ONLINE")
    payload → actual data
    delay → simulate network latency

    Why simulate delay?
    - To mimic real WebSocket latency
    - To test optimistic UI behavior
    - To simulate asynchronous transport
  */
  send(type, payload, delay = 800) {
    setTimeout(() => {
      this.channel.postMessage({ type, payload });
    }, delay);
  }

  /*
    on(type, callback)

    Registers event listeners.

    Similar to:
      socket.on("NEW_MESSAGE", handler)

    We store multiple callbacks per event type.
  */
  on(type, callback) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }

    this.listeners[type].push(callback);
  }

  /*
    init()

    Attaches a single global onmessage handler.

    When any tab sends a message:
    - BroadcastChannel receives it
    - We extract { type, payload }
    - We call all registered callbacks for that type

    This acts like:
      WebSocket.onmessage
  */
  init() {
    this.channel.onmessage = (event) => {
      const { type, payload } = event.data;

      /*
        Optional chaining ensures:
        - If no listeners exist for this type,
          we don't throw errors.
      */
      this.listeners[type]?.forEach((cb) => cb(payload));
    };
  }
}

/*
  Export singleton instance.

  Why singleton?

  We want:
  - Only one communication layer
  - Shared across entire app
  - Avoid multiple BroadcastChannel instances

  In production:
  - This would be a single WebSocket connection.
*/
export const chatChannel = new ChatChannel();


// 🎯 How This Maps to Real System Design

// Your current architecture:

// React UI
//    ↓
// ChatChannel (BroadcastChannel)
//    ↓
// Other Browser Tab

// Production architecture:

// React UI
//    ↓
// WebSocket Client
//    ↓
// Load Balancer
//    ↓
// WebSocket Servers
//    ↓
// Redis PubSub
//    ↓
// Other WebSocket Servers
//    ↓
// Other Client

// So your ChatChannel class is basically a WebSocket abstraction layer.

// 🔥 If This Was Production, We Would Improve It Like This:
// 1️⃣ Add reconnect logic

// socket.onclose = () => retry();

// 2️⃣ Add message acknowledgements

// Instead of blind send:

// send(message)
// wait for ACK
// update status

// 3️⃣ Add heartbeat

// setInterval(() => send("PING"), 10000)

// 4️⃣ Add message ordering / sequence numbers

// To prevent:

// Out-of-order delivery

// Duplicate messages

// 5️⃣ Add unsubscribe support

// Currently we don't remove listeners.
// Production would need:

// off(type, callback)

// To prevent memory leaks.

// 🧠 Interview Insight

// If interviewer asks:

// Why did you abstract ChatChannel?

// You say:

// “To decouple the transport layer from the UI. This allows us to switch from BroadcastChannel to WebSocket without changing UI logic.”

// That’s senior-level thinking.
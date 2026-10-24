import { io } from 'socket.io-client';

// Backend URL. Override with VITE_SERVER_URL in client/.env if needed.
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

// autoConnect is off: we connect only when the player clicks Play Now.
export const socket = io(SERVER_URL, {
  autoConnect: false,
  reconnectionAttempts: 5,
});

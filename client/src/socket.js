import { io } from 'socket.io-client';

// Connect to the backend on the same domain as the website.
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || window.location.origin;

export const socket = io(SERVER_URL, {
  autoConnect: false,
  reconnectionAttempts: 5,
});

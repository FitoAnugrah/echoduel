import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

let globalSocket = null;

export const disconnectSocket = () => {
  if (globalSocket) {
    globalSocket.disconnect();
    globalSocket = null;
  }
};

/**
 * Returns a stable socket instance.
 * Reconnects automatically when the token in localStorage changes
 * (e.g. after login/logout or token refresh).
 */
const useSocket = () => {
  const [socket, setSocket] = useState(globalSocket);
  // Track the token that was used to create the current socket
  const activeTokenRef = useRef(globalSocket ? localStorage.getItem('echoduel_token') : null);

  // Read current token on every render so we can detect changes
  const currentToken = localStorage.getItem('echoduel_token');

  useEffect(() => {
    const token = currentToken;

    if (!token) {
      // No token — disconnect any existing socket and clear state
      if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
        activeTokenRef.current = null;
      }
      setSocket(null);
      return;
    }

    // If a socket already exists AND was created with the same token, reuse it
    if (globalSocket && activeTokenRef.current === token) {
      setSocket(globalSocket);
      return;
    }

    // Token changed or no socket yet — disconnect old socket and create a new one
    if (globalSocket) {
      globalSocket.disconnect();
      globalSocket = null;
    }

    globalSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    activeTokenRef.current = token;
    setSocket(globalSocket);

    return () => {
      // Only cleanup on true unmount (app teardown), not token change
      // Token change is handled above by disconnecting the old socket
    };
  }, [currentToken]);

  return socket;
};

export default useSocket;
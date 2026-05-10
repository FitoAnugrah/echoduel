import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const useSocket = () => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('echoduel_token');
        if (!token) {
            return undefined;
        }

        const socketInstance = io(
            import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
                auth: { token },
                transports: ['websocket'],
            });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return socket;
};

export default useSocket;
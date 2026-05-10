import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

let globalSocket = null;

const useSocket = () => {
    const [socket, setSocket] = useState(globalSocket);

    useEffect(() => {
        if (globalSocket) {
            setSocket(globalSocket);
            return;
        }

        const token = localStorage.getItem('echoduel_token');
        if (!token) return;

        globalSocket = io(
            import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
                auth: { token },
                transports: ['websocket'],
            });

        setSocket(globalSocket);
    }, []);

    return socket;
};

export default useSocket;
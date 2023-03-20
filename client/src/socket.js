import io from 'socket.io-client';
import { BACKEND_URL } from './constants';

const socket = io(`${ BACKEND_URL }`, {
    forceNew: true,
    transports: ['websocket'],
});

export default socket;

/* Removed params from socket connection */
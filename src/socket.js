import { io } from 'socket.io-client';

const token = localStorage.getItem('token'); // On récupère le token JWT

const socket = io('http://127.0.0.1:5000', {
  autoConnect: false,
  auth: {
    token: token, // Token envoyé dans auth, méthode recommandée
  },
});

const socketClient = {
  socket,
  connect: () => {
    if (!socket.connected) socket.connect();
  },
  disconnect: () => {
    if (socket.connected) socket.disconnect();
  },
};

export default socketClient;

import { io } from 'socket.io-client';

// Ancienne version statique (token lu une fois au chargement du module)
// const token = localStorage.getItem('token'); // On récupère le token JWT
// const socket = io('http://127.0.0.1:5000', {
//   autoConnect: false,
//   auth: {
//     token: token, // Token envoyé dans auth, méthode recommandée
//   },
// });

const socket = io('http://127.0.0.1:5000', {
  autoConnect: false,
  auth: {
    token: null, // On met à null pour pouvoir le modifier dynamiquement avant connexion
  },
});

const socketClient = {
  socket,
  connect: () => {
    const token = localStorage.getItem('token'); // Récupération du token à chaque connexion
    socket.auth.token = token; // Mise à jour dynamique du token dans l'objet auth
    if (!socket.connected) socket.connect();
  },
  disconnect: () => {
    if (socket.connected) socket.disconnect();
  },
};

export default socketClient;

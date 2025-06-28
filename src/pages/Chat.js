import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import socketClient from '../socket';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../css/Chat.css';

export default function Chat() {
  const { roomId } = useParams();
  const { user, logout } = useAuth();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ username: user?.username || '', email: user?.email || '' });
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);

  const messagesEndRef = useRef();
  const privateMessagesEndRef = useRef();

  const [privateChatUser, setPrivateChatUser] = useState(null);
  const [privateMessages, setPrivateMessages] = useState([]);
  const [privateInput, setPrivateInput] = useState('');

  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [creatingRoom, setCreatingRoom] = useState(false);

  // Connexion socket
  useEffect(() => {
    socketClient.connect();
    return () => socketClient.disconnect();
  }, []);

  // Récupération des salons
  useEffect(() => {
    setLoadingRooms(true);
    socketClient.socket.emit('getRooms');
    const handleRoomList = (rooms) => {
      setRooms(rooms);
      setLoadingRooms(false);
    };
    socketClient.socket.on('roomList', handleRoomList);
    return () => socketClient.socket.off('roomList', handleRoomList);
  }, []);

  // Chargement des messages pour la salle courante
  useEffect(() => {
    let isMounted = true;
    async function fetchMessages() {
      try {
        setLoadingMessages(true);
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://127.0.0.1:5000/api/messages/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isMounted) setMessages(res.data);
      } catch (err) {
        console.error('Erreur messages :', err);
      } finally {
        if (isMounted) setLoadingMessages(false);
      }
    }
    if (roomId) fetchMessages();
    return () => { isMounted = false; };
  }, [roomId]);

  // Écoute des nouveaux messages et utilisateurs en ligne
  useEffect(() => {
    if (!roomId) return;
    socketClient.socket.emit('joinRoom', roomId);
    const handleNewMessage = (msg) => setMessages((prev) => [...prev, msg]);
    const handleOnlineUsers = (users) => setOnlineUsers(users);
    socketClient.socket.on('newMessage', handleNewMessage);
    socketClient.socket.on('onlineUsers', handleOnlineUsers);
    return () => {
      socketClient.socket.emit('leaveRoom', roomId);
      socketClient.socket.off('newMessage', handleNewMessage);
      socketClient.socket.off('onlineUsers', handleOnlineUsers);
    };
  }, [roomId]);

  // Écoute du chat privé
  useEffect(() => {
    const handleNewPrivateMessage = (msg) => {
      if (
        privateChatUser &&
        (String(msg.from._id) === String(privateChatUser._id) || String(msg.to._id) === String(privateChatUser._id))
      ) {
        setPrivateMessages((prev) => [...prev, msg]);
      }
    };
    socketClient.socket.on('newPrivateMessage', handleNewPrivateMessage);
    return () => socketClient.socket.off('newPrivateMessage', handleNewPrivateMessage);
  }, [privateChatUser]);

  // Scroll automatique
  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);
  useEffect(() => privateMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [privateMessages]);

  // Récupération de la liste des utilisateurs bloqués
  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://127.0.0.1:5000/api/users/blocked', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBlockedUsers(res.data || []);
      } catch (err) {
        console.error('Erreur blocked users :', err);
      }
    };
    fetchBlockedUsers();
  }, []);

  // Envoyer un message dans le salon
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    socketClient.socket.emit('sendMessage', { roomId, content: trimmed });
    setMessages((prev) => [...prev, {
      _id: `temp-${Date.now()}`,
      content: trimmed,
      author: { _id: user._id, username: user.username },
      createdAt: new Date().toISOString(),
      isTemp: true,
    }]);
    setInput('');
  }, [input, roomId, user]);

  // Supprimer un message
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce message ?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:5000/api/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (err) {
      console.error('Erreur suppression message :', err);
      alert('Erreur lors de la suppression du message');
    }
  };

  // Chat privé
  const handleSendPrivateMessage = (e) => {
    e.preventDefault();
    if (!privateChatUser) return alert('Sélectionnez un utilisateur pour discuter en privé');
    const trimmed = privateInput.trim();
    if (!trimmed) return;
    socketClient.socket.emit('sendPrivateMessage', {
      toUserId: privateChatUser._id,
      content: trimmed,
    });
    setPrivateMessages((prev) => [...prev, {
      _id: `temp-${Date.now()}`,
      content: trimmed,
      from: { _id: user._id, username: user.username },
      to: { _id: privateChatUser._id },
      createdAt: new Date().toISOString(),
      isTemp: true,
    }]);
    setPrivateInput('');
  };

  // Sélection d’un utilisateur pour chat privé
  const handleSelectPrivateUser = async (u) => {
    setPrivateChatUser(u);
    setPrivateMessages([]);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://127.0.0.1:5000/api/messages/private/${u._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPrivateMessages(res.data);
    } catch (err) {
      console.error('Erreur chargement messages privés :', err);
    }
  };

  // Profil
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://127.0.0.1:5000/api/users/${user._id}`, profileForm);
      alert('Profil mis à jour');
      setEditProfile(false);
    } catch {
      alert('Erreur mise à jour profil');
    }
  };

  // Création de salon
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return alert('Nom requis');
    setCreatingRoom(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://127.0.0.1:5000/api/rooms', {
        name: newRoomName.trim(),
        description: newRoomDesc.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewRoomName('');
      setNewRoomDesc('');
      socketClient.socket.emit('getRooms');
    } catch {
      alert('Erreur création salle');
    } finally {
      setCreatingRoom(false);
    }
  };

  // Signaler & bannir (stubs)
  const handleReportUser = (userId) => alert(`Signalement utilisateur ${userId}`);
  const handleBanUser = (userId) => alert(`Bannir utilisateur ${userId}`);

  // 🎯 BLOQUER / DÉBLOQUER via API
  const handleBlockUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://127.0.0.1:5000/api/users/block/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlockedUsers((prev) => [...prev, userId]);
    } catch (err) {
      console.error('Erreur blocage utilisateur:', err);
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://127.0.0.1:5000/api/users/unblock/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlockedUsers((prev) => prev.filter((id) => id !== userId));
    } catch (err) {
      console.error('Erreur déblocage utilisateur:', err);
    }
  };

  return (
    <>
      <div className="chat-layout">
        {/* Sidebar gauche : Profil utilisateur, création de salon, liste des salons */}
        <div className="sidebar left">
          <div className="profile-box">
            <h3>Mon Profil</h3>
            <p><strong>Nom :</strong> {user?.username}</p>
            <p><strong>Email :</strong> {user?.email}</p>
            <button onClick={() => setEditProfile(true)}>Modifier</button>
          </div>

          {editProfile && (
            <form onSubmit={handleProfileUpdate} className="edit-form">
              <h4>Modifier le profil</h4>
              <input
                type="text"
                value={profileForm.username}
                onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                placeholder="Nom"
                required
              />
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                placeholder="Email"
                required
              />
              <div className="form-actions">
                <button type="submit">Sauvegarder</button>
                <button type="button" onClick={() => setEditProfile(false)}>Annuler</button>
              </div>
            </form>
          )}

          <button
            style={{
              marginTop: '10px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%',
            }}
            onClick={() => {
              logout();
              window.location.href = '/home';
            }}
          >
            Déconnexion
          </button>

          <form onSubmit={handleCreateRoom} style={{ marginTop: '15px', marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="Nom du nouveau salon"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Description (optionnelle)"
              value={newRoomDesc}
              onChange={(e) => setNewRoomDesc(e.target.value)}
            />
            <button type="submit" disabled={creatingRoom}>
              {creatingRoom ? 'Création...' : 'Créer salon'}
            </button>
          </form>

          <nav className="menu">
            <h4>Salons</h4>
            {loadingRooms ? (
              <p>Chargement des salons...</p>
            ) : (
              <ul>
                {rooms.map((room) => (
                  <li key={room._id}>
                    <Link to={`/chat/${room._id}`} className={room._id === roomId ? 'active' : ''}>
                      {room.name || 'Salle sans nom'}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </nav>
        </div>

        {/* Zone principale : affichage des messages et saisie */}
        <div className="chat-main">
          <div className="messages">
            {loadingMessages && <p>Chargement des messages...</p>}
            {messages
              .filter((msg) => !blockedUsers.includes(String(msg.author._id)))
              .map((msg) => (
                <div
                  key={msg._id}
                  className={`message ${String(msg.author._id) === String(user._id) ? 'me' : 'other'} ${msg.isTemp ? 'temp' : ''}`}
                >
                  <strong>{msg.author.username}</strong>: {msg.content}
                  <div className="timestamp">{new Date(msg.createdAt).toLocaleTimeString()}</div>

                  {String(msg.author._id) === String(user._id) && !msg.isTemp && (
                    <button
                      onClick={() => handleDeleteMessage(msg._id)}
                      style={{
                        marginLeft: '10px',
                        backgroundColor: '#000000',
                        border: 'none',
                        color: 'red',
                        padding: '2px 6px',
                        cursor: 'pointer',
                        borderRadius: '3px',
                        fontSize: '0.75rem',
                      }}
                      title="Supprimer le message"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="input-box">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrire un message..."
              autoComplete="off"
            />
            <button type="submit" disabled={!input.trim()}>
              Envoyer
            </button>
          </form>
        </div>

        {/* Sidebar droite : utilisateurs en ligne et chat privé */}
        <div className="sidebar right">
          <h4>Utilisateurs en ligne ({onlineUsers.length})</h4>
          {onlineUsers.length === 0 ? (
            <p>Aucun utilisateur en ligne</p>
          ) : (
            <ul>
              {onlineUsers.map((u) => (
                <li key={u._id} style={{ marginBottom: '10px' }}>
                  <strong>{u.username}</strong>
                  {u._id !== user._id && (
                    <div style={{ marginTop: '5px', fontSize: '0.85em' }}>
                      <button onClick={() => handleReportUser(u._id)} style={{ color: '#f44336', marginRight: '5px' }}>
                        🚩 Signaler
                      </button>
                      {user?.role === 'admin' && (
                        <button onClick={() => handleBanUser(u._id)} style={{ color: '#000', marginRight: '5px' }}>
                          ⛔ Bannir
                        </button>
                      )}
                      {!blockedUsers.includes(String(u._id)) ? (
                        <button onClick={() => handleBlockUser(u._id)} style={{ color: '#ff9800', marginRight: '5px' }}>
                          🚫 Bloquer
                        </button>
                      ) : (
                        <button onClick={() => handleUnblockUser(u._id)} style={{ color: '#4caf50', marginRight: '5px' }}>
                          ✅ Débloquer
                        </button>
                      )}
                      <button onClick={() => handleSelectPrivateUser(u)} style={{ color: '#2196f3' }}>
                        💬 Privé
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          <hr style={{ margin: '15px 0' }} />

          <h4>Tous les profils</h4>
          {onlineUsers.length === 0 ? (
            <p>Aucun utilisateur trouvé</p>
          ) : (
            <ul>
              {onlineUsers.map((u) => (
                <li key={u._id}>
                  {u.username}
                  {u._id !== user._id && blockedUsers.includes(String(u._id)) && <span> (bloqué)</span>}
                </li>
              ))}
            </ul>
          )}

          {privateChatUser && (
            <>
              <hr style={{ margin: '15px 0' }} />
              <div className="private-chat">
                <h4>Chat privé avec {privateChatUser.username}</h4>
                <div
                  className="messages private-messages"
                  style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 10 }}
                >
                  {privateMessages.length === 0 && <p>Aucun message</p>}
                  {privateMessages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`message ${String(msg.from._id) === String(user._id) ? 'me' : 'other'} ${msg.isTemp ? 'temp' : ''}`}
                    >
                      <strong>{msg.from.username}</strong>: {msg.content}
                      <div className="timestamp">{new Date(msg.createdAt).toLocaleTimeString()}</div>
                    </div>
                  ))}
                  <div ref={privateMessagesEndRef} />
                </div>
                <form onSubmit={handleSendPrivateMessage} className="input-box">
                  <input
                    type="text"
                    value={privateInput}
                    onChange={(e) => setPrivateInput(e.target.value)}
                    placeholder={`Message privé à ${privateChatUser.username}...`}
                    autoComplete="off"
                  />
                  <button type="submit" disabled={!privateInput.trim()}>
                    Envoyer
                  </button>
                </form>
                <button onClick={() => setPrivateChatUser(null)} style={{ marginTop: '10px' }}>
                  Fermer le chat privé
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

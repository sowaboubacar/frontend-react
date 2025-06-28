import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function AdminUsers() {
  const { logout } = useAuth(); // On ne récupère que logout, car user n’est pas utilisé
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger la liste des utilisateurs au montage
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://127.0.0.1:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error('Erreur chargement utilisateurs:', err);
        alert(err.response?.data?.message || 'Erreur chargement utilisateurs');
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [logout]);

  // Fonction pour bannir ou débannir un utilisateur
  const toggleBan = async (userId, currentlyBanned) => {
    const token = localStorage.getItem('token');
    const action = currentlyBanned ? 'débannir' : 'bannir';

    if (!window.confirm(`Veux-tu vraiment ${action} cet utilisateur ?`)) return;

    try {
      const route = currentlyBanned
        ? `http://127.0.0.1:5000/api/admin/unban/${userId}`
        : `http://127.0.0.1:5000/api/admin/ban/${userId}`;

      await axios.patch(route, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Mise à jour locale du statut banni
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isBanned: !currentlyBanned } : u
        )
      );

      alert(`Utilisateur ${action}i avec succès.`);
    } catch (err) {
      console.error(`Erreur lors du ${action} :`, err);
      alert(err.response?.data?.message || `Erreur lors du ${action}.`);
    }
  };

  if (loading) return <p>Chargement des utilisateurs...</p>;

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h2>Gestion des utilisateurs (Admin)</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ddd', padding: 8, textAlign: 'left' }}>Nom</th>
            <th style={{ borderBottom: '1px solid #ddd', padding: 8, textAlign: 'left' }}>Email</th>
            <th style={{ borderBottom: '1px solid #ddd', padding: 8, textAlign: 'center' }}>Signalements</th>
            <th style={{ borderBottom: '1px solid #ddd', padding: 8, textAlign: 'center' }}>Banni</th>
            <th style={{ borderBottom: '1px solid #ddd', padding: 8, textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} style={{ backgroundColor: u.isBanned ? '#ffe6e6' : 'white' }}>
              <td style={{ padding: 8 }}>{u.username}</td>
              <td style={{ padding: 8 }}>{u.email}</td>
              <td style={{ padding: 8, textAlign: 'center' }}>{u.reports || 0}</td>
              <td style={{ padding: 8, textAlign: 'center' }}>{u.isBanned ? 'Oui' : 'Non'}</td>
              <td style={{ padding: 8, textAlign: 'center' }}>
                <button
                  onClick={() => toggleBan(u._id, u.isBanned)}
                  style={{
                    cursor: 'pointer',
                    padding: '5px 12px',
                    backgroundColor: u.isBanned ? '#4CAF50' : '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  {u.isBanned ? 'Débannir' : 'Bannir'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout, setUser } = useAuth(); // Assurez-vous que setUser est bien défini dans le AuthContext
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    preferences: '',
    photo: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        preferences: user.preferences || '',
        photo: null,
      });
      setPreview(user.photo || null);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      setFormData((prev) => ({ ...prev, photo: file }));
      setPreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('bio', formData.bio);
      data.append('preferences', formData.preferences);
      if (formData.photo) {
        data.append('photo', formData.photo);
      }

      const token = localStorage.getItem('token');
      const res = await axios.put(`http://localhost:5000/api/users/${user._id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setUser(res.data);
      alert('Profil mis à jour avec succès.');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la mise à jour du profil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Mon Profil</h2>
        <button onClick={logout} className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700">
          Se déconnecter
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="block">
          Photo de profil:
          {preview && (
            <img src={preview} alt="Aperçu" className="w-32 h-32 object-cover rounded-full mt-2 mb-2" />
          )}
          <input type="file" accept="image/*" onChange={handleChange} className="mt-1 block" />
        </label>

        <label className="block">
          Nom d'utilisateur:
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            required
          />
        </label>

        <label className="block">
          Bio:
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
            rows={3}
          />
        </label>

        <label className="block">
          Préférences:
          <input
            name="preferences"
            value={formData.preferences}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Mise à jour...' : 'Mettre à jour'}
        </button>
      </form>
    </div>
  );
}

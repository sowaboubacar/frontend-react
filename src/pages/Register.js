import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../css/Register.css';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    bio: '',
    preferences: {}
  });
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      alert('Erreur d\'inscription');
    }
  };

  return (
    <form onSubmit={handleSubmit} class="register-container">
      <h2 class="register-title ">Inscription</h2>
      <input name="username" onChange={handleChange} placeholder="Nom d'utilisateur" required class="register-input" />
      <input name="email" onChange={handleChange} placeholder="Email" required class="register-input" />
      <input type="password" name="password" onChange={handleChange} placeholder="Mot de passe" required class="register-input" />
      <textarea name="bio" onChange={handleChange} placeholder="Bio" className="input" />
      <button type="submit" class="register-button">S'inscrire</button>
    </form>
  );
}

export default Register;

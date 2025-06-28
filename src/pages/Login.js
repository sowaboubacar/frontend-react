import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/chat');
    } catch (err) {
      alert('Erreur de connexion');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-container">
      <h2 className="login-title">Connexion</h2>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        className="login-input"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Mot de passe"
        required
        className="login-input"
      />
      <button type="submit" className="login-button">Se connecter</button>
    </form>
  );
}

export default Login;

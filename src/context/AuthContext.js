import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Charger l'utilisateur + token depuis localStorage au démarrage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser({
        ...JSON.parse(storedUser),
        token: storedToken,
      });
    }
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('http://127.0.0.1:5000/api/auth/login', {
      email,
      password,
    });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser({
      ...res.data.user,
      token: res.data.token,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const register = async (formData) => {
    await axios.post('http://127.0.0.1:5000/api/auth/register', formData);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

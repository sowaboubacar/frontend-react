import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);

  // Synchroniser le user avec localStorage au démarrage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser);
      setUserState({
        ...parsedUser,
        _id: parsedUser._id || parsedUser.id, // <-- Ajouté pour assurer que _id existe
        token: storedToken,
      });
    }
  }, []);

  // Wrapper pour setUser : toujours sauvegarder dans localStorage
  const setUser = (updatedUser) => {
    if (updatedUser) {
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (updatedUser.token) {
        localStorage.setItem('token', updatedUser.token);
      }
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    setUserState(updatedUser);
  };

  const login = async (email, password) => {
    const res = await axios.post('http://127.0.0.1:5000/api/auth/login', {
      email,
      password,
    });
    const updatedUser = {
      ...res.data.user,
      token: res.data.token,
    };
    setUser(updatedUser);
  };

  const logout = () => {
    setUser(null); // cela supprime aussi dans localStorage
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

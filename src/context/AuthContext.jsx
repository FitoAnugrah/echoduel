import { createContext, useContext, useState } from 'react';
import { disconnectSocket } from '../hooks/useSocket';

const AuthContext = createContext(null);

const resolveAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith('http')) return avatar;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${apiUrl}${avatar}`;
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('echoduel_token'));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('echoduel_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (newToken, userData) => {
    const processedUser = { ...userData, avatar: resolveAvatarUrl(userData.avatar) };
    localStorage.setItem('echoduel_token', newToken);
    localStorage.setItem('echoduel_user', JSON.stringify(processedUser));
    setToken(newToken);
    setUser(processedUser);
  };

  const updateUser = (userData, newToken) => {
    const mergedUser = { ...user, ...userData };
    const processedUser = { ...mergedUser, avatar: resolveAvatarUrl(mergedUser.avatar) };
    localStorage.setItem('echoduel_user', JSON.stringify(processedUser));
    setUser(processedUser);
    // If a new token was issued (e.g. after profile update), persist it
    if (newToken) {
      localStorage.setItem('echoduel_token', newToken);
      setToken(newToken);
    }
  };

  const logout = () => {
    localStorage.removeItem('echoduel_token');
    localStorage.removeItem('echoduel_user');
    setToken(null);
    setUser(null);
    disconnectSocket();
    window.location.href = '/login';
  };

  return <AuthContext.Provider value={{ user, token, login, updateUser, logout }}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => useContext(AuthContext);

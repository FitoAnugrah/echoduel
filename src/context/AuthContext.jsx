import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('echoduel_token'));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('echoduel_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    const currentToken = localStorage.getItem('echoduel_token');
    const storedUser = localStorage.getItem('echoduel_user');
    setToken(currentToken);
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, []);

  const login = (newToken, userData) => {
    localStorage.setItem('echoduel_token', newToken);
    localStorage.setItem('echoduel_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    localStorage.setItem('echoduel_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logout = () => {
    localStorage.removeItem('echoduel_token');
    localStorage.removeItem('echoduel_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return <AuthContext.Provider value={{ user, token, login, updateUser, logout }}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => useContext(AuthContext);

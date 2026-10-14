import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('userToken'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('userToken');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          setUser(res.user);
          localStorage.setItem('currentUser', JSON.stringify(res.user));
        } catch (err) {
          console.error('Session restore failed:', err);
          localStorage.removeItem('userToken');
          localStorage.removeItem('currentUser');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('userToken', newToken);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('currentUser');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

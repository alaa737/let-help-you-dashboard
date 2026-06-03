import React, { createContext, useContext, useState, useEffect } from 'react';

type Role = 'admin' | 'worker';

interface User {
  username: string;
  name: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('lol_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (username: string, password: string) => {
    if (username === 'admin' && password === 'LOL2026') {
      const newUser: User = { username: 'admin', name: 'المدير', role: 'admin' };
      setUser(newUser);
      localStorage.setItem('lol_user', JSON.stringify(newUser));
      return true;
    }
    if (username === 'mokhles' && password === '1234') {
      const newUser: User = { username: 'mokhles', name: 'مخلص', role: 'worker' };
      setUser(newUser);
      localStorage.setItem('lol_user', JSON.stringify(newUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lol_user');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
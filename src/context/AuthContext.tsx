import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  firstName?: string;
  lastName?: string;
  intention?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('emeraude_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('emeraude_token');
  });

  const login = (userData: User, tokenStr: string) => {
    setUser(userData);
    setToken(tokenStr);
    localStorage.setItem('emeraude_token', tokenStr);
    localStorage.setItem('emeraude_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('emeraude_token');
    localStorage.removeItem('emeraude_user');
  };

  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      // If unauthorized and not on a login/register route, logout and redirect
      if (response.status === 401) {
        const url = typeof args[0] === 'string' ? args[0] : args[0] instanceof Request ? args[0].url : '';
        if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
          logout();
          window.location.href = '/login?expired=true';
        }
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token,
      isAdmin: user?.role === 'ADMIN'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

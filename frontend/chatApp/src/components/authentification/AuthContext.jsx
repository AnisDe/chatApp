import { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../../lib/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // store user info
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await axiosInstance.get('/user/check-auth', { withCredentials: true });
      setLoggedIn(res.data.loggedIn);
      setUser(res.data.user || null); // store the user object
    } catch {
      setLoggedIn(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn, user, setUser, loading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

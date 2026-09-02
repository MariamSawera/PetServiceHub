import { useEffect, useState } from 'react';
import { AuthContext } from './authContext';
import { getCurrentUser, login as loginUser, logout as logoutUser, signup as signupUser } from '../services/authApi';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const { data } = await getCurrentUser();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await loginUser(email, password);
    setUser(data);
    return data;
  };

  const signup = async (payload) => {
    const { data } = await signupUser(payload);
    return data;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, fetchUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

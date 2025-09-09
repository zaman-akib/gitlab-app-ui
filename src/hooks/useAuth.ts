import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../utils/auth';
import { api } from '../services/api';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar_url?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = auth.getToken();
    if (token) {
      api.getCurrentUser()
        .then(setUser)
        .catch(() => {
          auth.removeToken();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      auth.removeToken();
      setUser(null);
      navigate('/');
    }
  };

  return { user, loading, logout };
};
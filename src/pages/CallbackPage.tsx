import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { auth } from '../utils/auth';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const CallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        navigate('/?error=' + encodeURIComponent(error));
        return;
      }

      if (!code) {
        navigate('/?error=' + encodeURIComponent('No authorization code received'));
        return;
      }

      try {
        const { token } = await api.handleCallback(code);
        auth.setToken(token);
        navigate('/groups');
      } catch (error) {
        console.error('Callback error:', error);
        navigate('/?error=' + encodeURIComponent('Authentication failed'));
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing Authentication</h2>
        <p className="text-gray-600">Please wait while we log you in...</p>
      </div>
    </div>
  );
};
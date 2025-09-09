import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { GitlabIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const LoginPage = () => {
  const { user, loading } = useAuth();
  const [loginLoading, setLoginLoading] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/groups" />;
  }

  const handleGitLabLogin = async () => {
    try {
      setLoginLoading(true);
      const { auth_url } = await api.login();
      window.location.href = auth_url;
    } catch (error) {
      console.error('Login error:', error);
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">GitLab CI Bulk Onboarding</h1>
          <p className="text-gray-600 mt-2">Submit CI workflows to your GitLab repositories</p>
        </div>
        <button 
          onClick={handleGitLabLogin}
          disabled={loginLoading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
        >
          {loginLoading ? (
            <LoadingSpinner size="sm" className="mr-2" />
          ) : (
            <GitlabIcon className="w-5 h-5 mr-2" />
          )}
          {loginLoading ? 'Redirecting...' : 'Login with GitLab'}
        </button>
      </div>
    </div>
  );
};
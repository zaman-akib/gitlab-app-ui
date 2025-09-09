import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api, Repository } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';

export const RepositoriesPage = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('group_id');

  useEffect(() => {
    if (!groupId) {
      navigate('/groups');
      return;
    }

    const fetchRepositories = async () => {
      try {
        const reposData = await api.getRepositories(parseInt(groupId));
        setRepositories(reposData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch repositories');
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, [groupId, navigate]);

  const toggleRepo = (repoId: number) => {
    setSelectedRepos(prev => 
      prev.includes(repoId)
        ? prev.filter(id => id !== repoId)
        : [...prev, repoId]
    );
  };

  const selectAllRepos = () => {
    setSelectedRepos(repositories.map(repo => repo.id));
  };

  const clearSelection = () => {
    setSelectedRepos([]);
  };

  const handleContinue = () => {
    if (selectedRepos.length > 0) {
      navigate(`/workflow?group_id=${groupId}&repo_ids=${selectedRepos.join(',')}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading repositories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Repositories</h2>
          <p className="text-gray-600">Select repositories for workflow submission</p>
        </div>
        <button 
          onClick={() => navigate('/groups')}
          className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded text-sm flex items-center transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Groups
        </button>
      </div>

      {repositories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No repositories found in this group.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Repository Selection</h3>
            <div className="flex space-x-2">
              <button 
                onClick={selectAllRepos}
                className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 transition-colors"
              >
                Select All
              </button>
              <button 
                onClick={clearSelection}
                className="text-sm bg-gray-50 text-gray-600 px-3 py-1 rounded hover:bg-gray-100 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {repositories.map(repo => (
              <label key={repo.id} className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={selectedRepos.includes(repo.id)}
                  onChange={() => toggleRepo(repo.id)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{repo.name}</p>
                  {repo.description && (
                    <p className="text-sm text-gray-500">{repo.description}</p>
                  )}
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    <span>Default: {repo.default_branch}</span>
                    {repo.has_gitlab_ci && (
                      <span className="ml-2 bg-green-100 text-green-600 px-1 rounded">Has CI</span>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
          
          {selectedRepos.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <button 
                onClick={handleContinue}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors"
              >
                Continue with {selectedRepos.length} repositories
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
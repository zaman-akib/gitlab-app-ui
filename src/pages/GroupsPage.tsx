import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Group } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const GroupsPage = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const groupsData = await api.getGroups();
        setGroups(groupsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch groups');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const handleGroupClick = (groupId: number) => {
    navigate(`/repositories?group_id=${groupId}`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your groups...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Select a Group</h2>
        <p className="text-gray-600">Choose a group to manage its repositories</p>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No groups found. You may not have admin access to any GitLab groups.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map(group => (
            <div 
              key={group.id}
              onClick={() => handleGroupClick(group.id)}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow"
            >
              <div className="flex items-center mb-2">
                {group.avatar_url && (
                  <img src={group.avatar_url} alt="" className="w-8 h-8 rounded mr-3" />
                )}
                <h3 className="font-semibold text-gray-900">{group.name}</h3>
              </div>
              {group.description && (
                <p className="text-sm text-gray-600 mb-2">{group.description}</p>
              )}
              <p className="text-xs text-gray-500">Path: {group.path}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
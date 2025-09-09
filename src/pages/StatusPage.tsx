import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, WorkflowStatus } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

const getStatusIcon = (status: WorkflowStatus['status']) => {
  switch (status) {
    case 'processing':
      return <Loader2 className="w-12 h-12 text-blue-500 mx-auto animate-spin" />;
    case 'completed':
      return <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />;
    case 'failed':
      return <XCircle className="w-12 h-12 text-red-500 mx-auto" />;
    case 'partial_success':
      return <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto" />;
    default:
      return <Loader2 className="w-12 h-12 text-blue-500 mx-auto animate-spin" />;
  }
};

const getStatusTitle = (status: WorkflowStatus['status']) => {
  switch (status) {
    case 'processing':
      return 'Processing Workflow...';
    case 'completed':
      return 'Workflow Submitted Successfully!';
    case 'failed':
      return 'Workflow Submission Failed';
    case 'partial_success':
      return 'Partial Success';
    default:
      return 'Processing Workflow...';
  }
};

const getStatusColor = (status: WorkflowStatus['status']) => {
  switch (status) {
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'partial_success':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const StatusPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<WorkflowStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      navigate('/groups');
      return;
    }

    const fetchStatus = async () => {
      try {
        const statusData = await api.getWorkflowStatus(id);
        setStatus(statusData);
        
        // If still processing, continue polling
        if (statusData.status === 'processing') {
          setTimeout(fetchStatus, 2000);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch status');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading submission status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Submission not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="mb-4">
          {getStatusIcon(status.status)}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {getStatusTitle(status.status)}
        </h2>
        
        <p className="text-gray-600">
          Submitted to {status.repository_count} repositories
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold mb-4">Submission Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Submission ID:</span>
            <span className="font-mono">{status.submission_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status.status)}`}>
              {status.status}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Created:</span>
            <span>{new Date(status.created_at).toLocaleString()}</span>
          </div>
          {status.completed_at && (
            <div className="flex justify-between">
              <span className="text-gray-600">Completed:</span>
              <span>{new Date(status.completed_at).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {status.error_message && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-red-800 mb-2">Errors:</h4>
          <pre className="text-sm text-red-700 whitespace-pre-wrap">
            {JSON.stringify(status.error_message, null, 2)}
          </pre>
        </div>
      )}

      <div className="text-center">
        <button
          onClick={() => navigate('/groups')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Back to Groups
        </button>
      </div>
    </div>
  );
};
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api, Repository, WorkflowValidationResult } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

const DEFAULT_WORKFLOW = `# GitLab CI/CD Pipeline
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"

# Test Stage
test_job:
  stage: test
  image: node:\${NODE_VERSION}
  script:
    - npm install
    - npm run test
    - npm run lint
  artifacts:
    reports:
      junit: test-results.xml
  only:
    - merge_requests
    - main

# Build Stage  
build_job:
  stage: build
  image: node:\${NODE_VERSION}
  script:
    - npm install
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour
  only:
    - main

# Deploy Stage
deploy_job:
  stage: deploy
  image: alpine:latest
  script:
    - echo "Deploying application..."
    - echo "Deployment completed successfully!"
  dependencies:
    - build_job
  only:
    - main
  when: manual`;

export const WorkflowPage = () => {
  const [workflowContent, setWorkflowContent] = useState(DEFAULT_WORKFLOW);
  const [selectedRepos, setSelectedRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<WorkflowValidationResult | null>(null);
  const [validating, setValidating] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const groupId = searchParams.get('group_id');
  const repoIds = searchParams.get('repo_ids')?.split(',').map(Number) || [];

  useEffect(() => {
    if (!groupId || repoIds.length === 0) {
      navigate('/groups');
      return;
    }

    // In a real app, you'd fetch repository details here
    // For now, we'll create mock repository objects
    const mockRepos: Repository[] = repoIds.map(id => ({
      id,
      name: `Repository ${id}`,
      description: '',
      default_branch: 'main',
      has_gitlab_ci: false
    }));
    
    setSelectedRepos(mockRepos);
  }, [groupId, repoIds, navigate]);

  const validateWorkflow = async () => {
    if (!workflowContent.trim()) return;
    
    try {
      setValidating(true);
      const result = await api.validateWorkflow(workflowContent);
      setValidationResult(result);
    } catch (error) {
      setValidationResult({
        valid: false,
        errors: [error instanceof Error ? error.message : 'Validation failed']
      });
    } finally {
      setValidating(false);
    }
  };

  const submitWorkflow = async () => {
    if (!workflowContent.trim() || !groupId) return;
    
    try {
      setLoading(true);
      const result = await api.submitWorkflow(
        parseInt(groupId),
        repoIds,
        workflowContent
      );
      navigate(`/status/${result.submission_id}`);
    } catch (error) {
      console.error('Workflow submission error:', error);
      // In a real app, you'd show an error message to the user
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Submit Workflow</h2>
          <p className="text-gray-600">Configure .gitlab-ci.yml for selected repositories</p>
        </div>
        <button 
          onClick={handleBack}
          className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded text-sm flex items-center transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold mb-4">Selected Repositories ({selectedRepos.length})</h3>
        <div className="flex flex-wrap gap-2">
          {selectedRepos.map(repo => (
            <span key={repo.id} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
              {repo.name}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold mb-4">Workflow Content (.gitlab-ci.yml)</h3>
        <textarea
          value={workflowContent}
          onChange={(e) => setWorkflowContent(e.target.value)}
          className="w-full h-96 font-mono text-sm border border-gray-300 rounded p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
          placeholder="Enter your GitLab CI/CD configuration..."
        />
        
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setWorkflowContent(DEFAULT_WORKFLOW)}
            className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded transition-colors"
          >
            Use Example Workflow
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={validateWorkflow}
              disabled={!workflowContent.trim() || validating}
              className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white px-4 py-2 rounded transition-colors flex items-center"
            >
              {validating && <LoadingSpinner size="sm" className="mr-2" />}
              {validating ? 'Validating...' : 'Validate'}
            </button>
            <button
              onClick={submitWorkflow}
              disabled={!workflowContent.trim() || loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-6 py-2 rounded transition-colors flex items-center"
            >
              {loading && <LoadingSpinner size="sm" className="mr-2" />}
              {loading ? 'Submitting...' : 'Submit Workflow'}
            </button>
          </div>
        </div>
        
        {validationResult && (
          <div className={`mt-4 p-4 rounded flex items-start ${
            validationResult.valid 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            {validationResult.valid ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <p>Workflow is valid</p>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Workflow validation failed:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {validationResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
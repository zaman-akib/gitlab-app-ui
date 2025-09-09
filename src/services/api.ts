import { API_BASE_URL, API_ENDPOINTS } from '../utils/constants';
import { auth } from '../utils/auth';

interface ApiResponse<T> {
  data: T;
}

interface Group {
  id: number;
  name: string;
  path: string;
  description: string;
  avatar_url?: string;
}

interface Repository {
  id: number;
  name: string;
  description: string;
  default_branch: string;
  has_gitlab_ci: boolean;
}

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar_url?: string;
}

interface WorkflowValidationResult {
  valid: boolean;
  errors: string[];
}

interface WorkflowSubmissionResult {
  submission_id: string;
  status: string;
  repository_count: number;
}

interface WorkflowStatus {
  submission_id: string;
  status: 'processing' | 'completed' | 'failed' | 'partial_success';
  repository_count: number;
  created_at: string;
  completed_at?: string;
  error_message?: any;
}

class ApiClient {
  private baseURL = API_BASE_URL;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = auth.getToken();
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 401) {
        auth.removeToken();
        window.location.href = '/';
        throw new Error('Unauthorized');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result: ApiResponse<T> = await response.json();
    return result.data;
  }

  async login(): Promise<{ auth_url: string }> {
    const response = await fetch(`${this.baseURL}${API_ENDPOINTS.AUTH.LOGIN}`);
    const result: ApiResponse<{ auth_url: string }> = await response.json();
    return result.data;
  }

  async handleCallback(code: string): Promise<{ token: string; user: User }> {
    const response = await fetch(
      `${this.baseURL}${API_ENDPOINTS.AUTH.CALLBACK}?code=${code}`
    );
    const result: ApiResponse<{ token: string; user: User }> = await response.json();
    return result.data;
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>(API_ENDPOINTS.USER);
  }

  async logout(): Promise<void> {
    await this.request(API_ENDPOINTS.AUTH.LOGOUT, { method: 'POST' });
  }

  async getGroups(): Promise<Group[]> {
    return this.request<Group[]>(API_ENDPOINTS.GROUPS);
  }

  async getRepositories(groupId: number): Promise<Repository[]> {
    return this.request<Repository[]>(`${API_ENDPOINTS.REPOSITORIES}?group_id=${groupId}`);
  }

  async validateWorkflow(content: string): Promise<WorkflowValidationResult> {
    return this.request<WorkflowValidationResult>(API_ENDPOINTS.WORKFLOW.VALIDATE, {
      method: 'POST',
      body: JSON.stringify({ workflow_content: content }),
    });
  }

  async submitWorkflow(
    groupId: number,
    repositoryIds: number[],
    content: string
  ): Promise<WorkflowSubmissionResult> {
    return this.request<WorkflowSubmissionResult>(API_ENDPOINTS.WORKFLOW.SUBMIT, {
      method: 'POST',
      body: JSON.stringify({
        group_id: groupId,
        repository_ids: repositoryIds,
        workflow_content: content,
      }),
    });
  }

  async getWorkflowStatus(submissionId: string): Promise<WorkflowStatus> {
    return this.request<WorkflowStatus>(`${API_ENDPOINTS.WORKFLOW.STATUS}/${submissionId}`);
  }
}

export const api = new ApiClient();
export type { Group, Repository, User, WorkflowValidationResult, WorkflowSubmissionResult, WorkflowStatus };
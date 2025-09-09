# GitLab Workflow Manager - Frontend Specification

A simple React frontend for GitLab workflow management that integrates with the GitLab App Service API.

## Project Overview

**Tech Stack:** React 18 + Vite + TypeScript + Tailwind CSS + React Router

**Purpose:** Simple UI for GitLab OAuth authentication, group/repository browsing, and workflow submission.

## User Flow

1. **Login Page** → GitLab OAuth authentication
2. **Groups Page** → Display user's admin groups  
3. **Repositories Page** → Show repositories in selected group
4. **Workflow Page** → Submit `.gitlab-ci.yml` with example content
5. **Status Page** → Show submission status with back navigation

## Pages & Components

### 1. Login Page (`/`)
```jsx
// Simple centered login with GitLab branding
<div className="min-h-screen bg-gray-50 flex items-center justify-center">
  <div className="bg-white p-8 rounded-lg shadow-md w-96">
    <div className="text-center mb-6">
      <h1 className="text-2xl font-bold text-gray-900">GitLab Workflow Manager</h1>
      <p className="text-gray-600 mt-2">Submit workflows to your GitLab repositories</p>
    </div>
    <button 
      onClick={handleGitLabLogin}
      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center"
    >
      <GitLabIcon className="w-5 h-5 mr-2" />
      Login with GitLab
    </button>
  </div>
</div>
```

**API Integration:**
- `GET /api/auth/login` → Redirect to GitLab OAuth
- Handle OAuth callback and store JWT token

### 2. Layout Component with Header
```jsx
// Persistent header across all authenticated pages
<header className="bg-white border-b border-gray-200 px-4 py-3">
  <div className="max-w-7xl mx-auto flex justify-between items-center">
    <div className="flex items-center">
      <h1 className="text-xl font-semibold text-gray-900">GitLab Workflow Manager</h1>
    </div>
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-600">Welcome, {user.name}</span>
      <button 
        onClick={handleLogout}
        className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded"
      >
        Logout
      </button>
    </div>
  </div>
</header>
```

**API Integration:**
- `GET /api/user` → Get current user info
- `POST /api/auth/logout` → Logout user

### 3. Groups Page (`/groups`)
```jsx
<div className="max-w-4xl mx-auto p-6">
  <div className="mb-6">
    <h2 className="text-2xl font-bold text-gray-900">Select a Group</h2>
    <p className="text-gray-600">Choose a group to manage its repositories</p>
  </div>
  
  {loading && <LoadingSpinner />}
  
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {groups.map(group => (
      <div 
        key={group.id}
        onClick={() => navigate(`/repositories?group_id=${group.id}`)}
        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow"
      >
        <div className="flex items-center mb-2">
          {group.avatar_url && (
            <img src={group.avatar_url} alt="" className="w-8 h-8 rounded mr-3" />
          )}
          <h3 className="font-semibold text-gray-900">{group.name}</h3>
        </div>
        <p className="text-sm text-gray-600 mb-2">{group.description}</p>
        <p className="text-xs text-gray-500">Path: {group.path}</p>
      </div>
    ))}
  </div>
</div>
```

**API Integration:**
- `GET /api/groups` → Fetch user's admin groups

### 4. Repositories Page (`/repositories?group_id=123`)
```jsx
<div className="max-w-6xl mx-auto p-6">
  <div className="mb-6 flex items-center justify-between">
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Repositories</h2>
      <p className="text-gray-600">Select repositories for workflow submission</p>
    </div>
    <button 
      onClick={() => navigate('/groups')}
      className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded text-sm"
    >
      ← Back to Groups
    </button>
  </div>

  <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold">Repository Selection</h3>
      <div className="flex space-x-2">
        <button 
          onClick={selectAllRepos}
          className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded"
        >
          Select All
        </button>
        <button 
          onClick={clearSelection}
          className="text-sm bg-gray-50 text-gray-600 px-3 py-1 rounded"
        >
          Clear All
        </button>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {repositories.map(repo => (
        <label key={repo.id} className="flex items-center p-3 border rounded hover:bg-gray-50">
          <input
            type="checkbox"
            checked={selectedRepos.includes(repo.id)}
            onChange={() => toggleRepo(repo.id)}
            className="mr-3"
          />
          <div className="flex-1">
            <p className="font-medium text-gray-900">{repo.name}</p>
            <p className="text-sm text-gray-500">{repo.description}</p>
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
          onClick={() => navigate(`/workflow?group_id=${groupId}&repo_ids=${selectedRepos.join(',')}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          Continue with {selectedRepos.length} repositories
        </button>
      </div>
    )}
  </div>
</div>
```

**API Integration:**
- `GET /api/repositories?group_id=${groupId}` → Fetch group repositories

### 5. Workflow Page (`/workflow?group_id=123&repo_ids=456,789`)
```jsx
const defaultWorkflow = `# GitLab CI/CD Pipeline
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
  when: manual
`;

<div className="max-w-4xl mx-auto p-6">
  <div className="mb-6 flex items-center justify-between">
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Submit Workflow</h2>
      <p className="text-gray-600">Configure .gitlab-ci.yml for selected repositories</p>
    </div>
    <button 
      onClick={() => navigate(-1)}
      className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded text-sm"
    >
      ← Back
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
      className="w-full h-96 font-mono text-sm border border-gray-300 rounded p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      placeholder="Enter your GitLab CI/CD configuration..."
    />
    
    <div className="flex justify-between items-center mt-4">
      <button
        onClick={() => setWorkflowContent(defaultWorkflow)}
        className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded"
      >
        Use Example Workflow
      </button>
      
      <div className="flex space-x-3">
        <button
          onClick={validateWorkflow}
          disabled={!workflowContent.trim()}
          className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white px-4 py-2 rounded"
        >
          Validate
        </button>
        <button
          onClick={submitWorkflow}
          disabled={!workflowContent.trim() || loading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-6 py-2 rounded"
        >
          {loading ? 'Submitting...' : 'Submit Workflow'}
        </button>
      </div>
    </div>
    
    {validationResult && (
      <div className={`mt-4 p-4 rounded ${validationResult.valid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
        {validationResult.valid ? (
          <p>✅ Workflow is valid</p>
        ) : (
          <div>
            <p>❌ Workflow validation failed:</p>
            <ul className="list-disc list-inside mt-2">
              {validationResult.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )}
  </div>
</div>
```

**API Integration:**
- `POST /api/workflow/validate` → Validate YAML content
- `POST /api/workflow/submit` → Submit workflow to repositories

### 6. Status Page (`/status/:submissionId`)
```jsx
<div className="max-w-2xl mx-auto p-6">
  <div className="text-center mb-8">
    <div className="mb-4">
      {status.status === 'processing' && <SpinnerIcon className="w-12 h-12 text-blue-500 mx-auto animate-spin" />}
      {status.status === 'completed' && <CheckIcon className="w-12 h-12 text-green-500 mx-auto" />}
      {status.status === 'failed' && <XIcon className="w-12 h-12 text-red-500 mx-auto" />}
      {status.status === 'partial_success' && <WarningIcon className="w-12 h-12 text-yellow-500 mx-auto" />}
    </div>
    
    <h2 className="text-2xl font-bold text-gray-900 mb-2">
      {status.status === 'processing' && 'Processing Workflow...'}
      {status.status === 'completed' && 'Workflow Submitted Successfully!'}
      {status.status === 'failed' && 'Workflow Submission Failed'}
      {status.status === 'partial_success' && 'Partial Success'}
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
      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
    >
      Back to Groups
    </button>
  </div>
</div>
```

**API Integration:**
- `GET /api/workflow/status/${submissionId}` → Get submission status
- Auto-refresh every 2 seconds while processing

## Project Structure

```
src/
├── components/
│   ├── Layout.tsx           # Header with user info & logout
│   ├── LoadingSpinner.tsx   # Reusable spinner component
│   └── ProtectedRoute.tsx   # Authentication guard
├── pages/
│   ├── LoginPage.tsx        # OAuth login
│   ├── GroupsPage.tsx       # Groups listing
│   ├── RepositoriesPage.tsx # Repository selection
│   ├── WorkflowPage.tsx     # Workflow submission
│   └── StatusPage.tsx       # Submission status
├── services/
│   └── api.ts              # API client with auth headers
├── hooks/
│   ├── useAuth.ts          # Authentication state management
│   └── useApi.ts           # API calls with error handling
├── utils/
│   ├── auth.ts             # JWT token management
│   └── constants.ts        # API endpoints & config
├── App.tsx                 # Router setup
└── main.tsx               # App entry point
```

## Key Features & Implementation

### Authentication Flow
```typescript
// src/services/api.ts
class ApiClient {
  private baseURL = 'http://localhost:3000/api';
  private token: string | null = localStorage.getItem('jwt_token');

  async login() {
    const response = await fetch(`${this.baseURL}/auth/login`);
    const { data } = await response.json();
    window.location.href = data.auth_url;
  }

  async handleCallback(code: string) {
    const response = await fetch(`${this.baseURL}/auth/callback?code=${code}`);
    const { data } = await response.json();
    this.setToken(data.token);
    return data.user;
  }

  private setToken(token: string) {
    this.token = token;
    localStorage.setItem('jwt_token', token);
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` })
    };
  }
}
```

### State Management
```typescript
// src/hooks/useAuth.ts
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      api.getCurrentUser()
        .then(setUser)
        .catch(() => localStorage.removeItem('jwt_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const logout = async () => {
    await api.logout();
    localStorage.removeItem('jwt_token');
    setUser(null);
    navigate('/');
  };

  return { user, loading, logout };
};
```

### Protected Routes
```typescript
// src/components/ProtectedRoute.tsx
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/" />;
  
  return <Layout>{children}</Layout>;
};
```

## Setup Instructions

1. **Create React Project**
   ```bash
   npm create vite@latest gitlab-workflow-frontend -- --template react-ts
   cd gitlab-workflow-frontend
   npm install
   npm install -D tailwindcss postcss autoprefixer
   npm install react-router-dom lucide-react
   npx tailwindcss init -p
   ```

2. **Configure Tailwind** (tailwind.config.js)
   ```js
   module.exports = {
     content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
     theme: { extend: {} },
     plugins: [],
   }
   ```

3. **Environment Variables** (.env)
   ```
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

4. **Router Setup** (App.tsx)
   ```tsx
   function App() {
     return (
       <BrowserRouter>
         <Routes>
           <Route path="/" element={<LoginPage />} />
           <Route path="/callback" element={<CallbackPage />} />
           <Route path="/groups" element={<ProtectedRoute><GroupsPage /></ProtectedRoute>} />
           <Route path="/repositories" element={<ProtectedRoute><RepositoriesPage /></ProtectedRoute>} />
           <Route path="/workflow" element={<ProtectedRoute><WorkflowPage /></ProtectedRoute>} />
           <Route path="/status/:id" element={<ProtectedRoute><StatusPage /></ProtectedRoute>} />
         </Routes>
       </BrowserRouter>
     );
   }
   ```

## UI/UX Guidelines

- **Colors**: Blue primary (#2563eb), Gray neutrals, Green success, Red error, Orange GitLab brand
- **Typography**: System fonts, clear hierarchy
- **Spacing**: Consistent padding/margins using Tailwind classes
- **Responsive**: Mobile-first design with grid layouts
- **Loading States**: Spinners for async operations
- **Error Handling**: Toast notifications or inline error messages
- **Navigation**: Clear breadcrumbs and back buttons

## API Error Handling

```typescript
const handleApiError = (error: any) => {
  if (error.status === 401) {
    localStorage.removeItem('jwt_token');
    navigate('/');
  } else {
    setError(error.message || 'An error occurred');
  }
};
```

This frontend provides a clean, functional interface for the complete GitLab workflow management flow with proper error handling, loading states, and responsive design.
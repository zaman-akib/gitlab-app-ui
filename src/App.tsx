import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { CallbackPage } from './pages/CallbackPage';
import { GroupsPage } from './pages/GroupsPage';
import { RepositoriesPage } from './pages/RepositoriesPage';
import { WorkflowPage } from './pages/WorkflowPage';
import { StatusPage } from './pages/StatusPage';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/callback" element={<CallbackPage />} />
        <Route 
          path="/groups" 
          element={
            <ProtectedRoute>
              <GroupsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/repositories" 
          element={
            <ProtectedRoute>
              <RepositoriesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/workflow" 
          element={
            <ProtectedRoute>
              <WorkflowPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/status/:id" 
          element={
            <ProtectedRoute>
              <StatusPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
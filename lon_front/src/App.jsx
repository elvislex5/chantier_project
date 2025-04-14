import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import Login from './components/accounts/Login';
import Dashboard from './components/dashboard/Dashboard';
import Layout from './components/layout/Layout';
import ProjectList from './components/projects/ProjectList';
import ProjectKanban from './components/projects/ProjectKanban';
import ProjectDetails from './components/projects/ProjectDetails';
import ProjectCalendar from './components/projects/ProjectCalendar';

// Composant pour les routes protégées
const ProtectedRoute = ({ element }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Chargement...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <Layout>
      {element}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/projects" element={<ProtectedRoute element={<ProjectList />} />} />
        <Route path="/projects/kanban" element={<ProtectedRoute element={<ProjectKanban />} />} />
        <Route path="/projects/:id" element={<ProtectedRoute element={<ProjectDetails />} />} />
        <Route path="/projects/calendar" element={<ProtectedRoute element={<ProjectCalendar />} />} />
        <Route path="*" element={<div>Page non trouvée</div>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
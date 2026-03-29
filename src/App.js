import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';

import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import UserDashboard    from './pages/UserDashboard';
import SubmitComplaint  from './pages/SubmitComplaint';
import MyComplaints     from './pages/MyComplaints';
import ComplaintDetail  from './pages/ComplaintDetail';
import AdminDashboard   from './pages/AdminDashboard';
import AdminComplaints  from './pages/AdminComplaints';
import AdminDepartments from './pages/AdminDepartments';
import AdminRules       from './pages/AdminRules';
import AdminUsers       from './pages/AdminUsers';

function Guard({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ROLE_ADMIN' || user.role === 'ROLE_STAFF') return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/"         element={<HomeRedirect />} />

      <Route path="/dashboard" element={
        <Guard roles={['ROLE_USER','ROLE_ADMIN']}>
          <Layout><UserDashboard /></Layout>
        </Guard>
      } />
      <Route path="/submit" element={
        <Guard roles={['ROLE_USER','ROLE_ADMIN']}>
          <Layout><SubmitComplaint /></Layout>
        </Guard>
      } />
      <Route path="/my-complaints" element={
        <Guard roles={['ROLE_USER','ROLE_ADMIN']}>
          <Layout><MyComplaints /></Layout>
        </Guard>
      } />
      <Route path="/complaints/:id" element={
        <Guard>
          <Layout><ComplaintDetail /></Layout>
        </Guard>
      } />
      <Route path="/admin" element={
        <Guard roles={['ROLE_ADMIN','ROLE_STAFF']}>
          <Layout><AdminDashboard /></Layout>
        </Guard>
      } />
      <Route path="/admin/complaints" element={
        <Guard roles={['ROLE_ADMIN','ROLE_STAFF']}>
          <Layout><AdminComplaints /></Layout>
        </Guard>
      } />
      <Route path="/admin/departments" element={
        <Guard roles={['ROLE_ADMIN']}>
          <Layout><AdminDepartments /></Layout>
        </Guard>
      } />
      <Route path="/admin/rules" element={
        <Guard roles={['ROLE_ADMIN']}>
          <Layout><AdminRules /></Layout>
        </Guard>
      } />
      <Route path="/admin/users" element={
        <Guard roles={['ROLE_ADMIN']}>
          <Layout><AdminUsers /></Layout>
        </Guard>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right"
          toastOptions={{ style: {
            background:'var(--card)', color:'var(--text1)',
            border:'1px solid var(--border)', fontFamily:'var(--ff-body)', fontSize:'0.875rem'
          }}} />
      </BrowserRouter>
    </AuthProvider>
  );
}

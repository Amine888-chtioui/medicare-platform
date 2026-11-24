import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from '@/layouts/PublicLayout';
import AdminLayout from '@/layouts/AdminLayout';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { PageLoader } from '@/components/ui/Spinner';

const HomePage = lazy(() => import('@/pages/public/HomePage'));
const AppointmentPage = lazy(() => import('@/pages/public/AppointmentPage'));
const PrivacyPage = lazy(() => import('@/pages/public/PrivacyPage'));
const LoginPage = lazy(() => import('@/pages/admin/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage'));
const RequestsPage = lazy(() => import('@/pages/admin/RequestsPage'));
const PlanningPage = lazy(() => import('@/pages/admin/PlanningPage'));
const PatientsPage = lazy(() => import('@/pages/admin/PatientsPage'));
const ReportsPage = lazy(() => import('@/pages/admin/ReportsPage'));
const SettingsPage = lazy(() => import('@/pages/admin/SettingsPage'));

const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/rendez-vous" element={<AppointmentPage />} />
          <Route path="/confidentialite" element={<PrivacyPage />} />
        </Route>

        {/* Admin public routes */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Admin protected routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="planning" element={<PlanningPage />} />
          <Route path="agenda" element={<Navigate to="/admin/planning" replace />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="rapports" element={<Navigate to="/admin/reports" replace />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="parametres" element={<Navigate to="/admin/settings" replace />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default AppRouter;

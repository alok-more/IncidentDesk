import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute, AdminRoute, GuestRoute } from './routes/ProtectedRoute';

import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { MyTicketsPage } from './pages/employee/MyTicketsPage';
import { RaiseIncidentPage } from './pages/employee/RaiseIncidentPage';
import { TicketDetailPage } from './pages/employee/TicketDetailPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminTicketsPage } from './pages/admin/AdminTicketsPage';
import { AdminTicketDetailPage } from './pages/admin/AdminTicketDetailPage';
import { SettingsPage } from './pages/SettingsPage';

import { AdminUsersPage } from './pages/admin/AdminUsersPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '10px',
              background: '#1e293b',
              color: '#f1f5f9',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#f1f5f9' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' } },
          }}
        />

        <Routes>
          {/* Public / guest routes */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* All authenticated users */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/settings" element={<SettingsPage />} />

              {/* Employee routes (accessible to all authenticated, admin will see via /admin) */}
              <Route path="/dashboard" element={<EmployeeDashboard />} />
              <Route path="/tickets" element={<MyTicketsPage />} />
              <Route path="/tickets/new" element={<RaiseIncidentPage />} />
              <Route path="/tickets/:id" element={<TicketDetailPage />} />
            </Route>
          </Route>

          {/* Admin-only routes */}
          <Route element={<AdminRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/tickets" element={<AdminTicketsPage />} />
              <Route path="/admin/tickets/:id" element={<AdminTicketDetailPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

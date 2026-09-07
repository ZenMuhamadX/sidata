import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { AppShell } from '../../components/layout/AppShell';
import { DashboardPage } from '../../pages/dashboard/DashboardPage';
import { StudentsPage } from '../../pages/students/StudentsPage';
import { ParentsPage } from '../../pages/parents/ParentsPage';
import { DocumentsPage } from '../../pages/documents/DocumentsPage';
import { ImportPage } from '../../pages/import/ImportPage';
import { ExportPage } from '../../pages/export/ExportPage';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />

        {/* Protected Routes wrapped in AppShell */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/siswa" element={<StudentsPage />} />
          <Route path="/orang-tua" element={<ParentsPage />} />
          <Route path="/dokumen" element={<DocumentsPage />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/export" element={<ExportPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

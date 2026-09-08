import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { AppShell } from '../../components/layout/AppShell';
import { DashboardPage } from '../../pages/dashboard/DashboardPage';
import { StudentsPage } from '../../pages/students/StudentsPage';
import { StudentCreatePage } from '../../pages/students/StudentCreatePage';
import { StudentDetailPage } from '../../pages/students/StudentDetailPage';
import { StudentEditPage } from '../../pages/students/StudentEditPage';
import { ParentsPage } from '../../pages/parents/ParentsPage';
import { ParentCreatePage } from '../../pages/parents/ParentCreatePage';
import { ParentDetailPage } from '../../pages/parents/ParentDetailPage';
import { ParentEditPage } from '../../pages/parents/ParentEditPage';
import { DocumentsPage } from '../../pages/documents/DocumentsPage';
import { ImportPage } from '../../pages/import/ImportPage';
import { ExportPage } from '../../pages/export/ExportPage';
import { AcademicYearsPage } from '../../pages/academic/AcademicYearsPage';
import { AdmissionsPage } from '../../pages/admissions/AdmissionsPage';
import { AdmissionCreatePage } from '../../pages/admissions/AdmissionCreatePage';
import { AdmissionDetailPage } from '../../pages/admissions/AdmissionDetailPage';
import { ClassPromotionPage } from '../../pages/promotion/ClassPromotionPage';

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
          
          {/* Tahun Ajaran Route */}
          <Route path="/tahun-ajaran" element={<AcademicYearsPage />} />

          {/* Kenaikan Kelas Route */}
          <Route path="/kenaikan-kelas" element={<ClassPromotionPage />} />

          {/* Calon Siswa / Admission Routes */}
          <Route path="/calon-siswa" element={<AdmissionsPage />} />
          <Route path="/calon-siswa/tambah" element={<AdmissionCreatePage />} />
          <Route path="/calon-siswa/:id" element={<AdmissionDetailPage />} />

          {/* Data Siswa Routes */}
          <Route path="/siswa" element={<StudentsPage />} />
          <Route path="/siswa/tambah" element={<StudentCreatePage />} />
          <Route path="/siswa/:id" element={<StudentDetailPage />} />
          <Route path="/siswa/:id/edit" element={<StudentEditPage />} />

          {/* Data Orang Tua Routes */}
          <Route path="/orang-tua" element={<ParentsPage />} />
          <Route path="/orang-tua/tambah" element={<ParentCreatePage />} />
          <Route path="/orang-tua/:id" element={<ParentDetailPage />} />
          <Route path="/orang-tua/:id/edit" element={<ParentEditPage />} />

          {/* Placeholders */}
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

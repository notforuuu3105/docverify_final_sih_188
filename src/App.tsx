import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { VerifyPage } from './pages/VerifyPage';
import { PhysicalMeasuresPage } from './pages/PhysicalMeasuresPage';
import { VerificationDetailPage } from './pages/VerificationDetailPage';
import { HistoryPage } from './pages/HistoryPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing & Authentication */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<Navigate to="/login" replace />} />
            <Route path="/forgot-password" element={<Navigate to="/login" replace />} />

            {/* Protected Application Workspace */}
            <Route
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              {/* Officer Dashboard is removed: Default is /verify */}
              <Route path="/verify" element={<VerifyPage />} />
              <Route path="/physical-measures" element={<PhysicalMeasuresPage />} />
              <Route path="/dashboard" element={<Navigate to="/verify" replace />} />
              <Route path="/verify/:id" element={<VerificationDetailPage />} />
              {/* Dual Diff is removed: Redirect any legacy links directly to /verify */}
              <Route path="/compare" element={<Navigate to="/verify" replace />} />
              <Route path="/compare/:id" element={<Navigate to="/verify" replace />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/verify" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;

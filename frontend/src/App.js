import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import BackgroundProvider from './components/BackgroundProvider';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilesPage from './pages/ProfilesPage';
import SearchPage from './pages/SearchPage';
import AdminProfilesPage from './pages/AdminProfilesPage';
import AdminCreateProfilePage from './pages/AdminCreateProfilePage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import UserDashboard from './pages/UserDashboard';
import EditProfilePage from './pages/EditProfilePage';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import './App.css';

function App() {
  console.log('App компонент рендерится');
  
  return (
    <BackgroundProvider>
      <AuthProvider>
        <Router>
          <div className="app">
            <Navigation />
            <main className="main-content">
              <Routes>
                {/* Публичные маршруты */}
                <Route path="/" element={<HomePage />} />
                <Route path="/profiles" element={<ProfilesPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Маршруты для обычных пользователей */}
                <Route
                  path="/cabinet"
                  element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Маршруты для администраторов */}
                <Route
                  path="/admin/profiles"
                  element={
                    <AdminRoute>
                      <AdminProfilesPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/create"
                  element={
                    <AdminRoute>
                      <AdminCreateProfilePage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/edit/:id"
                  element={
                    <AdminRoute>
                      <EditProfilePage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <AdminRoute>
                      <AdminSettingsPage />
                    </AdminRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </BackgroundProvider>
  );
}

export default App; 
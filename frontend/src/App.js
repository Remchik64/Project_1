import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import BackgroundProvider from './components/BackgroundProvider';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilesPage from './pages/ProfilesPage';
import SearchPage from './pages/SearchPage';
import AdminProfilesPage from './pages/AdminProfilesPage';
import AdminCreateProfilePage from './pages/AdminCreateProfilePage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminCitiesPage from './pages/AdminCitiesPage';
import UserDashboard from './pages/UserDashboard';
import AdminEditProfilePage from './pages/AdminEditProfilePage';
import AdminDebugPage from './pages/AdminDebugPage';
import AboutPage from './pages/AboutPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import SiteMap from './components/SiteMap';
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
                <Route path="/about" element={<AboutPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/sitemap" element={<SiteMap />} />

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
                      <AdminEditProfilePage />
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
                <Route
                  path="/admin/cities"
                  element={
                    <AdminRoute>
                      <AdminCitiesPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/debug"
                  element={
                    <AdminRoute>
                      <AdminDebugPage />
                    </AdminRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </BackgroundProvider>
  );
}

export default App; 
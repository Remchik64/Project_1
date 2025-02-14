import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import ProfileList from './ProfileList';
import CityList from './CityList';
import SiteSettings from './SiteSettings';
import './AdminPanel.css';

const AdminPanel = () => {
  return (
    <div className="admin-panel">
      <nav className="admin-nav">
        <NavLink to="/admin/profiles" className={({ isActive }) => isActive ? 'active' : ''}>
          Анкеты
        </NavLink>
        <NavLink to="/admin/cities" className={({ isActive }) => isActive ? 'active' : ''}>
          Города
        </NavLink>
        <NavLink to="/admin/settings" className={({ isActive }) => isActive ? 'active' : ''}>
          Настройки
        </NavLink>
      </nav>

      <div className="admin-content">
        <Routes>
          <Route path="/profiles" element={<ProfileList />} />
          <Route path="/cities" element={<CityList />} />
          <Route path="/settings" element={<SiteSettings />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminPanel; 
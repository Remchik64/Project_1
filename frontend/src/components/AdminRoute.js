import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logger from '../utils/logger';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    logger.warn('Попытка доступа к админ-маршруту без авторизации');
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'admin') {
    logger.warn('Попытка доступа к админ-маршруту без прав администратора', {
      userId: user?.id,
      userRole: user?.role
    });
    return <Navigate to="/cabinet" />;
  }

  return children;
};

export default AdminRoute; 
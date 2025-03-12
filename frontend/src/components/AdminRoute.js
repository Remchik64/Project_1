import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logger from '../utils/logger';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  
  console.log('AdminRoute проверка доступа:', { 
    isAuthenticated, 
    user, 
    userRole: user?.role,
    isAdmin 
  });

  if (!isAuthenticated) {
    logger.warn('Попытка доступа к админ-маршруту без авторизации');
    console.log('Перенаправление на /login: пользователь не аутентифицирован');
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'admin') {
    logger.warn('Попытка доступа к админ-маршруту без прав администратора', {
      userId: user?.id,
      userRole: user?.role
    });
    console.log('Перенаправление на /cabinet: пользователь не администратор');
    return <Navigate to="/cabinet" />;
  }

  console.log('Доступ к админ-маршруту разрешен');
  return children;
};

export default AdminRoute; 
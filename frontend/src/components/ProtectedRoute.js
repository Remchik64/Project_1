import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuth();

    console.log('ProtectedRoute проверка:', { isAuthenticated, user });

    if (!isAuthenticated) {
        console.log('Пользователь не авторизован, перенаправление на /login');
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute; 
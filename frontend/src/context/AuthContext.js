import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        
        console.log('Инициализация AuthContext:', { token, user });
        
        if (token && user) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        
        return {
            token,
            user,
            isAuthenticated: !!token && !!user,
            isAdmin: user?.role === 'admin'
        };
    });

    const login = (token, user) => {
        console.log('Вызван метод login:', { token, user });
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setAuth({
            token,
            user,
            isAuthenticated: true,
            isAdmin: user?.role === 'admin'
        });
    };

    const logout = () => {
        console.log('Вызван метод logout');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setAuth({
            token: null,
            user: null,
            isAuthenticated: false,
            isAdmin: false
        });
    };

    // Проверка токена при загрузке
    useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    console.log('Проверка токена...');
                    const response = await axios.get(getApiUrl('/api/auth/me'), {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const user = response.data;
                    console.log('Токен валиден, пользователь:', user);
                    setAuth({
                        token,
                        user,
                        isAuthenticated: true,
                        isAdmin: user?.role === 'admin'
                    });
                } catch (error) {
                    console.error('Ошибка валидации токена:', error);
                    logout();
                }
            } else {
                console.log('Токен не найден');
            }
        };

        validateToken();
    }, []);

    const contextValue = {
        ...auth,
        login,
        logout
    };

    console.log('AuthContext текущее состояние:', contextValue);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth должен использоваться внутри AuthProvider');
    }
    return context;
}; 
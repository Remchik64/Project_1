import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import { checkToken, checkRequestHeaders } from '../utils/tokenChecker';
import './AdminDebugPage.css';

const AdminDebugPage = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [tokenStatus, setTokenStatus] = useState(null);
  const [headersStatus, setHeadersStatus] = useState(null);
  const [apiResponses, setApiResponses] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const tokenResult = await checkToken();
      setTokenStatus(tokenResult);
      
      const headersResult = checkRequestHeaders();
      setHeadersStatus(headersResult);
    };
    
    checkAuth();
  }, []);

  const testApi = async (endpoint, name) => {
    setLoading(true);
    try {
      console.log(`Тестирование API: ${endpoint}`);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(getApiUrl(endpoint), {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(`Ответ от ${endpoint}:`, response.data);
      
      setApiResponses(prev => ({
        ...prev,
        [name]: {
          success: true,
          data: response.data,
          status: response.status
        }
      }));
    } catch (error) {
      console.error(`Ошибка при тестировании ${endpoint}:`, error);
      
      setApiResponses(prev => ({
        ...prev,
        [name]: {
          success: false,
          error: error.response?.data || error.message,
          status: error.response?.status
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-debug-page">
      <h1>Отладка административных функций</h1>
      
      <section className="debug-section">
        <h2>Информация о пользователе</h2>
        <div className="debug-info">
          <p><strong>Аутентифицирован:</strong> {isAuthenticated ? 'Да' : 'Нет'}</p>
          <p><strong>Администратор:</strong> {isAdmin ? 'Да' : 'Нет'}</p>
          <p><strong>ID пользователя:</strong> {user?.id || 'Нет данных'}</p>
          <p><strong>Email:</strong> {user?.email || 'Нет данных'}</p>
          <p><strong>Роль:</strong> {user?.role || 'Нет данных'}</p>
        </div>
      </section>
      
      <section className="debug-section">
        <h2>Проверка токена</h2>
        {tokenStatus ? (
          <div className="debug-info">
            <p><strong>Статус:</strong> {tokenStatus.valid ? 'Валидный' : 'Невалидный'}</p>
            {tokenStatus.error && <p><strong>Ошибка:</strong> {tokenStatus.error}</p>}
            {tokenStatus.user && (
              <>
                <p><strong>ID пользователя:</strong> {tokenStatus.user.id}</p>
                <p><strong>Email:</strong> {tokenStatus.user.email}</p>
                <p><strong>Роль:</strong> {tokenStatus.user.role}</p>
              </>
            )}
          </div>
        ) : (
          <p>Загрузка...</p>
        )}
      </section>
      
      <section className="debug-section">
        <h2>Проверка заголовков запроса</h2>
        {headersStatus && (
          <div className="debug-info">
            <p><strong>Статус:</strong> {headersStatus.valid ? 'Валидные' : 'Невалидные'}</p>
            <pre>{JSON.stringify(headersStatus.headers, null, 2)}</pre>
          </div>
        )}
      </section>
      
      <section className="debug-section">
        <h2>Тестирование API</h2>
        <div className="api-test-buttons">
          <button 
            onClick={() => testApi('/api/auth/me', 'authMe')} 
            disabled={loading}
          >
            Проверить /api/auth/me
          </button>
          <button 
            onClick={() => testApi('/api/profiles', 'profiles')} 
            disabled={loading}
          >
            Проверить /api/profiles
          </button>
          <button 
            onClick={() => testApi('/api/site-settings', 'settings')} 
            disabled={loading}
          >
            Проверить /api/site-settings
          </button>
          <button 
            onClick={() => testApi('/api/cities', 'cities')} 
            disabled={loading}
          >
            Проверить /api/cities
          </button>
        </div>
        
        <div className="api-responses">
          {Object.entries(apiResponses).map(([name, response]) => (
            <div key={name} className={`api-response ${response.success ? 'success' : 'error'}`}>
              <h3>{name}</h3>
              <p><strong>Статус:</strong> {response.status}</p>
              <p><strong>Результат:</strong> {response.success ? 'Успешно' : 'Ошибка'}</p>
              <pre>{JSON.stringify(response.success ? response.data : response.error, null, 2)}</pre>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDebugPage; 
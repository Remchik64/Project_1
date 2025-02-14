import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import AccountSettings from '../components/AccountSettings';
import UserProfile from '../components/UserProfile';
import LogViewer from '../components/LogViewer';
import logger from '../utils/logger';
import './UserCabinetPage.css';

const UserCabinetPage = () => {
  const [activeTab, setActiveTab] = useState('settings');
  const { user, isAuthenticated } = useAuth();
  const [error, setError] = useState('');
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    logger.info('UserCabinetPage mounted', { isAuthenticated, userId: user?.id });
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      logger.warn('Попытка доступа к личному кабинету без авторизации');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      logger.info('Пользователь загружен', { userId: user.id, email: user.email });
    }
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="cabinet-page">
        <div className="cabinet-container">
          <div className="error-message">
            Для доступа к личному кабинету необходимо войти в систему
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="cabinet-page">
        <div className="cabinet-container">
          <div className="loading">Загрузка данных пользователя...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="cabinet-page">
      <div className="cabinet-container">
        <div className="cabinet-header">
          <h1>Личный кабинет</h1>
          <button 
            className="toggle-logs-button"
            onClick={() => setShowLogs(!showLogs)}
          >
            {showLogs ? 'Скрыть логи' : 'Показать логи'}
          </button>
        </div>

        {showLogs && <LogViewer />}

        <div className="cabinet-tabs">
          <button
            className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('settings');
              logger.info('Переключение на вкладку настроек');
            }}
          >
            Настройки аккаунта
          </button>
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('profile');
              logger.info('Переключение на вкладку профиля');
            }}
          >
            Моя анкета
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="tab-content">
          {activeTab === 'settings' ? (
            <AccountSettings user={user} />
          ) : (
            <UserProfile userId={user.id} />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCabinetPage; 
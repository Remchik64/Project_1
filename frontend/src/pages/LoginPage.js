import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [siteSettings, setSiteSettings] = useState({
    telegramLink: '',
    whatsappLink: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(getApiUrl('/api/site-settings'));
        setSiteSettings(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке настроек:', error);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Отправка запроса на вход:', credentials);
      const response = await axios.post(getApiUrl('/api/auth/login'), credentials);
      console.log('Ответ от сервера:', response.data);
      
      if (response.data.user.role !== 'admin') {
        setError('Доступ разрешен только для администраторов');
        setIsLoading(false);
        return;
      }

      console.log('Вход выполнен успешно, сохраняем данные пользователя:', response.data.user);
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (error) {
      console.error('Ошибка входа:', error);
      setError(error.response?.data?.message || 'Ошибка при входе');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Вход для рекламодателей</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              required
              autoComplete="new-email"
              autoCorrect="off"
              spellCheck="false"
              autoCapitalize="none"
            />
          </div>

          <div className="form-group">
            <label>Пароль</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                required
                autoComplete="new-password"
                autoCorrect="off"
                spellCheck="false"
                autoCapitalize="none"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Скрыть" : "Показать"}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="contact-sales">
          <h3>Связаться с отделом продаж</h3>
          <div className="messenger-widgets">
            {siteSettings.telegramLink && (
              <a 
                href={siteSettings.telegramLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="messenger-link telegram"
              >
                <i className="fab fa-telegram"></i>
                Telegram
              </a>
            )}
            {siteSettings.whatsappLink && (
              <a 
                href={siteSettings.whatsappLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="messenger-link whatsapp"
              >
                <i className="fab fa-whatsapp"></i>
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import './SiteSettingsPage.css';

const SiteSettingsPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    mainTitle: '',
    mainSubtitle: '',
    loginPageTitle: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/site-settings'));
      setSettings(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Ошибка при загрузке настроек:', error);
      setError('Ошибка при загрузке настроек сайта');
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        getApiUrl('/api/site-settings'),
        settings,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      alert('Настройки успешно сохранены');
    } catch (error) {
      console.error('Ошибка при сохранении настроек:', error);
      setError(error.response?.data?.message || 'Ошибка при сохранении настроек');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="site-settings-page">
      <div className="site-settings-container">
        <h1>Настройки сайта</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Заголовок главной страницы</label>
            <input
              type="text"
              value={settings.mainTitle}
              onChange={(e) => setSettings({...settings, mainTitle: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Подзаголовок главной страницы</label>
            <input
              type="text"
              value={settings.mainSubtitle}
              onChange={(e) => setSettings({...settings, mainSubtitle: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Заголовок страницы входа</label>
            <input
              type="text"
              value={settings.loginPageTitle}
              onChange={(e) => setSettings({...settings, loginPageTitle: e.target.value})}
              required
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/admin/profiles')} 
              className="cancel-button"
              disabled={isSaving}
            >
              Отмена
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSaving}
            >
              {isSaving ? 'Сохранение...' : 'Сохранить настройки'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SiteSettingsPage; 
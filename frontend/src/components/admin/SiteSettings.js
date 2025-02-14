import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../../config/api';
import './SiteSettings.css';

const SiteSettings = () => {
  const { token } = useAuth();
  const [settings, setSettings] = useState({
    mainTitle: '',
    subTitle: '',
    description: '',
    headerBackground: 'color',
    headerBackgroundColor: '',
    headerBackgroundImage: '',
    telegramLink: '',
    whatsappLink: '',
    profileTelegramLink: '',
    profileWhatsappLink: '',
    footerText: '',
    emailSupport: '',
    phoneSupport: '',
    workingHours: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/site-settings'));
      setSettings(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке настроек:', error);
      setMessage({ text: 'Ошибка при загрузке настроек', type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await axios.put(
        getApiUrl('/api/site-settings'),
        settings,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSettings(response.data);
      setMessage({ text: 'Настройки успешно сохранены', type: 'success' });
    } catch (error) {
      console.error('Ошибка при сохранении настроек:', error);
      setMessage({ text: 'Ошибка при сохранении настроек', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="site-settings">
      <h2>Настройки сайта</h2>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="settings-section">
          <div className="form-group">
            <label>Главный заголовок</label>
            <input
              type="text"
              name="mainTitle"
              value={settings.mainTitle}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Подзаголовок</label>
            <input
              type="text"
              name="subTitle"
              value={settings.subTitle}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Описание</label>
            <textarea
              name="description"
              value={settings.description}
              onChange={handleChange}
              rows="4"
            />
          </div>
        </div>

        <div className="settings-section">
          <h3>Контакты отдела продаж</h3>
          <div className="form-group">
            <label>Ссылка на Telegram</label>
            <input
              type="text"
              name="telegramLink"
              value={settings.telegramLink || ''}
              onChange={handleChange}
              placeholder="https://t.me/username"
            />
            <small className="input-help">Например: https://t.me/username</small>
          </div>

          <div className="form-group">
            <label>Ссылка на WhatsApp</label>
            <input
              type="text"
              name="whatsappLink"
              value={settings.whatsappLink || ''}
              onChange={handleChange}
              placeholder="https://wa.me/1234567890"
            />
            <small className="input-help">Например: https://wa.me/1234567890</small>
          </div>
        </div>

        <div className="settings-section">
          <h3>Шаблоны ссылок для анкет</h3>
          <div className="form-group">
            <label>Шаблон ссылки Telegram</label>
            <input
              type="text"
              name="profileTelegramLink"
              value={settings.profileTelegramLink || ''}
              onChange={handleChange}
              placeholder="https://t.me/"
            />
            <small className="input-help">
              Базовая ссылка для Telegram, к которой будет добавляться username из анкеты. 
              Например: https://t.me/
            </small>
          </div>

          <div className="form-group">
            <label>Шаблон ссылки WhatsApp</label>
            <input
              type="text"
              name="profileWhatsappLink"
              value={settings.profileWhatsappLink || ''}
              onChange={handleChange}
              placeholder="https://wa.me/"
            />
            <small className="input-help">
              Базовая ссылка для WhatsApp, к которой будет добавляться номер телефона из анкеты.
              Например: https://wa.me/
            </small>
          </div>
        </div>

        <div className="settings-section">
          <h3>Дополнительные настройки</h3>
          <div className="form-group">
            <label>Текст в подвале сайта</label>
            <input
              type="text"
              name="footerText"
              value={settings.footerText || ''}
              onChange={handleChange}
              placeholder="© 2024 Все права защищены"
            />
          </div>

          <div className="form-group">
            <label>Email поддержки</label>
            <input
              type="email"
              name="emailSupport"
              value={settings.emailSupport || ''}
              onChange={handleChange}
              placeholder="support@example.com"
            />
          </div>

          <div className="form-group">
            <label>Телефон поддержки</label>
            <input
              type="tel"
              name="phoneSupport"
              value={settings.phoneSupport || ''}
              onChange={handleChange}
              placeholder="+7 (999) 999-99-99"
            />
          </div>

          <div className="form-group">
            <label>Часы работы</label>
            <input
              type="text"
              name="workingHours"
              value={settings.workingHours || ''}
              onChange={handleChange}
              placeholder="09:00 - 18:00"
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? 'Сохранение...' : 'Сохранить настройки'}
        </button>
      </form>
    </div>
  );
};

export default SiteSettings; 
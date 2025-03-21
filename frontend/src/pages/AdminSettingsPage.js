import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl, getMediaUrl } from '../config/api';
import './AdminSettingsPage.css';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    mainTitle: '',
    subTitle: '',
    description: '',
    headerBackground: 'color',
    headerBackgroundColor: '',
    headerBackgroundImage: null,
    siteBackground: 'color',
    siteBackgroundColor: '#f5f5f5',
    siteBackgroundImage: null,
    telegramLink: '',
    whatsappLink: '',
    vkLink: '',
    profileTelegramLink: '',
    profileWhatsappLink: ''
  });
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      console.log('Загрузка настроек сайта...');
      console.log('Токен:', localStorage.getItem('token'));
      const response = await axios.get(getApiUrl('/api/site-settings'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Получены настройки:', response.data);
      setSettings(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при загрузке настроек:', error);
      console.error('Детали ошибки:', error.response?.data);
      setError('Ошибка при загрузке настроек: ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();

    // Очищаем пустые строки перед сохранением
    const cleanSettings = {};
    Object.keys(settings).forEach(key => {
        if (settings[key] !== null && settings[key] !== undefined) {
            if (typeof settings[key] === 'string') {
                const trimmedValue = settings[key].trim();
                cleanSettings[key] = trimmedValue === '' ? null : trimmedValue;
            } else {
                cleanSettings[key] = settings[key];
            }
        } else {
            cleanSettings[key] = null;
        }
    });

    // Добавляем очищенные значения в FormData
    Object.keys(cleanSettings).forEach(key => {
        if (key !== 'headerBackgroundImage') {
            formData.append(key, cleanSettings[key] === null ? '' : cleanSettings[key]);
        }
    });

    if (backgroundFile) {
        formData.append('headerBackgroundImage', backgroundFile);
    }

    try {
        const response = await axios.put(
            getApiUrl('/api/site-settings'),
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        // Обновляем состояние напрямую из ответа сервера
        setSettings(response.data);
        setSuccess('Настройки успешно сохранены');
        
        // Отправляем событие об обновлении настроек
        window.dispatchEvent(new Event('settingsUpdated'));
        
        // Сбрасываем состояние файла
        setBackgroundFile(null);
    } catch (error) {
        console.error('Ошибка при сохранении настроек:', error.response?.data || error);
        setError(error.response?.data?.message || 'Ошибка при сохранении настроек');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleBackgroundChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        console.log('Выбран файл для шапки:', file.name);
        if (file.size > 50 * 1024 * 1024) {
            setError('Размер файла не должен превышать 50MB');
            return;
        }
        // Сразу устанавливаем файл и обновляем настройки
        setBackgroundFile(file);
        setSettings(prev => ({
            ...prev,
            headerBackground: 'image',
            headerBackgroundImage: URL.createObjectURL(file)
        }));
        setError('');
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="admin-settings-page">
      <div className="settings-container">
        <h1>Настройки сайта</h1>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="settings-section">
            <h2>Основные настройки</h2>
            <div className="form-group">
              <label>Главный заголовок</label>
              <input
                type="text"
                value={settings.mainTitle}
                onChange={(e) => setSettings({...settings, mainTitle: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Подзаголовок</label>
              <input
                type="text"
                value={settings.subTitle}
                onChange={(e) => setSettings({...settings, subTitle: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Описание</label>
              <textarea
                value={settings.description}
                onChange={(e) => setSettings({...settings, description: e.target.value})}
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <label>Тип фона шапки</label>
              <div className="background-options">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="headerBackground"
                    value="color"
                    checked={settings.headerBackground === 'color'}
                    onChange={(e) => setSettings({
                      ...settings,
                      headerBackground: e.target.value
                    })}
                  />
                  Цвет
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="headerBackground"
                    value="image"
                    checked={settings.headerBackground === 'image'}
                    onChange={(e) => setSettings({
                      ...settings,
                      headerBackground: e.target.value
                    })}
                  />
                  Изображение
                </label>
              </div>
            </div>

            {settings.headerBackground === 'color' && (
              <div className="form-group">
                <label>Цвет фона</label>
                <input
                  type="text"
                  value={settings.headerBackgroundColor}
                  onChange={(e) => setSettings({
                    ...settings,
                    headerBackgroundColor: e.target.value
                  })}
                  placeholder="Например: linear-gradient(135deg, #6e8efb, #a777e3)"
                  required
                />
                <div 
                  className="color-preview"
                  style={{ background: settings.headerBackgroundColor }}
                />
              </div>
            )}

            {settings.headerBackground === 'image' && (
              <div className="form-group">
                <label>Фоновое изображение</label>
                <div className="background-upload">
                  {(backgroundFile || settings.headerBackgroundImage) && (
                    <div className="background-preview">
                      <img 
                        src={backgroundFile ? URL.createObjectURL(backgroundFile) : 
                          getMediaUrl(settings.headerBackgroundImage)} 
                        alt="Preview" 
                      />
                      <button
                        type="button"
                        className="remove-background"
                        onClick={() => {
                          setBackgroundFile(null);
                          setSettings({
                            ...settings,
                            headerBackgroundImage: null
                          });
                        }}
                      >
                        Удалить
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundChange}
                    className="background-input"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="settings-section">
            <h2>Настройки фона сайта</h2>
            <div className="form-group">
              <label>Тип фона сайта</label>
              <div className="background-options">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="siteBackground"
                    value="color"
                    checked={settings.siteBackground === 'color'}
                    onChange={(e) => setSettings({
                      ...settings,
                      siteBackground: e.target.value
                    })}
                  />
                  Цвет
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="siteBackground"
                    value="image"
                    checked={settings.siteBackground === 'image'}
                    onChange={(e) => setSettings({
                      ...settings,
                      siteBackground: e.target.value
                    })}
                  />
                  Изображение
                </label>
              </div>
            </div>

            {settings.siteBackground === 'color' && (
              <div className="form-group">
                <label>Цвет фона сайта</label>
                <input
                  type="text"
                  value={settings.siteBackgroundColor}
                  onChange={(e) => setSettings({
                    ...settings,
                    siteBackgroundColor: e.target.value
                  })}
                  placeholder="Например: #f5f5f5 или linear-gradient(135deg, #f5f5f5, #e0e0e0)"
                />
                <div 
                  className="color-preview"
                  style={{ background: settings.siteBackgroundColor }}
                />
              </div>
            )}

            {settings.siteBackground === 'image' && (
              <div className="form-group">
                <label>Фоновое изображение сайта</label>
                <div className="background-upload">
                  {(settings.siteBackgroundImage) && (
                    <div className="background-preview">
                      <img 
                        src={getMediaUrl(settings.siteBackgroundImage)}
                        alt="Preview" 
                      />
                      <button
                        type="button"
                        className="remove-background"
                        onClick={() => setSettings({
                          ...settings,
                          siteBackgroundImage: null
                        })}
                      >
                        Удалить
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 50 * 1024 * 1024) {
                          setError('Размер файла не должен превышать 50MB');
                          return;
                        }
                        const formData = new FormData();
                        formData.append('siteBackground', file);
                        axios.post(getApiUrl('/api/site-settings/background'), formData, {
                          headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                          }
                        })
                        .then(response => {
                          setSettings({
                            ...settings,
                            siteBackground: 'image',
                            siteBackgroundImage: response.data.path
                          });
                          // Отправляем событие об обновлении настроек
                          window.dispatchEvent(new Event('settingsUpdated'));
                        })
                        .catch(error => {
                          console.error('Ошибка при загрузке фона:', error);
                          setError('Ошибка при загрузке фонового изображения');
                        });
                      }
                    }}
                    className="background-input"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="settings-section">
            <h2>Социальные сети</h2>
            <div className="form-group">
              <label>Ссылка на Telegram для анкет:</label>
              <input
                type="text"
                value={settings.profileTelegramLink || ''}
                onChange={(e) => setSettings({...settings, profileTelegramLink: e.target.value})}
                placeholder="https://t.me/username"
              />
            </div>
            <div className="form-group">
              <label>Ссылка на WhatsApp для анкет:</label>
              <input
                type="text"
                value={settings.profileWhatsappLink || ''}
                onChange={(e) => setSettings({...settings, profileWhatsappLink: e.target.value})}
                placeholder="https://wa.me/number"
              />
            </div>
            <div className="form-group">
              <label>Общая ссылка на Telegram:</label>
              <input
                type="text"
                value={settings.telegramLink || ''}
                onChange={(e) => setSettings({...settings, telegramLink: e.target.value})}
                placeholder="https://t.me/username"
              />
            </div>
            <div className="form-group">
              <label>Ссылка на WhatsApp для отдела продаж:</label>
              <input
                type="text"
                value={settings.whatsappLink || ''}
                onChange={(e) => setSettings({...settings, whatsappLink: e.target.value})}
                placeholder="https://wa.me/number"
              />
            </div>
            <div className="form-group">
              <label>Ссылка на VK:</label>
              <input
                type="text"
                value={settings.vkLink || ''}
                onChange={(e) => setSettings({...settings, vkLink: e.target.value})}
                placeholder="https://vk.com/username"
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="save-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Сохранение...' : 'Сохранить настройки'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettingsPage; 
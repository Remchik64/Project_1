import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import './CreateProfilePage.css';

const AdminCreateProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    gender: '',
    about: '',
    interests: '',
    photo: null,
    status: 'pending',
    height: '',
    weight: '',
    phone: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
        const formData = new FormData();
        
        // Сначала добавляем файл
        if (photoFile) {
            console.log('Добавляем файл в FormData:', {
                name: photoFile.name,
                type: photoFile.type,
                size: photoFile.size
            });
            formData.append('photo', photoFile);
        }
        
        // Затем добавляем остальные поля
        formData.append('name', profile.name.trim());
        formData.append('age', Number(profile.age));
        formData.append('gender', profile.gender);
        
        if (profile.about) formData.append('about', profile.about.trim());
        if (profile.interests) formData.append('interests', profile.interests.trim());
        if (profile.height) formData.append('height', Number(profile.height));
        if (profile.weight) formData.append('weight', Number(profile.weight));
        if (profile.phone) formData.append('phone', profile.phone.trim());

        // Для отладки - проверяем содержимое FormData
        console.log('Отправляемые данные:');
        for (let [key, value] of formData.entries()) {
            if (key === 'photo') {
                console.log('photo:', {
                    name: value.name,
                    type: value.type,
                    size: value.size
                });
            } else {
                console.log(`${key}:`, value);
            }
        }

        const response = await axios.post(
            getApiUrl('/api/profiles'),
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        console.log('Профиль создан:', response.data);
        navigate('/admin/profiles');
    } catch (error) {
        console.error('Ошибка при создании анкеты:', error.response?.data || error);
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.error || 
                           'Ошибка при создании анкеты. Проверьте правильность заполнения полей.';
        setError(errorMessage);
        
        // Логируем детали ошибки для отладки
        if (error.response) {
            console.log('Response data:', error.response.data);
            console.log('Response status:', error.response.status);
            console.log('Response headers:', error.response.headers);
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Выбран файл:', file.name, 'размер:', file.size, 'тип:', file.type);
      setPhotoFile(file);
      setProfile(prev => ({ ...prev, photo: URL.createObjectURL(file) }));
    }
  };

  return (
    <div className="create-profile-page">
      <div className="create-profile-container">
        <h1>Создание новой анкеты</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Фото</label>
            <div className="photo-upload" onClick={() => document.getElementById('photo-input').click()}>
              {photoFile ? (
                <div className="photo-preview-container">
                  <img 
                    src={URL.createObjectURL(photoFile)} 
                    alt="Preview" 
                    className="photo-preview" 
                  />
                  <button 
                    type="button" 
                    className="remove-photo" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoFile(null);
                      setProfile(prev => ({ ...prev, photo: null }));
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="photo-placeholder">
                  <div>
                    <svg 
                      width="40" 
                      height="40" 
                      viewBox="0 0 40 40" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M20 0L23.5 3.5H16.5L20 0Z" fill="#666"/>
                      <rect x="18" y="3" width="4" height="25" fill="#666"/>
                      <path d="M8 20L12 24V16L8 20Z" fill="#666"/>
                      <path d="M32 20L28 24V16L32 20Z" fill="#666"/>
                    </svg>
                    <span>Нажмите для загрузки фото</span>
                  </div>
                </div>
              )}
              <input
                id="photo-input"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="photo-input"
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Имя</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Возраст</label>
            <input
              type="number"
              min="18"
              max="100"
              value={profile.age}
              onChange={(e) => setProfile({...profile, age: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Пол</label>
            <select
              value={profile.gender}
              onChange={(e) => setProfile({...profile, gender: e.target.value})}
              required
            >
              <option value="">Выберите пол</option>
              <option value="Женский">Женский</option>
              <option value="Мужской">Мужской</option>
            </select>
          </div>

          <div className="form-group">
            <label>О себе</label>
            <textarea
              value={profile.about}
              onChange={(e) => setProfile({...profile, about: e.target.value})}
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Прайс (через запятую)</label>
            <input
              type="text"
              value={profile.interests}
              onChange={(e) => setProfile({...profile, interests: e.target.value})}
              placeholder="Например: 2000, 3000, 5000"
            />
          </div>

          <div className="additional-info-section">
            <h3>Дополнительная информация</h3>
            
            <div className="form-group">
              <label>Рост (см)</label>
              <input
                type="number"
                min="140"
                max="220"
                value={profile.height}
                onChange={(e) => setProfile({...profile, height: e.target.value})}
                placeholder="Например: 175"
              />
            </div>

            <div className="form-group">
              <label>Вес (кг)</label>
              <input
                type="number"
                min="40"
                max="150"
                value={profile.weight}
                onChange={(e) => setProfile({...profile, weight: e.target.value})}
                placeholder="Например: 65"
              />
            </div>

            <div className="form-group">
              <label>Номер телефона</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                placeholder="Например: +7 (999) 123-45-67"
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => navigate('/admin/profiles')}
            >
              Отмена
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Создание...' : 'Создать анкету'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateProfilePage; 
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
    status: 'pending'
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
        
        // Добавляем базовые поля
        formData.append('name', profile.name.trim());
        formData.append('age', profile.age);
        formData.append('gender', profile.gender);
        
        // Добавляем опциональные поля
        if (profile.about) formData.append('about', profile.about.trim());
        if (profile.interests) formData.append('interests', profile.interests.trim());

        // Добавляем фото, если оно есть
        if (photoFile) {
            formData.append('photo', photoFile);
        }

        const response = await axios.post(
            'http://localhost:5000/api/profiles',
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
        setError(
            error.response?.data?.message || 
            error.response?.data?.error || 
            'Ошибка при создании анкеты'
        );
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
            <label>Интересы (через запятую)</label>
            <input
              type="text"
              value={profile.interests}
              onChange={(e) => setProfile({...profile, interests: e.target.value})}
              placeholder="Например: спорт, музыка, путешествия"
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/admin/profiles')} 
              className="cancel-button"
              disabled={isLoading}
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
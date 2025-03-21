import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl, getMediaUrl } from '../config/api';
import './CreateProfilePage.css'; // Используем те же стили

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    city: '',
    gender: '',
    about: '',
    interests: '',
    photo: null
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${getApiUrl('/api/profiles')}/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log('Получены данные профиля:', response.data);
        setProfile(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Ошибка при загрузке анкеты:', error);
        setError('Ошибка при загрузке анкеты');
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Выбран файл:', file.name, 'размер:', file.size, 'тип:', file.type);
      if (file.size > 50 * 1024 * 1024) {
        setError('Размер файла не должен превышать 50MB');
        return;
      }
      setPhotoFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      
      // Добавляем все поля профиля, кроме фото
      Object.keys(profile).forEach(key => {
        if (key !== 'photo') {
          formData.append(key, profile[key]);
        }
      });

      // Добавляем новое фото, если оно есть
      if (photoFile) {
        console.log('Добавляем новое фото:', photoFile.name);
        formData.append('photo', photoFile);
      }

      const response = await axios.put(
        getApiUrl(`/api/profiles/${id}`),
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Ответ сервера:', response.data);
      navigate('/admin/profiles');
    } catch (error) {
      console.error('Ошибка при обновлении анкеты:', error);
      setError(error.response?.data?.message || 'Ошибка при обновлении анкеты');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div className="error-message">{error}</div>;

  const getPhotoUrl = () => {
    if (photoFile) {
      return URL.createObjectURL(photoFile);
    }
    if (profile.photo) {
      return getMediaUrl(profile.photo);
    }
    return null;
  };

  return (
    <div className="create-profile-page">
      <div className="create-profile-container">
        <h1>Редактирование анкеты</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Фото</label>
            <div className="photo-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="photo-input"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="photo-upload-label">
                {getPhotoUrl() ? (
                  <div className="photo-preview-container">
                    <img 
                      src={getPhotoUrl()} 
                      alt="Preview" 
                      className="photo-preview" 
                    />
                    <button 
                      type="button" 
                      className="remove-photo" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPhotoFile(null);
                        setProfile({...profile, photo: null});
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
              </label>
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
              <option value="female">Женский</option>
              <option value="male">Мужской</option>
            </select>
          </div>

          <div className="form-group">
            <label>Город</label>
            <input
              type="text"
              value={profile.city}
              onChange={(e) => setProfile({...profile, city: e.target.value})}
              required
            />
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
              disabled={isSubmitting}
            >
              Отмена
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage; 
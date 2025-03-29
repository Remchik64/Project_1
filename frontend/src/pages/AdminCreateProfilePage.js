import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import ImageSlider from '../components/ImageSlider';
import './CreateProfilePage.css';

const AdminCreateProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    gender: '',
    about: '',
    interests: '',
    photos: [],
    status: 'pending',
    height: '',
    weight: '',
    phone: '',
    verified: false
  });
  const [photoFiles, setPhotoFiles] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
        if (profile.photos.length === 0) {
            setError('Необходимо загрузить хотя бы одну фотографию');
            setIsLoading(false);
            return;
        }
        
        if (profile.photos.length > 3) {
            setError('Можно загрузить не более 3 фотографий');
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        
        // Добавляем основные поля
        formData.append('name', profile.name.trim());
        formData.append('age', Number(profile.age));
        formData.append('gender', profile.gender);
        formData.append('verified', profile.verified);
        
        if (profile.about) formData.append('about', profile.about.trim());
        if (profile.interests) formData.append('interests', profile.interests.trim());
        if (profile.height) formData.append('height', Number(profile.height));
        if (profile.weight) formData.append('weight', Number(profile.weight));
        if (profile.phone) formData.append('phone', profile.phone.trim());
        
        // Добавляем фотографии, которые уже загружены
        if (profile.photos.length > 0) {
            // Преобразуем полные URL обратно в относительные пути для сохранения в БД
            const photos = profile.photos.map(url => {
                // Удаляем origin из URL, оставляя только путь
                return url.replace(window.location.origin, '');
            });
            
            // Сохраняем массив путей как JSON строку в поле photos
            formData.append('photos', JSON.stringify(photos));
            
            // Добавляем первое фото как основное
            formData.append('photo', photos[0]);
        }

        // Для отладки - проверяем содержимое FormData
        console.log('Отправляемые данные:');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
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

  const handlePhotoChange = (e, index) => {
    const files = Array.from(e.target.files);
    const maxFiles = 3 - profile.photos.length;
    
    if (files.length > maxFiles) {
        setError(`Вы можете загрузить не более ${maxFiles} фотографий`);
        return;
    }

    setPhotoLoading(true);
    const formData = new FormData();
    
    files.forEach(file => {
        formData.append('photos', file);
    });

    // Добавляем больше отладочной информации
    console.log('Отправляемые файлы:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
    console.log('URL запроса:', getApiUrl('/api/upload/photos'));
    console.log('Авторизационный токен есть:', !!localStorage.getItem('token'));

    axios.post(getApiUrl('/api/upload/photos'), formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        console.log('Ответ от сервера при загрузке фото:', response.data);
        
        // Преобразуем относительные пути в полные URL для отображения
        const uploadedPhotos = response.data.map(item => {
            // Используем getApiUrl() для формирования полного URL-адреса
            const baseUrl = window.location.origin; // например http://localhost:3000
            return `${baseUrl}${item.path}`; // добавляем путь к серверному URL
        });
        
        console.log('Полные URL фотографий:', uploadedPhotos);
        
        const updatedPhotos = [...profile.photos];
        updatedPhotos[index] = uploadedPhotos[0];
        
        setProfile({
            ...profile,
            photos: updatedPhotos
        });
        setPhotoLoading(false);
    })
    .catch(error => {
        console.error('Ошибка загрузки фото:', error);
        console.error('Детали ошибки:', {
            response: error.response,
            message: error.message,
            config: error.config
        });
        setError('Ошибка при загрузке фотографии. Попробуйте еще раз.');
        setPhotoLoading(false);
    });
  };

  const removePhoto = (index) => {
    const updatedPhotos = [...profile.photos];
    updatedPhotos.splice(index, 1);
    setProfile({
        ...profile,
        photos: updatedPhotos
    });
  };

  return (
    <div className="create-profile-page">
      <div className="create-profile-container">
        <h1>Создание новой анкеты</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Фотографии (до 3 шт)</label>
            <div className="photo-upload">
              <div className="photo-slots">
                {/* Слот 1 */}
                <div className="photo-slot">
                  {profile.photos[0] ? (
                    <div className="photo-preview-container">
                      <img 
                        src={profile.photos[0]} 
                        alt="Фото 1"
                        className="photo-preview" 
                      />
                      <button 
                        type="button" 
                        className="remove-photo" 
                        onClick={() => removePhoto(0)}
                      >
                        &times;
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="photo-placeholder" 
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => handlePhotoChange(e, 0);
                        input.click();
                      }}
                    >
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
                        <span>Фото 1</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Слот 2 */}
                <div className="photo-slot">
                  {profile.photos[1] ? (
                    <div className="photo-preview-container">
                      <img 
                        src={profile.photos[1]} 
                        alt="Фото 2"
                        className="photo-preview" 
                      />
                      <button 
                        type="button" 
                        className="remove-photo" 
                        onClick={() => removePhoto(1)}
                      >
                        &times;
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="photo-placeholder" 
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => handlePhotoChange(e, 1);
                        input.click();
                      }}
                    >
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
                        <span>Фото 2</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Слот 3 */}
                <div className="photo-slot">
                  {profile.photos[2] ? (
                    <div className="photo-preview-container">
                      <img 
                        src={profile.photos[2]} 
                        alt="Фото 3"
                        className="photo-preview" 
                      />
                      <button 
                        type="button" 
                        className="remove-photo" 
                        onClick={() => removePhoto(2)}
                      >
                        &times;
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="photo-placeholder" 
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => handlePhotoChange(e, 2);
                        input.click();
                      }}
                    >
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
                        <span>Фото 3</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
            
            <div className="form-group verification-group">
              <label className="verification-label">
                <input
                  type="checkbox"
                  checked={profile.verified}
                  onChange={(e) => setProfile({...profile, verified: e.target.checked})}
                  className="verification-checkbox"
                />
                <span className="verification-text">Отметить как "Проверено"</span>
              </label>
              <p className="verification-hint">Добавляет метку "Проверено" на фото профиля</p>
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
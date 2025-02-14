import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserProfile.css';

const UserProfile = ({ userId }) => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    city: '',
    about: '',
    interests: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data) {
        setProfile(response.data);
        setFormData({
          name: response.data.name || '',
          age: response.data.age || '',
          gender: response.data.gender || '',
          city: response.data.city || '',
          about: response.data.about || '',
          interests: response.data.interests || ''
        });
        if (response.data.photo) {
          setPhotoPreview(`http://localhost:8080${response.data.photo}`);
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке профиля:', error);
      setError('Ошибка при загрузке профиля');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        console.log('Выбран файл:', file.name, 'размер:', file.size, 'тип:', file.type);
        if (file.size > 50 * 1024 * 1024) {
            setError('Размер файла не должен превышать 50MB');
            return;
        }
        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
        setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      if (photoFile) {
        formDataToSend.append('photo', photoFile);
      }

      const url = profile 
        ? `http://localhost:8080/api/user/profile/${profile._id}`
        : 'http://localhost:8080/api/user/profile';
      
      const method = profile ? 'put' : 'post';

      const response = await axios({
        method,
        url,
        data: formDataToSend,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Анкета успешно сохранена');
      setProfile(response.data);
    } catch (error) {
      console.error('Ошибка при сохранении анкеты:', error);
      setError(error.response?.data?.message || 'Ошибка при сохранении анкеты');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="loading">Загрузка профиля...</div>;
  }

  return (
    <div className="user-profile">
      <h2>{profile ? 'Редактирование анкеты' : 'Создание анкеты'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Фото</label>
          <div className="photo-upload">
            {photoPreview ? (
              <div className="photo-preview-container">
                <img 
                  src={photoPreview} 
                  alt="Preview" 
                  className="photo-preview" 
                />
                <button 
                  type="button" 
                  className="remove-photo"
                  onClick={() => {
                    setPhotoFile(null);
                    setPhotoPreview(null);
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="photo-placeholder">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  id="photo-upload"
                  className="photo-input"
                />
                <label htmlFor="photo-upload">
                  <span>Нажмите для загрузки фото</span>
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Имя</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Возраст</label>
          <input
            type="number"
            min="18"
            max="100"
            value={formData.age}
            onChange={(e) => setFormData({...formData, age: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Пол</label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData({...formData, gender: e.target.value})}
            required
          >
            <option value="">Выберите пол</option>
            <option value="male">Мужской</option>
            <option value="female">Женский</option>
          </select>
        </div>

        <div className="form-group">
          <label>Город</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>О себе</label>
          <textarea
            value={formData.about}
            onChange={(e) => setFormData({...formData, about: e.target.value})}
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>Интересы</label>
          <input
            type="text"
            value={formData.interests}
            onChange={(e) => setFormData({...formData, interests: e.target.value})}
            placeholder="Например: спорт, музыка, путешествия"
          />
        </div>

        <button 
          type="submit" 
          className="save-button"
          disabled={isSaving}
        >
          {isSaving ? 'Сохранение...' : (profile ? 'Сохранить изменения' : 'Создать анкету')}
        </button>
      </form>
    </div>
  );
};

export default UserProfile; 
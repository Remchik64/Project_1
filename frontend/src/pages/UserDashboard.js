import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './UserDashboard.css';

const UserDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log('Загрузка профиля пользователя:', user?.id);
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Получен профиль:', response.data);
        setProfile(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке профиля:', error);
        if (error.response?.status === 404) {
          // Профиль еще не создан
          setProfile(null);
        } else {
          setError('Не удалось загрузить данные профиля');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchUserProfile();
    }
  }, [user]);

  const handleCreateProfile = () => {
    // Показываем форму создания профиля
    setProfile({
      name: '',
      age: '',
      gender: '',
      city: '',
      about: '',
      interests: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData(e.target);
      
      const response = await axios.post(
        'http://localhost:5000/api/user/profile',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setProfile(response.data);
    } catch (error) {
      console.error('Ошибка при сохранении профиля:', error);
      setError(error.response?.data?.message || 'Ошибка при сохранении профиля');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-container">
        <h1>Личный кабинет</h1>
        
        <div className="user-info">
          <h2>Информация о пользователе</h2>
          <p><strong>Email:</strong> {user?.email}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="profile-section">
          <h2>Моя анкета</h2>
          {profile ? (
            <div className="profile-info">
              <div className="profile-header">
                {profile.photo && (
                  <img 
                    src={`http://localhost:5000${profile.photo}`} 
                    alt="Фото профиля" 
                    className="profile-photo"
                  />
                )}
                <div className="profile-details">
                  <h3>{profile.name || 'Имя не указано'}</h3>
                  {profile.age && <p>{profile.age} лет</p>}
                  {profile.city && <p>{profile.city}</p>}
                </div>
              </div>
              
              <div className="profile-body">
                <div className="info-group">
                  <label>О себе:</label>
                  <p>{profile.about || 'Не указано'}</p>
                </div>
                
                <div className="info-group">
                  <label>Интересы:</label>
                  <p>{profile.interests || 'Не указано'}</p>
                </div>
              </div>

              <button 
                className="edit-profile-button"
                onClick={() => setProfile({ ...profile, isEditing: true })}
              >
                Редактировать анкету
              </button>
            </div>
          ) : (
            <div className="no-profile">
              <p>У вас еще нет анкеты</p>
              <button 
                className="create-profile-button"
                onClick={handleCreateProfile}
              >
                Создать анкету
              </button>
            </div>
          )}

          {profile?.isEditing && (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label>Фото</label>
                <input type="file" name="photo" accept="image/*" />
              </div>

              <div className="form-group">
                <label>Имя</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={profile.name}
                  required
                />
              </div>

              <div className="form-group">
                <label>Возраст</label>
                <input
                  type="number"
                  name="age"
                  defaultValue={profile.age}
                  min="18"
                  max="100"
                  required
                />
              </div>

              <div className="form-group">
                <label>Пол</label>
                <select name="gender" defaultValue={profile.gender} required>
                  <option value="">Выберите пол</option>
                  <option value="male">Мужской</option>
                  <option value="female">Женский</option>
                </select>
              </div>

              <div className="form-group">
                <label>Город</label>
                <input
                  type="text"
                  name="city"
                  defaultValue={profile.city}
                  required
                />
              </div>

              <div className="form-group">
                <label>О себе</label>
                <textarea
                  name="about"
                  defaultValue={profile.about}
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Интересы</label>
                <input
                  type="text"
                  name="interests"
                  defaultValue={profile.interests}
                  placeholder="Например: спорт, музыка, путешествия"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setProfile({ ...profile, isEditing: false })}
                >
                  Отмена
                </button>
                <button 
                  type="submit" 
                  className="save-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 
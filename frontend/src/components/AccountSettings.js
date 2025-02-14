import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AccountSettings.css';

const AccountSettings = ({ user }) => {
  const [formData, setFormData] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && user.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setError('');
    setSuccess('');
    setIsLoading(true);

    // Проверка совпадения паролей
    if (formData.newPassword !== formData.confirmNewPassword) {
      setError('Новые пароли не совпадают');
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:5000/api/user/settings',
        {
          email: formData.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess('Настройки успешно обновлены');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
    } catch (error) {
      console.error('Ошибка при обновлении настроек:', error);
      setError(error.response?.data?.message || 'Ошибка при обновлении настроек');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div className="loading">Загрузка данных пользователя...</div>;
  }

  return (
    <div className="account-settings">
      <h2>Настройки аккаунта</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Текущий пароль</label>
          <div className="password-input-container">
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={formData.currentPassword}
              onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? "Скрыть" : "Показать"}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Новый пароль</label>
          <div className="password-input-container">
            <input
              type={showNewPassword ? "text" : "password"}
              value={formData.newPassword}
              onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
              minLength="6"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? "Скрыть" : "Показать"}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Подтверждение нового пароля</label>
          <div className="password-input-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmNewPassword}
              onChange={(e) => setFormData({...formData, confirmNewPassword: e.target.value})}
              minLength="6"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? "Скрыть" : "Показать"}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          className="save-button"
          disabled={isLoading}
        >
          {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
        </button>
      </form>
    </div>
  );
};

export default AccountSettings; 
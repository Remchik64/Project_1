import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import './AdminProfilesPage.css';

const AdminProfilesPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        console.log('Загрузка профилей для администратора...');
        console.log('Токен:', localStorage.getItem('token'));
        const response = await axios.get(getApiUrl('/api/profiles'), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log('Получены профили:', response.data);
        setProfiles(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Ошибка при загрузке анкет:', error);
        console.error('Детали ошибки:', error.response?.data);
        setError(error.response?.data?.message || 'Ошибка при загрузке анкет');
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/profiles/${id}/status`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Обновляем список профилей после успешного изменения статуса
      setProfiles(profiles.map(profile => 
        profile.id === id ? response.data : profile
      ));
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error.response?.data || error);
      setError(error.response?.data?.message || 'Ошибка при обновлении статуса');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту анкету?')) {
      try {
        await axios.delete(
          `http://localhost:5000/api/profiles/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        // Обновляем список после удаления
        setProfiles(profiles.filter(profile => profile.id !== id));
      } catch (error) {
        console.error('Ошибка при удалении анкеты:', error.response?.data || error);
        setError(error.response?.data?.message || 'Ошибка при удалении анкеты');
      }
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="admin-profiles-page">
      <div className="admin-header">
        <h1>Управление анкетами</h1>
        <Link to="/admin/create" className="create-button">
          Создать анкету
        </Link>
      </div>

      {profiles.length === 0 ? (
        <div className="no-profiles">
          <p>Анкеты не найдены</p>
        </div>
      ) : (
        <div className="profiles-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Возраст</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map(profile => (
                <tr key={profile.id}>
                  <td>{profile.id}</td>
                  <td>{profile.name}</td>
                  <td>{profile.age}</td>
                  <td>
                    <select
                      value={profile.status}
                      onChange={(e) => handleStatusChange(profile.id, e.target.value)}
                      className={`status-select status-${profile.status}`}
                    >
                      <option value="pending">На модерации</option>
                      <option value="active">Активна</option>
                      <option value="blocked">Заблокирована</option>
                    </select>
                  </td>
                  <td className="actions">
                    <Link 
                      to={`/admin/edit/${profile.id}`} 
                      className="edit-button"
                    >
                      Редактировать
                    </Link>
                    <button
                      onClick={() => handleDelete(profile.id)}
                      className="delete-button"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminProfilesPage; 
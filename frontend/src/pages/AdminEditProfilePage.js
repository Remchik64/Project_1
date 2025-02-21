import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import './AdminEditProfilePage.css';

const AdminEditProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        name: '',
        age: '',
        gender: '',
        about: '',
        interests: '',
        status: '',
        height: '',
        weight: '',
        phone: ''
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [siteSettings, setSiteSettings] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileResponse, settingsResponse] = await Promise.all([
                    axios.get(
                        getApiUrl(`/api/profiles/${id}`),
                        {
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        }
                    ),
                    axios.get(getApiUrl('/api/site-settings'))
                ]);
                
                console.log('Полученные данные профиля:', profileResponse.data);
                setProfile(profileResponse.data);
                setSiteSettings(settingsResponse.data);
                setLoading(false);
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
                setError('Ошибка при загрузке данных');
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const formData = new FormData();

            // Добавляем основные поля
            formData.append('name', profile.name.trim());
            formData.append('age', Number(profile.age));
            formData.append('gender', profile.gender);
            formData.append('about', profile.about ? profile.about.trim() : '');
            formData.append('interests', profile.interests ? profile.interests.trim() : '');
            formData.append('status', profile.status);
            
            // Добавляем дополнительные поля
            if (profile.height) formData.append('height', Number(profile.height));
            if (profile.weight) formData.append('weight', Number(profile.weight));
            if (profile.phone) formData.append('phone', profile.phone.trim());

            // Добавляем фото, если оно было изменено
            if (photoFile) {
                formData.append('photo', photoFile);
            }

            // Для отладки - проверяем содержимое FormData и данные профиля
            console.log('Данные профиля перед отправкой:', profile);
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

            const response = await axios.put(
                getApiUrl(`/api/profiles/${id}`),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            console.log('Ответ сервера:', response.data);
            navigate('/admin/profiles');
        } catch (error) {
            console.error('Ошибка при обновлении профиля:', error.response?.data || error);
            setError(
                error.response?.data?.message || 
                error.response?.data?.error || 
                'Ошибка при обновлении профиля'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
        }
    };

    if (loading) return <div className="loading">Загрузка...</div>;

    return (
        <div className="admin-edit-profile-page">
            <h1>Редактирование анкеты</h1>
            {error && <div className="error-message">{error}</div>}
            
            {!loading && (
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Фото</label>
                        <div className="photo-upload" onClick={() => document.getElementById('photo-input').click()}>
                            {profile.photo && (
                                <div className="photo-preview-container">
                                    <img 
                                        src={`http://localhost:5000${profile.photo}`}
                                        alt="Preview" 
                                        className="photo-preview" 
                                    />
                                    <div className="photo-upload-text">
                                        Нажмите, чтобы изменить фото
                                    </div>
                                </div>
                            )}
                            {!profile.photo && (
                                <div className="photo-upload-text">
                                    Нажмите для загрузки фото
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

                    <div className="additional-info-section">
                        <h3>Дополнительная информация</h3>
                        
                        <div className="form-group">
                            <label>Рост (см)</label>
                            <input
                                type="number"
                                min="140"
                                max="220"
                                value={profile.height || ''}
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
                                value={profile.weight || ''}
                                onChange={(e) => setProfile({...profile, weight: e.target.value})}
                                placeholder="Например: 65"
                            />
                        </div>

                        <div className="form-group">
                            <label>Номер телефона</label>
                            <input
                                type="tel"
                                value={profile.phone || ''}
                                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                                placeholder="+7 (999) 999-99-99"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Статус анкеты</label>
                        <select
                            value={profile.status}
                            onChange={(e) => setProfile({...profile, status: e.target.value})}
                            required
                        >
                            <option value="pending">На модерации</option>
                            <option value="active">Активна</option>
                            <option value="blocked">Заблокирована</option>
                        </select>
                    </div>

                    <div className="form-actions">
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                        </button>
                        <button type="button" onClick={() => navigate('/admin/profiles')}>
                            Отмена
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default AdminEditProfilePage; 
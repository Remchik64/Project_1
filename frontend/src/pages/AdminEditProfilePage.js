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
        city: '',
        about: '',
        interests: '',
        status: '',
        telegramLink: ''
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
            Object.keys(profile).forEach(key => {
                if (profile[key] !== null && key !== 'photo') {
                    formData.append(key, profile[key]);
                }
            });

            // Добавляем фото, если оно было изменено
            if (photoFile) {
                formData.append('photo', photoFile);
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

            console.log('Профиль обновлен:', response.data);
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
                    {/* Существующие поля */}
                    <div className="form-group">
                        <label>Ссылка на Telegram:</label>
                        <div className="telegram-link-group">
                            <input
                                type="text"
                                value={profile.telegramLink || ''}
                                onChange={(e) => setProfile({...profile, telegramLink: e.target.value})}
                                placeholder="Индивидуальная ссылка на Telegram"
                            />
                            {siteSettings?.profileTelegramLink && (
                                <button
                                    type="button"
                                    className="use-default-link"
                                    onClick={() => setProfile({
                                        ...profile,
                                        telegramLink: siteSettings.profileTelegramLink
                                    })}
                                >
                                    Использовать общую ссылку
                                </button>
                            )}
                        </div>
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
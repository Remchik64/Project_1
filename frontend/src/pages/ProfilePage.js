import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { getApiUrl, getMediaUrl } from '../config/api';
import ImageSlider from '../components/ImageSlider';
import './ProfilePage.css';

const ProfilePage = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profileImages, setProfileImages] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(getApiUrl(`/api/profiles/public/${id}`));
                console.log('Полученные данные профиля:', response.data);
                setProfile(response.data);

                // Обработка фотографий профиля
                let images = [];
                if (response.data.photos) {
                    console.log('Значение photos:', response.data.photos);
                    console.log('Тип photos:', typeof response.data.photos);
                    
                    // Если photos пришло как строка, пробуем распарсить JSON
                    if (typeof response.data.photos === 'string') {
                        try {
                            const parsedPhotos = JSON.parse(response.data.photos);
                            console.log('Распарсенные фото:', parsedPhotos);
                            if (Array.isArray(parsedPhotos)) {
                                images = parsedPhotos.map(photo => getMediaUrl(photo));
                            } else {
                                console.error('photos не является массивом после парсинга:', parsedPhotos);
                                if (response.data.photo) {
                                    images = [getMediaUrl(response.data.photo)];
                                }
                            }
                        } catch (e) {
                            console.error('Ошибка парсинга photos JSON:', e);
                            // Если парсинг не удался, но есть одиночное фото, используем его
                            if (response.data.photo) {
                                images = [getMediaUrl(response.data.photo)];
                            }
                        }
                    } else if (Array.isArray(response.data.photos)) {
                        // Если photos уже массив, используем его
                        console.log('photos уже массив:', response.data.photos);
                        images = response.data.photos.map(photo => getMediaUrl(photo));
                    }
                } else if (response.data.photo) {
                    // Если нет photos, но есть photo, используем его
                    console.log('Используем одиночное фото:', response.data.photo);
                    images = [getMediaUrl(response.data.photo)];
                }
                
                console.log('Итоговый массив изображений:', images);
                setProfileImages(images);
            } catch (err) {
                console.error('Ошибка при загрузке профиля:', err);
                setError('Не удалось загрузить данные профиля.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id]);

    const handleImageClick = (images, index) => {
        setSelectedImageIndex(index);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    if (loading) return <div className="loading-container">Загрузка профиля...</div>;
    if (error) return <div className="error-container">{error}</div>;
    if (!profile) return <div className="not-found-container">Профиль не найден</div>;

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    <Link to="/profiles" className="back-link">← Назад к списку анкет</Link>
                    <h1>{profile.name}, {profile.age}</h1>
                </div>

                <div className="profile-content">
                    <div className="profile-gallery">
                        <ImageSlider 
                            images={profileImages} 
                            onClick={handleImageClick}
                        />
                    </div>

                    <div className="profile-details">
                        <div className="profile-section">
                            <h2>Основная информация</h2>
                            <div className="detail-group">
                                <span className="detail-label">Возраст:</span>
                                <span className="detail-value">{profile.age} лет</span>
                            </div>
                            <div className="detail-group">
                                <span className="detail-label">Пол:</span>
                                <span className="detail-value">{profile.gender}</span>
                            </div>
                            {profile.height && (
                                <div className="detail-group">
                                    <span className="detail-label">Рост:</span>
                                    <span className="detail-value">{profile.height} см</span>
                                </div>
                            )}
                            {profile.weight && (
                                <div className="detail-group">
                                    <span className="detail-label">Вес:</span>
                                    <span className="detail-value">{profile.weight} кг</span>
                                </div>
                            )}
                            {profile.city && (
                                <div className="detail-group">
                                    <span className="detail-label">Город:</span>
                                    <span className="detail-value">{profile.city}</span>
                                </div>
                            )}
                        </div>

                        {profile.about && (
                            <div className="profile-section">
                                <h2>О себе</h2>
                                <p className="profile-about">{profile.about}</p>
                            </div>
                        )}

                        {profile.interests && (
                            <div className="profile-section">
                                <h2>Интересы</h2>
                                <p className="profile-interests">{profile.interests}</p>
                            </div>
                        )}

                        {profile.services && (
                            <div className="profile-section">
                                <h2>Услуги</h2>
                                <p className="profile-services">{profile.services}</p>
                            </div>
                        )}

                        <div className="profile-contact">
                            <button className="contact-button">
                                Связаться
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {modalOpen && (
                <div className="image-modal" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal" onClick={closeModal}>×</button>
                        <div className="modal-image-container">
                            <ImageSlider 
                                images={profileImages} 
                                className="modal-slider contain-mode"
                                initialIndex={selectedImageIndex}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage; 
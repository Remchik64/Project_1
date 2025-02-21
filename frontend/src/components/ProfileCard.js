import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import SocialLinks from './SocialLinks';
import './ProfileCard.css';

const ProfileCard = ({ profile }) => {
    const [imageError, setImageError] = useState(false);
    const [settings, setSettings] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Преобразуем строку интересов в массив, если она задана
    const interestsArray = profile.interests ? 
        profile.interests.split(',').map(interest => interest.trim()) : 
        [];

    // Формируем полный URL для фотографии
    const photoUrl = profile.photo && typeof profile.photo === 'string' && !profile.photo.startsWith('blob:') ? 
        `http://localhost:5000${profile.photo}` : 
        null;

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get(getApiUrl('/api/site-settings'));
                setSettings(response.data);
            } catch (error) {
                console.error('Ошибка при загрузке настроек:', error);
            }
        };

        fetchSettings();
    }, []);

    const handleOpenModal = () => {
        setIsModalOpen(true);
        // Предотвращаем прокрутку body при открытом модальном окне
        document.body.style.overflow = 'hidden';
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        // Возвращаем прокрутку body при закрытии модального окна
        document.body.style.overflow = 'unset';
    };

    return (
        <>
            <div className="profile-card">
                <div className="profile-image">
                    {photoUrl && !imageError ? (
                        <img 
                            src={photoUrl} 
                            alt={profile.name} 
                            onError={(e) => {
                                console.error('Ошибка загрузки изображения:', e.target.src);
                                setImageError(true);
                            }}
                        />
                    ) : (
                        <div className="placeholder-image">
                            <svg 
                                width="100" 
                                height="100" 
                                viewBox="0 0 100 100" 
                                fill="none" 
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <rect width="100" height="100" fill="#E5E5E5"/>
                                <circle cx="50" cy="40" r="20" fill="#CCCCCC"/>
                                <path d="M20 80C20 63.4315 33.4315 50 50 50C66.5685 50 80 63.4315 80 80" stroke="#CCCCCC" strokeWidth="4"/>
                            </svg>
                            <span>Фото не загружено</span>
                        </div>
                    )}
                </div>
                
                <div className="profile-info">
                    <h2>{profile.name || 'Имя не указано'}</h2>
                    <p className="age">{profile.age ? `${profile.age} лет` : 'Возраст не указан'}</p>
                    <div className="additional-info">
                        <p>{profile.about ? `${profile.about.substring(0, 100)}${profile.about.length > 100 ? '...' : ''}` : 'Информация о себе не указана'}</p>
                        {interestsArray.length > 0 && (
                            <div className="interests">
                                {interestsArray.slice(0, 3).map((interest, index) => (
                                    <span key={index} className="interest-tag">{interest}</span>
                                ))}
                                {interestsArray.length > 3 && (
                                    <span className="interest-tag">+{interestsArray.length - 3}</span>
                                )}
                            </div>
                        )}
                    </div>
                    <button className="details-button" onClick={handleOpenModal}>
                        Подробнее
                    </button>
                    <SocialLinks profile={profile} settings={settings} />
                </div>
            </div>

            {isModalOpen && (
                <div className="profile-modal-overlay" onClick={handleCloseModal}>
                    <div className="profile-modal" onClick={e => e.stopPropagation()}>
                        <button className="close-modal" onClick={handleCloseModal}>×</button>
                        <div className="modal-content">
                            <div className="modal-image">
                                {photoUrl && !imageError ? (
                                    <img 
                                        src={photoUrl} 
                                        alt={profile.name} 
                                        className="full-photo"
                                    />
                                ) : (
                                    <div className="placeholder-image">
                                        <svg 
                                            width="100" 
                                            height="100" 
                                            viewBox="0 0 100 100" 
                                            fill="none" 
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <rect width="100" height="100" fill="#E5E5E5"/>
                                            <circle cx="50" cy="40" r="20" fill="#CCCCCC"/>
                                            <path d="M20 80C20 63.4315 33.4315 50 50 50C66.5685 50 80 63.4315 80 80" stroke="#CCCCCC" strokeWidth="4"/>
                                        </svg>
                                        <span>Фото не загружено</span>
                                    </div>
                                )}
                            </div>
                            <div className="modal-info">
                                <h2>{profile.name || 'Имя не указано'}</h2>
                                <div className="profile-details">
                                    <p className="detail-item">
                                        <span className="detail-label">Возраст:</span>
                                        <span>{profile.age ? `${profile.age} лет` : 'Не указан'}</span>
                                    </p>
                                    <p className="detail-item">
                                        <span className="detail-label">Город:</span>
                                        <span>{profile.city || 'Не указан'}</span>
                                    </p>
                                    <p className="detail-item">
                                        <span className="detail-label">Пол:</span>
                                        <span>{profile.gender === 'male' ? 'Мужской' : 'Женский'}</span>
                                    </p>
                                </div>
                                <div className="about-section">
                                    <h3>О себе</h3>
                                    <p>{profile.about || 'Информация о себе не указана'}</p>
                                </div>
                                {interestsArray.length > 0 && (
                                    <div className="interests-section">
                                        <h3>Интересы</h3>
                                        <div className="interests-list">
                                            {interestsArray.map((interest, index) => (
                                                <span key={index} className="interest-tag">{interest}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="modal-social-links">
                                    <SocialLinks profile={profile} settings={settings} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProfileCard; 
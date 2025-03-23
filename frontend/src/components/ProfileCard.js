import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl, getMediaUrl } from '../config/api';
import SocialLinks from './SocialLinks';
import './ProfileCard.css';
import {
  FaPhone,
  FaInstagram,
  FaTelegram,
  FaFacebook,
  FaTwitter,
  FaWhatsapp,
  FaLink,
  FaTimes,
  FaEnvelope
} from 'react-icons/fa';

const ProfileCard = ({ profile, onImageError, onSwipe }) => {
    const [imageError, setImageError] = useState(false);
    const [settings, setSettings] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    
    console.log('Данные профиля в ProfileCard:', profile);
    
    // Преобразуем строку интересов в массив, если она задана
    const interestsArray = profile.interests ? 
        profile.interests.split(',').map(interest => interest.trim()) : 
        [];

    // Формируем полный URL для фотографии
    const photoUrl = profile.photo ? 
        getMediaUrl(profile.photo) : 
        null;

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get(getApiUrl('/api/site-settings'));
                setSettings(response.data);
                console.log('Загруженные настройки:', response.data);
            } catch (error) {
                console.error('Ошибка при загрузке настроек:', error);
            }
        };

        fetchSettings();
    }, []);

    // Проверка размера экрана при изменении размера окна
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleOpenModal = () => {
        setIsModalOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        document.body.style.overflow = 'unset';
    };

    // Форматирование номера телефона
    const formatPhoneNumber = (phone) => {
        if (!phone) return '';
        
        // Очищаем номер от всего лишнего
        const cleanedPhone = getCleanPhoneNumber(phone);
        
        if (cleanedPhone.length === 11 && (cleanedPhone.startsWith('7') || cleanedPhone.startsWith('8'))) {
            // Форматируем российский номер
            const formatted = `+7 (${cleanedPhone.substring(1, 4)}) ${cleanedPhone.substring(4, 7)}-${cleanedPhone.substring(7, 9)}-${cleanedPhone.substring(9, 11)}`;
            return formatted;
        } else {
            // Другой формат номера
            return phone;
        }
    };

    // Получение чистого номера телефона для ссылки tel:
    const getCleanPhoneNumber = (phone) => {
        if (!phone) return '';
        return phone.replace(/\D/g, '');
    };

    const handleImgError = () => {
        setImageError(true);
        if (onImageError) onImageError();
    };

    // Проверка для отображения возраста
    const hasAge = profile.age && profile.age !== '0' && profile.age !== 0;

    return (
        <>
            <div className="profile-card" itemScope itemType="https://schema.org/Person">
                <meta itemProp="gender" content={profile.gender} />
                {profile.age && <meta itemProp="age" content={profile.age} />}
                {profile.city && <meta itemProp="homeLocation" content={profile.city} />}
                
                <div className="profile-image clickable-image" onClick={handleOpenModal}>
                    {photoUrl && !imageError ? (
                        <img 
                            src={photoUrl} 
                            alt={profile.name} 
                            itemProp="image"
                            onError={handleImgError}
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
                    {profile.verified && <div className="verified-badge">Проверено</div>}
                    <div className="image-overlay">
                        <span className="view-details-text">Нажмите для просмотра</span>
                    </div>
                </div>
                
                <div className="profile-info">
                    <h2 itemProp="name">{profile.name || 'Имя не указано'}</h2>
                    <p className="age">{profile.age ? `${profile.age} лет` : 'Возраст не указан'}</p>
                    <div className="additional-info">
                        <p itemProp="description">{profile.about ? `${profile.about.substring(0, 100)}${profile.about.length > 100 ? '...' : ''}` : 'Информация о себе не указана'}</p>
                        {interestsArray.length > 0 && (
                            <div className="interests">
                                {interestsArray.slice(0, 3).map((interest, index) => (
                                    <span key={index} className="interest-tag" itemProp="knowsAbout">{interest}</span>
                                ))}
                                {interestsArray.length > 3 && (
                                    <span className="interest-tag">+{interestsArray.length - 3}</span>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <div className="phone-number-container">
                        <span className="phone-label">Телефон:</span>
                        {profile.phone ? (
                            <a href={`tel:${getCleanPhoneNumber(profile.phone)}`} className="phone-value clickable-phone" itemProp="telephone">
                                {formatPhoneNumber(profile.phone)}
                            </a>
                        ) : (
                            <span className="phone-value">Не указан</span>
                        )}
                    </div>
                    
                    <button className="details-button" onClick={handleOpenModal}>
                        Подробнее
                    </button>
                    <SocialLinks profile={profile} settings={settings} />
                </div>
            </div>

            {isModalOpen && (
                isMobile ? (
                    // Мобильная версия модального окна (полноэкранная)
                    <div className="mobile-fullscreen-modal">
                        <button className="mobile-close-button" onClick={handleCloseModal}>
                            <FaTimes />
                        </button>
                        
                        <div className="mobile-modal-header">
                            <h2>{profile.name}{hasAge ? `, ${profile.age}` : ''}</h2>
                        </div>
                        
                        <div className="mobile-modal-content">
                            <div className="mobile-modal-image">
                                {photoUrl && !imageError ? (
                                    <img 
                                        src={photoUrl} 
                                        alt={profile.name} 
                                        className="full-photo"
                                        onError={handleImgError}
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
                                {profile.verified && <div className="verified-badge">Проверено</div>}
                            </div>
                            
                            <div className="mobile-modal-info">
                                <div className="profile-details">
                                    <p className="detail-item">
                                        <span className="detail-label">Возраст:</span>
                                        <span>{profile.age ? `${profile.age} лет` : 'Не указан'}</span>
                                    </p>
                                    <p className="detail-item">
                                        <span className="detail-label">Пол:</span>
                                        <span>{profile.gender}</span>
                                    </p>
                                    <p className="detail-item">
                                        <span className="detail-label">Рост:</span>
                                        <span>{profile.height ? `${profile.height} см` : 'Не указан'}</span>
                                    </p>
                                    <p className="detail-item">
                                        <span className="detail-label">Вес:</span>
                                        <span>{profile.weight ? `${profile.weight} кг` : 'Не указан'}</span>
                                    </p>
                                    <p className="detail-item">
                                        <span className="detail-label">Телефон:</span>
                                        {profile.phone ? (
                                            <a href={`tel:${getCleanPhoneNumber(profile.phone)}`} className="clickable-phone">
                                                {formatPhoneNumber(profile.phone)}
                                            </a>
                                        ) : (
                                            <span>Не указан</span>
                                        )}
                                    </p>
                                </div>
                                <div className="about-section">
                                    <h3>О себе</h3>
                                    <p>{profile.about || 'Информация о себе не указана'}</p>
                                </div>
                                {interestsArray.length > 0 && (
                                    <div className="interests-section">
                                        <h3>Прайс</h3>
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
                ) : (
                    // Десктопная версия модального окна
                    <div className="profile-modal-overlay" onClick={handleCloseModal}>
                        <div className="profile-modal" onClick={e => e.stopPropagation()}>
                            <button className="close-modal" onClick={handleCloseModal}>
                                <FaTimes />
                            </button>
                            <div className="modal-content">
                                <div className="modal-image">
                                    {photoUrl && !imageError ? (
                                        <img 
                                            src={photoUrl} 
                                            alt={profile.name} 
                                            className="full-photo"
                                            onError={handleImgError}
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
                                    {profile.verified && <div className="verified-badge">Проверено</div>}
                                </div>
                                <div className="modal-info">
                                    <h2>{profile.name || 'Имя не указано'}</h2>
                                    <div className="profile-details">
                                        <p className="detail-item">
                                            <span className="detail-label">Возраст:</span>
                                            <span>{profile.age ? `${profile.age} лет` : 'Не указан'}</span>
                                        </p>
                                        <p className="detail-item">
                                            <span className="detail-label">Пол:</span>
                                            <span>{profile.gender}</span>
                                        </p>
                                        <p className="detail-item">
                                            <span className="detail-label">Рост:</span>
                                            <span>{profile.height ? `${profile.height} см` : 'Не указан'}</span>
                                        </p>
                                        <p className="detail-item">
                                            <span className="detail-label">Вес:</span>
                                            <span>{profile.weight ? `${profile.weight} кг` : 'Не указан'}</span>
                                        </p>
                                        <p className="detail-item">
                                            <span className="detail-label">Телефон:</span>
                                            {profile.phone ? (
                                                <a href={`tel:${getCleanPhoneNumber(profile.phone)}`} className="clickable-phone">
                                                    <FaPhone className="detail-icon" /> {formatPhoneNumber(profile.phone)}
                                                </a>
                                            ) : (
                                                <span>Не указан</span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="about-section">
                                        <h3>О себе</h3>
                                        <p>{profile.about || 'Информация о себе не указана'}</p>
                                    </div>
                                    {interestsArray.length > 0 && (
                                        <div className="interests-section">
                                            <h3>Прайс</h3>
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
                )
            )}
        </>
    );
};

export default ProfileCard; 
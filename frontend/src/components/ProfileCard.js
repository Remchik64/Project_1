import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl, getMediaUrl } from '../config/api';
import SocialLinks from './SocialLinks';
import ImageSlider from './ImageSlider';
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
import { Link } from 'react-router-dom';

const ProfileCard = ({ profile, onImageError, onSwipe }) => {
    const [imageError, setImageError] = useState(false);
    const [settings, setSettings] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    
    console.log('Данные профиля в ProfileCard:', profile);
    
    // Преобразуем строку интересов в массив, если она задана
    const interestsArray = profile.interests ? 
        profile.interests.split(',').map(interest => interest.trim()) : 
        [];

    // Обработка фотографий профиля - новый улучшенный подход
    // Создаем пустой массив для хранения путей к фотографиям
    let profileImages = [];

    // Функция для обработки различных форматов данных о фотографиях
    const processPhotos = () => {
        // Если у нас есть массив photos
        if (profile.photos) {
            console.log('Обрабатываем поле photos:', profile.photos, typeof profile.photos);
            
            // Случай 1: photos - это строка JSON
            if (typeof profile.photos === 'string') {
                try {
                    // Пытаемся распарсить JSON
                    const parsedPhotos = JSON.parse(profile.photos);
                    console.log('Распарсили JSON photos:', parsedPhotos);
                    
                    // Если получили массив
                    if (Array.isArray(parsedPhotos)) {
                        // Фильтруем пустые значения и формируем полные URL
                        const validPhotos = parsedPhotos
                            .filter(photo => photo && typeof photo === 'string' && photo.trim() !== '')
                            .map(photo => getMediaUrl(photo));
                        
                        if (validPhotos.length > 0) {
                            console.log('Получили массив фото из JSON:', validPhotos);
                            return validPhotos;
                        }
                    }
                    // Если JSON не дал валидных URL, продолжаем проверки дальше
                } catch (e) {
                    console.log('Ошибка при парсинге JSON photos:', e);
                    // Если строка не является JSON, проверяем, может это просто путь к фото
                    if (profile.photos.trim() && !profile.photos.includes('null') && !profile.photos.includes('undefined')) {
                        console.log('Используем photos как путь к одиночному фото');
                        return [getMediaUrl(profile.photos)];
                    }
                }
            }
            
            // Случай 2: photos - это уже массив
            else if (Array.isArray(profile.photos)) {
                const validPhotos = profile.photos
                    .filter(photo => photo && typeof photo === 'string' && photo.trim() !== '')
                    .map(photo => getMediaUrl(photo));
                
                if (validPhotos.length > 0) {
                    console.log('Использую массив photos напрямую:', validPhotos);
                    return validPhotos;
                }
            }
        }
        
        // Случай 3: Используем одиночное поле photo, если photos не дало результатов
        if (profile.photo && typeof profile.photo === 'string' && profile.photo.trim() !== '') {
            console.log('Использую одиночное поле photo:', profile.photo);
            return [getMediaUrl(profile.photo)];
        }
        
        // Если ничего не нашли, возвращаем пустой массив
        console.warn('Не удалось найти фотографии в профиле!');
        return [];
    };

    // Получаем фотографии
    profileImages = processPhotos();

    // Отображаем результат в консоли для отладки
    console.log('Итоговый массив фотографий:', profileImages);
    if (profileImages.length === 0) {
        console.warn('ВНИМАНИЕ: Массив фотографий пуст!');
    } else {
        console.log('Первое изображение:', profileImages[0]);
    }

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
        console.log('ProfileCard - Открываем модальное окно, фотографии:', profileImages);
        setIsModalOpen(true);
        document.body.style.overflow = 'hidden';
        
        // Добавляем класс к body для управления стилями
        document.body.classList.add('modal-open');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        document.body.style.overflow = 'unset';
        
        // Удаляем класс с body
        document.body.classList.remove('modal-open');
    };

    const handleImageClick = (images, index) => {
        console.log('ProfileCard - handleImageClick - индекс:', index);
        setSelectedImageIndex(index);
        setIsModalOpen(true);
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
        console.log('ProfileCard - handleImgError вызван');
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
                    <div className="profile-image-container">
                        <ImageSlider 
                            images={profileImages} 
                            onImageError={handleImgError}
                            onClick={handleImageClick}
                        />
                    </div>
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
                    
                    <button onClick={handleOpenModal} className="view-profile-btn">
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
                                <ImageSlider 
                                    images={profileImages} 
                                    onImageError={handleImgError}
                                    onClick={handleImageClick}
                                    className="contain-mode"
                                    initialIndex={selectedImageIndex}
                                />
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
                    // Десктопная версия модального окна (вертикальная компоновка как на мобильном)
                    <div className="profile-modal-overlay" onClick={handleCloseModal}>
                        <div className="profile-modal" onClick={e => e.stopPropagation()}>
                            <button className="close-modal" onClick={handleCloseModal}>
                                <FaTimes />
                            </button>
                            {/* Вертикальная компоновка: фото сверху, информация снизу */}
                            <div className="modal-content">
                                {/* Фотографии сверху */}
                                <div className="modal-image-container">
                                    <div className="modal-image">
                                        <ImageSlider 
                                            images={profileImages} 
                                            onImageError={handleImgError}
                                            className="contain-mode"
                                            initialIndex={selectedImageIndex}
                                        />
                                        {profile.verified && <div className="verified-badge">Проверено</div>}
                                    </div>
                                </div>
                                
                                {/* Информация снизу */}
                                <div className="modal-info">
                                    <h2>{profile.name || 'Имя не указано'}{hasAge ? `, ${profile.age}` : ''}</h2>
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
                    </div>
                )
            )}
        </>
    );
};

export default ProfileCard; 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/api';
import './CitySelector.css';

const CitySelector = ({ onCitySelect }) => {
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [ageConfirmed, setAgeConfirmed] = useState(false);
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        const fetchCities = async () => {
            try {
                // Получаем сохраненное значение из localStorage
                const savedCityId = localStorage.getItem('selectedCity');
                const savedAgeConfirmed = localStorage.getItem('ageConfirmed') === 'true';
                
                const response = await axios.get(getApiUrl('/api/cities'));
                const availableCities = response.data;
                setCities(availableCities);
                
                // Если есть сохраненный город, пытаемся его использовать
                if (savedCityId && (savedAgeConfirmed || isAdmin)) {
                    const numericCityId = Number(savedCityId);
                    
                    // Проверяем, существует ли такой город в полученном списке
                    const cityExists = availableCities.some(city => city.id === numericCityId);
                    
                    if (cityExists) {
                        // Если город существует, устанавливаем его как выбранный
                        setSelectedCity(String(numericCityId)); // Преобразуем в строку для select
                        setAgeConfirmed(savedAgeConfirmed);
                        
                        // Можно сразу перейти к показу анкет
                        if (onCitySelect && isAdmin) {
                            onCitySelect(numericCityId);
                            return;
                        }
                    } else {
                        // Если такого города нет, сбрасываем localStorage
                        console.warn(`Сохраненный город с ID ${numericCityId} не найден среди доступных городов`);
                        localStorage.removeItem('selectedCity');
                    }
                }
                
                // Если есть только один город, предварительно выбираем его
                if (availableCities.length === 1) {
                    setSelectedCity(String(availableCities[0].id));
                }
                
                setLoading(false);
            } catch (error) {
                console.error('Ошибка при загрузке городов:', error);
                setError('Не удалось загрузить список городов');
                setLoading(false);
            }
        };

        fetchCities();
    }, [isAdmin, onCitySelect]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedCity && (ageConfirmed || isAdmin)) {
            const numericCityId = Number(selectedCity);
            
            // Проверяем, что ID города валидный и город существует
            const cityExists = cities.some(city => city.id === numericCityId);
            
            if (cityExists) {
                localStorage.setItem('selectedCity', numericCityId);
                localStorage.setItem('ageConfirmed', 'true');
                onCitySelect(numericCityId);
            } else {
                // Если город не найден, выбираем первый доступный
                if (cities.length > 0) {
                    const firstCityId = cities[0].id;
                    localStorage.setItem('selectedCity', firstCityId);
                    localStorage.setItem('ageConfirmed', 'true');
                    onCitySelect(firstCityId);
                } else {
                    // Если нет городов, просто скрываем селектор
                    localStorage.removeItem('selectedCity');
                    onCitySelect(null);
                }
            }
        }
    };

    const handleSkip = () => {
        localStorage.removeItem('selectedCity');
        onCitySelect(null);
    };

    if (loading) return <div className="city-selector-loading">Загрузка списка городов...</div>;
    if (error) return <div className="city-selector-error">{error}</div>;

    // Если не найдено городов, показываем сообщение
    if (cities.length === 0) {
        return (
            <div className="city-selector-overlay">
                <div className="city-selector-modal">
                    <h2>Выбор города</h2>
                    <p>В настоящее время нет доступных городов для выбора.</p>
                    {isAdmin && (
                        <button
                            type="button"
                            className="skip-button"
                            onClick={handleSkip}
                        >
                            Пропустить выбор города
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="city-selector-overlay">
            <div className="city-selector-modal">
                <h2>Выберите ваш город</h2>
                <p>Для просмотра анкет, пожалуйста, укажите ваш город</p>
                
                <form onSubmit={handleSubmit}>
                    <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        required={!isAdmin}
                    >
                        <option value="">Выберите город</option>
                        {cities.map(city => (
                            <option key={city.id} value={city.id}>
                                {city.name}
                            </option>
                        ))}
                    </select>

                    <div className="age-confirmation">
                        <label className="age-checkbox-label">
                            <input
                                type="checkbox"
                                checked={ageConfirmed}
                                onChange={(e) => setAgeConfirmed(e.target.checked)}
                                required={!isAdmin}
                            />
                            <span>Я подтверждаю, что мне исполнилось 18 лет</span>
                        </label>
                    </div>

                    <div className="city-selector-buttons">
                        <button 
                            type="submit" 
                            disabled={(!selectedCity || !ageConfirmed) && !isAdmin}
                        >
                            Подтвердить выбор
                        </button>
                        {isAdmin && (
                            <button 
                                type="button" 
                                className="skip-button"
                                onClick={handleSkip}
                            >
                                Пропустить выбор города
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CitySelector; 
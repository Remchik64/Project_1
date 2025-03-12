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
                const response = await axios.get(getApiUrl('/api/cities'));
                setCities(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Ошибка при загрузке городов:', error);
                setError('Не удалось загрузить список городов');
                setLoading(false);
            }
        };

        fetchCities();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedCity && (ageConfirmed || isAdmin)) {
            localStorage.setItem('selectedCity', selectedCity);
            localStorage.setItem('ageConfirmed', 'true');
            onCitySelect(selectedCity);
        }
    };

    const handleSkip = () => {
        localStorage.removeItem('selectedCity');
        onCitySelect(null);
    };

    if (loading) return <div className="city-selector-loading">Загрузка списка городов...</div>;
    if (error) return <div className="city-selector-error">{error}</div>;

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
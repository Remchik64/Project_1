import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './CitySelector.css';

const CitySelector = ({ onCitySelect }) => {
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/cities');
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
        if (selectedCity) {
            localStorage.setItem('selectedCity', selectedCity);
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

                    <div className="city-selector-buttons">
                        <button type="submit" disabled={!selectedCity && !isAdmin}>
                            Подтвердить выбор города
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
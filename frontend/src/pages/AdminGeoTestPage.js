import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import './AdminGeoTestPage.css';

const AdminGeoTestPage = () => {
    const [selectedCity, setSelectedCity] = useState(() => {
        // Инициализируем состояние из localStorage при загрузке
        return localStorage.getItem('geoTestCity') || '';
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Загружаем текущий тестовый режим при монтировании компонента
    useEffect(() => {
        const savedCity = localStorage.getItem('geoTestCity');
        if (savedCity && savedCity !== selectedCity) {
            handleCityChange(savedCity);
        }
    }, []);

    // Расширенный список тестовых IP-адресов для всех поддерживаемых городов
    const testIPs = {
        // Столицы
        'Москва': '87.240.190.0',
        'Санкт-Петербург': '31.134.191.0',
        
        // Центральное Черноземье
        'Воронеж': '46.226.227.0',
        'Белгород': '31.31.196.0',
        'Липецк': '46.42.16.0',
        'Курск': '46.191.128.0',
        'Тамбов': '77.50.254.0',
        'Орёл': '95.179.0.0',
        
        // Центральная Россия
        'Брянск': '62.148.128.0',
        'Калуга': '85.93.48.0',
        'Тула': '83.149.8.0',
        'Рязань': '62.148.128.0',
        'Владимир': '94.25.192.0',
        'Иваново': '37.112.0.0',
        'Кострома': '93.175.0.0',
        'Ярославль': '95.52.0.0',
        
        // Поволжье
        'Нижний Новгород': '94.180.128.0',
        'Казань': '213.79.100.0',
        'Самара': '185.37.128.0',
        'Саратов': '85.249.0.0',
        'Пенза': '94.181.128.0',
        'Ульяновск': '79.164.0.0',
        'Волгоград': '178.34.160.0',
        'Астрахань': '217.149.176.0',
        
        // Урал
        'Екатеринбург': '92.242.32.0',
        'Челябинск': '87.117.0.0',
        'Уфа': '94.41.0.0',
        'Пермь': '46.48.0.0',
        
        // Юг России
        'Ростов-на-Дону': '213.208.160.0',
        'Краснодар': '217.23.80.0',
        'Сочи': '188.168.0.0',
        'Ставрополь': '83.219.128.0'
    };

    // Группировка городов по регионам для удобства выбора
    const cityGroups = {
        'Столицы': ['Москва', 'Санкт-Петербург'],
        'Центральное Черноземье': ['Воронеж', 'Белгород', 'Липецк', 'Курск', 'Тамбов', 'Орёл'],
        'Центральная Россия': ['Брянск', 'Калуга', 'Тула', 'Рязань', 'Владимир', 'Иваново', 'Кострома', 'Ярославль'],
        'Поволжье': ['Нижний Новгород', 'Казань', 'Самара', 'Саратов', 'Пенза', 'Ульяновск', 'Волгоград', 'Астрахань'],
        'Урал': ['Екатеринбург', 'Челябинск', 'Уфа', 'Пермь'],
        'Юг России': ['Ростов-на-Дону', 'Краснодар', 'Сочи', 'Ставрополь']
    };

    const handleCityChange = async (city) => {
        try {
            setSelectedCity(city);
            const ip = testIPs[city];
            
            if (!ip) {
                await disableTestMode();
                return;
            }

            const response = await axios.post(
                getApiUrl('/api/test/geolocation'),
                { ip },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            
            // Проверяем успешность операции
            if (response.data.city) {
                // Сохраняем выбранный город в localStorage
                localStorage.setItem('geoTestCity', city);
                setMessage(`Тестовый режим активирован для города ${response.data.city} (${response.data.region})`);
                setError('');
            } else {
                throw new Error('Не удалось получить данные о городе');
            }
        } catch (error) {
            setSelectedCity('');
            localStorage.removeItem('geoTestCity');
            setError(error.response?.data?.message || error.message || 'Ошибка при изменении геолокации');
            setMessage('');
        }
    };

    const disableTestMode = async () => {
        try {
            const response = await axios.post(
                getApiUrl('/api/test/geolocation'),
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            
            setSelectedCity('');
            // Удаляем сохраненный город из localStorage
            localStorage.removeItem('geoTestCity');
            setMessage(response.data.message);
            setError('');
        } catch (error) {
            setError(error.response?.data?.message || 'Ошибка при отключении тестового режима');
            setMessage('');
        }
    };

    // Добавляем информацию о том, что тест активен
    const getTestStatus = () => {
        if (selectedCity) {
            if (error) {
                return `Ошибка: ${error}`;
            }
            return `Тестовый режим активен: ${selectedCity}`;
        }
        return 'Тестовый режим не активен';
    };

    return (
        <div className="admin-geo-test-page">
            <div className="geo-test-container">
                <h1>Тестирование геолокации</h1>
                <div className="test-status">
                    {getTestStatus()}
                </div>
                
                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}
                
                <div className="geo-controls">
                    <label>Выберите город для тестирования:</label>
                    <select 
                        value={selectedCity} 
                        onChange={(e) => handleCityChange(e.target.value)}
                        className="city-select"
                    >
                        <option value="">Реальная геолокация (тест выключен)</option>
                        {Object.entries(cityGroups).map(([group, cities]) => (
                            <optgroup key={group} label={group}>
                                {cities.map(city => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>

                {selectedCity && (
                    <div className="current-test-info">
                        <p>Текущий тестовый режим: <strong>{selectedCity}</strong></p>
                        <p>IP адрес: <code>{testIPs[selectedCity]}</code></p>
                        <button 
                            className="disable-test-button"
                            onClick={disableTestMode}
                        >
                            Отключить тестовый режим
                        </button>
                    </div>
                )}

                <div className="test-instructions">
                    <h3>Как использовать:</h3>
                    <ol>
                        <li>Выберите город из списка для тестирования геолокации</li>
                        <li>Перейдите на главную страницу сайта</li>
                        <li>Обновите страницу для применения изменений</li>
                        <li>Вернитесь сюда для отключения тестового режима</li>
                    </ol>
                    <div className="supported-regions">
                        <h3>Поддерживаемые регионы:</h3>
                        <ul>
                            {Object.entries(cityGroups).map(([group, cities]) => (
                                <li key={group}>
                                    <strong>{group}:</strong> {cities.join(', ')}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminGeoTestPage; 
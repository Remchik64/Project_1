import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import './AdminCitiesPage.css';

const AdminCitiesPage = () => {
    const [cities, setCities] = useState([]);
    const [newCityName, setNewCityName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCities();
    }, []);

    const fetchCities = async () => {
        try {
            const response = await axios.get(getApiUrl('/api/cities'));
            setCities(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Ошибка при загрузке городов:', error);
            setError('Ошибка при загрузке списка городов');
            setLoading(false);
        }
    };

    const handleAddCity = async (e) => {
        e.preventDefault();
        if (!newCityName.trim()) return;

        try {
            const response = await axios.post(getApiUrl('/api/cities'), {
                name: newCityName.trim()
            });
            setCities([...cities, response.data]);
            setNewCityName('');
            setError('');
        } catch (error) {
            console.error('Ошибка при добавлении города:', error);
            setError(error.response?.data?.message || 'Ошибка при добавлении города');
        }
    };

    const handleStatusChange = async (cityId, newStatus) => {
        try {
            if (!cityId) {
                console.error('ID города не определен');
                return;
            }
            
            await axios.patch(getApiUrl(`/api/cities/${cityId}/status`), 
                { status: newStatus }
            );
            
            // Обновляем список городов
            fetchCities();
        } catch (error) {
            console.error('Ошибка при обновлении статуса города:', error);
            setError(error.response?.data?.message || 'Ошибка при обновлении статуса города');
        }
    };

    const handleDeleteCity = async (cityId) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот город? Все анкеты в этом городе будут деактивированы.')) return;

        try {
            if (!cityId) {
                console.error('ID города не определен');
                return;
            }

            await axios.delete(getApiUrl(`/api/cities/${cityId}`));
            setCities(cities.filter(city => city.id !== cityId));
        } catch (error) {
            console.error('Ошибка при удалении города:', error);
            setError(error.response?.data?.message || 'Ошибка при удалении города');
        }
    };

    if (loading) return <div className="loading">Загрузка...</div>;

    return (
        <div className="admin-cities-page">
            <h1>Управление городами</h1>

            {error && <div className="error-message">{error}</div>}

            <form className="add-city-form" onSubmit={handleAddCity}>
                <input
                    type="text"
                    value={newCityName}
                    onChange={(e) => setNewCityName(e.target.value)}
                    placeholder="Введите название города"
                    required
                />
                <button type="submit">Добавить город</button>
            </form>

            <div className="cities-list">
                <table>
                    <thead>
                        <tr>
                            <th>Город</th>
                            <th>Статус</th>
                            <th>Кол-во анкет</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cities.map(city => (
                            <tr key={city.id}>
                                <td>{city.name}</td>
                                <td>
                                    <select
                                        value={city.status}
                                        onChange={(e) => handleStatusChange(city.id, e.target.value)}
                                        className={`status-select status-${city.status}`}
                                    >
                                        <option value="active">Активен</option>
                                        <option value="inactive">Неактивен</option>
                                    </select>
                                </td>
                                <td>{city.profilesCount}</td>
                                <td className="actions">
                                    <button
                                        onClick={() => handleDeleteCity(city.id)}
                                        className="delete-button"
                                    >
                                        Удалить
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminCitiesPage; 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminCitiesPage.css';

const AdminCitiesPage = () => {
    const [cities, setCities] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [newCityName, setNewCityName] = useState('');
    const [selectedCity, setSelectedCity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Загрузка городов и анкет
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [citiesResponse, profilesResponse] = await Promise.all([
                    axios.get('http://localhost:5000/api/cities', {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    }),
                    axios.get('http://localhost:5000/api/profiles', {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    })
                ]);

                setCities(citiesResponse.data);
                setProfiles(profilesResponse.data);
                setLoading(false);
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
                setError('Ошибка при загрузке данных');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Создание нового города
    const handleCreateCity = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                'http://localhost:5000/api/cities',
                { name: newCityName },
                {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }
            );
            setCities([...cities, response.data]);
            setNewCityName('');
        } catch (error) {
            console.error('Ошибка при создании города:', error);
            setError('Ошибка при создании города');
        }
    };

    // Обновление статуса города
    const handleUpdateStatus = async (cityId, isActive) => {
        try {
            const response = await axios.patch(
                `http://localhost:5000/api/cities/${cityId}/status`,
                { isActive },
                {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }
            );
            setCities(cities.map(city => 
                city.id === cityId ? response.data : city
            ));
        } catch (error) {
            console.error('Ошибка при обновлении статуса:', error);
            setError('Ошибка при обновлении статуса');
        }
    };

    // Удаление города
    const handleDeleteCity = async (cityId) => {
        if (window.confirm('Вы уверены, что хотите удалить этот город?')) {
            try {
                await axios.delete(
                    `http://localhost:5000/api/cities/${cityId}`,
                    {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    }
                );
                setCities(cities.filter(city => city.id !== cityId));
            } catch (error) {
                console.error('Ошибка при удалении города:', error);
                setError('Ошибка при удалении города');
            }
        }
    };

    // Привязка анкет к городу
    const handleAssignProfiles = async (cityId, selectedProfileIds) => {
        try {
            const response = await axios.post(
                `http://localhost:5000/api/cities/${cityId}/profiles`,
                { profileIds: selectedProfileIds },
                {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }
            );
            setCities(cities.map(city => 
                city.id === cityId ? response.data : city
            ));
            setSelectedCity(null);
        } catch (error) {
            console.error('Ошибка при привязке анкет:', error);
            setError('Ошибка при привязке анкет');
        }
    };

    if (loading) return <div className="loading">Загрузка...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="admin-cities-page">
            <h1>Управление городами</h1>

            {/* Форма создания города */}
            <div className="create-city-form">
                <h2>Добавить новый город</h2>
                <form onSubmit={handleCreateCity}>
                    <input
                        type="text"
                        value={newCityName}
                        onChange={(e) => setNewCityName(e.target.value)}
                        placeholder="Название города"
                        required
                    />
                    <button type="submit">Добавить город</button>
                </form>
            </div>

            {/* Список городов */}
            <div className="cities-list">
                <h2>Список городов</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Город</th>
                            <th>Статус</th>
                            <th>Количество анкет</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cities.map(city => (
                            <tr key={city.id}>
                                <td>{city.name}</td>
                                <td>
                                    <select
                                        value={city.isActive ? 'active' : 'inactive'}
                                        onChange={(e) => handleUpdateStatus(city.id, e.target.value === 'active')}
                                    >
                                        <option value="active">Активен</option>
                                        <option value="inactive">Неактивен</option>
                                    </select>
                                </td>
                                <td>{city.Profiles?.length || 0}</td>
                                <td>
                                    <button onClick={() => setSelectedCity(city)}>
                                        Управление анкетами
                                    </button>
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

            {/* Модальное окно управления анкетами */}
            {selectedCity && (
                <div className="profiles-modal">
                    <div className="modal-content">
                        <h2>Анкеты для города {selectedCity.name}</h2>
                        <div className="profiles-list">
                            {profiles.map(profile => {
                                const isAssigned = selectedCity.Profiles?.some(
                                    p => p.id === profile.id
                                );
                                return (
                                    <div key={profile.id} className="profile-item">
                                        <input
                                            type="checkbox"
                                            checked={isAssigned}
                                            onChange={(e) => {
                                                const newProfiles = e.target.checked
                                                    ? [...(selectedCity.Profiles || []), profile]
                                                    : (selectedCity.Profiles || []).filter(p => p.id !== profile.id);
                                                handleAssignProfiles(
                                                    selectedCity.id,
                                                    newProfiles.map(p => p.id)
                                                );
                                            }}
                                        />
                                        <span>
                                            {profile.name} ({profile.age}, {profile.gender})
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <button onClick={() => setSelectedCity(null)}>Закрыть</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCitiesPage; 
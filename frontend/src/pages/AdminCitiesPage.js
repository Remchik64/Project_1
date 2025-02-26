import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl, getMediaUrl } from '../config/api';
import './AdminCitiesPage.css';

const AdminCitiesPage = () => {
    const [cities, setCities] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [newCityName, setNewCityName] = useState('');
    const [selectedCity, setSelectedCity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGender, setFilterGender] = useState('all');
    const [selectedProfiles, setSelectedProfiles] = useState([]);
    const [saveStatus, setSaveStatus] = useState('');
    const [autoClose, setAutoClose] = useState(true);
    const [updatingCityId, setUpdatingCityId] = useState(null);

    // Загрузка городов и анкет
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [citiesResponse, profilesResponse] = await Promise.all([
                    axios.get(getApiUrl('/api/cities'), {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                    }),
                    axios.get(getApiUrl('/api/profiles'), {
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

    // Установка выбранных профилей при выборе города
    useEffect(() => {
        if (selectedCity) {
            setSelectedProfiles(selectedCity.Profiles?.map(p => p.id) || []);
        }
    }, [selectedCity]);

    // Создание нового города
    const handleCreateCity = async (e) => {
        e.preventDefault();
        if (!newCityName.trim()) return;
        
        try {
            const response = await axios.post(
                getApiUrl('/api/cities'),
                { name: newCityName },
                {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }
            );
            
            // Проверяем, был ли город восстановлен
            if (response.data.message === 'Город был восстановлен') {
                setError('');
                setCities(prevCities => {
                    // Проверяем, есть ли уже город с таким ID в списке
                    const cityExists = prevCities.some(city => city.id === response.data.city.id);
                    if (cityExists) {
                        // Обновляем существующий город
                        return prevCities.map(city => 
                            city.id === response.data.city.id ? response.data.city : city
                        );
                    } else {
                        // Добавляем восстановленный город
                        return [...prevCities, response.data.city];
                    }
                });
                setNewCityName('');
                alert(`Город "${response.data.city.name}" был успешно восстановлен!`);
            } else {
                // Обычное создание нового города
                setCities([...cities, response.data]);
                setNewCityName('');
                setError(''); // Сбрасываем ошибку при успешном создании
            }
        } catch (error) {
            console.error('Ошибка при создании города:', error);
            
            // Проверяем, есть ли детальная информация об ошибке
            if (error.response) {
                if (error.response.status === 400 && error.response.data.message === 'Город с таким названием уже существует') {
                    setError(`Город с названием "${newCityName}" уже существует. Выберите другое название.`);
                } else {
                    setError(`Ошибка при создании города: ${error.response.data.message || 'Неизвестная ошибка'}`);
                }
            } else {
                setError('Ошибка при создании города: Не удалось соединиться с сервером');
            }
        }
    };

    // Обновление статуса города
    const handleUpdateStatus = async (cityId, isActive) => {
        const city = cities.find(c => c.id === cityId);
        const statusChangeMessage = isActive 
            ? `Вы уверены, что хотите сделать город "${city.name}" активным? Он станет доступен для просмотра пользователям.` 
            : `Вы уверены, что хотите сделать город "${city.name}" неактивным? Он будет скрыт от пользователей, но все анкеты сохранятся.`;
        
        if (window.confirm(statusChangeMessage)) {
            setUpdatingCityId(cityId);
            try {
                const response = await axios.patch(
                    getApiUrl(`/api/cities/${cityId}/status`),
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
            } finally {
                setUpdatingCityId(null);
            }
        }
    };

    // Удаление города
    const handleDeleteCity = async (cityId) => {
        if (window.confirm('Вы уверены, что хотите удалить этот город?')) {
            try {
                await axios.delete(
                    getApiUrl(`/api/cities/${cityId}`),
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
        setSaveStatus('saving');
        try {
            const response = await axios.post(
                getApiUrl(`/api/cities/${cityId}/profiles`),
                { profileIds: selectedProfileIds },
                {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }
            );
            setCities(cities.map(city => 
                city.id === cityId ? response.data : city
            ));
            setSaveStatus('saved');
            
            // Сбрасываем статус через 2 секунды и закрываем модальное окно если включено автозакрытие
            setTimeout(() => {
                setSaveStatus('');
                if (autoClose) {
                    setSelectedCity(null); // Закрываем модальное окно
                }
            }, 2000);
        } catch (error) {
            console.error('Ошибка при привязке анкет:', error);
            setError('Ошибка при привязке анкет');
            setSaveStatus('error');
        }
    };

    // Обработчик изменения выбора анкеты
    const handleProfileSelection = (profileId, isSelected) => {
        setSelectedProfiles(prev => {
            if (isSelected) {
                return [...prev, profileId];
            } else {
                return prev.filter(id => id !== profileId);
            }
        });
    };

    // Сохранение выбранных анкет
    const saveSelectedProfiles = () => {
        if (selectedCity) {
            handleAssignProfiles(selectedCity.id, selectedProfiles);
        }
    };

    // Выбор всех отфильтрованных анкет
    const selectAllFiltered = () => {
        const filteredIds = filteredProfiles.map(profile => profile.id);
        setSelectedProfiles(prev => {
            const newSelection = [...prev];
            filteredIds.forEach(id => {
                if (!newSelection.includes(id)) {
                    newSelection.push(id);
                }
            });
            return newSelection;
        });
    };

    // Снятие выбора со всех отфильтрованных анкет
    const deselectAllFiltered = () => {
        const filteredIds = filteredProfiles.map(profile => profile.id);
        setSelectedProfiles(prev => 
            prev.filter(id => !filteredIds.includes(id))
        );
    };

    // Форматирование краткого описания
    const formatShortDescription = (about) => {
        if (!about) return 'Нет описания';
        return about.length > 50 ? about.substring(0, 50) + '...' : about;
    };

    // Получение URL фотографии
    const getPhotoUrl = (photoPath) => {
        if (!photoPath) return null;
        return getMediaUrl(photoPath);
    };

    // Фильтрация профилей
    const filteredProfiles = profiles.filter(profile => {
        const matchesSearch = searchTerm === '' || 
            (profile.name && profile.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (profile.about && profile.about.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (profile.city && profile.city.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesGender = filterGender === 'all' || profile.gender === filterGender;
        
        return matchesSearch && matchesGender;
    });

    // Сортировка городов: активные сначала, затем по имени
    const sortedCities = [...cities].sort((a, b) => {
        // Сначала сортируем по статусу (активные первыми)
        if (a.isActive !== b.isActive) {
            return a.isActive ? -1 : 1;
        }
        // Затем по имени в алфавитном порядке
        return a.name.localeCompare(b.name);
    });

    // Подсчет активных и неактивных городов
    const activeCitiesCount = cities.filter(city => city.isActive).length;
    const inactiveCitiesCount = cities.length - activeCitiesCount;

    if (loading) return <div className="loading">Загрузка...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="admin-cities-page">
            <h1>Управление городами</h1>

            <div className="info-message">
                <div className="info-icon">ℹ</div>
                <div className="info-content">
                    <strong>Управление видимостью городов:</strong>
                    <ul>
                        <li><span className="status-text active">Активный город</span> - виден пользователям, анкеты доступны для просмотра.</li>
                        <li><span className="status-text inactive">Неактивный город</span> - скрыт от пользователей, анкеты не отображаются, но сохраняются в системе.</li>
                        <li>Удаление города следует использовать только если город был создан по ошибке. Все связанные анкеты будут отвязаны от города.</li>
                    </ul>
                </div>
            </div>

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
                <div className="cities-header">
                    <h2>Список городов</h2>
                    <div className="cities-stats">
                        <span className="city-stat active">
                            <span className="status-dot"></span>
                            Активных: {activeCitiesCount}
                        </span>
                        <span className="city-stat inactive">
                            <span className="status-dot"></span>
                            Неактивных: {inactiveCitiesCount}
                        </span>
                        <span className="city-stat total">
                            Всего: {cities.length}
                        </span>
                    </div>
                </div>
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
                        {sortedCities.map(city => (
                            <tr key={city.id} className={city.isActive ? 'city-active' : 'city-inactive'}>
                                <td>{city.name}</td>
                                <td>
                                    <div className="status-selector">
                                        {updatingCityId === city.id ? (
                                            <div className="status-loading">
                                                <span className="spinner"></span> Обновление...
                                            </div>
                                        ) : (
                                            <>
                                                <select
                                                    value={city.isActive ? 'active' : 'inactive'}
                                                    onChange={(e) => handleUpdateStatus(city.id, e.target.value === 'active')}
                                                    className={city.isActive ? 'status-active' : 'status-inactive'}
                                                >
                                                    <option value="active">Активен</option>
                                                    <option value="inactive">Неактивен</option>
                                                </select>
                                                <div className="status-info">
                                                    {city.isActive ? (
                                                        <span className="status-badge active">
                                                            <span className="status-dot"></span>
                                                            Виден пользователям
                                                        </span>
                                                    ) : (
                                                        <span className="status-badge inactive">
                                                            <span className="status-dot"></span>
                                                            Скрыт от пользователей
                                                        </span>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </td>
                                <td>{city.Profiles?.length || 0}</td>
                                <td>
                                    <button 
                                        onClick={() => setSelectedCity(city)}
                                        disabled={updatingCityId === city.id}
                                    >
                                        Управление анкетами
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteCity(city.id)}
                                        className="delete-button"
                                        title="Удаление города необратимо. Рекомендуется сначала сделать город неактивным."
                                        disabled={updatingCityId === city.id}
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
                        
                        <div className="profiles-filter">
                            <div className="search-box">
                                <input
                                    type="text"
                                    placeholder="Поиск по имени, городу или описанию..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="gender-filter">
                                <label>Фильтр по полу:</label>
                                <select 
                                    value={filterGender} 
                                    onChange={(e) => setFilterGender(e.target.value)}
                                >
                                    <option value="all">Все</option>
                                    <option value="Мужской">Мужской</option>
                                    <option value="Женский">Женский</option>
                                </select>
                            </div>
                            <div className="auto-close-option">
                                <label className="auto-close-label">
                                    <input
                                        type="checkbox"
                                        checked={autoClose}
                                        onChange={() => setAutoClose(!autoClose)}
                                    />
                                    Автоматически закрывать после сохранения
                                </label>
                            </div>
                        </div>
                        
                        <div className="profiles-stats">
                            <span>Найдено анкет: {filteredProfiles.length}</span>
                            <span>Выбрано: {selectedProfiles.length}</span>
                            <div className="bulk-actions">
                                <button 
                                    className="select-all-btn" 
                                    onClick={selectAllFiltered}
                                    disabled={filteredProfiles.length === 0}
                                >
                                    Выбрать все
                                </button>
                                <button 
                                    className="deselect-all-btn" 
                                    onClick={deselectAllFiltered}
                                    disabled={filteredProfiles.length === 0}
                                >
                                    Снять выбор
                                </button>
                            </div>
                        </div>
                        
                        <div className="profiles-list">
                            {filteredProfiles.length > 0 ? (
                                filteredProfiles.map(profile => {
                                    const isSelected = selectedProfiles.includes(profile.id);
                                    const photoUrl = getPhotoUrl(profile.photo);
                                    
                                    return (
                                        <div key={profile.id} className={`profile-item ${isSelected ? 'selected' : ''}`}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={(e) => handleProfileSelection(profile.id, e.target.checked)}
                                            />
                                            <div className="profile-thumbnail">
                                                {photoUrl ? (
                                                    <img 
                                                        src={photoUrl} 
                                                        alt={profile.name} 
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = '/placeholder-avatar.png';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="placeholder-image">
                                                        <span>Нет фото</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="profile-details">
                                                <div className="profile-name">
                                                    {profile.name || 'Без имени'} ({profile.age || '?'}, {profile.gender || '?'})
                                                </div>
                                                <div className="profile-short-info">
                                                    <span className="profile-city">{profile.city || 'Город не указан'}</span>
                                                    <span className="profile-about">{formatShortDescription(profile.about)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="no-profiles-message">
                                    Анкеты не найдены. Попробуйте изменить параметры поиска.
                                </div>
                            )}
                        </div>
                        <div className="modal-actions">
                            <div className="save-status">
                                {saveStatus === 'saving' && (
                                    <span className="saving">
                                        <span className="spinner"></span> Сохранение...
                                    </span>
                                )}
                                {saveStatus === 'saved' && (
                                    <span className="saved">
                                        <span className="success-icon">✓</span> Сохранено! {autoClose && 'Окно закроется автоматически...'}
                                    </span>
                                )}
                                {saveStatus === 'error' && (
                                    <span className="error">
                                        <span className="error-icon">✗</span> Ошибка сохранения!
                                    </span>
                                )}
                            </div>
                            <div className="action-buttons">
                                <button 
                                    className="save-button" 
                                    onClick={saveSelectedProfiles}
                                    disabled={saveStatus === 'saving'}
                                >
                                    {saveStatus === 'saving' ? 'Сохранение...' : 'Сохранить изменения'}
                                </button>
                                <button 
                                    className="close-button" 
                                    onClick={() => setSelectedCity(null)}
                                >
                                    Закрыть
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCitiesPage; 
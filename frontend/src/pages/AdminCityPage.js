import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import './AdminCityPage.css';

const AdminCityPage = () => {
    const [cities, setCities] = useState([]);
    const [newCityName, setNewCityName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCities();
    }, []);

    const fetchCities = async () => {
        try {
            const response = await axios.get(getApiUrl('/api/cities/all'), {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
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
            await axios.post(getApiUrl('/api/cities'), 
                { name: newCityName },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            setNewCityName('');
            fetchCities();
        } catch (error) {
            console.error('Ошибка при добавлении города:', error);
            setError('Ошибка при добавлении города');
        }
    };

    const handleToggleStatus = async (cityId, currentStatus) => {
        try {
            await axios.put(
                getApiUrl(`/api/cities/${cityId}`),
                { status: !currentStatus },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            fetchCities();
        } catch (error) {
            console.error('Ошибка при изменении статуса города:', error);
            setError('Ошибка при изменении статуса города');
        }
    };

    const handleDeleteCity = async (cityId) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот город?')) {
            return;
        }

        try {
            await axios.delete(getApiUrl(`/api/cities/${cityId}`), {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            fetchCities();
        } catch (error) {
            console.error('Ошибка при удалении города:', error);
            setError('Ошибка при удалении города');
        }
    };

    // ... rest of the code ...
} 
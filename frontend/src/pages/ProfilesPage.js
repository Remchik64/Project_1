import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProfileCard from '../components/ProfileCard';
import FilterSidebar from '../components/FilterSidebar';
import useGeolocation from '../hooks/useGeolocation';
import './ProfilesPage.css';

const ProfilesPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeCities, setActiveCities] = useState([]);
  const [filters, setFilters] = useState({
    ageRange: 'all',
    gender: 'all',
    maritalStatus: 'all'
  });

  const { location, error: locationError, loading: locationLoading } = useGeolocation();

  useEffect(() => {
    if (!locationLoading) {
      fetchProfiles();
    }
  }, [locationLoading, location]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      console.log('Запрашиваем анкеты с параметрами:', location);

      const params = location ? {
        city: location.city,
        latitude: location.latitude,
        longitude: location.longitude
      } : {};

      const response = await axios.get('http://localhost:5000/api/public/profiles', { params });
      console.log('Получен ответ:', response.data);
      
      if (response.data.profiles) {
        setProfiles(response.data.profiles);
      }
      if (response.data.cities) {
        setActiveCities(response.data.cities);
      }
    } catch (error) {
      console.error('Ошибка при загрузке анкет:', error);
      setError('Ошибка при загрузке анкет');
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    if (filters.ageRange !== 'all') {
      const [min, max] = filters.ageRange.split('-').map(Number);
      if (profile.age < min || (max && profile.age > max)) {
        return false;
      }
    }

    if (filters.gender !== 'all' && profile.gender !== filters.gender) {
      return false;
    }

    if (filters.maritalStatus !== 'all' && profile.maritalStatus !== filters.maritalStatus) {
      return false;
    }
    
    return true;
  });

  if (loading || locationLoading) return <div className="loading">Загрузка...</div>;
  if (error || locationError) return <div className="error-message">{error || locationError}</div>;

  // Если нет анкет для отображения
  if (filteredProfiles.length === 0) {
    return (
      <div className="profiles-page">
        <div className="profiles-header">
          <h1>
            Анкеты
            {location?.city && <span className="city-label"> в городе {location.city}</span>}
          </h1>
        </div>
        <div className="no-profiles-message">
          <h2>Извините, в вашем городе пока нет доступных анкет</h2>
          <p>В настоящее время сервис не работает в городе {location?.city}</p>
          <p>Мы постоянно расширяем географию и скоро появимся в вашем городе!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profiles-page">
      <div className="profiles-header">
        <h1>
          Анкеты
          {location?.city && <span className="city-label"> в городе {location.city}</span>}
        </h1>
        <button 
          className="hamburger-button"
          onClick={() => setIsFilterOpen(true)}
        >
          <span className="hamburger-icon">☰</span>
        </button>
      </div>

      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
      />
      
      <div className="profiles-grid">
        {filteredProfiles.map(profile => (
          <ProfileCard key={profile._id} profile={profile} />
        ))}
      </div>
    </div>
  );
};

export default ProfilesPage; 
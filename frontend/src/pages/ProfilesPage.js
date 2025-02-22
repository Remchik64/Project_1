import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ProfileCard from '../components/ProfileCard';
import FilterSidebar from '../components/FilterSidebar';
import CitySelector from '../components/CitySelector';
import './ProfilesPage.css';

const ProfilesPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showCitySelector, setShowCitySelector] = useState(true);
  const [selectedCity, setSelectedCity] = useState(null);
  const [cityName, setCityName] = useState('');
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [filters, setFilters] = useState({
    ageRange: 'all',
    gender: 'all',
    heightRange: 'all',
    weightRange: 'all',
    interests: []
  });

  useEffect(() => {
    const savedCity = localStorage.getItem('selectedCity');
    if (savedCity || isAdmin) {
      setSelectedCity(savedCity);
      setShowCitySelector(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (selectedCity || isAdmin) {
      fetchProfiles();
    }
  }, [selectedCity, isAdmin]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      let profilesResponse;
      let cityResponse;

      if (selectedCity) {
        [profilesResponse, cityResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/cities/${selectedCity}/profiles`),
          axios.get(`http://localhost:5000/api/cities/${selectedCity}`)
        ]);
        
        if (cityResponse.data) {
          setCityName(cityResponse.data.name);
        }
      } else if (isAdmin) {
        profilesResponse = await axios.get('http://localhost:5000/api/profiles', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      
      if (profilesResponse.data) {
        setProfiles(Array.isArray(profilesResponse.data) ? profilesResponse.data : []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Ошибка при загрузке анкет:', error);
      setError('Ошибка при загрузке анкет');
      setLoading(false);
      
      if (error.response?.status === 404 && !isAdmin) {
        localStorage.removeItem('selectedCity');
        setSelectedCity(null);
        setShowCitySelector(true);
      }
    }
  };

  const handleCitySelect = (cityId) => {
    setSelectedCity(cityId);
    setShowCitySelector(false);
  };

  const handleChangeCity = () => {
    setShowCitySelector(true);
  };

  const filteredProfiles = profiles.filter(profile => {
    if (filters.ageRange !== 'all') {
      const [min, max] = filters.ageRange.split('-').map(Number);
      if (max) {
        if (profile.age < min || profile.age > max) return false;
      } else {
        if (profile.age < min) return false;
      }
    }

    if (filters.gender !== 'all' && profile.gender !== filters.gender) {
      return false;
    }

    if (filters.heightRange !== 'all' && profile.height) {
      const [min, max] = filters.heightRange.split('-').map(Number);
      const height = parseInt(profile.height);
      if (max) {
        if (height < min || height > max) return false;
      } else {
        if (height < min) return false;
      }
    }

    if (filters.weightRange !== 'all' && profile.weight) {
      const [min, max] = filters.weightRange.split('-').map(Number);
      const weight = parseInt(profile.weight);
      if (max) {
        if (weight < min || weight > max) return false;
      } else {
        if (weight < min) return false;
      }
    }

    if (filters.interests && filters.interests.length > 0 && profile.interests) {
      const profileInterests = profile.interests.toLowerCase().split(',').map(i => i.trim());
      const hasMatchingInterests = filters.interests.some(interest => 
        profileInterests.some(profileInterest => 
          profileInterest.includes(interest.toLowerCase()) || 
          interest.toLowerCase().includes(profileInterest)
        )
      );
      if (!hasMatchingInterests) {
        return false;
      }
    }
    
    return true;
  });

  if (showCitySelector) {
    return <CitySelector onCitySelect={handleCitySelect} />;
  }

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error-message">{error}</div>;

  if (filteredProfiles.length === 0) {
    return (
      <div className="profiles-page">
        <div className="profiles-header">
          <div className="header-content">
            <h1>Анкеты {cityName && `в городе ${cityName}`}</h1>
            <button onClick={handleChangeCity} className="change-city-button">
              Изменить город
            </button>
          </div>
        </div>
        <div className="no-profiles-message">
          <h2>Извините, пока нет доступных анкет</h2>
          <p>В настоящее время нет активных анкет в вашем городе</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profiles-page">
      <div className="profiles-header">
        <div className="header-content">
          <h1>Анкеты {cityName && `в городе ${cityName}`}</h1>
          <button onClick={handleChangeCity} className="change-city-button">
            Изменить город
          </button>
        </div>
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
        onSearch={() => {
          setIsFilterOpen(false);
          fetchProfiles();
        }}
      />
      
      <div className="profiles-grid">
        {filteredProfiles.map(profile => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
      </div>
    </div>
  );
};

export default ProfilesPage; 
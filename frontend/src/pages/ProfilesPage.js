import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ProfileCard from '../components/ProfileCard';
import FilterSidebar from '../components/FilterSidebar';
import CitySelector from '../components/CitySelector';
import { getApiUrl } from '../config/api';
import { setPageMetadata, setStructuredData, createCityStructuredData } from '../utils/seo';
import './ProfilesPage.css';

const ProfilesPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showCitySelector, setShowCitySelector] = useState(true);
  const [selectedCity, setSelectedCity] = useState(null);
  const [cityName, setCityName] = useState('');
  const [cities, setCities] = useState([]);
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
    const ageConfirmed = localStorage.getItem('ageConfirmed');
    
    if ((savedCity && ageConfirmed) || isAdmin) {
      setSelectedCity(savedCity);
      setShowCitySelector(false);
    }
    
    // Устанавливаем базовые SEO метаданные для страницы анкет
    setPageMetadata({
      title: 'Анкеты и знакомства | Сервис знакомств',
      description: 'Просмотр анкет для знакомств. Найдите интересных людей в вашем городе.',
      keywords: 'анкеты, знакомства, поиск анкет, просмотр анкет',
      canonical: window.location.href,
      og: {
        title: 'Анкеты и знакомства | Сервис знакомств',
        description: 'Просмотр анкет для знакомств. Найдите интересных людей в вашем городе.',
        type: 'website',
        url: window.location.href,
        image: `${window.location.origin}/og-image.jpg`
      }
    });

    // Загружаем список городов
    const fetchCities = async () => {
      try {
        const response = await axios.get(getApiUrl('/api/cities'));
        setCities(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке городов:', error);
      }
    };
    
    fetchCities();
  }, [isAdmin]);

  useEffect(() => {
    if (selectedCity || isAdmin) {
      fetchProfiles();
    }
  }, [selectedCity, isAdmin]);

  const fetchProfiles = async () => {
    try {
      console.log('Загрузка публичных профилей...');
      setLoading(true);
      
      const response = await axios.get(getApiUrl('/api/public/profiles'));
      console.log('Получены публичные профили:', response.data);
      
      setProfiles(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при загрузке анкет:', error);
      console.error('Детали ошибки:', error.response?.data);
      setError('Не удалось загрузить анкеты');
      setLoading(false);
    }
  };

  const handleCitySelect = (cityId, ageConfirmed = false) => {
    if (ageConfirmed) {
      localStorage.setItem('ageConfirmed', 'true');
    }
    
    setSelectedCity(cityId);
    localStorage.setItem('selectedCity', cityId);
    setShowCitySelector(false);
    
    // Обновляем структурированные данные для SEO
    if (cityId) {
      const city = cities.find(c => c.id === cityId);
      if (city) {
        setCityName(city.name);
        // Обновляем структурированные данные для SEO с учетом выбранного города
        createCityStructuredData(city.name);
      }
    }
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
      const profileInterests = profile.interests
        .toLowerCase()
        .split(',')
        .map(i => i.trim())
        .filter(i => i.length > 0);

      const searchInterests = filters.interests
        .map(i => i.toLowerCase().trim())
        .filter(i => i.length > 0);

      const hasMatchingInterests = searchInterests.some(searchInterest =>
        profileInterests.some(profileInterest => {
          if (profileInterest === searchInterest) return true;
          
          if (profileInterest.includes(searchInterest) || 
              searchInterest.includes(profileInterest)) {
            const profileWords = profileInterest.split(' ');
            const searchWords = searchInterest.split(' ');
            
            return profileWords.some(pWord => 
              searchWords.some(sWord => 
                pWord.includes(sWord) || sWord.includes(pWord)
              )
            );
          }
          
          return false;
        })
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
    <div className="profiles-page" itemScope itemType="https://schema.org/CollectionPage">
      <meta itemProp="name" content={`Анкеты ${cityName ? `в городе ${cityName}` : ''}`} />
      <meta itemProp="description" content={`Просмотр анкет для знакомств ${cityName ? `в городе ${cityName}` : ''}. Найдите интересных людей в вашем городе.`} />
      
      <div className="profiles-header">
        <div className="header-content">
          <h1>Анкеты {cityName && `в городе ${cityName}`}</h1>
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
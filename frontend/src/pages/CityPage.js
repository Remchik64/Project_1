import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet';

// Импорт компонентов
import ProfileCard from '../components/ProfileCard';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import Breadcrumbs from '../components/Breadcrumbs';

// Импорт утилит и констант
import { API_URL } from '../config/constants';
import { formatDistrictsList } from '../utils/formatters';

// Импорт стилей
import './CityPage.css';

const CityPage = () => {
  const { citySlug } = useParams();
  const navigate = useNavigate();
  
  // Состояния
  const [city, setCity] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Загрузка данных о городе и профилях
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Запрос данных о городе
        const cityResponse = await axios.get(`${API_URL}/cities/by-slug/${citySlug}`);
        
        if (!cityResponse.data) {
          throw new Error('Город не найден');
        }
        
        setCity(cityResponse.data);
        
        // Запрос профилей для города
        const profilesResponse = await axios.get(`${API_URL}/profiles`, {
          params: {
            cityId: cityResponse.data.id,
            status: 'active',
            page: currentPage,
            limit: 12
          }
        });
        
        setProfiles(profilesResponse.data.profiles);
        setTotalPages(profilesResponse.data.totalPages || 1);
        setIsLoading(false);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError(err.message || 'Произошла ошибка при загрузке данных');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [citySlug, currentPage]);
  
  // Обработчик изменения страницы
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };
  
  // Путь для хлебных крошек
  const breadcrumbItems = [
    { title: 'Главная', url: '/' },
    { title: 'Города', url: '/cities' },
    { title: city?.name || 'Загрузка...', url: `/city/${citySlug}` }
  ];
  
  // Если данные загружаются
  if (isLoading) {
    return (
      <div className="city-page-loading">
        <Loader message="Загрузка информации о городе..." />
      </div>
    );
  }
  
  // Если произошла ошибка
  if (error) {
    return (
      <div className="city-page-error">
        <ErrorMessage message={error} />
        <button 
          className="back-button"
          onClick={() => navigate('/cities')}
        >
          Вернуться к списку городов
        </button>
      </div>
    );
  }
  
  // Если данные успешно загружены
  return (
    <div className="city-page">
      {/* SEO метаданные */}
      <Helmet>
        <title>Анкеты знакомств в {city.name} | Сервис знакомств</title>
        <meta name="description" content={`Найдите свою вторую половинку среди проверенных анкет в городе ${city.name}. Большой выбор анкет для знакомств и встреч.`} />
        <meta name="keywords" content={`знакомства ${city.name}, анкеты ${city.name}, встречи ${city.name}, свидания ${city.name}`} />
        <link rel="canonical" href={`https://escort-bar.live/city/${citySlug}`} />
        {currentPage > 1 && (
          <>
            <link rel="prev" href={`https://escort-bar.live/city/${citySlug}${currentPage > 2 ? `?page=${currentPage - 1}` : ''}`} />
          </>
        )}
        {currentPage < totalPages && (
          <link rel="next" href={`https://escort-bar.live/city/${citySlug}?page=${currentPage + 1}`} />
        )}
      </Helmet>
      
      {/* Хлебные крошки */}
      <Breadcrumbs items={breadcrumbItems} />
      
      {/* Заголовок страницы */}
      <div className="city-page-header">
        <h1>Анкеты знакомств в городе {city.name}</h1>
        <p className="city-description">
          {city.description || `Найдите свою вторую половинку среди проверенных анкет в городе ${city.name}. У нас представлены анкеты с реальными фотографиями и проверенными данными.`}
        </p>
      </div>
      
      {/* Информация о городе */}
      <div className="city-info-container">
        <div className="city-stats">
          <div className="stat-item">
            <span className="stat-value">{profiles.length > 0 ? profiles.length : '0'}</span>
            <span className="stat-label">анкет в городе</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{city.onlineCount || '0'}</span>
            <span className="stat-label">онлайн сейчас</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{city.newCount || '0'}</span>
            <span className="stat-label">новых за сегодня</span>
          </div>
        </div>
        
        {/* Районы города */}
        {city.districts && city.districts.length > 0 && (
          <div className="city-districts">
            <h2>Районы города {city.name}</h2>
            <div className="districts-list">
              {city.districts.map((district, index) => (
                <div key={index} className="district-item">
                  {district}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Анкеты */}
      <div className="city-profiles-section">
        <h2>Анкеты в городе {city.name}</h2>
        
        {profiles.length > 0 ? (
          <>
            <div className="profiles-grid">
              {profiles.map(profile => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
            
            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                >
                  &laquo;
                </button>
                
                <button 
                  className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  &lsaquo;
                </button>
                
                {/* Номера страниц */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Логика для отображения номеров страниц вокруг текущей
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <button 
                      key={pageNumber}
                      className={`pagination-button ${pageNumber === currentPage ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                <button 
                  className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  &rsaquo;
                </button>
                
                <button 
                  className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  &raquo;
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-profiles">
            <p>В городе {city.name} пока нет доступных анкет</p>
            <Link to="/profiles" className="view-all-button">
              Смотреть все анкеты
            </Link>
          </div>
        )}
      </div>
      
      {/* Ближайшие города */}
      {city.nearbyCities && city.nearbyCities.length > 0 && (
        <div className="nearby-cities">
          <h3>Ближайшие города</h3>
          <div className="cities-list">
            {city.nearbyCities.map((nearbyCity, index) => (
              <Link 
                key={index}
                to={`/city/${nearbyCity.slug}`}
                className="city-link"
              >
                {nearbyCity.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CityPage; 
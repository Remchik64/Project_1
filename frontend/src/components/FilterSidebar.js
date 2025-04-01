import React, { useState, useEffect } from 'react';
import './FilterSidebar.css';

const FilterSidebar = ({ 
  isOpen, 
  onClose, 
  filters, 
  setFilters,
  onSearch
}) => {
  const [interests, setInterests] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Проверяем, является ли устройство мобильным
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile(); // Проверяем при первой загрузке
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Добавляем/удаляем класс body для предотвращения прокрутки
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('filter-menu-open');
    } else {
      document.body.classList.remove('filter-menu-open');
    }
    
    return () => {
      document.body.classList.remove('filter-menu-open');
    };
  }, [isOpen]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({...prev, [key]: value}));
  };

  const handleInterestsChange = (e) => {
    setInterests(e.target.value);
  };

  const handleSearch = () => {
    // Преобразуем строку интересов в массив, удаляем пробелы
    const interestsArray = interests
      .split(',')
      .map(interest => interest.trim())
      .filter(interest => interest.length > 0);
    
    // Обновляем фильтры с новыми интересами
    handleFilterChange('interests', interestsArray);
    
    // Закрываем фильтры на мобильном устройстве после поиска
    if (isMobile) {
      onClose();
    }
    
    // Вызываем функцию поиска
    if (onSearch) {
      onSearch();
    }
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <div className={`filter-sidebar ${isOpen ? 'open' : ''} ${isMobile ? 'mobile-filter' : ''}`}>
      <div className="filter-sidebar-content" onClick={stopPropagation}>
        <button className="close-button" onClick={onClose}>×</button>
        <h3>Фильтры</h3>

        <div className="filter-section">
          <label>Возраст</label>
          <select
            value={filters.ageRange}
            onChange={(e) => handleFilterChange('ageRange', e.target.value)}
            onClick={stopPropagation}
          >
            <option value="all">Любой возраст</option>
            <option value="18-25">18-25 лет</option>
            <option value="26-35">26-35 лет</option>
            <option value="36-45">36-45 лет</option>
            <option value="46">46+ лет</option>
          </select>
        </div>

        <div className="filter-section">
          <label>Пол</label>
          <select
            value={filters.gender}
            onChange={(e) => handleFilterChange('gender', e.target.value)}
            onClick={stopPropagation}
          >
            <option value="all">Все</option>
            <option value="Мужской">Мужской</option>
            <option value="Женский">Женский</option>
          </select>
        </div>

        <div className="filter-section">
          <label>Рост</label>
          <select
            value={filters.heightRange}
            onChange={(e) => handleFilterChange('heightRange', e.target.value)}
            onClick={stopPropagation}
          >
            <option value="all">Любой рост</option>
            <option value="150-160">150-160 см</option>
            <option value="161-170">161-170 см</option>
            <option value="171-180">171-180 см</option>
            <option value="181-190">181-190 см</option>
            <option value="191">191+ см</option>
          </select>
        </div>

        <div className="filter-section">
          <label>Вес</label>
          <select
            value={filters.weightRange}
            onChange={(e) => handleFilterChange('weightRange', e.target.value)}
            onClick={stopPropagation}
          >
            <option value="all">Любой вес</option>
            <option value="40-50">40-50 кг</option>
            <option value="51-60">51-60 кг</option>
            <option value="61-70">61-70 кг</option>
            <option value="71-80">71-80 кг</option>
            <option value="81-90">81-90 кг</option>
            <option value="91">91+ кг</option>
          </select>
        </div>

        <div className="filter-section">
          <label>Прайс</label>
          <input
            type="text"
            value={interests}
            onChange={handleInterestsChange}
            onClick={stopPropagation}
            placeholder="Введите ценовые категории через запятую"
            className="interests-input"
          />
          <small className="input-help">
            Например: 2000, 3000, 5000
          </small>
        </div>

        <button 
          className="search-button" 
          onClick={handleSearch}
        >
          Найти анкеты
        </button>
      </div>
      {isOpen && <div className="filter-sidebar-overlay" onClick={onClose}></div>}
    </div>
  );
};

export default FilterSidebar; 
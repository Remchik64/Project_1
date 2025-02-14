import React from 'react';
import './FilterSidebar.css';

const FilterSidebar = ({ 
  isOpen, 
  onClose, 
  filters, 
  setFilters
}) => {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({...prev, [key]: value}));
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <div className={`filter-sidebar ${isOpen ? 'open' : ''}`}>
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
            <option value="male">Мужской</option>
            <option value="female">Женский</option>
          </select>
        </div>

        <div className="filter-section">
          <label>Семейное положение</label>
          <select
            value={filters.maritalStatus}
            onChange={(e) => handleFilterChange('maritalStatus', e.target.value)}
            onClick={stopPropagation}
          >
            <option value="all">Любое</option>
            <option value="single">Холост/Не замужем</option>
            <option value="divorced">В разводе</option>
            <option value="widowed">Вдовец/Вдова</option>
          </select>
        </div>
      </div>
      {isOpen && <div className="filter-sidebar-overlay" onClick={onClose}></div>}
    </div>
  );
};

export default FilterSidebar; 
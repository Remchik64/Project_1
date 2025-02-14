import React, { useState } from 'react';
import ProfileCard from '../components/ProfileCard';
import './SearchPage.css';

const SearchPage = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [filters, setFilters] = useState({
    gender: '',
    ageFrom: '',
    ageTo: '',
    city: '',
    interests: ''
  });

  const handleSearch = (e) => {
    e.preventDefault();
    // Здесь будет логика поиска через API
    // Пока используем тестовые данные
    setSearchResults([
      {
        id: 1,
        name: 'Елена',
        age: 24,
        city: 'Москва',
        about: 'Творческая личность, люблю искусство и музыку',
        interests: ['Искусство', 'Музыка', 'Театр'],
        photo: 'https://via.placeholder.com/200x200'
      }
    ]);
  };

  return (
    <div className="search-page">
      <h1>Поиск анкет</h1>
      
      <form className="search-form" onSubmit={handleSearch}>
        <div className="form-group">
          <label>Пол</label>
          <select 
            value={filters.gender}
            onChange={(e) => setFilters({...filters, gender: e.target.value})}
          >
            <option value="">Любой</option>
            <option value="female">Женский</option>
            <option value="male">Мужской</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Возраст от</label>
            <input 
              type="number" 
              min="18" 
              max="100"
              value={filters.ageFrom}
              onChange={(e) => setFilters({...filters, ageFrom: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>до</label>
            <input 
              type="number" 
              min="18" 
              max="100"
              value={filters.ageTo}
              onChange={(e) => setFilters({...filters, ageTo: e.target.value})}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Город</label>
          <input 
            type="text"
            value={filters.city}
            onChange={(e) => setFilters({...filters, city: e.target.value})}
            placeholder="Введите город"
          />
        </div>

        <div className="form-group">
          <label>Интересы</label>
          <input 
            type="text"
            value={filters.interests}
            onChange={(e) => setFilters({...filters, interests: e.target.value})}
            placeholder="Например: спорт, музыка"
          />
        </div>

        <button type="submit" className="search-button">Найти</button>
      </form>

      <div className="search-results">
        {searchResults.map(profile => (
          <ProfileCard key={profile.id} profile={profile} />
        ))}
      </div>
    </div>
  );
};

export default SearchPage; 
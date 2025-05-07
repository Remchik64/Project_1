#!/usr/bin/env node

/**
 * Скрипт для генерации статических HTML-страниц городов
 * Author: Claude
 * Version: 1.0
 * Date: 2025-05-08
 * 
 * Этот скрипт создает статические HTML-страницы для каждого города,
 * используя шаблон city-template.html и данные из базы данных.
 * 
 * Использование:
 * node generate-city-pages.js
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

// Подключение к базе данных
const { sequelize, City, Profile } = require('../backend/models');

// Путь к папке для статических файлов
const STATIC_PAGES_DIR = path.join(__dirname, '../frontend/public/city');
const TEMPLATE_PATH = path.join(__dirname, '../frontend/public/city-template.html');

/**
 * Генерирует HTML-список из массива строк
 */
function generateListItems(items) {
  if (!items || !items.length) return '';
  return items.map(item => `<li>${item}</li>`).join('\n');
}

/**
 * Генерирует HTML-элементы районов города
 */
function generateDistrictItems(districts) {
  if (!districts || !districts.length) return '';
  return districts.map(district => `<span class="district-item">${district}</span>`).join('\n');
}

/**
 * Генерирует HTML с соседними городами
 */
function generateNearbyCities(cities) {
  if (!cities || !cities.length) return '';
  return cities.map(city => 
    `<a href="/city/${city.slug}/" class="city-link">${city.name}</a>`
  ).join('\n');
}

/**
 * Генерирует превью профилей для города
 */
function generateProfilesPreview(profiles, limit = 10) {
  if (!profiles || !profiles.length) {
    return '<div class="no-profiles">В этом городе пока нет анкет</div>';
  }
  
  const limitedProfiles = profiles.slice(0, limit);
  
  return limitedProfiles.map(profile => `
    <div class="profile-card">
      <div class="profile-image" style="background-image: url('${profile.mainPhotoUrl || '/img/no-photo.jpg'}')"></div>
      <div class="profile-info">
        <div class="profile-name">${profile.name}, ${profile.age}</div>
        <div class="profile-details">
          <span>${profile.height ? profile.height + ' см' : ''}</span>
          <span>${profile.weight ? profile.weight + ' кг' : ''}</span>
        </div>
        <a href="/profile/${profile.id}" class="profile-button">Посмотреть анкету</a>
      </div>
    </div>
  `).join('\n');
}

/**
 * Генерирует структурированные данные для профилей
 */
function generateStructuredData(profiles, cityName, citySlug, limit = 10) {
  if (!profiles || !profiles.length) {
    return '';
  }
  
  const limitedProfiles = profiles.slice(0, limit);
  
  const itemListElements = limitedProfiles.map((profile, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "item": {
      "@type": "Person",
      "name": `${profile.name}, ${profile.age}`,
      "image": profile.mainPhotoUrl || "https://escort-bar.live/img/no-photo.jpg",
      "url": `https://escort-bar.live/profile/${profile.id}`
    }
  }));
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": itemListElements
  };
  
  return JSON.stringify(structuredData, null, 2);
}

/**
 * Генерирует HTML-страницу для города
 */
async function generateCityPage(city, profiles) {
  try {
    // Создаем директорию для города, если она не существует
    const cityDir = path.join(STATIC_PAGES_DIR, city.slug);
    try {
      await mkdirAsync(cityDir, { recursive: true });
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
    }
    
    // Читаем шаблон
    const template = await readFileAsync(TEMPLATE_PATH, 'utf8');
    
    // Готовим данные для замены
    const replacements = {
      '{{CITY_NAME}}': city.name,
      '{{CITY_SLUG}}': city.slug,
      '{{DISTRICTS_LIST}}': generateListItems(city.districts || []),
      '{{DISTRICTS_ITEMS}}': generateDistrictItems(city.districts || []),
      '{{NEARBY_CITIES}}': generateNearbyCities(city.nearbyCities || []),
      '{{PROFILES_LIST}}': generateProfilesPreview(profiles)
    };
    
    // Заменяем переменные в шаблоне
    let html = template;
    for (const [placeholder, value] of Object.entries(replacements)) {
      html = html.replace(new RegExp(placeholder, 'g'), value);
    }
    
    // Обновляем структурированные данные
    const structuredDataRegex = /<script type="application\/ld\+json">\s*\{\s*"@context": "https:\/\/schema\.org",\s*"@type": "ItemList",.*?<\/script>/s;
    const newStructuredData = `<script type="application/ld+json">\n${generateStructuredData(profiles, city.name, city.slug)}\n</script>`;
    html = html.replace(structuredDataRegex, newStructuredData);
    
    // Записываем файл
    const outputPath = path.join(cityDir, 'index.html');
    await writeFileAsync(outputPath, html);
    
    console.log(`✅ Сгенерирована страница для города ${city.name} (${city.slug})`);
    return true;
  } catch (error) {
    console.error(`❌ Ошибка при генерации страницы для города ${city.name}:`, error);
    return false;
  }
}

/**
 * Основная функция генерации страниц городов
 */
async function generateCityPages() {
  try {
    console.log('Начинаем генерацию статических HTML-страниц для городов...');
    
    // Подключаемся к базе данных
    await sequelize.authenticate();
    console.log('Подключение к базе данных успешно установлено.');
    
    // Создаем директорию для страниц городов, если она не существует
    try {
      await mkdirAsync(STATIC_PAGES_DIR, { recursive: true });
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
    }
    
    // Получаем все активные города
    const cities = await City.findAll({
      where: { isActive: true },
      raw: true
    });
    
    console.log(`Найдено ${cities.length} активных городов.`);
    
    // Генерируем страницы для каждого города
    let successCount = 0;
    
    for (const city of cities) {
      // Получаем профили для города
      const profiles = await Profile.findAll({
        where: { 
          cityId: city.id,
          status: 'active'
        },
        attributes: ['id', 'name', 'age', 'height', 'weight', 'mainPhotoUrl'],
        limit: 20,
        raw: true
      });
      
      // Генерируем страницу
      const success = await generateCityPage(city, profiles);
      if (success) successCount++;
    }
    
    console.log(`\nГенерация завершена! Успешно сгенерировано ${successCount} из ${cities.length} страниц.`);
    
  } catch (error) {
    console.error('Произошла ошибка при генерации страниц:', error);
  } finally {
    // Закрываем соединение с базой данных
    await sequelize.close();
  }
}

// Запускаем генерацию при вызове скрипта
if (require.main === module) {
  generateCityPages().catch(console.error);
}

module.exports = { generateCityPages }; 
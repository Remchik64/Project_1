#!/usr/bin/env node

/**
 * Скрипт для генерации XML-карты сайта (sitemap.xml)
 * Author: Claude
 * Version: 1.0
 * Date: 2025-05-08
 * 
 * Этот скрипт создает sitemap.xml для всего сайта,
 * включая основные страницы, страницы городов и страницы профилей.
 * 
 * Использование:
 * node generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);

// Подключение к базе данных
const { sequelize, City, Profile } = require('../backend/models');

// Путь к выходному файлу sitemap.xml
const SITEMAP_PATH = path.join(__dirname, '../frontend/public/sitemap.xml');

// Основной URL сайта
const SITE_URL = 'https://escort-bar.live';

/**
 * Получает текущую дату в формате YYYY-MM-DD
 */
function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Генерирует XML-запись для URL в sitemap
 */
function generateUrlEntry(url, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

/**
 * Основная функция генерации sitemap.xml
 */
async function generateSitemap() {
  try {
    console.log('Начинаем генерацию sitemap.xml...');
    
    // Подключаемся к базе данных
    await sequelize.authenticate();
    console.log('Подключение к базе данных успешно установлено.');
    
    // Текущая дата
    const today = getCurrentDate();
    
    // Начало XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Основные статические страницы
    const mainPages = [
      { url: '', priority: '1.0', changefreq: 'daily' },
      { url: 'profiles', priority: '0.9', changefreq: 'hourly' },
      { url: 'cities', priority: '0.8', changefreq: 'daily' },
      { url: 'about', priority: '0.7', changefreq: 'monthly' },
      { url: 'contacts', priority: '0.7', changefreq: 'monthly' },
      { url: 'privacy', priority: '0.5', changefreq: 'monthly' },
      { url: 'terms', priority: '0.5', changefreq: 'monthly' },
    ];
    
    console.log('Добавление основных страниц в sitemap...');
    
    // Добавляем основные страницы
    for (const page of mainPages) {
      const url = `${SITE_URL}/${page.url}`;
      xml += '\n' + generateUrlEntry(url, today, page.changefreq, page.priority);
    }
    
    // Получаем все активные города
    console.log('Получение списка городов из базы данных...');
    const cities = await City.findAll({
      where: { isActive: true },
      attributes: ['slug'],
      raw: true
    });
    
    console.log(`Добавление ${cities.length} городов в sitemap...`);
    
    // Добавляем страницы городов
    for (const city of cities) {
      const url = `${SITE_URL}/city/${city.slug}/`;
      xml += '\n' + generateUrlEntry(url, today, 'daily', '0.9');
    }
    
    // Получаем все активные профили
    console.log('Получение списка профилей из базы данных...');
    const profiles = await Profile.findAll({
      where: { status: 'active' },
      attributes: ['id', 'updatedAt'],
      raw: true
    });
    
    console.log(`Добавление ${profiles.length} профилей в sitemap...`);
    
    // Добавляем страницы профилей
    for (const profile of profiles) {
      // Используем дату обновления профиля или текущую дату
      const lastmod = profile.updatedAt ? profile.updatedAt.toISOString().split('T')[0] : today;
      const url = `${SITE_URL}/profile/${profile.id}`;
      xml += '\n' + generateUrlEntry(url, lastmod, 'daily', '0.8');
    }
    
    // Закрываем XML
    xml += '\n</urlset>';
    
    // Записываем файл
    await writeFileAsync(SITEMAP_PATH, xml);
    
    console.log(`✅ sitemap.xml успешно сгенерирован и сохранен в ${SITEMAP_PATH}`);
    console.log(`Добавлено URL: ${mainPages.length} основных страниц, ${cities.length} городов, ${profiles.length} профилей`);
    
  } catch (error) {
    console.error('❌ Произошла ошибка при генерации sitemap.xml:', error);
  } finally {
    // Закрываем соединение с базой данных
    await sequelize.close();
  }
}

// Запускаем генерацию при вызове скрипта
if (require.main === module) {
  generateSitemap().catch(console.error);
}

module.exports = { generateSitemap }; 
const fs = require('fs');
const path = require('path');
const { City } = require('../models');
const { format } = require('date-fns');

// Базовый URL сайта
const BASE_URL = 'https://вашдомен.ru';

// Статические страницы
const staticPages = [
  { url: '/', changefreq: 'weekly', priority: '1.0' },
  { url: '/profiles', changefreq: 'daily', priority: '0.9' },
  { url: '/search', changefreq: 'weekly', priority: '0.8' },
  { url: '/about', changefreq: 'monthly', priority: '0.7' },
  { url: '/contact', changefreq: 'monthly', priority: '0.7' },
  { url: '/terms', changefreq: 'yearly', priority: '0.5' },
  { url: '/privacy', changefreq: 'yearly', priority: '0.5' },
  { url: '/sitemap', changefreq: 'weekly', priority: '0.6' },
];

// Функция для генерации sitemap.xml
async function generateSitemap() {
  try {
    // Получаем все активные города
    const cities = await City.findAll({
      where: {
        isActive: true
      }
    });

    // Текущая дата в формате YYYY-MM-DD
    const currentDate = format(new Date(), 'yyyy-MM-dd');

    // Начало XML файла
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Добавляем статические страницы
    staticPages.forEach(page => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${BASE_URL}${page.url}</loc>\n`;
      sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
      sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${page.priority}</priority>\n`;
      sitemap += '  </url>\n';
    });

    // Добавляем страницы городов
    cities.forEach(city => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${BASE_URL}/city/${city.id}</loc>\n`;
      sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
      sitemap += '    <changefreq>weekly</changefreq>\n';
      sitemap += '    <priority>0.8</priority>\n';
      sitemap += '  </url>\n';
    });

    // Закрываем XML файл
    sitemap += '</urlset>';

    // Путь к файлу sitemap.xml в публичной директории фронтенда
    const sitemapPath = path.join(__dirname, '../../frontend/public/sitemap.xml');

    // Записываем файл
    fs.writeFileSync(sitemapPath, sitemap);

    console.log('Sitemap успешно сгенерирован:', sitemapPath);
  } catch (error) {
    console.error('Ошибка при генерации sitemap:', error);
  }
}

// Запускаем генерацию
generateSitemap(); 
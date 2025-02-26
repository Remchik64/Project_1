/**
 * Утилита для управления SEO-метаданными страниц
 */

/**
 * Устанавливает метаданные для текущей страницы
 * @param {Object} metadata - Объект с метаданными
 * @param {string} metadata.title - Заголовок страницы
 * @param {string} metadata.description - Описание страницы
 * @param {string} metadata.keywords - Ключевые слова
 * @param {string} metadata.canonical - Канонический URL
 * @param {Object} metadata.og - Open Graph метаданные
 */
export const setPageMetadata = (metadata) => {
  // Установка заголовка страницы
  if (metadata.title) {
    document.title = metadata.title;
  }

  // Обновление или создание мета-тегов
  updateMetaTag('description', metadata.description);
  updateMetaTag('keywords', metadata.keywords);
  
  // Обновление канонической ссылки
  updateCanonicalLink(metadata.canonical);
  
  // Обновление Open Graph метаданных
  if (metadata.og) {
    updateMetaTag('og:title', metadata.og.title, 'property');
    updateMetaTag('og:description', metadata.og.description, 'property');
    updateMetaTag('og:type', metadata.og.type || 'website', 'property');
    updateMetaTag('og:url', metadata.og.url || window.location.href, 'property');
    updateMetaTag('og:image', metadata.og.image, 'property');
  }
};

/**
 * Обновляет или создает мета-тег
 * @param {string} name - Имя мета-тега
 * @param {string} content - Содержимое мета-тега
 * @param {string} attributeName - Имя атрибута (name или property)
 */
const updateMetaTag = (name, content, attributeName = 'name') => {
  if (!content) return;
  
  // Ищем существующий мета-тег
  let metaTag = document.querySelector(`meta[${attributeName}="${name}"]`);
  
  if (metaTag) {
    // Обновляем существующий тег
    metaTag.setAttribute('content', content);
  } else {
    // Создаем новый тег
    metaTag = document.createElement('meta');
    metaTag.setAttribute(attributeName, name);
    metaTag.setAttribute('content', content);
    document.head.appendChild(metaTag);
  }
};

/**
 * Обновляет или создает канонический URL
 * @param {string} url - Канонический URL
 */
const updateCanonicalLink = (url) => {
  if (!url) return;
  
  // Ищем существующий канонический тег
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  
  if (canonicalLink) {
    // Обновляем существующий тег
    canonicalLink.setAttribute('href', url);
  } else {
    // Создаем новый тег
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    canonicalLink.setAttribute('href', url);
    document.head.appendChild(canonicalLink);
  }
};

/**
 * Генерирует структурированные данные для страницы в формате JSON-LD
 * @param {Object} data - Данные для структурированной разметки
 */
export const setStructuredData = (data) => {
  if (!data) return;
  
  // Удаляем существующие структурированные данные
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }
  
  // Создаем новый скрипт с данными
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
};

/**
 * Создает структурированные данные для организации
 * @returns {Object} Структурированные данные организации
 */
export const createOrganizationStructuredData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Сервис знакомств',
    'url': 'https://вашдомен.ru',
    'logo': 'https://вашдомен.ru/logo.png',
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': '+7-999-999-9999',
      'contactType': 'customer service',
      'availableLanguage': ['Russian']
    },
    'sameAs': [
      'https://vk.com/вашгруппа',
      'https://t.me/вашканал'
    ]
  };
};

/**
 * Создает структурированные данные для страницы города
 * @param {Object} city - Данные города
 * @returns {Object} Структурированные данные города
 */
export const createCityStructuredData = (city) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    'name': `Знакомства в городе ${city.name}`,
    'description': `Анкеты и знакомства в городе ${city.name}`,
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': city.name,
      'addressCountry': 'RU'
    }
  };
};
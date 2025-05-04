const axios = require('axios');
const config = require('../config/config');

// Константы для сервиса IndexNow из конфигурационного файла
const INDEXNOW_KEY = config.indexNow.key;
const INDEXNOW_ENDPOINT = config.indexNow.endpoint;
const SITE_URL = config.indexNow.siteUrl;

/**
 * Отправляет уведомление в Яндекс через протокол IndexNow
 * @param {string} url - URL страницы, которая была изменена
 * @param {string} type - Тип изменения: 'add', 'update', 'delete'
 * @returns {Promise} - Результат отправки уведомления
 */
const sendIndexNowNotification = async (url, type = 'update') => {
    try {
        console.log(`[IndexNow] Отправка уведомления о ${type} для URL: ${url}`);
        
        // Проверяем, что URL имеет корректный формат
        if (!url.startsWith(SITE_URL)) {
            url = `${SITE_URL}${url}`;
        }
        
        // Формируем параметры запроса для IndexNow
        const params = {
            url: url,
            key: INDEXNOW_KEY,
            keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`
        };
        
        // Логируем запрос для отладки
        console.log('[IndexNow] Отправка запроса:', params);
        
        // Отправляем запрос на сервер IndexNow
        const response = await axios.get(INDEXNOW_ENDPOINT, { params });
        
        console.log('[IndexNow] Ответ сервера:', response.status, response.data);
        return response.data;
    } catch (error) {
        console.error('[IndexNow] Ошибка при отправке уведомления:', error.message);
        if (error.response) {
            console.error('[IndexNow] Детали ответа:', {
                status: error.response.status,
                data: error.response.data
            });
        }
        // Не выбрасываем ошибку, чтобы не прерывать основной процесс
        return null;
    }
};

/**
 * Отправляет уведомление о новом профиле
 * @param {number} profileId - ID профиля
 */
const notifyNewProfile = async (profileId) => {
    const url = `/profiles/${profileId}`;
    return sendIndexNowNotification(url, 'add');
};

/**
 * Отправляет уведомление об обновлении профиля
 * @param {number} profileId - ID профиля
 */
const notifyProfileUpdate = async (profileId) => {
    const url = `/profiles/${profileId}`;
    return sendIndexNowNotification(url, 'update');
};

/**
 * Отправляет уведомление об удалении профиля
 * @param {number} profileId - ID профиля
 */
const notifyProfileDeletion = async (profileId) => {
    const url = `/profiles/${profileId}`;
    return sendIndexNowNotification(url, 'delete');
};

/**
 * Отправляет пакетное уведомление для нескольких URL
 * @param {Array<string>} urls - Массив URL, которые были изменены
 * @returns {Promise} - Результат отправки уведомления
 */
const sendBatchNotification = async (urls) => {
    try {
        if (!Array.isArray(urls) || urls.length === 0) {
            console.warn('[IndexNow] Пустой массив URL для пакетного уведомления');
            return null;
        }
        
        // Ограничиваем количество URL в одном запросе (по спецификации до 10,000)
        const maxUrls = 50;
        if (urls.length > maxUrls) {
            console.warn(`[IndexNow] Слишком много URL (${urls.length}), ограничиваем до ${maxUrls}`);
            urls = urls.slice(0, maxUrls);
        }
        
        // Преобразуем все URL в полный формат
        const fullUrls = urls.map(url => {
            if (!url.startsWith(SITE_URL)) {
                return `${SITE_URL}${url}`;
            }
            return url;
        });
        
        // Формируем тело запроса для пакетного обновления
        const requestBody = {
            host: new URL(SITE_URL).hostname,
            key: INDEXNOW_KEY,
            keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
            urlList: fullUrls
        };
        
        console.log('[IndexNow] Отправка пакетного уведомления для', urls.length, 'URL');
        
        // Отправляем POST запрос для пакетного обновления
        const response = await axios.post(INDEXNOW_ENDPOINT, requestBody);
        
        console.log('[IndexNow] Ответ сервера на пакетное уведомление:', response.status, response.data);
        return response.data;
    } catch (error) {
        console.error('[IndexNow] Ошибка при отправке пакетного уведомления:', error.message);
        if (error.response) {
            console.error('[IndexNow] Детали ответа:', {
                status: error.response.status,
                data: error.response.data
            });
        }
        return null;
    }
};

module.exports = {
    sendIndexNowNotification,
    notifyNewProfile,
    notifyProfileUpdate,
    notifyProfileDeletion,
    sendBatchNotification
}; 
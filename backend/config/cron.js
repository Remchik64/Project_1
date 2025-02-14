const cron = require('node-cron');
const updateGeoDatabases = require('../scripts/updateGeoDatabases');

// Обновление баз данных геолокации каждый первый день месяца в 3 часа ночи
cron.schedule('0 3 1 * *', async () => {
    console.log('Запуск планового обновления баз данных геолокации');
    try {
        await updateGeoDatabases();
        console.log('Плановое обновление баз данных геолокации завершено успешно');
    } catch (error) {
        console.error('Ошибка при плановом обновлении баз данных:', error);
    }
}); 
#!/usr/bin/env node

/**
 * Скрипт для отправки всех активных профилей в IndexNow
 * Запуск: node scripts/indexNowSubmit.js
 */

require('dotenv').config();
const { Profile } = require('../models');
const indexNowService = require('../services/indexNowService');

// Функция для получения всех активных профилей из базы данных
async function getAllActiveProfiles() {
    try {
        const profiles = await Profile.findAll({
            where: { status: 'active' },
            attributes: ['id'],
            raw: true
        });
        return profiles;
    } catch (error) {
        console.error('Ошибка при получении профилей:', error);
        return [];
    }
}

// Основная функция скрипта
async function main() {
    console.log('Запуск процесса отправки всех активных профилей в IndexNow');
    
    try {
        // Получаем все активные профили
        const profiles = await getAllActiveProfiles();
        console.log(`Найдено ${profiles.length} активных профилей`);
        
        if (profiles.length === 0) {
            console.log('Нет активных профилей для отправки');
            return;
        }
        
        // Формируем массив URL для отправки
        const urls = profiles.map(profile => `/profiles/${profile.id}`);
        
        // Разбиваем на пакеты по 50 URL (рекомендуемое ограничение для пакетной отправки)
        const batchSize = 50;
        const batches = [];
        
        for (let i = 0; i < urls.length; i += batchSize) {
            batches.push(urls.slice(i, i + batchSize));
        }
        
        console.log(`Разбито на ${batches.length} пакетов по ${batchSize} URL`);
        
        // Отправляем каждый пакет URL с интервалом
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            console.log(`Отправка пакета ${i + 1}/${batches.length} с ${batch.length} URL`);
            
            try {
                const result = await indexNowService.sendBatchNotification(batch);
                console.log(`Результат отправки пакета ${i + 1}:`, result);
                
                // Ждем перед отправкой следующего пакета, чтобы не перегружать API
                if (i < batches.length - 1) {
                    console.log('Ожидание 2 секунды перед отправкой следующего пакета...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            } catch (error) {
                console.error(`Ошибка при отправке пакета ${i + 1}:`, error);
            }
        }
        
        console.log('Процесс отправки всех активных профилей в IndexNow завершен');
    } catch (error) {
        console.error('Произошла ошибка:', error);
        process.exit(1);
    }
}

// Запускаем основную функцию
main()
    .then(() => {
        console.log('Скрипт успешно завершен');
        process.exit(0);
    })
    .catch(error => {
        console.error('Ошибка выполнения скрипта:', error);
        process.exit(1);
    }); 
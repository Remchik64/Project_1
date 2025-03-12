#!/bin/bash

# Скрипт для обновления проекта на сервере

# Переход в директорию проекта
cd /var/www/dating-site

# Получение последних изменений
echo "Получение последних изменений из репозитория..."
git pull

# Установка зависимостей
echo "Установка зависимостей..."
npm run install-all

# Сборка frontend
echo "Сборка frontend..."
npm run build

# Создание директории для логов, если она не существует
mkdir -p logs

# Перезапуск backend
echo "Перезапуск backend..."
pm2 restart dating-site-backend

# Сохранение конфигурации PM2
echo "Сохранение конфигурации PM2..."
pm2 save

echo "Обновление завершено успешно!" 
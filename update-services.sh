#!/bin/bash

# Скрипт для ручного обновления и перезапуска сервисов после обновления кода
# Сохраните этот файл на сервере и выполните chmod +x update-services.sh

# Настройка логирования
exec > >(tee -a /var/log/manual-update.log) 2>&1
echo "========================================================================"
echo "Запуск ручного обновления сервисов: $(date)"
echo "========================================================================"

# Функция для проверки успешности выполнения команд
check_success() {
    if [ $? -ne 0 ]; then
        echo "ОШИБКА: $1"
        exit 1
    else
        echo "УСПЕШНО: $1"
    fi
}

# Проверяем права администратора
if [ "$(id -u)" -ne 0 ]; then
    echo "Этот скрипт должен быть запущен с правами администратора (root)"
    exit 1
fi

# Определение путей
REPO_DIR="/opt/repo"
FRONTEND_DIR="$REPO_DIR/frontend"
BACKEND_DIR="$REPO_DIR/backend"
NGINX_SITE_DIR="/var/www/html/site"
API_DIR="/opt/api"

# 1. Перезапуск PM2 для backend
echo "Перезапуск backend через PM2..."
pm2 restart all
check_success "Перезапуск PM2 для backend"

# 2. Перекопирование frontend из репозитория в директорию Nginx
echo "Копирование frontend файлов..."
if [ -d "$FRONTEND_DIR/build" ]; then
    echo "Найдена директория build, копируем фронтенд..."
    cp -r $FRONTEND_DIR/build/* $NGINX_SITE_DIR/
    check_success "Копирование frontend файлов из $FRONTEND_DIR/build в $NGINX_SITE_DIR"
else
    echo "ВНИМАНИЕ: Директория build не найдена в $FRONTEND_DIR"
fi

# 3. Перезапуск Nginx
echo "Перезапуск Nginx..."
systemctl restart nginx
check_success "Перезапуск Nginx"

# 4. Проверка статуса сервисов
echo "Статус PM2:"
pm2 status
echo ""

echo "Статус Nginx:"
systemctl status nginx --no-pager
echo ""

echo "========================================================================"
echo "Обновление и перезапуск сервисов завершены: $(date)"
echo "========================================================================" 
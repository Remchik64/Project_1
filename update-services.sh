#!/bin/bash

# Скрипт для ручного обновления и перезапуска сервисов после обновления кода
# Сохраните этот файл на сервере и выполните chmod +x update-services.sh
#
# Для изменения пароля администратора при обновлении, используйте:
# ./update-services.sh --change-password "новый_пароль"
#
# ВАЖНО: Изменение пароля администратора через API отключено в production среде.
# Используйте только CLI команды для смены пароля:
#   1. Через этот скрипт: ./update-services.sh --change-password "новый_пароль"
#   2. Напрямую через CLI: NODE_ENV=production node backend/scripts/change-admin-password.js "новый_пароль"
#   3. Через npm: cd backend && NODE_ENV=production npm run admin:change-password

# Настройка логирования
exec > >(tee -a /var/log/manual-update.log) 2>&1
echo "========================================================================"
echo "Запуск ручного обновления сервисов: $(date)"
echo "========================================================================"

# Проверка аргументов для изменения пароля
CHANGE_PASSWORD=false
ADMIN_PASSWORD=""

# Обработка аргументов
while [[ $# -gt 0 ]]; do
  case $1 in
    --change-password)
      CHANGE_PASSWORD=true
      ADMIN_PASSWORD="$2"
      # Удаляем пароль из лога, заменяя его на звездочки
      echo "Обнаружен параметр для изменения пароля администратора"
      shift 2
      ;;
    *)
      echo "Неизвестный параметр: $1"
      shift
      ;;
  esac
done

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

# 0. Изменение пароля администратора (если задан параметр)
if [ "$CHANGE_PASSWORD" = true ]; then
    echo "Изменение пароля администратора..."
    cd $BACKEND_DIR && NODE_ENV=production node scripts/change-admin-password.js "$ADMIN_PASSWORD"
    check_success "Изменение пароля администратора"
fi

# 1. Проверка состояния сервера
echo "Проверка состояния сервера..."
cd $BACKEND_DIR && NODE_ENV=production node scripts/server-status.js check
check_success "Проверка состояния сервера"

# 2. Проверка и освобождение порта при необходимости
echo "Проверка доступности порта..."
cd $BACKEND_DIR && NODE_ENV=production node scripts/free-port.js
check_success "Проверка доступности порта"

# 3. Перезапуск PM2 для backend
echo "Перезапуск backend через PM2..."
cd $BACKEND_DIR && NODE_ENV=production node scripts/server-status.js restart
check_success "Перезапуск PM2 для backend"

# 4. Выполнение миграций базы данных
echo "Выполнение миграций базы данных..."
cd $BACKEND_DIR && node scripts/runMigrations.js
check_success "Выполнение миграций базы данных"

# 5. Перекопирование frontend из репозитория в директорию Nginx
echo "Копирование frontend файлов..."
if [ -d "$FRONTEND_DIR/build" ]; then
    echo "Найдена директория build, копируем фронтенд..."
    cp -r $FRONTEND_DIR/build/* $NGINX_SITE_DIR/
    check_success "Копирование frontend файлов из $FRONTEND_DIR/build в $NGINX_SITE_DIR"
else
    echo "ВНИМАНИЕ: Директория build не найдена в $FRONTEND_DIR"
fi

# 6. Перезапуск Nginx
echo "Перезапуск Nginx..."
systemctl restart nginx
check_success "Перезапуск Nginx"

# 7. Проверка статуса сервисов
echo "Статус PM2:"
pm2 status
echo ""

echo "Статус Nginx:"
systemctl status nginx --no-pager
echo ""

# 8. Финальная проверка доступности сервера
echo "Финальная проверка доступности сервера..."
cd $BACKEND_DIR && NODE_ENV=production node scripts/server-status.js check
check_success "Финальная проверка доступности сервера"

echo "========================================================================"
echo "Обновление и перезапуск сервисов завершены: $(date)"
echo "========================================================================" 
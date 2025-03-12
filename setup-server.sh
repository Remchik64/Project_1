#!/bin/bash

# Скрипт для первоначальной настройки сервера

# Проверка прав суперпользователя
if [ "$(id -u)" != "0" ]; then
   echo "Этот скрипт должен быть запущен с правами суперпользователя (sudo)" 
   exit 1
fi

# Обновление системы
echo "Обновление системы..."
apt update
apt upgrade -y

# Установка необходимых пакетов
echo "Установка необходимых пакетов..."
apt install -y curl git build-essential nginx certbot python3-certbot-nginx

# Установка Node.js
echo "Установка Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Проверка версий
echo "Проверка версий..."
node -v
npm -v

# Установка PM2
echo "Установка PM2..."
npm install -g pm2

# Настройка автозапуска PM2
echo "Настройка автозапуска PM2..."
pm2 startup

# Создание директории для проекта
echo "Создание директории для проекта..."
mkdir -p /var/www
cd /var/www

# Клонирование репозитория (замените URL на ваш)
echo "Клонирование репозитория..."
git clone https://github.com/yourusername/dating-site.git
cd dating-site

# Установка зависимостей
echo "Установка зависимостей..."
npm run install-all

# Создание директорий для логов
echo "Создание директорий для логов..."
mkdir -p logs
mkdir -p /var/backups/dating-site

# Настройка прав доступа
echo "Настройка прав доступа..."
chown -R www-data:www-data /var/www/dating-site
chmod -R 755 /var/www/dating-site

# Копирование конфигурации Nginx
echo "Копирование конфигурации Nginx..."
cp nginx-config.conf /etc/nginx/sites-available/dating-site
ln -s /etc/nginx/sites-available/dating-site /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Сборка frontend
echo "Сборка frontend..."
npm run build

# Создание/проверка администратора
echo "Проверка/создание администратора..."
cd backend
npm run create-admin
cd ..

# Запуск backend через PM2
echo "Запуск backend через PM2..."
pm2 start ecosystem.config.js
pm2 save

# Настройка прав доступа для скриптов
echo "Настройка прав доступа для скриптов..."
chmod +x update.sh
chmod +x backup.sh

# Настройка cron для резервного копирования
echo "Настройка cron для резервного копирования..."
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/dating-site/backup.sh >> /var/log/dating-site-backup.log 2>&1") | crontab -

echo "Настройка сервера завершена успешно!"
echo "Теперь вы можете получить SSL-сертификат с помощью команды:"
echo "sudo certbot --nginx -d example.com -d www.example.com" 
#!/bin/bash

# Скрипт для восстановления доступа к изображениям на сайте

# Проверяем конфигурацию Nginx
echo "====== Проверка и исправление конфигурации Nginx ======"

# Обновляем конфигурацию Nginx, добавляя явный блок для обработки загрузок
cat > /etc/nginx/sites-available/escort-bar.live << 'EOL'
server {
    server_name escort-bar.live www.escort-bar.live;
    root /var/www/html/site;
    
    # Обработка 404 ошибок
    error_page 404 /404.html;
    
    # Статические файлы
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        try_files $uri =404;
        expires max;
    }
    
    # Обрабатываем прямые запросы к изображениям
    location /uploads/ {
        alias /opt/repo/backend/uploads/;
        try_files $uri =404;
        expires max;
    }
    
    # Обрабатываем запросы через API к изображениям (для совместимости)
    location /api/uploads/ {
        alias /opt/repo/backend/uploads/;
        try_files $uri =404;
        expires max;
    }
    
    # Специальный файл для Yandex Webmaster
    location = /yandex_b6f2f6a9266f10b2.html {
        try_files $uri =404;
    }
    
    # API маршруты
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_intercept_errors on;
    }

    # Явно заданные страницы для поисковых систем возвращают 404
    location ~ ^/(nonexistent|notfound|unknown|404)/ {
        return 404;
    }

    # Страница 404
    location = /404.html {
        internal;
    }

    # Маршрут по умолчанию - одностраничное приложение
    location / {
        try_files $uri $uri/ /index.html;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/escort-bar.live/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/escort-bar.live/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    listen 80;
    server_name escort-bar.live www.escort-bar.live;
    
    # Перенаправление всех HTTP запросов на HTTPS
    return 301 https://$host$request_uri;
}
EOL

# Проверка синтаксиса Nginx
echo "Проверка синтаксиса Nginx..."
nginx -t

# Если синтаксис в порядке, перезагружаем Nginx
if [ $? -eq 0 ]; then
    echo "Синтаксис корректный. Перезагрузка Nginx..."
    systemctl reload nginx
    echo "Nginx успешно перезагружен."
else
    echo "Ошибка в синтаксисе конфигурации Nginx. Исправления не применены."
    exit 1
fi

# Проверка прав доступа к директории uploads
echo "====== Проверка прав доступа к директории uploads ======"
echo "Текущие права доступа:"
ls -la /opt/repo/backend/uploads/

# Устанавливаем правильные права доступа
echo "Устанавливаем правильные права доступа..."
chmod -R 755 /opt/repo/backend/uploads/
chown -R www-data:www-data /opt/repo/backend/uploads/

echo "Обновленные права доступа:"
ls -la /opt/repo/backend/uploads/

# Перезапускаем бэкенд-приложение
echo "====== Перезапуск backend-приложения ======"
cd /opt/repo
echo "Текущие процессы PM2:"
pm2 list

echo "Перезапускаем приложение..."
pm2 restart all

echo "Статус после перезапуска:"
pm2 list

# Проверка доступности изображений
echo "====== Проверка доступности изображений ======"
echo "Список доступных изображений (первые 10):"
find /opt/repo/backend/uploads -type f -name "*.jpg" -o -name "*.png" -o -name "*.jpeg" | head -n 10

# Дополнительная информация
echo "====== Завершение ======"
echo "Исправления применены. Проверьте работу сайта."
echo "Если изображения всё ещё не отображаются, выполните очистку кэша браузера."
echo "URL для доступа к изображениям теперь должен быть: https://escort-bar.live/uploads/[имя_файла]" 
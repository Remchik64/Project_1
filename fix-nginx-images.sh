#!/bin/bash

# Скрипт для исправления проблемы с изображениями в Nginx

# Создаем резервную копию текущей конфигурации
BACKUP_FILE="/etc/nginx/sites-enabled/escort-bar.live.bak.$(date +%Y%m%d_%H%M%S)"
echo "Создание резервной копии текущей конфигурации в $BACKUP_FILE"
cp /etc/nginx/sites-enabled/escort-bar.live "$BACKUP_FILE"

# Устанавливаем новую конфигурацию
echo "Установка новой конфигурации Nginx..."
cat > /etc/nginx/sites-enabled/escort-bar.live << 'EOF'
server {
    listen 80;
    server_name escort-bar.live www.escort-bar.live;

    # Перенаправление на HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name escort-bar.live www.escort-bar.live;

    # SSL настройки
    ssl_certificate /etc/letsencrypt/live/escort-bar.live/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/escort-bar.live/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;

    # Корневая директория статических файлов фронтенда
    root /var/www/html/site;
    index index.html;

    # Обработка основных запросов к фронтенд-приложению
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Прямая обработка запросов к изображениям в /uploads/*
    location /uploads/ {
        alias /opt/api/uploads/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        try_files $uri =404;
    }

    # Прямая обработка запросов к изображениям в /api/uploads/*
    location /api/uploads/ {
        alias /opt/api/uploads/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        try_files $uri =404;
    }

    # Проксирование остальных API-запросов на бэкенд
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Обработка ошибок
    error_page 404 /404.html;
    location = /404.html {
        root /var/www/html/site;
        internal;
    }
}
EOF

# Проверяем конфигурацию Nginx
echo "Проверка синтаксиса Nginx..."
nginx -t

# Если конфигурация корректна, перезапускаем Nginx
if [ $? -eq 0 ]; then
    echo "Перезапуск Nginx..."
    systemctl reload nginx
    echo "Nginx успешно перезапущен!"
    echo "Проверьте загрузку изображений на сайте."
    echo "В случае проблем, можно восстановить предыдущую конфигурацию:"
    echo "cp \"$BACKUP_FILE\" /etc/nginx/sites-enabled/escort-bar.live && systemctl reload nginx"
else
    echo "ОШИБКА: Некорректная конфигурация Nginx. Изменения не применены."
    echo "Используйте предыдущую конфигурацию:"
    echo "cp \"$BACKUP_FILE\" /etc/nginx/sites-enabled/escort-bar.live"
fi 
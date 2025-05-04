#!/bin/bash

# Скрипт для исправления путей доступа к изображениям
# Проблема: изображения запрашиваются по URL /api/uploads/*, но возвращают 404

echo "====== Исправление проблемы с загрузкой изображений ======"

# Создаем бэкап текущей конфигурации Nginx
BACKUP_TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
NGINX_CONFIG_FILE="/etc/nginx/sites-enabled/escort-bar.live"
NGINX_BACKUP_FILE="${NGINX_CONFIG_FILE}.bak.${BACKUP_TIMESTAMP}"

echo "Создание резервной копии конфигурации Nginx..."
cp $NGINX_CONFIG_FILE $NGINX_BACKUP_FILE
echo "Резервная копия создана: $NGINX_BACKUP_FILE"

# Обновляем конфигурацию Nginx для корректной обработки маршрута /api/uploads/
echo "Обновление конфигурации Nginx..."

cat > /tmp/nginx_fix_images.conf << 'EOF'
server {
    listen 80;
    server_name escort-bar.live www.escort-bar.live;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name escort-bar.live www.escort-bar.live;

    ssl_certificate /etc/letsencrypt/live/escort-bar.live/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/escort-bar.live/privkey.pem;

    # Настройки SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Настройки безопасности
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-XSS-Protection "1; mode=block";

    # Корневая директория статических файлов фронтенда
    root /var/www/html/site;
    index index.html;

    # Обработка основных запросов к фронтенд-приложению
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Прямая обработка запросов к изображениям в /uploads/*
    location /uploads/ {
        alias /opt/repo/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        try_files $uri =404;
    }

    # Прямая обработка запросов к изображениям в /api/uploads/*
    location /api/uploads/ {
        alias /opt/repo/backend/uploads/;
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
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Специальная обработка для 404 ошибок
    error_page 404 /404.html;
    location = /404.html {
        root /var/www/html/site;
        internal;
    }
}
EOF

# Применяем новую конфигурацию
echo "Применение новой конфигурации Nginx..."
cp /tmp/nginx_fix_images.conf $NGINX_CONFIG_FILE

# Проверка синтаксиса Nginx
echo "Проверка синтаксиса Nginx..."
nginx -t

if [ $? -eq 0 ]; then
    echo "Синтаксис корректный. Перезагрузка Nginx..."
    systemctl reload nginx
    echo "Nginx перезагружен."
    
    # Проверяем доступность изображений
    echo "====== Проверка доступа к изображениям ======"
    echo "Ожидание обновления конфигурации (3 секунды)..."
    sleep 3
    
    # Проверяем /api/uploads/ маршрут
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://escort-bar.live/api/uploads/bg-1743445422460-945339337.jpg)
    if [ $HTTP_CODE -eq 200 ]; then
        echo "✅ Маршрут /api/uploads/ работает корректно (HTTP $HTTP_CODE)"
    else
        echo "❌ Маршрут /api/uploads/ не работает (HTTP $HTTP_CODE)"
    fi
    
    # Проверяем /uploads/ маршрут
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://escort-bar.live/uploads/bg-1743445422460-945339337.jpg)
    if [ $HTTP_CODE -eq 200 ]; then
        echo "✅ Маршрут /uploads/ работает корректно (HTTP $HTTP_CODE)"
    else
        echo "❌ Маршрут /uploads/ не работает (HTTP $HTTP_CODE)"
    fi
    
    echo "====== Завершение ======"
    echo "Исправления применены. Проверьте работу сайта."
    echo "Если изображения всё ещё не отображаются, выполните очистку кэша браузера."
    echo "Если вам нужно восстановить предыдущую конфигурацию, используйте команду:"
    echo "   cp ${NGINX_BACKUP_FILE} ${NGINX_CONFIG_FILE} && systemctl reload nginx"
else
    echo "ОШИБКА: Неверный синтаксис конфигурации Nginx. Восстановление предыдущей конфигурации..."
    cp $NGINX_BACKUP_FILE $NGINX_CONFIG_FILE
    echo "Предыдущая конфигурация восстановлена."
fi 
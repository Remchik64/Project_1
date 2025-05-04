#!/bin/bash

# Скрипт для исправления дублирующихся блоков server в конфигурации Nginx

# Создаем резервную копию текущего файла конфигурации
echo "Создаем резервную копию текущей конфигурации..."
BACKUP_FILE="/etc/nginx/sites-enabled/escort-bar.live.bak.$(date +%Y%m%d_%H%M%S)"
cp /etc/nginx/sites-enabled/escort-bar.live "$BACKUP_FILE"
echo "Резервная копия создана: $BACKUP_FILE"

# Создаем новый, чистый файл конфигурации
echo "Создаем новый файл конфигурации..."
cat > /etc/nginx/sites-enabled/escort-bar.live << 'EOL'
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

echo "Новый файл конфигурации создан."

# Проверяем синтаксис новой конфигурации
echo "Проверяем синтаксис новой конфигурации..."
nginx -t

# Если синтаксис правильный, перезагружаем Nginx
if [ $? -eq 0 ]; then
    echo "Синтаксис правильный. Перезагружаем Nginx..."
    systemctl reload nginx
    echo "Nginx перезагружен."
    
    # Удаляем старые файлы резервных копий, оставляем только последние 3
    echo "Очищаем старые резервные копии (оставляем последние 3)..."
    ls -t /etc/nginx/sites-enabled/escort-bar.live.bak.* | tail -n +4 | xargs rm -f
    echo "Очистка завершена."
else
    echo "Ошибка в синтаксисе конфигурации. Возвращаем предыдущую конфигурацию..."
    cp "$BACKUP_FILE" /etc/nginx/sites-enabled/escort-bar.live
    echo "Предыдущая конфигурация восстановлена."
    exit 1
fi

echo "Готово! Конфигурация Nginx обновлена и перезагружена." 
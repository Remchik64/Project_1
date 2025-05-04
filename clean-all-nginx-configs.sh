#!/bin/bash

# Скрипт для удаления всех дублирующихся конфигураций Nginx
# и создания одной чистой конфигурации

# Сохраняем дату для имени резервной копии
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)

# Создаем директорию для резервных копий если её нет
BACKUP_DIR="/etc/nginx/sites-available/backups"
mkdir -p "$BACKUP_DIR"

echo "====== Начало очистки конфигурации Nginx ======"
echo "Создание резервных копий всех текущих конфигураций..."

# Копируем все конфигурации в директорию резервных копий
cp /etc/nginx/sites-enabled/* "$BACKUP_DIR/"
cp /etc/nginx/sites-available/* "$BACKUP_DIR/" 2>/dev/null

echo "Резервные копии созданы в директории $BACKUP_DIR"

# Удаляем все текущие конфигурации из sites-enabled
echo "Удаление всех текущих конфигураций из sites-enabled..."
rm -f /etc/nginx/sites-enabled/*

echo "Создаем новую, чистую конфигурацию..."
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

echo "Создание символической ссылки для новой конфигурации..."
ln -s /etc/nginx/sites-available/escort-bar.live /etc/nginx/sites-enabled/

echo "Проверка синтаксиса новой конфигурации..."
nginx -t

if [ $? -eq 0 ]; then
    echo "Синтаксис правильный. Перезагрузка Nginx..."
    systemctl reload nginx
    echo "Nginx перезагружен."
    
    echo "Повторная проверка на наличие предупреждений..."
    WARNINGS=$(nginx -t 2>&1 | grep -c "conflicting server name")
    
    if [ $WARNINGS -eq 0 ]; then
        echo "Отлично! Предупреждения о конфликтующих именах серверов устранены."
    else
        echo "Внимание: Предупреждения всё еще присутствуют. Может потребоваться дополнительная настройка."
    fi
else
    echo "Ошибка в синтаксисе новой конфигурации."
    echo "Восстановление предыдущей конфигурации из резервной копии..."
    cp "$BACKUP_DIR/escort-bar.live" /etc/nginx/sites-available/
    ln -s /etc/nginx/sites-available/escort-bar.live /etc/nginx/sites-enabled/
    systemctl reload nginx
    echo "Предыдущая конфигурация восстановлена."
    exit 1
fi

echo "====== Очистка конфигурации Nginx завершена ======" 
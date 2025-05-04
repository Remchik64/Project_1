#!/bin/bash

# fix-404-errors.sh - Скрипт для настройки правильной обработки 404 ошибок
# Автор: Claude
# Дата создания: 2023-05-15

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Настройка правильной обработки 404 ошибок для сайта escort-bar.live${NC}"
echo

# Функция для проверки наличия файла
check_file_exists() {
  if [ ! -f "$1" ]; then
    echo -e "${RED}Ошибка: Файл $1 не найден!${NC}"
    exit 1
  fi
}

# 1. Создаем файл 404.html
echo -e "${GREEN}1. Создание кастомной страницы 404.html${NC}"
cat > /tmp/404.html << 'EOF'
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex">
    <title>404 - Страница не найдена | Escort Bar</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background: #121212;
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .not-found-container {
            text-align: center;
            max-width: 600px;
            padding: 40px;
            background: rgba(26, 26, 26, 0.9);
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        h1 {
            font-size: 120px;
            margin: 0;
            color: #e91e63;
            line-height: 1;
        }
        h2 {
            font-size: 30px;
            margin: 0 0 20px 0;
        }
        p {
            margin-bottom: 30px;
            color: #ccc;
            font-size: 18px;
        }
        a {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #e91e63, #9c27b0);
            color: white;
            text-decoration: none;
            border-radius: 30px;
            font-weight: 600;
            transition: all 0.3s;
        }
        a:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
        }
    </style>
</head>
<body>
    <div class="not-found-container">
        <h1>404</h1>
        <h2>Страница не найдена</h2>
        <p>Извините, но запрашиваемая вами страница не существует.</p>
        <a href="/">Вернуться на главную</a>
    </div>
</body>
</html>
EOF

echo -e "${GREEN}Копирование 404.html в директорию сайта...${NC}"
echo "sudo cp /tmp/404.html /var/www/html/site/"
echo

# 2. Обновляем конфигурацию Nginx для HTTP
echo -e "${GREEN}2. Обновление конфигурации Nginx для HTTP...${NC}"
# Создаем временный файл конфигурации
cat > /tmp/nginx-http.conf << 'EOF'
server {
    server_name escort-bar.live www.escort-bar.live;
    root /var/www/html/site;
    index index.html;

    # Обработка проверочного файла для Яндекс.Вебмастер
    location = /b6f2f6a9266f10b2.html {
        try_files $uri =404;
    }
    
    # Настройка кастомной страницы 404
    error_page 404 /404.html;
    location = /404.html {
        root /var/www/html/site;
        internal;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_ssl_verify off;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # Обработка 404 для API
        proxy_intercept_errors on;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    listen 80;
    
    # Редирект на HTTPS
    return 301 https://$host$request_uri;
}
EOF

echo -e "${GREEN}Замена HTTP конфигурации Nginx...${NC}"
echo "sudo cp /tmp/nginx-http.conf /etc/nginx/sites-available/escort-bar.live-http"
echo "sudo ln -sf /etc/nginx/sites-available/escort-bar.live-http /etc/nginx/sites-enabled/"
echo

# 3. Обновляем конфигурацию Nginx для HTTPS
echo -e "${GREEN}3. Обновление конфигурации Nginx для HTTPS...${NC}"
# Создаем временный файл конфигурации
cat > /tmp/nginx-https.conf << 'EOF'
server {
    server_name escort-bar.live www.escort-bar.live;
    root /var/www/html/site;
    index index.html;

    # Обработка проверочного файла для Яндекс.Вебмастер
    location = /b6f2f6a9266f10b2.html {
        try_files $uri =404;
    }
    
    # Настройка кастомной страницы 404
    error_page 404 /404.html;
    location = /404.html {
        root /var/www/html/site;
        internal;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_ssl_verify off;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # Обработка 404 для API
        proxy_intercept_errors on;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/escort-bar.live/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/escort-bar.live/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}
EOF

echo -e "${GREEN}Замена HTTPS конфигурации Nginx...${NC}"
echo "sudo cp /tmp/nginx-https.conf /etc/nginx/sites-available/escort-bar.live-https"
echo "sudo ln -sf /etc/nginx/sites-available/escort-bar.live-https /etc/nginx/sites-enabled/"
echo

# 4. Проверяем конфигурацию и перезапускаем Nginx
echo -e "${GREEN}4. Проверка конфигурации и перезапуск Nginx...${NC}"
echo "sudo nginx -t"
echo "sudo systemctl reload nginx"
echo

# 5. Проверка обработки 404 ошибок
echo -e "${GREEN}5. Проверка обработки 404 ошибок...${NC}"
echo "curl -I https://escort-bar.live/nonexistent-page"
echo

echo -e "${YELLOW}Инструкции по установке:${NC}"
echo "1. Скопируйте этот скрипт на сервер"
echo "2. Сделайте его исполняемым: chmod +x fix-404-errors.sh"
echo "3. Запустите его с правами sudo: sudo ./fix-404-errors.sh"
echo
echo -e "${YELLOW}ВАЖНО:${NC}"
echo "После выполнения скрипта проверьте в Яндекс.Вебмастер, устранены ли ошибки с отсутствующими страницами."
echo "Для проверки может потребоваться некоторое время, пока Яндекс переиндексирует ваш сайт." 
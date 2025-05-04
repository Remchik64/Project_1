#!/bin/bash

# Скрипт для обновления robots.txt на сервере

# Создаем временный файл robots.txt
cat > temp-robots.txt << 'EOL'
# Allow all web crawlers
User-agent: *
Allow: /

# Sitemap location
Sitemap: https://escort-bar.live/sitemap.xml

# Disallow admin routes
Disallow: /admin/
Disallow: /login
Disallow: /register
Disallow: /cabinet
EOL

echo "Создан временный файл robots.txt"

# Загружаем файл на сервер
echo "Загружаем robots.txt на сервер..."
scp temp-robots.txt root@185.255.120.50:/var/www/html/site/robots.txt

# Проверяем, что файл успешно загружен
echo "Проверяем файл на сервере..."
ssh root@185.255.120.50 "cat /var/www/html/site/robots.txt"

# Удаляем временный файл
echo "Удаляем временный файл..."
rm temp-robots.txt

echo "Готово! Файл robots.txt успешно обновлен на сервере." 
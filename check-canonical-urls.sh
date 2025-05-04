#!/bin/bash

# Скрипт для проверки канонических URL на сервере

echo "Начинаем проверку канонических URL на сервере..."

# Проверка канонических URL в index.html
echo "Проверяем canonical в index.html..."
ssh root@185.255.120.50 "grep -i 'canonical' /var/www/html/site/index.html"

# Проверка robots.txt
echo "Проверяем robots.txt..."
ssh root@185.255.120.50 "cat /var/www/html/site/robots.txt | grep 'Sitemap'"

# Проверка заголовка Link в HTTP-ответе
echo "Проверяем HTTP-заголовки..."
echo "Команда для проверки заголовков (выполните локально):"
echo "curl -I https://escort-bar.live"

# Проверка на наличие старых доменов
echo "Проверяем наличие старых доменов в файлах..."
ssh root@185.255.120.50 "grep -r 'вашдомен\.ru\|xn--80adhe8ahe2f' /var/www/html/site/ --include='*.html' --include='*.js' --include='*.json' --include='*.txt'"

echo "Проверка завершена!"
echo "Если в выводе выше есть ссылки на старые домены, их необходимо исправить с помощью скриптов из этого пакета." 
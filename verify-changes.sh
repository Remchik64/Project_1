#!/bin/bash

# Скрипт для проверки, что все изменения были применены на сервере

echo "Проверка изменений канонических URL на сервере..."

SERVER_IP="185.255.120.50"
ROOT_USER="root"
WEB_ROOT="/var/www/html/site"

echo "Проверка наличия старых ссылок на домен 'вашдомен'..."
ssh ${ROOT_USER}@${SERVER_IP} "grep -r 'вашдомен' ${WEB_ROOT} --include='*.js' --include='*.html' --include='*.json' --include='*.xml'"

echo "Проверка наличия старых ссылок на punycode домен 'xn--80adhe8ahe2f'..."
ssh ${ROOT_USER}@${SERVER_IP} "grep -r 'xn--80adhe8ahe2f' ${WEB_ROOT} --include='*.js' --include='*.html' --include='*.json' --include='*.xml'"

echo "Проверка robots.txt..."
ssh ${ROOT_USER}@${SERVER_IP} "cat ${WEB_ROOT}/robots.txt"

echo "Проверка канонических тегов в index.html..."
ssh ${ROOT_USER}@${SERVER_IP} "grep -A 3 'canonical' ${WEB_ROOT}/index.html"

echo "Проверка канонических тегов в важных страницах..."
PAGES=("about" "terms" "privacy" "search" "profiles")
for page in "${PAGES[@]}"; do
  echo "Проверка ${page}.html..."
  ssh ${ROOT_USER}@${SERVER_IP} "if [ -f ${WEB_ROOT}/${page}.html ]; then grep -A 3 'canonical' ${WEB_ROOT}/${page}.html; else echo 'Файл ${page}.html не найден'; fi"
done

echo "Проверка sitemap.xml..."
ssh ${ROOT_USER}@${SERVER_IP} "grep -A 3 'escort-bar.live' ${WEB_ROOT}/sitemap.xml | head -n 10"

echo "Проверка наличия фавикона..."
ssh ${ROOT_USER}@${SERVER_IP} "ls -la ${WEB_ROOT}/favicon.svg"

echo "Проверка сервиса для Yandex.Webmaster..."
ssh ${ROOT_USER}@${SERVER_IP} "ls -la ${WEB_ROOT}/yandex_*.html 2>/dev/null || echo 'Файлы верификации для Яндекс не найдены'"

echo "Проверка службы Nginx..."
ssh ${ROOT_USER}@${SERVER_IP} "systemctl status nginx | grep 'Active'"

echo "Проверка завершена. Для полной проверки рекомендуется также просмотреть сайт и проверить работу через браузер." 
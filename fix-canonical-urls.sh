#!/bin/bash

# Скрипт для исправления канонических URL на сайте escort-bar.live
# Заменяет все вхождения 'вашдомен.ru' на 'escort-bar.live'

echo "Начинаем исправление канонических URL..."

# Директория проекта
PROJECT_DIR="."

# Изменение канонических URL в файлах страниц
echo "Обновление канонических URL в страницах..."
find $PROJECT_DIR/frontend/src/pages -type f -name "*.js" -exec sed -i 's|https://вашдомен\.ru|https://escort-bar.live|g' {} \;

# Обновление robots.txt
echo "Обновление robots.txt..."
sed -i 's|https://вашдомен\.ru|https://escort-bar.live|g' $PROJECT_DIR/frontend/public/robots.txt

# Обновление sitemap.xml
echo "Обновление sitemap.xml..."
if [ -f "$PROJECT_DIR/frontend/public/sitemap.xml" ]; then
    sed -i 's|https://вашдомен\.ru|https://escort-bar.live|g' $PROJECT_DIR/frontend/public/sitemap.xml
fi

# Обновление файла в утилите SEO
echo "Обновление utils/seo.js..."
if [ -f "$PROJECT_DIR/frontend/src/utils/seo.js" ]; then
    sed -i 's|https://вашдомен\.ru|https://escort-bar.live|g' $PROJECT_DIR/frontend/src/utils/seo.js
fi

# Обновление скрипта генерации sitemap
echo "Обновление скрипта генерации sitemap..."
if [ -f "$PROJECT_DIR/backend/scripts/generateSitemap.js" ]; then
    sed -i 's|https://вашдомен\.ru|https://escort-bar.live|g' $PROJECT_DIR/backend/scripts/generateSitemap.js
fi

# Поиск других файлов, которые могут содержать старый домен
echo "Поиск и обновление других файлов..."
find $PROJECT_DIR -type f -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.html" -o -name "*.txt" -o -name "*.xml" | xargs grep -l "вашдомен\.ru" | xargs -r sed -i 's|https://вашдомен\.ru|https://escort-bar.live|g'

echo "Готово! Все URL обновлены."
echo "Теперь требуется пересобрать проект и загрузить обновленные файлы на сервер."
echo "После обновления файлов на сервере рекомендуется запросить переиндексацию в Яндекс.Вебмастер и Google Search Console." 
#!/bin/bash

# Скрипт для генерации favicon изображений из SVG
# Требуется установленный ImageMagick

# Проверка наличия SVG файла
if [ ! -f "frontend/public/favicon.svg" ]; then
  echo "Ошибка: файл frontend/public/favicon.svg не найден"
  exit 1
fi

# Создание директории для иконок, если её нет
mkdir -p frontend/public/icons

# Генерация разных размеров PNG из SVG
echo "Генерация PNG иконок разных размеров..."
convert -background none frontend/public/favicon.svg -resize 16x16 frontend/public/favicon-16x16.png
convert -background none frontend/public/favicon.svg -resize 32x32 frontend/public/favicon-32x32.png
convert -background none frontend/public/favicon.svg -resize 48x48 frontend/public/icons/favicon-48x48.png
convert -background none frontend/public/favicon.svg -resize 96x96 frontend/public/icons/favicon-96x96.png
convert -background none frontend/public/favicon.svg -resize 144x144 frontend/public/mstile-144x144.png
convert -background none frontend/public/favicon.svg -resize 192x192 frontend/public/icons/favicon-192x192.png
convert -background none frontend/public/favicon.svg -resize 512x512 frontend/public/icons/favicon-512x512.png

# Создание apple-touch-icon
echo "Создание apple-touch-icon..."
convert -background none frontend/public/favicon.svg -resize 180x180 frontend/public/apple-touch-icon.png

# Создание favicon.ico (многоразмерный ico файл)
echo "Создание favicon.ico..."
convert -background none frontend/public/favicon-16x16.png frontend/public/favicon-32x32.png frontend/public/icons/favicon-48x48.png frontend/public/favicon.ico

echo "Готово! Все иконки созданы в директории frontend/public/" 
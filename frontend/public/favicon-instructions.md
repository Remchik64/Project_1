# Инструкции по конвертации SVG в иконки

## Автоматическая конвертация (рекомендуется)

1. Перейдите на сайт [RealFaviconGenerator](https://realfavicongenerator.net/)
2. Загрузите файл `favicon.svg` из директории `frontend/public`
3. Настройте параметры:
   - iOS: Полноцветное изображение, без фона
   - Windows: Используйте пурпурный цвет (#ce00ff) для фона плитки
   - Android: Тема "порождена иконкой"
   - Safari: Используйте интенсивный цвет
   - Web App: Установите прозрачность фона 0%
4. Скачайте пакет и распакуйте его в директорию `frontend/public`

## Ручная конвертация

Если вы предпочитаете ручную конвертацию, используйте следующие команды:

```bash
# Установка утилиты для конвертации
npm install -g svg2png

# Конвертация SVG в PNG различных размеров
svg2png favicon.svg -o favicon-16x16.png -w 16 -h 16
svg2png favicon.svg -o favicon-32x32.png -w 32 -h 32
svg2png favicon.svg -o apple-touch-icon.png -w 180 -h 180
svg2png favicon.svg -o android-chrome-192x192.png -w 192 -h 192
svg2png favicon.svg -o android-chrome-512x512.png -w 512 -h 512
svg2png favicon.svg -o mstile-144x144.png -w 144 -h 144

# Для создания favicon.ico вам потребуется дополнительная утилита, например ImageMagick:
# convert favicon-16x16.png favicon-32x32.png favicon.ico
```

## Добавление ссылок на иконки в HTML

Все необходимые ссылки на иконки уже добавлены в файл `index.html`.

## Проверка

После конвертации и добавления файлов проверьте их доступность, открыв сайт в браузере.

Для проверки в Яндекс Вебмастере добавьте сайт и проверьте, правильно ли отображается иконка в сниппете. 
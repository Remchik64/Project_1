# Инструкция по созданию favicon из SVG-файла

## Метод 1: Онлайн генератор (рекомендуется)

1. Посетите сайт [Real Favicon Generator](https://realfavicongenerator.net/)
2. Нажмите "Select your Favicon image" и загрузите файл `favicon.svg`
3. Настройте параметры для различных платформ:
   - iOS: выберите фоновый цвет для плитки
   - Android: используйте градиентный фон `#901492`
   - Windows: используйте фон `#901492`
   - macOS: используйте настройки по умолчанию
4. Нажмите "Generate your Favicons and HTML code"
5. Скачайте пакет с иконками
6. Распакуйте скачанный архив в директорию `frontend/public/`
7. Скопируйте предложенный HTML-код в `<head>` секцию файла `index.html`

## Метод 2: Использование локального скрипта

Если у вас установлен ImageMagick, вы можете использовать скрипт `generate-favicons.sh` из корня проекта:

```bash
chmod +x generate-favicons.sh
./generate-favicons.sh
```

Скрипт создаст все необходимые иконки в директории `frontend/public/`

## Загрузка на сервер

После создания всех иконок, загрузите их на сервер:

```bash
scp frontend/public/favicon.svg frontend/public/favicon.ico frontend/public/favicon-16x16.png frontend/public/favicon-32x32.png frontend/public/apple-touch-icon.png frontend/public/mstile-144x144.png root@185.255.120.50:/var/www/html/site/
```

Если вы использовали онлайн генератор и у вас есть дополнительные файлы, загрузите и их.

## Проверка

Проверьте работу favicon, открыв сайт в разных браузерах. Возможно, потребуется очистить кэш браузера, чтобы увидеть новую иконку. 
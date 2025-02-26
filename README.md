# Сервис знакомств по городам России

Веб-приложение для знакомств с возможностью выбора города и просмотра анкет пользователей.

## Технологии

- **Фронтенд**: React, React Router, Axios
- **Бэкенд**: Node.js, Express, Sequelize
- **База данных**: SQLite (в разработке), MongoDB (в продакшене)
- **Контейнеризация**: Docker, Docker Compose

## Требования

- Node.js 18.x
- npm или yarn
- Docker и Docker Compose (для запуска в контейнере)

## Установка и запуск

### Локальная разработка

1. Клонируйте репозиторий:
   ```bash
   git clone https://github.com/yourusername/dating-site.git
   cd dating-site
   ```

2. Установите зависимости:
   ```bash
   npm run install-all
   ```

3. Создайте файл `.env` в корне проекта (используйте `.env.example` как шаблон)

4. Запустите приложение в режиме разработки:
   ```bash
   npm run dev
   ```

### Запуск в продакшене

#### Без Docker

1. Установите зависимости и соберите фронтенд:
   ```bash
   npm run install-all
   npm run build
   ```

2. Запустите приложение:
   ```bash
   npm run start
   ```

#### С Docker

1. Соберите и запустите контейнер:
   ```bash
   docker-compose up -d
   ```

2. Приложение будет доступно по адресу: http://localhost:8080

## Структура проекта

- `/frontend` - React приложение
- `/backend` - Node.js/Express API
- `/backend/uploads` - Директория для загруженных файлов

## Скрипты

- `npm run install-all` - Установка всех зависимостей
- `npm run build` - Сборка фронтенда
- `npm run start` - Запуск приложения в продакшене
- `npm run dev` - Запуск приложения в режиме разработки
- `npm run deploy` - Установка зависимостей, сборка и запуск
- `npm run generate-sitemap` - Генерация sitemap.xml

## Лицензия

MIT 
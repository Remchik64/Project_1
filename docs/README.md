# Документация проекта Escort Bar

## Обзор проекта

Escort Bar - это веб-приложение для размещения анкет с профилями пользователей. Проект состоит из двух основных частей:
- Frontend: React приложение для отображения пользовательского интерфейса
- Backend: Node.js/Express API сервер для обработки данных

## Структура проекта

### Backend

Backend построен на Node.js с использованием Express и представляет собой RESTful API с следующими возможностями:
- Аутентификация и авторизация пользователей
- Управление профилями пользователей
- Загрузка и обработка изображений
- Настройки сайта

#### Основные компоненты:

- `controllers/` - обработчики запросов
- `models/` - модели данных
- `middleware/` - промежуточные обработчики запросов
- `routes/` - маршруты API
- `config/` - конфигурационные файлы
- `scripts/` - служебные скрипты

### Frontend

Frontend построен на React и использует следующие технологии:
- React Router для навигации
- Axios для HTTP запросов
- Context API для управления состоянием
- CSS модули для стилизации

#### Основные компоненты:

- `src/components/` - переиспользуемые компоненты
- `src/pages/` - компоненты-страницы
- `src/context/` - контексты для управления состоянием
- `src/config/` - конфигурационные файлы
- `public/` - статические файлы

## Настройка и запуск

### Требования

- Node.js 16.x или выше
- npm 7.x или выше
- MySQL или SQLite база данных

### Установка зависимостей

```bash
# Установка зависимостей backend
cd backend
npm install

# Установка зависимостей frontend
cd frontend
npm install
```

### Настройка переменных окружения

Скопируйте файл `.env.example` в `.env` и настройте параметры подключения к базе данных и другие настройки.

### Запуск в режиме разработки

```bash
# Запуск backend
cd backend
npm run dev

# Запуск frontend
cd frontend
npm start
```

### Запуск в production режиме

```bash
# Backend
cd backend
npm run start

# Frontend (сборка)
cd frontend
npm run build
```

## Управление сервером

### Скрипты для управления Nginx

Для управления Nginx конфигурациями используйте универсальный скрипт `scripts/nginx/nginx-manager.sh`:

```bash
./scripts/nginx/nginx-manager.sh --fix-images  # Настройка путей к изображениям
./scripts/nginx/nginx-manager.sh --fix-404     # Настройка обработки 404 ошибок
./scripts/nginx/nginx-manager.sh --clean-configs # Очистка конфликтующих конфигураций
./scripts/nginx/nginx-manager.sh --test        # Тестирование конфигурации
./scripts/nginx/nginx-manager.sh --restart     # Перезагрузка Nginx
./scripts/nginx/nginx-manager.sh --all         # Выполнить все исправления
```

### Скрипты для управления базой данных

Для управления базой данных используйте скрипт `scripts/database/db-manager.sh`:

```bash
./scripts/database/db-manager.sh --backup                       # Создание резервной копии БД
./scripts/database/db-manager.sh --restore backup_file.sql.gz   # Восстановление из резервной копии
./scripts/database/db-manager.sh --fix-paths                    # Исправление путей к изображениям
./scripts/database/db-manager.sh --check-profiles               # Проверка целостности профилей
./scripts/database/db-manager.sh --fix-profiles                 # Исправление проблем с профилями
```

## Конфигурация Nginx

Основная конфигурация Nginx находится в файле `config/nginx/escort-bar.live.conf`. Этот файл содержит настройки для:
- HTTP и HTTPS соединений
- Обработки статических файлов
- Проксирования запросов к API
- Обработки ошибок
- GZIP сжатия и оптимизации производительности

## Структура базы данных

### Основные таблицы:

- `Users` - информация о пользователях
- `Profiles` - анкеты пользователей
- `Photos` - фотографии профилей
- `Settings` - настройки сайта
- `Cities` - список городов

## Дополнительные материалы

- [Nginx документация](docs/nginx/README.md)
- [Скрипты обслуживания](docs/maintenance/README.md)
- [Руководство по деплою](docs/deployment/README.md) 
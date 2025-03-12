# Инструкция по деплою сайта на VPS без Docker

Данная инструкция описывает процесс деплоя сайта знакомств на VPS-сервер без использования Docker.

## Предварительные требования

- VPS с операционной системой Linux (Ubuntu/Debian рекомендуется)
- Node.js 18.x
- npm 9.x или выше
- PM2 (для управления процессами)
- Nginx (для проксирования запросов)
- Доменное имя (опционально, но рекомендуется)
- SSL-сертификат (Let's Encrypt)

## Шаг 1: Подготовка проекта к деплою

### 1.1. Обновление переменных окружения

Создайте файл `.env` в корне проекта со следующими настройками:

```
# Общие настройки
NODE_ENV=production
PORT=8080

# Настройки бэкенда
JWT_SECRET=ваш-секретный-ключ-здесь
ADMIN_EMAIL=ваш-email@example.com
ADMIN_PASSWORD=ваш-надежный-пароль

# Настройки фронтенда
REACT_APP_API_URL=https://ваш-домен.com
REACT_APP_ENV=production
```

### 1.2. Обновление настроек frontend

Отредактируйте файл `frontend/.env.production`:

```
REACT_APP_API_URL=https://ваш-домен.com
```

### 1.3. Обновление CORS в backend

Отредактируйте файл `backend/index.js`, обновив настройки CORS:

```javascript
app.use(cors({
    origin: ['https://ваш-домен.com', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With', 'X-Upload-Field']
}));
```

## Шаг 2: Настройка сервера

### 2.1. Установка Node.js и npm

```bash
# Обновление пакетов
sudo apt update
sudo apt upgrade -y

# Установка Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Проверка версий
node -v  # Должно быть v18.x.x
npm -v   # Должно быть 9.x.x или выше
```

### 2.2. Установка PM2

```bash
# Установка PM2 глобально
sudo npm install -g pm2

# Настройка автозапуска PM2
pm2 startup
```

### 2.3. Установка и настройка Nginx

```bash
# Установка Nginx
sudo apt install -y nginx

# Запуск и включение автозапуска Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Шаг 3: Деплой проекта

### 3.1. Клонирование репозитория

```bash
# Создание директории для проекта
mkdir -p /var/www
cd /var/www

# Клонирование репозитория
git clone https://github.com/yourusername/dating-site.git
cd dating-site
```

### 3.2. Установка зависимостей и сборка проекта

```bash
# Установка зависимостей
npm run install-all

# Сборка frontend
npm run build

# Создание/проверка администратора
cd backend
npm run create-admin
cd ..
```

### 3.3. Настройка PM2 для запуска backend

Создайте файл `ecosystem.config.js` в корне проекта:

```javascript
module.exports = {
  apps: [
    {
      name: "dating-site-backend",
      script: "./backend/index.js",
      env: {
        NODE_ENV: "production",
        PORT: 8080
      },
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "300M"
    }
  ]
};
```

Запустите backend через PM2:

```bash
pm2 start ecosystem.config.js
pm2 save
```

### 3.4. Настройка Nginx для проксирования запросов

Создайте файл конфигурации Nginx:

```bash
sudo nano /etc/nginx/sites-available/dating-site
```

Добавьте следующую конфигурацию:

```nginx
server {
    listen 80;
    server_name ваш-домен.com www.ваш-домен.com;

    # Перенаправление на HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name ваш-домен.com www.ваш-домен.com;

    # SSL настройки
    ssl_certificate /etc/letsencrypt/live/ваш-домен.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ваш-домен.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;

    # Настройки для frontend
    root /var/www/dating-site/frontend/build;
    index index.html;

    # Настройки для API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Настройки для загруженных файлов
    location /uploads {
        alias /var/www/dating-site/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # Настройки для frontend маршрутов
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Настройки для статических файлов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
}
```

Активируйте конфигурацию и перезапустите Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/dating-site /etc/nginx/sites-enabled/
sudo nginx -t  # Проверка конфигурации
sudo systemctl restart nginx
```

### 3.5. Настройка SSL с Let's Encrypt

```bash
# Установка Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получение SSL-сертификата
sudo certbot --nginx -d ваш-домен.com -d www.ваш-домен.com

# Настройка автоматического обновления сертификата
sudo systemctl status certbot.timer
```

## Шаг 4: Настройка автоматического обновления

### 4.1. Создание скрипта для обновления

Создайте файл `update.sh` в корне проекта:

```bash
#!/bin/bash

# Переход в директорию проекта
cd /var/www/dating-site

# Получение последних изменений
git pull

# Установка зависимостей
npm run install-all

# Сборка frontend
npm run build

# Перезапуск backend
pm2 restart dating-site-backend

# Сохранение конфигурации PM2
pm2 save
```

Сделайте скрипт исполняемым:

```bash
chmod +x update.sh
```

### 4.2. Настройка Cron для автоматического обновления (опционально)

```bash
# Открытие редактора crontab
crontab -e

# Добавление задачи (обновление каждый день в 3:00)
0 3 * * * /var/www/dating-site/update.sh >> /var/log/dating-site-update.log 2>&1
```

## Шаг 5: Мониторинг и обслуживание

### 5.1. Мониторинг логов

```bash
# Логи PM2
pm2 logs dating-site-backend

# Логи Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 5.2. Резервное копирование базы данных

Создайте скрипт `backup.sh`:

```bash
#!/bin/bash

# Директория для резервных копий
BACKUP_DIR="/var/backups/dating-site"
mkdir -p $BACKUP_DIR

# Имя файла резервной копии с датой
BACKUP_FILE="$BACKUP_DIR/database-$(date +%Y%m%d-%H%M%S).sqlite"

# Копирование базы данных
cp /var/www/dating-site/backend/database.sqlite $BACKUP_FILE

# Сжатие резервной копии
gzip $BACKUP_FILE

# Удаление старых резервных копий (оставляем последние 7)
find $BACKUP_DIR -name "database-*.sqlite.gz" -type f -mtime +7 -delete
```

Сделайте скрипт исполняемым и добавьте в crontab:

```bash
chmod +x backup.sh
crontab -e

# Добавление задачи (резервное копирование каждый день в 2:00)
0 2 * * * /var/www/dating-site/backup.sh >> /var/log/dating-site-backup.log 2>&1
```

## Заключение

После выполнения всех шагов ваш сайт должен быть доступен по адресу https://ваш-домен.com. Убедитесь, что все работает корректно, проверив основные функции сайта.

В случае возникновения проблем, проверьте логи PM2 и Nginx для выявления и устранения ошибок. 
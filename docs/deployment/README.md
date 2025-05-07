# Руководство по развертыванию

## Требования к серверу

### Минимальные системные требования

- **CPU**: 2 ядра
- **RAM**: 4 GB
- **Диск**: 20 GB SSD
- **ОС**: Ubuntu 20.04 LTS или новее

### Необходимое программное обеспечение

- Node.js 16.x или выше
- npm 7.x или выше
- Git
- Nginx
- MySQL 8.0 или SQLite
- PM2 (для управления Node.js процессами)
- Certbot (для SSL сертификатов)

## Подготовка сервера

### Установка зависимостей

```bash
# Обновление пакетов
sudo apt-get update
sudo apt-get upgrade -y

# Установка Node.js и npm
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка Git
sudo apt-get install -y git

# Установка Nginx
sudo apt-get install -y nginx

# Установка MySQL (опционально)
sudo apt-get install -y mysql-server

# Установка PM2 глобально
sudo npm install -g pm2

# Установка Certbot для SSL
sudo apt-get install -y certbot python3-certbot-nginx
```

### Настройка файрвола

```bash
# Установка UFW
sudo apt-get install -y ufw

# Настройка основных правил
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Разрешение SSH соединений
sudo ufw allow ssh

# Разрешение HTTP и HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Активация файрвола
sudo ufw enable
```

## Развертывание приложения

### Клонирование репозитория

```bash
# Создание рабочей директории
sudo mkdir -p /opt/repo
sudo chown $USER:$USER /opt/repo

# Клонирование репозитория
cd /opt/repo
git clone https://github.com/your-username/escort-bar.git .
```

### Установка зависимостей проекта

```bash
# Установка зависимостей backend
cd /opt/repo/backend
npm install --production

# Установка зависимостей frontend
cd /opt/repo/frontend
npm install
```

### Настройка переменных окружения

```bash
# Настройка .env для backend
cd /opt/repo/backend
cp .env.example .env
nano .env

# Настройка .env для frontend
cd /opt/repo/frontend
cp .env.example .env
nano .env
```

Пример содержимого файла `.env` для backend:

```
NODE_ENV=production
PORT=8000
JWT_SECRET=your-secret-jwt-key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure-password
UPLOAD_PATH=./uploads
DB_PATH=./database.sqlite
```

### Сборка frontend

```bash
cd /opt/repo/frontend
npm run build

# Создание директории для статических файлов
sudo mkdir -p /var/www/html/site
sudo chown -R $USER:$USER /var/www/html/site

# Копирование собранных файлов
cp -r build/* /var/www/html/site/
```

### Создание директории для загрузок

```bash
sudo mkdir -p /opt/api/uploads
sudo chown -R $USER:$USER /opt/api/uploads
```

## Настройка Nginx

### Базовая конфигурация

```bash
# Копирование конфигурации
sudo cp /opt/repo/config/nginx/escort-bar.live.conf /etc/nginx/sites-available/escort-bar.live

# Включение конфигурации
sudo ln -s /etc/nginx/sites-available/escort-bar.live /etc/nginx/sites-enabled/

# Удаление дефолтной конфигурации
sudo rm /etc/nginx/sites-enabled/default

# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx
```

### Настройка SSL-сертификатов

```bash
# Получение SSL-сертификата
sudo certbot --nginx -d escort-bar.live -d www.escort-bar.live
```

## Настройка PM2

### Запуск приложения

```bash
# Переход в директорию backend
cd /opt/repo/backend

# Запуск через PM2
pm2 start index.js --name backend

# Сохранение конфигурации PM2
pm2 save

# Настройка автозапуска
pm2 startup
```

### Мониторинг

```bash
# Просмотр логов
pm2 logs backend

# Мониторинг производительности
pm2 monit
```

## Автоматизация развертывания

### Скрипт для обновления

Для удобства обновления используйте скрипт `update-services.sh`:

```bash
# Запуск скрипта обновления
cd /opt/repo
./update-services.sh
```

Этот скрипт выполняет следующие операции:
- Проверка состояния сервера
- Перезапуск PM2 для backend
- Выполнение миграций базы данных
- Обновление frontend в директории Nginx
- Перезапуск Nginx

## Установка новой версии

### Обновление из Git

```bash
# Переход в директорию проекта
cd /opt/repo

# Получение последних изменений
git pull origin main

# Запуск скрипта обновления
./update-services.sh
```

## Резервное копирование и восстановление

### Резервное копирование

```bash
# Резервное копирование базы данных
./scripts/database/db-manager.sh --backup

# Резервное копирование загруженных файлов
tar -czf /root/uploads_backup_$(date +%Y%m%d).tar.gz /opt/api/uploads
```

### Восстановление

```bash
# Восстановление базы данных
./scripts/database/db-manager.sh --restore /path/to/backup.sql.gz

# Восстановление загруженных файлов
tar -xzf /root/uploads_backup_YYYYMMDD.tar.gz -C /
```

## Настройка доменов и DNS

### Настройка записей DNS

Для корректной работы сайта необходимо настроить следующие DNS записи:

```
escort-bar.live.     IN A      185.255.120.50
www.escort-bar.live. IN CNAME  escort-bar.live.
```

### Проверка DNS настроек

```bash
dig escort-bar.live
dig www.escort-bar.live
```

## Устранение неполадок

### Проблемы с Nginx

```bash
# Проверка логов Nginx
sudo tail -f /var/log/nginx/error.log

# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx
```

### Проблемы с Node.js приложением

```bash
# Проверка логов PM2
pm2 logs backend

# Перезапуск приложения
pm2 restart backend

# Удаление и пересоздание приложения
pm2 delete backend
cd /opt/repo/backend
pm2 start index.js --name backend
```

### Проблемы с базой данных

```bash
# Проверка целостности профилей
./scripts/database/db-manager.sh --check-profiles

# Исправление проблем с профилями
./scripts/database/db-manager.sh --fix-profiles
```

## Безопасность

### Смена пароля администратора

```bash
cd /opt/repo
NODE_ENV=production node backend/scripts/change-admin-password.js "новый_пароль"
```

### Регулярное обновление системы

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### Мониторинг логов

```bash
# Установка logwatch для мониторинга логов
sudo apt-get install -y logwatch

# Настройка ежедневной отправки отчётов
sudo nano /etc/cron.daily/00logwatch
``` 
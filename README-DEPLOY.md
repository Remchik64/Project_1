# Инструкция по деплою сайта на VPS

Данный документ содержит инструкции по деплою сайта знакомств на VPS-сервер без использования Docker.

## Содержание

1. [Подготовка проекта](#подготовка-проекта)
2. [Деплой на сервер](#деплой-на-сервер)
3. [Настройка HTTPS](#настройка-https)
4. [Обслуживание](#обслуживание)
5. [Устранение неполадок](#устранение-неполадок)

## Подготовка проекта

Перед деплоем на сервер необходимо подготовить проект:

1. Убедитесь, что все изменения закоммичены в репозиторий
2. Обновите файл `.env.production` в директории `frontend`, указав правильный URL вашего API:
   ```
   REACT_APP_API_URL=https://ваш-домен.com
   ```
3. Обновите файл `.env.production` в корне проекта, указав правильные настройки:
   ```
   # Общие настройки
   NODE_ENV=production
   PORT=8080

   # Настройки бэкенда
   JWT_SECRET=ваш-секретный-ключ
   ADMIN_EMAIL=ваш-email@example.com
   ADMIN_PASSWORD=ваш-надежный-пароль

   # Настройки фронтенда
   REACT_APP_API_URL=https://ваш-домен.com
   REACT_APP_ENV=production
   ```
4. Обновите файл `nginx-config.conf`, заменив `example.com` на ваш домен

## Деплой на сервер

### Автоматический деплой

Для автоматического деплоя на новый сервер:

1. Загрузите все файлы проекта на сервер
2. Сделайте скрипт `setup-server.sh` исполняемым:
   ```bash
   chmod +x setup-server.sh
   ```
3. Запустите скрипт с правами суперпользователя:
   ```bash
   sudo ./setup-server.sh
   ```
4. Получите SSL-сертификат:
   ```bash
   sudo certbot --nginx -d ваш-домен.com -d www.ваш-домен.com
   ```

### Ручной деплой

Если вы предпочитаете ручной деплой, следуйте инструкциям в файле `deploy-instructions.md`.

## Настройка HTTPS

После деплоя необходимо настроить HTTPS:

1. Убедитесь, что домен правильно настроен и указывает на ваш сервер
2. Получите SSL-сертификат с помощью Certbot:
   ```bash
   sudo certbot --nginx -d ваш-домен.com -d www.ваш-домен.com
   ```
3. Проверьте, что автоматическое обновление сертификата настроено:
   ```bash
   sudo systemctl status certbot.timer
   ```

## Обслуживание

### Обновление сайта

Для обновления сайта используйте скрипт `update.sh`:

```bash
cd /var/www/dating-site
./update.sh
```

### Резервное копирование

Резервное копирование базы данных выполняется автоматически каждый день в 2:00 с помощью cron. Резервные копии хранятся в директории `/var/backups/dating-site`.

Для ручного создания резервной копии:

```bash
cd /var/www/dating-site
./backup.sh
```

### Мониторинг

Для мониторинга работы сайта:

1. Проверка статуса backend:
   ```bash
   pm2 status
   ```

2. Просмотр логов backend:
   ```bash
   pm2 logs dating-site-backend
   ```

3. Просмотр логов Nginx:
   ```bash
   sudo tail -f /var/log/nginx/dating-site-access.log
   sudo tail -f /var/log/nginx/dating-site-error.log
   ```

## Устранение неполадок

### Проблемы с backend

1. Перезапуск backend:
   ```bash
   pm2 restart dating-site-backend
   ```

2. Проверка логов:
   ```bash
   pm2 logs dating-site-backend
   ```

### Проблемы с входом в панель администратора

Если вы не можете войти в панель администратора, выполните следующие шаги:

1. Проверьте, что администратор создан:
   ```bash
   cd /var/www/dating-site/backend
   npm run create-admin
   ```

2. Сбросьте пароль администратора (при необходимости):
   ```bash
   # Добавьте в .env
   RESET_ADMIN_PASSWORD=true
   
   # Запустите скрипт
   npm run create-admin
   
   # Удалите или установите в false после сброса
   RESET_ADMIN_PASSWORD=false
   ```

3. Проверьте настройки CORS в backend/index.js:
   ```javascript
   // Должно быть настроено для вашего домена
   origin: function(origin, callback) {
       const allowedOrigins = [
           'http://localhost:3000',
           'https://your-domain.com',
           process.env.FRONTEND_URL
       ].filter(Boolean);
       
       if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
           callback(null, true);
       } else {
           callback(new Error('Запрещено CORS политикой'));
       }
   }
   ```

4. Проверьте настройки API URL в frontend:
   - В файле frontend/.env.production должно быть:
     ```
     REACT_APP_API_URL=https://your-domain.com
     ```

### Проблемы с Nginx

1. Проверка конфигурации:
   ```bash
   sudo nginx -t
   ```

2. Перезапуск Nginx:
   ```bash
   sudo systemctl restart nginx
   ```

3. Проверка статуса:
   ```bash
   sudo systemctl status nginx
   ```

### Проблемы с SSL

1. Обновление сертификата:
   ```bash
   sudo certbot renew
   ```

2. Проверка статуса Certbot:
   ```bash
   sudo systemctl status certbot.timer
   ```

## Контакты для поддержки

При возникновении проблем с деплоем или работой сайта, обращайтесь:

- Email: ваш-email@example.com
- Телефон: +7 (XXX) XXX-XX-XX 
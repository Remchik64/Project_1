# Настройка и обслуживание Nginx

## Основная конфигурация

Основная конфигурация Nginx находится в файле `config/nginx/escort-bar.live.conf`. Этот файл включает все необходимые настройки для правильной работы сайта.

### Ключевые особенности конфигурации:

1. **Обработка HTTP и HTTPS**:
   - Перенаправление всех HTTP запросов на HTTPS
   - Настройка SSL сертификатов Let's Encrypt

2. **Настройка статических файлов**:
   - Корневая директория: `/var/www/html/site`
   - Настройки кэширования
   - Обработка различных типов файлов

3. **Проксирование API запросов**:
   - Перенаправление запросов `/api/` на Node.js сервер
   - Настройка заголовков проксирования

4. **Обработка изображений**:
   - Специальные маршруты для `/uploads/` и `/api/uploads/`
   - Настройки кэширования изображений

5. **Обработка ошибок**:
   - Страницы ошибок 404 и 50x
   - Логирование ошибок

6. **Оптимизация производительности**:
   - Настройки GZIP сжатия
   - Оптимизация SSL соединений
   - Настройки буферов и таймаутов

## Управление Nginx

### Универсальный скрипт для управления

Для упрощения управления Nginx используйте скрипт `scripts/nginx/nginx-manager.sh`. Скрипт поддерживает следующие команды:

```bash
# Справка по использованию
./scripts/nginx/nginx-manager.sh --help

# Настройка обработки 404 ошибок
./scripts/nginx/nginx-manager.sh --fix-404

# Настройка путей к изображениям
./scripts/nginx/nginx-manager.sh --fix-images

# Очистка конфликтующих конфигураций
./scripts/nginx/nginx-manager.sh --clean-configs

# Тестирование конфигурации
./scripts/nginx/nginx-manager.sh --test

# Перезагрузка Nginx
./scripts/nginx/nginx-manager.sh --restart

# Создание резервной копии текущей конфигурации
./scripts/nginx/nginx-manager.sh --backup

# Восстановление из резервной копии
./scripts/nginx/nginx-manager.sh --restore /path/to/backup.conf

# Проверка обработки 404 ошибок
./scripts/nginx/nginx-manager.sh --verify-404

# Проверка доступности изображений
./scripts/nginx/nginx-manager.sh --verify-images

# Выполнить все исправления (404, изображения, очистка)
./scripts/nginx/nginx-manager.sh --all
```

### Ручное управление сервисом Nginx

Стандартные команды для управления сервисом Nginx:

```bash
# Перезагрузка конфигурации без остановки сервиса
sudo systemctl reload nginx

# Перезапуск сервиса
sudo systemctl restart nginx

# Проверка статуса
sudo systemctl status nginx

# Проверка конфигурации на ошибки
sudo nginx -t
```

## Расположение файлов Nginx

- **Конфигурационные файлы**: `/etc/nginx/`
- **Рабочие конфигурации**: `/etc/nginx/sites-enabled/`
- **Доступные конфигурации**: `/etc/nginx/sites-available/`
- **Логи**: `/var/log/nginx/`
- **Статические файлы сайта**: `/var/www/html/site/`
- **Загруженные изображения**: `/opt/api/uploads/`

## Рекомендации по обслуживанию

1. **Регулярное резервное копирование**:
   ```bash
   ./scripts/nginx/nginx-manager.sh --backup
   ```

2. **Проверка конфигурации перед применением изменений**:
   ```bash
   ./scripts/nginx/nginx-manager.sh --test
   ```

3. **Мониторинг логов**:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   sudo tail -f /var/log/nginx/access.log
   ```

4. **Очистка и объединение конфигураций при наличии конфликтов**:
   ```bash
   ./scripts/nginx/nginx-manager.sh --clean-configs
   ```

5. **Проверка доступности ресурсов после изменений**:
   ```bash
   ./scripts/nginx/nginx-manager.sh --verify-images
   ./scripts/nginx/nginx-manager.sh --verify-404
   ```

## Решение типичных проблем

### 1. Ошибка 404 для изображений

Если изображения не отображаются и возвращается ошибка 404, выполните:

```bash
./scripts/nginx/nginx-manager.sh --fix-images
```

### 2. Конфликты в конфигурациях

При наличии предупреждений о конфликтующих серверных блоках:

```bash
./scripts/nginx/nginx-manager.sh --clean-configs
```

### 3. Проблемы с SSL сертификатами

Проверьте расположение сертификатов и права доступа:

```bash
sudo ls -la /etc/letsencrypt/live/escort-bar.live/
```

При необходимости обновите сертификаты:

```bash
sudo certbot renew
```

### 4. Проблемы с правами доступа к загруженным файлам

Убедитесь, что пользователь `www-data` имеет доступ к директории загрузок:

```bash
sudo chown -R www-data:www-data /opt/api/uploads
sudo chmod -R 755 /opt/api/uploads
```

## Примеры конфигураций

### Базовая конфигурация для разработки

```nginx
server {
    listen 80;
    server_name localhost;

    root /var/www/html/site;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        alias /opt/api/uploads/;
        try_files $uri =404;
    }
}
```

### HTTPS конфигурация для продакшн

Полная HTTPS конфигурация доступна в файле `config/nginx/escort-bar.live.conf`. 
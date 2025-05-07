# Обслуживание и эксплуатация проекта

## Регулярные задачи обслуживания

### Ежедневные задачи

1. **Проверка логов**:
   ```bash
   # Проверка логов backend
   sudo tail -n 100 /var/log/pm2/backend.log
   
   # Проверка логов Nginx
   sudo tail -n 100 /var/log/nginx/error.log
   sudo tail -n 100 /var/log/nginx/access.log
   ```

2. **Мониторинг доступности**:
   ```bash
   # Проверка работоспособности backend
   curl -I https://escort-bar.live/api/public/profiles
   
   # Проверка работоспособности frontend
   curl -I https://escort-bar.live
   ```

### Еженедельные задачи

1. **Резервное копирование базы данных**:
   ```bash
   ./scripts/database/db-manager.sh --backup
   ```

2. **Проверка свободного места на диске**:
   ```bash
   df -h
   ```

3. **Очистка кэшей и временных файлов**:
   ```bash
   sudo journalctl --vacuum-time=7d
   sudo apt-get clean
   ```

### Ежемесячные задачи

1. **Обновление пакетов**:
   ```bash
   sudo apt-get update
   sudo apt-get upgrade
   ```

2. **Проверка и обновление SSL сертификатов**:
   ```bash
   sudo certbot renew
   ```

3. **Очистка неиспользуемых изображений**:
   ```bash
   # Скрипт для поиска неиспользуемых изображений
   scripts/database/db-manager.sh --clean-unused-images
   ```

## Обработка ошибок и инцидентов

### Восстановление базы данных

1. **Восстановление из резервной копии**:
   ```bash
   ./scripts/database/db-manager.sh --restore /path/to/backup.sql.gz
   ```

2. **Проверка целостности данных после восстановления**:
   ```bash
   ./scripts/database/db-manager.sh --check-profiles
   ```

### Перезапуск сервисов

1. **Перезапуск backend**:
   ```bash
   # Перезапуск через PM2
   pm2 restart backend
   
   # Альтернативный способ через скрипт
   cd backend && NODE_ENV=production node scripts/server-status.js restart
   ```

2. **Перезапуск Nginx**:
   ```bash
   sudo systemctl restart nginx
   ```

3. **Полный перезапуск всех сервисов**:
   ```bash
   ./update-services.sh
   ```

### Исправление типичных проблем

1. **Проблемы с путями к изображениям**:
   ```bash
   ./scripts/database/db-manager.sh --fix-paths
   ./scripts/nginx/nginx-manager.sh --fix-images
   ```

2. **Исправление проблем с профилями**:
   ```bash
   ./scripts/database/db-manager.sh --fix-profiles
   ```

3. **Решение проблем с 404 ошибками**:
   ```bash
   ./scripts/nginx/nginx-manager.sh --fix-404
   ```

## Мониторинг производительности

### CPU и память

1. **Мониторинг процессов**:
   ```bash
   htop
   ```

2. **Мониторинг PM2 приложений**:
   ```bash
   pm2 monit
   ```

### Дисковое пространство

1. **Общая информация**:
   ```bash
   df -h
   ```

2. **Анализ использования дискового пространства**:
   ```bash
   du -h --max-depth=1 /var
   du -h --max-depth=1 /opt
   ```

3. **Поиск крупных файлов**:
   ```bash
   find /var -type f -size +100M
   find /opt -type f -size +100M
   ```

### Сетевые соединения

1. **Проверка открытых портов**:
   ```bash
   netstat -tulpn
   ```

2. **Мониторинг активных соединений**:
   ```bash
   netstat -an | grep ESTABLISHED | wc -l
   ```

## Автоматизация обслуживания

### Использование Cron задач

1. **Ежедневное резервное копирование**:
   ```
   0 2 * * * /opt/repo/scripts/database/db-manager.sh --backup
   ```

2. **Автоматическое обновление SSL сертификатов**:
   ```
   0 3 * * 1 certbot renew --quiet
   ```

3. **Проверка состояния сервера**:
   ```
   */30 * * * * /opt/repo/backend/scripts/server-status.js check
   ```

## Обновление приложения

### Обновление Backend

1. **Получение последней версии**:
   ```bash
   cd /opt/repo
   git pull origin main
   ```

2. **Установка зависимостей**:
   ```bash
   cd /opt/repo/backend
   npm install
   ```

3. **Перезапуск сервисов**:
   ```bash
   cd /opt/repo
   ./update-services.sh
   ```

### Обновление Frontend

1. **Сборка обновленного фронтенда**:
   ```bash
   cd /opt/repo/frontend
   npm install
   npm run build
   ```

2. **Копирование файлов**:
   ```bash
   cp -r build/* /var/www/html/site/
   ```

## Сценарии миграции

### Миграция на новый сервер

1. **Создание полной резервной копии**:
   ```bash
   # Бэкап базы данных
   ./scripts/database/db-manager.sh --backup
   
   # Бэкап загруженных файлов
   tar -czf uploads_backup.tar.gz /opt/api/uploads
   
   # Бэкап конфигураций
   tar -czf nginx_configs.tar.gz /etc/nginx/sites-available /etc/nginx/sites-enabled
   ```

2. **Восстановление на новом сервере**:
   - Установка требуемых пакетов
   - Клонирование репозитория
   - Восстановление базы данных
   - Восстановление загруженных файлов
   - Настройка Nginx и сертификатов SSL

## Расширение и масштабирование

### Добавление новых функций

1. **Разработка в отдельной ветке**:
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Тестирование в изолированной среде**:
   - Создание тестовой базы данных
   - Тестирование на отдельном домене или поддомене

3. **Развертывание и мониторинг**:
   - Постепенное внедрение новых функций
   - Мониторинг производительности и ошибок

### Горизонтальное масштабирование

1. **Настройка балансировки нагрузки**:
   - Использование Nginx в качестве балансировщика
   - Настройка распределения запросов между несколькими инстансами

2. **Репликация базы данных**:
   - Настройка мастер-реплика для MySQL/MariaDB
   - Мониторинг задержек репликации

### Вертикальное масштабирование

1. **Увеличение ресурсов**:
   - Модернизация CPU и RAM
   - Использование SSD для хранения данных

2. **Оптимизация кода и запросов**:
   - Профилирование запросов к базе данных
   - Оптимизация обработки изображений
``` 
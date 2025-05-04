#!/bin/bash

# Скрипт для проверки состояния анкет в базе данных
# и диагностики проблем с отображением

echo "====== Проверка состояния анкет в базе данных ======"

# Путь к базе данных SQLite
DB_PATH="/opt/repo/backend/database.sqlite"

# Проверка наличия базы данных
if [ ! -f "$DB_PATH" ]; then
    echo "❌ База данных не найдена по пути: $DB_PATH"
    exit 1
fi

echo "✅ База данных найдена: $DB_PATH"

# Установка прав доступа для диагностики (временно)
echo "Установка временных прав доступа для диагностики..."
chmod 644 "$DB_PATH"

# Функция для запроса к базе данных
run_query() {
    sqlite3 "$DB_PATH" "$1"
}

# Подсчет общего количества анкет
TOTAL_COUNT=$(run_query "SELECT COUNT(*) FROM Profiles;")
echo "Общее количество анкет в базе: $TOTAL_COUNT"

# Подсчет анкет по статусам
ACTIVE_COUNT=$(run_query "SELECT COUNT(*) FROM Profiles WHERE status = 'active';")
PENDING_COUNT=$(run_query "SELECT COUNT(*) FROM Profiles WHERE status = 'pending';")
BLOCKED_COUNT=$(run_query "SELECT COUNT(*) FROM Profiles WHERE status = 'blocked';")

echo "Статусы анкет:"
echo "  - active (активные): $ACTIVE_COUNT"
echo "  - pending (на модерации): $PENDING_COUNT"
echo "  - blocked (заблокированные): $BLOCKED_COUNT"

# Проверка наличия фотографий
PROFILES_WITHOUT_PHOTOS=$(run_query "SELECT COUNT(*) FROM Profiles WHERE photo IS NULL OR photo = '';")
echo "Анкеты без основного фото: $PROFILES_WITHOUT_PHOTOS"

# Вывод последних 5 анкет для проверки
echo "Последние 5 анкет в базе данных:"
run_query "SELECT id, name, status, created_at FROM Profiles ORDER BY id DESC LIMIT 5;"

# Проверка наличия пути к uploads в API-маршрутах
echo ""
echo "====== Проверка маршрутов для загрузки файлов ======"

# Проверяем настройки API URL в .env.production
FRONTEND_ENV="/opt/repo/frontend/.env.production"
if [ -f "$FRONTEND_ENV" ]; then
    API_URL=$(grep "REACT_APP_API_URL" "$FRONTEND_ENV" | cut -d'=' -f2)
    echo "API URL в .env.production: $API_URL"
else
    echo "Файл .env.production не найден"
fi

# Проверяем настройки загрузки файлов в .env
BACKEND_ENV="/opt/repo/backend/.env"
if [ -f "$BACKEND_ENV" ]; then
    UPLOAD_PATH=$(grep "UPLOAD_PATH" "$BACKEND_ENV" | cut -d'=' -f2)
    echo "Путь для загрузки файлов в .env: $UPLOAD_PATH"
else
    echo "Файл .env не найден"
fi

# Проверяем наличие директории uploads
BACKEND_UPLOADS="/opt/repo/backend/uploads"
if [ -d "$BACKEND_UPLOADS" ]; then
    FILE_COUNT=$(find "$BACKEND_UPLOADS" -type f | wc -l)
    echo "Директория uploads найдена, содержит файлов: $FILE_COUNT"
    
    echo "Список файлов (первые 10):"
    find "$BACKEND_UPLOADS" -type f -exec basename {} \; | head -10
else
    echo "❌ Директория uploads не найдена: $BACKEND_UPLOADS"
fi

# Проверка прав доступа
echo ""
echo "====== Проверка прав доступа ======"
echo "Права доступа к директории uploads:"
ls -la /opt/repo/backend/ | grep uploads

# Проверка настройки Nginx для маршрутов uploads
echo ""
echo "====== Проверка настройки Nginx ======"
echo "Конфигурация для маршрута /uploads/:"
grep -A 5 "location /uploads/" /etc/nginx/sites-enabled/escort-bar.live || echo "Маршрут /uploads/ не найден в конфигурации Nginx"

echo "Конфигурация для маршрута /api/uploads/:"
grep -A 5 "location /api/uploads/" /etc/nginx/sites-enabled/escort-bar.live || echo "Маршрут /api/uploads/ не найден в конфигурации Nginx"

# Рекомендации по исправлению
echo ""
echo "====== Рекомендации ======"
if [ "$ACTIVE_COUNT" -eq 0 ]; then
    echo "❌ У вас нет активных анкет! Рекомендуется активировать анкеты через панель администратора."
fi

if [ "$TOTAL_COUNT" -eq 0 ]; then
    echo "❌ В базе данных нет анкет! Проверьте, корректно ли подключена база данных."
fi

if [ "$ACTIVE_COUNT" -gt 0 ] && [ "$FILE_COUNT" -eq 0 ]; then
    echo "❌ Есть активные анкеты, но нет файлов изображений! Проверьте директорию загрузок."
fi

echo ""
echo "====== Завершение ======"
echo "Диагностика завершена. Проверьте результаты выше."
echo "Для исправления статуса анкет выполните команду:"
echo "sqlite3 $DB_PATH \"UPDATE Profiles SET status = 'active' WHERE status = 'pending';\""

# Восстановление прав доступа
chmod 640 "$DB_PATH" 
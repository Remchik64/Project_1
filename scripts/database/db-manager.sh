#!/bin/bash
#
# db-manager.sh - Универсальный менеджер для работы с базой данных
# 
# Этот скрипт объединяет функциональность нескольких скриптов:
# - Исправление путей к изображениям в профилях
# - Проверка целостности профилей
# - Миграция данных между базами
# - Резервное копирование и восстановление
#
# Автор: Claude
# Версия: 1.0
# Дата: 2025-05-07

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Конфигурационные переменные
DB_HOST="localhost"
DB_USER="root"
DB_NAME="dating_site"
DB_PORT="3306"
ENV_FILE="/opt/repo/backend/.env"
BACKUP_DIR="/root/db_backups"
OLD_PATH_PREFIX="/uploads/"
NEW_PATH_PREFIX="/api/uploads/"
DB_PASSWORD=""

# Создаем директорию для бэкапов, если не существует
mkdir -p "$BACKUP_DIR"

# Функция загрузки переменных окружения из .env файла
load_env_vars() {
    if [[ -f "$ENV_FILE" ]]; then
        echo -e "${BLUE}Загрузка переменных из $ENV_FILE${NC}"
        
        # Считываем значения из .env файла
        DB_HOST_ENV=$(grep -E "^DB_HOST=" "$ENV_FILE" | cut -d= -f2)
        DB_USER_ENV=$(grep -E "^DB_USER=" "$ENV_FILE" | cut -d= -f2)
        DB_PASSWORD_ENV=$(grep -E "^DB_PASSWORD=" "$ENV_FILE" | cut -d= -f2)
        DB_NAME_ENV=$(grep -E "^DB_NAME=" "$ENV_FILE" | cut -d= -f2)
        DB_PORT_ENV=$(grep -E "^DB_PORT=" "$ENV_FILE" | cut -d= -f2)
        
        # Используем значения из .env файла, если они существуют
        [[ -n "$DB_HOST_ENV" ]] && DB_HOST=$DB_HOST_ENV
        [[ -n "$DB_USER_ENV" ]] && DB_USER=$DB_USER_ENV
        [[ -n "$DB_PASSWORD_ENV" ]] && DB_PASSWORD=$DB_PASSWORD_ENV
        [[ -n "$DB_NAME_ENV" ]] && DB_NAME=$DB_NAME_ENV
        [[ -n "$DB_PORT_ENV" ]] && DB_PORT=$DB_PORT_ENV
        
        echo -e "${GREEN}Переменные успешно загружены.${NC}"
    else
        echo -e "${YELLOW}Файл .env не найден, используются значения по умолчанию.${NC}"
    fi
}

# Функция проверки подключения к базе данных
check_database_connection() {
    echo -e "${BLUE}Проверка подключения к базе данных...${NC}"
    
    if [[ -z "$DB_PASSWORD" ]]; then
        read -s -p "Введите пароль для базы данных: " DB_PASSWORD
        echo
    fi
    
    # Проверка соединения с базой данных
    if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME"; then
        echo -e "${GREEN}Соединение с базой данных установлено успешно.${NC}"
        return 0
    else
        echo -e "${RED}Ошибка подключения к базе данных. Проверьте параметры подключения.${NC}"
        return 1
    fi
}

# Функция создания резервной копии базы данных
backup_database() {
    echo -e "${BLUE}Создание резервной копии базы данных...${NC}"
    
    local backup_file="${BACKUP_DIR}/${DB_NAME}_$(date +%Y%m%d_%H%M%S).sql.gz"
    
    if [[ -z "$DB_PASSWORD" ]]; then
        read -s -p "Введите пароль для базы данных: " DB_PASSWORD
        echo
    fi
    
    echo -e "${BLUE}Выполняется дамп базы данных в файл: $backup_file${NC}"
    mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" | gzip > "$backup_file"
    
    if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}Резервная копия успешно создана в файле: $backup_file${NC}"
        echo -e "Размер файла: $(du -h "$backup_file" | cut -f1)"
        return 0
    else
        echo -e "${RED}Ошибка при создании резервной копии базы данных.${NC}"
        return 1
    fi
}

# Функция восстановления базы данных из резервной копии
restore_database() {
    local backup_file="$1"
    
    if [[ ! -f "$backup_file" ]]; then
        echo -e "${RED}Файл резервной копии $backup_file не найден.${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}ВНИМАНИЕ: Восстановление уничтожит все текущие данные в базе $DB_NAME.${NC}"
    read -p "Вы уверены, что хотите продолжить? (y/n): " confirmation
    
    if [[ "$confirmation" != "y" ]]; then
        echo -e "${BLUE}Операция восстановления отменена.${NC}"
        return 0
    fi
    
    if [[ -z "$DB_PASSWORD" ]]; then
        read -s -p "Введите пароль для базы данных: " DB_PASSWORD
        echo
    fi
    
    echo -e "${BLUE}Восстановление базы данных из файла: $backup_file${NC}"
    
    # Восстановление базы данных из архива
    if [[ "$backup_file" == *.gz ]]; then
        gunzip < "$backup_file" | mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME"
    else
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$backup_file"
    fi
    
    if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}База данных успешно восстановлена из файла: $backup_file${NC}"
        return 0
    else
        echo -e "${RED}Ошибка при восстановлении базы данных.${NC}"
        return 1
    fi
}

# Функция исправления путей к изображениям в базе данных
fix_image_paths() {
    local old_prefix="$1"
    local new_prefix="$2"
    
    if [[ -z "$old_prefix" ]]; then
        old_prefix="$OLD_PATH_PREFIX"
    fi
    
    if [[ -z "$new_prefix" ]]; then
        new_prefix="$NEW_PATH_PREFIX"
    fi
    
    echo -e "${BLUE}Исправление путей к изображениям в базе данных...${NC}"
    echo -e "Заменяем префикс '${old_prefix}' на '${new_prefix}'..."
    
    if [[ -z "$DB_PASSWORD" ]]; then
        read -s -p "Введите пароль для базы данных: " DB_PASSWORD
        echo
    fi
    
    # Создаем SQL для обновления путей к изображениям
    local sql_file="/tmp/fix_image_paths.sql"
    cat > "$sql_file" << EOF
-- Обновление путей к изображениям в таблице профилей
UPDATE profiles SET 
    avatar = REPLACE(avatar, '${old_prefix}', '${new_prefix}')
WHERE avatar LIKE '${old_prefix}%';

-- Обновление путей к изображениям в таблице фотографий
UPDATE photos SET 
    url = REPLACE(url, '${old_prefix}', '${new_prefix}')
WHERE url LIKE '${old_prefix}%';

-- Обновление путей к изображениям в других таблицах, если необходимо
-- UPDATE other_table SET image_field = REPLACE(image_field, '${old_prefix}', '${new_prefix}') WHERE image_field LIKE '${old_prefix}%';

-- Подсчет обновленных записей
SELECT CONCAT('Обновлено аватаров: ', COUNT(*)) AS updated_avatars FROM profiles WHERE avatar LIKE '${new_prefix}%';
SELECT CONCAT('Обновлено фотографий: ', COUNT(*)) AS updated_photos FROM photos WHERE url LIKE '${new_prefix}%';
EOF
    
    # Выполняем SQL запрос
    echo -e "${BLUE}Выполнение SQL запроса для обновления путей...${NC}"
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$sql_file"
    
    if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}Пути к изображениям успешно обновлены.${NC}"
        rm -f "$sql_file"
        return 0
    else
        echo -e "${RED}Ошибка при обновлении путей к изображениям.${NC}"
        return 1
    fi
}

# Функция проверки целостности профилей
check_profiles() {
    echo -e "${BLUE}Проверка целостности профилей в базе данных...${NC}"
    
    if [[ -z "$DB_PASSWORD" ]]; then
        read -s -p "Введите пароль для базы данных: " DB_PASSWORD
        echo
    fi
    
    # Создаем SQL для проверки целостности профилей
    local sql_file="/tmp/check_profiles.sql"
    cat > "$sql_file" << EOF
-- Проверка на наличие профилей без аватаров
SELECT COUNT(*) AS profiles_without_avatars FROM profiles WHERE avatar IS NULL OR avatar = '';

-- Проверка на наличие профилей без фотографий
SELECT COUNT(*) AS profiles_without_photos 
FROM profiles p 
LEFT JOIN photos ph ON p.id = ph.profile_id 
WHERE ph.id IS NULL;

-- Проверка на битые ссылки в аватарах
SELECT id, username, avatar 
FROM profiles 
WHERE avatar IS NOT NULL AND avatar != '' AND avatar NOT LIKE '/api/uploads/%' AND avatar NOT LIKE '/uploads/%'
LIMIT 10;

-- Статистика по профилям
SELECT 
    COUNT(*) AS total_profiles,
    SUM(CASE WHEN avatar IS NULL OR avatar = '' THEN 1 ELSE 0 END) AS no_avatar,
    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS active_profiles,
    SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) AS inactive_profiles
FROM profiles;
EOF
    
    # Выполняем SQL запрос
    echo -e "${BLUE}Выполнение запроса проверки целостности...${NC}"
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$sql_file"
    
    # Удаляем временный файл
    rm -f "$sql_file"
    
    return 0
}

# Функция исправления целостности профилей
fix_profiles() {
    echo -e "${BLUE}Исправление проблем с профилями в базе данных...${NC}"
    
    if [[ -z "$DB_PASSWORD" ]]; then
        read -s -p "Введите пароль для базы данных: " DB_PASSWORD
        echo
    fi
    
    # Создаем SQL для исправления профилей
    local sql_file="/tmp/fix_profiles.sql"
    cat > "$sql_file" << EOF
-- Резервная копия перед исправлением (таблицы profiles)
CREATE TABLE IF NOT EXISTS profiles_backup_$(date +%Y%m%d) LIKE profiles;
INSERT IGNORE INTO profiles_backup_$(date +%Y%m%d) SELECT * FROM profiles;

-- Назначаем дефолтный аватар для профилей без аватара
UPDATE profiles SET 
    avatar = '/api/uploads/default-avatar.jpg' 
WHERE avatar IS NULL OR avatar = '';

-- Исправляем некорректные URL изображений
UPDATE profiles SET 
    avatar = CONCAT('/api/uploads/', SUBSTRING_INDEX(avatar, '/', -1))
WHERE avatar NOT LIKE '/api/uploads/%' AND avatar NOT LIKE 'http://%' AND avatar NOT LIKE 'https://%' AND avatar != '';

-- Исправляем URL для внешних изображений (если необходимо)
-- UPDATE profiles SET 
--     avatar = CONCAT('/api/uploads/external-', SUBSTRING_INDEX(avatar, '/', -1))
-- WHERE (avatar LIKE 'http://%' OR avatar LIKE 'https://%');

-- Восстанавливаем активность профилей, если это необходимо
-- UPDATE profiles SET is_active = 1 WHERE is_active = 0;

-- Подсчет обновленных записей
SELECT CONCAT('Обновлено профилей: ', COUNT(*)) AS updated_profiles 
FROM profiles 
WHERE avatar = '/api/uploads/default-avatar.jpg' OR avatar LIKE '/api/uploads/%';
EOF
    
    # Выполняем SQL запрос
    echo -e "${BLUE}Выполнение запроса на исправление профилей...${NC}"
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$sql_file"
    
    if [[ $? -eq 0 ]]; then
        echo -e "${GREEN}Профили успешно обновлены.${NC}"
        rm -f "$sql_file"
        return 0
    else
        echo -e "${RED}Ошибка при исправлении профилей.${NC}"
        return 1
    fi
}

# Функция просмотра статистики базы данных
show_database_stats() {
    echo -e "${BLUE}Получение статистики базы данных...${NC}"
    
    if [[ -z "$DB_PASSWORD" ]]; then
        read -s -p "Введите пароль для базы данных: " DB_PASSWORD
        echo
    fi
    
    # Создаем SQL для получения статистики
    local sql_file="/tmp/db_stats.sql"
    cat > "$sql_file" << EOF
-- Размер базы данных
SELECT 
    table_schema as 'Database', 
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' 
FROM information_schema.TABLES 
WHERE table_schema = '${DB_NAME}'
GROUP BY table_schema;

-- Статистика по таблицам
SELECT 
    table_name AS 'Table', 
    table_rows AS 'Rows', 
    ROUND(data_length / 1024 / 1024, 2) AS 'Data Size (MB)', 
    ROUND(index_length / 1024 / 1024, 2) AS 'Index Size (MB)',
    ROUND((data_length + index_length) / 1024 / 1024, 2) AS 'Total Size (MB)'
FROM information_schema.TABLES 
WHERE table_schema = '${DB_NAME}'
ORDER BY (data_length + index_length) DESC;

-- Статистика по профилям
SELECT 
    COUNT(*) AS total_profiles,
    SUM(CASE WHEN avatar IS NOT NULL AND avatar != '' THEN 1 ELSE 0 END) AS with_avatar,
    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS active_profiles
FROM profiles;

-- Статистика по фотографиям
SELECT COUNT(*) AS total_photos FROM photos;

-- Статистика по использованию префиксов URL
SELECT 
    SUBSTRING_INDEX(avatar, '/', 3) AS url_prefix,
    COUNT(*) AS count
FROM profiles
WHERE avatar IS NOT NULL AND avatar != ''
GROUP BY url_prefix
ORDER BY count DESC;

-- Статистика по URL фотографий
SELECT 
    SUBSTRING_INDEX(url, '/', 3) AS url_prefix,
    COUNT(*) AS count
FROM photos
WHERE url IS NOT NULL AND url != ''
GROUP BY url_prefix
ORDER BY count DESC;
EOF
    
    # Выполняем SQL запрос
    echo -e "${BLUE}Выполнение запроса статистики...${NC}"
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$sql_file"
    
    # Удаляем временный файл
    rm -f "$sql_file"
    
    return 0
}

# Вывод подсказки использования
print_usage() {
    echo -e "${BLUE}Использование: $0 [опция]${NC}"
    echo "Опции:"
    echo "  --check-connection   Проверка подключения к базе данных"
    echo "  --backup             Создание резервной копии базы данных"
    echo "  --restore FILE       Восстановление базы данных из указанного файла"
    echo "  --fix-paths [OLD] [NEW]  Исправление путей к изображениям (по умолчанию с /uploads/ на /api/uploads/)"
    echo "  --check-profiles     Проверка целостности профилей"
    echo "  --fix-profiles       Исправление проблем с профилями"
    echo "  --stats              Просмотр статистики базы данных"
    echo "  --help               Показать эту справку"
    echo
    echo "Пример: $0 --backup"
}

# Основная логика скрипта
if [[ $# -eq 0 ]]; then
    print_usage
    exit 0
fi

# Загружаем переменные из .env файла
load_env_vars

# Обработка аргументов командной строки
case $1 in
    --check-connection)
        check_database_connection
        ;;
    --backup)
        check_database_connection && backup_database
        ;;
    --restore)
        if [[ -z "$2" ]]; then
            echo -e "${RED}Ошибка: Не указан файл для восстановления.${NC}"
            print_usage
            exit 1
        fi
        check_database_connection && restore_database "$2"
        ;;
    --fix-paths)
        old_prefix="$2"
        new_prefix="$3"
        check_database_connection && fix_image_paths "$old_prefix" "$new_prefix"
        ;;
    --check-profiles)
        check_database_connection && check_profiles
        ;;
    --fix-profiles)
        check_database_connection && fix_profiles
        ;;
    --stats)
        check_database_connection && show_database_stats
        ;;
    --help)
        print_usage
        ;;
    *)
        echo -e "${RED}Неизвестная опция: $1${NC}"
        print_usage
        exit 1
        ;;
esac

exit 0 
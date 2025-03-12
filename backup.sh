#!/bin/bash

# Скрипт для резервного копирования базы данных

# Директория для резервных копий
BACKUP_DIR="/var/backups/dating-site"
mkdir -p $BACKUP_DIR

# Текущая дата и время
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Имя файла резервной копии с датой
BACKUP_FILE="$BACKUP_DIR/database-$TIMESTAMP.sqlite"

# Путь к базе данных
DB_PATH="/var/www/dating-site/backend/database.sqlite"

# Проверка существования базы данных
if [ ! -f "$DB_PATH" ]; then
    echo "Ошибка: База данных не найдена по пути $DB_PATH"
    exit 1
fi

# Копирование базы данных
echo "Создание резервной копии базы данных..."
cp "$DB_PATH" "$BACKUP_FILE"

# Проверка успешности копирования
if [ $? -ne 0 ]; then
    echo "Ошибка: Не удалось создать резервную копию базы данных"
    exit 1
fi

# Сжатие резервной копии
echo "Сжатие резервной копии..."
gzip "$BACKUP_FILE"

# Проверка успешности сжатия
if [ $? -ne 0 ]; then
    echo "Ошибка: Не удалось сжать резервную копию"
    exit 1
fi

# Удаление старых резервных копий (оставляем последние 7)
echo "Удаление старых резервных копий..."
find "$BACKUP_DIR" -name "database-*.sqlite.gz" -type f -mtime +7 -delete

echo "Резервное копирование завершено успешно!"
echo "Резервная копия сохранена в файле: $BACKUP_FILE.gz" 
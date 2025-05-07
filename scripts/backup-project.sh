#!/bin/bash
#
# Скрипт для полного резервного копирования проекта
# Автор: Claude
# Версия: 1.0
# Дата: 2025-05-07
#
# Использование:
# ./backup-project.sh [--remote user@hostname:/path] [--keep 7]
#
# Для настройки регулярного запуска через cron:
# 0 2 * * * /opt/repo/scripts/backup-project.sh --remote user@backup-server:/backups/escort-bar

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Настройки по умолчанию
REMOTE_BACKUP=""
BACKUP_KEEP_DAYS=7
EXCLUDE_PATTERNS=("node_modules" ".git" "tmp" "logs/*.log")

# Путь к рабочей директории
REPO_DIR="/opt/repo"
WEB_ROOT="/var/www/html/site"
UPLOADS_DIR="/opt/api/uploads"
BACKUP_DIR="/root/backups"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="escort-bar_full_backup_$TIMESTAMP.tar.gz"
LOG_FILE="$REPO_DIR/logs/backup_$TIMESTAMP.log"

# Обработка аргументов командной строки
while [[ $# -gt 0 ]]; do
  case $1 in
    --remote)
      REMOTE_BACKUP="$2"
      shift 2
      ;;
    --keep)
      BACKUP_KEEP_DAYS="$2"
      shift 2
      ;;
    *)
      echo "Неизвестный параметр: $1"
      exit 1
      ;;
  esac
done

# Создание директории для логов и бэкапов, если она не существует
mkdir -p "$REPO_DIR/logs"
mkdir -p "$BACKUP_DIR"

# Начало логирования
exec > >(tee -a "$LOG_FILE") 2>&1

echo "============================================"
echo "Резервное копирование проекта: $(date)"
echo "============================================"
echo ""

# Функция для проверки и отображения статуса выполнения
check_status() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ $1 успешно выполнено${NC}"
  else
    echo -e "${RED}✗ Ошибка: $1${NC}"
    exit 1
  fi
}

# Остановка служб перед бэкапом
echo -e "${YELLOW}Подготовка к резервному копированию...${NC}"

# Резервное копирование базы данных
echo -e "${YELLOW}Резервное копирование базы данных...${NC}"
if [ -f "$REPO_DIR/scripts/database/db-manager.sh" ]; then
  "$REPO_DIR/scripts/database/db-manager.sh" --backup
  check_status "Резервное копирование базы данных"
  DB_BACKUP_FILE=$(find "$REPO_DIR/scripts/database/backups" -type f -name "*.sql.gz" | sort -r | head -n 1)
else
  echo -e "${RED}Скрипт для резервного копирования базы данных не найден${NC}"
  exit 1
fi

# Создание архива проекта
echo -e "${YELLOW}Создание архива проекта...${NC}"

# Создание списка исключений для tar
EXCLUDE_ARGS=""
for pattern in "${EXCLUDE_PATTERNS[@]}"; do
  EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude=$pattern"
done

# Создание архива
tar -czf "$BACKUP_DIR/$BACKUP_FILE" \
  $EXCLUDE_ARGS \
  -C / \
  "${REPO_DIR#/}" \
  "${WEB_ROOT#/}" \
  "${UPLOADS_DIR#/}" \
  "etc/nginx/sites-available" \
  "etc/nginx/sites-enabled" \
  "etc/letsencrypt/live/escort-bar.live" \
  "$DB_BACKUP_FILE"

check_status "Создание архива проекта"

# Удаление временных файлов
if [ -f "$DB_BACKUP_FILE" ]; then
  rm "$DB_BACKUP_FILE"
  check_status "Удаление временного файла базы данных"
fi

# Копирование на удаленный сервер, если указан
if [ ! -z "$REMOTE_BACKUP" ]; then
  echo -e "${YELLOW}Копирование архива на удаленный сервер: $REMOTE_BACKUP${NC}"
  
  # Проверка наличия директории на удаленном сервере
  REMOTE_HOST=$(echo "$REMOTE_BACKUP" | cut -d':' -f1)
  REMOTE_PATH=$(echo "$REMOTE_BACKUP" | cut -d':' -f2)
  
  ssh "$REMOTE_HOST" "mkdir -p $REMOTE_PATH"
  check_status "Создание удаленной директории"
  
  # Копирование файла на удаленный сервер
  scp "$BACKUP_DIR/$BACKUP_FILE" "$REMOTE_BACKUP/"
  check_status "Копирование архива на удаленный сервер"
  
  echo -e "${GREEN}Архив успешно скопирован на: $REMOTE_BACKUP/$BACKUP_FILE${NC}"
fi

# Информация о размере архива
BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
echo -e "${GREEN}Резервная копия создана: $BACKUP_DIR/$BACKUP_FILE (размер: $BACKUP_SIZE)${NC}"

# Удаление старых резервных копий
echo -e "${YELLOW}Удаление устаревших резервных копий (старше $BACKUP_KEEP_DAYS дней)...${NC}"
find "$BACKUP_DIR" -name "escort-bar_full_backup_*.tar.gz" -type f -mtime +$BACKUP_KEEP_DAYS -delete
check_status "Удаление устаревших резервных копий"

# Если настроено удаленное хранилище, удаляем старые копии и там
if [ ! -z "$REMOTE_BACKUP" ]; then
  echo -e "${YELLOW}Удаление устаревших резервных копий на удаленном сервере...${NC}"
  ssh "$REMOTE_HOST" "find $REMOTE_PATH -name 'escort-bar_full_backup_*.tar.gz' -type f -mtime +$BACKUP_KEEP_DAYS -delete"
  check_status "Удаление устаревших резервных копий на удаленном сервере"
fi

echo -e "${GREEN}Резервное копирование успешно завершено: $(date)${NC}"
echo "Лог сохранен в: $LOG_FILE"

# Инструкция по восстановлению
echo -e "\n${YELLOW}Инструкция по восстановлению:${NC}"
echo "1. Распакуйте архив: tar -xzf $BACKUP_FILE -C /"
echo "2. Восстановите базу данных: ./scripts/database/db-manager.sh --restore /path/to/database_backup.sql.gz"
echo "3. Перезапустите службы: systemctl restart nginx && pm2 restart all"
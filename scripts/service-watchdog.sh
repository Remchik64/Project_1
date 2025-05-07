#!/bin/bash
#
# Скрипт для проверки и перезапуска упавших сервисов
# Автор: Claude
# Версия: 1.0
# Дата: 2025-05-07
#
# Использование:
# ./service-watchdog.sh [--notify-email admin@example.com]
#
# Для настройки регулярного запуска через cron:
# */15 * * * * /opt/repo/scripts/service-watchdog.sh --notify-email admin@example.com

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Настройки по умолчанию
NOTIFY_EMAIL=""
MAX_RESTART_ATTEMPTS=3
LOCKFILE="/tmp/service-watchdog.lock"
SITE_URL="https://escort-bar.live"
API_HEALTH_URL="$SITE_URL/api/health"

# Путь к рабочей директории
REPO_DIR="/opt/repo"
LOG_DIR="$REPO_DIR/logs"
LOG_FILE="$LOG_DIR/service_watchdog.log"

# Обработка аргументов командной строки
while [[ $# -gt 0 ]]; do
  case $1 in
    --notify-email)
      NOTIFY_EMAIL="$2"
      shift 2
      ;;
    *)
      echo "Неизвестный параметр: $1"
      exit 1
      ;;
  esac
done

# Проверка на уже запущенный экземпляр
if [ -f "$LOCKFILE" ]; then
  LOCK_PID=$(cat "$LOCKFILE")
  if ps -p $LOCK_PID > /dev/null; then
    echo "Другой экземпляр скрипта уже запущен (PID: $LOCK_PID). Выход."
    exit 1
  else
    echo "Обнаружен устаревший lock-файл. Удаляем."
    rm -f "$LOCKFILE"
  fi
fi

# Создание lock-файла
echo $$ > "$LOCKFILE"

# Создание директории для логов
mkdir -p "$LOG_DIR"

# Функция для логирования
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Функция для отправки уведомлений
send_notification() {
  if [ ! -z "$NOTIFY_EMAIL" ]; then
    log "Отправка уведомления на $NOTIFY_EMAIL"
    echo "$1" | mail -s "Watchdog: $2" "$NOTIFY_EMAIL"
  fi
}

# Функция очистки при выходе
cleanup() {
  rm -f "$LOCKFILE"
  log "Работа скрипта завершена"
  exit 0
}

# Устанавливаем trap для очистки при выходе
trap cleanup EXIT INT TERM

log "Запуск проверки сервисов"

# Проверка Nginx
check_nginx() {
  log "Проверка Nginx..."
  if ! systemctl is-active nginx >/dev/null 2>&1; then
    log "${RED}Nginx не запущен. Попытка перезапуска...${NC}"
    
    # Проверка конфигурации перед перезапуском
    nginx -t >/dev/null 2>&1
    if [ $? -ne 0 ]; then
      log "${RED}Ошибка в конфигурации Nginx. Отправка уведомления.${NC}"
      ERROR_OUTPUT=$(nginx -t 2>&1)
      send_notification "Ошибка в конфигурации Nginx:\n\n$ERROR_OUTPUT" "Ошибка конфигурации Nginx"
      return 1
    fi
    
    # Перезапуск Nginx
    systemctl restart nginx
    if [ $? -eq 0 ]; then
      log "${GREEN}Nginx успешно перезапущен${NC}"
      send_notification "Сервис Nginx был остановлен и успешно перезапущен." "Nginx перезапущен"
    else
      log "${RED}Ошибка при перезапуске Nginx${NC}"
      ERROR_OUTPUT=$(systemctl status nginx 2>&1)
      send_notification "Не удалось перезапустить Nginx:\n\n$ERROR_OUTPUT" "Ошибка перезапуска Nginx"
      return 1
    fi
  else
    log "${GREEN}Nginx работает нормально${NC}"
  fi
  
  return 0
}

# Проверка PM2 и backend
check_pm2() {
  log "Проверка PM2 и backend..."
  
  # Проверка, установлен ли PM2
  if ! command -v pm2 >/dev/null 2>&1; then
    log "${RED}PM2 не установлен${NC}"
    send_notification "PM2 не установлен на сервере" "PM2 не найден"
    return 1
  fi
  
  # Проверка статуса backend
  if ! pm2 list | grep -q "backend"; then
    log "${RED}Процесс backend не найден в PM2. Попытка запуска...${NC}"
    
    cd "$REPO_DIR/backend"
    pm2 start index.js --name backend
    
    if [ $? -eq 0 ]; then
      log "${GREEN}Backend успешно запущен${NC}"
      send_notification "Процесс backend был запущен через PM2." "Backend запущен"
    else
      log "${RED}Ошибка при запуске backend${NC}"
      ERROR_OUTPUT=$(pm2 logs backend --lines 20 2>&1)
      send_notification "Не удалось запустить backend:\n\n$ERROR_OUTPUT" "Ошибка запуска backend"
      return 1
    fi
  else
    # Проверка, что процесс не в статусе errored/stopped
    if pm2 list | grep -E "backend.*(?:errored|stopped)"; then
      log "${RED}Процесс backend в ошибке или остановлен. Попытка перезапуска...${NC}"
      
      pm2 restart backend
      
      if [ $? -eq 0 ]; then
        log "${GREEN}Backend успешно перезапущен${NC}"
        send_notification "Процесс backend был перезапущен." "Backend перезапущен"
      else
        log "${RED}Ошибка при перезапуске backend${NC}"
        ERROR_OUTPUT=$(pm2 logs backend --lines 20 2>&1)
        send_notification "Не удалось перезапустить backend:\n\n$ERROR_OUTPUT" "Ошибка перезапуска backend"
        return 1
      fi
    else
      log "${GREEN}Backend работает нормально${NC}"
    fi
  fi
  
  return 0
}

# Проверка доступности сайта
check_site_availability() {
  log "Проверка доступности сайта..."
  
  # Проверка доступности frontend
  FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL")
  
  if [ "$FRONTEND_STATUS" -ne 200 ]; then
    log "${RED}Frontend недоступен (HTTP статус: $FRONTEND_STATUS)${NC}"
    send_notification "Frontend сайта недоступен. HTTP статус: $FRONTEND_STATUS" "Frontend недоступен"
    return 1
  else
    log "${GREEN}Frontend доступен${NC}"
  fi
  
  # Проверка доступности API
  API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_HEALTH_URL")
  
  if [ "$API_STATUS" -ne 200 ]; then
    log "${RED}API недоступен (HTTP статус: $API_STATUS)${NC}"
    send_notification "API сайта недоступен. HTTP статус: $API_STATUS" "API недоступен"
    return 1
  else
    log "${GREEN}API доступен${NC}"
  fi
  
  return 0
}

# Основная логика проверки и перезапуска сервисов
check_services() {
  # Проверка Nginx
  check_nginx
  local nginx_status=$?
  
  # Проверка PM2 и backend
  check_pm2
  local pm2_status=$?
  
  # Проверка доступности сайта
  check_site_availability
  local site_status=$?
  
  # Если все проверки прошли успешно
  if [ $nginx_status -eq 0 ] && [ $pm2_status -eq 0 ] && [ $site_status -eq 0 ]; then
    log "${GREEN}Все сервисы работают нормально${NC}"
    return 0
  else
    log "${RED}Обнаружены проблемы с сервисами${NC}"
    return 1
  fi
}

# Запуск проверки сервисов
check_services

# Очистка lock-файла
cleanup
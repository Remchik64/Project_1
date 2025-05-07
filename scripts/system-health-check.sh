#!/bin/bash
#
# Скрипт для проверки состояния системы
# Автор: Claude
# Версия: 1.0
# Дата: 2025-05-07
#
# Использование:
# ./system-health-check.sh [--email admin@example.com] [--notify-threshold 85]
#
# Для настройки регулярного запуска через cron:
# 0 */4 * * * /opt/repo/scripts/system-health-check.sh --email admin@example.com

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Настройки по умолчанию
EMAIL_RECIPIENT=""
DISK_THRESHOLD=85 # Процент использования диска для оповещения
MEMORY_THRESHOLD=90 # Процент использования памяти для оповещения
CPU_THRESHOLD=90 # Процент использования CPU для оповещения
NOTIFY=false

# Путь к рабочей директории
REPO_DIR="/opt/repo"
LOG_DIR="$REPO_DIR/logs"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
REPORT_FILE="$LOG_DIR/health_report_$TIMESTAMP.log"

# Обработка аргументов командной строки
while [[ $# -gt 0 ]]; do
  case $1 in
    --email)
      EMAIL_RECIPIENT="$2"
      NOTIFY=true
      shift 2
      ;;
    --notify-threshold)
      DISK_THRESHOLD="$2"
      MEMORY_THRESHOLD="$2"
      CPU_THRESHOLD="$2"
      shift 2
      ;;
    *)
      echo "Неизвестный параметр: $1"
      exit 1
      ;;
  esac
done

# Создание директории для логов, если она не существует
mkdir -p "$LOG_DIR"

# Запись заголовка отчета
echo "============================================" | tee -a "$REPORT_FILE"
echo "Отчет о состоянии системы: $(date)" | tee -a "$REPORT_FILE"
echo "============================================" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# Проверка загрузки системы
echo "## Загрузка системы ##" | tee -a "$REPORT_FILE"
LOAD=$(uptime | awk -F'[a-z]:' '{ print $2}')
echo "Загрузка: $LOAD" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# Проверка использования CPU
echo "## Использование CPU ##" | tee -a "$REPORT_FILE"
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}')
CPU_STATUS="OK"
if (( $(echo "$CPU_USAGE > $CPU_THRESHOLD" | bc -l) )); then
  CPU_STATUS="${RED}ВНИМАНИЕ${NC}"
fi
echo "Использование CPU: $CPU_USAGE% - Статус: $CPU_STATUS" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# Проверка использования памяти
echo "## Использование памяти ##" | tee -a "$REPORT_FILE"
free -m | tee -a "$REPORT_FILE"
MEMORY_USAGE=$(free | grep Mem | awk '{print $3/$2 * 100.0}' | cut -d. -f1)
MEMORY_STATUS="OK"
if [ "$MEMORY_USAGE" -gt "$MEMORY_THRESHOLD" ]; then
  MEMORY_STATUS="${RED}ВНИМАНИЕ${NC}"
fi
echo "Использование памяти: $MEMORY_USAGE% - Статус: $MEMORY_STATUS" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# Проверка использования диска
echo "## Использование диска ##" | tee -a "$REPORT_FILE"
df -h | tee -a "$REPORT_FILE"
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
DISK_STATUS="OK"
if [ "$DISK_USAGE" -gt "$DISK_THRESHOLD" ]; then
  DISK_STATUS="${RED}ВНИМАНИЕ${NC}"
fi
echo "Использование диска: $DISK_USAGE% - Статус: $DISK_STATUS" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# Проверка активных сетевых соединений
echo "## Сетевые соединения ##" | tee -a "$REPORT_FILE"
netstat -an | grep ESTABLISHED | wc -l | awk '{print "Активных соединений: " $1}' | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# Проверка статуса Nginx
echo "## Статус Nginx ##" | tee -a "$REPORT_FILE"
if systemctl is-active nginx >/dev/null 2>&1; then
  echo "Nginx: ${GREEN}запущен${NC}" | tee -a "$REPORT_FILE"
else
  echo "Nginx: ${RED}не запущен${NC}" | tee -a "$REPORT_FILE"
fi
echo "" | tee -a "$REPORT_FILE"

# Проверка статуса PM2
echo "## Статус PM2 ##" | tee -a "$REPORT_FILE"
if command -v pm2 >/dev/null 2>&1; then
  pm2 list | tee -a "$REPORT_FILE"
else
  echo "PM2 не установлен" | tee -a "$REPORT_FILE"
fi
echo "" | tee -a "$REPORT_FILE"

# Проверка последних ошибок в логах Nginx
echo "## Последние ошибки Nginx ##" | tee -a "$REPORT_FILE"
if [ -f /var/log/nginx/error.log ]; then
  tail -n 20 /var/log/nginx/error.log | tee -a "$REPORT_FILE"
else
  echo "Лог-файл Nginx не найден" | tee -a "$REPORT_FILE"
fi
echo "" | tee -a "$REPORT_FILE"

# Проверка SSL сертификатов
echo "## Статус SSL сертификатов ##" | tee -a "$REPORT_FILE"
if [ -d /etc/letsencrypt/live/escort-bar.live ]; then
  CERT_EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/escort-bar.live/fullchain.pem | cut -d= -f2)
  echo "Сертификат действителен до: $CERT_EXPIRY" | tee -a "$REPORT_FILE"
  
  # Проверка срока действия сертификата
  CERT_EXPIRY_SECONDS=$(date -d "$CERT_EXPIRY" +%s)
  CURRENT_SECONDS=$(date +%s)
  DAYS_LEFT=$(( (CERT_EXPIRY_SECONDS - CURRENT_SECONDS) / 86400 ))
  
  if [ "$DAYS_LEFT" -lt 15 ]; then
    echo "${RED}ВНИМАНИЕ: SSL сертификат истекает через $DAYS_LEFT дней${NC}" | tee -a "$REPORT_FILE"
  else
    echo "${GREEN}Сертификат действителен еще $DAYS_LEFT дней${NC}" | tee -a "$REPORT_FILE"
  fi
else
  echo "${RED}SSL сертификаты не найдены${NC}" | tee -a "$REPORT_FILE"
fi
echo "" | tee -a "$REPORT_FILE"

# Проверка доступности сайта
echo "## Доступность сайта ##" | tee -a "$REPORT_FILE"
if command -v curl >/dev/null 2>&1; then
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://escort-bar.live)
  if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "Сайт доступен: ${GREEN}OK (HTTP $HTTP_STATUS)${NC}" | tee -a "$REPORT_FILE"
  else
    echo "Сайт недоступен: ${RED}ОШИБКА (HTTP $HTTP_STATUS)${NC}" | tee -a "$REPORT_FILE"
  fi
  
  # Проверка API
  API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://escort-bar.live/api/health)
  if [ "$API_STATUS" -eq 200 ]; then
    echo "API доступен: ${GREEN}OK (HTTP $API_STATUS)${NC}" | tee -a "$REPORT_FILE"
  else
    echo "API недоступен: ${RED}ОШИБКА (HTTP $API_STATUS)${NC}" | tee -a "$REPORT_FILE"
  fi
else
  echo "curl не установлен, проверка недоступна" | tee -a "$REPORT_FILE"
fi
echo "" | tee -a "$REPORT_FILE"

# Определение общего статуса системы
SYSTEM_STATUS="OK"
if [ "$DISK_USAGE" -gt "$DISK_THRESHOLD" ] || [ "$MEMORY_USAGE" -gt "$MEMORY_THRESHOLD" ] || (( $(echo "$CPU_USAGE > $CPU_THRESHOLD" | bc -l) )); then
  SYSTEM_STATUS="ВНИМАНИЕ"
fi

if [ "$SYSTEM_STATUS" = "ВНИМАНИЕ" ] && [ "$NOTIFY" = true ] && [ ! -z "$EMAIL_RECIPIENT" ]; then
  # Отправка уведомления по электронной почте
  echo "Отправка уведомления на $EMAIL_RECIPIENT" | tee -a "$REPORT_FILE"
  cat "$REPORT_FILE" | mail -s "ВНИМАНИЕ: Проблемы с сервером escort-bar.live" "$EMAIL_RECIPIENT"
fi

echo "Отчет сохранен в: $REPORT_FILE"

# Сделаем ротацию логов, оставив только последние 30 отчетов
find "$LOG_DIR" -name "health_report_*.log" -type f -mtime +30 -delete 
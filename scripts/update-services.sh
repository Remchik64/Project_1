#!/bin/bash
#
# Скрипт для автоматизированного обновления приложения
# Автор: Claude
# Версия: 1.0
# Дата: 2025-05-07

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Путь к рабочей директории
REPO_DIR="/opt/repo"
BACKEND_DIR="$REPO_DIR/backend"
FRONTEND_DIR="$REPO_DIR/frontend"
WEB_ROOT="/var/www/html/site"

# Логирование
LOG_FILE="$REPO_DIR/update-$(date +%Y-%m-%d_%H-%M-%S).log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo -e "${GREEN}Запуск обновления: $(date)${NC}"
echo "-------------------------------------------"

# Проверка прав
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}Предупреждение: Скрипт запущен не от имени root${NC}"
  echo -e "${YELLOW}Некоторые операции могут завершиться с ошибкой${NC}"
fi

# Функция проверки ошибок
check_error() {
  if [ $? -ne 0 ]; then
    echo -e "${RED}Ошибка: $1${NC}"
    exit 1
  else
    echo -e "${GREEN}✓ $1 успешно выполнено${NC}"
  fi
}

# Проверка состояния системы
echo -e "${YELLOW}Проверка состояния системы...${NC}"
df -h | grep -E '/$|/var'
echo "-------------------------------------------"
free -m
echo "-------------------------------------------"
uptime
echo "-------------------------------------------"

# Обновление кода из репозитория
if [ -d "$REPO_DIR/.git" ]; then
  echo -e "${YELLOW}Обновление кода из репозитория...${NC}"
  cd "$REPO_DIR"
  git pull
  check_error "Обновление кода"
fi

# Обновление зависимостей backend
if [ -d "$BACKEND_DIR" ]; then
  echo -e "${YELLOW}Обновление зависимостей backend...${NC}"
  cd "$BACKEND_DIR"
  npm install --production
  check_error "Установка зависимостей backend"
fi

# Проверка конфигурации backend
if [ -f "$BACKEND_DIR/.env" ]; then
  echo -e "${YELLOW}Проверка конфигурации backend...${NC}"
  cd "$BACKEND_DIR"
  node -e "try { require('dotenv').config(); console.log('Конфигурация загружена успешно') } catch(e) { console.error(e); process.exit(1) }"
  check_error "Проверка конфигурации backend"
fi

# Перезапуск backend через PM2
echo -e "${YELLOW}Перезапуск backend через PM2...${NC}"
if pm2 list | grep -q "backend"; then
  pm2 reload backend
  check_error "Перезапуск backend через PM2"
else
  cd "$BACKEND_DIR"
  pm2 start index.js --name backend
  check_error "Запуск backend через PM2"
fi

# Обновление зависимостей frontend
if [ -d "$FRONTEND_DIR" ]; then
  echo -e "${YELLOW}Обновление зависимостей frontend...${NC}"
  cd "$FRONTEND_DIR"
  npm install
  check_error "Установка зависимостей frontend"
fi

# Сборка frontend
if [ -d "$FRONTEND_DIR" ]; then
  echo -e "${YELLOW}Сборка frontend...${NC}"
  cd "$FRONTEND_DIR"
  npm run build
  check_error "Сборка frontend"
  
  # Резервное копирование текущей версии frontend
  if [ -d "$WEB_ROOT" ]; then
    echo -e "${YELLOW}Резервное копирование текущей версии frontend...${NC}"
    BACKUP_DIR="/tmp/web_backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    cp -r "$WEB_ROOT"/* "$BACKUP_DIR"/ 2>/dev/null || true
    check_error "Резервное копирование frontend"
  fi
  
  # Обновление frontend в директории Nginx
  echo -e "${YELLOW}Обновление frontend в директории Nginx...${NC}"
  mkdir -p "$WEB_ROOT"
  rm -rf "$WEB_ROOT"/*
  cp -r "$FRONTEND_DIR/build"/* "$WEB_ROOT"/
  check_error "Обновление frontend в директории Nginx"
fi

# Обновление конфигурации Nginx
if [ -f "$REPO_DIR/config/nginx/escort-bar.live.conf" ]; then
  echo -e "${YELLOW}Обновление конфигурации Nginx...${NC}"
  cp "$REPO_DIR/config/nginx/escort-bar.live.conf" /etc/nginx/sites-available/escort-bar.live
  check_error "Копирование конфигурации Nginx"
  
  # Проверка конфигурации Nginx
  echo -e "${YELLOW}Проверка конфигурации Nginx...${NC}"
  nginx -t
  check_error "Проверка конфигурации Nginx"
  
  # Перезапуск Nginx
  echo -e "${YELLOW}Перезапуск Nginx...${NC}"
  systemctl restart nginx
  check_error "Перезапуск Nginx"
fi

# Проверка состояния после обновления
echo -e "${YELLOW}Проверка состояния после обновления...${NC}"
echo "-------------------------------------------"
if command -v curl &> /dev/null; then
  echo -e "${YELLOW}Проверка доступности frontend...${NC}"
  curl -sSI https://escort-bar.live/ | head -n 1
  
  echo -e "${YELLOW}Проверка доступности backend...${NC}"
  curl -sSI https://escort-bar.live/api/health | head -n 1
fi

echo -e "${GREEN}Обновление успешно завершено: $(date)${NC}"
echo "-------------------------------------------"
echo -e "${YELLOW}Лог обновления сохранен в: $LOG_FILE${NC}" 
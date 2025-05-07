#!/bin/bash

# Скрипт для обновления городских страниц и перезагрузки Nginx
# Author: Claude
# Version: 1.0
# Date: 2025-05-08
#
# Этот скрипт запускает генерацию статических HTML-страниц для городов,
# обновляет sitemap.xml и перезагружает конфигурацию Nginx.
#
# Использование:
# ./update-city-pages.sh [--no-reload]

# Цвета для вывода
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
RESET="\033[0m"

# Путь к корневой директории проекта
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
SCRIPTS_DIR="$PROJECT_ROOT/scripts"

# Пути для уведомления поисковых систем
GOOGLE_PING_URL="https://www.google.com/ping?sitemap=https://escort-bar.live/sitemap.xml"
YANDEX_PING_URL="https://webmaster.yandex.ru/ping?sitemap=https://escort-bar.live/sitemap.xml"
BING_PING_URL="https://www.bing.com/ping?sitemap=https://escort-bar.live/sitemap.xml"

# Определяем, нужно ли перезагружать Nginx
RELOAD_NGINX=true
if [[ "$1" == "--no-reload" ]]; then
    RELOAD_NGINX=false
fi

# Функция для логирования
log() {
    local message="$1"
    local level="$2"
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    
    case "$level" in
        "info") echo -e "${GREEN}[INFO]${RESET} $timestamp - $message" ;;
        "warn") echo -e "${YELLOW}[WARN]${RESET} $timestamp - $message" ;;
        "error") echo -e "${RED}[ERROR]${RESET} $timestamp - $message" ;;
        *) echo -e "$timestamp - $message" ;;
    esac
}

# Проверка наличия необходимых команд
check_commands() {
    local required_commands=("node" "npm" "curl")
    local missing_commands=()
    
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            missing_commands+=("$cmd")
        fi
    done
    
    if [ ${#missing_commands[@]} -gt 0 ]; then
        log "Отсутствуют необходимые команды: ${missing_commands[*]}" "error"
        exit 1
    fi
}

# Генерация городских страниц
generate_city_pages() {
    log "Генерация статических HTML-страниц для городов..." "info"
    cd "$PROJECT_ROOT"
    
    if node "$SCRIPTS_DIR/generate-city-pages.js"; then
        log "Городские страницы успешно сгенерированы" "info"
        return 0
    else
        log "Ошибка при генерации городских страниц" "error"
        return 1
    fi
}

# Обновление sitemap.xml
update_sitemap() {
    log "Обновление sitemap.xml..." "info"
    cd "$PROJECT_ROOT"
    
    if node "$SCRIPTS_DIR/generate-sitemap.js"; then
        log "sitemap.xml успешно обновлен" "info"
        return 0
    else
        log "Ошибка при обновлении sitemap.xml" "error"
        return 1
    fi
}

# Уведомление поисковых систем об обновлении sitemap
notify_search_engines() {
    log "Уведомление поисковых систем об обновлении sitemap.xml..." "info"
    
    # Google
    if curl -s "$GOOGLE_PING_URL" > /dev/null; then
        log "Google успешно уведомлен" "info"
    else
        log "Не удалось уведомить Google" "warn"
    fi
    
    # Yandex
    if curl -s "$YANDEX_PING_URL" > /dev/null; then
        log "Яндекс успешно уведомлен" "info"
    else
        log "Не удалось уведомить Яндекс" "warn"
    fi
    
    # Bing
    if curl -s "$BING_PING_URL" > /dev/null; then
        log "Bing успешно уведомлен" "info"
    else
        log "Не удалось уведомить Bing" "warn"
    fi
}

# Перезагрузка конфигурации Nginx
reload_nginx() {
    if [ "$RELOAD_NGINX" = false ]; then
        log "Пропуск перезагрузки Nginx (параметр --no-reload)" "info"
        return 0
    fi
    
    log "Проверка конфигурации Nginx..." "info"
    
    if sudo nginx -t; then
        log "Конфигурация Nginx валидна, перезагрузка..." "info"
        if sudo systemctl reload nginx; then
            log "Nginx успешно перезагружен" "info"
            return 0
        else
            log "Ошибка при перезагрузке Nginx" "error"
            return 1
        fi
    else
        log "Конфигурация Nginx содержит ошибки, перезагрузка отменена" "error"
        return 1
    fi
}

# Проверка существования директории для городских страниц
check_city_directory() {
    local city_dir="$FRONTEND_DIR/public/city"
    
    if [ ! -d "$city_dir" ]; then
        log "Создание директории для городских страниц: $city_dir" "info"
        mkdir -p "$city_dir"
    fi
}

# Главная функция
main() {
    log "Начало процесса обновления городских страниц" "info"
    
    check_commands
    check_city_directory
    
    # Генерация городских страниц
    if ! generate_city_pages; then
        log "Процесс прерван из-за ошибки при генерации городских страниц" "error"
        exit 1
    fi
    
    # Обновление sitemap.xml
    if ! update_sitemap; then
        log "Процесс прерван из-за ошибки при обновлении sitemap.xml" "error"
        exit 1
    fi
    
    # Перезагрузка Nginx
    if ! reload_nginx; then
        log "Процесс продолжен несмотря на ошибку при перезагрузке Nginx" "warn"
    fi
    
    # Уведомление поисковых систем
    notify_search_engines
    
    log "Процесс обновления городских страниц успешно завершен" "info"
}

# Запускаем основную функцию
main 
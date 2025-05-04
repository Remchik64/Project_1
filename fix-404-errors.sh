#!/bin/bash

# fix-404-errors.sh - Скрипт для настройки правильной обработки 404 ошибок в Nginx
# Автор: Claude
# Дата создания: 2023-05-15

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Настройка правильной обработки 404 ошибок для сайта escort-bar.live${NC}"
echo

# Проверяем, запущен ли скрипт с привилегиями sudo
if [ "$(id -u)" != "0" ]; then
   echo -e "${RED}Этот скрипт должен быть запущен с привилегиями sudo${NC}"
   echo "Пожалуйста, запустите: sudo $0"
   exit 1
fi

# Путь к корневой директории сайта
SITE_ROOT="/var/www/html/site"
# Путь к конфигурации Nginx
NGINX_CONF="/etc/nginx/sites-enabled/escort-bar.live"
# Бэкап текущей конфигурации
BACKUP_DATE=$(date +"%Y%m%d_%H%M%S")
NGINX_BACKUP="/etc/nginx/sites-enabled/escort-bar.live.bak.$BACKUP_DATE"

# Создание бэкапа текущей конфигурации Nginx
echo -e "${GREEN}1. Создание резервной копии текущей конфигурации Nginx${NC}"
if [ -f "$NGINX_CONF" ]; then
    cp "$NGINX_CONF" "$NGINX_BACKUP"
    echo -e "${GREEN}✓ Бэкап создан: $NGINX_BACKUP${NC}"
else
    echo -e "${RED}✗ Файл конфигурации Nginx не найден: $NGINX_CONF${NC}"
    exit 1
fi
echo

# Копирование новой конфигурации Nginx
echo -e "${GREEN}2. Установка новой конфигурации Nginx${NC}"
if [ -f "nginx-404-fix.conf" ]; then
    cp "nginx-404-fix.conf" "$NGINX_CONF"
    echo -e "${GREEN}✓ Новая конфигурация установлена: $NGINX_CONF${NC}"
else
    echo -e "${RED}✗ Файл с новой конфигурацией не найден: nginx-404-fix.conf${NC}"
    echo -e "${RED}  Пожалуйста, убедитесь, что файл существует в текущей директории${NC}"
    exit 1
fi
echo

# Создание страницы 404
echo -e "${GREEN}3. Установка страницы 404${NC}"
if [ -f "404.html" ]; then
    cp "404.html" "$SITE_ROOT/404.html"
    # Установка правильных прав доступа
    chown www-data:www-data "$SITE_ROOT/404.html"
    chmod 644 "$SITE_ROOT/404.html"
    echo -e "${GREEN}✓ Страница 404 установлена: $SITE_ROOT/404.html${NC}"
else
    echo -e "${RED}✗ Файл страницы 404 не найден: 404.html${NC}"
    echo -e "${RED}  Пожалуйста, убедитесь, что файл существует в текущей директории${NC}"
    exit 1
fi
echo

# Проверка конфигурации Nginx
echo -e "${GREEN}4. Проверка синтаксиса конфигурации Nginx${NC}"
nginx -t
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Ошибка в конфигурации Nginx${NC}"
    echo -e "${YELLOW}Восстанавливаем предыдущую конфигурацию...${NC}"
    cp "$NGINX_BACKUP" "$NGINX_CONF"
    echo -e "${GREEN}✓ Предыдущая конфигурация восстановлена${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Конфигурация Nginx корректна${NC}"
fi
echo

# Перезагрузка Nginx
echo -e "${GREEN}5. Перезагрузка Nginx${NC}"
systemctl reload nginx
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Ошибка при перезагрузке Nginx${NC}"
    echo -e "${YELLOW}Попробуйте вручную выполнить: sudo systemctl reload nginx${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Nginx успешно перезагружен${NC}"
fi
echo

echo -e "${GREEN}Настройка 404 ошибок успешно завершена!${NC}"
echo -e "${YELLOW}Рекомендуется проверить работу сайта и корректность обработки 404 ошибок${NC}"
echo -e "${YELLOW}Используйте скрипт: ./verify-404-handling.sh${NC}"
echo

echo -e "${GREEN}Информация:${NC}"
echo "1. Созданы файлы:"
echo "   - Конфигурация Nginx: $NGINX_CONF"
echo "   - Страница 404: $SITE_ROOT/404.html"
echo "2. Резервная копия конфигурации: $NGINX_BACKUP"
echo
echo -e "${YELLOW}При необходимости вы можете восстановить предыдущую конфигурацию:${NC}"
echo "sudo cp $NGINX_BACKUP $NGINX_CONF"
echo "sudo systemctl reload nginx" 
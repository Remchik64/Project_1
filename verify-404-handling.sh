#!/bin/bash

# Скрипт для проверки правильной обработки 404 ошибок на сайте

# Определение цветов для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Проверка обработки 404 ошибок на сайте escort-bar.live${NC}"
echo "-------------------------------------------------------"

# Функция для тестирования URL и проверки кода ответа
check_url() {
    local url=$1
    local expected_code=$2
    local description=$3
    
    # Получаем HTTP код ответа
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$status_code" -eq "$expected_code" ]; then
        echo -e "${GREEN}✅ $description: $url возвращает $status_code как и ожидалось${NC}"
    else
        echo -e "${RED}❌ $description: $url возвращает $status_code вместо ожидаемого $expected_code${NC}"
    fi
}

# Тестирование несуществующих статических файлов
echo -e "${YELLOW}Тестирование несуществующих статических файлов:${NC}"
check_url "https://escort-bar.live/nonexistent-file.js" 404 "Несуществующий JS файл"
check_url "https://escort-bar.live/images/nonexistent.jpg" 404 "Несуществующее изображение"
check_url "https://escort-bar.live/styles/nonexistent.css" 404 "Несуществующий CSS файл"

echo ""

# Тестирование несуществующих API маршрутов
echo -e "${YELLOW}Тестирование несуществующих API маршрутов:${NC}"
check_url "https://escort-bar.live/api/nonexistent" 404 "Несуществующий API маршрут"

echo ""

# Тестирование несуществующих страниц
echo -e "${YELLOW}Тестирование специальных 404 маршрутов:${NC}"
check_url "https://escort-bar.live/nonexistent/" 404 "Специальный маршрут /nonexistent/"
check_url "https://escort-bar.live/notfound/" 404 "Специальный маршрут /notfound/"
check_url "https://escort-bar.live/unknown/" 404 "Специальный маршрут /unknown/"
check_url "https://escort-bar.live/404/" 404 "Специальный маршрут /404/"

echo ""

# Тестирование рандомных несуществующих страниц
echo -e "${YELLOW}Тестирование случайных несуществующих страниц:${NC}"
random_path1=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 10 | head -n 1)
random_path2=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 10 | head -n 1)

check_url "https://escort-bar.live/$random_path1" 200 "Случайный несуществующий путь 1 (SPA должен обрабатывать)"
check_url "https://escort-bar.live/$random_path2" 200 "Случайный несуществующий путь 2 (SPA должен обрабатывать)"

echo ""
echo -e "${YELLOW}ПРИМЕЧАНИЕ:${NC} Для SPA (React) приложений нормально, что случайные несуществующие пути возвращают 200,"
echo "поскольку они перенаправляются на клиентскую маршрутизацию. Важно, чтобы статические файлы и API"
echo "маршруты правильно возвращали 404."
echo ""
echo -e "${GREEN}Проверка завершена. Результаты выше указывают на проблемы, которые нужно исправить, если они есть.${NC}"

echo -e "${YELLOW}Инструкции:${NC}"
echo "1. Скопируйте этот скрипт на сервер"
echo "2. Сделайте его исполняемым: chmod +x verify-404-handling.sh"
echo "3. Запустите его: ./verify-404-handling.sh"
echo
echo -e "${YELLOW}Интерпретация результатов:${NC}"
echo "- Если все проверки отмечены ${GREEN}✓${NC}, ваша настройка 404 ошибок корректна."
echo "- Если некоторые проверки отмечены ${RED}✗${NC}, необходимо исправить настройку."
echo
echo -e "${YELLOW}Примечание:${NC}"
echo "После обновления настроек Nginx, проверьте в Яндекс.Вебмастер,"
echo "устранены ли ошибки с отсутствующими страницами." 
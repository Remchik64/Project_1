#!/bin/bash

# verify-404-handling.sh - Скрипт для проверки правильной обработки 404 ошибок
# Автор: Claude
# Дата создания: 2023-05-15

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Проверка обработки 404 ошибок для сайта escort-bar.live${NC}"
echo

# Проверка доступности сайта
echo -e "${GREEN}1. Проверка доступности сайта${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://escort-bar.live)
if [ "$HTTP_CODE" == "200" ]; then
  echo -e "${GREEN}✓ Сайт доступен (HTTP код: $HTTP_CODE)${NC}"
else
  echo -e "${RED}✗ Сайт недоступен (HTTP код: $HTTP_CODE)${NC}"
  exit 1
fi
echo

# Проверка обработки 404 для несуществующей страницы
echo -e "${GREEN}2. Проверка обработки 404 для несуществующей страницы${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://escort-bar.live/page-does-not-exist-123456789)
if [ "$HTTP_CODE" == "404" ]; then
  echo -e "${GREEN}✓ Несуществующая страница возвращает 404 (HTTP код: $HTTP_CODE)${NC}"
else
  echo -e "${RED}✗ Несуществующая страница возвращает некорректный код (HTTP код: $HTTP_CODE)${NC}"
  echo -e "${YELLOW}   Ожидается: 404, Получено: $HTTP_CODE${NC}"
fi
echo

# Проверка обработки 404 для несуществующего API эндпоинта
echo -e "${GREEN}3. Проверка обработки 404 для несуществующего API эндпоинта${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://escort-bar.live/api/endpoint-does-not-exist)
if [ "$HTTP_CODE" == "404" ]; then
  echo -e "${GREEN}✓ Несуществующий API эндпоинт возвращает 404 (HTTP код: $HTTP_CODE)${NC}"
else
  echo -e "${RED}✗ Несуществующий API эндпоинт возвращает некорректный код (HTTP код: $HTTP_CODE)${NC}"
  echo -e "${YELLOW}   Ожидается: 404, Получено: $HTTP_CODE${NC}"
fi
echo

# Проверка содержимого страницы 404
echo -e "${GREEN}4. Проверка содержимого страницы 404${NC}"
PAGE_CONTENT=$(curl -s https://escort-bar.live/page-does-not-exist-123456789)
if echo "$PAGE_CONTENT" | grep -q "404"; then
  echo -e "${GREEN}✓ Страница 404 содержит текст '404'${NC}"
else
  echo -e "${RED}✗ Страница 404 не содержит текст '404'${NC}"
fi

if echo "$PAGE_CONTENT" | grep -q "Страница не найдена"; then
  echo -e "${GREEN}✓ Страница 404 содержит текст 'Страница не найдена'${NC}"
else
  echo -e "${RED}✗ Страница 404 не содержит текст 'Страница не найдена'${NC}"
fi

# Проверка наличия мета-тега noindex на странице 404
if echo "$PAGE_CONTENT" | grep -q 'name="robots" content="noindex"'; then
  echo -e "${GREEN}✓ Страница 404 содержит мета-тег noindex${NC}"
else
  echo -e "${RED}✗ Страница 404 не содержит мета-тег noindex${NC}"
fi
echo

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
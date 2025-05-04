#!/bin/bash

# Главный скрипт для запуска всех исправлений в правильном порядке

# Цветовые константы для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===========================================================${NC}"
echo -e "${BLUE}  Начало процесса исправления канонических URL для сайта   ${NC}"
echo -e "${BLUE}  escort-bar.live (ранее вашдомен.ru)                      ${NC}"
echo -e "${BLUE}===========================================================${NC}"
echo ""

# Функция для запроса подтверждения
confirm() {
    read -p "$1 (y/n): " response
    case "$response" in
        [yY][eE][sS]|[yY]) 
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# Функция проверки результата выполнения команды
check_result() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1 успешно выполнено${NC}"
    else
        echo -e "${RED}✗ Ошибка при выполнении: $1${NC}"
        confirm "Продолжить выполнение?" || exit 1
    fi
}

# Шаг 1: Исправление исходного кода
echo -e "${YELLOW}1. Исправление исходного кода${NC}"
if confirm "Исправить все ссылки в исходном коде?"; then
    chmod +x fix-canonical-urls.sh
    ./fix-canonical-urls.sh
    check_result "Исправление исходного кода"
else
    echo -e "${YELLOW}Шаг пропущен${NC}"
fi

# Шаг 2: Настройка обработки 404 ошибок
echo -e "\n${YELLOW}2. Настройка обработки 404 ошибок${NC}"
if confirm "Настроить корректную обработку 404 ошибок?"; then
    chmod +x fix-404-errors.sh
    ./fix-404-errors.sh
    check_result "Настройка 404 ошибок"
    
    echo -e "${BLUE}Проверка корректности настройки 404 ошибок...${NC}"
    chmod +x verify-404-handling.sh
    ./verify-404-handling.sh
    check_result "Проверка настройки 404 ошибок"
else
    echo -e "${YELLOW}Шаг пропущен${NC}"
fi

# Шаг 3: Проверка изменений и редактирование, если необходимо
echo -e "\n${YELLOW}3. Проверка изменений${NC}"
echo -e "${BLUE}Пожалуйста, проверьте изменения в файлах.${NC}"
if confirm "Вы хотите проверить измененные файлы?"; then
    # Вывод списка измененных файлов
    git status
    echo -e "${BLUE}Проверьте файлы и внесите необходимые правки.${NC}"
    read -p "Нажмите Enter, когда будете готовы продолжить..."
fi

# Шаг 4: Коммит изменений в Git
echo -e "\n${YELLOW}4. Коммит изменений в Git${NC}"
if confirm "Выполнить коммит всех изменений?"; then
    chmod +x commit-changes.sh
    ./commit-changes.sh
    check_result "Коммит изменений"
else
    echo -e "${YELLOW}Шаг пропущен${NC}"
fi

# Шаг 5: Применение изменений на сервере
echo -e "\n${YELLOW}5. Применение изменений на сервере${NC}"
echo -e "${BLUE}Для применения изменений на сервере следуйте инструкциям в server-deployment-instructions.md${NC}"
echo -e "${BLUE}Основные шаги:${NC}"
echo -e "${BLUE}  - Выполнить git pull на сервере${NC}"
echo -e "${BLUE}  - Перезапустить приложение${NC}"
if confirm "Обновить robots.txt на сервере?"; then
    chmod +x update-robots-txt.sh
    ./update-robots-txt.sh
    check_result "Обновление robots.txt"
else
    echo -e "${YELLOW}Шаг пропущен${NC}"
fi

# Шаг 6: Проверка изменений на сервере
echo -e "\n${YELLOW}6. Проверка изменений на сервере${NC}"
if confirm "Проверить канонические URL на сервере?"; then
    chmod +x check-canonical-urls.sh
    ./check-canonical-urls.sh
    check_result "Проверка канонических URL"
else
    echo -e "${YELLOW}Шаг пропущен${NC}"
fi

if confirm "Выполнить полную проверку всех изменений на сервере?"; then
    chmod +x verify-changes.sh
    ./verify-changes.sh
    check_result "Полная проверка изменений"
else
    echo -e "${YELLOW}Шаг пропущен${NC}"
fi

# Шаг 7: Уведомление поисковых систем
echo -e "\n${YELLOW}7. Уведомление поисковых систем${NC}"
echo -e "${BLUE}Следуйте инструкциям в search-engines-notification.md для уведомления поисковых систем о смене домена.${NC}"
echo -e "${BLUE}Основные шаги:${NC}"
echo -e "${BLUE}  - Настроить переезд сайта в Яндекс.Вебмастер${NC}"
echo -e "${BLUE}  - Настроить изменение адреса в Google Search Console${NC}"
echo -e "${BLUE}  - Отправить уведомление через IndexNow${NC}"

# Шаг 8: Мониторинг индексации
echo -e "\n${YELLOW}8. Настройка мониторинга индексации${NC}"
echo -e "${BLUE}Для проверки индексации сайта в поисковых системах следуйте инструкциям в verify-search-indexing.md${NC}"
echo -e "${BLUE}Основные шаги мониторинга:${NC}"
echo -e "${BLUE}  - Регулярно проверять индексацию через операторы site:${NC}"
echo -e "${BLUE}  - Отслеживать прогресс в Яндекс.Вебмастер и Google Search Console${NC}"
echo -e "${BLUE}  - Контролировать исчезновение страниц старого домена из индекса${NC}"
echo -e "${BLUE}  - Вести отчет о прогрессе индексации${NC}"

# Шаг 9: Итоговый отчет
echo -e "\n${YELLOW}9. Ознакомление с итоговым отчетом${NC}"
echo -e "${BLUE}В файле completion-summary.md содержится подробный отчет о проделанной работе и ожидаемых результатах.${NC}"
echo -e "${BLUE}Рекомендуется ознакомиться с этим документом для полного понимания всех изменений и дальнейших действий.${NC}"

# Шаг 10: Заключение
echo -e "\n${GREEN}===========================================================${NC}"
echo -e "${GREEN}  Процесс исправления канонических URL для сайта завершен  ${NC}"
echo -e "${GREEN}===========================================================${NC}"
echo -e "${BLUE}Не забудьте регулярно проверять:${NC}"
echo -e "${BLUE}  - Яндекс.Вебмастер и Google Search Console${NC}"
echo -e "${BLUE}  - Трафик и поведение пользователей на сайте${NC}"
echo -e "${BLUE}  - Индексацию страниц в поисковых системах${NC}"
echo -e "${BLUE}  - Редиректы со старого домена на новый${NC}"
echo -e "${BLUE}  - Корректную обработку 404 ошибок${NC}" 
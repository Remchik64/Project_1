#!/bin/bash
#
# nginx-manager.sh - Универсальный менеджер для работы с Nginx
# 
# Этот скрипт объединяет функциональность нескольких скриптов:
# - Настройка обработки 404 ошибок
# - Настройка путей для изображений
# - Очистка конфликтующих конфигураций
# - Проверка и тестирование настроек
#
# Автор: Claude
# Версия: 1.0
# Дата: 2025-05-07

set -e

# Конфигурационные переменные
NGINX_SITES_DIR="/etc/nginx/sites-enabled"
NGINX_CONFIG_FILE="${NGINX_SITES_DIR}/escort-bar.live"
IMAGES_UPLOAD_PATH="/opt/api/uploads"
DEFAULT_DOMAIN="escort-bar.live"
WWW_ROOT="/var/www/html/site"
ERROR_PAGES_DIR="${WWW_ROOT}"
BACKUP_DIR="/etc/nginx/sites-available/backups"

# Создаем директорию для бэкапов, если не существует
mkdir -p "$BACKUP_DIR"

# Вывод подсказки использования
print_usage() {
    echo "Использование: $0 [опция]"
    echo "Опции:"
    echo "  --fix-404          Настройка правильной обработки 404 ошибок"
    echo "  --fix-images       Настройка путей к изображениям"
    echo "  --clean-configs    Очистка конфликтующих конфигураций"
    echo "  --test             Тестирование конфигурации"
    echo "  --restart          Перезагрузка Nginx"
    echo "  --backup           Создание резервной копии текущей конфигурации"
    echo "  --restore FILE     Восстановление из указанного файла резервной копии"
    echo "  --verify-404       Проверка обработки 404 ошибок"
    echo "  --verify-images    Проверка доступности изображений"
    echo "  --all              Выполнить все исправления (404, изображения, очистка)"
    echo "  --help             Показать эту справку"
    echo
    echo "Пример: $0 --fix-404 --restart"
}

# Функция создания резервной копии
backup_config() {
    local backup_file="${BACKUP_DIR}/escort-bar.live.bak.$(date +%Y%m%d_%H%M%S)"
    echo "Создание резервной копии в ${backup_file}"
    cp "${NGINX_CONFIG_FILE}" "${backup_file}"
    echo "Резервная копия создана успешно."
}

# Функция восстановления из резервной копии
restore_config() {
    local backup_file="$1"
    if [[ ! -f "$backup_file" ]]; then
        echo "ОШИБКА: Файл резервной копии $backup_file не найден."
        return 1
    fi
    
    echo "Восстановление из резервной копии $backup_file"
    cp "$backup_file" "${NGINX_CONFIG_FILE}"
    echo "Восстановление выполнено успешно."
    
    echo "Проверка синтаксиса Nginx..."
    nginx -t
    
    if [[ $? -eq 0 ]]; then
        echo "Перезагрузка Nginx..."
        systemctl reload nginx
        echo "Nginx успешно перезагружен!"
    else
        echo "ОШИБКА: Проверка синтаксиса не удалась. Nginx не был перезагружен."
        return 1
    fi
}

# Функция настройки обработки 404 ошибок
fix_404_errors() {
    echo "Настройка обработки 404 ошибок..."
    
    # Создаем страницу ошибки 404, если она не существует
    if [[ ! -f "${ERROR_PAGES_DIR}/404.html" ]]; then
        echo "Создание страницы 404.html..."
        cat > "${ERROR_PAGES_DIR}/404.html" << 'EOF'
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Страница не найдена</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            color: #333;
            text-align: center;
            padding: 50px 20px;
            margin: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
        }
        h1 {
            font-size: 36px;
            margin-bottom: 20px;
            color: #e74c3c;
        }
        p {
            font-size: 18px;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .btn {
            display: inline-block;
            background-color: #3498db;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            transition: background-color 0.3s;
        }
        .btn:hover {
            background-color: #2980b9;
        }
        .error-code {
            font-size: 120px;
            font-weight: bold;
            color: #e74c3c;
            margin: 0;
            line-height: 1;
            margin-bottom: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <p class="error-code">404</p>
        <h1>Страница не найдена</h1>
        <p>Извините, запрашиваемая страница не существует. Возможно, она была перемещена или удалена.</p>
        <a href="/" class="btn">Вернуться на главную</a>
    </div>
</body>
</html>
EOF
    fi
    
    # Обновляем конфигурацию Nginx для правильной обработки 404 ошибок
    backup_config
    
    # Обновляем конфигурацию, сохраняя существующие настройки и добавляя правильную обработку 404
    awk 'BEGIN{found=0}
    /error_page 404 \/404.html/ {found=1}
    /location = \/404.html/ {found=1}
    /try_files \$uri \$uri\/ \/index.html/ {
        print "        try_files $uri $uri/ /index.html =404;";
        found=1;
        next;
    }
    # Добавляем обработку ошибок, если блок server заканчивается
    /}/ && found==0 {
        print "    # Обработка ошибок";
        print "    error_page 404 /404.html;";
        print "    location = /404.html {";
        print "        root '"${ERROR_PAGES_DIR}"';";
        print "        internal;";
        print "    }";
        found=1;
        print $0;
        next;
    }
    {print}' "${NGINX_CONFIG_FILE}" > "${NGINX_CONFIG_FILE}.new"
    
    mv "${NGINX_CONFIG_FILE}.new" "${NGINX_CONFIG_FILE}"
    
    echo "Настройка обработки 404 ошибок завершена."
}

# Функция настройки путей для изображений
fix_images_paths() {
    echo "Настройка путей к изображениям..."
    
    backup_config
    
    # Обновляем конфигурацию для правильных путей к изображениям
    awk 'BEGIN{uploads_found=0; api_uploads_found=0}
    /location \/uploads\// {
        print "    # Прямая обработка запросов к изображениям в /uploads/*";
        print "    location /uploads/ {";
        print "        alias '"${IMAGES_UPLOAD_PATH}"'/;";
        print "        expires 30d;";
        print "        add_header Cache-Control \"public, max-age=2592000\";";
        print "        try_files $uri =404;";
        print "    }";
        uploads_found=1;
        # Пропускаем весь блок location
        while(getline && !/}/){}
        next;
    }
    /location \/api\/uploads\// {
        print "    # Прямая обработка запросов к изображениям в /api/uploads/*";
        print "    location /api/uploads/ {";
        print "        alias '"${IMAGES_UPLOAD_PATH}"'/;";
        print "        expires 30d;";
        print "        add_header Cache-Control \"public, max-age=2592000\";";
        print "        try_files $uri =404;";
        print "    }";
        api_uploads_found=1;
        # Пропускаем весь блок location
        while(getline && !/}/){}
        next;
    }
    # Добавляем блоки в конец server, если они не были найдены
    /}/ && (uploads_found==0 || api_uploads_found==0) {
        if (uploads_found==0) {
            print "    # Прямая обработка запросов к изображениям в /uploads/*";
            print "    location /uploads/ {";
            print "        alias '"${IMAGES_UPLOAD_PATH}"'/;";
            print "        expires 30d;";
            print "        add_header Cache-Control \"public, max-age=2592000\";";
            print "        try_files $uri =404;";
            print "    }";
            uploads_found=1;
        }
        if (api_uploads_found==0) {
            print "    # Прямая обработка запросов к изображениям в /api/uploads/*";
            print "    location /api/uploads/ {";
            print "        alias '"${IMAGES_UPLOAD_PATH}"'/;";
            print "        expires 30d;";
            print "        add_header Cache-Control \"public, max-age=2592000\";";
            print "        try_files $uri =404;";
            print "    }";
            api_uploads_found=1;
        }
        print $0;
        next;
    }
    {print}' "${NGINX_CONFIG_FILE}" > "${NGINX_CONFIG_FILE}.new"
    
    mv "${NGINX_CONFIG_FILE}.new" "${NGINX_CONFIG_FILE}"
    
    echo "Настройка путей к изображениям завершена."
}

# Функция очистки конфликтующих конфигураций
clean_configs() {
    echo "Очистка конфликтующих конфигураций Nginx..."
    
    # Архивируем все текущие конфигурации
    BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
    echo "Создание архива всех конфигураций в /root/nginx_configs_backup_$BACKUP_DATE.tar.gz"
    tar -czf /root/nginx_configs_backup_$BACKUP_DATE.tar.gz /etc/nginx/sites-available/ /etc/nginx/sites-enabled/
    
    # Удаляем все файлы кроме основного файла конфигурации
    echo "Очистка директории sites-enabled..."
    for file in ${NGINX_SITES_DIR}/*; do
        if [ "$file" != "${NGINX_CONFIG_FILE}" ]; then
            echo "Удаление: $file"
            rm -f "$file"
        fi
    done
    
    # Проверяем, есть ли другие конфигурации для того же домена
    echo "Проверка других конфигураций для домена ${DEFAULT_DOMAIN}..."
    for file in /etc/nginx/sites-available/*; do
        if [ "$file" != "/etc/nginx/sites-available/escort-bar.live" ] && [ "$file" != "/etc/nginx/sites-available/backups" ]; then
            grep -q "${DEFAULT_DOMAIN}" "$file" 2>/dev/null
            if [ $? -eq 0 ]; then
                echo "Найдена конфигурация для ${DEFAULT_DOMAIN} в файле $file, перемещение в backups"
                mv "$file" "${BACKUP_DIR}/$(basename "$file").$BACKUP_DATE"
            fi
        fi
    done
    
    echo "Очистка конфигураций завершена."
}

# Функция тестирования конфигурации
test_nginx() {
    echo "Тестирование конфигурации Nginx..."
    nginx -t
    
    if [ $? -eq 0 ]; then
        echo "Конфигурация Nginx корректна."
    else
        echo "ОШИБКА: Некорректная конфигурация Nginx."
        return 1
    fi
}

# Функция перезагрузки Nginx
restart_nginx() {
    echo "Перезагрузка Nginx..."
    systemctl reload nginx
    
    if [ $? -eq 0 ]; then
        echo "Nginx успешно перезагружен!"
    else
        echo "ОШИБКА: Не удалось перезагрузить Nginx."
        return 1
    fi
}

# Функция проверки обработки 404 ошибок
verify_404() {
    echo "Проверка обработки 404 ошибок..."
    echo "Тестирование существующего файла:"
    curl -I https://${DEFAULT_DOMAIN}/
    echo
    
    echo "Тестирование несуществующего файла (должен вернуть 404):"
    curl -I https://${DEFAULT_DOMAIN}/nonexistent-page-for-testing-404
    echo
    
    echo "Проверка завершена. Убедитесь, что для несуществующего URL возвращается код 404."
}

# Функция проверки доступности изображений
verify_images() {
    echo "Проверка доступности изображений..."
    
    # Находим первое доступное изображение в директории загрузок
    FIRST_IMAGE=$(find ${IMAGES_UPLOAD_PATH} -name "*.jpg" -o -name "*.png" -o -name "*.jpeg" | head -n 1)
    
    if [ -z "$FIRST_IMAGE" ]; then
        echo "Не найдено изображений для тестирования."
        return 1
    fi
    
    # Извлекаем имя файла из полного пути
    IMAGE_FILENAME=$(basename "$FIRST_IMAGE")
    
    echo "Тестирование доступа к изображению через /uploads/:"
    curl -I https://${DEFAULT_DOMAIN}/uploads/${IMAGE_FILENAME}
    echo
    
    echo "Тестирование доступа к изображению через /api/uploads/:"
    curl -I https://${DEFAULT_DOMAIN}/api/uploads/${IMAGE_FILENAME}
    echo
    
    echo "Проверка завершена. Убедитесь, что для обоих URL возвращается код 200."
}

# Функция для выполнения всех исправлений
fix_all() {
    backup_config
    fix_404_errors
    fix_images_paths
    clean_configs
    test_nginx
    restart_nginx
    echo "Все исправления успешно применены."
}

# Обработка параметров командной строки
if [[ $# -eq 0 ]]; then
    print_usage
    exit 0
fi

# Флаги для действий
DO_FIX_404=0
DO_FIX_IMAGES=0
DO_CLEAN_CONFIGS=0
DO_TEST=0
DO_RESTART=0
DO_BACKUP=0
DO_RESTORE=0
DO_VERIFY_404=0
DO_VERIFY_IMAGES=0
DO_ALL=0
RESTORE_FILE=""

# Обработка параметров
while [[ $# -gt 0 ]]; do
    case $1 in
        --fix-404)
            DO_FIX_404=1
            shift
            ;;
        --fix-images)
            DO_FIX_IMAGES=1
            shift
            ;;
        --clean-configs)
            DO_CLEAN_CONFIGS=1
            shift
            ;;
        --test)
            DO_TEST=1
            shift
            ;;
        --restart)
            DO_RESTART=1
            shift
            ;;
        --backup)
            DO_BACKUP=1
            shift
            ;;
        --restore)
            DO_RESTORE=1
            RESTORE_FILE="$2"
            shift 2
            ;;
        --verify-404)
            DO_VERIFY_404=1
            shift
            ;;
        --verify-images)
            DO_VERIFY_IMAGES=1
            shift
            ;;
        --all)
            DO_ALL=1
            shift
            ;;
        --help)
            print_usage
            exit 0
            ;;
        *)
            echo "Неизвестный параметр: $1"
            print_usage
            exit 1
            ;;
    esac
done

# Выполнение действий в соответствии с флагами
if [[ $DO_ALL -eq 1 ]]; then
    fix_all
    exit 0
fi

if [[ $DO_BACKUP -eq 1 ]]; then
    backup_config
fi

if [[ $DO_RESTORE -eq 1 ]]; then
    restore_config "$RESTORE_FILE"
fi

if [[ $DO_FIX_404 -eq 1 ]]; then
    fix_404_errors
fi

if [[ $DO_FIX_IMAGES -eq 1 ]]; then
    fix_images_paths
fi

if [[ $DO_CLEAN_CONFIGS -eq 1 ]]; then
    clean_configs
fi

if [[ $DO_TEST -eq 1 ]]; then
    test_nginx
fi

if [[ $DO_RESTART -eq 1 ]]; then
    restart_nginx
fi

if [[ $DO_VERIFY_404 -eq 1 ]]; then
    verify_404
fi

if [[ $DO_VERIFY_IMAGES -eq 1 ]]; then
    verify_images
fi

echo "Все операции успешно завершены."
exit 0 
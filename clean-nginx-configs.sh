#!/bin/bash

# Скрипт для очистки конфигураций Nginx

# Создаем директорию для резервных копий, если она не существует
mkdir -p /etc/nginx/sites-available/backups

# Архивируем все текущие конфигурации
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
echo "Создание архива всех конфигураций в /root/nginx_configs_backup_$BACKUP_DATE.tar.gz"
tar -czf /root/nginx_configs_backup_$BACKUP_DATE.tar.gz /etc/nginx/sites-available/ /etc/nginx/sites-enabled/

# Удаляем все файлы кроме основного файла конфигурации
echo "Очистка директории sites-enabled..."
for file in /etc/nginx/sites-enabled/*; do
    if [ "$file" != "/etc/nginx/sites-enabled/escort-bar.live" ]; then
        echo "Удаление: $file"
        rm -f "$file"
    fi
done

# Проверяем, есть ли другие конфигурации для того же домена
echo "Проверка других конфигураций для домена escort-bar.live..."
for file in /etc/nginx/sites-available/*; do
    if [ "$file" != "/etc/nginx/sites-available/escort-bar.live" ] && [ "$file" != "/etc/nginx/sites-available/backups" ]; then
        grep -q "escort-bar.live" "$file" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "Найдена конфигурация для escort-bar.live в файле $file, перемещение в backups"
            mv "$file" "/etc/nginx/sites-available/backups/$(basename "$file").$BACKUP_DATE"
        fi
    fi
done

# Перезагружаем Nginx
echo "Проверка конфигурации Nginx..."
nginx -t

if [ $? -eq 0 ]; then
    echo "Перезапуск Nginx..."
    systemctl reload nginx
    echo "Nginx успешно перезапущен!"
    echo "Предупреждения о конфликтующих именах серверов должны быть устранены."
else
    echo "ОШИБКА: Некорректная конфигурация Nginx. Восстановите из резервной копии:"
    echo "tar -xzf /root/nginx_configs_backup_$BACKUP_DATE.tar.gz -C / && systemctl reload nginx"
fi 
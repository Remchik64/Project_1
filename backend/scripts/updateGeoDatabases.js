const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const DATA_DIR = path.join(__dirname, '../data');
const MAXMIND_DB_PATH = path.join(DATA_DIR, 'GeoLite2-City.mmdb');

// Создаем директорию для баз данных, если она не существует
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function downloadFile(url, outputPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(outputPath);
        https.get(url, response => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', err => {
            fs.unlink(outputPath);
            reject(err);
        });
    });
}

async function updateMaxMindDatabase() {
    try {
        console.log('Обновление базы данных MaxMind...');
        
        // Проверяем наличие переменных окружения
        const licenseKey = process.env.MAXMIND_LICENSE_KEY;
        if (!licenseKey) {
            console.log('MAXMIND_LICENSE_KEY не найден в переменных окружения');
            return;
        }

        // URL для скачивания базы данных MaxMind
        const url = `https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City&license_key=${licenseKey}&suffix=tar.gz`;
        const tempFile = path.join(DATA_DIR, 'maxmind-temp.tar.gz');

        // Скачиваем архив
        await downloadFile(url, tempFile);

        // Распаковываем архив
        await execAsync(`tar -xzf ${tempFile} -C ${DATA_DIR}`);

        // Перемещаем файл базы данных
        const extractedDir = fs.readdirSync(DATA_DIR)
            .find(dir => dir.startsWith('GeoLite2-City_'));
        if (extractedDir) {
            const dbFile = path.join(DATA_DIR, extractedDir, 'GeoLite2-City.mmdb');
            fs.renameSync(dbFile, MAXMIND_DB_PATH);
            
            // Удаляем временные файлы
            fs.rmSync(path.join(DATA_DIR, extractedDir), { recursive: true });
            fs.unlinkSync(tempFile);
        }

        console.log('База данных MaxMind успешно обновлена');
    } catch (error) {
        console.error('Ошибка при обновлении базы MaxMind:', error);
    }
}

async function updateDatabases() {
    console.log('Начало обновления баз данных геолокации...');
    await updateMaxMindDatabase();
    console.log('Обновление баз данных завершено');
}

// Запускаем обновление при вызове скрипта напрямую
if (require.main === module) {
    updateDatabases().catch(console.error);
}

module.exports = updateDatabases; 
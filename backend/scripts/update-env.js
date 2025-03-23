/**
 * Скрипт для безопасного обновления переменных окружения в .env файлах
 * Запуск: node scripts/update-env.js --key ADMIN_PASSWORD --value "новый_пароль" [--env .env.production]
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Создаем интерфейс для чтения ввода
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Анализируем аргументы командной строки
function parseArguments() {
  const args = process.argv.slice(2);
  const result = { key: null, value: null, envFile: '.env' };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--key' && i + 1 < args.length) {
      result.key = args[i + 1];
      i++;
    } else if (args[i] === '--value' && i + 1 < args.length) {
      result.value = args[i + 1];
      i++;
    } else if (args[i] === '--env' && i + 1 < args.length) {
      result.envFile = args[i + 1];
      i++;
    }
  }

  return result;
}

// Функция для обновления .env файла
function updateEnvFile(envFile, key, value) {
  return new Promise((resolve, reject) => {
    // Определяем путь к .env файлу
    const rootDir = path.resolve(__dirname, '..');
    const basePath = key === 'REACT_APP_API_URL' ? path.resolve(rootDir, '..', 'frontend') : rootDir;
    const envPath = path.join(basePath, envFile);

    // Проверяем существование файла
    if (!fs.existsSync(envPath)) {
      return reject(new Error(`Файл ${envPath} не найден`));
    }

    // Читаем содержимое файла
    fs.readFile(envPath, 'utf8', (err, data) => {
      if (err) return reject(err);

      // Ищем строку с нужным ключом
      const lines = data.split('\n');
      let found = false;
      
      for (let i = 0; i < lines.length; i++) {
        // Пропускаем комментарии и пустые строки
        if (lines[i].trim().startsWith('#') || lines[i].trim() === '') {
          continue;
        }

        // Ищем ключ
        if (lines[i].startsWith(`${key}=`)) {
          lines[i] = `${key}=${value}`;
          found = true;
          break;
        }
      }

      // Если ключ не найден, добавляем его в конец файла
      if (!found) {
        lines.push(`${key}=${value}`);
      }

      // Записываем обновленный файл
      fs.writeFile(envPath, lines.join('\n'), 'utf8', (err) => {
        if (err) return reject(err);
        resolve(found ? 'updated' : 'added');
      });
    });
  });
}

// Подтверждение перед обновлением
function confirmUpdate(envFile, key, value) {
  return new Promise((resolve) => {
    rl.question(`Вы уверены, что хотите обновить ${key} в файле ${envFile}? (y/n): `, (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

// Основная функция
async function main() {
  try {
    // Получаем параметры
    const { key, value, envFile } = parseArguments();

    // Проверяем наличие необходимых параметров
    if (!key || value === null) {
      console.error('Ошибка: необходимо указать --key и --value');
      console.log('Пример: node scripts/update-env.js --key ADMIN_PASSWORD --value "новый_пароль" [--env .env.production]');
      rl.close();
      return;
    }

    // Подтверждаем перед изменением
    const confirmation = await confirmUpdate(envFile, key, value);
    if (!confirmation) {
      console.log('Операция отменена.');
      rl.close();
      return;
    }

    // Обновляем файл
    const result = await updateEnvFile(envFile, key, value);
    console.log(`Переменная ${key} успешно ${result === 'updated' ? 'обновлена' : 'добавлена'} в файле ${envFile}`);

    // Если обновляли пароль администратора, предлагаем обновить его и в базе данных
    if (key === 'ADMIN_PASSWORD') {
      const updateDB = await confirmUpdate('базе данных', 'пароль администратора', '***');
      if (updateDB) {
        const { exec } = require('child_process');
        const cmd = `node ${path.join(__dirname, 'change-admin-password.js')} "${value}"`;
        exec(cmd, (error, stdout, stderr) => {
          if (error) {
            console.error(`Ошибка при обновлении пароля в базе данных: ${error.message}`);
            return;
          }
          console.log(stdout);
        });
      }
    }

    rl.close();
  } catch (error) {
    console.error('Ошибка при обновлении .env файла:', error);
    rl.close();
    process.exit(1);
  }
}

// Запускаем основную функцию
main(); 
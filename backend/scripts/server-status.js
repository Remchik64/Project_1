/**
 * Скрипт для проверки статуса сервера и управления им
 * Запуск: node scripts/server-status.js [action]
 * 
 * Действия:
 * - check - проверить состояние (по умолчанию)
 * - start - запустить сервер
 * - stop - остановить сервер 
 * - restart - перезапустить сервер
 */

const { exec } = require('child_process');
const http = require('http');
require('dotenv').config();

// Определяем окружение и порт
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || (NODE_ENV === 'production' ? 8080 : 5000);
const action = process.argv[2] || 'check';

console.log(`Окружение: ${NODE_ENV}`);
console.log(`Порт: ${PORT}`);

// Функция для проверки доступности сервера
function checkServerStatus() {
  return new Promise((resolve) => {
    const req = http.request({
      host: 'localhost',
      port: PORT,
      path: '/',
      method: 'HEAD',
      timeout: 3000
    }, (res) => {
      resolve({ running: true, status: res.statusCode });
    });

    req.on('error', () => {
      resolve({ running: false });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ running: false, reason: 'timeout' });
    });

    req.end();
  });
}

// Функция для проверки, запущен ли PM2
function checkPM2() {
  return new Promise((resolve) => {
    exec('pm2 list', (error, stdout) => {
      if (error) {
        resolve({ running: false, error: error.message });
        return;
      }
      
      const isPM2Running = stdout.includes('backend') || stdout.includes('index.js');
      resolve({ running: isPM2Running });
    });
  });
}

// Функция для остановки сервера
async function stopServer() {
  console.log('Остановка сервера...');
  
  // Проверяем, запущен ли сервер
  const { running } = await checkServerStatus();
  if (!running) {
    console.log('Сервер уже остановлен');
    return true;
  }

  // В продакшене используем PM2
  if (NODE_ENV === 'production') {
    const pm2Status = await checkPM2();
    if (pm2Status.running) {
      console.log('Остановка сервера через PM2...');
      return new Promise((resolve) => {
        exec('pm2 stop all', (error, stdout) => {
          if (error) {
            console.error(`Ошибка при остановке PM2: ${error.message}`);
            resolve(false);
            return;
          }
          console.log('Сервер успешно остановлен через PM2');
          console.log(stdout);
          resolve(true);
        });
      });
    }
  }

  // Если не продакшен или PM2 не используется, останавливаем процессы на порту
  console.log(`Поиск процессов, использующих порт ${PORT}...`);
  // Зависит от ОС
  const isWindows = process.platform === 'win32';
  const findCommand = isWindows 
    ? `netstat -ano | findstr :${PORT}`
    : `lsof -i :${PORT} | grep LISTEN`;

  return new Promise((resolve) => {
    exec(findCommand, (error, stdout) => {
      if (error || !stdout) {
        console.log('Не найдены процессы, использующие порт');
        resolve(false);
        return;
      }

      let pid;
      if (isWindows) {
        const lines = stdout.trim().split('\n');
        if (lines.length > 0) {
          const columns = lines[0].trim().split(/\s+/);
          pid = columns[columns.length - 1];
        }
      } else {
        const lines = stdout.trim().split('\n');
        if (lines.length > 0) {
          const columns = lines[0].trim().split(/\s+/);
          pid = columns[1];
        }
      }

      if (!pid) {
        console.log('Не удалось определить PID процесса');
        resolve(false);
        return;
      }

      console.log(`Завершение процесса с PID ${pid}...`);
      const killCommand = isWindows 
        ? `taskkill /F /PID ${pid}`
        : `kill -9 ${pid}`;
      
      exec(killCommand, (killError) => {
        if (killError) {
          console.error(`Ошибка при завершении процесса: ${killError.message}`);
          resolve(false);
          return;
        }
        console.log(`Процесс успешно завершен.`);
        resolve(true);
      });
    });
  });
}

// Функция для запуска сервера
function startServer() {
  console.log('Запуск сервера...');
  
  // В продакшене используем PM2
  if (NODE_ENV === 'production') {
    console.log('Запуск сервера через PM2...');
    const command = 'cd /opt/repo/backend && pm2 start index.js --name backend';
    
    return new Promise((resolve) => {
      exec(command, (error, stdout) => {
        if (error) {
          console.error(`Ошибка при запуске через PM2: ${error.message}`);
          resolve(false);
          return;
        }
        console.log('Сервер успешно запущен через PM2');
        console.log(stdout);
        resolve(true);
      });
    });
  }
  
  // В режиме разработки запускаем через npm
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const child = exec(`cd .. && ${npmCommand} run start`);
  
  child.stdout.on('data', (data) => {
    console.log(`STDOUT: ${data}`);
  });
  
  child.stderr.on('data', (data) => {
    console.error(`STDERR: ${data}`);
  });
  
  console.log('Команда запуска сервера выполнена. Проверьте статус через несколько секунд.');
  return true;
}

// Функция для перезапуска сервера
async function restartServer() {
  console.log('Перезапуск сервера...');
  
  // В продакшене используем PM2
  if (NODE_ENV === 'production') {
    console.log('Перезапуск сервера через PM2...');
    
    return new Promise((resolve) => {
      exec('pm2 restart all', (error, stdout) => {
        if (error) {
          console.error(`Ошибка при перезапуске через PM2: ${error.message}`);
          resolve(false);
          return;
        }
        console.log('Сервер успешно перезапущен через PM2');
        console.log(stdout);
        resolve(true);
      });
    });
  }
  
  // В режиме разработки останавливаем и запускаем
  const stopped = await stopServer();
  if (stopped) {
    // Даем время на освобождение порта
    setTimeout(() => {
      startServer();
    }, 1000);
    return true;
  }
  
  return false;
}

// Основная функция
async function main() {
  switch (action) {
    case 'check':
      // Проверка статуса PM2 в продакшене
      if (NODE_ENV === 'production') {
        const pm2Status = await checkPM2();
        if (pm2Status.running) {
          console.log('Сервер запущен через PM2');
          
          // Дополнительно проверяем доступность по порту
          const serverStatus = await checkServerStatus();
          if (serverStatus.running) {
            console.log(`Сервер доступен на порту ${PORT}, статус: ${serverStatus.status}`);
          } else {
            console.log(`Сервер запущен через PM2, но не доступен на порту ${PORT}`);
          }
          
          return;
        } else if (pm2Status.error) {
          console.log(`PM2 не найден или не запущен: ${pm2Status.error}`);
        } else {
          console.log('PM2 запущен, но сервер не найден в списке процессов');
        }
      }
      
      // Обычная проверка статуса сервера
      const status = await checkServerStatus();
      if (status.running) {
        console.log(`Сервер работает, статус: ${status.status}`);
      } else {
        console.log('Сервер не запущен');
      }
      break;
      
    case 'stop':
      await stopServer();
      break;
      
    case 'start':
      // Проверяем, не запущен ли сервер уже
      const serverStatus = await checkServerStatus();
      if (serverStatus.running) {
        console.log('Сервер уже запущен');
      } else {
        await startServer();
      }
      break;
      
    case 'restart':
      await restartServer();
      break;
      
    default:
      console.log('Неизвестное действие. Используйте: check, start, stop, restart');
  }
}

main(); 
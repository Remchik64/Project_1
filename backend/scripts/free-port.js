/**
 * Скрипт для освобождения порта перед запуском приложения
 * Запуск: node scripts/free-port.js
 */
const { exec } = require('child_process');
require('dotenv').config();

// Определяем порт в зависимости от окружения
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || (NODE_ENV === 'production' ? 8080 : 5000);

console.log(`Окружение: ${NODE_ENV}`);
console.log(`Проверка порта ${PORT}...`);

// Проверяем, запущено ли приложение через PM2 в продакшене
if (NODE_ENV === 'production') {
  console.log('Проверка PM2 процессов...');
  exec('pm2 list', (error, stdout, stderr) => {
    if (error) {
      console.log(`PM2 не найден или не запущен: ${error.message}`);
      // Если PM2 не найден, проверяем порт обычным способом
      checkAndFreePort();
      return;
    }
    
    // Проверяем, есть ли наше приложение в списке PM2
    if (stdout.includes('backend') || stdout.includes('index.js')) {
      console.log('Найдено приложение под управлением PM2. Рекомендуется использовать pm2 restart вместо free-port');
      console.log('Для перезапуска используйте: pm2 restart all');
      process.exit(0);
    } else {
      // Если приложение не найдено в PM2, проверяем порт
      checkAndFreePort();
    }
  });
} else {
  // В режиме разработки проверяем порт
  checkAndFreePort();
}

// Функция для проверки и освобождения порта
function checkAndFreePort() {
  // Команда зависит от ОС
  const isWindows = process.platform === 'win32';
  const findCommand = isWindows 
    ? `netstat -ano | findstr :${PORT}`
    : `lsof -i :${PORT} | grep LISTEN`;

  exec(findCommand, (error, stdout, stderr) => {
    if (error) {
      // Если ошибка - вероятно, порт свободен (команда не нашла процесс)
      console.log(`Порт ${PORT} свободен, можно запускать приложение`);
      return;
    }

    if (stdout) {
      console.log(`Обнаружены процессы, использующие порт ${PORT}:`);
      console.log(stdout);

      // Извлекаем PID процесса
      let pid;
      if (isWindows) {
        // В Windows PID - последняя колонка
        const lines = stdout.trim().split('\n');
        if (lines.length > 0) {
          const firstLine = lines[0].trim();
          const columns = firstLine.split(/\s+/);
          pid = columns[columns.length - 1];
        }
      } else {
        // В Linux/Mac PID находится во второй колонке
        const lines = stdout.trim().split('\n');
        if (lines.length > 0) {
          const firstLine = lines[0].trim();
          const columns = firstLine.split(/\s+/);
          pid = columns[1];
        }
      }

      if (pid) {
        console.log(`Завершение процесса с PID ${pid}...`);
        
        const killCommand = isWindows 
          ? `taskkill /F /PID ${pid}`
          : `kill -9 ${pid}`;
        
        exec(killCommand, (killError, killStdout, killStderr) => {
          if (killError) {
            console.error(`Ошибка при завершении процесса: ${killError.message}`);
            return;
          }
          console.log(`Процесс успешно завершен! Порт ${PORT} свободен.`);
        });
      } else {
        console.error('Не удалось определить PID процесса');
      }
    }
  });
} 
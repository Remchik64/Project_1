const cron = require('node-cron');
const path = require('path');
const { exec } = require('child_process');

// Здесь можно добавить другие запланированные задачи

// Генерация sitemap.xml каждый день в 3:00
cron.schedule('0 3 * * *', () => {
  console.log('Запуск генерации sitemap.xml...');
  
  const scriptPath = path.join(__dirname, '../scripts/generateSitemap.js');
  
  exec(`node ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Ошибка при генерации sitemap: ${error.message}`);
      return;
    }
    
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return;
    }
    
    console.log(`Sitemap успешно сгенерирован: ${stdout}`);
  });
}); 
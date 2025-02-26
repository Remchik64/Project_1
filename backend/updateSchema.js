const sequelize = require('./config/database');
const { City } = require('./models');

async function updateSchema() {
    try {
        console.log('Начинаю обновление схемы базы данных...');
        
        // Добавляем столбец deletedAt в таблицу Cities, если его нет
        const queryInterface = sequelize.getQueryInterface();
        
        // Проверяем, существует ли столбец deletedAt
        const tableInfo = await queryInterface.describeTable('Cities');
        console.log('Информация о таблице Cities:', tableInfo);
        
        if (!tableInfo.deletedAt) {
            console.log('Добавляю столбец deletedAt в таблицу Cities...');
            
            // Используем прямой SQL-запрос для SQLite
            await sequelize.query('ALTER TABLE Cities ADD COLUMN deletedAt DATETIME NULL');
            
            console.log('Столбец deletedAt успешно добавлен!');
            
            // Проверяем, что столбец был добавлен
            const updatedTableInfo = await queryInterface.describeTable('Cities');
            console.log('Обновленная информация о таблице Cities:', updatedTableInfo);
        } else {
            console.log('Столбец deletedAt уже существует в таблице Cities');
        }
        
        console.log('Обновление схемы завершено успешно!');
        process.exit(0);
    } catch (error) {
        console.error('Ошибка при обновлении схемы:', error);
        process.exit(1);
    }
}

updateSchema(); 
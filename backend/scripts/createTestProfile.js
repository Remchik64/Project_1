require('dotenv').config();
const mongoose = require('mongoose');
const Profile = require('../models/Profile');

async function createTestProfile() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const testProfile = new Profile({
            name: 'Анна',
            age: 25,
            gender: 'female',
            city: 'Москва',
            about: 'Люблю путешествия и фотографию',
            interests: 'путешествия, фотография, искусство',
            status: 'active'
        });

        await testProfile.save();
        console.log('Тестовая анкета создана:', testProfile);

        // Создаем вторую тестовую анкету
        const testProfile2 = new Profile({
            name: 'Александр',
            age: 28,
            gender: 'male',
            city: 'Санкт-Петербург',
            about: 'Увлекаюсь музыкой и программированием',
            interests: 'музыка, программирование, спорт',
            status: 'active'
        });

        await testProfile2.save();
        console.log('Вторая тестовая анкета создана:', testProfile2);

    } catch (error) {
        console.error('Ошибка при создании тестовых анкет:', error);
    } finally {
        await mongoose.disconnect();
    }
}

createTestProfile(); 
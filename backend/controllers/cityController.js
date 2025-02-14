const { City } = require('../models');
const Profile = require('../models/Profile');
const axios = require('axios');

// Получение всех городов
exports.getAllCities = async (req, res) => {
    try {
        const cities = await City.findAll({
            order: [['name', 'ASC']]
        });
        console.log('Получены все города:', cities);
        res.json(cities);
    } catch (error) {
        console.error('Ошибка при получении городов:', error);
        res.status(500).json({ message: 'Ошибка при получении списка городов' });
    }
};

// Получение активных городов
exports.getActiveCities = async (req, res) => {
    try {
        const cities = await City.findAll({
            where: { status: 'active' },
            order: [['name', 'ASC']]
        });
        console.log('Получены активные города:', cities);
        res.json(cities);
    } catch (error) {
        console.error('Ошибка при получении активных городов:', error);
        res.status(500).json({ message: 'Ошибка при получении списка активных городов' });
    }
};

// Функция для получения координат города через OpenStreetMap Nominatim API
const getCityCoordinates = async (cityName) => {
    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
            params: {
                q: `${cityName}, Россия`,
                format: 'json',
                limit: 1
            },
            headers: {
                'User-Agent': 'Dating Site/1.0'
            }
        });

        if (response.data && response.data[0]) {
            return {
                longitude: parseFloat(response.data[0].lon),
                latitude: parseFloat(response.data[0].lat)
            };
        }
        return null;
    } catch (error) {
        console.error('Ошибка при получении координат города:', error);
        return null;
    }
};

// Создание города
exports.createCity = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({ message: 'Название города обязательно' });
        }

        // Проверяем, существует ли город
        const existingCity = await City.findOne({ where: { name: name.trim() } });
        if (existingCity) {
            return res.status(400).json({ message: 'Город уже существует' });
        }

        const city = await City.create({
            name: name.trim(),
            status: 'active'
        });

        res.status(201).json(city);
    } catch (error) {
        console.error('Ошибка при создании города:', error);
        res.status(500).json({ message: 'Ошибка при создании города' });
    }
};

// Обновление статуса города
exports.updateCityStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        console.log('Попытка обновления статуса города:', { id, status });

        // Проверяем допустимые значения статуса
        if (!status || !['active', 'inactive'].includes(status)) {
            console.log('Недопустимый статус:', status);
            return res.status(400).json({ 
                message: 'Недопустимое значение статуса. Допустимые значения: active, inactive' 
            });
        }

        // Ищем город по ID
        console.log('Поиск города по ID:', id);
        const city = await City.findOne({ where: { id: parseInt(id) } });
        
        if (!city) {
            console.log('Город не найден:', id);
            return res.status(404).json({ message: 'Город не найден' });
        }

        console.log('Найден город:', city.toJSON());

        // Если меняем статус на inactive, проверяем наличие активных анкет
        if (status === 'inactive') {
            console.log('Проверка активных анкет для города:', city.name);
            const profilesCount = await Profile.count({
                where: { 
                    city: city.name,
                    status: 'active'
                }
            });

            console.log('Количество активных анкет:', profilesCount);

            if (profilesCount > 0) {
                return res.status(400).json({ 
                    message: 'Невозможно деактивировать город с активными анкетами. Сначала деактивируйте все анкеты города.' 
                });
            }
        }

        // Обновляем статус
        console.log('Обновление статуса города на:', status);
        await City.update(
            { status: status },
            { where: { id: parseInt(id) } }
        );

        // Получаем обновленный город
        const updatedCity = await City.findOne({ where: { id: parseInt(id) } });
        console.log('Город обновлен:', updatedCity.toJSON());

        res.json(updatedCity);
    } catch (error) {
        console.error('Ошибка при обновлении статуса города:', error);
        res.status(500).json({ 
            message: 'Ошибка при обновлении статуса города',
            error: error.message 
        });
    }
};

// Удаление города
exports.deleteCity = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Попытка удаления города с ID:', id);

        // Ищем город по ID
        const city = await City.findOne({ where: { id: parseInt(id) } });
        
        if (!city) {
            console.log('Город не найден:', id);
            return res.status(404).json({ message: 'Город не найден' });
        }

        console.log('Найден город для удаления:', city.toJSON());

        // Проверяем, есть ли профили с этим городом
        console.log('Проверка связанных анкет для города:', city.name);
        const profilesCount = await Profile.count({
            where: { city: city.name }
        });

        console.log('Количество связанных анкет:', profilesCount);

        if (profilesCount > 0) {
            return res.status(400).json({ 
                message: 'Невозможно удалить город, так как с ним связаны анкеты. Сначала удалите все анкеты города.' 
            });
        }

        // Удаляем город
        console.log('Удаление города:', city.name);
        await city.destroy();

        console.log('Город успешно удален');
        res.json({ message: 'Город успешно удален' });
    } catch (error) {
        console.error('Ошибка при удалении города:', error);
        res.status(500).json({ 
            message: 'Ошибка при удалении города',
            error: error.message 
        });
    }
};

// Обновление счетчика анкет для города
exports.updateProfilesCount = async (cityName) => {
    try {
        const count = await Profile.count({
            where: { 
                city: cityName,
                status: 'active'
            }
        });
        
        await City.update(
            { profilesCount: count },
            { where: { name: cityName } }
        );
    } catch (error) {
        console.error('Ошибка при обновлении счетчика анкет:', error);
    }
}; 
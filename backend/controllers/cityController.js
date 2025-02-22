const { City, Profile, ProfileCity } = require('../models');

// Получение всех городов
exports.getAllCities = async (req, res) => {
    try {
        // Для админа возвращаем все города, для остальных только активные
        const isAdmin = req.user?.role === 'admin';
        const where = isAdmin ? {} : { isActive: true };

        const cities = await City.findAll({
            where,
            include: [{
                model: Profile,
                attributes: ['id', 'name', 'age', 'gender']
            }],
            order: [['name', 'ASC']]
        });
        res.json(cities);
    } catch (error) {
        console.error('Ошибка при получении городов:', error);
        res.status(500).json({ message: 'Ошибка при получении городов' });
    }
};

// Создание нового города
exports.createCity = async (req, res) => {
    try {
        const { name } = req.body;
        const city = await City.create({ name });
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
        const { isActive } = req.body;
        
        const city = await City.findByPk(id);
        if (!city) {
            return res.status(404).json({ message: 'Город не найден' });
        }

        await city.update({ isActive });
        res.json(city);
    } catch (error) {
        console.error('Ошибка при обновлении статуса города:', error);
        res.status(500).json({ message: 'Ошибка при обновлении статуса города' });
    }
};

// Удаление города
exports.deleteCity = async (req, res) => {
    try {
        const { id } = req.params;
        const city = await City.findByPk(id);
        if (!city) {
            return res.status(404).json({ message: 'Город не найден' });
        }

        await city.destroy();
        res.json({ message: 'Город успешно удален' });
    } catch (error) {
        console.error('Ошибка при удалении города:', error);
        res.status(500).json({ message: 'Ошибка при удалении города' });
    }
};

// Привязка анкет к городу
exports.assignProfilesToCity = async (req, res) => {
    try {
        const { cityId } = req.params;
        const { profileIds } = req.body;

        const city = await City.findByPk(cityId);
        if (!city) {
            return res.status(404).json({ message: 'Город не найден' });
        }

        // Удаляем старые связи
        await ProfileCity.destroy({
            where: { cityId }
        });

        // Создаем новые связи
        const profileCities = profileIds.map(profileId => ({
            cityId,
            profileId
        }));

        await ProfileCity.bulkCreate(profileCities);

        // Получаем обновленный город с привязанными анкетами
        const updatedCity = await City.findByPk(cityId, {
            include: [{
                model: Profile,
                attributes: ['id', 'name', 'age', 'gender']
            }]
        });

        res.json(updatedCity);
    } catch (error) {
        console.error('Ошибка при привязке анкет к городу:', error);
        res.status(500).json({ message: 'Ошибка при привязке анкет к городу' });
    }
};

// Получение информации о городе
exports.getCity = async (req, res) => {
    try {
        const { id } = req.params;
        const isAdmin = req.user?.role === 'admin';
        const where = { id };
        if (!isAdmin) {
            where.isActive = true;
        }

        const city = await City.findOne({ where });
        
        if (!city) {
            return res.status(404).json({ message: 'Город не найден' });
        }

        res.json(city);
    } catch (error) {
        console.error('Ошибка при получении информации о городе:', error);
        res.status(500).json({ message: 'Ошибка при получении информации о городе' });
    }
};

// Получение анкет города
exports.getCityProfiles = async (req, res) => {
    try {
        const { cityId } = req.params;
        const isAdmin = req.user?.role === 'admin';
        const where = { id: cityId };
        if (!isAdmin) {
            where.isActive = true;
        }

        const city = await City.findOne({
            where,
            include: [{
                model: Profile,
                attributes: ['id', 'name', 'age', 'gender', 'photo', 'status', 'about', 'interests', 'height', 'weight', 'phone'],
                where: { status: 'active' }
            }]
        });

        if (!city) {
            return res.status(404).json({ message: 'Город не найден' });
        }

        res.json(city.Profiles);
    } catch (error) {
        console.error('Ошибка при получении анкет города:', error);
        res.status(500).json({ message: 'Ошибка при получении анкет города' });
    }
}; 
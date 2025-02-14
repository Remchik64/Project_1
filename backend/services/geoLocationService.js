const geoip = require('geoip-lite');
const { City } = require('../models');

class GeoLocationService {
    constructor() {
        console.log('Сервис геолокации инициализирован');
        this.testMode = false;
        this.testIp = null;
        this.testCity = null;
    }

    // Метод для включения тестового режима
    async enableTestMode(testIp) {
        try {
            const geoipResult = geoip.lookup(testIp);
            if (!geoipResult) {
                throw new Error('Не удалось определить местоположение для тестового IP');
            }

            const cityData = {
                city: this.translateCity(geoipResult.city),
                region: this.translateRegion(geoipResult.region),
                country: 'Россия',
                source: 'geoip-lite'
            };

            // Проверяем активность города в базе данных
            const city = await City.findOne({
                where: {
                    name: cityData.city,
                    status: 'active'
                }
            });

            if (!city) {
                throw new Error(`Город ${cityData.city} не активен или не найден в базе данных`);
            }

            this.testMode = true;
            this.testIp = testIp;
            this.testCity = cityData;
            console.log('Включен тестовый режим геолокации с IP:', testIp, 'для города:', cityData.city);
            return cityData;
        } catch (error) {
            console.error('Ошибка при включении тестового режима:', error);
            throw error;
        }
    }

    // Метод для выключения тестового режима
    disableTestMode() {
        this.testMode = false;
        this.testIp = null;
        this.testCity = null;
        console.log('Тестовый режим геолокации выключен');
    }

    async getCityByIp(ip) {
        try {
            // Если включен тестовый режим, возвращаем тестовый город
            if (this.testMode && this.testCity) {
                console.log('Возвращаем тестовый город:', this.testCity);
                return this.testCity;
            }

            const ipToUse = this.testMode ? this.testIp : ip;
            console.log('Определение города для IP:', ipToUse);
            
            const geoipResult = geoip.lookup(ipToUse);
            console.log('Результат geoip:', geoipResult);

            if (!geoipResult) {
                console.log('Не удалось определить местоположение');
                return null;
            }

            // Если это не Россия, возвращаем null
            if (geoipResult.country !== 'RU') {
                console.log('IP не из России:', geoipResult.country);
                return null;
            }

            const cityData = {
                city: this.translateCity(geoipResult.city),
                region: this.translateRegion(geoipResult.region),
                country: 'Россия',
                source: 'geoip-lite'
            };

            // Проверяем, является ли город областным центром
            cityData.isRegionalCenter = this.isRegionalCenter(cityData.city);
            if (!cityData.isRegionalCenter) {
                const regionalCenter = this.getRegionalCenter(cityData.region);
                if (regionalCenter) {
                    cityData.regionalCenter = regionalCenter;
                }
            }

            // Проверяем активность города в базе данных
            if (cityData.city) {
                const city = await City.findOne({
                    where: {
                        name: cityData.city,
                        status: 'active'
                    }
                });

                if (!city) {
                    console.log(`Город ${cityData.city} не активен или не найден в базе данных`);
                    return null;
                }
            }

            console.log('Определены данные города:', cityData);
            return cityData;
        } catch (error) {
            console.error('Ошибка при определении города по IP:', error);
            return null;
        }
    }

    translateCity(englishName) {
        if (!englishName) return null;
        
        // Словарь для перевода основных городов
        const cityTranslations = {
            'Moscow': 'Москва',
            'Saint Petersburg': 'Санкт-Петербург',
            'Voronezh': 'Воронеж',
            'Belgorod': 'Белгород',
            'Lipetsk': 'Липецк',
            'Kursk': 'Курск',
            'Tambov': 'Тамбов',
            'Orel': 'Орёл',
            'Bryansk': 'Брянск',
            'Kaluga': 'Калуга',
            'Tula': 'Тула',
            'Ryazan': 'Рязань',
            'Vladimir': 'Владимир',
            'Ivanovo': 'Иваново',
            'Kostroma': 'Кострома',
            'Yaroslavl': 'Ярославль',
            'Nizhny Novgorod': 'Нижний Новгород',
            'Kazan': 'Казань',
            'Samara': 'Самара',
            'Saratov': 'Саратов',
            'Penza': 'Пенза',
            'Ulyanovsk': 'Ульяновск',
            'Volgograd': 'Волгоград',
            'Astrakhan': 'Астрахань',
            'Yekaterinburg': 'Екатеринбург',
            'Chelyabinsk': 'Челябинск',
            'Ufa': 'Уфа',
            'Perm': 'Пермь',
            'Rostov-on-Don': 'Ростов-на-Дону',
            'Krasnodar': 'Краснодар',
            'Sochi': 'Сочи',
            'Stavropol': 'Ставрополь'
        };
        return cityTranslations[englishName] || englishName;
    }

    translateRegion(englishName) {
        if (!englishName) return null;

        // Словарь для перевода регионов
        const regionTranslations = {
            'Moscow': 'Московская область',
            'Saint Petersburg': 'Ленинградская область',
            'Voronezh': 'Воронежская область',
            'Belgorod': 'Белгородская область',
            'Lipetsk': 'Липецкая область',
            'Kursk': 'Курская область',
            'Tambov': 'Тамбовская область',
            'Orel': 'Орловская область',
            'Bryansk': 'Брянская область',
            'Kaluga': 'Калужская область',
            'Tula': 'Тульская область',
            'Ryazan': 'Рязанская область',
            'Vladimir': 'Владимирская область',
            'Ivanovo': 'Ивановская область',
            'Kostroma': 'Костромская область',
            'Yaroslavl': 'Ярославская область',
            'Nizhny Novgorod': 'Нижегородская область',
            'Kazan': 'Республика Татарстан',
            'Samara': 'Самарская область',
            'Saratov': 'Саратовская область',
            'Penza': 'Пензенская область',
            'Ulyanovsk': 'Ульяновская область',
            'Volgograd': 'Волгоградская область',
            'Astrakhan': 'Астраханская область',
            'Yekaterinburg': 'Свердловская область',
            'Chelyabinsk': 'Челябинская область',
            'Ufa': 'Республика Башкортостан',
            'Perm': 'Пермский край',
            'Rostov-on-Don': 'Ростовская область',
            'Krasnodar': 'Краснодарский край',
            'Sochi': 'Краснодарский край',
            'Stavropol': 'Ставропольский край'
        };
        return regionTranslations[englishName] || englishName;
    }

    isRegionalCenter(city) {
        if (!city) return false;
        
        // Список областных центров России
        const regionalCenters = [
            'Москва', 'Санкт-Петербург', 'Воронеж', 'Белгород', 'Липецк', 
            'Курск', 'Тамбов', 'Орёл', 'Брянск', 'Калуга', 'Тула', 
            'Рязань', 'Владимир', 'Иваново', 'Кострома', 'Ярославль',
            'Нижний Новгород', 'Казань', 'Самара', 'Саратов', 'Пенза',
            'Ульяновск', 'Волгоград', 'Астрахань', 'Екатеринбург',
            'Челябинск', 'Уфа', 'Пермь', 'Ростов-на-Дону', 'Краснодар',
            'Ставрополь'
        ];
        return regionalCenters.includes(city);
    }

    getRegionalCenter(region) {
        if (!region) return null;

        // Маппинг регионов и их областных центров
        const regionToCenter = {
            'Московская область': 'Москва',
            'Ленинградская область': 'Санкт-Петербург',
            'Воронежская область': 'Воронеж',
            'Белгородская область': 'Белгород',
            'Липецкая область': 'Липецк',
            'Курская область': 'Курск',
            'Тамбовская область': 'Тамбов',
            'Орловская область': 'Орёл',
            'Брянская область': 'Брянск',
            'Калужская область': 'Калуга',
            'Тульская область': 'Тула',
            'Рязанская область': 'Рязань',
            'Владимирская область': 'Владимир',
            'Ивановская область': 'Иваново',
            'Костромская область': 'Кострома',
            'Ярославская область': 'Ярославль',
            'Нижегородская область': 'Нижний Новгород',
            'Республика Татарстан': 'Казань',
            'Самарская область': 'Самара',
            'Саратовская область': 'Саратов',
            'Пензенская область': 'Пенза',
            'Ульяновская область': 'Ульяновск',
            'Волгоградская область': 'Волгоград',
            'Астраханская область': 'Астрахань',
            'Свердловская область': 'Екатеринбург',
            'Челябинская область': 'Челябинск',
            'Республика Башкортостан': 'Уфа',
            'Пермский край': 'Пермь',
            'Ростовская область': 'Ростов-на-Дону',
            'Краснодарский край': 'Краснодар',
            'Ставропольский край': 'Ставрополь'
        };
        return regionToCenter[region];
    }
}

module.exports = new GeoLocationService(); 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { getApiUrl } from '../config/api';
import { setPageMetadata, setStructuredData } from '../utils/seo';
import './SiteMap.css';

const SiteMap = () => {
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Устанавливаем SEO метаданные для страницы карты сайта
        setPageMetadata({
            title: 'Карта сайта | Сервис знакомств',
            description: 'Полная карта сайта знакомств. Навигация по всем разделам и городам.',
            keywords: 'карта сайта, навигация, разделы сайта, города',
            canonical: window.location.href,
            og: {
                title: 'Карта сайта | Сервис знакомств',
                description: 'Полная карта сайта знакомств. Навигация по всем разделам и городам.',
                type: 'website',
                url: window.location.href,
                image: `${window.location.origin}/og-image.jpg`
            }
        });

        // Устанавливаем структурированные данные для карты сайта
        setStructuredData({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            'name': 'Карта сайта',
            'description': 'Полная карта сайта знакомств. Навигация по всем разделам и городам.',
            'url': window.location.href,
            'breadcrumb': {
                '@type': 'BreadcrumbList',
                'itemListElement': [
                    {
                        '@type': 'ListItem',
                        'position': 1,
                        'name': 'Главная',
                        'item': window.location.origin
                    },
                    {
                        '@type': 'ListItem',
                        'position': 2,
                        'name': 'Карта сайта',
                        'item': window.location.href
                    }
                ]
            }
        });

        const fetchCities = async () => {
            try {
                const response = await axios.get(getApiUrl('/api/cities'));
                setCities(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Ошибка при загрузке городов:', error);
                setError('Не удалось загрузить список городов');
                setLoading(false);
            }
        };

        fetchCities();
    }, []);

    if (loading) return <div className="sitemap-loading">Загрузка карты сайта...</div>;
    if (error) return <div className="sitemap-error">{error}</div>;

    return (
        <div className="sitemap-container" itemScope itemType="https://schema.org/ItemList">
            <meta itemProp="name" content="Карта сайта" />
            <meta itemProp="description" content="Полная карта сайта знакомств. Навигация по всем разделам и городам." />
            
            <h1>Карта сайта</h1>
            
            <div className="sitemap-section" itemScope itemType="https://schema.org/ItemList">
                <meta itemProp="name" content="Основные страницы" />
                <h2>Основные страницы</h2>
                <ul>
                    <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                        <meta itemProp="position" content="1" />
                        <Link to="/" itemProp="url"><span itemProp="name">Главная страница</span></Link>
                    </li>
                    <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                        <meta itemProp="position" content="2" />
                        <Link to="/login" itemProp="url"><span itemProp="name">Вход в систему</span></Link>
                    </li>
                    <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                        <meta itemProp="position" content="3" />
                        <Link to="/register" itemProp="url"><span itemProp="name">Регистрация</span></Link>
                    </li>
                    <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                        <meta itemProp="position" content="4" />
                        <Link to="/about" itemProp="url"><span itemProp="name">О нас</span></Link>
                    </li>
                    <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                        <meta itemProp="position" content="5" />
                        <Link to="/contact" itemProp="url"><span itemProp="name">Контакты</span></Link>
                    </li>
                    <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                        <meta itemProp="position" content="6" />
                        <Link to="/profiles" itemProp="url"><span itemProp="name">Анкеты</span></Link>
                    </li>
                </ul>
            </div>
            
            <div className="sitemap-section" itemScope itemType="https://schema.org/ItemList">
                <meta itemProp="name" content="Города" />
                <h2>Города</h2>
                <ul className="cities-list">
                    {cities.map((city, index) => (
                        <li key={city.id} itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                            <meta itemProp="position" content={index + 1} />
                            <Link to={`/city/${city.id}`} itemProp="url">
                                <span itemProp="name">{city.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            
            <div className="sitemap-section" itemScope itemType="https://schema.org/ItemList">
                <meta itemProp="name" content="Информационные страницы" />
                <h2>Информационные страницы</h2>
                <ul>
                    <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                        <meta itemProp="position" content="1" />
                        <Link to="/terms" itemProp="url"><span itemProp="name">Условия использования</span></Link>
                    </li>
                    <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                        <meta itemProp="position" content="2" />
                        <Link to="/privacy" itemProp="url"><span itemProp="name">Политика конфиденциальности</span></Link>
                    </li>
                    <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                        <meta itemProp="position" content="3" />
                        <Link to="/faq" itemProp="url"><span itemProp="name">Часто задаваемые вопросы</span></Link>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default SiteMap; 
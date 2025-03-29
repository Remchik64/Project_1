import React, { useState, useEffect } from 'react';
import './ImageSlider.css';

const ImageSlider = ({ images, onClick, className = '', initialIndex = 0, onImageError }) => {
    // Нормализуем входной параметр images, чтобы всегда работать с массивом
    const normalizeImages = (inputImages) => {
        console.log('ImageSlider - Входящие изображения:', inputImages);
        if (!inputImages || (Array.isArray(inputImages) && inputImages.length === 0)) {
            console.log('ImageSlider - Нет изображений, возвращаем пустой массив');
            return [];
        }
        
        if (Array.isArray(inputImages)) {
            console.log('ImageSlider - Входящие данные являются массивом длиной:', inputImages.length);
            return inputImages;
        } else if (typeof inputImages === 'string') {
            // Проверяем, может быть это JSON строка
            try {
                const parsed = JSON.parse(inputImages);
                if (Array.isArray(parsed)) {
                    console.log('ImageSlider - Успешно распарсили JSON строку в массив длиной:', parsed.length);
                    return parsed;
                } else {
                    console.log('ImageSlider - JSON строка распарсилась не в массив, используем как одиночный элемент');
                    return [inputImages];
                }
            } catch (e) {
                // Если не удалось распарсить как JSON, используем как одиночный элемент
                console.log('ImageSlider - Не JSON строка, используем как одиночный элемент');
                return [inputImages];
            }
        } else if (inputImages) {
            // Если это не массив и не строка, но что-то есть - используем как одиночный элемент
            console.log('ImageSlider - Нестандартные данные, используем как одиночный элемент:', typeof inputImages);
            return [inputImages];
        }
        return []; // Если ничего нет, возвращаем пустой массив
    };

    const normalizedImages = normalizeImages(images);
    const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
    const [imageErrors, setImageErrors] = useState({});

    console.log(`ImageSlider - Нормализованные изображения:`, normalizedImages);
    console.log(`ImageSlider - Изображений: ${normalizedImages.length}, текущий индекс: ${currentIndex}, initialIndex: ${initialIndex}`);

    // Сбрасываем текущий индекс и ошибки при изменении списка изображений
    useEffect(() => {
        console.log(`ImageSlider - useEffect - установка индекса: ${initialIndex}, кол-во изображений: ${normalizedImages.length}`);
        if (normalizedImages.length > 0) {
            // Проверяем, что initialIndex в диапазоне массива
            if (initialIndex >= 0 && initialIndex < normalizedImages.length) {
                setCurrentIndex(initialIndex);
            } else {
                setCurrentIndex(0);
                console.log(`ImageSlider - initialIndex ${initialIndex} выходит за границы массива, сброс в 0`);
            }
        }
        setImageErrors({});
    }, [normalizedImages, initialIndex]);

    const handlePrev = (e) => {
        e.stopPropagation();
        if (normalizedImages.length > 1) {
            setCurrentIndex((prevIndex) => 
                prevIndex === 0 ? normalizedImages.length - 1 : prevIndex - 1
            );
        }
    };

    const handleNext = (e) => {
        e.stopPropagation();
        if (normalizedImages.length > 1) {
            setCurrentIndex((prevIndex) => 
                prevIndex === normalizedImages.length - 1 ? 0 : prevIndex + 1
            );
        }
    };

    const handleImageClick = () => {
        if (onClick) {
            onClick(normalizedImages, currentIndex);
        }
    };

    const handleImageError = (index) => {
        console.log(`ImageSlider - Ошибка загрузки изображения с индексом ${index}`);
        setImageErrors(prev => ({
            ...prev,
            [index]: true
        }));
        if (onImageError) {
            onImageError();
        }
    };

    if (!normalizedImages.length) {
        console.log('ImageSlider - Рендеринг заглушки "Нет изображения"');
        return (
            <div className={`image-slider ${className}`}>
                <div className="no-image">Нет изображения</div>
            </div>
        );
    }

    return (
        <div className={`image-slider ${className}`}>
            <div className="slider-container" onClick={handleImageClick}>
                {normalizedImages.map((image, index) => (
                    <div 
                        key={index}
                        className={`slide ${index === currentIndex ? 'active' : ''}`}
                    >
                        {!imageErrors[index] ? (
                            <img 
                                src={image} 
                                alt={`Slide ${index + 1}`} 
                                onError={() => handleImageError(index)}
                            />
                        ) : (
                            <div className="error-image">Ошибка загрузки</div>
                        )}
                    </div>
                ))}
                
                {normalizedImages.length > 1 && (
                    <>
                        <button className="slider-btn prev" onClick={handlePrev}>
                            <span className="chevron left"></span>
                        </button>
                        <button className="slider-btn next" onClick={handleNext}>
                            <span className="chevron right"></span>
                        </button>
                        <div className="slider-indicators">
                            {normalizedImages.map((_, index) => (
                                <span 
                                    key={index} 
                                    className={`indicator ${index === currentIndex ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentIndex(index);
                                    }}
                                ></span>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ImageSlider; 
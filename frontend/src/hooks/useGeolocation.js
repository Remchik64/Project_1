import { useState, useEffect } from 'react';
import axios from 'axios';

const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Получение города по IP через внешний сервис
  const getCityByIP = async () => {
    try {
      // Используем сервис с поддержкой CORS
      const response = await axios.get('http://ip-api.com/json/?fields=status,message,country,city,lat,lon&lang=ru');
      
      if (response.data.status === 'success') {
        return {
          city: response.data.city,
          latitude: response.data.lat,
          longitude: response.data.lon
        };
      } else {
        console.error('Ошибка при определении города:', response.data.message);
        return null;
      }
    } catch (error) {
      console.error('Ошибка при определении города по IP:', error);
      return null;
    }
  };

  useEffect(() => {
    const getLocation = async () => {
      try {
        const ipLocation = await getCityByIP();
        if (ipLocation) {
          console.log('Определено местоположение:', ipLocation);
          setLocation(ipLocation);
        } else {
          setError('Не удалось определить город');
        }
      } catch (error) {
        console.error('Ошибка при определении местоположения:', error);
        setError('Ошибка при определении местоположения');
      } finally {
        setLoading(false);
      }
    };

    getLocation();
  }, []);

  return { location, error, loading };
};

export default useGeolocation; 
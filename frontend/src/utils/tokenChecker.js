import axios from 'axios';
import { getApiUrl } from '../config/api';

/**
 * Утилита для проверки токена и роли пользователя
 */
export const checkToken = async () => {
  try {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    console.log('Проверка токена и пользователя:');
    console.log('Токен:', token);
    console.log('Сохраненный пользователь:', storedUser);
    
    if (!token || !storedUser) {
      console.log('Токен или данные пользователя отсутствуют');
      return { valid: false, error: 'Токен или данные пользователя отсутствуют' };
    }
    
    // Парсим данные пользователя
    const user = JSON.parse(storedUser);
    console.log('Данные пользователя:', user);
    console.log('Роль пользователя:', user.role);
    
    // Проверяем роль
    if (user.role !== 'admin') {
      console.log('Пользователь не является администратором');
      return { valid: false, error: 'Пользователь не является администратором' };
    }
    
    // Проверяем токен на сервере
    try {
      console.log('Отправка запроса на проверку токена...');
      const response = await axios.get(getApiUrl('/api/auth/me'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Ответ от сервера:', response.data);
      
      if (response.data.role !== 'admin') {
        console.log('Сервер вернул пользователя, но он не является администратором');
        return { valid: false, error: 'Пользователь не является администратором' };
      }
      
      return { valid: true, user: response.data };
    } catch (error) {
      console.error('Ошибка при проверке токена на сервере:', error);
      return { valid: false, error: 'Ошибка при проверке токена на сервере' };
    }
  } catch (error) {
    console.error('Ошибка при проверке токена:', error);
    return { valid: false, error: 'Ошибка при проверке токена' };
  }
};

/**
 * Утилита для проверки заголовков запроса
 */
export const checkRequestHeaders = () => {
  const token = localStorage.getItem('token');
  
  console.log('Проверка заголовков запроса:');
  console.log('Токен:', token);
  
  if (!token) {
    console.log('Токен отсутствует');
    return { valid: false, headers: {} };
  }
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  console.log('Заголовки запроса:', headers);
  
  return { valid: true, headers };
};

export default {
  checkToken,
  checkRequestHeaders
}; 
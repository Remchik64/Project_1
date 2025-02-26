FROM node:18-alpine

# Создаем директорию приложения
WORKDIR /app

# Копируем файлы package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем файлы бэкенда и устанавливаем зависимости
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Копируем файлы фронтенда и устанавливаем зависимости
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Копируем исходный код
COPY . .

# Собираем фронтенд
RUN cd frontend && CI=false npm run build

# Открываем порт
EXPOSE 8080

# Запускаем приложение
CMD ["npm", "run", "start"] 
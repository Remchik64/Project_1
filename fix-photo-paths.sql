-- Обновляем пути к фотографиям, чтобы они указывали на существующие файлы

-- Первая анкета (Ника)
UPDATE Profiles 
SET photo = '/uploads/profile-1743446614910-339757507.jpg',
    photos = json_array('/uploads/profile-1743446614910-339757507.jpg')
WHERE id = 3;

-- Вторая анкета (Вика)
UPDATE Profiles 
SET photo = '/uploads/profile-1743450682985-996061072.jpg',
    photos = json_array('/uploads/profile-1743450682985-996061072.jpg')
WHERE id = 4;

-- Третья анкета (Ангелина)
UPDATE Profiles 
SET photo = '/uploads/profile-1743451879417-959356912.jpg',
    photos = json_array('/uploads/profile-1743451879417-959356912.jpg')
WHERE id = 5;

-- Остальные анкеты (если есть)
-- Для каждой последующей анкеты используем одну из имеющихся фотографий
UPDATE Profiles 
SET photo = '/uploads/profile-1743446619379-725122764.jpg',
    photos = json_array('/uploads/profile-1743446619379-725122764.jpg')
WHERE id > 5; 
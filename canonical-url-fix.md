# Исправление канонических URL на сайте escort-bar.live

## Проблема

Яндекс.Вебмастер уведомил о смене канонического URL на сайте с `https://xn--80adhe8ahe2f.ru/` (пуникод-версия кириллического домена) на `https://escort-bar.live/`. Эта смена произошла в процессе перехода с кириллического домена на новый латинский домен.

Однако, при анализе кода сайта обнаружено, что некоторые элементы все еще ссылаются на старый placeholder-домен (`вашдомен.ru`), что может вызывать проблемы с индексацией сайта и приводить к дублированию контента в поисковой выдаче.

## Найденные проблемные файлы

В следующих файлах обнаружены ссылки на старый домен:

1. `frontend/src/pages/AboutPage.js` - canonical URL указывает на `https://вашдомен.ru/about`
2. `frontend/src/pages/PrivacyPage.js` - canonical URL указывает на `https://вашдомен.ru/privacy`
3. `frontend/src/pages/TermsPage.js` - canonical URL указывает на `https://вашдомен.ru/terms`
4. `frontend/public/robots.txt` - URL карты сайта указывает на `https://вашдомен.ru/sitemap.xml`
5. `frontend/public/sitemap.xml` - все URL ссылаются на `https://вашдомен.ru/`
6. `frontend/src/utils/seo.js` - содержит ссылки на `https://вашдомен.ru`
7. `backend/scripts/generateSitemap.js` - базовый URL установлен как `https://вашдомен.ru`

## Рекомендуемые изменения

### 1. Обновление канонических URL в страницах

В каждом из указанных файлов страниц (`AboutPage.js`, `PrivacyPage.js`, `TermsPage.js`) необходимо заменить:

```jsx
<link rel="canonical" href="https://вашдомен.ru/about" />
```

на 

```jsx
<link rel="canonical" href="https://escort-bar.live/about" />
```

(соответственно для каждого пути)

### 2. Обновление robots.txt

Необходимо изменить ссылку на sitemap:

```
Sitemap: https://вашдомен.ru/sitemap.xml
```

на

```
Sitemap: https://escort-bar.live/sitemap.xml
```

### 3. Обновление sitemap.xml

Все URL в файле sitemap.xml должны указывать на `https://escort-bar.live/` вместо `https://вашдомен.ru/`.

### 4. Обновление утилиты SEO

В файле `frontend/src/utils/seo.js` необходимо обновить все ссылки:

```js
'url': 'https://вашдомен.ru',
'logo': 'https://вашдомен.ru/logo.png',
```

на

```js
'url': 'https://escort-bar.live',
'logo': 'https://escort-bar.live/logo.png',
```

### 5. Обновление скрипта генерации sitemap

В файле `backend/scripts/generateSitemap.js` изменить:

```js
const BASE_URL = 'https://вашдомен.ru'
```

на

```js
const BASE_URL = 'https://escort-bar.live'
```

## Вывод

После внесения этих изменений, необходимо выполнить сборку проекта и загрузить обновленные файлы на сервер. Затем следует проверить все канонические URL и убедиться, что они правильно установлены. Эти действия помогут избежать проблем с дублированием контента и улучшат индексацию сайта поисковыми системами.

После внесения изменений рекомендуется также переиндексировать сайт через панели вебмастеров Яндекс и Google. 
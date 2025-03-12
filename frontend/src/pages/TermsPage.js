import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import './TermsPage.css';

const TermsPage = () => {
  useEffect(() => {
    // Прокрутка страницы вверх при загрузке
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="terms-page">
      <Helmet>
        <title>Условия использования | Сервис знакомств</title>
        <meta name="description" content="Ознакомьтесь с условиями использования нашего сервиса знакомств. Правила размещения объявлений, возрастные ограничения и процесс регистрации." />
        <meta name="keywords" content="условия использования, правила сервиса знакомств, размещение объявлений, возрастные ограничения" />
        <link rel="canonical" href="https://вашдомен.ru/terms" />
      </Helmet>

      <div className="terms-container">
        <h1>Условия использования сервиса</h1>
        
        <section className="terms-section">
          <h2>1. Общие положения</h2>
          <p>
            Настоящие Условия использования (далее — «Условия») регулируют отношения между Администрацией сервиса знакомств (далее — «Сервис») и физическими лицами (далее — «Пользователи»), желающими воспользоваться услугами Сервиса.
          </p>
          <p>
            Используя Сервис, Пользователь подтверждает, что полностью ознакомился с настоящими Условиями, понимает их содержание и принимает их в полном объеме.
          </p>
        </section>

        <section className="terms-section">
          <h2>2. Возрастные ограничения</h2>
          <div className="important-notice">
            <p>
              <strong>Важно!</strong> Пользоваться Сервисом и размещать объявления строго запрещено лицам, не достигшим 18 лет.
            </p>
          </div>
          <p>
            Регистрируясь на Сервисе, Пользователь подтверждает, что ему исполнилось 18 лет. Администрация Сервиса оставляет за собой право запросить документы, подтверждающие возраст Пользователя, и заблокировать доступ к Сервису в случае нарушения возрастных ограничений.
          </p>
        </section>

        <section className="terms-section">
          <h2>3. Размещение объявлений</h2>
          <p>
            Сервис является рекламной площадкой для размещения объявлений о знакомствах. Для размещения объявления на Сервисе необходимо выполнить следующие действия:
          </p>
          <ol className="steps-list">
            <li>
              <h3>Связь с менеджером</h3>
              <p>
                Перейдите на страницу входа и свяжитесь с нашим отделом продаж через Telegram-канал. Это необходимо для заполнения анкеты и согласования условий размещения объявления.
              </p>
            </li>
            <li>
              <h3>Заполнение анкеты</h3>
              <p>
                В Telegram-боте вам будет предложено заполнить анкету с информацией, необходимой для размещения объявления. Предоставленная информация должна быть достоверной и актуальной.
              </p>
            </li>
            <li>
              <h3>Оплата услуг</h3>
              <p>
                После заполнения анкеты менеджер свяжется с вами для обсуждения деталей размещения и оплаты услуг. Размещение объявления на Сервисе является платной услугой.
              </p>
            </li>
            <li>
              <h3>Модерация и публикация</h3>
              <p>
                После оплаты ваше объявление проходит модерацию и публикуется на Сервисе. Срок размещения объявления зависит от выбранного тарифа.
              </p>
            </li>
          </ol>
        </section>

        <section className="terms-section">
          <h2>4. Telegram-бот и часто задаваемые вопросы</h2>
          <p>
            Для удобства пользователей мы разработали Telegram-бота, который может ответить на часто задаваемые вопросы, такие как:
          </p>
          <ul className="faq-list">
            <li>Стоимость размещения объявлений и доступные тарифы</li>
            <li>Сроки размещения объявлений</li>
            <li>Возможности продвижения объявлений</li>
            <li>Правила оформления анкет</li>
            <li>Процесс модерации объявлений</li>
            <li>Способы оплаты услуг</li>
          </ul>
          <p>
            Telegram-бот доступен 24/7 и предоставляет актуальную информацию о наших услугах. Для получения более детальной информации или решения нестандартных вопросов вы можете связаться с менеджером через Telegram-канал.
          </p>
        </section>

        <section className="terms-section">
          <h2>5. Правила размещения контента</h2>
          <p>
            При размещении объявлений на Сервисе запрещается:
          </p>
          <ul className="rules-list">
            <li>Публиковать недостоверную информацию</li>
            <li>Использовать чужие фотографии без разрешения</li>
            <li>Размещать контент, содержащий оскорбления, угрозы или дискриминацию</li>
            <li>Публиковать контент, нарушающий авторские права</li>
            <li>Размещать объявления, содержащие предложения запрещенных услуг</li>
          </ul>
          <p>
            Администрация Сервиса оставляет за собой право удалять объявления, нарушающие данные правила, без предварительного уведомления и возврата средств.
          </p>
        </section>

        <section className="terms-section">
          <h2>6. Ответственность сторон</h2>
          <p>
            Сервис является площадкой для размещения объявлений и не несет ответственности за действия Пользователей, совершенные вне Сервиса. Пользователи самостоятельно несут ответственность за свои действия и размещаемый контент.
          </p>
          <p>
            Администрация Сервиса не гарантирует достоверность информации, размещенной в объявлениях, и рекомендует Пользователям проявлять осмотрительность при взаимодействии с другими Пользователями.
          </p>
        </section>

        <section className="terms-section">
          <h2>7. Изменение условий</h2>
          <p>
            Администрация Сервиса оставляет за собой право в одностороннем порядке изменять настоящие Условия. Изменения вступают в силу с момента их публикации на Сервисе. Продолжая использовать Сервис после внесения изменений, Пользователь подтверждает свое согласие с новыми Условиями.
          </p>
        </section>

        <div className="terms-footer">
          <p>Последнее обновление: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage; 
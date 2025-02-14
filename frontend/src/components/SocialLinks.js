import React, { useEffect, useState } from 'react';
import './SocialLinks.css';

const SocialLinks = ({ profile, settings }) => {
    const [socialLinks, setSocialLinks] = useState({
        telegram: null,
        whatsapp: null,
        vk: null
    });

    useEffect(() => {
        // Обновляем состояние при изменении props
        setSocialLinks({
            telegram: profile.telegramLink || settings?.profileTelegramLink,
            whatsapp: profile.whatsappLink || settings?.profileWhatsappLink,
            vk: settings?.vkLink
        });
    }, [profile, settings]); // Зависимости для useEffect

    const handleSocialClick = (url) => {
        if (url) {
            window.open(url, '_blank');
        }
    };

    // Функция для проверки валидности ссылки
    const isValidLink = (link) => {
        return link && typeof link === 'string' && link.trim() !== '';
    };

    return (
        <div className="social-links">
            {isValidLink(socialLinks.telegram) && (
                <button 
                    className="social-button telegram"
                    onClick={() => handleSocialClick(socialLinks.telegram)}
                    title="Написать в Telegram"
                >
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.495 7.952l-1.793 8.457c-.135.633-.497.783-1.01.488l-2.79-2.054-1.346 1.295c-.148.148-.273.273-.56.273l.2-2.838 5.17-4.667c.225-.198-.05-.31-.346-.112l-6.387 4.023-2.752-.857c-.598-.188-.61-.598.126-.885l10.735-4.136c.497-.188.934.112.753.913z"/>
                    </svg>
                </button>
            )}
            {isValidLink(socialLinks.whatsapp) && (
                <button 
                    className="social-button whatsapp"
                    onClick={() => handleSocialClick(socialLinks.whatsapp)}
                    title="Написать в WhatsApp"
                >
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z"/>
                    </svg>
                </button>
            )}
            {isValidLink(socialLinks.vk) && (
                <button 
                    className="social-button vk"
                    onClick={() => handleSocialClick(socialLinks.vk)}
                    title="Перейти ВКонтакте"
                >
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm5.998 16.385c-.147.288-.376.541-.685.753-.309.213-.632.37-.97.471-.337.1-.695.174-1.075.223-.38.048-.732.072-1.056.072h-.915c-.458 0-.894-.056-1.309-.167-.414-.111-.774-.294-1.079-.55-.305-.256-.545-.588-.72-.997-.175-.409-.262-.903-.262-1.482v-.437c0-.579.087-1.073.262-1.482.175-.409.415-.741.72-.997.305-.256.665-.439 1.079-.55.415-.111.851-.167 1.309-.167h.915c.324 0 .676.024 1.056.072.38.049.738.123 1.075.223.338.101.661.258.97.471.309.212.538.465.685.753.147.288.22.608.22.959v.437c0 .351-.073.671-.22.959z"/>
                    </svg>
                </button>
            )}
        </div>
    );
};

export default SocialLinks; 
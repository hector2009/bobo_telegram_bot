const MESSAGES = {
    en: {
        number_not_found: "Number not found.",
        hash_not_found: "Hash not found.",
        confirmed: phone => `Your number +${phone} has been confirmed! 🎉`,
        error: msg => `An error occurred: ${msg}`,
        server_error: "Error sending request to server.",
        no_permission: "⛔ You do not have permission to use this command.",
        specify_text: "❗ Specify text: /send message",
        mailing_started: count => `🚀 Mailing started. Recipients: ${count}`,
        mailing_done: sent => `✔️ Done! Sent: ${sent}`,
        my_chat_id: id => `Your chat_id: ${id}`,
    },
    uk: {
        number_not_found: "Номер не знайдено.",
        hash_not_found: "Хеш не знайдено.",
        confirmed: phone => `Ваш номер +${phone} підтверджено! 🎉`,
        error: msg => `Сталася помилка: ${msg}`,
        server_error: "Помилка відправки запиту на сервер.",
        no_permission: "⛔ У вас немає доступу до цієї команди.",
        specify_text: "❗ Вкажіть текст: /send повідомлення",
        mailing_started: count => `🚀 Розсилка розпочата. Отримувачів: ${count}`,
        mailing_done: sent => `✔️ Готово! Надіслано: ${sent}`,
        my_chat_id: id => `Ваш chat_id: ${id}`,
    }
};

module.exports = { MESSAGES };
require('dotenv').config();

const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(async (ctx) => {
    const args = ctx.message.text.split(" ");

    if (!args[1] || !args[1].startsWith("confirm_")) {
        return ctx.reply("Невірний параметр.");
    }

    const phone = args[1].replace("confirm_", "");
    const chatId = ctx.chat.id;

    try {
        // fetch встроен в Node 24
        const response = await fetch(process.env.API_URL + "confirm_phone", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                phone: phone,
                chat_id: chatId,
            }),
        });

        const result = await response.json();

        //ctx.reply(JSON.stringify(result));

        if (result.success) {
            ctx.reply(`Ваш номер +${phone} підтверджено! 🎉`);
        } else {
            ctx.reply("Сталася помилка: " + result.message);
        }
    } catch (err) {
        console.error(err);
        ctx.reply("Помилка при відправці запиту на сервер.");
    }
});

bot.launch();
console.log("🚀 Bot started...");

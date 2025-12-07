require('dotenv').config();

const { Telegraf } = require("telegraf");
const { code } = require('telegraf/format');
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(async (ctx) => {
    const args = ctx.message.text.split(" ");
    const params = args[1].split("_x_");

    if (!params[0] || !params[0].startsWith("confirm_")) {
        return ctx.reply("Number not found.");
    }

    if (!params[1] || !params[1].startsWith("hash_")) {
        return ctx.reply("Hash not found.");
    }

    const phone = params[0].replace("confirm_", "");
    const hash = params[1].replace("hash_", "");
    const chatId = ctx.chat.id;

    try {
        // fetch встроен в Node 24
        const response = await fetch(process.env.API_URL + "confirm_phone", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                phone: phone,
                form_hash_id: hash,
                chat_id: chatId,
            }),
        });

        const result = await response.json();

        if (result.success) {
            ctx.reply(`Your number +${phone} has been confirmed! 🎉`);
        } else {
            ctx.reply("An error occurred: " + result.message);
        }
    } catch (err) {
        console.error(err);
        ctx.reply("Error sending request to server.");
    }
});

const ADMINS = [592987264]; // <-- твой chat_id

bot.command("send", async (ctx) => {
    const senderId = ctx.from.id;

    if (!ADMINS.includes(senderId)) {
        return ctx.reply("⛔ You do not have permission to use this command.");
    }

    const text = ctx.message.text.replace("/send", "").trim();

    if (!text) {
        return ctx.reply("❗ Specify text: /send message");
    }

    // Получаем chat_id из базы
    const chatIdsResponse = await getAllChatIdsFromDatabase(); // <-- твоя функция

    const chatIds = chatIdsResponse.data;

    ctx.reply(`🚀 Mailing started. Recipients: ${chatIds.length}`);

    let sent = 0;
    for (const id of chatIds) {
        try {
            await ctx.telegram.sendMessage(id, text);
            sent++;

            // ограничение 30 msg/sec
            await new Promise(r => setTimeout(r, 35));
        } catch (e) {
            console.log("Error sending to", id);
        }
    }

    ctx.reply(`✔️ Done! Sent: ${sent}`);
});

async function getAllChatIdsFromDatabase() {
        // fetch встроен в Node 24
        const response = await fetch(process.env.API_URL + "get_all_chat_ids", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code: process.env.WP_PLUGIN_CODE,
            }),
        });

        return await response.json();
}

bot.command("myid", (ctx) => {
    if (!ADMINS.includes(senderId)) {
        return ctx.reply("⛔ You do not have permission to use this command.");
    }

    ctx.reply(`Your chat_id: ${ctx.chat.id}`);
});

bot.launch();
console.log("🚀 Bot started...");

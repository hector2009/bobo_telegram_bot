require('dotenv').config();

const http = require("http");
const { Telegraf } = require("telegraf");
const { code } = require('telegraf/format');
const bot = new Telegraf(process.env.BOT_TOKEN);

const { MESSAGES } = require("./i18n");

const ADMINS = process.env.ADMINS
    ? process.env.ADMINS.split(",").map(id => Number(id))
    : [];

// Start command
bot.start(async (ctx) => {
    const msg = t(ctx);
    const args = ctx.message.text.split(" ");
    const params = args[1].split("_x_");

    if (!params[0] || !params[0].startsWith("confirm_")) {
        return ctx.reply(msg.number_not_found);
    }

    if (!params[1] || !params[1].startsWith("hash_")) {
        return ctx.reply(msg.hash_not_found);
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
            ctx.reply(msg.confirmed(phone));
        } else {
            ctx.reply(msg.error(result.message));
        }
    } catch (err) {
        console.error(err);
        ctx.reply(msg.server_error);
    }
});

// Send message command
bot.command("send", async (ctx) => {
    const msg = t(ctx);
    const senderId = ctx.from.id;

    if (!ADMINS.includes(senderId)) {
        return ctx.reply(msg.no_permission);
    }

    const text = ctx.message.text.replace("/send", "").trim();

    if (!text) {
        return ctx.reply(msg.specify_text);
    }

    // Получаем chat_id из базы
    const chatIdsResponse = await getAllChatIdsFromDatabase(); // <-- твоя функция

    const chatIds = chatIdsResponse.data;

    ctx.reply(msg.mailing_started(chatIds.length));

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

    ctx.reply(msg.mailing_done(sent));
});

// Get chat ID command
bot.command("myid", (ctx) => {
    const msg = t(ctx);

    ctx.reply(msg.my_chat_id(ctx.chat.id));
});

// Helper function to get all chat IDs from the database
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

// i18n function
function t(ctx) {
    const lang =
        ctx.from?.language_code?.startsWith("uk")
            ? "uk"
            : process.env.DEFAULT_LANG || "en";

    return MESSAGES[lang] || MESSAGES.uk;
}

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
    res.writeHead(200);
    res.end("Bot is running");
}).listen(PORT, () => {
    console.log(`🌐 HTTP server listening on ${PORT}`);
});

bot.launch();

console.log("🚀 API_URL:", process.env.API_URL);
console.log("🚀 Bot started...");

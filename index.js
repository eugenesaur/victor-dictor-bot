require('dotenv').config();
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const YANDEX_API_KEY = process.env.YANDEX_API_KEY;

const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(TELEGRAM_TOKEN, {polling: true});

const axios = require("axios");

bot.on('voice', (msg) => {
    const stream = bot.getFileStream(msg.voice.file_id);
    const chunks = [];

    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => {
        axios({
            method: "POST",
            url: "https://stt.api.cloud.yandex.net/speech/v1/stt:recognize",
            headers: {
                Authorization: 'Api-Key ' + YANDEX_API_KEY,
            },
            data: Buffer.concat(chunks)
        }).then((response) => {
            const text = response.data.result;
            if (text) {
                bot.sendMessage(msg.chat.id, text, { 
                    "reply_to_message_id": msg.message_id
                });
            }
        }).catch(({ data: error }) => {
            bot.sendMessage(msg.chat.id, `Ошибка при распознавании ${error.error_code}: ${error.error_message}`, { 
                "reply_to_message_id": msg.message_id
            });
        })
    })
});
require("dotenv").config();
const axios = require("axios");
const { Telegraf, Markup } = require("telegraf");
const cron = require("node-cron");

const token = process.env.TELEGRAM_API_KEY;
if (token === undefined) {
  throw new Error("TELEGRAM_API_KEY must be provided!");
}
const bot = new Telegraf(token);
let searchQuery = "";

bot.start((ctx) => {
  ctx.reply(
    "Привіт! Я бот для пошуку і відображення результатів пошуку з Upwork. Щоб почати, введіть /search і ваш запит для пошуку.",
    Markup.inlineKeyboard([
      Markup.button.callback("Натисніть для початку пошуку", "start_search"),
    ])
  );
});

bot.action("start_search", (ctx) => {
  ctx.reply("Введіть дані для пошуку:");
});

bot.on("text", async (ctx) => {
  try {
    searchQuery = ctx.message.text;

    const userParams = searchQuery.split(" ").slice(1).join(" ");
    const params = {
      q: userParams,
    };
    const results = await searchJobs(params);

    if (results && results.length > 0) {
      results.forEach((result) => {
        bot.action(result.id, async (ctx) => {
          try {
            await sendEmailToJob(result.id);

            ctx.reply("Повідомлення успішно відправлено на вакансію!");
          } catch (error) {
            console.error("Error sending email to job:", error);
            ctx.reply(
              "Виникла помилка при спробі відправити повідомлення на вакансію."
            );
          }
        });
      });
    } else {
      ctx.reply("На жаль, нічого не знайдено за вашим запитом.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
});

bot.launch().then(() => {
  console.log("Bot started!");
});

async function searchJobs(params) {
  try {
    const response = await axios.get(
      "https://www.upwork.com/api/profiles/v2/search/jobs.json",
      {
        params: params,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error searching jobs on Upwork:", error);
    return null;
  }
}

async function sendEmailToJob(jobId) {
  console.log(`sending letter to ${jobId}...`);
}

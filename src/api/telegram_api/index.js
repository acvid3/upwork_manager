require("dotenv").config();
const axios = require("axios");
const { Telegraf, Markup } = require("telegraf");

const token = process.env.TELEGRAM_API_KEY;
if (token === undefined) {
  throw new Error("TELEGRAM_API_KEY must be provided!");
}
const bot = new Telegraf(token);
let searchQuery = "";
let sendingEnabled = true;

bot.start((ctx) => {
  ctx.reply(
    "Привіт! Я бот для пошуку і відображення результатів пошуку з Upwork. Щоб почати, введіть /search і ваш запит для пошуку.",
    Markup.inlineKeyboard([
      Markup.button.callback("Натисніть для початку пошуку", "start_search"),
    ])
  );
});

bot.command("stop", (ctx) => {
  sendingEnabled = false;
  ctx.reply("Відправка картинок зупинена.");
});

bot.action("start_search", (ctx) => {
  sendingEnabled = true;

  ctx.reply(
    "Вибач, я ще не підключений до Upwork, проте зможу показувати тобі прикольні картинки, сподіваюсь тобі подобаються Рік і Морті. Ти завжди можеш зупинити мене командою /stop"
  );

  sendData(ctx);
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

    sendData(ctx);
  } catch (error) {
    console.error("Error:", error);
  }
});

bot.launch().then(() => {
  console.log("Bot started!");
});

bot.catch((err) => {
  console.log("An error occurred:", err);
});

async function sendData(ctx) {
  console.log(sendingEnabled, "sendingEnabled");
  if (!ctx || !sendingEnabled) return;

  const results = await searchData();

  if (results) {
    bot.telegram
      .sendPhoto(ctx.chat.id, results)
      .catch((error) => console.error("Error sending photo:", error));
  }

  setTimeout(() => sendData(ctx), 120000);
}

async function searchData() {
  try {
    const response = await axios.get(
      "https://rickandmortyapi.com/api/character"
    );

    const totalPages = response.data.info.pages;
    const randomPage = Math.floor(Math.random() * totalPages) + 1;

    const pageResponse = await axios.get(
      `https://rickandmortyapi.com/api/character?page=${randomPage}`
    );

    const characters = pageResponse.data.results;
    const randomCharacter =
      characters[Math.floor(Math.random() * characters.length)];

    return randomCharacter.image;
  } catch (error) {
    console.error("Error searching characters:", error);
    return null;
  }
}

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

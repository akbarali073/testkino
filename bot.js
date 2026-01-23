const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const { MongoClient } = require("mongodb");
require("dotenv").config();

// ===========================
// KONFIGURATSIYA
// ===========================
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri);

let db, usersCollection, videosCollection, kanalsCollection;
let adminId = [907402803];
let channelUsername = "@panjara_ortida_prison_berk";
let adminStep = {
  stage: null,
  video: null,
  code: null,
  editingCode: null,
  title: null,
};

// ===========================
// EXPRESS SERVER
// ===========================
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot ishlayapti!");
});

app.listen(PORT, () => {
  console.log(`🌐 Server is running on port ${PORT}`);
});

// ===========================
// MONGODB ULANISH
// ===========================
const connectMongo = async () => {
  try {
    await client.connect();
    console.log("✅ MongoDB ulanish muvaffaqiyatli");

    db = client.db("telegramBot");
    usersCollection = db.collection("users");
    videosCollection = db.collection("videos");
    kanalsCollection = db.collection("kanals");

    const kanal = await kanalsCollection.findOne({});
    if (kanal) {
      channelUsername = kanal.username;
    }

    startBot();
  } catch (err) {
    console.error("❌ MongoDB ulanishda xatolik:", err);
  }
};

connectMongo();

// ===========================
// YORDAMCHI FUNKSIYALAR
// ===========================
const isSubscribed = async (userId) => {
  try {
    const res = await bot.getChatMember(channelUsername, userId);
    return ["member", "creator", "administrator"].includes(res.status);
  } catch {
    return false;
  }
};

const saveUser = async (user) => {
  try {
    await usersCollection.updateOne(
      { id: user.id },
      {
        $set: {
          first_name: user.first_name,
          username: user.username || "",
          last_seen: new Date().toISOString(),
        },
      },
      { upsert: true },
    );
  } catch (err) {
    console.error("❌ Foydalanuvchini saqlashda xatolik:", err);
  }
};

// ===========================
// ADMIN KLAVIATURASI
// ===========================
const adminKeyboard = {
  keyboard: [
    ["➕ Kino qo'shish", "📊 Statistikani ko'rish"],
    ["🔗 Kanal qo'shish", "🪓 Kanal o'chirish"],
    ["👥 Admin qo'shish"],
    ["📤 Habar yuborish", "✍️ Kino taxrirlash"],
  ],
  resize_keyboard: true,
};

const cancelKeyboard = {
  keyboard: [["❌ Bekor qilish"]],
  resize_keyboard: true,
};

// ===========================
// BOT BOSHLASH
// ===========================
function startBot() {
  console.log("🤖 Bot ishga tushdi!");

  // ===========================
  // XABARLARNI USHLAB OLISH
  // ===========================
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text?.trim();
    const user = msg.from;

    // Foydalanuvchini saqlash (background)
    saveUser(user).catch((err) => console.error(err));

    // /START BUYRUG'I
    if (text === "/start") {
      if (adminId.includes(user.id)) {
        return bot.sendMessage(
          chatId,
          `🧑‍💻 *Salom Admin* [${user.first_name}](tg://user?id=${user.id})`,
          {
            parse_mode: "Markdown",
            reply_markup: adminKeyboard,
          },
        );
      } else {
        return bot.sendMessage(
          chatId,
          `*👋 Assalomu alaykum* [${user.first_name}](tg://user?id=${user.id}) *botimizga xush kelibsiz.*\n\n✍🏻 Kino kodini yuboring...`,
          { parse_mode: "Markdown" },
        );
      }
    }

    // /START BILAN KINO KODI
    if (text?.startsWith("/start ") && /^\d+$/.test(text.split(" ")[1])) {
      const code = text.split(" ")[1];

      // Admin uchun obuna tekshirmaymiz
      if (!adminId.includes(user.id)) {
        const subscribed = await isSubscribed(user.id);
        if (!subscribed) {
          return bot.sendMessage(
            chatId,
            "*❌ Botdan foydalanish uchun kanallarga obuna bo'ling.*",
            {
              parse_mode: "Markdown",
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "🔗 Obuna bo'lish",
                      url: `https://t.me/${channelUsername.replace("@", "")}`,
                    },
                  ],
                  [{ text: "✅ Tekshirish", callback_data: "check_sub" }],
                ],
              },
            },
          );
        }
      }

      const found = await videosCollection.findOne({ code });
      if (!found) {
        return bot.sendMessage(
          chatId,
          `*❗ Hozircha ${code} kodiga bog'liq kino topilmadi.*`,
          { parse_mode: "Markdown" },
        );
      }

      // Views parallel yangilanadi
      videosCollection
        .updateOne({ code }, { $inc: { views: 1 } })
        .catch((err) => console.error(err));

      return bot.sendVideo(chatId, found.file_id, {
        caption: `🎬 ${found.title}\n📥 *Yuklangan:* ${found.views + 1}\n\n🎬 @Kinoborubot | Bizning botmiz`,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔐 Barcha kino kodlari",
                url: `https://t.me/panjara_ortida_prison_berk`,
              },
            ],
            [
              {
                text: "↪️ Ulashish",
                switch_inline_query: `https://t.me/kinoborubot?start=${code}`,
              },
            ],
          ],
        },
      });
    }

    // OBUNA TEKSHIRISH (Faqat oddiy foydalanuvchilar uchun)
    if (!adminId.includes(user.id)) {
      const subscribed = await isSubscribed(user.id);
      if (!subscribed) {
        return bot.sendMessage(
          chatId,
          "*⚠️ Botdan foydalanish uchun homiy kanalga obuna bo'lishingiz kerak.*",
          {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🔗 Obuna bo'lish",
                    url: `https://t.me/${channelUsername.replace("@", "")}`,
                  },
                ],
                [{ text: "✅ Tekshirish", callback_data: "check_sub" }],
              ],
            },
          },
        );
      }
    }

    // ===========================
    // ADMIN BUYRUQLARI
    // ===========================
    if (adminId.includes(user.id)) {
      // BEKOR QILISH
      if (text === "❌ Bekor qilish") {
        adminStep = {
          stage: null,
          video: null,
          code: null,
          editingCode: null,
          title: null,
        };
        bot.broadcasting = false;
        return bot.sendMessage(chatId, "❌ Amaliyot bekor qilindi.", {
          reply_markup: adminKeyboard,
        });
      }

      // STATISTIKA
      if (text === "📊 Statistikani ko'rish") {
        const usersCount = await usersCollection.countDocuments();
        const videosCount = await videosCollection.countDocuments();
        return bot.sendMessage(
          chatId,
          `📊 *Statistika:*\n👥 Foydalanuvchilar: ${usersCount}\n🎬 Kinolar: ${videosCount}`,
          { parse_mode: "Markdown" },
        );
      }

      // KINO QO'SHISH
      if (text === "➕ Kino qo'shish") {
        adminStep.stage = "waiting_for_video";
        return bot.sendMessage(chatId, "📥 Kino videosini yuboring:", {
          reply_markup: cancelKeyboard,
        });
      }

      // HABAR YUBORISH
      if (text === "📤 Habar yuborish") {
        bot.broadcasting = true;
        return bot.sendMessage(
          chatId,
          "✉️ Yubormoqchi bo'lgan xabaringizni yozing:",
          {
            reply_markup: cancelKeyboard,
          },
        );
      }

      // ADMIN QO'SHISH
      if (text === "👥 Admin qo'shish") {
        adminStep.stage = "waiting_for_admin_id";
        return bot.sendMessage(
          chatId,
          "*👥 Admin qo'shish uchun admin ID ni yuboring:*",
          {
            parse_mode: "Markdown",
            reply_markup: cancelKeyboard,
          },
        );
      }

      // KANAL QO'SHISH
      if (text === "🔗 Kanal qo'shish") {
        adminStep.stage = "waiting_for_channel_username";
        return bot.sendMessage(
          chatId,
          "*🔗 Kanal qo'shish uchun kanal username ni yuboring (masalan: @kanal):*",
          {
            parse_mode: "Markdown",
            reply_markup: cancelKeyboard,
          },
        );
      }

      // KANAL O'CHIRISH
      if (text === "🪓 Kanal o'chirish") {
        await kanalsCollection.deleteMany({});
        channelUsername = "@panjara_ortida_prison_berk";
        return bot.sendMessage(
          chatId,
          "✅ Kanal o'chirildi va standart kanal qayta tiklandi.",
          {
            reply_markup: adminKeyboard,
          },
        );
      }

      // KINO TAXRIRLASH
      if (text === "✍️ Kino taxrirlash") {
        adminStep.stage = "editing_code";
        return bot.sendMessage(
          chatId,
          "✍🏻 Taxrirlamoqchi bo'lgan kino kodini yuboring:",
          {
            reply_markup: cancelKeyboard,
          },
        );
      }

      // ===========================
      // ADMIN STEP JARAYONLARI
      // ===========================

      // KANAL USERNAME QABUL QILISH
      if (adminStep.stage === "waiting_for_channel_username") {
        if (!text || !text.startsWith("@") || text.length < 2) {
          return bot.sendMessage(chatId, "❌ Noto'g'ri kanal username.");
        }
        channelUsername = text.trim();
        await kanalsCollection.updateOne(
          { username: channelUsername },
          { $set: { username: channelUsername } },
          { upsert: true },
        );
        adminStep.stage = null;
        return bot.sendMessage(
          chatId,
          `✅ Kanal qo'shildi: ${channelUsername}`,
          {
            reply_markup: adminKeyboard,
          },
        );
      }

      // ADMIN ID QABUL QILISH
      if (adminStep.stage === "waiting_for_admin_id") {
        const newAdminId = parseInt(text);
        if (isNaN(newAdminId)) {
          return bot.sendMessage(chatId, "❌ Noto'g'ri ID. Raqam kiriting.");
        }
        if (adminId.includes(newAdminId)) {
          return bot.sendMessage(chatId, "❗ Bu ID allaqachon admin.");
        }
        adminId.push(newAdminId);
        adminStep.stage = null;
        await bot.sendMessage(
          chatId,
          `✅ ${newAdminId} ID li foydalanuvchi admin sifatida qo'shildi.`,
          {
            parse_mode: "Markdown",
            reply_markup: adminKeyboard,
          },
        );
        try {
          await bot.sendMessage(
            newAdminId,
            "✅ Siz admin sifatida qo'shildingiz. Davom etish uchun /start buyrug'ini yuboring.",
          );
        } catch (err) {
          console.error("❌ Adminni ogohlantirishda xatolik:", err.message);
        }
        return;
      }

      // TAXRIRLASH UCHUN KOD QABUL QILISH
      if (adminStep.stage === "editing_code") {
        const editing = await videosCollection.findOne({ code: text });
        if (!editing) {
          return bot.sendMessage(chatId, "❌ Bu kod bilan kino topilmadi.");
        }
        adminStep = {
          stage: "choose_edit_option",
          editingCode: text,
          video: editing.file_id,
          title: editing.title,
        };
        return bot.sendMessage(chatId, "Nimani taxrirlaysiz?", {
          reply_markup: {
            keyboard: [["🎬 Nomi", "📹 Videosi"], ["❌ Bekor qilish"]],
            resize_keyboard: true,
          },
        });
      }

      // TAXRIRLASH VARIANTINI TANLASH
      if (adminStep.stage === "choose_edit_option") {
        if (text === "🎬 Nomi") {
          adminStep.stage = "editing_title";
          return bot.sendMessage(chatId, "✍️ Yangi nomni kiriting:", {
            reply_markup: cancelKeyboard,
          });
        }
        if (text === "📹 Videosi") {
          adminStep.stage = "editing_video";
          return bot.sendMessage(chatId, "📥 Yangi video yuboring:", {
            reply_markup: cancelKeyboard,
          });
        }
      }

      // KINO NOMINI TAXRIRLASH
      if (adminStep.stage === "editing_title") {
        await videosCollection.updateOne(
          { code: adminStep.editingCode },
          { $set: { title: text } },
        );
        adminStep = {
          stage: null,
          video: null,
          code: null,
          editingCode: null,
          title: null,
        };
        return bot.sendMessage(chatId, "✅ Kino nomi yangilandi.", {
          reply_markup: adminKeyboard,
        });
      }

      // KINO VIDEOSINI TAXRIRLASH
      if (adminStep.stage === "editing_video" && msg.video) {
        await videosCollection.updateOne(
          { code: adminStep.editingCode },
          { $set: { file_id: msg.video.file_id } },
        );
        adminStep = {
          stage: null,
          video: null,
          code: null,
          editingCode: null,
          title: null,
        };
        return bot.sendMessage(chatId, "✅ Kino videosi yangilandi.", {
          reply_markup: adminKeyboard,
        });
      }

      // KINO QO'SHISH - VIDEO QABUL QILISH
      if (msg.video && adminStep.stage === "waiting_for_video") {
        adminStep.video = msg.video.file_id;
        adminStep.stage = "waiting_for_code";
        return bot.sendMessage(
          chatId,
          "🔢 Kino kodini kiriting (faqat raqam):",
        );
      }

      // KINO QO'SHISH - KOD QABUL QILISH
      if (adminStep.stage === "waiting_for_code" && /^\d+$/.test(text)) {
        const existing = await videosCollection.findOne({ code: text });
        if (existing) {
          return bot.sendMessage(
            chatId,
            "❌ Bu kod allaqachon mavjud. Boshqa kod kiriting.",
          );
        }
        adminStep.code = text;
        adminStep.stage = "waiting_for_title";
        return bot.sendMessage(chatId, "🎬 Kino nomini kiriting:");
      }

      // KINO QO'SHISH - NOM QABUL QILISH
      if (adminStep.stage === "waiting_for_title") {
        await videosCollection.insertOne({
          code: adminStep.code,
          file_id: adminStep.video,
          title: text,
          views: 0,
        });
        adminStep = {
          stage: null,
          video: null,
          code: null,
          editingCode: null,
          title: null,
        };
        return bot.sendMessage(chatId, "*✅ Kino muvaffaqiyatli saqlandi!*", {
          parse_mode: "Markdown",
          reply_markup: adminKeyboard,
        });
      }

      // BROADCASTING
      if (bot.broadcasting) {
        bot.broadcasting = false;
        const users = await usersCollection.find({}).toArray();

        if (msg.photo) {
          const photoId = msg.photo[msg.photo.length - 1].file_id;
          const caption = msg.caption || "";
          let sent = 0;
          for (const u of users) {
            try {
              await bot.sendPhoto(u.id, photoId, { caption });
              sent++;
            } catch (err) {
              console.error(`❌ Xabar yuborilmadi: ${u.id}`);
            }
          }
          return bot.sendMessage(
            chatId,
            `✅ Xabar ${sent} ta foydalanuvchiga yuborildi.`,
            {
              reply_markup: adminKeyboard,
            },
          );
        } else if (text) {
          let sent = 0;
          for (const u of users) {
            try {
              await bot.sendMessage(u.id, text);
              sent++;
            } catch (err) {
              console.error(`❌ Xabar yuborilmadi: ${u.id}`);
            }
          }
          return bot.sendMessage(
            chatId,
            `✅ Xabar ${sent} ta foydalanuvchiga yuborildi.`,
            {
              reply_markup: adminKeyboard,
            },
          );
        }
      }
    }

    // ===========================
    // ODDIY FOYDALANUVCHI - KINO QIDIRISH
    // ===========================
    if (!text || !/^\d+$/.test(text)) {
      return bot.sendMessage(
        chatId,
        "*❗ Iltimos, faqat kino kodini (raqam) kiriting.*",
        {
          parse_mode: "Markdown",
        },
      );
    }

    const found = await videosCollection.findOne({ code: text });
    if (!found) {
      return bot.sendMessage(
        chatId,
        `*❗ Hozircha ${text} kodiga bog'liq kino yo'q.*`,
        {
          parse_mode: "Markdown",
        },
      );
    }

    // Views parallel yangilanadi
    videosCollection
      .updateOne({ code: text }, { $inc: { views: 1 } })
      .catch((err) => console.error(err));

    return bot.sendVideo(chatId, found.file_id, {
      caption: `🎬 ${found.title}\n📥 *Yuklangan:* ${found.views + 1}\n\n🎬 @Kinoborubot | Bizning botmiz`,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🔐 Barcha kino kodlari",
              url: `https://t.me/panjara_ortida_prison_berk`,
            },
          ],
          [
            {
              text: "↪️ Ulashish",
              switch_inline_query: `https://t.me/kinoborubot?start=${found.code}`,
            },
          ],
        ],
      },
    });
  });

  // ===========================
  // CALLBACK QUERY USHLAB OLISH
  // ===========================
  bot.on("callback_query", async (query) => {
    const userId = query.from.id;
    const chatId = query.message?.chat?.id || query.from.id;

    if (query.data === "check_sub") {
      const subscribed = await isSubscribed(userId);
      await bot.answerCallbackQuery(query.id);

      if (subscribed) {
        await saveUser(query.from);
        await bot
          .deleteMessage(chatId, query.message.message_id)
          .catch(() => {});
        return bot.sendMessage(
          chatId,
          "*✅ Obuna tasdiqlandi! Endi ko'rmoqchi bo'lgan film kodini yuboring.*",
          {
            parse_mode: "Markdown",
          },
        );
      } else {
        await bot
          .deleteMessage(chatId, query.message.message_id)
          .catch(() => {});
        return bot.sendMessage(
          chatId,
          "*⚠️ Botdan foydalanish uchun homiy kanalga obuna bo'lishingiz kerak.*",
          {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🔗 Obuna bo'lish",
                    url: `https://t.me/${channelUsername.replace("@", "")}`,
                  },
                ],
                [{ text: "✅ Tekshirish", callback_data: "check_sub" }],
              ],
            },
          },
        );
      }
    }
  });

  // ===========================
  // XATOLARNI USHLAB OLISH
  // ===========================
  bot.on("polling_error", (error) => {
    console.error("❌ Polling xatosi:", error);
  });
}


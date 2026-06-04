const { Telegraf, Markup } = require("telegraf");
const fs = require("fs");
const path = require("path");
const express = require("express"); // Express ulash

// --- SOZLAMALAR ---
const MBTK = "8318040012:AAFmUQPFJLZwJQpC0I1axuLWRi95M2INLbQ"; // Bot tokeningiz
const ADMIN_ID = 907402803; // Telegram IDingiz
const MAJBURIY_KANAL_LINK = "https://t.me/KukiGiftBot?start=907402803"; // Majburiy obuna bot/kanal linki
const PORT = process.env.PORT || 3000; // Render beradigan yoki standart 3000-port
// ------------------

const bot = new Telegraf(MBTK);
const app = express(); // Express ilovasini yaratish

// --- EXPRESS SERVER (UptimeRobot uchun) ---
app.get("/", (req, res) => {
  res.send("🤖 Bot muvaffaqiyatli ishlab turibdi!");
});

app.listen(PORT, () => {
  console.log(`🌐 Express server ${PORT}-portda ishga tushdi.`);
});

// --- FAYLLAR BILAN ISHLASH ---
const KINO_FILE = path.join(__dirname, "kinolar.json");
const USER_FILE = path.join(__dirname, "users.json");

if (!fs.existsSync(KINO_FILE)) fs.writeFileSync(KINO_FILE, JSON.stringify({}));
if (!fs.existsSync(USER_FILE)) fs.writeFileSync(USER_FILE, JSON.stringify({}));

const getKinolar = () => {
  try {
    const content = fs.readFileSync(KINO_FILE, "utf8");
    return content ? JSON.parse(content) : {};
  } catch (error) {
    fs.writeFileSync(KINO_FILE, JSON.stringify({}));
    return {};
  }
};

const saveKinolar = (data) =>
  fs.writeFileSync(KINO_FILE, JSON.stringify(data, null, 2));

const getUsers = () => {
  try {
    const content = fs.readFileSync(USER_FILE, "utf8");
    return content ? JSON.parse(content) : {};
  } catch (error) {
    fs.writeFileSync(USER_FILE, JSON.stringify({}));
    return {};
  }
};

const saveUsers = (data) =>
  fs.writeFileSync(USER_FILE, JSON.stringify(data, null, 2));

const adminStates = {};

// --- START BUYRUG'I ---
bot.start(async (ctx) => {
  try {
    const userId = ctx.from.id.toString();
    const users = getUsers();

    if (!users[userId]) {
      users[userId] = {
        clickCount: 0,
        isVerified: false,
        username: ctx.from.username || "",
      };
      saveUsers(users);
    }

    const user = users[userId];
    const welcomeMessage = `👋 Assalomu alaykum, <b>${ctx.from.first_name}</b>!\n\n🎬 Kino kodlar botimizga xush kelibsiz. Bu yerda siz istagan kinongizni kodini yuborib topishingiz mumkin.`;

    if (user.isVerified) {
      await ctx.replyWithHTML(
        `${welcomeMessage}\n\n🔍 Kino kodini yuboring:`,
        Markup.removeKeyboard(),
      );
    } else {
      const keyboard = Markup.inlineKeyboard([
        [Markup.button.url("📢 Kanalga obuna bo'lish", MAJBURIY_KANAL_LINK)],
        [Markup.button.callback("✅ Obunani tekshirish", "check_sub")],
      ]);

      await ctx.replyWithHTML(
        `${welcomeMessage}\n\n⚠️ Botdan foydalanish uchun pastdagi botga kirib uni faollashtring!`,
        keyboard,
      );
    }
  } catch (error) {
    console.error("Start xatoligi:", error.message);
  }
});

// --- OBUNANI TASDIQLASH (CALLBACK) ---
bot.action("check_sub", async (ctx) => {
  try {
    const userId = ctx.from.id.toString();
    const users = getUsers();

    if (!users[userId]) {
      return ctx.answerCbQuery("Xatolik! Botni qayta start qiling.").catch(() => {});
    }

    users[userId].clickCount += 1;

    if (users[userId].clickCount < 2) {
      saveUsers(users);
      return ctx.answerCbQuery(
        `⚠️ Iltimos, botni to'liq faollashtiring. Bot bergan kanallarga a'zo bo'ling.`,
      ).catch(() => {});
    } else {
      users[userId].isVerified = true;
      saveUsers(users);
      
      await ctx.answerCbQuery("🎉 Muvaffaqiyatli tasdiqlandi!").catch(() => {});
      await ctx.deleteMessage().catch(() => {});
      
      return ctx.replyWithHTML(
        "✅ Rahmat! Obuna tasdiqlandi.\n\n🔍 Endi kino kodini yuborishingiz mumkin:",
      );
    }
  } catch (error) {
    console.error("Callback xatoligi:", error.message);
  }
});

// --- ADMIN PANEL (KINO QO'SHISH) ---
bot.command("add", async (ctx) => {
  try {
    if (ctx.from.id !== ADMIN_ID) return;

    adminStates[ctx.from.id] = { step: "WAITING_FOR_VIDEO" };
    await ctx.reply("🎬 Menga kinoni (video, fayl yoki kino xabarini) yuboring:");
  } catch (error) {
    console.error("Admin add xatoligi:", error.message);
  }
});

// --- XABARLARNI QABUL QILISH ---
bot.on("message", async (ctx) => {
  try {
    const userId = ctx.from.id;
    const userStrId = userId.toString();
    const text = ctx.message.text;

    // Admin kino qo'shish jarayoni
    if (userId === ADMIN_ID && adminStates[userId]) {
      const state = adminStates[userId];

      if (state.step === "WAITING_FOR_VIDEO") {
        state.messageId = ctx.message.message_id;
        state.fromChatId = ctx.chat.id;
        state.step = "WAITING_FOR_CODE";
        await ctx.reply("🔢 Endi bu kino uchun kod kiriting (masalan: 123):");
        return;
      }

      if (state.step === "WAITING_FOR_CODE") {
        if (!text) {
          await ctx.reply("Iltimos, kodni faqat matn ko'rinishida yuboring!");
          return;
        }

        const kinolar = getKinolar();
        kinolar[text] = {
          messageId: state.messageId,
          chatId: state.fromChatId,
        };
        saveKinolar(kinolar);

        delete adminStates[userId];
        await ctx.reply(
          `✅ Kino muvaffaqiyatli saqlandi!\n🔑 Kino kodi: ${text}`,
        );
        return;
      }
    }

    // Oddiy foydalanuvchilar uchun kino qidirish
    const users = getUsers();
    if (!users[userStrId] || !users[userStrId].isVerified) {
      await ctx.reply(
        "⚠️ Botdan foydalanish uchun avval /start bosing va obunani tasdiqlang!",
      );
      return;
    }

    if (!text) {
      await ctx.reply(
        "🔍 Iltimos, kino kodini raqam yoki matn shaklida yuboring.",
      );
      return;
    }

    const kinolar = getKinolar();
    const kino = kinolar[text];

    if (kino) {
      try {
        await ctx.telegram.copyMessage(ctx.chat.id, kino.chatId, kino.messageId);
      } catch (error) {
        await ctx.reply(
          "❌ Kinoni yuborishda xatolik yuz berdi. Admin uni o'chirib tashlagan bo'lishi mumkin.",
        );
      }
    } else {
      await ctx.reply(
        "😔 Afsuski, bunday kodli kino topilmadi. Kodni to'g'ri kiritganingizni tekshiring.",
      );
    }
  } catch (error) {
    console.error("Xabar qayta ishlashda xatolik (Foydalanuvchi bloklagan bo'lishi mumkin):", error.message);
  }
});

bot.launch().then(() => {
  console.log("🚀 Kino bot muvaffaqiyatli ishga tushdi!");
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

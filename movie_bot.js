const { Telegraf, Markup } = require("telegraf");
const fs = require("fs");
const path = require("path");

// --- SOZLAMALAR ---
const MBTK = "8318040012:AAFmUQPFJLZwJQpC0I1axuLWRi95M2INLbQ"; // Botfather'dan olgan tokeningiz
const ADMIN_ID = 907402803; // O'zingizning Telegram ID'ngiz (raqam ko'rinishida)
const MAJBURIY_KANAL_LINK = "https://t.me/KukiGiftBot?start=907402803"; // Majburiy obuna kanali linki
// ------------------

const bot = new Telegraf(MBTK);

const KINO_FILE = path.join(__dirname, "kinolar.json");
const USER_FILE = path.join(__dirname, "users.json");

// Fayllar mavjud bo'lmasa, yaratib olamiz
if (!fs.existsSync(KINO_FILE)) fs.writeFileSync(KINO_FILE, JSON.stringify({}));
if (!fs.existsSync(USER_FILE)) fs.writeFileSync(USER_FILE, JSON.stringify({}));

// Ma'lumotlarni fayldan o'qish funksiyalari
const getKinolar = () => JSON.parse(fs.readFileSync(KINO_FILE, "utf8"));
const saveKinolar = (data) =>
  fs.writeFileSync(KINO_FILE, JSON.stringify(data, null, 2));

const getUsers = () => JSON.parse(fs.readFileSync(USER_FILE, "utf8"));
const saveUsers = (data) =>
  fs.writeFileSync(USER_FILE, JSON.stringify(data, null, 2));

// Admin holatlarini saqlash uchun (Kino qo'shish jarayoni)
const adminStates = {};

// --- START BUYRUG'I ---
bot.start((ctx) => {
  const userId = ctx.from.id.toString();
  const users = getUsers();

  // Yangi foydalanuvchini ro'yxatga olish
  if (!users[userId]) {
    users[userId] = {
      clickCount: 0,
      isVerified: false,
      username: ctx.from.username || "",
    };
    saveUsers(users);
  }

  const user = users[userId];

  // Chiroyli salomlashish
  const welcomeMessage = `👋 Assalomu alaykum, <b>${ctx.from.first_name}</b>!\n\n🎬 Kino kodlar botimizga xush kelibsiz. Bu yerda siz istagan kinongizni kodini yuborib topishingiz mumkin.`;

  if (user.isVerified) {
    ctx.replyWithHTML(
      `${welcomeMessage}\n\n🔍 Kino kodini yuboring:`,
      Markup.removeKeyboard(),
    );
  } else {
    // Majburiy obuna tugmasi
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.url("📢 Kanalga obuna bo'lish", MAJBURIY_KANAL_LINK)],
      [Markup.button.callback("✅ Obunani tekshirish", "check_sub")],
    ]);

    ctx.replyWithHTML(
      `${welcomeMessage}\n\n⚠️ Botdan foydalanish uchun pastdagi botga kirib uni faollashtring!`,
      keyboard,
    );
  }
});

// --- OBUNANI TASDIQLASH (CALLBACK) ---
bot.action("check_sub", (ctx) => {
  const userId = ctx.from.id.toString();
  const users = getUsers();

  if (!users[userId])
    return ctx.answerCbQuery("Xatolik! Botni qayta start qiling.");

  users[userId].clickCount += 1;

  if (users[userId].clickCount < 2) {
    saveUsers(users);
    return ctx.answerCbQuery(
      `⚠️ Iltimos, botni to'liq faollashtiring. Bot bergan kanallarga a'zo bo'ling.`,
    );
  } else {
    users[userId].isVerified = true;
    saveUsers(users);
    ctx.answerCbQuery("🎉 Muvaffaqiyatli tasdiqlandi!");
    ctx.deleteMessage().catch(() => {});
    return ctx.replyWithHTML(
      "✅ Rahmat! Obuna tasdiqlandi.\n\n🔍 Endi kino kodini yuborishingiz mumkin:",
    );
  }
});

// --- ADMIN PANEL (KINO QO'SHISH) ---
bot.command("add", (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  adminStates[ctx.from.id] = { step: "WAITING_FOR_VIDEO" };
  ctx.reply("🎬 Menga kinoni (video, fayl yoki kino xabarini) yuboring:");
});

// --- XABARLARNI QABUL QILISH ---
bot.on("message", async (ctx) => {
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
      return ctx.reply("🔢 Endi bu kino uchun kod kiriting (masalan: 123):");
    }

    if (state.step === "WAITING_FOR_CODE") {
      if (!text)
        return ctx.reply("Iltimos, kodni faqat matn ko'rinishida yuboring!");

      const kinolar = getKinolar();
      kinolar[text] = {
        messageId: state.messageId,
        chatId: state.fromChatId,
      };
      saveKinolar(kinolar);

      delete adminStates[userId];
      return ctx.reply(
        `✅ Kino muvaffaqiyatli saqlandi!\n🔑 Kino kodi: ${text}`,
      );
    }
  }

  // Oddiy foydalanuvchilar uchun kino qidirish
  const users = getUsers();
  if (!users[userStrId] || !users[userStrId].isVerified) {
    return ctx.reply(
      "⚠️ Botdan foydalanish uchun avval /start bosing va obunani tasdiqlang!",
    );
  }

  if (!text)
    return ctx.reply(
      "🔍 Iltimos, kino kodini raqam yoki matn shaklida yuboring.",
    );

  const kinolar = getKinolar();
  const kino = kinolar[text];

  if (kino) {
    try {
      // Kinoni admin qanday yuborgan bo'lsa, xuddi shunday copy qilib foydalanuvchiga uzatadi
      await ctx.telegram.copyMessage(ctx.chat.id, kino.chatId, kino.messageId);
    } catch (error) {
      ctx.reply(
        "❌ Kinoni yuborishda xatolik yuz berdi. Admin uni o'chirib tashlagan bo'lishi mumkin.",
      );
    }
  } else {
    ctx.reply(
      "😔 Afsuski, bunday kodli kino topilmadi. Kodni to'g'ri kiritganingizni tekshiring.",
    );
  }
});

// Botni ishga tushirish
bot.launch().then(() => {
  console.log("🚀 Kino bot muvaffaqiyatli ishga tushdi!");
});

// Processlarni xavfsiz yopish
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

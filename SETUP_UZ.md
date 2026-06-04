🎬 MOVIE BOT - TEZKOR O'RNATISH QOLLANMASI
═══════════════════════════════════════════

📋 TALABLAR:
──────────
✅ Node.js 12+ o'rnatilgan
✅ Telegram akkaunt
✅ Telegram Bot Token (@BotFather dan)
✅ Telegram ID raqami

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 STEP 1: BOT TOKENINI OLISH
──────────────────────────────
1. Telegramda @BotFather ga xabar yuboring
2. /newbot yozing
3. Bot uchun nom tanlang (misol: "Mening Kino Botim")
4. Username tanlang (misol: "my_kino_bot")
5. Token qabul qiling va saqlang

Natija: 123456:ABCDEFGhijkLMNOPQRSTuvwxYZ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 STEP 2: O'ZINGIZNING TELEGRAM ID NI TOPISH
──────────────────────────────────────────────
1. Telegramda @userinfobot ga xabar yuboring
2. "Get My Data" tugmasini bosing
3. ID raqamini qabul qiling

Natija: 1234567890

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 STEP 3: BOT FAYLLARINI O'RNATISH
────────────────────────────────────
1. Terminal/CMD oching
2. Loyiha jildasiga kirish:
   
   cd movie-bot

3. Paketlarni o'rnatish:

   npm install

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚙️  STEP 4: KONFIGURATSIYA
──────────────────────────
movie_bot.js faylini oching va o'zingizni ma'lumotlarni qo'ying:

QATORI 12:  const TOKEN = 'YOUR_BOT_TOKEN';
            👆 Asosiga BotFatherdan olgan tokeningizni qo'ying
            
            const TOKEN = '123456:ABCDEFGhijkLMNOPQRSTuvwxYZ';

QATORI 13:  const ADMIN_ID = YOUR_ADMIN_ID;
            👆 Asosiga @userinfobot dan olgan ID raqamingizni qo'ying
            
            const ADMIN_ID = 1234567890;

QATORI 14:  const REQUIRED_CHANNEL = '@your_channel';
            👆 Kanal nomini kiriting (ixtiyoriy)
            
            const REQUIRED_CHANNEL = '@my_channel';

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 STEP 5: BOTNI ISHGA TUSHIRISH
────────────────────────────────
Terminal/CMD da yozing:

npm start

Natija:
  ✅ Bot ishga tushdi...
  🔐 Admin ID: 1234567890
  📢 Majburiy Kanal: @my_channel

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 BOTNI TELEGRAMDA SINASH
───────────────────────────
1. Telegramda @your_bot_username izlab toping
2. /start buyrugini yuboring
3. Kanalga obuna bo'lish uchun tugmani bosing
4. Tasdiqish tugmasini bosing
5. Kino kodini yuboring

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎥 KINOLAR QO'SHISH (ADMIN UCHUN)
──────────────────────────────────
Telegramda /admin yozing, keyin:

1. "➕ Kino Qo'shish" tugmasini bosing
2. Quyidagi formatda yuboring:

   KN001|Titanic|Romantika|8.5|1997|Sho'kli lirika|https://example.com

   KOD | Nomi | Turi | Reyting | Yili | Tavsif | Link

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 FAYL STRUKTURASI
───────────────────
movie-bot/
├── movie_bot.js          ← Asosiy bot fayli
├── package.json          ← Paket konfiguratsiyasi
├── README.md             ← To'liq qollanma
├── .gitignore            
├── .env.example
└── data/
    ├── movies.json       ← Kinolar ma'lumotlari
    └── users.json        ← Foydalanuvchilar ma'lumotlari

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❓ KO'P SORALADIGAN SAVOLLARI
──────────────────────────────

Q: Bot ishlamayapti?
A: Token va Admin ID tekshiring!
   - TOKEN = 'YOUR_BOT_TOKEN' (yangi token o'rnatib ko'ring)
   - ADMIN_ID = YOUR_ADMIN_ID (to'g'ri raqam kiriting)

Q: Kanal tekshirmasligi sababini?
A: 1. Kanal nomi @bilan boshlang
   2. Botni kanalga admin qilib qo'ying
   3. Kanal PUBLIC bo'lishi kerak

Q: Ma'lumotlar qaerda saqlanadi?
A: ./data/ jildasida JSON fayllar
   - movies.json = Kinolar
   - users.json = Foydalanuvchilar

Q: Kino kodini qanday qo'shaman?
A: /admin → "➕ Kino Qo'shish" → Format bo'yicha yuboring

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ TAYYOR!

Botingiz endi ishlatishga tayyor. Muvaffaqiyatlar! 🎬🚀

# 🎬 Telegram Movie Bot

Kino kodiga asoslangan Telegram boti. Foydalanuvchilar kino kodini kiritib, kino ma'lumotlarini olishlari mumkin.

## ✨ Xususiyatlari

✅ **Majburiy kanal obunasi** - Foydalanuvchilar botdan foydalanish uchun kanalga obuna bo'lishlari kerak
✅ **Kino kodiga asoslangan qidiruv** - Foydalanuvchilar kod yozib kinoni izlashlari mumkin
✅ **Admin panelit** - Admin kinolar qo'shishi, o'chirishi mumkin
✅ **Lokal ma'lumotlar** - Barcha ma'lumotlar kompyuterda saqlanadi
✅ **Oson foydalanish** - Sodda tugmali interface

## 📋 Talablar

- Node.js 12.0 va undan yuqori
- Telegram Bot API token
- Telegram kanalining nomi (@channel_name)

## 🚀 O'rnatish

### 1-qadam: Telegram Bot yaratish

1. Telegramda [@BotFather](https://t.me/botfather) ga xabar yuboring
2. `/newbot` buyrugini kiritib yangi bot yarating
3. Bot tokenini qabul qiling

### 2-qadam: Telegram kanalini yaratish (ixtiyoriy)

1. Telegramda yangi kanal yarating
2. Kanal nomini (masalan: `@my_movie_channel`) olang

### 3-qadam: O'rnatish

```bash
# Loyihani klonlash
git clone https://github.com/yourusername/movie-bot.git
cd movie-bot

# Paketlarni o'rnatish
npm install
```

### 4-qadam: Konfiguratsiya

`movie_bot.js` faylini oching va o'zingizning ma'lumotlarini qo'ying:

```javascript
const TOKEN = 'YOUR_BOT_TOKEN'; // BotFatherdan olgan tokeningiz
const ADMIN_ID = YOUR_ADMIN_ID; // O'zingizning Telegram ID
const REQUIRED_CHANNEL = '@your_channel'; // Kanal nomi
```

**O'zingizning Telegram ID ni qanday topish kerak:**

1. [@userinfobot](https://t.me/userinfobot) ga xabar yuboring
2. Sizning ID raqami ko'rsatiladi

## 📖 Ishlatish

### Botni ishga tushirish

```bash
npm start
```

### Foydalanuvchi buyrugalari

- `/start` - Botni boshlash
- `/movies` - Barcha kinolarni ko'rish
- `/help` - Yordam
- Kino kodini yuboring (masalan: `KN001`)

### Admin buyrugalari

- `/admin` - Admin panelini ochish
- **Kino qo'shish** - Kino ma'lumotlarini quyidagi formatda yuboring:

```
KOD|Nomi|Turi|Reyting|Yili|Tavsif|Link(ixtiyoriy)
```

**Misol:**
```
KN001|Titanic|Romantika|8.5|1997|Sho'kli lirika tarixiy drama|https://example.com
```

## 📂 Fayl Strukturasi

```
movie-bot/
├── movie_bot.js           # Asosiy bot fayli
├── package.json           # NPM paket konfiguratsiyasi
├── data/
│   ├── movies.json        # Kinolar ma'lumotlari
│   └── users.json         # Foydalanuvchilar ma'lumotlari
└── README.md              # Ushbu fayl
```

## 🔐 Xavfsizlik

- Tokeningizni hech qachon umumiy qilmang
- `.env` faylda tokenni saqlab qo'ying
- Ma'lumotlar fayllarini ehtiyotkorlik bilan o'zgartirib qo'ying

## 🐛 Muammolarni hal qilish

### Bot ishlamayotgan bo'lsa:

1. Tokeningizni tekshiring
2. Internet ulanishini tekshiring
3. Node.js o'rnatilganligini tekshiring:
   ```bash
   node --version
   ```

### Kanal tekshiruvini ishlamayotgan bo'lsa:

1. Kanal nomini @bilan yozing
2. Botni kanalga adminlik qilib qo'ying

## 📞 Qo'llab-quvvatlash

Muammolar uchun GitHub issues ochib qo'ying yoki bizga murojaat qiling.

## 📜 Litsenziya

MIT License - bu loyihadan erkin foydalanishingiz mumkin.

---

**Muvaffaqiyatlar! 🚀**

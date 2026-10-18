# TURİZMDE TÜRKÇE (Turizmda turk tili)

> Turizm va mehmondo‘stlik sohasi uchun 15 kunlik amaliy interaktiv ta’lim platformasi, to‘liq Node.js backend va Supabase boshqaruv tizimi (Admin CMS).

---

## 🌟 Imkoniyatlar

- **15 kunlik intensiv challenge (60 ta o‘quv bosqichi):**
  - **Kelimeler:** 440+ turkcha kasbiy so‘zlar, tarjima va audiosi;
  - **Hazır İfadeler:** 450+ professional muloqot iboralari va audiosi;
  - **Diyaloglar:** 60 ta vaziyatli jonli dialoglar, replikalar va audiosi;
  - **Gramer & Video hordiq:** Amaliy grammatika, Word qo‘llanmalar va YouTube video darslari.
- **Supabase integratsiyasi:**
  - PostgreSQL ma’lumotlar bazasi;
  - Audio va kitob fayllari uchun ommaviy Storage;
  - Avtomatlashtirilgan migratsiya va yuklash skripti (`npm run seed`).
- **Yangi Admin CMS Studio:**
  - 🎧 **Audio yuklash:** Kompyuterdan `.mp3` faylni tanlab to‘g‘ridan-to‘g‘ri Supabase Storage-ga yuklash va darslarga biriktirish;
  - 💬 **Dialoglar boshqaruvi:** Dialoglar, matnlar va replikalarni real vaqtda qo‘shish/tahrirlash;
  - 📝 **So‘z va iboralar:** Yangi lug‘at kiritish va o‘chirish;
  - 📖 **Dars parametrlari:** Sarlavhalar, videolar va grammatikani yangilash;
  - 👥 **O‘quvchilar nazorati:** O‘quvchilar ro‘yxati, progress foizlari va hisobotlar.
- **Sertifikatlash tizimi:** 15 kunni to‘liq tugatgan o‘quvchilarga avtomatik Canvas orqali shakllanadigan rasmiy PDF/PNG sertifikat.

---

## 🚀 Tezkor ishga tushirish

### 1. Bog‘liqliklarni o‘rnatish:
```bash
npm install
```

### 2. Muhit o‘zgaruvchilarini sozlash:
`.env.example` faylidan `.env` nusxasini oling va Supabase kalitlaringizni kiriting:
```bash
cp .env.example .env
```

### 3. Ma’lumotlar bazasini tayyorlash:
Supabase boshqaruv panelidagi **SQL Editor** bo‘limida `supabase/schema.sql` faylini ishga tushiring.

### 4. Darslar va audio fayllarni Supabase-ga yuklash (1 ta buyruq):
```bash
npm run seed
```

### 5. Serverni ishga tushirish:
```bash
npm start
```
Sayt manzili: **http://localhost:3000**

---

## 📖 To‘liq yo‘riqnoma

Batafsil sozlash, Supabase-da bepul loyiha ochish va GitHub-ga yuklash bo‘yicha to‘liq qo‘llanma:
👉 [SUPABASE_QOLLANMA.md](./SUPABASE_QOLLANMA.md) faylida.

# TURİZMDE TÜRKÇE — Supabase va Serverga ulash bo‘yicha to‘liq qo‘llanma

Ushbu qo‘llanma yordamida loyihani bir necha daqiqada **Supabase (bepul ma’lumotlar bazasi va audio storage)** bilan to‘liq ulab, internetda ishga tushirishingiz mumkin.

---

## 1-QADAM: Supabase-da bepul loyiha ochish (2 daqiqa)

1. [https://supabase.com](https://supabase.com) saytiga kiring va ro‘yxatdan o‘ting (GitHub akkauntingiz orqali kirish juda qulay).
2. **"New project"** tugmasini bosing:
   - **Name:** `turizmde-turkce` (yoki ixtiyoriy nom)
   - **Database Password:** O‘zingiz eslab qoladigan kuchli parol qo‘ying.
   - **Region:** Frankfurt (Germaniya) yoki o‘zingizga yaqin regionni tanlang.
   - **Pricing Plan:** **Free (0$)** ni tanlang va **"Create new project"** tugmasini bosing.

---

## 2-QADAM: Ma’lumotlar bazasi jadvallari va Storage-ni yaratish

1. Supabase boshqaruv panelida chap menyudan **"SQL Editor"** bo‘limiga kiring.
2. **"New query"** tugmasini bosing.
3. Loyihangizdagi `supabase/schema.sql` faylining ichidagi barcha kodlarni nusxalab oling va SQL Editor maydoniga tashlang.
4. Pastki o‘ng burchakdagi yashil **"Run"** tugmasini bosing.
5. `Success` xabari chiqadi. Natijada:
   - `users`, `lessons`, `words`, `phrases`, `dialogs`, `grammar`, `progress` jadvallari;
   - `audio`, `materials`, `books` nomli ommaviy Storage (fayllar saqlash) bucketlari avtomatik yaratiladi!

---

## 3-QADAM: API kalitlarni `.env` fayliga yozish

1. Supabase chap menyusining pastidagi tishli g‘ildirak belgisi — **"Project Settings"** bo‘limiga kiring.
2. Chap tomondan **"Data API"** (yoki **"API"**) bo‘limini tanlang.
3. Quyidagi ma’lumotlarni ko‘chirib oling:
   - **Project URL** (masalan: `https://xyzabcdefghijk.supabase.co`)
   - **anon public** kaliti (`eyJhbGciOi...`)
   - **service_role secret** kaliti (`eyJhbGciOi...`)
4. Loyihangizdagi `.env` faylini oching va qiymatlarni kiriting:
   ```env
   PORT=3000
   SUPABASE_URL=https://sizning-loyiha-id.supabase.co
   SUPABASE_ANON_KEY=sizning-anon-kalitingiz
   SUPABASE_SERVICE_ROLE_KEY=sizning-service-role-kalitingiz
   ```

---

## 4-QADAM: Barcha darslar va audio fayllarni 1 ta buyruq bilan Supabase-ga yuklash

Terminalda quyidagi buyruqni bering:
```bash
npm run seed
```
Ushbu skript avtomatik ravishda:
- `assets/audio/` ichidagi barcha 30 ta audio faylni Supabase Storage-ga yuklaydi;
- Barcha 15 kunlik darslar, 440+ so‘zlar, 450+ iboralar, dialoglar va grammatikani Supabase ma’lumotlar bazasiga kiritadi;
- 40 ta talaba va 3 ta admin akkauntini bazaga ro‘yxatga oladi;
- Har bir dars va dialogga yuklangan audioning onlayn havolasini avtomatik biriktiradi!

---

## 5-QADAM: Saytni va Backendni ishga tushirish

Terminalda quyidagi buyruqni bering:
```bash
npm start
```
Brauzerda oching:
👉 **http://localhost:3000**

---

## 6-QADAM: Yangi Admin Studio (CMS) dan foydalanish

Saytga administrator sifatida kiring:
- **Login:** `9403815276`
- **Parol:** `A9#k!8m2Qx`

Yangi Admin boshqaruv panelida quyidagi 5 ta bo‘lim mavjud:
1. **📊 Boshqaruv & O‘quvchilar:** Barcha o‘quvchilar ro‘yxati, ularning o‘zlashtirish foizi (X/60 bosqich), yangi talaba qo‘shish va o‘chirish.
2. **🎧 Audio yuklash (Storage):** Kompyuterdan `.mp3` faylni tanlab, to‘g‘ridan-to‘g‘ri darsning so‘zlariga, iboralariga yoki istalgan dialogiga biriktirish. Yuklangach, shu yerning o‘zida audioni tinglab ko‘rish mumkin.
3. **💬 Dialoglar tahriri:** Dialoglar mavzusi va har bir qahramonning gaplarini (replikalarini) tahrirlash, yangi dialog qo‘shish yoki o‘chirish.
4. **📝 So‘z va Iboralar:** Kunlik so‘z va iboralarni qo‘shish, o‘chirish va tahrirlash.
5. **📖 Dars va Grammatika:** Dars sarlavhasi, YouTube video havolasi va grammatik qoidalarni yangilash.

---

## 7-QADAM: GitHub-ga yuklash

Loyihani o‘z GitHub profilingizga yuklash uchun quyidagi buyruqlarni ketma-ket bajaring:

```bash
# 1. Git-ni ishga tushirish
git init

# 2. Barcha fayllarni tayyorlash
git add .

# 3. Birinchi kommitni yozish
git commit -m "feat: full backend, Supabase integration and Admin CMS studio"

# 4. GitHub-dagi repozitoriyangizni ulash (username va repo-nomini o'zgartiring):
git remote add origin https://github.com/SIZNING_GITHUB_USERNAME/REPO_NOMI.git

# 5. Asosiy tarmoqni 'main' ga o'tkazish
git branch -M main

# 6. GitHub-ga yuklash
git push -u origin main
```

*(Eslatma: `.env` va `node_modules/` papkalari `.gitignore` ga kiritilgan, shuning uchun maxfiy kalitlaringiz GitHub-ga tushib ketmaydi va xavfsiz qoladi).*

---

## 8-QADAM: Saytni bepul internetga (Vercel / Render) chiqarish

- **Vercel orqali (Tavsiya etiladi):** 
  [vercel.com](https://vercel.com) ga kiring, GitHub akkauntingiz bilan kiring, `turizmde-turkce` repozitoriyasini tanlang va **"Deploy"** tugmasini bosing. Environment Variables bo‘limiga `.env` dagi `SUPABASE_URL` va `SUPABASE_ANON_KEY` ni kiritasiz.
- Saytingiz bepul `https://sizning-nomingiz.vercel.app` manzilida doimiy 24/7 ishlab turadi!

TURİZMDE TÜRKÇE — OFFLINE PROTOTIP
1. Papkani VS Code orqali oching.
2. index.html faylini brauzerda oching (yoki VS Code Live Server ishlating).
3. Login va parollar foydalanuvchi yuborgan texnik topshiriq oxiridagi jadvaldan olinadi.
4. Dastlabki 5 kun uchun audio fayllar mavjud. 6–15-kunlarda audio fayllar bo‘lmasa, matnni o‘rganib bosqichni qo‘lda yakunlash mumkin.
5. YouTube va mailto uchun internet/email dasturi kerak.
6. LocalStorage ma'lumotlari faqat ayni brauzerda saqlanadi; bu xavfsiz onlayn autentifikatsiya emas. Internetga chiqarishdan avval login/admin qismini backendga ko'chiring va accounts.js ni ommaviy saytdan olib tashlang.
7. Sertifikat hozircha HTML shaklda; ZIP ichida alohida sertifikat shabloni yo'q.
8. Kunlik matnlar asl DOCX dan ajratib olingan; asl DOCX lar assets/materials ichida saqlangan.

VERSIYA 8 — PREMIUM INTERAKTIV DIZAYN
- 15 kunlik darslar nomlari tegishli kunlik qo'llanmalardagi mavzularga moslashtirildi.
- So'zlar va iboralar tarjimasini kartochkada bosib ochish, qidiruv va tarjimalarni ko'rsatish/yashirish qo'shildi.
- Dialoglar alohida ochiladigan kartalarda, grammatika esa uchta rangli kartada beriladi.
- Elektron kutubxona kitob javoni va kitob muqovalari uslubida qayta ishlangan.
- Sertifikat ism-familiyasi tahrirlanadi; PNG yuklab olish va chop etish oynasidan PDF sifatida saqlash mavjud.
- Admin panelida foydalanuvchi qidirish, profilni tahrirlash, login/parolni o'zgartirish, 15 kunlik natijalarni ko'rish va tahrirlash, sertifikatni chiqarish funksiyalari mavjud.
- 6–15-kunlarda audio mavjud bo'lmagan bosqichlarni matnni o'rganib yakunlash mumkin.

MUHIM CHEKLOV:
Bu loyiha statik HTML/JavaScript demo bo'lib, foydalanuvchi akkauntlari va natijalari shu brauzerda saqlanadi. Admin paneli faqat shu qurilmada saqlangan akkaunt va natijalarni boshqaradi. Turli qurilmalardan barcha foydalanuvchilarni markaziy boshqarish uchun server/API va ma'lumotlar bazasi kerak.


VERSIYA 9 — ADMIN VA DARS YAKUNIY TUZATISHLARI
- Admin uchun to‘liq navigatsiya qo‘shildi: admin panel, bosh sahifa, darslar, natijalar, elektron kutubxona, admin profili, yo‘riqnoma va aloqa.
- Admin profili ichida shaxsiy ma’lumotlar va admin login/parolini o‘zgartirish mumkin.
- Admin natijalar bo‘limida foydalanuvchilarning lokal natijalari, progressi va boshqaruv sahifasiga o‘tish mavjud.
- Har bir dialog audiosi mavjud bo‘lgan kunlarda dialog matnining tepasiga joylashtirildi. 6–15-kunlar uchun audio fayllar arxivda mavjud emas; ularda audio o‘rnida bu haqdagi izoh chiqadi.
- Grammatika bo‘limidagi uchta kartochkaning 01/02/03 raqam belgilari olib tashlandi.
- Saytdagi yozuvlar qalinlashtirildi.
- 1–15-kun YouTube havolalari foydalanuvchi bergan yangi havolalarga almashtirildi.

ESLATMA: Bu hali ham statik lokal demo. Admin paneli faqat shu qurilma/brauzerda saqlangan akkauntlar va natijalarni ko‘radi; haqiqiy markaziy boshqaruv uchun backend va ma’lumotlar bazasi zarur.


V10 TUZATISHI (2026-10-15)
- 3–15-kunlardagi so‘z va ibora qatorlari bir xil uch ustunli formatga keltirildi: № | Türkçe | O‘zbekcha.
- Jami 440 ta so‘z va 450 ta ibora tarjimasi tekshirildi; tarjima ustuni bo‘sh qolmasligi uchun ma’lumotlar normallashtirildi.
- Kesh yangilanishi uchun barcha skript havolalari v=10 ga ko‘tarildi.

V12 PATCH: repaired enhanced navigation binding for the 15-day challenge and moved the certificate recipient name down by one line.

V13 FIX: Exposed adminMode globally because the challenge and lesson renderer in enhancements.js calls adminMode(). This previously caused a ReferenceError when opening the challenge/lesson, preventing both admin and learners from starting. Cache-busting version updated to v=13.

/**
 * TURİZMDE TÜRKÇE — Zamonaviy, boy va to‘liq skrollanadigan Bosh sahifa (Landing Page)
 * Premium tipografika, 15 kunlik dastur xaritasi, kutubxona, sertifikat va aloqa bo'limlari.
 */

(function() {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const daysOverview = [
    { day: 1, title: 'Otel va konaklama xizmatlari', subtitle: 'Resepsiyon, mehmonlarni kutib olish va joylashtirish', icon: '🏨', tag: 'RESEPSIYON' },
    { day: 2, title: 'Housekeeping — xonalarni tozalash', subtitle: 'Xona tartibi, choyshablar va mehmonlarning maxsus talablari', icon: '🧹', tag: 'TOZALASH' },
    { day: 3, title: 'Otel restorani va bar xizmati', subtitle: 'Stol band qilish, menyu tanishtirish, buyurtma va to‘lov', icon: '🍽️', tag: 'RESTORAN' },
    { day: 4, title: 'Sayohat agentligida mijoz muloqoti', subtitle: 'Tur paketlari, aviachiptalar va sayohat bo‘yicha maslahatlar', icon: '✈️', tag: 'AGENTLIK' },
    { day: 5, title: 'Tur operatori va hamkorlar aloqasi', subtitle: 'Xona kvotalari, transport buyurtmasi va rasmiy yozishmalar', icon: '🤝', tag: 'HAMKORLIK' },
    { day: 6, title: 'Tur sotuvi va konsultatsiya', subtitle: 'Ekskursiya turlari, narx takliflari va bron qilish', icon: '🗺️', tag: 'TUR SOTUVI' },
    { day: 7, title: 'Tur gidlar (Rehberler) uchun turk tili', subtitle: 'Guruhni boshqarish, tarixiy joylar va yo‘nalishlarni tushuntirish', icon: '🏛️', tag: 'GIDLIK' },
    { day: 8, title: 'Transfer va transport xizmatlari', subtitle: 'Aeroportda kutib olish, marshrut va transfer jarayoni', icon: '🚐', tag: 'TRANSFER' },
    { day: 9, title: 'Gidlikda muammoli vaziyatlar', subtitle: 'Kechikishlar, adashib qolgan mehmonlar va favqulodda yechimlar', icon: '🧭', tag: 'XAVFSIZLIK' },
    { day: 10, title: 'Garsonlar (ofitsiantlar) uchun muloqot', subtitle: 'Taom buyurtmasi, tarkibini tushuntirish va hisob taqdim etish', icon: '☕', tag: 'XIZMAT' },
    { day: 11, title: 'Barista va bar xodimlari turk tili', subtitle: 'Ichimliklar, qahva turlari va bar madaniyati muloqoti', icon: '🍸', tag: 'BAR & KAFE' },
    { day: 12, title: 'Oshxona va servis xodimlari', subtitle: 'Oshpazlar bilan muomala, pishirish vaqti va taom tayyorligi', icon: '👨‍🍳', tag: 'OSHXONA' },
    { day: 13, title: 'Mijozlar bilan professional muloqot', subtitle: 'Kutib olish, minnatdorchilik va mehmondo‘stlik odobi', icon: '🌟', tag: 'MULOQOT' },
    { day: 14, title: 'Shikoyat va e’tirozlarni hal qilish', subtitle: 'Xonadagi nosozliklar, kechikishlar va xushmuomala yechimlar', icon: '🛡️', tag: 'MUAMMOLAR' },
    { day: 15, title: 'Telefon, WhatsApp va yozma muloqot', subtitle: 'Rasmiy yozishmalar, bron tasdiqlari va xabarlar almashinuvi', icon: '📱', tag: 'YOZMA ALOQA' }
  ];

  window.landing = function() {
    const app = document.querySelector('#app');
    if (!app) return;

    app.innerHTML = `
      <div class="landing-page-wrap">
        <!-- 1. STICKY MODERN HEADER -->
        <header class="landing-header">
          <div class="landing-container header-inner">
            <a href="#hero" class="brand-link">
              <img src="assets/images/logo 2- 100x300.png" alt="TURİZMDE TÜRKÇE" class="landing-logo">
            </a>

            <nav class="nav-links">
              <a href="#features">Afzalliklar</a>
              <a href="#curriculum">15 Kunlik Dastur</a>
              <a href="#library">Kutubxona</a>
              <a href="#certificate">Sertifikat</a>
              <a href="#faq">Savol-Javob</a>
              <a href="#contact">Aloqa</a>
            </nav>

            <div class="header-actions">
              <div class="flags-badge">
                <img src="assets/images/uzbekistan flag.jpg" alt="Uzbekistan" title="O‘zbekiston">
                <img src="assets/images/turkish flag.jpg" alt="Turkey" title="Türkiye">
              </div>
              <button type="button" class="btn-ghost-nav" onclick="go('login')">
                Kirish ↗
              </button>
              <button type="button" class="btn-primary-nav" onclick="openRegisterModal()">
                Ro‘yxatdan o‘tish
              </button>
            </div>
          </div>
        </header>

        <!-- 2. HERO SECTION -->
        <section class="hero-landing" id="hero">
          <div class="hero-glow-1"></div>
          <div class="hero-glow-2"></div>
          
          <div class="landing-container hero-content-grid">
            <div class="hero-text-block">
              <div class="hero-badge">
                <span class="badge-dot"></span>
                <span>15 KUNLIK INTENSIV AMALIY TA’LIM DASTURI</span>
              </div>
              
              <h1 class="hero-headline">
                Turizm sohasida erkin va <span class="gradient-text">professional turkcha</span> gapiring
              </h1>

              <p class="hero-subline">
                Mehmonxona, restoran, sayohat agentligi va gidlik xizmatlari uchun amaliy turk tili platformasi. 
                60 ta jonli audio dialog, 440+ so‘z, real kasbiy vaziyatlar va rasmiy sertifikat — barchasi bir tizimda.
              </p>

              <div class="hero-cta-group">
                <button type="button" class="hero-cta-btn" onclick="go('login')">
                  Platformaga kirish <span class="btn-arrow">→</span>
                </button>
                <button type="button" class="hero-secondary-btn" onclick="openRegisterModal()">
                  A’zo bo‘lish (Ro‘yxatdan o‘tish)
                </button>
                <a href="#curriculum" class="hero-text-link">
                  Dastur xaritasi ↓
                </a>
              </div>

              <!-- Quick stats -->
              <div class="hero-stats-row">
                <div class="stat-pill">
                  <b>15</b>
                  <span>Kunlik dastur</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-pill">
                  <b>440+</b>
                  <span>Kasbiy so‘zlar</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-pill">
                  <b>450+</b>
                  <span>Tayyor iboralar</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-pill">
                  <b>60</b>
                  <span>Jonli dialoglar</span>
                </div>
              </div>
            </div>

            <div class="hero-visual-block">
              <div class="visual-card-wrap">
                <img src="assets/images/logo 1- 1000x1000.png" alt="Platforma Gerbi" class="hero-main-emblem">
                
                <!-- Floating badges -->
                <div class="floating-pill float-top-right">
                  <span class="float-icon">🎧</span>
                  <div>
                    <strong>Jonli audio talaffuz</strong>
                    <small>MP3 audiolari bilan</small>
                  </div>
                </div>

                <div class="floating-pill float-bottom-left">
                  <span class="float-icon">📜</span>
                  <div>
                    <strong>Rasmiy sertifikat</strong>
                    <small>15 kun yakunida</small>
                  </div>
                </div>

                <div class="floating-pill float-bottom-right">
                  <span class="float-icon">🏨</span>
                  <div>
                    <strong>Turizm vaziyatlari</strong>
                    <small>Otel, Gid, Restoran</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 3. PLATFORMA AFZALLIKLARI (FEATURES) -->
        <section class="section-landing bg-surface" id="features">
          <div class="landing-container">
            <div class="section-header-center">
              <span class="section-tag">NEGA AYNAN TURİZMDE TÜRKÇE?</span>
              <h2 class="section-title-large">Zamonaviy va amaliy o‘quv metodikasi</h2>
              <p class="section-desc">
                Quruq grammatik qoidalar o‘rniga, turizm va mehmondo‘stlik sohasida har kuni yuz beradigan real vaziyatlar orqali o‘rganasiz.
              </p>
            </div>

            <div class="features-card-grid">
              <div class="feature-card">
                <div class="feature-icon-box box-teal">🎧</div>
                <h3>Audio talaffuz va eshitish</h3>
                <p>Har bir so‘z, ibora va vaziyatli dialoglar maxsus tayyorlangan professional audiolarga ega. Tinglab, talaffuzingizni charxlaysiz.</p>
                <div class="feature-highlight">30+ to‘liq audio darslar</div>
              </div>

              <div class="feature-card">
                <div class="feature-icon-box box-amber">💬</div>
                <h3>Jonli vaziyatli dialoglar</h3>
                <p>Resepsiyonda kutib olish, tozalash xizmati, buyurtma olish, aviatransport, ekskursiya va kutilmagan muammolarni hal qilish ssenariylari.</p>
                <div class="feature-highlight">60 ta real ish dialoglari</div>
              </div>

              <div class="feature-card">
                <div class="feature-icon-box box-blue">📚</div>
                <h3>Elektron kutubxona & Word</h3>
                <p>Platforma ichida 4 ta to‘liq PDF darslik kitobi hamda har bir kunning batafsil Word (.docx) qo‘llanmalari yuklab olish uchun ochiq.</p>
                <div class="feature-highlight">4 ta rasmiy PDF darslik</div>
              </div>

              <div class="feature-card">
                <div class="feature-icon-box box-emerald">🎖</div>
                <h3>Tasdiqlangan Sertifikat</h3>
                <p>15 kunlik barcha 60 bosqichni to‘liq yakunlagan o‘quvchilar o‘z ism-familiyalari tushirilgan sifatli sertifikatni PDF yoki PNG shaklida yuklab oladi.</p>
                <div class="feature-highlight">Avtomatik Canvas generatsiya</div>
              </div>
            </div>
          </div>
        </section>

        <!-- 4. 15 KUNLIK DASTUR XARITASI (CURRICULUM) -->
        <section class="section-landing" id="curriculum">
          <div class="landing-container">
            <div class="section-header-center">
              <span class="section-tag">O‘QUV REJASI</span>
              <h2 class="section-title-large">15 kunlik intensiv darslar xaritasi</h2>
              <p class="section-desc">
                Har kuni yangi kasbiy soha va vaziyat. Birinchi kundan boshlab bosqichma-bosqich o‘zlashtirib borasiz.
              </p>
            </div>

            <div class="curriculum-grid">
              ${daysOverview.map(d => `
                <div class="curriculum-card">
                  <div class="curriculum-card-top">
                    <span class="day-badge">0${d.day > 9 ? d.day : '0' + d.day}</span>
                    <span class="curriculum-tag">${esc(d.tag)}</span>
                  </div>
                  <div class="curriculum-icon">${d.icon}</div>
                  <h3 class="curriculum-title">${esc(d.title)}</h3>
                  <p class="curriculum-sub">${esc(d.subtitle)}</p>
                  <div class="curriculum-meta">
                    <span>4 bosqich · Audio mavjud</span>
                    <button type="button" class="curriculum-btn" onclick="go('login')">Darsga o‘tish →</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </section>

        <!-- 5. KUTUBXONA (LIBRARY) -->
        <section class="section-landing bg-surface" id="library">
          <div class="landing-container">
            <div class="section-header-center">
              <span class="section-tag">ELEKTRON KUTUBXONA</span>
              <h2 class="section-title-large">Mustaqil o‘rganish uchun qo‘llanmalar</h2>
              <p class="section-desc">
                Turk tilini yanada chuqurroq o‘rganish uchun maxsus saralangan professional darsliklar va grammatika to‘plamlari.
              </p>
            </div>

            <div class="books-showcase-grid">
              <div class="book-item-card">
                <div class="book-mockup cover-1">
                  <span>TURK TILI TURIZMDA</span>
                  <small>Kasbiy turk tili darsligi</small>
                </div>
                <div class="book-info-col">
                  <span class="pill-format">PDF format</span>
                  <h3>Turk tili turizmda</h3>
                  <p>Mehmonxona, restoran va sayyohlik agentliklarida xizmat ko‘rsatish bo‘yicha to‘liq qo‘llanma.</p>
                  <a href="assets/books/TURK%20TILI%20TURIZMDA.pdf" target="_blank" class="book-download-btn">Yuklab olish ↓</a>
                </div>
              </div>

              <div class="book-item-card">
                <div class="book-mockup cover-2">
                  <span>TURK TILI</span>
                  <small>Umumiy til ko‘nikmalari</small>
                </div>
                <div class="book-info-col">
                  <span class="pill-format">PDF format</span>
                  <h3>Turk tili umumiy qo‘llanmasi</h3>
                  <p>Turk tilining asosiy lug‘at boyligi, iboralar va muloqot qoidalari bayon etilgan kitob.</p>
                  <a href="assets/books/Turk%20tili.pdf" target="_blank" class="book-download-btn">Yuklab olish ↓</a>
                </div>
              </div>

              <div class="book-item-card">
                <div class="book-mockup cover-3">
                  <span>YABANCI DİLİM</span>
                  <small>Boshlang‘ich daraja</small>
                </div>
                <div class="book-info-col">
                  <span class="pill-format">PDF format</span>
                  <h3>Yabancı Dilim Türkçe 1</h3>
                  <p>Xorijliklar uchun turk tilini o‘rgatuvchi mashhur darslik, dialoglar va topshiriqlar bilan.</p>
                  <a href="assets/books/Yabanci_Dilim_Turkce_1%20(1).pdf" target="_blank" class="book-download-btn">Yuklab olish ↓</a>
                </div>
              </div>

              <div class="book-item-card">
                <div class="book-mockup cover-4">
                  <span>DİLBİLGİSİ A1–A2</span>
                  <small>Grammatika & Mashqlar</small>
                </div>
                <div class="book-info-col">
                  <span class="pill-format">PDF format</span>
                  <h3>Türkçe Dilbilgisi A1–A2</h3>
                  <p>Grammatik qoidalar, qo‘shimchalar, jadvallar va mustahkamlash mashqlari jamlangan kitob.</p>
                  <a href="assets/books/yabancilar_icin_turkce_dilbilgisi_A1_A2_kurallar_ve_alistirmalar.pdf" target="_blank" class="book-download-btn">Yuklab olish ↓</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 6. SERTIFIKAT BO'LIMI (CERTIFICATE PREVIEW) -->
        <section class="section-landing" id="certificate">
          <div class="landing-container">
            <div class="certificate-banner-grid">
              <div class="cert-text-col">
                <span class="section-tag tag-gold">RASMIY HUJJAT</span>
                <h2 class="section-title-large text-white">15 kun yakunida shaxsiy sertifikat</h2>
                <p class="section-desc text-light">
                  Barcha 15 kunlik dasturni to‘liq yakunlagan o‘quvchilar uchun platforma avtomatik ravishda talabaning ism-familiyasi tushirilgan yuqori sifatli sertifikatni shakllantirib beradi.
                </p>
                
                <ul class="cert-features-list">
                  <li>✓ Ism va familiyangiz tushirilgan shaxsiy sertifikat</li>
                  <li>✓ A4 formatida PDF sifatida chop etish yoki saqlash</li>
                  <li>✓ PNG formatida yuqori sifatli rasm sifatida yuklab olish</li>
                  <li>✓ Rezyume (CV) va ish joylariga taqdim etish imkoniyati</li>
                </ul>

                <button type="button" class="btn-cert-cta" onclick="go('login')">
                  Dasturni boshlash va sertifikat olish →
                </button>
              </div>

              <div class="cert-image-col">
                <div class="cert-frame">
                  <img src="assets/images/certificate.png" alt="Sertifikat namunasi" class="cert-preview-img">
                  <div class="cert-badge-floating">
                    <b>100%</b>
                    <span>TASDIQLANGAN</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 7. TEZ-TEZ SO'RALADIGAN SAVOLLAR (FAQ) -->
        <section class="section-landing bg-surface" id="faq">
          <div class="landing-container faq-container">
            <div class="section-header-center">
              <span class="section-tag">SAVOL-JAVOB</span>
              <h2 class="section-title-large">Tez-tez so‘raladigan savollar</h2>
              <p class="section-desc">Platformadan foydalanish va dars jarayoni bo‘yicha asosiy savollarga javoblar.</p>
            </div>

            <div class="faq-accordion-list">
              <details class="faq-item" open>
                <summary>
                  <span>Kurs kimlar uchun mo‘ljallangan?</span>
                  <span class="faq-arrow">+</span>
                </summary>
                <p>Mehmonxona xodimlari, resepsiyonistlar, ofitsiantlar, turagentlar, gidlar, turizm yo‘nalishi talabalari hamda turk tilini amaliy ish vaziyatlarida tez o‘rganmoqchi bo‘lganlar uchun.</p>
              </details>

              <details class="faq-item">
                <summary>
                  <span>Darslar qanday tashkil etilgan?</span>
                  <span class="faq-arrow">+</span>
                </summary>
                <p>Dastur 15 kunga bo‘lingan. Har bir kunda 4 bosqich mavjud: 1) So‘zlar va audio, 2) Tayyor iboralar va audio, 3) 4 ta jonli dialog va audio, 4) Grammatika va video hordiq. Bosqichlar ketma-ket bajariladi.</p>
              </details>

              <details class="faq-item">
                <summary>
                  <span>Audio tinglash shartmi?</span>
                  <span class="faq-arrow">+</span>
                </summary>
                <p>Audioni tinglash to‘g‘ri talaffuz va eshitib tushunishni shakllantiradi. Dastlabki kunlarda audio oxirigacha tinglangach keyingi qadam ochiladi, keyingi kunlarda esa matnni o‘rganib bosqichni yakunlash tugmasi mavjud.</p>
              </details>

              <details class="faq-item">
                <summary>
                  <span>Platformadan foydalanish uchun to‘lov kerakmi?</span>
                  <span class="faq-arrow">+</span>
                </summary>
                <p>Platformada o‘qish sizga taqdim etilgan 8 xonali login va parol orqali amalga oshiriladi. Ro‘yxatdan o‘tish yoki hisob olish uchun quyidagi aloqa bo‘limi orqali murojaat qilishingiz mumkin.</p>
              </details>
            </div>
          </div>
        </section>

        <!-- 8. BIZ BILAN BOG'LANISH VA MUROJAAT (CONTACT) -->
        <section class="section-landing" id="contact">
          <div class="landing-container">
            <div class="section-header-center">
              <span class="section-tag">ALOQA VA YORDAM</span>
              <h2 class="section-title-large">Savollaringiz bormi? Bizga yozing</h2>
              <p class="section-desc">Kursga ro‘yxatdan o‘tish, texnik yordam yoki hamkorlik bo‘yicha bog‘lanishingiz mumkin.</p>
            </div>

            <div class="contact-card-grid">
              <!-- Chap tomon: Aloqa ma'lumotlari -->
              <div class="contact-info-panel">
                <div class="info-item-row">
                  <div class="info-icon-badge">✈️</div>
                  <div>
                    <label>Telegram orqali to‘g‘ridan-to‘g‘ri aloqa</label>
                    <a href="https://t.me/farkxodov_1" target="_blank" rel="noopener" class="contact-link">
                      @farkxodov_1
                    </a>
                    <small>Tezkor javob berish uchun</small>
                  </div>
                </div>

                <div class="info-item-row">
                  <div class="info-icon-badge">📞</div>
                  <div>
                    <label>Telefon raqam</label>
                    <a href="tel:+998935234305" class="contact-link">
                      +998 93 523 43 05
                    </a>
                    <small>Dushanba – Shanba, 09:00 – 19:00</small>
                  </div>
                </div>

                <div class="info-item-row">
                  <div class="info-icon-badge">✉️</div>
                  <div>
                    <label>Elektron pochta (Email)</label>
                    <a href="mailto:fzz2000fzz@gmail.com" class="contact-link">
                      fzz2000fzz@gmail.com
                    </a>
                    <small>Rasmiy takliflar va murojaatlar</small>
                  </div>
                </div>

                <div class="telegram-fast-banner">
                  <h4>✈️ Telegram kanal va guruh</h4>
                  <p>Muloqot qilish va yangiliklardan boxabar bo‘lish uchun yozing:</p>
                  <a href="https://t.me/farkxodov_1" target="_blank" rel="noopener" class="btn-telegram">
                    Telegramda yozish (@farkxodov_1) →
                  </a>
                </div>
              </div>

              <!-- O'ng tomon: Murojaat formasi -->
              <div class="contact-form-panel">
                <h3>Xabar qoldiring</h3>
                <p class="muted">Ismingiz, emailingiz va xabaringizni yozing, tez orada siz bilan bog‘lanamiz.</p>

                <form id="landing-contact-form" onsubmit="handleLandingContact(event)">
                  <div class="form-row-2">
                    <div>
                      <label>Ism va familiyangiz</label>
                      <input name="fullname" required placeholder="Masalan: Sardor Rahimov">
                    </div>
                    <div>
                      <label>Sizning emailingiz</label>
                      <input type="email" name="sender" required placeholder="example@gmail.com">
                    </div>
                  </div>

                  <div>
                    <label>Mavzu</label>
                    <input name="subject" required placeholder="Kursga yozilish / Savol / Taklif">
                  </div>

                  <div>
                    <label>Xabaringiz</label>
                    <textarea name="message" rows="5" required placeholder="Savolingiz yoki fikringizni yozing..."></textarea>
                  </div>

                  <button type="submit" class="btn-submit-message">
                    ✉ Xabarni yuborish →
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        <!-- 9. FOOTER (PASTKI QISM) -->
        <footer class="landing-footer">
          <div class="landing-container footer-content-grid">
            <div class="footer-about-col">
              <img src="assets/images/logo 2- 100x300.png" alt="Logo" class="footer-logo">
              <p>Turizm va mehmondo‘stlik sohasi xodimlari uchun 15 kunlik amaliy turk tili ta’lim platformasi.</p>
              <div class="footer-flags">
                <img src="assets/images/uzbekistan flag.jpg" alt="Uzbekistan">
                <img src="assets/images/turkish flag.jpg" alt="Turkey">
              </div>
            </div>

            <div class="footer-links-col">
              <h4>Bo‘limlar</h4>
              <a href="#hero">Bosh sahifa</a>
              <a href="#features">Afzalliklar</a>
              <a href="#curriculum">15 Kunlik Dastur</a>
              <a href="#library">Elektron Kutubxona</a>
              <a href="#certificate">Sertifikat</a>
            </div>

            <div class="footer-links-col">
              <h4>Platforma</h4>
              <a href="javascript:void(0)" onclick="go('login')">Tizimga kirish</a>
              <a href="javascript:void(0)" onclick="openRegisterModal()">Ro‘yxatdan o‘tish</a>
              <a href="assets/books/TURK%20TILI%20TURIZMDA.pdf" target="_blank">Qo‘llanma (PDF)</a>
              <a href="#faq">Tez-tez so‘raladigan savollar</a>
            </div>

            <div class="footer-contact-col">
              <h4>Aloqa va Muallif</h4>
              <p>Savol va takliflar uchun bevosita bog‘laning:</p>
              <div class="footer-contact-links">
                <a href="https://t.me/farkxodov_1" target="_blank" rel="noopener">✈️ Telegram: <strong>@farkxodov_1</strong></a>
                <a href="tel:+998935234305">📞 Tel: <strong>+998 93 523 43 05</strong></a>
                <a href="mailto:fzz2000fzz@gmail.com">✉️ Email: <strong>fzz2000fzz@gmail.com</strong></a>
              </div>
            </div>
          </div>

          <div class="landing-container footer-bottom-bar">
            <span>© 2026 TURİZMDE TÜRKÇE. Barcha huquqlar himoyalangan.</span>
            <span>O‘zbekiston × Türkiye hamkorligi</span>
          </div>
        </footer>

        <!-- RO'YXATDAN O'TISH MODALI (REGISTER POPUP) -->
        <div id="register-modal" class="modal-overlay" style="display:none" onclick="if(event.target===this)closeRegisterModal()">
          <div class="modal-card">
            <button type="button" class="modal-close-btn" onclick="closeRegisterModal()">✕</button>
            <div class="modal-header">
              <span class="section-tag">TA’LIM PLATFORMASI</span>
              <h2>Kursga ro‘yxatdan o‘tish</h2>
              <p class="muted">Agar sizga allaqachon login va parol berilgan bo‘lsa, <a href="javascript:void(0)" onclick="closeRegisterModal();go('login')">Kirish sahifasiga o‘ting →</a></p>
            </div>

            <div class="modal-body">
              <p>Yangi o‘quvchi hisobini (8 xonali login va parol) olish uchun quyidagi ma’lumotlarni qoldiring yoki to‘g‘ridan-to‘g‘ri Telegram orqali yozing:</p>
              
              <div class="modal-actions-box">
                <a href="https://t.me/farkxodov_1" target="_blank" rel="noopener" class="btn-telegram-full">
                  ✈️ Telegram orqali hisob so‘rash (@farkxodov_1)
                </a>
              </div>

              <div class="divider-text">yoki pochta orqali yozing</div>

              <form onsubmit="handleRegisterRequest(event)">
                <label>Ism va familiyangiz</label>
                <input name="name" required placeholder="Ism Familiya">

                <label>Telefon raqam yoki Telegram username</label>
                <input name="contact" required placeholder="+998 90 ... yoki @username">

                <label>Turk tili darajangiz</label>
                <select name="level">
                  <option value="A1 (Boshlang‘ich)">A1 — Boshlang‘ich</option>
                  <option value="A2 (Davom ettiruvchi)">A2 — Davom ettiruvchi</option>
                  <option value="B1 (O‘rta)">B1 — O‘rta daraja</option>
                  <option value="B2 va undan yuqori">B2 va undan yuqori</option>
                </select>

                <button type="submit" class="btn-submit-message" style="margin-top:14px">
                  So‘rovni yuborish →
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>
    `;
  };

  // Modal funksiyalari
  window.openRegisterModal = function() {
    const modal = document.querySelector('#register-modal');
    if (modal) modal.style.display = 'flex';
  };

  window.closeRegisterModal = function() {
    const modal = document.querySelector('#register-modal');
    if (modal) modal.style.display = 'none';
  };

  // Aloqa formasi (Email orqali to'g'ridan-to'g'ri yuborish - FormSubmit AJAX)
  window.handleLandingContact = async function(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const f = new FormData(form);
    const name = f.get('fullname') || '';
    const sender = f.get('sender') || '';
    const subject = f.get('subject') || 'Platforma murojaati';
    const message = f.get('message') || '';

    const origText = btn ? btn.innerHTML : '✉ Xabarni yuborish →';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = 'Yuborilmoqda... ⏳';
    }

    try {
      const res = await fetch('https://formsubmit.co/ajax/fzz2000fzz@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          'Ism va familiya': name,
          'Email manzili': sender,
          '_subject': 'TURİZMDE TÜRKÇE | Yangi murojaat: ' + subject,
          'Mavzu': subject,
          'Xabar matni': message,
          '_template': 'table'
        })
      });

      const data = await res.json();
      if (res.ok || data.success === 'true' || data.success === true) {
        if (btn) {
          btn.innerHTML = '✅ Xabar yuborildi!';
          btn.style.background = '#10b981';
        }
        alert('Rahmat! Xabaringiz to‘g‘ridan-to‘g‘ri fzz2000fzz@gmail.com pochtasiga yuborildi. Tez orada siz bilan bog‘lanamiz.');
        form.reset();
      } else {
        throw new Error(data.message || 'Xatolik yuz berdi');
      }
    } catch (err) {
      console.warn('FormSubmit fallback:', err);
      const mailto = `mailto:fzz2000fzz@gmail.com?subject=${encodeURIComponent('TURİZMDE TÜRKÇE | ' + subject)}&body=${encodeURIComponent('Ism: ' + name + '\nEmail: ' + sender + '\n\n' + message)}`;
      window.location.href = mailto;
    } finally {
      setTimeout(() => {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = origText;
          btn.style.background = '';
        }
      }, 4000);
    }
  };

  // Ro'yxatdan o'tish so'rovi (Email orqali to'g'ridan-to'g'ri yuborish)
  window.handleRegisterRequest = async function(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const f = new FormData(form);
    const name = f.get('name') || '';
    const contact = f.get('contact') || '';
    const level = f.get('level') || 'A1';

    const origText = btn ? btn.innerHTML : 'Ariza yuborish →';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = 'Yuborilmoqda... ⏳';
    }

    try {
      const res = await fetch('https://formsubmit.co/ajax/fzz2000fzz@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          'Yangi o‘quvchi': name,
          'Aloqa (Telegram/Telefon/Email)': contact,
          'Turk tili darajasi': level,
          '_subject': 'TURİZMDE TÜRKÇE: Yangi o‘quvchi ro‘yxatdan o‘tish arizasi',
          'Iltimos': 'Platformaga kirish uchun 8 xonali login va parol taqdim etilsin.',
          '_template': 'table'
        })
      });

      const data = await res.json();
      if (res.ok || data.success === 'true' || data.success === true) {
        alert('Arizangiz muvaffaqiyatli qabul qilindi! Adminlar tez orada siz bilan bog‘lanadi.');
        form.reset();
        closeRegisterModal();
      } else {
        throw new Error(data.message || 'Xatolik');
      }
    } catch (err) {
      const mailto = `mailto:fzz2000fzz@gmail.com?subject=${encodeURIComponent('Yangi o‘quvchi ro‘yxatdan o‘tish so‘rovi')}&body=${encodeURIComponent('Ism: ' + name + '\nAloqa: ' + contact + '\nDaraja: ' + level + '\n\nIltimos, menga platformaga kirish uchun 8 xonali login va parol taqdim eting.')}`;
      window.location.href = mailto;
      closeRegisterModal();
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origText;
      }
    }
  };

  // Agar hozirda bosh sahifa (landing) ko'rinishida bo'lsa, darhol yangilash
  try {
    if (typeof view !== 'undefined' && view === 'landing') {
      window.landing();
    }
  } catch (e) {}

})();

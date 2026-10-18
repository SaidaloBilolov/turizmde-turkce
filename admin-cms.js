(function() {
  let currentTab = 'overview';
  let selectedDay = 1;
  let adminStats = { totalStudents: 42, completedCertificates: 0, totalLessons: 15 };
  let systemStatus = { supabase: true, mode: 'cloud_supabase' };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  async function loadStatus() {
    try {
      if (window.API && typeof API.checkStatus === 'function') {
        const res = await API.checkStatus();
        if (res && res.ok) {
          systemStatus = res;
          if (typeof renderAdminStudio === 'function' && typeof view !== 'undefined' && view === 'admin') {
            renderAdminStudio();
          }
        }
      }
      if (window.API && typeof API.getAdminOverview === 'function') {
        const st = await API.getAdminOverview();
        if (st && st.ok) {
          adminStats = st.stats;
          if (typeof renderAdminStudio === 'function' && typeof view !== 'undefined' && view === 'admin') {
            renderAdminStudio();
          }
        }
      }
    } catch (e) {}
  }
  window.renderAdminStudio = renderAdminStudio;
  window.admin = function() {
    renderAdminStudio();
    loadStatus();
  };

  function setAdminTab(tab) {
    currentTab = tab;
    renderAdminStudio();
  }
  window.setAdminTab = setAdminTab;

  function setAdminDay(d) {
    selectedDay = parseInt(d) || 1;
    renderAdminStudio();
  }
  window.setAdminDay = setAdminDay;

  function renderAdminStudio() {
    const tabs = [
      ['overview', '📊 O‘quvchilar & Progress'],
      ['audio', '🎧 Audio yuklash (Storage)'],
      ['words', '📝 So‘z va Iboralar (Slovar)'],
      ['dialogs', '💬 Jonli dialoglar'],
      ['lessons', '📖 Dars, Grammatika & Video'],
      ['books', '📚 Qo‘llanma & Kitoblar']
    ];

    const isConnected = systemStatus.supabase;
    const statusBadge = isConnected
      ? `<span class="pill" style="background:#10b981;color:#fff;font-weight:700">🟢 Supabase buluti ulangan (Online 24/7)</span>`
      : `<span class="pill" style="background:#f59e0b;color:#fff;font-weight:700">🟡 Mahalliy rejim (Offline)</span>`;

    let contentHtml = '';
    switch (currentTab) {
      case 'overview': contentHtml = renderOverviewTab(); break;
      case 'audio': contentHtml = renderAudioTab(); break;
      case 'dialogs': contentHtml = renderDialogsTab(); break;
      case 'words': contentHtml = renderWordsTab(); break;
      case 'lessons': contentHtml = renderLessonsTab(); break;
      case 'books': contentHtml = renderBooksTab(); break;
      default: contentHtml = renderOverviewTab();
    }

    shell(`
      <section class="admin-hero">
        <div>
          <span class="eyebrow">ADMIN STUDIO & CMS</span>
          <h1>Platforma boshqaruv markazi</h1>
          <p>Yangi audio fayllar, kitoblar, YouTube videolari, dars matnlari, slovarlar va o‘quvchilar natijalarini to‘liq boshqaring.</p>
        </div>
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
          ${statusBadge}
          <div class="admin-stat"><b>${adminStats.totalLessons || 15}</b><span>Kunlik dars</span></div>
          <div class="admin-stat"><b>${adminStats.totalStudents || 42}</b><span>O‘quvchilar</span></div>
        </div>
      </section>

      <!-- CMS TABLARI -->
      <div class="admin-tabs" style="display:flex;gap:8px;margin:20px 0;border-bottom:2px solid #e2e8f0;padding-bottom:10px;overflow-x:auto">
        ${tabs.map(([t, label]) => `
          <button type="button" class="btn-soft ${currentTab === t ? 'btn-primary' : ''}" style="${currentTab === t ? 'background:#087f8c;color:#fff;font-weight:bold' : ''}" onclick="setAdminTab('${t}')">
            ${label}
          </button>
        `).join('')}
      </div>

      <div class="admin-content-slot">
        ${contentHtml}
      </div>
    `);
    bindTabEvents();
  }
  function renderOverviewTab() {
    let accounts = [];
    try {
      const saved = JSON.parse(localStorage.getItem('tt_accounts_override') || 'null');
      accounts = Array.isArray(saved) ? saved : (window.DEMO_ACCOUNTS || []).map(a => ({ id: a[0], pw: a[1] }));
    } catch (e) {
      accounts = (window.DEMO_ACCOUNTS || []).map(a => ({ id: a[0], pw: a[1] }));
    }

    const rows = accounts.map(a => {
      const id = String(a.id);
      let d = {};
      try { d = JSON.parse(localStorage.getItem('tt_user_' + id) || '{}'); } catch(e){}
      const p = d.profile || {};
      const doneMap = d.done || {};
      const steps = Object.values(doneMap).filter(Boolean).length;
      return {
        id,
        name: [p.first, p.last].filter(Boolean).join(' ') || 'Profil to‘ldirilmagan',
        level: p.level || '—',
        email: p.email || '—',
        steps,
        percent: Math.round((steps / 60) * 100)
      };
    });

    return `
      <div class="admin-toolbar">
        <div>
          <h2>O‘quvchilar nazorati va hisoboti</h2>
          <p class="muted">Barcha foydalanuvchilar progressi va yangi talaba qo‘shish.</p>
        </div>
        <div style="display:flex;gap:10px">
          <button class="btn-primary" onclick="openAddStudentModal()">➕ Yangi o‘quvchi qo‘shish</button>
          <input id="admin-search-input" placeholder="🔎 Qidirish..." oninput="filterStudentsList()" style="width:200px">
        </div>
      </div>

      <div class="admin-results-list" id="students-container">
        ${rows.map(r => `
          <article class="admin-user-card student-row" data-search="${esc((r.id + ' ' + r.name + ' ' + r.level).toLowerCase())}">
            <div class="admin-user-avatar">${esc((r.name === 'Profil to‘ldirilmagan' ? r.id : r.name).slice(0, 1).toUpperCase())}</div>
            <div class="admin-user-main">
              <div class="admin-user-heading">
                <b>${esc(r.name)}</b>
                <span class="pill">${r.steps}/60 bosqich (${r.percent}%)</span>
              </div>
              <p>Login: <strong>${esc(r.id)}</strong> · Daraja: ${esc(r.level)} · Email: ${esc(r.email)}</p>
              <div class="admin-progress"><span style="width:${r.percent}%"></span></div>
            </div>
            <div class="admin-user-actions">
              <button class="btn-soft" onclick="showUser('${esc(r.id)}')">Profil / Natijalar →</button>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  }

  function saveLessonsOverride() {
    try {
      if (window.LESSONS && Array.isArray(window.LESSONS)) {
        localStorage.setItem('tt_lessons_override', JSON.stringify(window.LESSONS));
      }
    } catch(e) {}
  }
  function renderAudioCard(filename, title, typeCode) {
    const uploaded = (typeof window.getUploadedAudios === 'function') ? window.getUploadedAudios() : {};
    let deletedDefaults = [];
    try { deletedDefaults = JSON.parse(localStorage.getItem('tt_deleted_defaults') || '[]'); } catch(e){}

    let url = null;
    let sourceLabel = '';
    if (uploaded[filename]) {
      url = uploaded[filename];
      sourceLabel = 'Supabase Storage';
    } else if (selectedDay <= 5 && !deletedDefaults.includes(filename)) {
      url = `assets/audio/${filename}`;
      sourceLabel = 'Lokal fayl';
    }

    if (url) {
      return `
        <div class="card" style="background:#fff;border:1px solid #10b981;border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:10px">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
            <h4 style="margin:0;font-size:15px">${title} (<code>${filename}</code>)</h4>
            <span class="pill" style="background:#d1fae5;color:#065f46;font-size:11px;font-weight:700">✓ Audio mavjud (${sourceLabel})</span>
          </div>
          <audio controls style="width:100%" src="${url}"></audio>
          <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px">
            <button type="button" class="btn-soft" onclick="quickUploadAudio('${filename}', '${typeCode}', ${selectedDay})" style="font-size:12px;padding:6px 12px;color:#087f8c;border:1px solid #087f8c">
              🔄 Almashtirish (.mp3)
            </button>
            <button type="button" class="btn-soft" onclick="handleDeleteAudio('${filename}', ${selectedDay}, '${typeCode}')" style="font-size:12px;padding:6px 12px;color:#bd4040;border:1px solid #bd4040">
              🗑 O‘chirish
            </button>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="card" style="background:#fcfcfd;border:1px dashed #cbd5e1;border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:10px">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
            <h4 style="margin:0;font-size:15px;color:#64748b">${title} (<code>${filename}</code>)</h4>
            <span class="pill" style="background:#fef3c7;color:#92400e;font-size:11px;font-weight:700">⏳ Hali yuklanmagan</span>
          </div>
          <div style="padding:10px 12px;background:#fff8ee;border:1px solid #fde68a;border-radius:8px;font-size:12px;color:#92400e;line-height:1.5">
            Bu dars/dialog uchun audio fayl yuklanmagan. To‘g‘ridan-to‘g‘ri yuklash uchun bosing:
          </div>
          <div style="display:flex;justify-content:flex-end">
            <button type="button" class="btn-primary" onclick="quickUploadAudio('${filename}', '${typeCode}', ${selectedDay})" style="font-size:13px;padding:7px 16px">
              ➕ Audio yuklash (.mp3)
            </button>
          </div>
        </div>
      `;
    }
  }

  function renderAudioTab() {
    const lessonDays = Array.from({ length: 15 }, (_, i) => i + 1);

    const slotWords = renderAudioCard(`${selectedDay}.1.1.mp3`, '📖 So‘zlar audiosi', 'word');
    const slotPhrases = renderAudioCard(`${selectedDay}.2.1.mp3`, '💬 Iboralar audiosi', 'phrase');
    const slotDialog1 = renderAudioCard(`${selectedDay}.3.1.mp3`, '🗣 1-Dialog audiosi', 'dialog_1');
    const slotDialog2 = renderAudioCard(`${selectedDay}.3.2.mp3`, '🗣 2-Dialog audiosi', 'dialog_2');
    const slotDialog3 = renderAudioCard(`${selectedDay}.3.3.mp3`, '🗣 3-Dialog audiosi', 'dialog_3');
    const slotDialog4 = renderAudioCard(`${selectedDay}.3.4.mp3`, '🗣 4-Dialog audiosi', 'dialog_4');

    return `
      <div class="card" style="margin-bottom:20px;background:#f8fafc;border:1px solid #cbd5e1">
        <h2>🎧 Yangi audio yuklash (Supabase Storage)</h2>
        <p class="muted">
          Kompyuteringizdan <strong>.mp3</strong> audio faylni tanlang. Fayl to‘g‘ridan-to‘g‘ri Supabase Storage xotirasiga yuklanadi va tegishli dars yoki dialogga biriktiriladi.
        </p>

        <form id="audio-upload-form" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:16px;margin-top:16px">
          <div>
            <label><strong>1. Dars kunini tanlang</strong></label>
            <select name="day" id="upload-day" onchange="updateAudioOptions()">
              ${lessonDays.map(d => `<option value="${d}" ${d === selectedDay ? 'selected' : ''}>${d}-kun darsi</option>`).join('')}
            </select>
          </div>

          <div>
            <label><strong>2. Audio turini tanlang</strong></label>
            <select name="type" id="upload-type" onchange="updateAudioCustomName()">
              <option value="word">So‘zlar audiosi (Kelimeler)</option>
              <option value="phrase">Iboralar audiosi (Hazır İfadeler)</option>
              <option value="dialog_1">1-Dialog audiosi</option>
              <option value="dialog_2">2-Dialog audiosi</option>
              <option value="dialog_3">3-Dialog audiosi</option>
              <option value="dialog_4">4-Dialog audiosi</option>
              <option value="custom">Maxsus nom bilan yuklash</option>
            </select>
          </div>

          <div>
            <label><strong>3. Audio faylni tanlang (.mp3)</strong></label>
            <input type="file" name="audio" id="audio-file-input" accept="audio/mp3,audio/*" required>
          </div>

          <div id="custom-name-box" style="display:none">
            <label>Maxsus fayl nomi (masalan: 6.3.1)</label>
            <input type="text" name="customName" id="custom-audio-name" placeholder="masalan: 6.3.1">
          </div>

          <div style="grid-column:1/-1;margin-top:10px">
            <button type="submit" class="btn-primary" id="upload-btn" style="padding:10px 24px;font-size:15px">
              ⬆ Audioni yuklash va saqlash
            </button>
            <span id="upload-status" style="margin-left:14px;font-weight:bold"></span>
          </div>
        </form>
      </div>

      <div class="card">
        <h3>Darslar bo‘yicha audio holati (${selectedDay}-kun)</h3>
        <p class="muted">Ushbu kundagi mavjud audiolarni eshitib tekshirishingiz mumkin:</p>
        
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px;margin-top:14px">
          ${slotWords}
          ${slotPhrases}
          ${slotDialog1}
          ${slotDialog2}
          ${slotDialog3}
          ${slotDialog4}
        </div>
      </div>
    `;
  }
  function renderWordsTab() {
    const lesson = (window.LESSONS || [])[selectedDay - 1] || {};
    const words = lesson.words || [];
    const phrases = lesson.phrases || [];

    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:12px">
        <div style="display:flex;align-items:center;gap:10px">
          <label><strong>Kunni tanlang:</strong></label>
          <select onchange="setAdminDay(this.value)" style="padding:6px 12px;font-size:15px;font-weight:bold">
            ${Array.from({ length: 15 }, (_, i) => i + 1).map(d => `
              <option value="${d}" ${d === selectedDay ? 'selected' : ''}>${d}-kun darsi</option>
            `).join('')}
          </select>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px" class="vocab-grid">
        <!-- SO'ZLAR -->
        <div class="card" style="background:#fff">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <h3>📖 So‘zlar lug‘ati (${words.length} ta)</h3>
          </div>

          <form id="add-word-form" onsubmit="handleAddWord(event, ${selectedDay})" style="display:flex;gap:6px;margin-bottom:14px">
            <input name="tr" placeholder="Türkçe so‘z" required style="flex:1">
            <input name="uz" placeholder="O‘zbekcha tarjimasi" required style="flex:1">
            <button type="submit" class="btn-primary">Qo‘shish</button>
          </form>

          <div style="max-height:400px;overflow-y:auto;border:1px solid #e2e8f0;border-radius:6px">
            <table class="table" style="margin:0;font-size:13px">
              <thead><tr><th>№</th><th>Türkçe</th><th>O‘zbekcha</th><th style="text-align:right">Amallar</th></tr></thead>
              <tbody>
                ${words.map((w, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td><strong>${esc(w[1])}</strong></td>
                    <td>${esc(w[2])}</td>
                    <td style="text-align:right;white-space:nowrap">
                      <button type="button" class="btn-soft" onclick="editWordItem(${selectedDay}, ${i})" title="Tahrirlash" style="font-size:11px;padding:3px 8px;margin-right:4px">✏️</button>
                      <button type="button" class="btn-soft" onclick="removeWord(${selectedDay}, ${i})" title="O‘chirish" style="color:#bd4040;font-size:11px;padding:3px 8px">🗑</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- IBORALAR -->
        <div class="card" style="background:#fff">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <h3>💬 Tayyor iboralar (${phrases.length} ta)</h3>
          </div>

          <form id="add-phrase-form" onsubmit="handleAddPhrase(event, ${selectedDay})" style="display:flex;gap:6px;margin-bottom:14px">
            <input name="tr" placeholder="Türkçe ibora" required style="flex:1">
            <input name="uz" placeholder="O‘zbekcha tarjimasi" required style="flex:1">
            <button type="submit" class="btn-primary">Qo‘shish</button>
          </form>

          <div style="max-height:400px;overflow-y:auto;border:1px solid #e2e8f0;border-radius:6px">
            <table class="table" style="margin:0;font-size:13px">
              <thead><tr><th>№</th><th>Türkçe</th><th>O‘zbekcha</th><th style="text-align:right">Amallar</th></tr></thead>
              <tbody>
                ${phrases.map((p, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td><strong>${esc(p[1])}</strong></td>
                    <td>${esc(p[2])}</td>
                    <td style="text-align:right;white-space:nowrap">
                      <button type="button" class="btn-soft" onclick="editPhraseItem(${selectedDay}, ${i})" title="Tahrirlash" style="font-size:11px;padding:3px 8px;margin-right:4px">✏️</button>
                      <button type="button" class="btn-soft" onclick="removePhrase(${selectedDay}, ${i})" title="O‘chirish" style="color:#bd4040;font-size:11px;padding:3px 8px">🗑</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }
  function renderDialogsTab() {
    const lesson = (window.LESSONS || [])[selectedDay - 1] || {};
    const dialogs = lesson.dialogs || [];

    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:12px">
        <div style="display:flex;align-items:center;gap:10px">
          <label><strong>Kunni tanlang:</strong></label>
          <select onchange="setAdminDay(this.value)" style="padding:6px 12px;font-size:15px;font-weight:bold">
            ${Array.from({ length: 15 }, (_, i) => i + 1).map(d => `
              <option value="${d}" ${d === selectedDay ? 'selected' : ''}>${d}-kun darsi</option>
            `).join('')}
          </select>
        </div>
        <button class="btn-primary" onclick="openAddDialogModal(${selectedDay})">➕ Yangi dialog qo‘shish</button>
      </div>

      <div class="dialogs-editor-list" style="display:grid;gap:16px">
        ${dialogs.map((d, idx) => `
          <div class="card" style="border:1px solid #cbd5e1;background:#fff;padding:16px">
            <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e2e8f0;padding-bottom:10px;margin-bottom:12px;gap:10px;flex-wrap:wrap">
              <div style="flex:1;min-width:240px">
                <label style="font-size:12px;font-weight:bold;color:#64748b;display:block;margin-bottom:4px">Dialog mavzusi / sarlavhasi:</label>
                <input id="dialog-title-${idx}" value="${esc(d.title)}" style="width:100%;font-weight:bold;font-size:15px;padding:6px 10px;border:1px solid #cbd5e1;border-radius:6px">
              </div>
              <span class="pill">Dialog ${idx + 1}</span>
            </div>

            <label><strong>Replikalar (Har bir qator alohida gap):</strong></label>
            <textarea id="dialog-lines-${idx}" rows="6" style="width:100%;font-family:inherit;margin-top:6px;padding:8px;border:1px solid #cbd5e1;border-radius:6px">${esc((d.lines || []).join('\n'))}</textarea>

            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;flex-wrap:wrap;gap:10px">
              <div style="display:flex;align-items:center;gap:8px">
                <small class="muted">Audio birikmasi: <strong>${selectedDay}.3.${idx + 1}.mp3</strong></small>
              </div>
              <div style="display:flex;gap:8px">
                <button class="btn-primary" onclick="saveDialogChanges(${selectedDay}, ${idx})">💾 Saqlash</button>
                <button class="btn-soft" onclick="deleteDialogItem(${selectedDay}, ${idx})" style="color:#bd4040">🗑 O‘chirish</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  function renderLessonsTab() {
    const lesson = (window.LESSONS || [])[selectedDay - 1] || {};
    const grammarLines = lesson.grammar || [];

    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:12px">
        <div style="display:flex;align-items:center;gap:10px">
          <label><strong>Kunni tanlang:</strong></label>
          <select onchange="setAdminDay(this.value)" style="padding:6px 12px;font-size:15px;font-weight:bold">
            ${Array.from({ length: 15 }, (_, i) => i + 1).map(d => `
              <option value="${d}" ${d === selectedDay ? 'selected' : ''}>${d}-kun darsi</option>
            `).join('')}
          </select>
        </div>
      </div>

      <div class="card" style="background:#fff">
        <h3>Dars parametrlari (${selectedDay}-kun)</h3>
        <form id="lesson-settings-form" onsubmit="handleSaveLesson(event, ${selectedDay})">
          <label><strong>Dars sarlavhasi (Türkçe):</strong></label>
          <input name="title" value="${esc(lesson.title || '')}" required style="width:100%;margin-bottom:12px">

          <label><strong>Qisqacha tavsif (Subtitle):</strong></label>
          <input name="subtitle" value="${esc(lesson.subtitle || '')}" style="width:100%;margin-bottom:12px">

          <label><strong>🎬 YouTube video havola (Video hordiq):</strong></label>
          <input name="video_url" value="${esc(lesson.video || '')}" style="width:100%;margin-bottom:12px" placeholder="https://youtu.be/...">

          <label><strong>📖 Grammatika matni (Qoidalar, misollar va eslatmalar):</strong></label>
          <textarea name="grammar" rows="8" style="width:100%;font-family:inherit;padding:8px;margin-bottom:14px">${esc(grammarLines.join('\n'))}</textarea>

          <button type="submit" class="btn-primary" style="padding:10px 20px">💾 Dars va Grammatikani saqlash</button>
        </form>
      </div>
    `;
  }
  function renderBooksTab() {
    let books = [];
    try {
      books = JSON.parse(localStorage.getItem('tt_books_override') || 'null');
    } catch(e){}
    if (!Array.isArray(books) || !books.length) {
      books = [
        { file: 'TURK TILI TURIZMDA.pdf', title: 'Turk tili turizmda', desc: 'Kasbiy turk tili' },
        { file: 'Turk tili.pdf', title: 'Turk tili', desc: 'Umumiy til ko‘nikmalari' },
        { file: 'Yabanci_Dilim_Turkce_1 (1).pdf', title: 'Yabancı Dilim Türkçe 1', desc: 'Boshlang‘ich daraja' },
        { file: 'yabancilar_icin_turkce_dilbilgisi_A1_A2_kurallar_ve_alistirmalar.pdf', title: 'Türkçe Dilbilgisi A1–A2', desc: 'Grammatika va mashqlar' }
      ];
    }

    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:12px">
        <div>
          <h2>Elektron kutubxona kitoblarini boshqarish</h2>
          <p class="muted">Platformadagi PDF qo‘llanmalar va kitoblarni tahrirlash yoki yangisini qo‘shish.</p>
        </div>
        <button class="btn-primary" onclick="openAddBookModal()">➕ Yangi kitob / PDF qo‘shish</button>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px">
        ${books.map((b, idx) => `
          <div class="card" style="border:1px solid #cbd5e1;background:#fff;display:flex;flex-direction:column">
            <span class="pill" style="align-self:flex-start">PDF QO‘LLANMA</span>
            <h3 style="margin:10px 0 6px">${esc(b.title)}</h3>
            <p class="muted" style="font-size:13px;margin:0 0 10px">${esc(b.desc || 'Amaliy qo‘llanma')}</p>
            <p style="font-size:12px;color:#087f8c;word-break:break-all">📁 Fayl: ${esc(b.file)}</p>
            <div style="display:flex;gap:8px;margin-top:auto;padding-top:12px;border-top:1px solid #e2e8f0;flex-wrap:wrap">
              <a href="${b.file.startsWith('http') ? esc(b.file) : 'assets/books/' + encodeURIComponent(b.file)}" target="_blank" class="btn-soft" style="font-size:12px;flex:1;text-align:center">Ko‘rish ↗</a>
              <button class="btn-soft" onclick="editBookItem(${idx})" style="font-size:12px;padding:4px 10px">✏️ Tahrirlash</button>
              <button class="btn-soft" onclick="deleteBookItem(${idx})" style="color:#bd4040;font-size:12px;padding:4px 10px">🗑 O‘chirish</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  function bindTabEvents() {
    const uploadForm = document.querySelector('#audio-upload-form');
    if (uploadForm) {
      uploadForm.onsubmit = async function(e) {
        e.preventDefault();
        const statusEl = document.querySelector('#upload-status');
        const uploadBtn = document.querySelector('#upload-btn');
        const fileInput = document.querySelector('#audio-file-input');

        if (!fileInput.files.length) {
          alert('Iltimos, avval audio faylni tanlang!');
          return;
        }

        const dayVal = document.querySelector('#upload-day').value;
        const typeVal = document.querySelector('#upload-type').value;
        const customNameVal = document.querySelector('#custom-audio-name')?.value;

        let finalName = '';
        if (typeVal === 'word') finalName = `${dayVal}.1.1`;
        else if (typeVal === 'phrase') finalName = `${dayVal}.2.1`;
        else if (typeVal === 'dialog_1') finalName = `${dayVal}.3.1`;
        else if (typeVal === 'dialog_2') finalName = `${dayVal}.3.2`;
        else if (typeVal === 'dialog_3') finalName = `${dayVal}.3.3`;
        else if (typeVal === 'dialog_4') finalName = `${dayVal}.3.4`;
        else if (typeVal === 'custom') finalName = customNameVal.trim() || `audio_${dayVal}_${Date.now()}`;

        const formData = new FormData();
        formData.append('audio', fileInput.files[0]);
        formData.append('day', dayVal);
        formData.append('type', typeVal);
        formData.append('customName', finalName);

        uploadBtn.disabled = true;
        statusEl.textContent = 'Yuklanmoqda... ⏳';
        statusEl.style.color = '#3b82f6';

        try {
          if (window.API && typeof API.uploadAudio === 'function') {
            const res = await API.uploadAudio(formData);
            if (res && res.ok) {
              statusEl.textContent = 'Muvaffaqiyatli yuklandi! ✓ 🎉';
              statusEl.style.color = '#10b981';
              alert(`Audio fayl muvaffaqiyatli yuklandi!\nFayl: ${res.filename}\nHavola: ${res.audioUrl}`);
              renderAdminStudio();
            } else {
              statusEl.textContent = 'Xato: ' + (res?.error || 'Noma’lum xato');
              statusEl.style.color = '#ef4444';
            }
          } else {
            statusEl.textContent = 'Backend server ulangan bo‘lishi lozim.';
            statusEl.style.color = '#ef4444';
          }
        } catch (err) {
          statusEl.textContent = 'Xato: ' + err.message;
          statusEl.style.color = '#ef4444';
        } finally {
          uploadBtn.disabled = false;
        }
      };
    }
  }
  window.updateAudioCustomName = function() {
    const typeVal = document.querySelector('#upload-type')?.value;
    const box = document.querySelector('#custom-name-box');
    if (box) box.style.display = typeVal === 'custom' ? 'block' : 'none';
  };

  window.updateAudioOptions = function() {
    selectedDay = parseInt(document.querySelector('#upload-day')?.value) || 1;
    renderAdminStudio();
  };
  window.quickUploadAudio = function(filename, type, day) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/mp3,audio/*';
    input.onchange = async () => {
      if (!input.files || !input.files[0]) return;
      const file = input.files[0];
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('day', day);
      formData.append('type', type);
      formData.append('customName', filename.replace(/\.mp3$/, ''));

      const statusEl = document.querySelector('#upload-status');
      if (statusEl) {
        statusEl.textContent = 'Yuklanmoqda... ⏳';
        statusEl.style.color = '#3b82f6';
      }

      try {
        if (window.API && typeof API.uploadAudio === 'function') {
          const res = await API.uploadAudio(formData);
          if (res && res.ok) {
            alert(`✅ "${filename}" fayli muvaffaqiyatli saqlandi!`);
            renderAdminStudio();
          } else {
            alert('Xatolik: ' + (res?.error || 'Yuklab bo‘lmadi'));
          }
        }
      } catch (e) {
        alert('Xatolik: ' + e.message);
      }
    };
    input.click();
  };
  window.handleDeleteAudio = async function(filename, day, type) {
    if (!confirm(`Haqiqatan ham "${filename}" audio faylini o‘chirmoqchimisiz?`)) return;
    try {
      if (window.API && typeof API.deleteAudio === 'function') {
        await API.deleteAudio(filename, day, type);
      } else {
        if (typeof window.removeUploadedAudio === 'function') {
          window.removeUploadedAudio(filename);
        }
      }
      alert(`"${filename}" audiosi muvaffaqiyatli o‘chirildi! ✓`);
      renderAdminStudio();
    } catch(e) {
      alert('O‘chirishda xatolik: ' + e.message);
    }
  };
  window.saveDialogChanges = async function(day, idx) {
    const title = document.querySelector(`#dialog-title-${idx}`)?.value?.trim() || '';
    const linesText = document.querySelector(`#dialog-lines-${idx}`)?.value || '';
    const lines = linesText.split('\n').map(l => l.trim()).filter(Boolean);
    const lesson = (window.LESSONS || [])[day - 1];
    if (lesson && lesson.dialogs && lesson.dialogs[idx]) {
      if (title) lesson.dialogs[idx].title = title;
      lesson.dialogs[idx].lines = lines;
      saveLessonsOverride();
      if (window.API && typeof API.saveDialog === 'function') {
        await API.saveDialog({
          day,
          order_num: idx + 1,
          title: lesson.dialogs[idx].title,
          lines,
          audio_url: `${day}.3.${idx + 1}.mp3`
        });
      }
      alert('Dialog muvaffaqiyatli saqlandi! ✓');
      renderAdminStudio();
    }
  };
  window.deleteDialogItem = async function(day, idx) {
    if (!confirm('Haqiqatan ham bu dialogni o‘chirmoqchimisiz?')) return;
    const lesson = (window.LESSONS || [])[day - 1];
    if (lesson && lesson.dialogs) {
      lesson.dialogs.splice(idx, 1);
      saveLessonsOverride();
      if (window.API && typeof API.deleteDialog === 'function') {
        await API.deleteDialog(day, idx + 1);
      }
      renderAdminStudio();
    }
  };
  window.openAddDialogModal = async function(day) {
    const title = prompt('Yangi dialog mavzusi (sarlavhasi)ni kiriting:');
    if (!title) return;
    const lesson = (window.LESSONS || [])[day - 1];
    if (lesson) {
      lesson.dialogs = lesson.dialogs || [];
      const newIdx = lesson.dialogs.length + 1;
      const newD = {
        title,
        lines: ['Personel: Merhaba, nasıl yardımcı olabilirim?', 'Misafir: Merhaba...']
      };
      lesson.dialogs.push(newD);
      saveLessonsOverride();
      if (window.API && typeof API.saveDialog === 'function') {
        await API.saveDialog({
          day,
          order_num: newIdx,
          title,
          lines: newD.lines,
          audio_url: `${day}.3.${newIdx}.mp3`
        });
      }
      renderAdminStudio();
    }
  };
  window.handleAddWord = async function(e, day) {
    e.preventDefault();
    const f = new FormData(e.target);
    const tr = f.get('tr').trim(), uz = f.get('uz').trim();
    if (!tr || !uz) return;
    const lesson = (window.LESSONS || [])[day - 1];
    if (lesson) {
      lesson.words = lesson.words || [];
      const num = lesson.words.length + 1;
      lesson.words.push([String(num), tr, uz]);
      saveLessonsOverride();
      if (window.API && typeof API.saveWord === 'function') {
        await API.saveWord({ day, order_num: num, turkish: tr, uzbek: uz });
      }
      renderAdminStudio();
    }
  };
  window.editWordItem = async function(day, idx) {
    const lesson = (window.LESSONS || [])[day - 1];
    if (!lesson || !lesson.words || !lesson.words[idx]) return;
    const w = lesson.words[idx];
    const newTr = prompt('Türkçe so‘z:', w[1]);
    if (newTr === null) return;
    const newUz = prompt('O‘zbekcha tarjimasi:', w[2]);
    if (newUz === null) return;
    w[1] = newTr.trim();
    w[2] = newUz.trim();
    saveLessonsOverride();
    if (window.API && typeof API.saveWord === 'function') {
      await API.saveWord({ day, order_num: idx + 1, turkish: w[1], uzbek: w[2] });
    }
    renderAdminStudio();
  };
  window.removeWord = async function(day, idx) {
    if (!confirm('Ushbu so‘zni o‘chirmoqchimisiz?')) return;
    const lesson = (window.LESSONS || [])[day - 1];
    if (lesson && lesson.words) {
      lesson.words.splice(idx, 1);
      lesson.words.forEach((w, i) => { w[0] = String(i + 1); });
      saveLessonsOverride();
      if (window.API && typeof API.deleteWord === 'function') {
        await API.deleteWord(day, idx + 1);
      }
      renderAdminStudio();
    }
  };
  window.handleAddPhrase = async function(e, day) {
    e.preventDefault();
    const f = new FormData(e.target);
    const tr = f.get('tr').trim(), uz = f.get('uz').trim();
    if (!tr || !uz) return;
    const lesson = (window.LESSONS || [])[day - 1];
    if (lesson) {
      lesson.phrases = lesson.phrases || [];
      const num = lesson.phrases.length + 1;
      lesson.phrases.push([String(num), tr, uz]);
      saveLessonsOverride();
      if (window.API && typeof API.savePhrase === 'function') {
        await API.savePhrase({ day, order_num: num, turkish: tr, uzbek: uz });
      }
      renderAdminStudio();
    }
  };
  window.editPhraseItem = async function(day, idx) {
    const lesson = (window.LESSONS || [])[day - 1];
    if (!lesson || !lesson.phrases || !lesson.phrases[idx]) return;
    const p = lesson.phrases[idx];
    const newTr = prompt('Türkçe ibora:', p[1]);
    if (newTr === null) return;
    const newUz = prompt('O‘zbekcha tarjimasi:', p[2]);
    if (newUz === null) return;
    p[1] = newTr.trim();
    p[2] = newUz.trim();
    saveLessonsOverride();
    if (window.API && typeof API.savePhrase === 'function') {
      await API.savePhrase({ day, order_num: idx + 1, turkish: p[1], uzbek: p[2] });
    }
    renderAdminStudio();
  };
  window.removePhrase = async function(day, idx) {
    if (!confirm('Ushbu iborani o‘chirmoqchimisiz?')) return;
    const lesson = (window.LESSONS || [])[day - 1];
    if (lesson && lesson.phrases) {
      lesson.phrases.splice(idx, 1);
      lesson.phrases.forEach((p, i) => { p[0] = String(i + 1); });
      saveLessonsOverride();
      if (window.API && typeof API.deletePhrase === 'function') {
        await API.deletePhrase(day, idx + 1);
      }
      renderAdminStudio();
    }
  };
  window.handleSaveLesson = async function(e, day) {
    e.preventDefault();
    const f = new FormData(e.target);
    const title = f.get('title').trim();
    const subtitle = f.get('subtitle').trim();
    const video_url = f.get('video_url').trim();
    const grammar = f.get('grammar').split('\n').map(l => l.trim()).filter(Boolean);

    const lesson = (window.LESSONS || [])[day - 1];
    if (lesson) {
      lesson.title = title;
      lesson.subtitle = subtitle;
      lesson.video = video_url;
      lesson.grammar = grammar;
      saveLessonsOverride();

      if (window.API && typeof API.saveLesson === 'function') {
        await Promise.all([
          API.saveLesson({ day, title, subtitle, video_url }),
          API.saveGrammar({ day, content: grammar })
        ]);
      }

      alert('Dars, matn va video havola muvaffaqiyatli saqlandi! ✓');
    }
  };
  window.openAddBookModal = function() {
    const title = prompt('Kitob sarlavhasi (masalan: Yangi Turizm Qo‘llanmasi):');
    if (!title) return;
    const desc = prompt('Kitob haqida qisqacha tavsif:', 'Amaliy turk tili darsligi') || '';
    const file = prompt('Fayl nomi yoki havolasi (masalan: kitob_nomi.pdf):', `${title.replace(/\s+/g, '_')}.pdf`);
    if (!file) return;

    let books = [];
    try {
      books = JSON.parse(localStorage.getItem('tt_books_override') || 'null');
    } catch(e){}
    if (!Array.isArray(books) || !books.length) {
      books = [
        { file: 'TURK TILI TURIZMDA.pdf', title: 'Turk tili turizmda', desc: 'Kasbiy turk tili' },
        { file: 'Turk tili.pdf', title: 'Turk tili', desc: 'Umumiy til ko‘nikmalari' },
        { file: 'Yabanci_Dilim_Turkce_1 (1).pdf', title: 'Yabancı Dilim Türkçe 1', desc: 'Boshlang‘ich daraja' },
        { file: 'yabancilar_icin_turkce_dilbilgisi_A1_A2_kurallar_ve_alistirmalar.pdf', title: 'Türkçe Dilbilgisi A1–A2', desc: 'Grammatika va mashqlar' }
      ];
    }
    books.push({ title, desc, file });
    try { localStorage.setItem('tt_books_override', JSON.stringify(books)); } catch(e){}
    alert(`"${title}" kitobi qo‘shildi!`);
    renderAdminStudio();
  };
  window.editBookItem = function(idx) {
    let books = [];
    try {
      books = JSON.parse(localStorage.getItem('tt_books_override') || 'null');
    } catch(e){}
    if (!Array.isArray(books) || !books.length) {
      books = [
        { file: 'TURK TILI TURIZMDA.pdf', title: 'Turk tili turizmda', desc: 'Kasbiy turk tili' },
        { file: 'Turk tili.pdf', title: 'Turk tili', desc: 'Umumiy til ko‘nikmalari' },
        { file: 'Yabanci_Dilim_Turkce_1 (1).pdf', title: 'Yabancı Dilim Türkçe 1', desc: 'Boshlang‘ich daraja' },
        { file: 'yabancilar_icin_turkce_dilbilgisi_A1_A2_kurallar_ve_alistirmalar.pdf', title: 'Türkçe Dilbilgisi A1–A2', desc: 'Grammatika va mashqlar' }
      ];
    }
    const b = books[idx];
    if (!b) return;
    const newTitle = prompt('Kitob sarlavhasi:', b.title);
    if (newTitle === null) return;
    const newDesc = prompt('Kitob tavsifi:', b.desc || '');
    if (newDesc === null) return;
    const newFile = prompt('Fayl nomi yoki internetdagi PDF havola:', b.file);
    if (newFile === null) return;

    b.title = newTitle.trim() || b.title;
    b.desc = newDesc.trim();
    b.file = newFile.trim() || b.file;

    try { localStorage.setItem('tt_books_override', JSON.stringify(books)); } catch(e){}
    alert('Kitob ma’lumotlari muvaffaqiyatli yangilandi! ✓');
    renderAdminStudio();
  };
  window.deleteBookItem = function(idx) {
    if (!confirm('Ushbu kitobni o‘chirmoqchimisiz?')) return;
    let books = [];
    try {
      books = JSON.parse(localStorage.getItem('tt_books_override') || 'null');
    } catch(e){}
    if (!Array.isArray(books) || !books.length) {
      books = [
        { file: 'TURK TILI TURIZMDA.pdf', title: 'Turk tili turizmda', desc: 'Kasbiy turk tili' },
        { file: 'Turk tili.pdf', title: 'Turk tili', desc: 'Umumiy til ko‘nikmalari' },
        { file: 'Yabanci_Dilim_Turkce_1 (1).pdf', title: 'Yabancı Dilim Türkçe 1', desc: 'Boshlang‘ich daraja' },
        { file: 'yabancilar_icin_turkce_dilbilgisi_A1_A2_kurallar_ve_alistirmalar.pdf', title: 'Türkçe Dilbilgisi A1–A2', desc: 'Grammatika va mashqlar' }
      ];
    }
    books.splice(idx, 1);
    try { localStorage.setItem('tt_books_override', JSON.stringify(books)); } catch(e){}
    renderAdminStudio();
  };
  window.openAddStudentModal = function() {
    const id = prompt('Yangi o‘quvchi logini (masalan: 8 xonali son yoki ism):');
    if (!id) return;
    const pw = prompt('Ushbu o‘quvchi uchun parol:');
    if (!pw) return;

    let accounts = [];
    try {
      accounts = JSON.parse(localStorage.getItem('tt_accounts_override') || 'null') || [];
    } catch(e){}
    if (!accounts.length) accounts = (window.DEMO_ACCOUNTS || []).map(a => ({ id: a[0], pw: a[1] }));
    accounts.unshift({ id, pw });
    try { localStorage.setItem('tt_accounts_override', JSON.stringify(accounts)); } catch(e){}
    if (window.API && typeof API.addStudent === 'function') {
      API.addStudent({ id, password: pw });
    }
    alert(`O‘quvchi qo‘shildi!\nLogin: ${id}\nParol: ${pw}`);
    renderAdminStudio();
  };

  window.filterStudentsList = function() {
    const q = (document.querySelector('#admin-search-input')?.value || '').toLowerCase();
    document.querySelectorAll('.student-row').forEach(el => {
      const text = (el.dataset.search || '').toLowerCase();
      el.hidden = !text.includes(q);
    });
  };
  try {
    if (typeof user !== 'undefined' && String(user || '').startsWith('admin:') && typeof view !== 'undefined' && view === 'admin') {
      window.admin();
    }
  } catch(e) {}
})();

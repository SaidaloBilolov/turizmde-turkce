require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_URL.includes('your-project-id')) {
  console.error('\n❌ XATOLIK: .env faylida SUPABASE_URL va SUPABASE_SERVICE_ROLE_KEY (yoki SUPABASE_ANON_KEY) ko‘rsatilmagan!');
  console.log('Iltimos, Supabase loyihangizdan kalitlarni olib, .env fayliga kiriting va qayta urinib ko‘ring:\n');
  console.log('npm run seed\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const window = {};
eval(fs.readFileSync(path.join(__dirname, '../data.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, '../accounts.js'), 'utf8'));
let videoLinks = [];
try {
  eval(fs.readFileSync(path.join(__dirname, '../videos.js'), 'utf8'));
  videoLinks = typeof HORDIQ_LINKS !== 'undefined' ? HORDIQ_LINKS : [];
} catch (e) {}

const lessons = window.LESSONS || [];
const demoAccounts = window.DEMO_ACCOUNTS || [];
const demoAdmins = window.DEMO_ADMINS || [];

async function main() {
  console.log('🚀 Supabase-ga ma’lumotlarni yuklash boshlanmoqda...');
  console.log(`📡 Supabase URL: ${SUPABASE_URL}\n`);
  console.log('📦 1. Supabase Storage: "audio" bucket tekshirilmoqda...');
  const { data: buckets, error: bError } = await supabase.storage.listBuckets();
  if (bError) {
    console.warn('⚠️ Bucketlar ro‘yxatini olishda ogohlantirish:', bError.message);
  } else {
    const audioBucket = buckets.find(b => b.name === 'audio');
    if (!audioBucket) {
      console.log('➕ "audio" nomli ommaviy bucket yaratilmoqda...');
      const { error: createErr } = await supabase.storage.createBucket('audio', { public: true });
      if (createErr) console.warn('⚠️ Bucket yaratish xatosi (agar oldin yaratilgan bo‘lsa e’tibor bermang):', createErr.message);
    } else {
      console.log('✅ "audio" bucketi mavjud.');
    }
  }
  console.log('\n🎧 2. Audio fayllarni Supabase Storage-ga yuklash...');
  const audioDir = path.join(__dirname, '../assets/audio');
  const uploadedAudios = {};

  if (fs.existsSync(audioDir)) {
    const audioFiles = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3'));
    console.log(`📁 Jami topilgan audio fayllar soni: ${audioFiles.length} ta.`);

    for (let i = 0; i < audioFiles.length; i++) {
      const file = audioFiles[i];
      const filePath = path.join(audioDir, file);
      const fileBuffer = fs.readFileSync(filePath);

      process.stdout.write(`   [${i + 1}/${audioFiles.length}] Yuklanmoqda: ${file}... `);

      const { data, error } = await supabase.storage
        .from('audio')
        .upload(file, fileBuffer, {
          contentType: 'audio/mpeg',
          upsert: true
        });

      if (error) {
        console.log(`❌ Xato: ${error.message}`);
      } else {
        const { data: urlData } = supabase.storage.from('audio').getPublicUrl(file);
        uploadedAudios[file] = urlData.publicUrl;
        console.log('✅ Tayyor');
      }
    }
  } else {
    console.warn('⚠️ assets/audio papkasi topilmadi!');
  }
  console.log('\n👥 3. Foydalanuvchilar va Adminlarni bazaga kiritish...');
  const userRows = [];
  for (const [id, pw] of demoAccounts) {
    userRows.push({
      id: String(id),
      password: String(pw),
      role: 'student',
      first_name: '',
      last_name: '',
      level: 'A1'
    });
  }
  for (const [id, pw] of demoAdmins) {
    userRows.push({
      id: String(id),
      password: String(pw),
      role: 'admin',
      first_name: 'Administrator',
      last_name: 'Turizmde Turkce',
      level: 'C2'
    });
  }

  const { error: usersError } = await supabase.from('users').upsert(userRows, { onConflict: 'id' });
  if (usersError) {
    console.error('❌ Users jadvaliga yozishda xatolik:', usersError.message);
  } else {
    console.log(`✅ ${userRows.length} ta foydalanuvchi va admin bazaga muvaffaqiyatli kiritildi.`);
  }
  console.log('\n📚 4. Darslar, so‘zlar, iboralar, dialoglar va grammatikani kiritish...');

  for (const l of lessons) {
    const day = l.day;
    const vUrl = videoLinks[day - 1] || l.video || '';
    const dUrl = l.document || `assets/materials/day${day}.docx`;
    const { error: lErr } = await supabase.from('lessons').upsert({
      day: day,
      title: l.title || `${day}-KUN`,
      subtitle: l.subtitle || '',
      video_url: vUrl,
      document_url: dUrl
    }, { onConflict: 'day' });

    if (lErr) console.error(`❌ ${day}-kun darsini kiritishda xatolik:`, lErr.message);
    if (Array.isArray(l.words) && l.words.length > 0) {
      await supabase.from('words').delete().eq('day', day);
      const wordAudioFile = `${day}.1.1.mp3`;
      const wordAudioUrl = uploadedAudios[wordAudioFile] || '';

      const wordRows = l.words.map((w, idx) => ({
        day: day,
        order_num: parseInt(w[0]) || (idx + 1),
        turkish: w[1] || '',
        uzbek: w[2] || '',
        audio_url: wordAudioUrl
      }));

      const { error: wErr } = await supabase.from('words').insert(wordRows);
      if (wErr) console.error(`❌ ${day}-kun so‘zlarini kiritishda xato:`, wErr.message);
    }
    if (Array.isArray(l.phrases) && l.phrases.length > 0) {
      await supabase.from('phrases').delete().eq('day', day);
      const phraseAudioFile = `${day}.2.1.mp3`;
      const phraseAudioUrl = uploadedAudios[phraseAudioFile] || '';

      const phraseRows = l.phrases.map((p, idx) => ({
        day: day,
        order_num: parseInt(p[0]) || (idx + 1),
        turkish: p[1] || '',
        uzbek: p[2] || '',
        audio_url: phraseAudioUrl
      }));

      const { error: pErr } = await supabase.from('phrases').insert(phraseRows);
      if (pErr) console.error(`❌ ${day}-kun iboralarini kiritishda xato:`, pErr.message);
    }
    if (Array.isArray(l.dialogs) && l.dialogs.length > 0) {
      await supabase.from('dialogs').delete().eq('day', day);

      const dialogRows = l.dialogs.map((d, idx) => {
        const dialogAudioFile = `${day}.3.${idx + 1}.mp3`;
        const dialogAudioUrl = uploadedAudios[dialogAudioFile] || '';
        return {
          day: day,
          order_num: idx + 1,
          title: d.title || `Diyalog ${idx + 1}`,
          lines: d.lines || [],
          audio_url: dialogAudioUrl
        };
      });

      const { error: dErr } = await supabase.from('dialogs').insert(dialogRows);
      if (dErr) console.error(`❌ ${day}-kun dialoglarini kiritishda xato:`, dErr.message);
    }
    if (Array.isArray(l.grammar) && l.grammar.length > 0) {
      await supabase.from('grammar').delete().eq('day', day);
      const { error: gErr } = await supabase.from('grammar').insert({
        day: day,
        content: l.grammar
      });
      if (gErr) console.error(`❌ ${day}-kun grammatikasini kiritishda xato:`, gErr.message);
    }

    process.stdout.write(`   ✓ ${day}-kun to‘liq yuklandi.\n`);
  }

  console.log('\n🎉 TABRIKLAYMIZ! Barcha 15 kunlik darslar, so‘zlar, dialoglar va audio fayllar Supabase-ga muvaffaqiyatli yuklandi!');
  console.log('Endi serverni ishga tushirishingiz mumkin: npm start');
}

main().catch(err => {
  console.error('\n❌ Kutilmagan xatolik yuz berdi:', err);
  process.exit(1);
});

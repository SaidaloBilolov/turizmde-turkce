/**
 * TURİZMDE TÜRKÇE — Server & Backend API
 * Node.js + Express + Supabase Integration + Multer Audio Uploader
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 1. Supabase Client sozlamalari
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
let supabase = null;

const isSupabaseConfigured = () => {
  return !!(SUPABASE_URL && SUPABASE_KEY && !SUPABASE_URL.includes('your-project-id'));
};

if (isSupabaseConfigured()) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('✅ Supabase muvaffaqiyatli ulandi:', SUPABASE_URL);
  } catch (e) {
    console.warn('⚠️ Supabase ulanish xatosi:', e.message);
  }
} else {
  console.log('ℹ️ Supabase .env sozlanmagan. Server mahalliy (fallback) rejimda ishlaydi.');
}

// 2. Multer — Audio va fayllarni yuklash uchun sozlamalar (xotira buferi)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB gacha audio
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/') || file.originalname.endsWith('.mp3') || file.originalname.endsWith('.wav')) {
      cb(null, true);
    } else {
      cb(new Error('Faqat audio (.mp3, .wav) fayllar yuklash mumkin!'));
    }
  }
});

// Mahalliy fallback ma'lumotlar
const getLocalData = () => {
  const win = {};
  try {
    eval(fs.readFileSync(path.join(__dirname, 'data.js'), 'utf8'));
    eval(fs.readFileSync(path.join(__dirname, 'accounts.js'), 'utf8'));
    return { lessons: win.LESSONS || [], accounts: win.DEMO_ACCOUNTS || [], admins: win.DEMO_ADMINS || [] };
  } catch (e) {
    return { lessons: [], accounts: [], admins: [] };
  }
};

// ==============================================================================
// API ENDPOINTS
// ==============================================================================

// Holatni tekshirish
app.get('/api/status', (req, res) => {
  res.json({
    ok: true,
    supabase: isSupabaseConfigured(),
    url: SUPABASE_URL || null,
    mode: isSupabaseConfigured() ? 'supabase' : 'local_fallback'
  });
});

// --- AUTHENTICATION ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { id, pw } = req.body;
    if (!id || !pw) return res.status(400).json({ error: 'Login va parol talab qilinadi' });

    if (supabase) {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id.trim())
        .eq('password', pw)
        .single();

      if (user && !error) {
        return res.json({
          ok: true,
          user: {
            id: user.id,
            role: user.role,
            profile: {
              first: user.first_name,
              last: user.last_name,
              age: user.age,
              email: user.email,
              level: user.level
            }
          }
        });
      }
    }

    // Fallback tekshiruv (local accounts.js)
    const { accounts, admins } = getLocalData();
    const isAdmin = admins.some(a => a[0] === id && a[1] === pw);
    if (isAdmin) {
      return res.json({
        ok: true,
        user: { id, role: 'admin', profile: { first: 'Administrator', last: 'Turizmde Turkce', level: 'C2' } }
      });
    }

    const isStudent = accounts.some(a => a[0] === id && a[1] === pw);
    if (isStudent) {
      return res.json({
        ok: true,
        user: { id, role: 'student', profile: null }
      });
    }

    return res.status(401).json({ error: 'Login yoki parol noto‘g‘ri' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Profilni yangilash
app.post('/api/profile', async (req, res) => {
  try {
    const { id, profile } = req.body;
    if (!id || !profile) return res.status(400).json({ error: 'Ma’lumot yetarli emas' });

    if (supabase) {
      const { error } = await supabase.from('users').upsert({
        id,
        first_name: profile.first || '',
        last_name: profile.last || '',
        age: parseInt(profile.age) || null,
        email: profile.email || '',
        level: profile.level || 'A1'
      });
      if (error) return res.status(500).json({ error: error.message });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DARSLAR (LESSONS) ---
app.get('/api/lessons', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('day', { ascending: true });

      if (!error && data && data.length > 0) {
        return res.json({ ok: true, lessons: data });
      }
    }

    // Fallback
    const { lessons } = getLocalData();
    res.json({
      ok: true,
      lessons: lessons.map(l => ({
        day: l.day,
        title: l.title,
        subtitle: l.subtitle,
        video_url: l.video,
        document_url: l.document
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Kunning to'liq ma'lumotlari (so'zlar, iboralar, dialoglar, grammatika)
app.get('/api/lessons/:day', async (req, res) => {
  try {
    const day = parseInt(req.params.day);
    if (!day) return res.status(400).json({ error: 'Noto‘g‘ri kun raqami' });

    if (supabase) {
      const [lRes, wRes, pRes, dRes, gRes] = await Promise.all([
        supabase.from('lessons').select('*').eq('day', day).single(),
        supabase.from('words').select('*').eq('day', day).order('order_num', { ascending: true }),
        supabase.from('phrases').select('*').eq('day', day).order('order_num', { ascending: true }),
        supabase.from('dialogs').select('*').eq('day', day).order('order_num', { ascending: true }),
        supabase.from('grammar').select('*').eq('day', day).maybeSingle()
      ]);

      if (lRes.data) {
        return res.json({
          ok: true,
          lesson: {
            day: lRes.data.day,
            title: lRes.data.title,
            subtitle: lRes.data.subtitle,
            video_url: lRes.data.video_url,
            document_url: lRes.data.document_url,
            words: (wRes.data || []).map(w => [String(w.order_num), w.turkish, w.uzbek, w.audio_url]),
            phrases: (pRes.data || []).map(p => [String(p.order_num), p.turkish, p.uzbek, p.audio_url]),
            dialogs: (dRes.data || []).map(d => ({
              id: d.id,
              title: d.title,
              lines: d.lines,
              audio_url: d.audio_url
            })),
            grammar: gRes.data?.content || []
          }
        });
      }
    }

    // Fallback: local data.js
    const { lessons } = getLocalData();
    const l = lessons.find(x => x.day === day);
    if (!l) return res.status(404).json({ error: 'Dars topilmadi' });

    res.json({ ok: true, lesson: l });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PROGRESS (O'ZLASHTIRISH) ---
app.get('/api/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (supabase) {
      const { data, error } = await supabase
        .from('progress')
        .select('day, step')
        .eq('user_id', userId);

      if (!error && data) {
        const done = {};
        data.forEach(p => {
          done[`${p.day}-${p.step}`] = true;
        });
        const completed = Object.keys(done).length;
        return res.json({
          ok: true,
          done,
          completed,
          percent: Math.round((completed / 60) * 100)
        });
      }
    }

    res.json({ ok: true, done: {}, completed: 0, percent: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/progress/step', async (req, res) => {
  try {
    const { userId, day, step } = req.body;
    if (!userId || day == null || step == null) {
      return res.status(400).json({ error: 'userId, day va step talab qilinadi' });
    }

    if (supabase) {
      const { error } = await supabase.from('progress').upsert({
        user_id: String(userId),
        day: parseInt(day),
        step: parseInt(step),
        completed: true,
        completed_at: new Date().toISOString()
      }, { onConflict: 'user_id,day,step' });

      if (error) return res.status(500).json({ error: error.message });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// ADMIN CMS ENDPOINTS (Yangi dars, audio, dialog, so'z qo'shish va boshqarish)
// ==============================================================================

// 1. Admin statistika ko'rinishi
app.get('/api/admin/overview', async (req, res) => {
  try {
    let studentCount = 0;
    let completedStudents = 0;
    let lessonsCount = 15;

    if (supabase) {
      const [uRes, pRes, lRes] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact' }).eq('role', 'student'),
        supabase.from('progress').select('user_id, day, step'),
        supabase.from('lessons').select('day', { count: 'exact' })
      ]);

      studentCount = uRes.count || 0;
      lessonsCount = lRes.count || 15;

      // 60 ta bosqichni tugatganlarni sanash
      const userProgressCount = {};
      (pRes.data || []).forEach(p => {
        userProgressCount[p.user_id] = (userProgressCount[p.user_id] || 0) + 1;
      });
      completedStudents = Object.values(userProgressCount).filter(cnt => cnt >= 60).length;
    } else {
      const { accounts, lessons } = getLocalData();
      studentCount = accounts.length;
      lessonsCount = lessons.length;
    }

    res.json({
      ok: true,
      stats: {
        totalStudents: studentCount,
        completedCertificates: completedStudents,
        totalLessons: lessonsCount
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. O'quvchilar ro'yxati va ularning progressi
app.get('/api/admin/students', async (req, res) => {
  try {
    if (supabase) {
      const { data: users, error: uErr } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (uErr) return res.status(500).json({ error: uErr.message });

      const { data: prog, error: pErr } = await supabase.from('progress').select('user_id, day, step');
      const userDone = {};
      (prog || []).forEach(p => {
        userDone[p.user_id] = (userDone[p.user_id] || 0) + 1;
      });

      const students = (users || []).map(u => ({
        id: u.id,
        first_name: u.first_name || '',
        last_name: u.last_name || '',
        email: u.email || '',
        level: u.level || 'A1',
        completed_steps: userDone[u.id] || 0,
        percent: Math.round(((userDone[u.id] || 0) / 60) * 100)
      }));

      return res.json({ ok: true, students });
    }

    // Fallback
    const { accounts } = getLocalData();
    res.json({
      ok: true,
      students: accounts.map(a => ({
        id: a[0],
        first_name: '',
        last_name: '',
        level: 'A1',
        completed_steps: 0,
        percent: 0
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Yangi o'quvchi qo'shish
app.post('/api/admin/students', async (req, res) => {
  try {
    const { id, password, first_name, last_name, level } = req.body;
    if (!id || !password) return res.status(400).json({ error: 'Login va parol talab qilinadi' });

    if (supabase) {
      const { error } = await supabase.from('users').upsert({
        id: id.trim(),
        password: password.trim(),
        role: 'student',
        first_name: first_name || '',
        last_name: last_name || '',
        level: level || 'A1'
      });
      if (error) return res.status(500).json({ error: error.message });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. O'quvchini o'chirish
app.delete('/api/admin/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (supabase) {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. AUDIO YUKLASH (Supabase Storage ga yuklaydi va to'g'ridan-to'g'ri havola beradi)
app.post('/api/admin/upload-audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio fayl tanlanmadi' });
    }

    const { day, type, targetId, customName } = req.body;
    const fileExt = path.extname(req.file.originalname) || '.mp3';
    const filename = customName
      ? `${customName}${fileExt}`
      : `audio_${Date.now()}_${Math.random().toString(36).substring(7)}${fileExt}`;

    let audioUrl = '';

    if (supabase) {
      // Supabase Storage-ga yuklash
      const { data, error } = await supabase.storage
        .from('audio')
        .upload(filename, req.file.buffer, {
          contentType: req.file.mimetype || 'audio/mpeg',
          upsert: true
        });

      if (error) {
        return res.status(500).json({ error: 'Supabase Storage xatosi: ' + error.message });
      }

      const { data: publicUrlData } = supabase.storage.from('audio').getPublicUrl(filename);
      audioUrl = publicUrlData.publicUrl;
    } else {
      // Fallback: local assets/audio ga saqlash
      const localAudioDir = path.join(__dirname, 'assets/audio');
      if (!fs.existsSync(localAudioDir)) fs.mkdirSync(localAudioDir, { recursive: true });
      fs.writeFileSync(path.join(localAudioDir, filename), req.file.buffer);
      audioUrl = `assets/audio/${filename}`;
    }

    // Agar ma'lum bir dars, dialog yoki so'zga bog'lash talab qilingan bo'lsa:
    if (supabase && targetId && type) {
      if (type === 'dialog') {
        await supabase.from('dialogs').update({ audio_url: audioUrl }).eq('id', targetId);
      } else if (type === 'word') {
        await supabase.from('words').update({ audio_url: audioUrl }).eq('id', targetId);
      } else if (type === 'phrase') {
        await supabase.from('phrases').update({ audio_url: audioUrl }).eq('id', targetId);
      }
    }

    res.json({
      ok: true,
      audioUrl,
      filename,
      message: 'Audio muvaffaqiyatli yuklandi!'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Darsni yaratish yoki tahrirlash (Lesson Save)
app.post('/api/admin/lessons', async (req, res) => {
  try {
    const { day, title, subtitle, video_url, document_url } = req.body;
    if (!day || !title) return res.status(400).json({ error: 'Kun raqami va sarlavha talab qilinadi' });

    if (supabase) {
      const { error } = await supabase.from('lessons').upsert({
        day: parseInt(day),
        title: title.trim(),
        subtitle: subtitle || '',
        video_url: video_url || '',
        document_url: document_url || ''
      }, { onConflict: 'day' });

      if (error) return res.status(500).json({ error: error.message });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Dialog qo'shish yoki tahrirlash
app.post('/api/admin/dialogs', async (req, res) => {
  try {
    const { id, day, order_num, title, lines, audio_url } = req.body;
    if (!day || !title) return res.status(400).json({ error: 'Kun raqami va dialog sarlavhasi kerak' });

    if (supabase) {
      const row = {
        day: parseInt(day),
        order_num: parseInt(order_num) || 1,
        title: title.trim(),
        lines: Array.isArray(lines) ? lines : (typeof lines === 'string' ? lines.split('\n').filter(Boolean) : []),
        audio_url: audio_url || ''
      };
      if (id) row.id = id;

      const { data, error } = await supabase.from('dialogs').upsert(row).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ ok: true, dialog: data });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/dialogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (supabase) {
      const { error } = await supabase.from('dialogs').delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. So'z qo'shish yoki tahrirlash
app.post('/api/admin/words', async (req, res) => {
  try {
    const { id, day, order_num, turkish, uzbek, audio_url } = req.body;
    if (!day || !turkish || !uzbek) return res.status(400).json({ error: 'Kun, turkcha so‘z va tarjima kerak' });

    if (supabase) {
      const row = {
        day: parseInt(day),
        order_num: parseInt(order_num) || 1,
        turkish: turkish.trim(),
        uzbek: uzbek.trim(),
        audio_url: audio_url || ''
      };
      if (id) row.id = id;

      const { data, error } = await supabase.from('words').upsert(row).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ ok: true, word: data });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/words/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (supabase) {
      const { error } = await supabase.from('words').delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Iboralar qo'shish yoki tahrirlash
app.post('/api/admin/phrases', async (req, res) => {
  try {
    const { id, day, order_num, turkish, uzbek, audio_url } = req.body;
    if (!day || !turkish || !uzbek) return res.status(400).json({ error: 'Kun, turkcha ibora va tarjima kerak' });

    if (supabase) {
      const row = {
        day: parseInt(day),
        order_num: parseInt(order_num) || 1,
        turkish: turkish.trim(),
        uzbek: uzbek.trim(),
        audio_url: audio_url || ''
      };
      if (id) row.id = id;

      const { data, error } = await supabase.from('phrases').upsert(row).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ ok: true, phrase: data });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/phrases/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (supabase) {
      const { error } = await supabase.from('phrases').delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Grammatika saqlash
app.post('/api/admin/grammar', async (req, res) => {
  try {
    const { day, content } = req.body;
    if (!day || !content) return res.status(400).json({ error: 'Kun va grammatika matnlari kerak' });

    if (supabase) {
      const lines = Array.isArray(content) ? content : content.split('\n').filter(Boolean);
      await supabase.from('grammar').delete().eq('day', day);
      const { error } = await supabase.from('grammar').insert({
        day: parseInt(day),
        content: lines
      });
      if (error) return res.status(500).json({ error: error.message });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// STATIK FAYLLAR VA FRONTEND
// ==============================================================================
app.use(express.static(__dirname));

// Barcha noma'lum so'rovlarni index.html ga yo'naltirish (SPA)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint topilmadi' });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serverni ishga tushirish
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 TURİZMDE TÜRKÇE serveri ishga tushdi!`);
  console.log(`🌐 Sayt manzili: http://localhost:${PORT}`);
  console.log(`📊 API holati: http://localhost:${PORT}/api/status`);
  console.log(`======================================================\n`);
});

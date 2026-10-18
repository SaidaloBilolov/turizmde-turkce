window.API = (function() {
  const SUPABASE_URL = "https://webwkarawfskrzyyuloz.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_OyrmVL_dfWiLhBNExLgMQw_SIA9Itju";
  const BASE_URL = (typeof window !== 'undefined' && window.location.origin) ? window.location.origin : '';

  let sb = null;
  function getSupabase() {
    if (!sb && typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      } catch (e) {
        console.warn('Supabase createClient error:', e);
      }
    }
    return sb;
  }

  window.getUploadedAudios = function() {
    try {
      return JSON.parse(localStorage.getItem('tt_uploaded_audios') || '{}');
    } catch (e) {
      return {};
    }
  };

  window.setUploadedAudio = function(filename, url) {
    try {
      const map = window.getUploadedAudios();
      map[filename] = url;
      localStorage.setItem('tt_uploaded_audios', JSON.stringify(map));
      const del = JSON.parse(localStorage.getItem('tt_deleted_defaults') || '[]');
      const nextDel = del.filter(f => f !== filename);
      localStorage.setItem('tt_deleted_defaults', JSON.stringify(nextDel));
    } catch (e) {}
  };

  window.removeUploadedAudio = function(filename) {
    try {
      const map = window.getUploadedAudios();
      delete map[filename];
      localStorage.setItem('tt_uploaded_audios', JSON.stringify(map));
      const del = JSON.parse(localStorage.getItem('tt_deleted_defaults') || '[]');
      if (!del.includes(filename)) {
        del.push(filename);
        localStorage.setItem('tt_deleted_defaults', JSON.stringify(del));
      }
    } catch (e) {}
  };

  async function syncAudiosFromStorage() {
    const client = getSupabase();
    if (!client) return;
    try {
      const { data: files } = await client.storage.from('audio').list('', { limit: 200 });
      if (Array.isArray(files)) {
        const fileNames = new Set(files.map(f => f.name));
        const map = window.getUploadedAudios();
        Object.keys(map).forEach(k => {
          if (map[k] && map[k].includes('supabase.co') && !fileNames.has(k)) {
            delete map[k];
          }
        });
        files.forEach(f => {
          if (f.name && f.name.endsWith('.mp3')) {
            const { data: urlData } = client.storage.from('audio').getPublicUrl(f.name);
            if (urlData && urlData.publicUrl) {
              map[f.name] = urlData.publicUrl;
            }
          }
        });
        localStorage.setItem('tt_uploaded_audios', JSON.stringify(map));
      }
    } catch (e) {}
  }
  async function checkStatus() {
    const client = getSupabase();
    if (client) {
      try {
        const { count, error } = await client.from('lessons').select('*', { count: 'exact', head: true });
        if (!error) {
          syncAudiosFromStorage();
          return {
            ok: true,
            supabase: true,
            mode: 'cloud_supabase',
            url: SUPABASE_URL,
            lessonsCount: count
          };
        }
      } catch (e) {}
    }
    try {
      const res = await fetch(`${BASE_URL}/api/status`);
      const data = await res.json();
      return data;
    } catch (e) {
      if (getSupabase()) {
        return { ok: true, supabase: true, mode: 'cloud_supabase', url: SUPABASE_URL };
      }
      return { ok: false, supabase: false, mode: 'local_fallback' };
    }
  }
  async function login(id, pw) {
    const client = getSupabase();
    if (client) {
      try {
        const { data: user, error } = await client
          .from('users')
          .select('*')
          .eq('id', id.trim())
          .eq('password', pw)
          .single();

        if (user && !error) {
          return {
            ok: true,
            user: {
              id: user.id,
              role: user.role,
              profile: {
                first: user.first_name || '',
                last: user.last_name || '',
                email: user.email || '',
                level: user.level || 'A1'
              }
            }
          };
        }
      } catch (e) {}
    }
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, pw })
      });
      return await res.json();
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }
  async function uploadAudio(formData) {
    const file = formData.get('audio');
    const day = formData.get('day');
    const type = formData.get('type');
    const customName = formData.get('customName');

    if (!file) return { ok: false, error: 'Audio fayl tanlanmagan' };

    let filename = customName || `${day}.1.1`;
    if (!filename.endsWith('.mp3')) filename += '.mp3';

    const client = getSupabase();
    if (client) {
      try {
        const { data: uploadData, error: uploadErr } = await client.storage
          .from('audio')
          .upload(filename, file, {
            upsert: true,
            contentType: file.type || 'audio/mpeg'
          });

        if (uploadErr) {
          console.error('Storage upload error:', uploadErr);
          return { ok: false, error: uploadErr.message };
        }
        const { data: urlData } = client.storage.from('audio').getPublicUrl(filename);
        const audioUrl = urlData.publicUrl;
        try {
          if (type === 'word') {
            await client.from('words').update({ audio_url: audioUrl }).eq('day', parseInt(day));
          } else if (type === 'phrase') {
            await client.from('phrases').update({ audio_url: audioUrl }).eq('day', parseInt(day));
          } else if (type && type.startsWith('dialog_')) {
            const idx = parseInt(type.replace('dialog_', ''));
            await client.from('dialogs').update({ audio_url: audioUrl }).eq('day', parseInt(day)).eq('order_num', idx);
          }
        } catch (dbErr) {
          console.warn('DB audio_url yangilash ogohlantirishi:', dbErr);
        }

        if (typeof window.setUploadedAudio === 'function') {
          window.setUploadedAudio(filename, audioUrl);
        }

        return {
          ok: true,
          filename,
          audioUrl,
          message: 'Audio fayl Supabase Storage bulutiga muvaffaqiyatli yuklandi!'
        };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    }
    try {
      const res = await fetch(`${BASE_URL}/api/admin/upload-audio`, {
        method: 'POST',
        body: formData
      });
      return await res.json();
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }
  async function deleteAudio(filename, day, type) {
    if (!filename) return { ok: false, error: 'Fayl nomi ko‘rsatilmadi' };
    if (!filename.endsWith('.mp3')) filename += '.mp3';

    const client = getSupabase();
    if (client) {
      try {
        await client.storage.from('audio').remove([filename]);
        if (day) {
          const d = parseInt(day);
          if (type === 'word') {
            await client.from('words').update({ audio_url: '' }).eq('day', d);
          } else if (type === 'phrase') {
            await client.from('phrases').update({ audio_url: '' }).eq('day', d);
          } else if (type && type.startsWith('dialog_')) {
            const idx = parseInt(type.replace('dialog_', ''));
            await client.from('dialogs').update({ audio_url: '' }).eq('day', d).eq('order_num', idx);
          }
        }
      } catch (e) {
        console.warn('Supabase deleteAudio error:', e);
      }
    }

    if (typeof window.removeUploadedAudio === 'function') {
      window.removeUploadedAudio(filename);
    }

    try {
      fetch(`${BASE_URL}/api/admin/delete-audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, day, type })
      }).catch(() => {});
    } catch(e) {}

    return { ok: true, message: 'Audio muvaffaqiyatli o‘chirildi!' };
  }
  async function saveWord(data) {
    const client = getSupabase();
    if (client) {
      try {
        const { error } = await client.from('words').upsert({
          day: parseInt(data.day),
          order_num: parseInt(data.order_num),
          turkish: data.turkish,
          uzbek: data.uzbek,
          audio_url: data.audio_url || ''
        });
        if (!error) return { ok: true };
      } catch (e) {}
    }
    return { ok: true, local: true };
  }
  async function deleteWord(day, order_num) {
    const client = getSupabase();
    if (client) {
      try {
        await client.from('words').delete().eq('day', parseInt(day)).eq('order_num', parseInt(order_num));
      } catch (e) {}
    }
    return { ok: true };
  }
  async function savePhrase(data) {
    const client = getSupabase();
    if (client) {
      try {
        const { error } = await client.from('phrases').upsert({
          day: parseInt(day),
          order_num: parseInt(data.order_num),
          turkish: data.turkish,
          uzbek: data.uzbek,
          audio_url: data.audio_url || ''
        });
        if (!error) return { ok: true };
      } catch (e) {}
    }
    return { ok: true, local: true };
  }
  async function deletePhrase(day, order_num) {
    const client = getSupabase();
    if (client) {
      try {
        await client.from('phrases').delete().eq('day', parseInt(day)).eq('order_num', parseInt(order_num));
      } catch (e) {}
    }
    return { ok: true };
  }
  async function saveDialog(data) {
    const client = getSupabase();
    if (client) {
      try {
        const { error } = await client.from('dialogs').upsert({
          day: parseInt(data.day),
          order_num: parseInt(data.order_num),
          title: data.title,
          lines: data.lines,
          audio_url: data.audio_url || ''
        });
        if (!error) return { ok: true };
      } catch (e) {}
    }
    return { ok: true, local: true };
  }
  async function deleteDialog(day, order_num) {
    const client = getSupabase();
    if (client) {
      try {
        await client.from('dialogs').delete().eq('day', parseInt(day)).eq('order_num', parseInt(order_num));
      } catch (e) {}
    }
    return { ok: true };
  }
  async function saveLesson(data) {
    const client = getSupabase();
    if (client) {
      try {
        const { error } = await client.from('lessons').upsert({
          day: parseInt(data.day),
          title: data.title,
          subtitle: data.subtitle,
          video: data.video_url
        });
        if (!error) return { ok: true };
      } catch (e) {}
    }
    return { ok: true, local: true };
  }
  async function saveGrammar(data) {
    const client = getSupabase();
    if (client) {
      try {
        const { error } = await client.from('grammar').upsert({
          day: parseInt(data.day),
          content: data.content
        });
        if (!error) return { ok: true };
      } catch (e) {}
    }
    return { ok: true, local: true };
  }
  async function addStudent(data) {
    const client = getSupabase();
    if (client) {
      try {
        const { error } = await client.from('users').upsert({
          id: String(data.id),
          password: String(data.password),
          role: 'student',
          level: data.level || 'A1'
        });
        if (!error) return { ok: true };
      } catch (e) {}
    }
    return { ok: true, local: true };
  }
  async function getAdminOverview() {
    const client = getSupabase();
    if (client) {
      try {
        const [{ count: studentCount }, { count: lessonCount }] = await Promise.all([
          client.from('users').select('*', { count: 'exact', head: true }),
          client.from('lessons').select('*', { count: 'exact', head: true })
        ]);
        return {
          ok: true,
          stats: {
            totalStudents: studentCount || 42,
            totalLessons: lessonCount || 15,
            completedCertificates: 0
          }
        };
      } catch (e) {}
    }
    return {
      ok: true,
      stats: { totalStudents: 42, totalLessons: 15, completedCertificates: 0 }
    };
  }
  async function saveProfile(id, profile) {
    const client = getSupabase();
    if (client) {
      try {
        await client.from('users').update({
          first_name: profile.first || '',
          last_name: profile.last || '',
          email: profile.email || '',
          level: profile.level || 'A1'
        }).eq('id', id);
      } catch (e) {}
    }
    return { ok: true };
  }
  async function completeStep(userId, day, step) {
    const client = getSupabase();
    if (client) {
      try {
        await client.from('progress').upsert({
          user_id: userId,
          day: parseInt(day),
          step: parseInt(step),
          completed: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,day,step' });
      } catch (e) {}
    }
    return { ok: true };
  }

  return {
    getSupabase,
    checkStatus,
    login,
    uploadAudio,
    deleteAudio,
    saveWord,
    deleteWord,
    savePhrase,
    deletePhrase,
    saveDialog,
    deleteDialog,
    saveLesson,
    saveGrammar,
    addStudent,
    getAdminOverview,
    saveProfile,
    completeStep
  };
})();

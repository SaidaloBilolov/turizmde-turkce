/**
 * TURİZMDE TÜRKÇE — Frontend API Client
 * Backend va Supabase bilan integratsiya qiladi.
 * Agar backend ishlamasa yoki offline bo'lsa, avtomatik ravishda mahalliy (data.js/localStorage) rejimga o'tadi.
 */

window.API = (function() {
  const BASE_URL = window.location.origin;

  async function request(endpoint, options = {}) {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        ...options
      });
      return await res.json();
    } catch (err) {
      console.warn(`API so‘rov xatosi (${endpoint}):`, err.message);
      return { ok: false, error: err.message, offline: true };
    }
  }

  return {
    // 1. Tizim holati
    async checkStatus() {
      return await request('/api/status');
    },

    // 2. Kirish (Login)
    async login(id, pw) {
      return await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ id, pw })
      });
    },

    // 3. Profilni saqlash
    async saveProfile(id, profile) {
      return await request('/api/profile', {
        method: 'POST',
        body: JSON.stringify({ id, profile })
      });
    },

    // 4. Darslar ro'yxati
    async getLessons() {
      return await request('/api/lessons');
    },

    // 5. Kunlik to'liq dars (so'zlar, dialoglar, audiolari bilan)
    async getLesson(day) {
      return await request(`/api/lessons/${day}`);
    },

    // 6. Progressni olish
    async getProgress(userId) {
      return await request(`/api/progress/${encodeURIComponent(userId)}`);
    },

    // 7. Bosqichni yakunlash
    async completeStep(userId, day, step) {
      return await request('/api/progress/step', {
        method: 'POST',
        body: JSON.stringify({ userId, day, step })
      });
    },

    // --- ADMIN CMS FUNKSIYALARI ---
    async getAdminOverview() {
      return await request('/api/admin/overview');
    },

    async getStudents() {
      return await request('/api/admin/students');
    },

    async addStudent(data) {
      return await request('/api/admin/students', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async deleteStudent(id) {
      return await request(`/api/admin/students/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    },

    // Audio yuklash (FormData)
    async uploadAudio(formData) {
      try {
        const res = await fetch(`${BASE_URL}/api/admin/upload-audio`, {
          method: 'POST',
          body: formData // Multer multipart/form-data
        });
        return await res.json();
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },

    // Darsni saqlash
    async saveLesson(lessonData) {
      return await request('/api/admin/lessons', {
        method: 'POST',
        body: JSON.stringify(lessonData)
      });
    },

    // Dialog saqlash
    async saveDialog(dialogData) {
      return await request('/api/admin/dialogs', {
        method: 'POST',
        body: JSON.stringify(dialogData)
      });
    },

    async deleteDialog(id) {
      return await request(`/api/admin/dialogs/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    },

    // So'z saqlash
    async saveWord(wordData) {
      return await request('/api/admin/words', {
        method: 'POST',
        body: JSON.stringify(wordData)
      });
    },

    async deleteWord(id) {
      return await request(`/api/admin/words/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    },

    // Ibora saqlash
    async savePhrase(phraseData) {
      return await request('/api/admin/phrases', {
        method: 'POST',
        body: JSON.stringify(phraseData)
      });
    },

    async deletePhrase(id) {
      return await request(`/api/admin/phrases/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    },

    // Grammatika saqlash
    async saveGrammar(grammarData) {
      return await request('/api/admin/grammar', {
        method: 'POST',
        body: JSON.stringify(grammarData)
      });
    }
  };
})();

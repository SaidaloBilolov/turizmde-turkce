-- ==============================================================================
-- TURİZMDE TÜRKÇE — SUPABASE DATABASE SCHEMA
-- Ushbu SQL kodini Supabase boshqaruv panelidagi "SQL Editor" bo'limida ishga tushiring.
-- ==============================================================================

-- 1. FOYDALANUVCHILAR JADVALI (Users & Admins)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,                       -- 8 xonali login yoki unikal ID
    password TEXT NOT NULL,                   -- Parol
    role TEXT NOT NULL DEFAULT 'student',      -- 'student' yoki 'admin'
    first_name TEXT DEFAULT '',
    last_name TEXT DEFAULT '',
    age INTEGER,
    email TEXT DEFAULT '',
    level TEXT DEFAULT 'A1',                  -- A1, A2, B1, B2, C1, C2
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DARSLAR JADVALI (Lessons - 15 kun va yangi qo'shiladigan kunlar)
CREATE TABLE IF NOT EXISTS public.lessons (
    day INTEGER PRIMARY KEY,                   -- 1, 2, 3, ...
    title TEXT NOT NULL,                       -- Dars nomi (masalan: OTEL VE KONAKLAMA HİZMETLERİ)
    subtitle TEXT DEFAULT '',                  -- Qisqacha izoh yoki kichik mavzu
    video_url TEXT DEFAULT '',                 -- YouTube video havola
    document_url TEXT DEFAULT '',              -- Word (.docx) qo'llanma havolasi
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SO'ZLAR JADVALI (Kelimeler)
CREATE TABLE IF NOT EXISTS public.words (
    id BIGSERIAL PRIMARY KEY,
    day INTEGER REFERENCES public.lessons(day) ON DELETE CASCADE,
    order_num INTEGER NOT NULL DEFAULT 1,
    turkish TEXT NOT NULL,
    uzbek TEXT NOT NULL,
    audio_url TEXT DEFAULT '',                 -- Alohida so'z audiosi yoki umumiy audio havola
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TAYYOR IBORALAR JADVALI (Hazır İfadeler)
CREATE TABLE IF NOT EXISTS public.phrases (
    id BIGSERIAL PRIMARY KEY,
    day INTEGER REFERENCES public.lessons(day) ON DELETE CASCADE,
    order_num INTEGER NOT NULL DEFAULT 1,
    turkish TEXT NOT NULL,
    uzbek TEXT NOT NULL,
    audio_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. JONLI DIALOGLAR JADVALI (Diyaloglar)
CREATE TABLE IF NOT EXISTS public.dialogs (
    id BIGSERIAL PRIMARY KEY,
    day INTEGER REFERENCES public.lessons(day) ON DELETE CASCADE,
    order_num INTEGER NOT NULL DEFAULT 1,
    title TEXT NOT NULL,                       -- Dialog mavzusi
    lines JSONB NOT NULL DEFAULT '[]'::jsonb,  -- Replika qatorlari (massiv)
    audio_url TEXT DEFAULT '',                 -- Supabase Storage dagi .mp3 havola
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. GRAMMATIKA JADVALI (Gramer)
CREATE TABLE IF NOT EXISTS public.grammar (
    id BIGSERIAL PRIMARY KEY,
    day INTEGER REFERENCES public.lessons(day) ON DELETE CASCADE,
    content JSONB NOT NULL DEFAULT '[]'::jsonb, -- Qoidalar va misollar (matnlar massivi)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PROGRESS VA NATIJALAR JADVALI (O'quvchilar o'zlashtirishi)
CREATE TABLE IF NOT EXISTS public.progress (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    day INTEGER NOT NULL,
    step INTEGER NOT NULL,                     -- 0: So'zlar, 1: Iboralar, 2: Dialoglar, 3: Grammatika
    completed BOOLEAN DEFAULT TRUE,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, day, step)
);

-- Tezkor qidiruv indekslari
CREATE INDEX IF NOT EXISTS idx_words_day ON public.words(day);
CREATE INDEX IF NOT EXISTS idx_phrases_day ON public.phrases(day);
CREATE INDEX IF NOT EXISTS idx_dialogs_day ON public.dialogs(day);
CREATE INDEX IF NOT EXISTS idx_progress_user ON public.progress(user_id);

-- ==============================================================================
-- 8. SUPABASE STORAGE BUCKETS (Audiolar va fayllar uchun)
-- ==============================================================================
-- 'audio' nomli ommaviy (public) bucket ochish:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 'materials' nomli ommaviy bucket ochish:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 'books' nomli ommaviy bucket ochish:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('books', 'books', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Bucketlar uchun xavfsizlik qoidalari (Hamma o'qiy olsin, fayllar erkin tinglansin):
DROP POLICY IF EXISTS "Public Audio Access" ON storage.objects;
CREATE POLICY "Public Audio Access" ON storage.objects FOR SELECT USING (bucket_id IN ('audio', 'materials', 'books'));

DROP POLICY IF EXISTS "Admin Upload Access" ON storage.objects;
CREATE POLICY "Admin Upload Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('audio', 'materials', 'books'));

DROP POLICY IF EXISTS "Admin Update Access" ON storage.objects;
CREATE POLICY "Admin Update Access" ON storage.objects FOR UPDATE USING (bucket_id IN ('audio', 'materials', 'books'));

DROP POLICY IF EXISTS "Admin Delete Access" ON storage.objects;
CREATE POLICY "Admin Delete Access" ON storage.objects FOR DELETE USING (bucket_id IN ('audio', 'materials', 'books'));

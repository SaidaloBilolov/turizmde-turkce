CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    first_name TEXT DEFAULT '',
    last_name TEXT DEFAULT '',
    age INTEGER,
    email TEXT DEFAULT '',
    level TEXT DEFAULT 'A1',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lessons (
    day INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT DEFAULT '',
    video_url TEXT DEFAULT '',
    document_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.words (
    id BIGSERIAL PRIMARY KEY,
    day INTEGER REFERENCES public.lessons(day) ON DELETE CASCADE,
    order_num INTEGER NOT NULL DEFAULT 1,
    turkish TEXT NOT NULL,
    uzbek TEXT NOT NULL,
    audio_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.phrases (
    id BIGSERIAL PRIMARY KEY,
    day INTEGER REFERENCES public.lessons(day) ON DELETE CASCADE,
    order_num INTEGER NOT NULL DEFAULT 1,
    turkish TEXT NOT NULL,
    uzbek TEXT NOT NULL,
    audio_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dialogs (
    id BIGSERIAL PRIMARY KEY,
    day INTEGER REFERENCES public.lessons(day) ON DELETE CASCADE,
    order_num INTEGER NOT NULL DEFAULT 1,
    title TEXT NOT NULL,
    lines JSONB NOT NULL DEFAULT '[]'::jsonb,
    audio_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.grammar (
    id BIGSERIAL PRIMARY KEY,
    day INTEGER REFERENCES public.lessons(day) ON DELETE CASCADE,
    content JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.progress (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    day INTEGER NOT NULL,
    step INTEGER NOT NULL,
    completed BOOLEAN DEFAULT TRUE,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, day, step)
);

CREATE INDEX IF NOT EXISTS idx_words_day ON public.words(day);
CREATE INDEX IF NOT EXISTS idx_phrases_day ON public.phrases(day);
CREATE INDEX IF NOT EXISTS idx_dialogs_day ON public.dialogs(day);
CREATE INDEX IF NOT EXISTS idx_progress_user ON public.progress(user_id);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('books', 'books', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Audio Access" ON storage.objects;
CREATE POLICY "Public Audio Access" ON storage.objects FOR SELECT USING (bucket_id IN ('audio', 'materials', 'books'));

DROP POLICY IF EXISTS "Admin Upload Access" ON storage.objects;
CREATE POLICY "Admin Upload Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('audio', 'materials', 'books'));

DROP POLICY IF EXISTS "Admin Update Access" ON storage.objects;
CREATE POLICY "Admin Update Access" ON storage.objects FOR UPDATE USING (bucket_id IN ('audio', 'materials', 'books'));

DROP POLICY IF EXISTS "Admin Delete Access" ON storage.objects;
CREATE POLICY "Admin Delete Access" ON storage.objects FOR DELETE USING (bucket_id IN ('audio', 'materials', 'books'));

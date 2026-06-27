-- PathWise V2 PostgreSQL Schema

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar TEXT,
    career_goal TEXT,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to profiles" 
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Allow users to update own profile" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow users to insert own profile" 
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);


-- 2. Roadmaps Table
CREATE TABLE IF NOT EXISTS public.roadmaps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    career TEXT NOT NULL,
    description TEXT,
    difficulty TEXT,
    entry_salary TEXT,
    mid_salary TEXT,
    senior_salary TEXT,
    average_salary TEXT,
    duration TEXT,
    job_growth TEXT,
    industry_outlook TEXT,
    resume_tips TEXT[] DEFAULT '{}',
    portfolio_suggestions TEXT[] DEFAULT '{}',
    keywords TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own roadmaps" 
    ON public.roadmaps FOR ALL USING (auth.uid() = user_id);


-- 3. Roadmap Steps (Milestones) Table
CREATE TABLE IF NOT EXISTS public.roadmap_steps (
    id TEXT NOT NULL, -- e.g. "fe_m1"
    roadmap_id UUID REFERENCES public.roadmaps(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    duration TEXT,
    skills TEXT[] DEFAULT '{}',
    tasks TEXT[] DEFAULT '{}',
    common_mistakes TEXT[] DEFAULT '{}',
    outcome TEXT,
    step_index INTEGER NOT NULL,
    PRIMARY KEY (roadmap_id, id)
);

ALTER TABLE public.roadmap_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access steps via roadmap" 
    ON public.roadmap_steps FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.roadmaps 
            WHERE public.roadmaps.id = public.roadmap_steps.roadmap_id 
            AND public.roadmaps.user_id = auth.uid()
        )
    );


-- 4. User Progress (Step completions) Table
CREATE TABLE IF NOT EXISTS public.progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    roadmap_id UUID REFERENCES public.roadmaps(id) ON DELETE CASCADE NOT NULL,
    step_id TEXT NOT NULL,
    completed BOOLEAN DEFAULT true,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, roadmap_id, step_id)
);

ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own progress records" 
    ON public.progress FOR ALL USING (auth.uid() = user_id);


-- 5. Recommended Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    roadmap_id UUID REFERENCES public.roadmaps(id) ON DELETE CASCADE NOT NULL,
    step_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    skills_used TEXT[] DEFAULT '{}',
    difficulty TEXT,
    time_est TEXT,
    github_inspiration TEXT,
    deployment_target TEXT,
    resume_impact TEXT,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own projects" 
    ON public.projects FOR ALL USING (auth.uid() = user_id);


-- 6. Study Sessions (Telemetry logs) Table
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    hours NUMERIC(4, 2) NOT NULL,
    milestone_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own study sessions" 
    ON public.study_sessions FOR ALL USING (auth.uid() = user_id);


-- 7. Chat History Table
CREATE TABLE IF NOT EXISTS public.chat_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    sender TEXT CHECK (sender IN ('user', 'mentor')) NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own chat histories" 
    ON public.chat_history FOR ALL USING (auth.uid() = user_id);


-- 8. Resume Scores Table
CREATE TABLE IF NOT EXISTS public.resume_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    ats_score INTEGER NOT NULL,
    match_pct INTEGER NOT NULL,
    matched_skills TEXT[] DEFAULT '{}',
    missing_skills TEXT[] DEFAULT '{}',
    suggestions TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.resume_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own resume scores" 
    ON public.resume_scores FOR ALL USING (auth.uid() = user_id);


-- 9. GitHub Scores Table
CREATE TABLE IF NOT EXISTS public.github_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    username TEXT NOT NULL,
    score TEXT NOT NULL,
    repos_count INTEGER DEFAULT 0,
    stars_count INTEGER DEFAULT 0,
    languages TEXT[] DEFAULT '{}',
    recommendations TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.github_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own github scores" 
    ON public.github_scores FOR ALL USING (auth.uid() = user_id);


-- 10. Achievements Table (Unlocked badges)
CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT NOT NULL, -- e.g. "first_step"
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY(user_id, id)
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own achievements" 
    ON public.achievements FOR ALL USING (auth.uid() = user_id);


-- 11. Certifications Saved
CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    cost TEXT,
    duration TEXT,
    badge TEXT,
    url TEXT,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own certifications" 
    ON public.certifications FOR ALL USING (auth.uid() = user_id);

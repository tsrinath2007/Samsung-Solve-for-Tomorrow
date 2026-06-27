import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

export interface Milestone {
  id: string;
  title: string;
  description: string;
  duration: string;
  skills: string[];
  projects: {
    title: string;
    description: string;
    skillsUsed: string[];
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    timeEst: string;
    githubInspiration?: string;
    deploymentTarget?: string;
    resumeImpact: string;
  }[];
  tasks: string[];
  commonMistakes: string[];
  outcome: string;
  resources: {
    title: string;
    platform: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    duration: string;
    rating: number;
    url: string;
  }[];
  certifications?: {
    name: string;
    provider: string;
    duration: string;
    difficulty: string;
    recognition: string;
    cost: string;
    badge: string;
    url: string;
  }[];
}

export interface RoadmapData {
  career: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  expectedSalary: {
    entry: string;
    mid: string;
    senior: string;
    average: string;
  };
  duration: string;
  jobGrowth: string;
  industryOutlook: string;
  milestones: Milestone[];
  interviewTopics: {
    category: 'Technical' | 'Coding' | 'System Design' | 'Behavioral';
    question: string;
    hints: string[];
    expectedAnswer: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
  }[];
  resumeTips: string[];
  portfolioSuggestions: string[];
  keywords: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
  unlockedAt?: string;
}

export interface StudySession {
  date: string;
  hours: number;
  milestoneId?: string;
}

export interface UserProfile {
  name: string;
  goal: string;
  xp: number;
  level: number;
  avatar?: string;
  email?: string;
}

export interface AppSettings {
  openAiKey: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  mockMode: boolean;
}

interface RoadmapContextType {
  careerGoal: string;
  roadmap: RoadmapData | null;
  isGenerating: boolean;
  completedNodes: string[];
  notes: Record<string, string>;
  studyHistory: StudySession[];
  streak: number;
  studyHours: number;
  achievements: Achievement[];
  userProfile: UserProfile;
  settings: AppSettings;
  savedRoadmaps: { goal: string; date: string; progress: number; roadmap: RoadmapData }[];
  generateRoadmap: (goal: string) => Promise<boolean>;
  toggleNodeCompletion: (nodeId: string) => void;
  saveNodeNote: (nodeId: string, note: string) => void;
  addStudyHours: (hours: number, milestoneId?: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  deleteSavedRoadmap: (goal: string) => void;
  loadSavedRoadmap: (goal: string) => void;
}

const defaultAchievements: Achievement[] = [
  { id: 'first_step', title: 'First Milestone', description: 'Complete your first learning node', unlocked: false, icon: '🎯' },
  { id: 'streak_3', title: 'Habit Builder', description: 'Study for 3 consecutive days', unlocked: false, icon: '🔥' },
  { id: 'master_tech', title: 'Tech Wizard', description: 'Unlock 5 different skills', unlocked: false, icon: '🧙‍♂️' },
  { id: 'interview_ready', title: 'Interview Ready', description: 'Practice 5 interview questions', unlocked: false, icon: '💼' },
  { id: 'portfolio_done', title: 'Creator', description: 'Build your first recommended project', unlocked: false, icon: '🚀' },
  { id: 'dream_job', title: 'Become Anything', description: 'Complete an entire learning roadmap', unlocked: false, icon: '👑' },
];

const defaultProfile: UserProfile = {
  name: 'Career Pathfinder',
  goal: '',
  xp: 0,
  level: 1,
  avatar: '',
  email: '',
};

const defaultSettings: AppSettings = {
  openAiKey: '',
  supabaseUrl: '',
  supabaseAnonKey: '',
  mockMode: true,
};

const RoadmapContext = createContext<RoadmapContextType | undefined>(undefined);

export const RoadmapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [careerGoal, setCareerGoal] = useState<string>('');
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [completedNodes, setCompletedNodes] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [studyHistory, setStudyHistory] = useState<StudySession[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [studyHours, setStudyHours] = useState<number>(0);
  const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements);
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [savedRoadmaps, setSavedRoadmaps] = useState<{ goal: string; date: string; progress: number; roadmap: RoadmapData }[]>([]);

  // Load state from LocalStorage on mount (fallback defaults)
  useEffect(() => {
    const localGoal = localStorage.getItem('pw_careerGoal');
    const localRoadmap = localStorage.getItem('pw_roadmap');
    const localCompleted = localStorage.getItem('pw_completedNodes');
    const localNotes = localStorage.getItem('pw_notes');
    const localHistory = localStorage.getItem('pw_studyHistory');
    const localStreak = localStorage.getItem('pw_streak');
    const localHours = localStorage.getItem('pw_studyHours');
    const localAchievements = localStorage.getItem('pw_achievements');
    const localProfile = localStorage.getItem('pw_profile');
    const localSettings = localStorage.getItem('pw_settings');
    const localSaved = localStorage.getItem('pw_savedRoadmaps');

    if (localGoal) setCareerGoal(localGoal);
    if (localRoadmap) setRoadmap(JSON.parse(localRoadmap));
    if (localCompleted) setCompletedNodes(JSON.parse(localCompleted));
    if (localNotes) setNotes(JSON.parse(localNotes));
    if (localHistory) setStudyHistory(JSON.parse(localHistory));
    if (localStreak) setStreak(parseInt(localStreak) || 0);
    if (localHours) setStudyHours(parseFloat(localHours) || 0);
    if (localAchievements) setAchievements(JSON.parse(localAchievements));
    if (localProfile) setUserProfile(JSON.parse(localProfile));
    if (localSettings) setSettings(JSON.parse(localSettings));
    if (localSaved) setSavedRoadmaps(JSON.parse(localSaved));
  }, []);

  // Supabase Auth and Table synchronizer
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const syncUserData = async () => {
      const { data: { session } } = await supabase!.auth.getSession();
      if (!session || !session.user) return;

      const user = session.user;
      
      // 1. Fetch Profile or Create new Public profile
      const { data: dbProfile, error: getErr } = await supabase!
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (getErr || !dbProfile) {
        // Insert new profile
        const newProfile = {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata.full_name || 'Career Pathfinder',
          avatar: user.user_metadata.avatar_url || '',
          career_goal: '',
          xp: 0,
          level: 1
        };
        await supabase!.from('profiles').insert(newProfile);
        setUserProfile({
          name: newProfile.name,
          email: newProfile.email,
          avatar: newProfile.avatar,
          goal: '',
          xp: 0,
          level: 1
        });
      } else {
        // Hydrate from DB
        setUserProfile({
          name: dbProfile.name || 'Career Pathfinder',
          email: dbProfile.email || '',
          avatar: dbProfile.avatar || '',
          goal: dbProfile.career_goal || '',
          xp: dbProfile.xp || 0,
          level: dbProfile.level || 1
        });
      }

      // 2. Fetch Roadmaps list
      const { data: dbRoadmaps } = await supabase!
        .from('roadmaps')
        .select('*');
        
      if (dbRoadmaps && dbRoadmaps.length > 0) {
        // Hydrate active and saved lists
        const active = dbRoadmaps[0];
        setCareerGoal(active.career);
        setRoadmap({
          career: active.career,
          description: active.description || '',
          difficulty: active.difficulty || 'Intermediate',
          expectedSalary: {
            entry: active.entry_salary || '$60,000',
            mid: active.mid_salary || '$95,000',
            senior: active.senior_salary || '$140,000',
            average: active.average_salary || '$98,000'
          },
          duration: active.duration || '6 Months',
          jobGrowth: active.job_growth || '+18%',
          industryOutlook: active.industry_outlook || '',
          milestones: [],
          interviewTopics: [],
          resumeTips: active.resume_tips || [],
          portfolioSuggestions: active.portfolio_suggestions || [],
          keywords: active.keywords || []
        });

        // Pull steps
        const { data: dbSteps } = await supabase!
          .from('roadmap_steps')
          .select('*')
          .eq('roadmap_id', active.id)
          .order('step_index');

        if (dbSteps) {
          setRoadmap(prev => {
            if (!prev) return null;
            return {
              ...prev,
              milestones: dbSteps.map((s: any) => ({
                id: s.id,
                title: s.title,
                description: s.description || '',
                duration: s.duration || '',
                skills: s.skills || [],
                projects: [],
                tasks: s.tasks || [],
                commonMistakes: s.common_mistakes || [],
                outcome: s.outcome || '',
                resources: []
              }))
            };
          });
        }
      }

      // 3. Fetch Completed Milestones
      const { data: dbCompletions } = await supabase!
        .from('progress')
        .select('*')
        .eq('user_id', user.id);

      if (dbCompletions) {
        setCompletedNodes(dbCompletions.map((c: any) => c.step_id));
      }

      // 4. Fetch achievements
      const { data: dbAchievements } = await supabase!
        .from('achievements')
        .select('*')
        .eq('user_id', user.id);

      if (dbAchievements) {
        setAchievements(prev => 
          prev.map(ach => ({
            ...ach,
            unlocked: dbAchievements.some((a: any) => a.id === ach.id)
          }))
        );
      }
    };

    syncUserData();
  }, [isSupabaseConfigured]);

  // Save to LocalStorage helpers
  const saveState = (key: string, val: any) => {
    localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
  };

  const updateProfileXP = async (xpGained: number) => {
    setUserProfile((prev) => {
      const newXp = prev.xp + xpGained;
      const nextLevelXp = prev.level * 1000;
      let newLevel = prev.level;
      if (newXp >= nextLevelXp) {
        newLevel += 1;
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#38BDF8', '#7C3AED', '#22D3EE'],
        });
      }
      const updated = { ...prev, xp: newXp, level: newLevel };
      saveState('pw_profile', updated);

      // Cloud Sync
      if (isSupabaseConfigured) {
        supabase!.auth.getSession().then(({ data: { session } }: any) => {
          if (session?.user) {
            supabase!
              .from('profiles')
              .update({ xp: newXp, level: newLevel })
              .eq('id', session.user.id)
              .then();
          }
        });
      }

      return updated;
    });
  };

  const triggerAchievement = async (id: string) => {
    setAchievements((prev) => {
      const updated = prev.map((ach) => {
        if (ach.id === id && !ach.unlocked) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.8 },
            colors: ['#10B981', '#38BDF8', '#F59E0B'],
          });

          // Cloud Sync
          if (isSupabaseConfigured) {
            supabase!.auth.getSession().then(({ data: { session } }: any) => {
              if (session?.user) {
                supabase!
                  .from('achievements')
                  .insert({ id, user_id: session.user.id })
                  .then();
              }
            });
          }

          return { ...ach, unlocked: true, unlockedAt: new Date().toISOString() };
        }
        return ach;
      });
      saveState('pw_achievements', updated);
      return updated;
    });
  };

  const generateRoadmap = async (goal: string): Promise<boolean> => {
    setIsGenerating(true);
    setCareerGoal(goal);
    saveState('pw_careerGoal', goal);

    try {
      // Dynamic import
      const { generateAIRoadmap } = await import('../services/aiService');
      const response = await generateAIRoadmap(goal, settings.openAiKey);
      
      setRoadmap(response);
      saveState('pw_roadmap', response);

      // Save to lists
      setSavedRoadmaps((prev) => {
        const filtered = prev.filter((r) => r.goal.toLowerCase() !== goal.toLowerCase());
        const updated = [
          { goal, date: new Date().toLocaleDateString(), progress: 0, roadmap: response },
          ...filtered,
        ];
        saveState('pw_savedRoadmaps', updated);
        return updated;
      });

      // Clear completions
      setCompletedNodes([]);
      saveState('pw_completedNodes', []);
      
      setUserProfile(prev => {
        const updated = { ...prev, goal };
        saveState('pw_profile', updated);
        return updated;
      });

      // Cloud Sync Roadmap
      if (isSupabaseConfigured) {
        const { data: { session } } = await supabase!.auth.getSession();
        if (session?.user) {
          // Insert Roadmap
          const { data: dbRoadmap } = await supabase!
            .from('roadmaps')
            .insert({
              user_id: session.user.id,
              career: response.career,
              description: response.description,
              difficulty: response.difficulty,
              entry_salary: response.expectedSalary.entry,
              mid_salary: response.expectedSalary.mid,
              senior_salary: response.expectedSalary.senior,
              average_salary: response.expectedSalary.average,
              duration: response.duration,
              job_growth: response.jobGrowth,
              industry_outlook: response.industryOutlook,
              resume_tips: response.resumeTips,
              portfolio_suggestions: response.portfolioSuggestions,
              keywords: response.keywords
            })
            .select()
            .single();

          if (dbRoadmap) {
            // Insert Roadmap Steps
            const stepsToInsert = response.milestones.map((m, idx) => ({
              id: m.id,
              roadmap_id: dbRoadmap.id,
              title: m.title,
              description: m.description,
              duration: m.duration,
              skills: m.skills,
              tasks: m.tasks,
              common_mistakes: m.commonMistakes,
              outcome: m.outcome,
              step_index: idx
            }));
            await supabase!.from('roadmap_steps').insert(stepsToInsert);
          }

          // Update profile target
          await supabase!
            .from('profiles')
            .update({ career_goal: response.career })
            .eq('id', session.user.id);
        }
      }

      setIsGenerating(false);
      return true;
    } catch (error) {
      console.error('Generation failed', error);
      setIsGenerating(false);
      return false;
    }
  };

  const toggleNodeCompletion = async (nodeId: string) => {
    if (!roadmap) return;
    
    let isCompleted = false;
    setCompletedNodes((prev) => {
      const exists = prev.includes(nodeId);
      let updated;
      if (exists) {
        updated = prev.filter((id) => id !== nodeId);
      } else {
        updated = [...prev, nodeId];
        isCompleted = true;
      }
      saveState('pw_completedNodes', updated);

      // Update saved lists
      setSavedRoadmaps((prevSaved) => {
        const updatedSaved = prevSaved.map((sr) => {
          if (sr.goal.toLowerCase() === roadmap.career.toLowerCase()) {
            const pct = Math.round((updated.length / roadmap.milestones.length) * 100);
            return { ...sr, progress: pct };
          }
          return sr;
        });
        saveState('pw_savedRoadmaps', updatedSaved);
        return updatedSaved;
      });

      // Cloud Sync completed node
      if (isSupabaseConfigured) {
        supabase!.auth.getSession().then(({ data: { session } }: any) => {
          if (session?.user) {
            if (isCompleted) {
              // Get active roadmap uuid from db first
              supabase!
                .from('roadmaps')
                .select('id')
                .eq('user_id', session.user.id)
                .eq('career', roadmap.career)
                .single()
                .then(({ data: dbRd }: any) => {
                  if (dbRd) {
                    supabase!
                      .from('progress')
                      .insert({ user_id: session.user.id, roadmap_id: dbRd.id, step_id: nodeId })
                      .then();
                  }
                });
            } else {
              supabase!
                .from('progress')
                .delete()
                .eq('user_id', session.user.id)
                .eq('step_id', nodeId)
                .then();
            }
          }
        });
      }

      return updated;
    });

    if (isCompleted) {
      updateProfileXP(250);
      triggerAchievement('first_step');

      // Send email notification to user profile email via Resend
      const completedMilestone = roadmap.milestones.find(m => m.id === nodeId);
      if (userProfile.email && completedMilestone) {
        import('../services/emailService').then(({ sendMilestoneEmail }) => {
          sendMilestoneEmail(
            userProfile.email!,
            userProfile.name,
            roadmap.career,
            completedMilestone.title
          );
        });
      }

      // Check all complete
      const totalSteps = roadmap.milestones.map(m => m.id);
      const isFinished = totalSteps.every(id => id === nodeId || completedNodes.includes(id));
      if (isFinished) {
        triggerAchievement('dream_job');
      }

      // Check 5 complete
      if (completedNodes.length + 1 >= 5) {
        triggerAchievement('master_tech');
      }
    }
  };

  const saveNodeNote = (nodeId: string, note: string) => {
    setNotes((prev) => {
      const updated = { ...prev, [nodeId]: note };
      saveState('pw_notes', updated);
      return updated;
    });
  };

  const addStudyHours = (hours: number, milestoneId?: string) => {
    const today = new Date().toLocaleDateString();
    setStudyHours((prev) => {
      const updated = prev + hours;
      saveState('pw_studyHours', updated);
      return updated;
    });

    setStudyHistory((prev) => {
      const updated = [...prev, { date: today, hours, milestoneId }];
      saveState('pw_studyHistory', updated);
      return updated;
    });

    updateProfileXP(Math.round(hours * 50));

    // Cloud Sync study session
    if (isSupabaseConfigured) {
      supabase!.auth.getSession().then(({ data: { session } }: any) => {
        if (session?.user) {
          supabase!
            .from('study_sessions')
            .insert({ user_id: session.user.id, hours, milestone_id: milestoneId })
            .then();
        }
      });
    }

    // Streak logic
    const lastActive = localStorage.getItem('pw_lastActiveDate');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString();

    if (lastActive === yesterdayStr) {
      setStreak((prev) => {
        const next = prev + 1;
        saveState('pw_streak', next);
        if (next >= 3) triggerAchievement('streak_3');
        return next;
      });
    } else if (lastActive !== today) {
      setStreak(1);
      saveState('pw_streak', 1);
    }
    
    localStorage.setItem('pw_lastActiveDate', today);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveState('pw_settings', updated);
      return updated;
    });
  };

  const updateProfile = (newProfile: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const updated = { ...prev, ...newProfile };
      saveState('pw_profile', updated);
      return updated;
    });
  };

  const deleteSavedRoadmap = (goal: string) => {
    setSavedRoadmaps((prev) => {
      const updated = prev.filter((r) => r.goal.toLowerCase() !== goal.toLowerCase());
      saveState('pw_savedRoadmaps', updated);
      return updated;
    });
  };

  const loadSavedRoadmap = (goal: string) => {
    const saved = savedRoadmaps.find((r) => r.goal.toLowerCase() === goal.toLowerCase());
    if (saved) {
      setCareerGoal(saved.goal);
      setRoadmap(saved.roadmap);
      saveState('pw_careerGoal', saved.goal);
      saveState('pw_roadmap', saved.roadmap);
    }
  };

  return (
    <RoadmapContext.Provider
      value={{
        careerGoal,
        roadmap,
        isGenerating,
        completedNodes,
        notes,
        studyHistory,
        streak,
        studyHours,
        achievements,
        userProfile,
        settings,
        savedRoadmaps,
        generateRoadmap,
        toggleNodeCompletion,
        saveNodeNote,
        addStudyHours,
        updateSettings,
        updateProfile,
        deleteSavedRoadmap,
        loadSavedRoadmap,
      }}
    >
      {children}
    </RoadmapContext.Provider>
  );
};

export const useRoadmap = () => {
  const context = useContext(RoadmapContext);
  if (!context) {
    throw new Error('useRoadmap must be used within a RoadmapProvider');
  }
  return context;
};

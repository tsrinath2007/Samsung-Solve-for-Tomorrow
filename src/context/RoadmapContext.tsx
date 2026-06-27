import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

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

  // Load state from LocalStorage on mount
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

  // Save to LocalStorage helpers
  const saveState = (key: string, val: any) => {
    localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val));
  };

  const updateProfileXP = (xpGained: number) => {
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
      return updated;
    });
  };

  const triggerAchievement = (id: string) => {
    setAchievements((prev) => {
      const updated = prev.map((ach) => {
        if (ach.id === id && !ach.unlocked) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.8 },
            colors: ['#10B981', '#38BDF8', '#F59E0B'],
          });
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
      // Import dynamic service to avoid circular references
      const { generateAIRoadmap } = await import('../services/aiService');
      const response = await generateAIRoadmap(goal, settings.openAiKey);
      
      setRoadmap(response);
      saveState('pw_roadmap', response);

      // Save to saved list
      setSavedRoadmaps((prev) => {
        const filtered = prev.filter((r) => r.goal.toLowerCase() !== goal.toLowerCase());
        const updated = [
          { goal, date: new Date().toLocaleDateString(), progress: 0, roadmap: response },
          ...filtered,
        ];
        saveState('pw_savedRoadmaps', updated);
        return updated;
      });

      // Reset milestones completion for new goal
      setCompletedNodes([]);
      saveState('pw_completedNodes', []);
      
      setUserProfile(prev => {
        const updated = { ...prev, goal };
        saveState('pw_profile', updated);
        return updated;
      });

      setIsGenerating(false);
      return true;
    } catch (error) {
      console.error('Generation failed', error);
      setIsGenerating(false);
      return false;
    }
  };

  const toggleNodeCompletion = (nodeId: string) => {
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

      // Update saved roadmaps progress
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

      return updated;
    });

    if (isCompleted) {
      updateProfileXP(250); // 250 XP per step completed
      triggerAchievement('first_step');

      // Check if all steps completed
      const totalSteps = roadmap.milestones.map(m => m.id);
      const isFinished = totalSteps.every(id => id === nodeId || completedNodes.includes(id));
      if (isFinished) {
        triggerAchievement('dream_job');
      }

      // Check for skill completions
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

    updateProfileXP(Math.round(hours * 50)); // 50 XP per hour studied

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
      
      // Load completed nodes for this specific roadmap if saved
      // For simplicity, we keep active completed nodes
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

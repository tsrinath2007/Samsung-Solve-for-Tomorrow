import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
  User, 
  Award, 
  Key, 
  Database, 
  Check, 
  Trash2, 
  FolderHeart,
  ChevronRight
} from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';

export const Profile: React.FC = () => {
  const { 
    userProfile, 
    settings, 
    savedRoadmaps, 
    achievements,
    roadmap,
    updateProfile, 
    updateSettings,
    loadSavedRoadmap,
    deleteSavedRoadmap
  } = useRoadmap();
  const navigate = useNavigate();

  // Local Form States
  const [name, setName] = useState(userProfile.name);
  const [openAiKey, setOpenAiKey] = useState(settings.openAiKey);
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(settings.supabaseAnonKey);
  const [mockMode, setMockMode] = useState(settings.mockMode);
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    
    // Update Context
    updateProfile({ name });
    updateSettings({
      openAiKey,
      supabaseUrl,
      supabaseAnonKey,
      mockMode
    });

    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };

  const unlockedAchievementsCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="w-full max-w-5xl px-6 py-10 text-slate-100 pb-24 lg:pb-12">
      {/* Header */}
      <div className="mb-10 pb-6 border-b border-slate-900">
        <h1 className="font-heading font-extrabold text-3xl text-white mb-1.5 flex items-center gap-2">
          <User className="w-8 h-8 text-neonPurple" /> Mentor Settings
        </h1>
        <p className="text-xs text-slate-500">
          Configure profile structures, API keys, and load saved roadmaps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Settings Form Column (Left/Center) */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSaveSettings} className="glass-panel p-6 rounded-2xl space-y-6">
            
            {/* Profile Detail */}
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-200 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-neonBlue" /> Candidate Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold mb-1.5">
                    User Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold mb-1.5">
                    Target Career Goal
                  </label>
                  <input
                    type="text"
                    value={roadmap ? roadmap.career : 'Select career target'}
                    className="w-full bg-slate-950/40 border border-slate-950 px-3.5 py-2.5 rounded-xl text-xs text-slate-500 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* API Configs */}
            <div className="border-t border-slate-900 pt-6">
              <h3 className="font-heading font-bold text-sm text-slate-200 mb-4 flex items-center gap-2">
                <Key className="w-4 h-4 text-neonPurple" /> AI Integration Keys
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold">
                      OpenAI API Key
                    </label>
                    <span className="text-[9px] text-slate-500 font-mono">Optional fallback simulation active</span>
                  </div>
                  <input
                    type="password"
                    placeholder="sk-..."
                    value={openAiKey}
                    onChange={(e) => setOpenAiKey(e.target.value)}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs font-mono"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-950/40 border border-slate-905 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Offline Mock Mode</span>
                    <span className="text-[10px] text-slate-500 block leading-tight">
                      Use local procedural compiler instead of live API billing calls.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMockMode(!mockMode)}
                    className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
                      mockMode ? 'bg-neonPurple' : 'bg-slate-900'
                    }`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      mockMode ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Supabase Config */}
            <div className="border-t border-slate-900 pt-6">
              <h3 className="font-heading font-bold text-sm text-slate-200 mb-4 flex items-center gap-2">
                <Database className="w-4 h-4 text-accentCyan" /> Supabase Database (Cloud Sync)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold mb-1.5">
                    Supabase URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://xyz.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold mb-1.5">
                    Anon API Key
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOi..."
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="border-t border-slate-900 pt-6 flex justify-end">
              <button
                type="submit"
                disabled={saveStatus === 'saving'}
                className="px-6 py-3 rounded-xl bg-neonPurple text-white text-xs font-heading font-bold uppercase tracking-wider hover:bg-neonPurple/90 transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? (
                  <>
                    <Check className="w-4 h-4" /> Configs Saved
                  </>
                ) : 'Save Configuration'}
              </button>
            </div>

          </form>
        </div>

        {/* Saved roadmaps & credentials list (Right Column) */}
        <div className="space-y-6">
          
          {/* Saved Roadmaps */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="font-heading font-bold text-sm text-slate-200 mb-4 flex items-center gap-1.5">
              <FolderHeart className="w-4.5 h-4.5 text-neonBlue" /> Saved Pilots
            </h3>

            {savedRoadmaps.length === 0 ? (
              <span className="text-xs text-slate-500 block py-2">No saved pilots compiled.</span>
            ) : (
              <div className="space-y-3">
                {savedRoadmaps.map((r) => (
                  <div key={r.goal} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex justify-between items-center group">
                    <div className="min-w-0 flex-1 pr-2">
                      <h4 className="text-xs font-bold text-slate-200 truncate">{r.goal}</h4>
                      <span className="text-[9px] text-slate-500 font-mono">{r.date} • {r.progress}% Complete</span>
                    </div>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { loadSavedRoadmap(r.goal); navigate('/roadmap'); }}
                        className="p-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Load active roadmap"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteSavedRoadmap(r.goal)}
                        className="p-1.5 bg-slate-900 border border-slate-800 text-red-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Delete roadmap"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Achievements Summary */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="font-heading font-bold text-sm text-slate-200 flex items-center gap-1.5">
              <Award className="w-4.5 h-4.5 text-neonPurple" /> Badges Achieved
            </h3>
            <div>
              <span className="text-3xl font-heading font-extrabold text-white block">
                {unlockedAchievementsCount} / {achievements.length}
              </span>
              <span className="text-[10px] text-slate-500">Milestone badges unlocked</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-neonPurple to-neonBlue"
                style={{ width: `${(unlockedAchievementsCount / achievements.length) * 100}%` }}
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
export default Profile;

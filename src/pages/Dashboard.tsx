import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Flame, 
  Clock, 
  Sparkles, 
  Plus, 
  AlertCircle,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';

export const Dashboard: React.FC = () => {
  const { 
    roadmap, 
    completedNodes, 
    streak, 
    studyHours, 
    achievements, 
    addStudyHours
  } = useRoadmap();
  const navigate = useNavigate();
  const [logOpen, setLogOpen] = useState(false);
  const [hoursToLog, setHoursToLog] = useState('1');

  if (!roadmap) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-slate-700 mb-4 animate-bounce" />
        <h2 className="font-heading font-bold text-xl text-white mb-2">No Active Roadmap</h2>
        <p className="max-w-md text-xs text-slate-500 mb-6">
          Generate an AI-powered career roadmap first to populate your dashboard metrics, skills trees, and study planners.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-neonPurple to-neonBlue text-slate-950 font-heading font-bold text-xs uppercase tracking-wider cursor-pointer"
        >
          Create Roadmap
        </button>
      </div>
    );
  }

  // Calculate percentages
  const completedCount = completedNodes.length;
  const totalCount = roadmap.milestones.length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 105) / 1.05 : 0; // Adjusting max bounds
  const roundedPct = Math.min(100, Math.round(completionPct));

  // Circular gauge setup
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (roundedPct / 100) * circumference;

  // Next Milestone
  const nextMilestone = roadmap.milestones.find(m => !completedNodes.includes(m.id)) || roadmap.milestones[roadmap.milestones.length - 1];

  // Log Hours Handler
  const handleLogHours = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(hoursToLog);
    if (!isNaN(h) && h > 0) {
      addStudyHours(h, nextMilestone?.id);
      setHoursToLog('1');
      setLogOpen(false);
    }
  };

  // Generate Weekly Graph heights based on history (defaulting to mock layout if none)
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const mockWeeklyHours = [1.5, 2.5, 0, 1.0, 3.5, 4.0, 0];
  const maxWeeklyHour = 5;

  // Monthly Heatmap grid days (30 blocks)
  const heatmapDays = Array.from({ length: 30 }, (_, i) => {
    // Generate some colored indices for visuals
    const isStudyDay = i % 4 === 0 || i % 7 === 1;
    const hours = isStudyDay ? (i % 3 === 0 ? 3.5 : 1.5) : 0;
    return { day: i + 1, hours };
  });

  return (
    <div className="w-full max-w-5xl px-6 py-10 text-slate-100 pb-24 lg:pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-slate-900">
        <div>
          <h1 className="font-heading font-extrabold text-3xl text-white mb-1.5">
            PathWise Dashboard
          </h1>
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            Target Goal: <span className="text-neonBlue font-mono">{roadmap.career}</span>
          </p>
        </div>
        <button
          onClick={() => setLogOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-heading font-bold text-white uppercase tracking-wider hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 text-neonBlue" /> Log Study Session
        </button>
      </div>

      {/* Grid: 4 Core Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Overall Progress Circle */}
        <div className="glass-panel p-6 rounded-2xl flex items-center gap-5 md:col-span-2 relative overflow-hidden">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-slate-900 fill-none"
                strokeWidth="10"
              />
              <motion.circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-neonBlue fill-none"
                strokeWidth="10"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-heading font-bold text-white">{roundedPct}%</span>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest">Done</span>
            </div>
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-white mb-1">Roadmap Progress</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Completed {completedCount} of {totalCount} milestone steps.
            </p>
            <button
              onClick={() => navigate('/roadmap')}
              className="text-xs text-neonBlue hover:text-neonPurple flex items-center gap-1 transition-colors font-medium"
            >
              Resume Journey <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Streak Stats */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Active Streak</span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <Flame className="w-4.5 h-4.5 text-orange-500 animate-pulse" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-heading font-bold text-white block">{streak} Days</span>
            <span className="text-[10px] text-slate-500">Study daily to keep streak glowing!</span>
          </div>
        </div>

        {/* Hours Studied */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Hours Logged</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
              <Clock className="w-4.5 h-4.5 text-sky-500" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-heading font-bold text-white block">{studyHours.toFixed(1)} hrs</span>
            <span className="text-[10px] text-slate-500">Total verified study telemetry</span>
          </div>
        </div>
      </div>

      {/* Grid: Charts & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Weekly & Monthly Charts (Left Column) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Weekly progress graph */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="font-heading font-bold text-sm text-slate-300 mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-neonBlue" /> Weekly Study Breakdown
            </h3>
            <div className="flex items-end justify-between h-44 px-4 pt-4 border-b border-slate-900">
              {weekdays.map((day, idx) => {
                const h = mockWeeklyHours[idx];
                const heightPct = (h / maxWeeklyHour) * 100;
                return (
                  <div key={day} className="flex flex-col items-center flex-1 group">
                    <span className="text-[9px] text-slate-500 font-mono mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {h}h
                    </span>
                    <div className="w-8 bg-slate-900 rounded-t-lg overflow-hidden h-32 relative">
                      <motion.div
                        className="w-full bg-gradient-to-t from-neonPurple to-neonBlue absolute bottom-0"
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPct}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 font-mono">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Heatmap Grid */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="font-heading font-bold text-sm text-slate-300 mb-4">
              Monthly Consistency Heatmap
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {heatmapDays.map((day) => {
                let colorClass = 'bg-slate-950/70 border-slate-900';
                if (day.hours > 0 && day.hours <= 2) colorClass = 'bg-neonPurple/25 border-neonPurple/20';
                if (day.hours > 2) colorClass = 'bg-neonBlue/50 border-neonBlue/40 shadow-[0_0_8px_rgba(56,189,248,0.15)]';
                return (
                  <div
                    key={day.day}
                    title={`Day ${day.day}: ${day.hours} Hours`}
                    className={`w-6 h-6 rounded border transition-all hover:scale-110 ${colorClass}`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between items-center mt-4 text-[10px] text-slate-600 font-mono">
              <span>Less Active</span>
              <div className="flex gap-1 items-center">
                <div className="w-3.5 h-3.5 rounded bg-slate-950 border border-slate-900" />
                <div className="w-3.5 h-3.5 rounded bg-neonPurple/25 border border-neonPurple/20" />
                <div className="w-3.5 h-3.5 rounded bg-neonBlue/50 border border-neonBlue/40" />
              </div>
              <span>More Active</span>
            </div>
          </div>

        </div>

        {/* Achievements list (Right Column) */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <h3 className="font-heading font-bold text-sm text-slate-300 mb-6 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-neonPurple" /> Career Achievements
          </h3>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[360px] pr-1">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-3 rounded-xl border flex items-center gap-4 transition-all duration-300 ${
                  ach.unlocked
                    ? 'bg-slate-900/60 border-slate-800/80'
                    : 'bg-slate-950/20 border-slate-950 opacity-45'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  ach.unlocked 
                    ? 'bg-gradient-to-tr from-neonPurple/20 to-neonBlue/20 border border-neonBlue/30 shadow-[0_0_10px_rgba(56,189,248,0.1)]' 
                    : 'bg-slate-900 border border-slate-800 text-slate-600'
                }`}>
                  {ach.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-xs font-bold truncate ${ach.unlocked ? 'text-white' : 'text-slate-500'}`}>
                    {ach.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 block leading-tight">
                    {ach.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Log Hours Modal Dialog */}
      {logOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm glass-panel-heavy p-6 rounded-2xl border border-slate-800"
          >
            <h3 className="font-heading font-bold text-base text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neonBlue" /> Log Learning Hours
            </h3>
            <p className="text-[11px] text-slate-400 mb-6">
              Track your manual study logs. This will increment your study hours, add level XP, and advance streaks.
            </p>
            <form onSubmit={handleLogHours} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1.5">
                  Hours Studied
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="12"
                  value={hoursToLog}
                  onChange={(e) => setHoursToLog(e.target.value)}
                  className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setLogOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-heading font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-neonPurple text-white text-xs font-heading font-bold uppercase tracking-wider hover:bg-neonPurple/90 transition-colors cursor-pointer"
                >
                  Log Session
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

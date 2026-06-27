import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
  Calendar, 
  Clock, 
  Sun, 
  Sunset, 
  Moon, 
  Sparkles, 
  CheckSquare, 
  Square,
  BookOpen,
  ListTodo
} from 'lucide-react';
import { useRoadmap } from '../context/RoadmapContext';

export const Planners: React.FC = () => {
  const { roadmap, completedNodes, addStudyHours } = useRoadmap();
  const navigate = useNavigate();
  const [activeWeek, setActiveWeek] = useState(1);
  
  // Track daily checkbox states local-style to avoid complex boilerplate
  const [dailyCompleted, setDailyCompleted] = useState<Record<string, boolean>>({
    morning: false,
    afternoon: false,
    evening: false,
    night: false
  });

  if (!roadmap) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
        <Calendar className="w-16 h-16 text-slate-700 mb-4 animate-bounce" />
        <h2 className="font-heading font-bold text-xl text-white mb-2">No Active Planner</h2>
        <p className="max-w-md text-xs text-slate-500 mb-6">
          Please create or load a career roadmap first to configure your automated weekly and daily study plans.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-neonPurple to-neonBlue text-slate-950 font-heading font-bold text-xs uppercase tracking-wider cursor-pointer"
        >
          Generate Roadmap
        </button>
      </div>
    );
  }

  // Find active milestone based on uncompleted steps
  const activeMilestone = roadmap.milestones.find(m => !completedNodes.includes(m.id)) || roadmap.milestones[0];

  // Procedural Week Builder:
  // Let's create a list of weeks based on the active milestone or entire roadmap.
  // We can simulate a 12-week layout mapping to milestones.
  const totalWeeks = 12;
  
  // Calculate mock contents for the active week based on the current milestone
  const getWeekContent = (weekNum: number) => {
    // Distribute milestones across weeks
    const milestoneIdx = Math.min(
      roadmap.milestones.length - 1, 
      Math.floor((weekNum - 1) / 2)
    );
    const milestone = roadmap.milestones[milestoneIdx];
    
    return {
      title: `Week ${weekNum}: Mastering ${milestone.skills[0] || 'Fundamentals'}`,
      skills: milestone.skills.slice(0, 3),
      hoursRequired: 15,
      topics: [
        `Theoretical core of ${milestone.skills[0] || 'this module'}`,
        `Syntactical layouts and standard design structures`,
        `API connections and schema formatting`
      ],
      practice: [
        `Resolve 3 algorithmic challenges relating to ${milestone.skills[0] || 'core concepts'}`,
        `Build local test files demonstrating methods`
      ],
      miniProject: milestone.projects[0]?.title || "Atomic Sandbox Module",
      revision: `Revise common errors: ${milestone.commonMistakes[0] || 'code formatting'}`
    };
  };

  const currentWeekData = getWeekContent(activeWeek);

  const toggleDailyTask = (taskKey: string, hours: number) => {
    const isNowDone = !dailyCompleted[taskKey];
    setDailyCompleted(prev => ({ ...prev, [taskKey]: isNowDone }));
    
    if (isNowDone) {
      addStudyHours(hours, activeMilestone.id);
    } else {
      addStudyHours(-hours, activeMilestone.id);
    }
  };

  return (
    <div className="w-full max-w-5xl px-6 py-10 text-slate-100 pb-24 lg:pb-12">
      {/* Header */}
      <div className="mb-10 pb-6 border-b border-slate-900">
        <h1 className="font-heading font-extrabold text-3xl text-white mb-1.5 flex items-center gap-2">
          <Calendar className="w-8 h-8 text-neonPurple" /> Study Planners
        </h1>
        <p className="text-xs text-slate-500">
          Syncing schedules for: <span className="text-neonBlue font-mono">{roadmap.career}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Weekly Planner Tabs & Contents */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="font-heading font-bold text-base text-white mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-neonBlue" /> Weekly syllabus Roadmap
            </h3>

            {/* Week Selector Chips */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-900 scrollbar-thin">
              {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((w) => (
                <button
                  key={w}
                  onClick={() => setActiveWeek(w)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold flex-shrink-0 cursor-pointer border transition-all ${
                    activeWeek === w
                      ? 'bg-neonBlue/10 border-neonBlue text-neonBlue shadow-[0_0_10px_rgba(56,189,248,0.15)]'
                      : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  WK {w}
                </button>
              ))}
            </div>

            {/* Selected Week Contents */}
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <h4 className="font-heading font-bold text-sm text-slate-200">
                  {currentWeekData.title}
                </h4>
                <span className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                  <Clock className="w-4 h-4" /> {currentWeekData.hoursRequired} hrs/wk
                </span>
              </div>

              {/* Grid categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-4">
                  <div>
                    <h5 className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Core Topics</h5>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {currentWeekData.topics.map((t, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-neonPurple mt-1.5 flex-shrink-0" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Mini Project</h5>
                    <div className="p-3 bg-slate-950/50 border border-slate-900 rounded-xl text-xs text-slate-300">
                      🛠️ {currentWeekData.miniProject}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h5 className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Practice Tasks</h5>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {currentWeekData.practice.map((p, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckSquare className="w-4 h-4 text-neonBlue mt-0.5 flex-shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Revision & Mistakes</h5>
                    <div className="p-3 bg-red-500/5 border border-red-500/10 text-slate-300 text-xs rounded-xl">
                      💡 {currentWeekData.revision}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Daily Planner (Morning/Noon/Night Checklist) */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-white mb-1 flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-neonPurple" /> Daily Study Routine
            </h3>
            <p className="text-[10px] text-slate-500 mb-6">
              Complete daily tasks. Check boxes to automatically log sessions to your dashboard progress.
            </p>

            {/* Routine Slots */}
            <div className="space-y-4">
              
              {/* Morning */}
              <div 
                onClick={() => toggleDailyTask('morning', 1)}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all duration-300 cursor-pointer ${
                  dailyCompleted.morning 
                    ? 'bg-emerald-500/5 border-emerald-500/30' 
                    : 'bg-slate-950/40 border-slate-900/60 hover:border-slate-800'
                }`}
              >
                <div className="mt-0.5 flex-shrink-0 text-slate-500">
                  {dailyCompleted.morning ? <CheckSquare className="w-4.5 h-4.5 text-emerald-400" /> : <Square className="w-4.5 h-4.5" />}
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] uppercase tracking-wider text-amber-500 font-mono font-bold flex items-center gap-1">
                    <Sun className="w-3 h-3" /> Morning Block (1 hr)
                  </span>
                  <p className={`text-xs mt-1 leading-normal ${dailyCompleted.morning ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                    Watch core theory videos and read documentation for: {activeMilestone.skills[0] || 'Milestone Skills'}
                  </p>
                </div>
              </div>

              {/* Afternoon */}
              <div 
                onClick={() => toggleDailyTask('afternoon', 1.5)}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all duration-300 cursor-pointer ${
                  dailyCompleted.afternoon 
                    ? 'bg-emerald-500/5 border-emerald-500/30' 
                    : 'bg-slate-950/40 border-slate-900/60 hover:border-slate-800'
                }`}
              >
                <div className="mt-0.5 flex-shrink-0 text-slate-500">
                  {dailyCompleted.afternoon ? <CheckSquare className="w-4.5 h-4.5 text-emerald-400" /> : <Square className="w-4.5 h-4.5" />}
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] uppercase tracking-wider text-neonBlue font-mono font-bold flex items-center gap-1">
                    <Sunset className="w-3 h-3" /> Afternoon Block (1.5 hrs)
                  </span>
                  <p className={`text-xs mt-1 leading-normal ${dailyCompleted.afternoon ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                    Practice syntax arrays, custom configurations, and solve challenges on coding templates.
                  </p>
                </div>
              </div>

              {/* Evening */}
              <div 
                onClick={() => toggleDailyTask('evening', 2)}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all duration-300 cursor-pointer ${
                  dailyCompleted.evening 
                    ? 'bg-emerald-500/5 border-emerald-500/30' 
                    : 'bg-slate-950/40 border-slate-900/60 hover:border-slate-800'
                }`}
              >
                <div className="mt-0.5 flex-shrink-0 text-slate-500">
                  {dailyCompleted.evening ? <CheckSquare className="w-4.5 h-4.5 text-emerald-400" /> : <Square className="w-4.5 h-4.5" />}
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] uppercase tracking-wider text-neonPurple font-mono font-bold flex items-center gap-1">
                    <Moon className="w-3 h-3" /> Evening Block (2 hrs)
                  </span>
                  <p className={`text-xs mt-1 leading-normal ${dailyCompleted.evening ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                    Build out code components for your active portfolio project: {activeMilestone.projects[0]?.title || 'Milestone project'}
                  </p>
                </div>
              </div>

              {/* Night */}
              <div 
                onClick={() => toggleDailyTask('night', 0.5)}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all duration-300 cursor-pointer ${
                  dailyCompleted.night 
                    ? 'bg-emerald-500/5 border-emerald-500/30' 
                    : 'bg-slate-950/40 border-slate-900/60 hover:border-slate-800'
                }`}
              >
                <div className="mt-0.5 flex-shrink-0 text-slate-500">
                  {dailyCompleted.night ? <CheckSquare className="w-4.5 h-4.5 text-emerald-400" /> : <Square className="w-4.5 h-4.5" />}
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Night Revision (0.5 hr)
                  </span>
                  <p className={`text-xs mt-1 leading-normal ${dailyCompleted.night ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                    Update your learning journal, document errors encountered, and commit your scripts to GitHub.
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-900 text-center">
            <span className="text-[10px] text-slate-500 block">
              Completing all routine tasks logs **5.0 Hours** today.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Planners;
